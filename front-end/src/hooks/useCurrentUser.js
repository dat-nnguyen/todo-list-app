import { useEffect, useState } from 'react'
import { fetchCurrentUser } from '../features/todos/fetchCurrentUser.js'

export function useCurrentUser(navigate) {
    const [user, setUser] = useState(null)

    useEffect(() => {
        let cancelled = false

        fetchCurrentUser({ navigate })
            .then((currentUser) => {
                if (!cancelled && currentUser) setUser(currentUser)
            })
            .catch((error) => {
                if (!cancelled) console.error(error.message || 'Could not load user.')
            })

        return () => {
            cancelled = true
        }
    }, [navigate])

    return user
}
