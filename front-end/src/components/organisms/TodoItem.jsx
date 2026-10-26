import { useState } from 'react'
import { createPortal } from 'react-dom'
import { EditTodoModal } from './EditTodoModal.jsx'

function formatDueTime(value) {
    if (!value) return 'No due time'

    const [hours, minutes] = value.slice(0, 5).split(':').map(Number)
    const date = new Date()
    date.setHours(hours, minutes, 0, 0)

    return `Due ${new Intl.DateTimeFormat(undefined, {
        hour: 'numeric',
        minute: '2-digit',
    }).format(date)}`
}
export function TodoItem({ todo, onToggle, onSave, onDelete }) {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [isEditOpen, setIsEditOpen] = useState(false)
    const isCompleted = todo.status === 'completed'

    return (
        <li className={`todo-item${isCompleted ? ' is-completed' : ''}`}>
            <button
                className="todo-check"
                type="button"
                role="checkbox"
                aria-checked={isCompleted}
                aria-label={isCompleted ? `Mark ${todo.title} incomplete` : `Mark ${todo.title} complete`}
                onClick={() => onToggle?.(todo, isCompleted ? 'pending' : 'completed')}
            >
                {isCompleted && <span aria-hidden="true">✓</span>}
            </button>
            <div className="todo-copy">
                <strong>{todo.title}</strong>
                <p>{todo.description || 'No description'}<small>{formatDueTime(todo.dueTime)}</small></p>
                <span className={`todo-status status-${todo.status}`}>{todo.status.replace('_', ' ')}</span>
            </div>
            <div className="todo-item-menu-wrapper">
                <button
                    className="todo-more"
                    type="button"
                    aria-label={`Options for ${todo.title}`}
                    aria-expanded={isMenuOpen}
                    onClick={() => setIsMenuOpen((open) => !open)}
                >···</button>
                {isMenuOpen && (
                    <div className="todo-item-menu">
                        <button type="button" onClick={() => { setIsMenuOpen(false); setIsEditOpen(true) }}>Edit task</button>
                        <button className="delete-todo-button" type="button" onClick={() => { setIsMenuOpen(false); onDelete?.(todo) }}>Delete task</button>
                    </div>
                )}
            </div>
            {isEditOpen && createPortal(
                <EditTodoModal
                    todo={todo}
                    onClose={() => setIsEditOpen(false)}
                    onSave={(updates) => onSave(todo, updates)}
                />,
                document.body,
            )}
        </li>
    )
}
