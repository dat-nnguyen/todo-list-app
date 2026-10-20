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
        status: {
            type: 'varchar(20)',
        },
    });

    pgm.sql(`
        UPDATE todos
        SET status = CASE
            WHEN completed = true THEN 'completed'
            ELSE 'pending'
        END
    `);

    pgm.alterColumn('todos', 'status', {
        notNull: true,
        default: 'pending',
    });

    pgm.addConstraint('todos', 'todos_status_check', {
        check: "status IN ('pending', 'in_progress', 'completed')",
    });

    pgm.dropColumn('todos', 'completed');
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
    pgm.addColumn('todos', {
        completed: {
            type: 'boolean',
        },
    });

    pgm.sql(`
        UPDATE todos
        SET completed = (status = 'completed')
    `);

    pgm.alterColumn('todos', 'completed', {
        notNull: true,
        default: false,
    });

    pgm.dropConstraint('todos', 'todos_status_check');
    pgm.dropColumn('todos', 'status');
};
