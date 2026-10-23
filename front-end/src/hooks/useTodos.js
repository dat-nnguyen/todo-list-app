import { useEffect, useState } from 'react'
import { fetchTodosPage } from '../features/todos/fetchTodosPage.js'

const PAGE_SIZE = 5

export function useTodos({ currentCursor, reloadKey, navigate, date }) {
    const [todos, setTodos] = useState([])
    const [summary, setSummary] = useState({ totalCount: 0, completedCount: 0 })
    const [nextCursor, setNextCursor] = useState(null)
    const [isLoadingTodos, setIsLoadingTodos] = useState(true)
    const [todosError, setTodosError] = useState('')

    useEffect(() => {
        const controller = new AbortController()
        let active = true

        async function loadPage() {
            setIsLoadingTodos(true)
            setTodosError('')

            try {
                const data = await fetchTodosPage({
                    cursor: currentCursor,
                    signal: controller.signal,
                    navigate,
                    limit: PAGE_SIZE,
                    date,
                })

                if (!active || !data) return
                setTodos(data.todos)
                setNextCursor(data.nextCursor)
                setSummary(data.summary)
            } catch (error) {
                if (active && error.name !== 'AbortError') {
                    setTodosError(error.message || 'Could not load todos.')
                }
            } finally {
                if (active) setIsLoadingTodos(false)
            }
        }

        loadPage()
        return () => {
            active = false
            controller.abort()
        }
    }, [currentCursor, date, navigate, reloadKey])

    return {
        todos,
        setTodos,
        summary,
        setSummary,
        nextCursor,
        isLoadingTodos,
        todosError,
        pageSize: PAGE_SIZE,
    }
}
