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
    pgm.addColumn('todos', {
        task_date: {
            type: 'date',
        },
    });

    pgm.sql('UPDATE todos SET task_date = created_at::date WHERE task_date IS NULL');
    pgm.alterColumn('todos', 'task_date', { notNull: true });
    pgm.createIndex('todos', ['user_id', 'task_date', { name: 'created_at', sort: 'DESC' }, { name: 'id', sort: 'DESC' }], {
        name: 'todos_user_task_date_created_at_id_idx',
    });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
    pgm.dropIndex('todos', ['user_id', 'task_date', 'created_at', 'id'], {
        name: 'todos_user_task_date_created_at_id_idx',
    });
    pgm.dropColumn('todos', 'task_date');
};
