import { useState } from 'react'
import { TaskFormFields } from '../molecules/TaskFormFields.jsx'
import { TaskModalShell } from '../molecules/TaskModalShell.jsx'

export function AddTaskModal({ onCreated, onClose, taskDate }) {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')

    async function addTask(event) {
        event.preventDefault()
        const form = event.currentTarget
        const formData = new FormData(form)
        const dueTimeValue = formData.get('dueTime')

        setIsSubmitting(true)
        setErrorMessage('')

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/todos`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: formData.get('title'),
                    description: formData.get('description') || null,
                    status: formData.get('status'),
                    dueTime: dueTimeValue || null,
                    taskDate,
                }),
            })
            const data = await response.json()
            if (!response.ok) throw new Error(data?.error?.message || 'Failed to add task.')

            onCreated?.(data.todo)
            form.reset()
            onClose?.()
        } catch (error) {
            setErrorMessage(error.message || 'Failed to add task.')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <TaskModalShell
            titleId="add-task-title"
            eyebrow="MAKE IT HAPPEN"
            title="Add a task"
            onClose={onClose}
        >
            <form className="add-task-form" onSubmit={addTask}>
                <TaskFormFields idPrefix="add-task" />
                {errorMessage && <p className="add-task-error" role="alert">{errorMessage}</p>}
                <div className="add-task-modal-actions">
                    <button className="add-task-cancel" type="button" onClick={onClose} disabled={isSubmitting}>Cancel</button>
                    <button className="add-task-submit" type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Creating…' : 'Create task'}
                    </button>
                </div>
            </form>
        </TaskModalShell>
    )
}
