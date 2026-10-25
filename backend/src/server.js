import app from './app.js';
import { connect } from './db/index.js'
import { closeCache } from './utils/cache.js'
const PORT = process.env.PORT || 3000;

async function start() {
  await connect();

  const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  })

  for (const signal of ['SIGINT', 'SIGTERM']) {
    process.on(signal, () => {
      server.close(() => {
        closeCache()
        process.exit(0)
      })
    })
  }
}

start();
