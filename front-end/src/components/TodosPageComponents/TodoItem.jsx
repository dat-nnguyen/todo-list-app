export function TodoItem({ todo }) {
    return (
        <li className="todo-item">
            <button className="todo-check" type="button" aria-label={`Mark ${todo.title} complete`} />
            <div className="todo-copy">
                <strong>{todo.title}</strong>
                <p>{todo.description || 'Personal'}<span>·</span>{todo.dueDate ? `Due ${todo.dueDate}` : 'No due date'}</p>
            </div>
            <button className="todo-more" type="button" aria-label={`More options for ${todo.title}`}>···</button>
        </li>
    )
}
