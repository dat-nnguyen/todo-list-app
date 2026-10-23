import { updateTodo } from './updateTodo.js'

export function createToggleTodoHandler({ setTodos }) {
    return async function handleToggleTodo(todo, status) {
        try {
            await updateTodo({ todo, updates: { status }, setTodos })
        } catch (error) {
            console.error(error.message || 'Could not update task status.')
        }
    }
}
