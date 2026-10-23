export async function fetchTodosPage({ cursor, signal, navigate, limit = 5 }) {
    const params = new URLSearchParams({ limit: String(limit) })
    if (cursor) params.set('cursor', cursor)

    const response = await fetch(`${import.meta.env.VITE_API_URL}/todos?${params.toString()}`, {
        credentials: 'include',
        signal,
    })

    if (response.status === 401) {
        navigate('/login', { replace: true })
        return null
    }

    const data = await response.json()
    if (!response.ok) throw new Error(data?.error?.message || 'Could not load todos.')
    return data
}
