export async function updateTodo({ todo, updates }) {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/todos/${todo.id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
    })
    const data = await response.json()
    if (!response.ok) throw new Error(data?.error?.message || 'Could not update task.')
    return data.todo
}
