import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './TodosPage.css'
import { TopBar } from '../components/TodosPageComponents/TopBar'
import { SearchBar } from '../components/TodosPageComponents/SearchBar'
import { WeekPicker } from '../components/TodosPageComponents/WeekPicker'
import { DayOverview } from '../components/TodosPageComponents/DayOverView'
import { ProgressSummary } from '../components/TodosPageComponents/ProgressSummary'
import { TodoList } from '../components/TodosPageComponents/TodoList'

export default function TodosPage() {
    const todos = []
    const [user, setUser] = useState(null)
    const navigate = useNavigate()
    const [currentPage, setCurrentPage] = useState(1)
    const pageSize = 5
    const totalPages = Math.ceil(todos.length / pageSize)
    const visibleTodos = todos.slice((currentPage - 1) * pageSize, currentPage * pageSize)

    useEffect(() => {
        let cancelled = false

        async function getUser() {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/me`, {
                    credentials: 'include',
                })

                if (response.status === 401) {
                    navigate('/login', { replace: true })
                    return
                }

                const data = await response.json()
                if (!response.ok) {
                    throw new Error(data?.error?.message || 'Could not load user.')
                }

                if (!cancelled) setUser(data.user)
            } catch (error) {
                if (!cancelled) {
                    console.error(error.message || 'Could not load user.')
                }
            }
        }

        getUser()
        return () => {
            cancelled = true
        }
    }, [navigate])

    return (
        <div className="todo-page">
            <TopBar firstName={user?.firstName} />
            <div className="page-shell">
                <SearchBar />
                <aside className="sidebar">
                    <WeekPicker />
                </aside>
                <main className="main-content">
                    <DayOverview />
                    <ProgressSummary done={0} total={todos.length} />
                    <TodoList todos={visibleTodos} />
                    {totalPages > 1 && (
                        <nav className="todo-pagination" aria-label="Task pages">
                            <button type="button" onClick={() => setCurrentPage((page) => page - 1)} disabled={currentPage === 1}>
                                <span aria-hidden="true">←</span> Previous
                            </button>
                            <span>Page {currentPage} of {totalPages}</span>
                            <button type="button" onClick={() => setCurrentPage((page) => page + 1)} disabled={currentPage === totalPages}>
                                Next <span aria-hidden="true">→</span>
                            </button>
                        </nav>
                    )}
                </main>
            </div>
        </div>
    )
}
