export function createDeleteTodoHandler({ setTodos }) {
    return async function handleDeleteTodo(todo) {
        if (!window.confirm(`Delete "${todo.title}"?`)) return

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/todos/${todo.id}`, {
                method: 'DELETE',
                credentials: 'include',
            })

            if (!response.ok) throw new Error('Could not delete task.')
            setTodos((currentTodos) => currentTodos.filter((item) => item.id !== todo.id))
        } catch (error) {
            console.error(error.message || 'Could not delete task.')
        }
    }
}
