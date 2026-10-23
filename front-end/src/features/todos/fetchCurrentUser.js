export async function fetchCurrentUser({ navigate }) {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/me`, {
        credentials: 'include',
    })

    if (response.status === 401) {
        navigate('/login', { replace: true })
        return null
    }

    const data = await response.json()
    if (!response.ok) throw new Error(data?.error?.message || 'Could not load user.')
    return data.user
}
