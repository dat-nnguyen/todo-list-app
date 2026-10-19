# Phân tích kiến trúc — Todo List App

> Tài liệu này được tạo bằng cách scan toàn bộ source, chạy server thật, gọi API thật,
> và `EXPLAIN (ANALYZE, BUFFERS)` trực tiếp trên PostgreSQL 16 (`todo-db`).
> Mọi kết luận có đánh dấu **[đã kiểm chứng]** là đã chạy thực tế, không phải suy đoán.

---

## 0. Trạng thái codebase (đọc trước)

| Thành phần | Trạng thái thực tế |
|---|---|
| `backend/src/modules/auth/*` | Hoàn chỉnh 5 tầng (route → controller → service → repository + schema) |
| `backend/src/modules/todos/*` | **5 file rỗng 0 byte** — chưa viết dòng nào |
| `backend/src/middleware/*` | Đủ 3 file: `validate`, `requireAuth`, `errorHandler` |
| `backend/migrations/` | 1 migration tạo cả 3 bảng `users`, `todos`, `session` |
| `front-end/src` | Vẫn là template Vite mặc định (`App.jsx` = trang "Get started") |
| `backend/tests/{unit,integration}` | Thư mục rỗng, không có `jest.config`, chưa có test nào |
| `express-rate-limit` | Đã cài trong `package.json` nhưng **chưa được wire** vào đâu |
| `axios`, `@tanstack/react-query` | Đã cài nhưng **chưa import** ở bất kỳ file frontend nào |
| `compose.yaml` | README nhắc tới nhưng **không tồn tại**; Postgres chạy bằng container `todo-db` |

Tổng backend: **527 dòng JS**. Đây là project đang ở giai đoạn *"auth xong, todos chưa làm"*.

Điểm đáng chú ý: thư mục `scratch/` chứa 5 script học tập có chủ đích
(`why-layers.mjs`, `why-requireauth.mjs`, `why-errorhandler.mjs`, `queue-demo.mjs`, `trace-server.mjs`).
Đây là bằng chứng mạnh rằng kiến trúc 5 tầng không phải copy-paste, mà được **chọn có lý do và có
phản chứng** (mỗi script mô phỏng "nếu KHÔNG làm thế thì hỏng ra sao").

---

## 1. Công nghệ & lý do chọn

### 1.1 Backend

| Công nghệ | Version | Vì sao dùng | Trade-off phải trả |
|---|---|---|---|
| **Express** | 5.3 | Middleware chain là mô hình tuần tự đúng với luồng HTTP (parse → auth → validate → handler). Hệ sinh thái lớn nhất. Express 5 tự forward lỗi từ `async` handler sang error middleware **[đã kiểm chứng]** nên không cần `express-async-errors`. | Không có DI container, không có structure sẵn → phải tự đặt convention (project dùng module folder). |
| **pg (raw SQL)** | 8.23 | Kiểm soát 100% SQL để tối ưu index và cursor pagination — thứ mà ORM che mất. Không có "magic" N+1. | Mất type safety, phải tự map `snake_case → camelCase`, tự viết câu `UPDATE` set `updated_at`. |
| **node-pg-migrate** | 9.0 | Migration là file JS, có `up`/`down` thật (reversible), chạy chung `DATABASE_URL`. So với Prisma/Drizzle: không cần generate client, không lock vào DSL riêng. | Phải tự viết DDL, dễ sai option (xem lỗi index ở §3.3). |
| **zod** | 4.6 | Schema là *single source of truth* cho cả validate + transform: `trim()`, `toLowerCase()`, `coerce` (query string → number) **[đã kiểm chứng]**, và **strip unknown keys** (chống mass-assignment như `is_admin: true`) **[đã kiểm chứng]**. | Lỗi Zod phải map tay sang response shape (đã làm trong `validate.js`). |
| **express-session + connect-pg-simple** | 1.19 / 10.0 | Session **server-side** → logout là **revoke thật** (xoá row), không như JWT phải chờ hết hạn hoặc nuôi blacklist. Lưu trong Postgres nên restart app không mất session, và không phải dựng thêm Redis khi scale nhỏ. | **1 query DB mỗi request** để load session + **1 write mỗi request** khi `rolling: true`. Muốn scale ngang nhiều instance phải dùng chung DB (đang đúng) hoặc sticky session. |
| **bcrypt** | 6.0 | Cost 10 ≈ **92ms/hash** đo thực tế → brute-force đắt gấp ~10⁵ lần so với SHA256. Có salt tự động, chống rainbow table. | **Giới hạn 72 bytes** — phần sau byte 72 bị bỏ **[đã kiểm chứng]**. Không được đặt `max` cho password. |
| **helmet** | 8.3 | Set 11 security header trong 1 dòng (CSP, HSTS, X-Frame-Options…) **[đã kiểm chứng]** — chống XSS/clickjacking/MIME-sniffing. | CSP mặc định `script-src 'self'` có thể chặn CDN — với API-only thì không ảnh hưởng. |
| **cors** | 2.8 | Bắt buộc vì FE (5173) khác origin BE (3000). `credentials: true` để browser gửi cookie session. | Phải khai báo origin **chính xác**, không được `*` khi dùng credentials. |
| **dotenv** | 18 | Load `.env` ở `config/index.js` — nơi duy nhất đọc `process.env`. | Node 24 đã có `--env-file`, nên hơi dư thừa (xem §5, mục P2). |
| **Jest + supertest** | 30 / 7 | supertest bắn HTTP thật vào `app` mà **không cần `listen()`** → integration test nhanh, không đụng port. Script đã có `--experimental-vm-modules` cho ESM. | Chưa có test nào được viết. |

### 1.2 Frontend

| Công nghệ | Vì sao |
|---|---|
| **Vite** | Dev server ESM-native, HMR tính bằng ms; build dùng Rollup. Không cần config cho React. |
| **React 19** | Concurrent rendering, `useOptimistic` / form actions — rất khớp với todo list (toggle checkbox lạc quan). |
| **TanStack Query** | Quản lý **server state** (cache, retry, refetch on focus, invalidate sau mutation). Với todo app, đây chính là thứ thay thế Redux: sau `POST /todos` chỉ cần `invalidateQueries(['todos'])`, không phải tự đồng bộ store. |
| **axios** | Interceptor để bắt 401 toàn cục → redirect login; `withCredentials: true` cho session cookie. |
| **oxlint** | Linter viết bằng Rust, nhanh hơn ESLint ~10–50x; đủ cho project nhỏ. |

> **Lưu ý:** cả `axios` và `react-query` hiện **chưa được dùng** — frontend vẫn là template.

---

## 2. Kiến trúc & lý do thiết kế

### 2.1 Luồng phân tầng

```
HTTP request
   │
   ├─ helmet            (security headers)
   ├─ express.json      (parse body, limit 100kb)
   ├─ cors              (origin + credentials)
   ├─ express-session   (load session từ Postgres → req.session)
   │
   ├─ Router  /api/v1/auth
   │    ├─ validateBody(schema)   ← zod, 400 nếu sai
   │    ├─ requireAuth            ← 401 nếu chưa login
   │    └─ controller             ← adapter HTTP (req/res ↔ service)
   │         └─ service           ← business rule, ném lỗi có statusCode/code
   │              └─ repository   ← CHỈ SQL, trả row thô
   │                   └─ db/query → pg Pool
   │
   └─ errorHandler      (bắt mọi next(err), format JSON thống nhất)
```

**Vì sao 5 tầng?** Mỗi tầng có **một lý do để thay đổi** duy nhất (SRP):

| Nếu cần đổi… | Chỉ sửa |
|---|---|
| Rule password ≥ 8 ký tự | `auth.schema.js` |
| Đổi Postgres → MongoDB | `auth.repository.js` |
| Đổi 409 → 422 | `auth.service.js` |
| Đổi session → JWT | `auth.controller.js` |
| Thêm CLI/worker không qua HTTP | viết mới, **tái dùng `auth.service.js`** |
| Unit test business logic | mock repository, test service thuần |

`scratch/why-layers.mjs` mô phỏng đúng phép so sánh này: kiến trúc 1 tầng thì 6 loại thay đổi
đều dồn vào **cùng 1 hàm** → 6 lần có thể làm hỏng nhau.

### 2.2 Vì sao `validate.js` có 3 hàm gần giống nhau?

Đây là điểm tinh tế nhất của codebase, và nó **không phải copy-paste tuỳ tiện**:

```js
export function validateBody(schema)   { req.body   = schema.parse(req.body);   }  // OK
export function validateQuery(schema)  { req.validatedQuery = schema.parse(req.query); }  // PHẢI tách
export function validateParams(schema) { req.params = schema.parse(req.params); }  // OK
```

Lý do: trong Express 5, `req.query` là **getter chỉ đọc** (định nghĩa bằng `defineGetter` trong
`express/lib/request.js:230`). Gán `req.query = ...` sẽ ném
`TypeError: Cannot set property query of #<IncomingMessage> which has only a getter` **[đã kiểm chứng]**.
Trong khi `req.body` và `req.params` là property thường, gán đè được **[đã kiểm chứng]**.

→ Quyết định đúng: **không mutate `req.query`**, thay vào đó tạo `req.validatedQuery`.

**Cái giá:** giờ có 2 nguồn dữ liệu query (`req.query` thô và `req.validatedQuery` đã chuẩn hoá).
Controller phải nhớ dùng cái nào. Cách nhất quán hơn: cho cả 3 hàm ghi vào `req.valid = { body, query, params }`.

### 2.3 Vì sao `errorHandler` che message khi 5xx?

```js
message: statusCode >= 500 ? 'Internal server error' : err.message
```

- Lỗi 4xx là lỗi **của client** → nói thật để client sửa (`"Email already exists"`).
- Lỗi 5xx là lỗi **của server** → message có thể chứa tên bảng, câu SQL, connection string.
  `scratch/why-errorhandler.mjs` chứng minh: không có handler thì Express trả **HTML stack trace** kèm
  `password=postgres123`.

**Nhưng còn lỗ hổng:** `code: err.code || 'INTERNAL_ERROR'` — driver `pg` cũng dùng field `err.code`
cho SQLSTATE. Khi race-condition register, client nhận được `{"code":"23505"}` **[đã kiểm chứng]**
→ lộ rằng đây là vi phạm unique constraint (dù message đã bị che). Cần map SQLSTATE → domain code.

### 2.4 `requireAuth` — vì sao chỉ check session mà không query DB?

```js
if (!req.session || !req.session.userId) return res.status(401)...
```

- Không hit DB → **0 chi phí** cho mọi request đã login.
- Trade-off: user bị xoá khỏi DB nhưng session còn hạn vẫn đi qua được `requireAuth`
  (chỉ tới `getMe` mới phát hiện qua `findById` trả `null`).
- Với app nhỏ đây là lựa chọn hợp lý. Nếu cần chặt: cache user trong session, hoặc
  `ON DELETE CASCADE` + xoá session theo `userId` (bảng session hiện **không có cột `userId`**
  để query — chỉ có JSON blob, nên không xoá session theo user được).

### 2.5 Vì sao `register` lại gọi `findByEmailWithPassword`?

```js
const existingUser = await findByEmailWithPassword(email);  // kéo cả password_hash
```

Chỉ cần biết "email tồn tại hay chưa" nhưng lại `SELECT password_hash` → thừa dữ liệu nhạy cảm
đi qua tầng service không cần thiết. Nên có `existsByEmail()` với `SELECT 1 ... LIMIT 1`
(index unique đã cover, chỉ đọc 1 index entry).

### 2.6 Vì sao `login` gọi `session.regenerate()` trước khi gán `userId`?

```js
req.session.regenerate((err) => {
  req.session.userId = user.id;
  res.status(200).json(...);
});
```

Đây là **chống session fixation** đúng chuẩn: kẻ tấn công không thể "cài" một `connect.sid` biết trước
rồi dụ nạn nhân login để chiếm session đó — vì sid bị **huỷ và sinh mới** ngay tại thời điểm
đăng nhập thành công. `express-session` sau đó tự `save()` ở `res.end` (vì session bị modified)
**[đã kiểm chứng: row mới xuất hiện trong bảng `session` + `Set-Cookie` mới]**.

### 2.7 Vì sao service `delete user.password_hash`?

```js
delete user.password_hash;
```

Repository trả row thô có hash (vì dùng chung hàm cho login). Nếu chỉ trông vào controller
`toUserResponse()` để lọc, thì bất kỳ consumer nào khác (CLI, worker, test) gọi service đều
nhận hash. Xoá ngay tại **biên của service** = defense in depth. Commit `8fa7529`
("drop duplicated user mapping and strip password hash") ghi lại đúng quyết định này.

---

## 3. Database

### 3.1 Sơ đồ

```
users                          todos                          session
─────────────────────          ──────────────────────         ────────────────────
id           uuid PK           id           uuid PK           sid     varchar(255) PK
first_name   varchar(255) NN   user_id      uuid NN FK ──┐      sess    json NN
last_name    varchar(255) NN   title        varchar(255)NN│      expire  timestamp(6) NN
email        varchar(255) NN   description  text NULL    │
password_hash varchar(255) NN  completed    boolean NN   │
created_at   timestamp NN      created_at   timestamp NN │
updated_at   timestamp NN      updated_at   timestamp NN │
                                                          │
INDEX:                            INDEX:                  │
users_email_unique_index          todos_pkey (id)         │
  UNIQUE btree(email)             todos_user_id_created_at_id_index
                                    btree(user_id, created_at, id)
                                 FK → users(id) ON DELETE CASCADE
```

### 3.2 Từng quyết định & lý do

| Quyết định | Lý do | Ghi chú |
|---|---|---|
| `uuid` + `gen_random_uuid()` làm PK | Không đoán được id tuần tự (chống IDOR/enumeration); an toàn khi merge dữ liệu, replicate, import. | UUIDv4 random → insert phân tán khắp B-tree gây page split. Với bảng `todos` insert-heavy nên cân nhắc **UUIDv7** (time-ordered). `gen_random_uuid()` cần PG ≥ 13 — đang dùng `postgres:16` ✔ |
| `varchar(255)` cho `email`, `password_hash` | bcrypt hash = 60 ký tự, 255 dư an toàn cho argon2 sau này. | `text` sẽ linh hoạt hơn nhưng 255 cho email là hợp lý (RFC max 254). |
| `email` UNIQUE index | Vừa là **business rule** (1 email 1 tài khoản) vừa là **index tra cứu login**. | Một index phục vụ 2 mục đích — quyết định tốt. |
| `ON DELETE CASCADE` cho `todos.user_id` | Xoá user → xoá sạch todo, không để orphan. | Postgres **không** tự tạo index cho FK → nếu không có index trên `user_id`, mỗi lần xoá user sẽ **full scan `todos`**. Index composite bên dưới cover luôn việc này. |
| `description text NULL` | Nội dung dài không giới hạn; `NULL` phân biệt "không có mô tả" vs "mô tả rỗng". | `text` không có overhead so với `varchar(n)` trong Postgres. |
| `completed boolean NN DEFAULT false` | Tránh 3 trạng thái (`true`/`false`/`NULL`) — bug kinh điển. | |
| `session.sess` kiểu `json` | Chỉ đọc/ghi nguyên khối, không query bên trong → `json` rẻ hơn `jsonb` khi ghi (không parse lại). | Khớp đúng `table.sql` của `connect-pg-simple` **[đã kiểm chứng]** → thư viện chạy không cần config gì thêm. |
| `session.expire` + index riêng | `connect-pg-simple` tự dọn session hết hạn mỗi **900s** (`DEFAULT_PRUNE_INTERVAL_IN_SECONDS = 60*15`) bằng `DELETE ... WHERE expire < to_timestamp($1)`. Index trên `expire` là **bắt buộc** để DELETE không full scan. | `sid` là PK nên lookup `WHERE sid=$1 AND expire >= ...` dùng PK index — không cần index thêm. |

### 3.3 Index `(user_id, created_at, id)` — thiết kế đúng, nhưng code sai

**Ý đồ thiết kế (đúng):**

1. `user_id` đứng đầu → mọi query list đều có `WHERE user_id = $1`, nên index được dùng
   (leftmost prefix). Đồng thời **thay thế** index riêng trên FK → không có index thừa.
2. Thêm `created_at` → phục vụ `ORDER BY created_at DESC` không cần sort.
3. Thêm `id` làm **tie-breaker** → vì `created_at` không unique (2 todo tạo cùng microsecond là có),
   cursor `(created_at, id)` cần `id` để không bị **mất row hoặc lặp row** ở ranh giới trang.

Đây chính là index chuẩn cho **keyset (cursor) pagination**, khớp với README ("cursor pagination").

**Nhưng migration viết sai option:**

```js
pgm.createIndex('todos', ['user_id', 'created_at', 'id'], {
  order: { created_at: 'DESC', id: 'DESC' }   // ❌ node-pg-migrate KHÔNG có option `order`
});
```

`CreateIndexOptions` của node-pg-migrate 9 chỉ có: `name, unique, where, concurrently, method, include, nulls`
— **không có `order`**. Option lạ bị bỏ qua im lặng. Index thực tế trong DB:

```
CREATE INDEX todos_user_id_created_at_id_index ON public.todos
  USING btree (user_id, created_at, id)     ← ASC cả 3 cột, không có DESC
```
**[đã kiểm chứng bằng `pg_indexes`]**

**Hệ quả thực tế: KHÔNG sai chức năng.** B-tree đọc ngược được, nên
`ORDER BY created_at DESC, id DESC` vẫn dùng index dưới dạng `Index Scan Backward`
**[đã kiểm chứng qua EXPLAIN]**. Nhưng:

- Index không đúng như tài liệu/ý đồ → người sau đọc migration sẽ hiểu sai.
- Nếu sau này có query **trộn chiều** (vd `ORDER BY created_at DESC, id ASC`) thì **không dùng được**
  index này nữa (phải sort in-memory).
- Cách viết đúng:
  ```js
  pgm.createIndex('todos', [
    { name: 'user_id' },
    { name: 'created_at', sort: 'DESC' },
    { name: 'id', sort: 'DESC' },
  ]);
  ```

### 3.4 Benchmark: cursor vs OFFSET (chạy thật, 20.000 rows)

Tạo 20.000 todo cho 1 user, `ANALYZE`, rồi so sánh trang sâu (bỏ qua 15.000 row):

| Cách | Thời gian | Buffers đọc | Plan |
|---|---|---|---|
| **Keyset** `WHERE (created_at,id) < ($1,$2)` | **0.053 ms** | **4** | `Index Scan Backward` + `Limit` |
| **OFFSET** `LIMIT 20 OFFSET 15000` | **5.090 ms** | **554** | `Index Scan Backward`, đọc **15.020 rows** rồi mới bỏ |

→ **Nhanh hơn ~96x, ít hơn ~138x I/O**, và khoảng cách này **tăng tuyến tính** theo độ sâu trang
(OFFSET phải *quét rồi vứt* N row; keyset nhảy thẳng vào vị trí). Đây là lý do kỹ thuật
đằng sau lựa chọn cursor pagination của project.

### 3.5 Vấn đề schema cần sửa

| # | Vấn đề | Ảnh hưởng | Fix |
|---|---|---|---|
| 1 | **`timestamp` không có timezone** cho `created_at/updated_at` | `now()` trả giờ **local của server DB** (giờ VN), driver `pg` lại gắn nhãn `Z` → API trả `createdAt` **lệch 7 giờ** so với thực tế **[đã kiểm chứng: `now()::timestamp` → `19:29Z` trong khi `now()` thật là `02:29Z`]**. Bug này sẽ lộ ngay khi FE format giờ. | Đổi sang `timestamptz` (migration mới). |
| 2 | `updated_at DEFAULT now()` nhưng **không có trigger** | Mọi `UPDATE` phải tự set `updated_at = now()`. Quên 1 câu SQL là sai âm thầm. | Thêm trigger `BEFORE UPDATE`, hoặc luôn set trong repository. |
| 3 | Không có `CHECK (title <> '')` | Dữ liệu rác nếu có đường ghi khác (script, psql). | Thêm check constraint. |
| 4 | Không có index cho filter `completed` | Nếu UI có tab "chưa xong", query `WHERE user_id=$1 AND completed=false` vẫn dùng index trên nhưng phải **filter sau khi scan**. | Partial index `(user_id, created_at DESC) WHERE completed = false`. |
| 5 | `session` không lưu `userId` ra cột riêng | Không thể "xoá mọi session của user X" khi đổi mật khẩu / ban tài khoản — chỉ có JSON blob. | Thêm cột `user_id` (hoặc `DELETE ... WHERE sess->>'userId' = $1` chấp nhận full scan, không nên). |

---

## 4. Luồng chạy thực tế của request

### 4.1 Thứ tự middleware trong `app.js` — và vì sao

```js
app.use(helmet());          // 1
app.use(express.json());    // 2
app.use(cors({...}));       // 3
app.use(session({...}));    // 4
app.use('/api/v1/auth', authRoutes);   // 5
app.use(errorHandler);      // 6  ← phải cuối, phải có 4 tham số
```

| Thứ tự | Lý do |
|---|---|
| helmet trước tiên | Header bảo mật phải có trên **mọi** response, kể cả response lỗi. |
| json trước session | Không cần body để load session, nhưng đặt sớm để **fail fast** (400/413) trước khi tốn 1 query DB. |
| cors trước session | Preflight `OPTIONS` phải trả 204 **mà không tạo session row** cho bot. |
| session trước routes | `req.session` phải tồn tại trước `requireAuth`. |
| errorHandler cuối | Express nhận diện error middleware bằng **đúng 4 tham số**; đặt cuối để bắt lỗi từ mọi tầng trên. |

⚠️ **Nhưng thứ tự 2→3 đang sai:** `cors` đứng **sau** `express.json()`. Khi body JSON hỏng,
`express.json` ném lỗi **trước khi** cors kịp chạy → response 400 **không có header CORS**
**[đã kiểm chứng: `POST /login` với `{bad` và `Origin: http://localhost:5173` → không có
`Access-Control-Allow-Origin`]**. Browser sẽ báo *"CORS error"* thay vì hiển thị lỗi 400 thật
→ cực kỳ khó debug ở FE. **Fix: đưa `cors` lên trước `express.json()`.**

### 4.2 Trace `POST /api/v1/auth/login` (happy path, đã chạy thật)

```
1. TCP → Node http.Server
2. helmet            → set CSP, HSTS, X-Frame-Options…            [11 headers]
3. express.json      → parse body; >100kb ⇒ 413 ngay
4. cors              → Access-Control-Allow-Origin: http://localhost:5173
                       Access-Control-Allow-Credentials: true
5. session           → đọc cookie connect.sid
                       ├ không có cookie ⇒ req.session = {} (KHÔNG tạo row, vì saveUninitialized:false)
                       └ có cookie ⇒ SELECT sess FROM session
                                     WHERE sid = $1 AND expire >= to_timestamp($2)
6. Router match POST /login
7. validateBody(loginSchema)
     → zod: trim() → toLowerCase() → .email() → .min(1)
     → sai ⇒ 400 { error: { code:'VALIDATION_ERROR', details:[{field,message}] } }  ⛔ DỪNG
8. controller.login  → authService.login(email, password)
9. service           → repo.findByEmailWithPassword
                       SELECT ... FROM users WHERE email = $1
                       → dùng users_email_unique_index (Index Scan, 1 row)
10. bcrypt.compare   → ~92 ms (cost 10) — chạy trên libuv threadpool, KHÔNG block event loop
                       sai ⇒ 401 INVALID_CREDENTIALS  ⛔ DỪNG
11. service          → delete user.password_hash   (defense in depth)
12. controller       → session.regenerate()  ← huỷ sid cũ, sinh sid mới (chống session fixation)
                     → req.session.userId = user.id
13. res.json(200)    → express-session hook res.end:
                       shouldSave? vì session modified ⇒ store.set()
                       INSERT INTO session (sess, expire, sid) VALUES ($1, to_timestamp($2), $3)
                         ON CONFLICT (sid) DO UPDATE SET sess=$1, expire=to_timestamp($2)
                     → Set-Cookie: connect.sid=s%3A...; Path=/; Expires=+24h;
                                   HttpOnly; SameSite=Lax
```

**[đã kiểm chứng end-to-end]** — cookie nhận được, row trong `session` có `expire` = +24h,
`GET /me` với cookie đó trả đúng user.

### 4.3 Các nhánh còn lại (đều đã chạy thật)

**`GET /api/v1/auth/me` (đã login)**
```
session → load row (1 SELECT) → requireAuth (chỉ check req.session.userId, 0 query)
→ controller.me → service.getMe → repo.findById
  SELECT id, first_name, ... (KHÔNG select password_hash → least privilege)
→ 200 { user: { id, firstName, lastName, email, createdAt, updatedAt } }
```
Lưu ý: `rolling: true` ⇒ mỗi request này còn phát sinh **1 UPDATE** `session SET expire`
(qua `store.touch`) **[đã kiểm chứng trong source `express-session/index.js:487`]**.
Đây là chi phí thật của rolling session: **1 write/request**.

**Chưa login (401)**
```
requireAuth → res.status(401).json(...) → KHÔNG gọi next()
⇒ chain dừng tại đây, controller/service/repository không bao giờ chạy.
```
**[đã kiểm chứng]** `GET /me` không cookie → `{"code":"UNAUTHORIZED"}`.

**`POST /api/v1/auth/logout`**
```
requireAuth → controller.logout → req.session.destroy()
  ⇒ store.destroy → DELETE FROM session WHERE sid = $1     (revoke thật, không phải chờ hết hạn)
→ res.clearCookie('connect.sid') → Set-Cookie: connect.sid=; Expires=Thu, 01 Jan 1970
→ 204 No Content
```
**[đã kiểm chứng]** — sau đó `GET /me` với cookie cũ → 401.

**Lỗi validation (400)**
```
validateBody → ZodError → map error.issues → [{field:'email', message:'Invalid email'}, ...]
→ 400, KHÔNG đi qua errorHandler (validate tự trả response)
```
**[đã kiểm chứng]** body rỗng trả đủ 4 field lỗi cùng lúc (zod gom hết, không dừng ở lỗi đầu).

**Lỗi không mong đợi (500)**
```
service throw Error (không có statusCode) → controller catch → next(err)
→ errorHandler: statusCode = 500, console.error(stack), message = 'Internal server error'
```
**[đã kiểm chứng]** — nhưng `code` vẫn lộ SQLSTATE `23505` (xem §2.3).

**Body JSON hỏng (400)**
```
express.json ném entity.parse.failed (status/statusCode = 400)
→ nhảy THẲNG tới errorHandler, BỎ QUA toàn bộ routes
→ 400 nhưng KHÔNG có CORS header  (vì cors đứng sau express.json)
```
**[đã kiểm chứng]**

**Route không tồn tại**
```
Không middleware nào match → Express default 404 handler
→ trả HTML "<!DOCTYPE html>...Cannot GET /api/v1/nope"   ❌ không phải JSON
```
**[đã kiểm chứng]** → FE gọi `response.json()` sẽ crash. Cần thêm `notFound` handler JSON.

### 4.4 Trace `POST /todos` — luồng *được thiết kế* (chưa implement)

Module `todos` rỗng, nhưng mọi mảnh ghép đã sẵn sàng và `scratch/trace-server.mjs` đã mô phỏng
đúng chain này:

```
POST /api/v1/todos
  helmet → json → cors → session
  → requireAuth                    (401 nếu chưa login)
  → validateBody(createTodoSchema) (400 nếu title rỗng/sai kiểu; trim() title)
  → controller.create
      → service.create({ userId: req.session.userId, ...req.body })
          → repo.insert → INSERT INTO todos (user_id,title,...) VALUES (...) RETURNING *
  → 201 { todo: {...} }
```

Và `GET /api/v1/todos?limit=20&cursor=...`:
```
  requireAuth → validateQuery(querySchema)  ← coerce limit '5' → 5, default 20
  → repo.findPageByUser
      WHERE user_id = $1 AND (created_at, id) < ($2, $3)
      ORDER BY created_at DESC, id DESC
      LIMIT $4                                  ← limit + 1 để biết còn trang sau
  → cắt bớt 1 row → nextCursor = base64(lastRow)
```
`scratch/trace.log` cho thấy đúng hành vi mong đợi: `limit` là **string** trước validate và
**number** sau validate; `limit=abc` bị chặn ở bước `[4]`; PATCH id sai bị chặn **trước** khi
kiểm body (thứ tự middleware quyết định thứ tự lỗi trả về).

---

## 5. Danh sách vấn đề, xếp theo mức ưu tiên

### P0 — sửa trước khi viết tiếp todos

| # | Vấn đề | Bằng chứng | Fix |
|---|---|---|---|
| 1 | **CORS sau `express.json`** → lỗi parse body không có CORS header, FE chỉ thấy "CORS error" | [đã kiểm chứng] | `app.use(cors(...))` **trước** `express.json()` |
| 2 | **Race condition khi register** → 500 thay vì 409 | [đã kiểm chứng: 6 request song song cùng email → 1×201 + 5×500 `23505`] | Bắt `err.code === '23505'` trong service → ném 409 `EMAIL_ALREADY_EXISTS` (giữ check-then-insert làm fast path) |
| 3 | **`errorHandler` lộ SQLSTATE** qua `err.code` | [đã kiểm chứng: `{"code":"23505"}`] | Whitelist domain code; mọi code lạ → `INTERNAL_ERROR` |
| 4 | **Không có 404 JSON handler** | [đã kiểm chứng: trả HTML] | Thêm `app.use((req,res) => res.status(404).json(...))` trước `errorHandler` |
| 5 | **`timestamp` không timezone** → lệch 7 giờ | [đã kiểm chứng] | Migration đổi sang `timestamptz` |
| 6 | **`db.connect()` leak 1 connection** | [đã kiểm chứng: `pool.totalCount=1, idleCount=0` sau `connect()`] | `const c = await pool.connect(); c.release();` — hiện chỉ gọi 1 lần lúc boot nên chưa nổ, nhưng nếu health check gọi lại 10 lần → **cạn pool** |
| 7 | **`SESSION_SECRET` fallback `'dev-secret'`** | đọc code | Fail-fast nếu `NODE_ENV=production` mà thiếu env |

### P1 — nên sửa khi làm todos

| # | Vấn đề | Fix |
|---|---|---|
| 8 | `validate.js` lặp logic 3 lần (~20 dòng/lần) | Extract `handleZod(schema, pick, apply, message)` |
| 9 | `req.validatedQuery` không nhất quán với `req.body`/`req.params` | Thống nhất `req.valid = { body, query, params }` |
| 10 | **Email enumeration qua timing**: email không tồn tại → return ngay; email tồn tại → chạy bcrypt ~92ms | Luôn `bcrypt.compare(password, user?.password_hash ?? DUMMY_HASH)` |
| 11 | Chưa wire `express-rate-limit` cho `/login`, `/register` | 5 req/phút/IP cho auth routes |
| 12 | **bcrypt cắt ở 72 bytes** → 2 password khác nhau cùng 72-byte prefix đều login được [đã kiểm chứng] | `z.string().max(72)` (hoặc pre-hash SHA-256 nếu muốn cho phép dài hơn) |
| 13 | `createIndex({ order })` không có tác dụng | Dùng `{ name, sort }` per-column (§3.3) |
| 14 | `todos` module rỗng, chưa mount router | Implement + `app.use('/api/v1/todos', todosRoutes)` |
| 15 | `updated_at` không tự cập nhật | Trigger `BEFORE UPDATE` |
| 16 | Chưa set `app.set('trust proxy', 1)` | Nếu deploy sau nginx: `req.ip` sai (rate-limit vô dụng) và `cookie.secure` không bao giờ được set |
| 17 | `server.js` đọc `process.env.PORT` thay vì `config.port` | Dùng `config.port` (một nguồn sự thật) |
| 18 | `clearCookie('connect.sid')` không truyền `sameSite`/`secure` | Truyền cùng options với lúc set |
| 19 | Không có test, không có `jest.config` | Thêm `jest.config.js` + integration test cho auth |

### P2 — cải thiện về sau

- `varchar(255)` cho `password_hash`: nếu chuyển argon2 (~100 ký tự) vẫn ok, nhưng `text` linh hoạt hơn.
- Không có soft-delete (`deleted_at`) cho todos → xoá là mất vĩnh viễn.
- Response envelope chưa thống nhất: `{ user }`, `{ error }`, và tương lai `{ todos, nextCursor }`.
  Nên chốt format: `{ data, meta }` / `{ error }`.
- `dotenv` + Node 24 `--env-file` dư thừa; `db:create`/`db:up` script đã dùng `--env-file` còn
  app dùng `dotenv.config()` → 2 cơ chế load env khác nhau trong cùng project.
- README mô tả cấu trúc không tồn tại (`compose.yaml`, `front-end/src/api`, `features/`, `pages/`).
- `scratch/` được gitignore nhưng vẫn nằm trong working tree — nên tách thành `docs/` nếu muốn giữ
  làm tài liệu giảng giải, vì nội dung rất có giá trị.

---

## 6. Tóm tắt một đoạn

Đây là backend Express 5 + PostgreSQL thuần (không ORM), tổ chức **5 tầng theo module**
(`route → validate/auth → controller → service → repository`), dùng **session server-side trong
Postgres** (revoke được ngay, không cần JWT blacklist), **zod** làm schema validate + transform
(strip unknown key, coerce query), **bcrypt cost 10** (~92ms), và **migration SQL-first** với
`node-pg-migrate`. Database được thiết kế cho **cursor pagination**: index composite
`(user_id, created_at, id)` — đúng về ý đồ (đo thực tế nhanh hơn OFFSET ~96x ở trang sâu),
nhưng migration truyền option `order` mà thư viện không hỗ trợ nên index thực tế là ASC
(vẫn dùng được nhờ `Index Scan Backward`). Phần auth đã hoàn chỉnh và chạy đúng end-to-end
(register → login → me → logout, đã trace từng bước); phần **todos còn trống hoàn toàn**.
Ba lỗi cần sửa ngay: **CORS đặt sau `express.json`** (che mất lỗi 400 khỏi browser),
**race register trả 500**, và **`timestamp` thiếu timezone gây lệch 7 giờ**.
