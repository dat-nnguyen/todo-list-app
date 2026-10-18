
/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const up = (pgm) => {
    pgm.createTable('users', {
        first_name: {
            type: 'varchar(255)',
            notNull: true, 
        },
        last_name: {
            type: 'varchar(255)',
            notNull: true, 
        },
        id: {
            type: 'uuid',
            primaryKey: true,
            default: pgm.func('gen_random_uuid()'),
        }, 
        email: {
            type: 'varchar(255)',
            notNull:true, 
        },
        password_hash: {
            type: 'varchar(255)',
            notNull: true,
        },
        created_at: {
            type: 'timestamp', 
            notNull: true,
            default: pgm.func('now()'),
        },
        updated_at: {
            type: 'timestamp',
            notNull: true,
            default: pgm.func('now()'),
        },
    });

    pgm.createIndex('users', 'email', { unique: true });

    pgm.createTable('todos',{
        id: {
            type: 'uuid',
            primaryKey: true,
            default: pgm.func('gen_random_uuid()'),
        },
        user_id: {
            type: 'uuid',
            notNull: true,
            references: 'users(id)',
            onDelete: 'CASCADE',
        },
        title: {
            type:'varchar(255)',
            notNull: true,
        },
        description: {
            type: 'text',
            notNull: false,
        },
        completed: {
            type: 'boolean',
            notNull: true,
            default: false,
        },
        created_at: {
            type: 'timestamp',
            notNull: true,
            default: pgm.func('now()'),
        },
        updated_at: {
            type: 'timestamp',
            notNull: true,
            default: pgm.func('now()'),
        },
    });
    pgm.createIndex('todos', ['user_id', 'created_at', 'id'], {
        order: { created_at: 'DESC', id: 'DESC' }
    });

    pgm.createTable('session', {
        sid: {
            type: 'varchar(255)',
            primaryKey: true, 
        },
        sess: {
            type: 'json',
            notNull: true,
        },
        expire: {
            type: 'timestamp(6)', 
            notNull: true,
        },
    });
    pgm.createIndex('session', 'expire', { name: 'session_expire_idx' });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
    pgm.dropTable('session');
    pgm.dropTable('todos');
    pgm.dropTable('users');
};
