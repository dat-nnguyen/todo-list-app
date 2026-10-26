import { updateTodo } from './updateTodo.js'

export function createToggleTodoHandler({ setTodos, setSummary }) {
    return async function handleToggleTodo(todo, status) {
        try {
            const updatedTodo = await updateTodo({ todo, updates: { status } })
            setTodos((currentTodos) => currentTodos.map((item) => item.id === updatedTodo.id ? updatedTodo : item))

            const wasCompleted = todo.status === 'completed'
            const isCompleted = updatedTodo.status === 'completed'
            if (wasCompleted !== isCompleted) {
                setSummary((currentSummary) => ({
                    ...currentSummary,
                    completedCount: currentSummary.completedCount + (isCompleted ? 1 : -1),
                }))
            }
        } catch (error) {
            console.error(error.message || 'Could not update task status.')
        }
    }
}
