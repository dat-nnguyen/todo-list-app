import { useState } from 'react'
import { TimePicker } from './TimePicker.jsx'
import { StatusPicker } from './StatusPicker.jsx'

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
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title: formData.get('title'),
                    description: formData.get('description') || null,
                    status: formData.get('status'),
                    dueTime: dueTimeValue || null,
                    taskDate,
                }),
            })

            const data = await response.json()
            if (!response.ok) {
                throw new Error(data?.error?.message || 'Failed to add task.')
            }

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
        <div className="add-task-modal-backdrop" onMouseDown={(event) => {
            if (event.target === event.currentTarget) onClose?.()
        }}>
            <section className="add-task-modal" role="dialog" aria-modal="true" aria-labelledby="add-task-title">
                <div className="add-task-modal-heading">
                    <div>
                        <p className="section-eyebrow">MAKE IT HAPPEN</p>
                        <h2 id="add-task-title">Add a task</h2>
                    </div>
                    <button className="add-task-modal-close" type="button" onClick={onClose} aria-label="Close dialog">×</button>
                </div>

                <form className="add-task-form" onSubmit={addTask}>
                    <label className="task-form-field">
                        <span>Title</span>
                        <input type="text" name="title" placeholder="What needs to get done?" maxLength={255} required />
                    </label>
                    <label className="task-form-field">
                        <span>Description <small>(Optional)</small></span>
                        <textarea name="description" placeholder="Add a few details" maxLength={2000} rows={3} />
                    </label>
                    <div className="task-form-row">
                        <label className="task-form-field">
                            <span>Status</span>
                            <StatusPicker name="status" id="add-task-status" defaultValue="pending" />
                        </label>
                        <label className="task-form-field">
                            <span>Due time <small>(Optional)</small></span>
                            <TimePicker name="dueTime" id="add-task-due-time" label="Choose due time" />
                        </label>
                    </div>

                    {errorMessage && <p className="add-task-error" role="alert">{errorMessage}</p>}

                    <div className="add-task-modal-actions">
                        <button className="add-task-cancel" type="button" onClick={onClose} disabled={isSubmitting}>Cancel</button>
                        <button className="add-task-submit" type="submit" disabled={isSubmitting}>
                            {isSubmitting ? 'Creating…' : 'Create task'}
                        </button>
                    </div>
                </form>
            </section>
        </div>
    )
}
