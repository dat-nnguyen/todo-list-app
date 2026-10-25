import { useState } from 'react'
import { createPortal } from 'react-dom'
import { TimePicker } from './TimePicker.jsx'
import { StatusPicker } from './StatusPicker.jsx'

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

function EditTodoModal({ todo, onClose, onUpdated }) {
    const [isSaving, setIsSaving] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')

    async function handleSubmit(event) {
        event.preventDefault()
        const formData = new FormData(event.currentTarget)
        const dueTime = formData.get('dueTime')
        setIsSaving(true)
        setErrorMessage('')

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/todos/${todo.id}`, {
                method: 'PATCH',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: formData.get('title'),
                    description: formData.get('description') || null,
                    status: formData.get('status'),
                    dueTime: dueTime || null,
                }),
            })
            const data = await response.json()
            if (!response.ok) {
                throw new Error(data?.error?.message || 'Could not update task.')
            }
            onUpdated(data.todo)
            onClose()
        } catch (error) {
            setErrorMessage(error.message || 'Could not update task.')
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <div className="add-task-modal-backdrop" onMouseDown={(event) => {
            if (event.target === event.currentTarget && !isSaving) onClose()
        }}>
            <section className="add-task-modal" role="dialog" aria-modal="true" aria-labelledby="edit-task-title">
                <div className="add-task-modal-heading">
                    <div>
                        <p className="section-eyebrow">TASK DETAILS</p>
                        <h2 id="edit-task-title">Edit task</h2>
                    </div>
                    <button className="add-task-modal-close" type="button" onClick={onClose} aria-label="Close dialog" disabled={isSaving}>×</button>
                </div>
                <form className="add-task-form" onSubmit={handleSubmit}>
                    <label className="task-form-field">
                        <span>Title</span>
                        <input name="title" defaultValue={todo.title} maxLength={255} required />
                    </label>
                    <label className="task-form-field">
                        <span>Description <small>(Optional)</small></span>
                        <textarea name="description" defaultValue={todo.description || ''} maxLength={2000} rows={3} />
                    </label>
                    <label className="task-form-field">
                        <span>Status</span>
                        <StatusPicker name="status" id={`edit-task-status-${todo.id}`} defaultValue={todo.status} />
                    </label>
                    <label className="task-form-field">
                        <span>Due time <small>(Optional)</small></span>
                        <TimePicker
                            name="dueTime"
                            id={`edit-task-due-time-${todo.id}`}
                            label="Choose due time"
                            defaultValue={todo.dueTime?.slice(0, 5) || ''}
                        />
                    </label>
                    {errorMessage && <p className="add-task-error" role="alert">{errorMessage}</p>}
                    <div className="add-task-modal-actions">
                        <button className="add-task-cancel" type="button" onClick={onClose} disabled={isSaving}>Cancel</button>
                        <button className="add-task-submit" type="submit" disabled={isSaving}>{isSaving ? 'Saving…' : 'Save changes'}</button>
                    </div>
                </form>
            </section>
        </div>
    )
}

export function TodoItem({ todo, onToggle, onUpdated, onDelete }) {
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
                <EditTodoModal todo={todo} onClose={() => setIsEditOpen(false)} onUpdated={onUpdated} />,
                document.body,
            )}
        </li>
    )
}
