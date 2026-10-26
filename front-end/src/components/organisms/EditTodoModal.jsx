import { useState } from 'react'
import { TaskFormFields } from '../molecules/TaskFormFields.jsx'
import { TaskModalShell } from '../molecules/TaskModalShell.jsx'

export function EditTodoModal({ todo, onClose, onSave }) {
    const [isSaving, setIsSaving] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')

    async function handleSubmit(event) {
        event.preventDefault()
        const formData = new FormData(event.currentTarget)
        const dueTime = formData.get('dueTime')
        const updates = {
            title: formData.get('title'),
            description: formData.get('description') || null,
            status: formData.get('status'),
            dueTime: dueTime || null,
        }
        setIsSaving(true)
        setErrorMessage('')

        try {
            await onSave(updates)
            onClose()
        } catch (error) {
            setErrorMessage(error.message || 'Could not update task.')
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <TaskModalShell
            titleId={`edit-task-title-${todo.id}`}
            eyebrow="TASK DETAILS"
            title="Edit task"
            onClose={onClose}
            closeDisabled={isSaving}
        >
            <form className="add-task-form" onSubmit={handleSubmit}>
                <TaskFormFields
                    idPrefix={`edit-task-${todo.id}`}
                    defaultTitle={todo.title}
                    defaultDescription={todo.description || ''}
                    defaultStatus={todo.status}
                    defaultDueTime={todo.dueTime?.slice(0, 5) || ''}
                    titlePlaceholder="What needs to get done?"
                    descriptionPlaceholder="Add a few details"
                />
                {errorMessage && <p className="add-task-error" role="alert">{errorMessage}</p>}
                <div className="add-task-modal-actions">
                    <button className="add-task-cancel" type="button" onClick={onClose} disabled={isSaving}>Cancel</button>
                    <button className="add-task-submit" type="submit" disabled={isSaving}>{isSaving ? 'Saving…' : 'Save changes'}</button>
                </div>
            </form>
        </TaskModalShell>
    )
}
