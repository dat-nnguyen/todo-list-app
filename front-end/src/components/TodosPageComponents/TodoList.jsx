import { TodoItem } from './TodoItem.jsx'

export function TodoList({ todos, onToggle, onUpdated, onDelete }) {
    return (
        <section className="todo-list-card">
            <div className="todo-list-heading">
                <h2>Your tasks <span>{String(todos.length).padStart(2, '0')}</span></h2>
                <button className="sort-button" type="button">↕ <span>My order</span></button>
            </div>
            <ul>
                {todos.map((todo) => (
                    <TodoItem
                        key={todo.id}
                        todo={todo}
                        onToggle={onToggle}
                        onUpdated={onUpdated}
                        onDelete={onDelete}
                    />
                ))}
            </ul>
        </section>
    )
}