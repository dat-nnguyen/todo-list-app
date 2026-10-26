import { TodoItem } from './TodoItem.jsx'
import { TaskListControls } from '../molecules/TaskListControls.jsx'

export function TodoList({ todos, onToggle, onSave, onDelete, sortOrder, onSortChange, statusFilter, onStatusFilterChange }) {
    return (
        <section className="todo-list-card">
            <div className="todo-list-heading">
                <h2>Your tasks</h2>
                <TaskListControls
                    sortOrder={sortOrder}
                    onSortChange={onSortChange}
                    statusFilter={statusFilter}
                    onStatusFilterChange={onStatusFilterChange}
                />
            </div>
            <ul>
                {todos.map((todo) => (
                    <TodoItem
                        key={todo.id}
                        todo={todo}
                        onToggle={onToggle}
                        onSave={onSave}
                        onDelete={onDelete}
                    />
                ))}
            </ul>
        </section>
    )
}