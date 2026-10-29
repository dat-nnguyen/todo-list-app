import { updateTodo } from './updateTodo.js'

export function createToggleTodoHandler({ onSuccess }) {
    return async function handleToggleTodo(todo, status) {
        try {
            await updateTodo({ todo, updates: { status } })
            onSuccess()
        } catch (error) {
            console.error(error.message || 'Could not update task status.')
        }
    }
}
