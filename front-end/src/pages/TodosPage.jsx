import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './TodosPage.css'
import { TopBar } from '../components/TodosPageComponents/TopBar'
import { SearchBar } from '../components/TodosPageComponents/SearchBar'
import { WeekPicker } from '../components/TodosPageComponents/WeekPicker'
import { DayOverview } from '../components/TodosPageComponents/DayOverView'
import { ProgressSummary } from '../components/TodosPageComponents/ProgressSummary'
import { TodoList } from '../components/TodosPageComponents/TodoList'
import { AddTaskModal } from '../components/TodosPageComponents/AddTaskModal'

export default function TodosPage() {
    const [todos, setTodos] = useState([])
    const [isAddTaskOpen, setIsAddTaskOpen] = useState(false)
    const [user, setUser] = useState(null)
    const navigate = useNavigate()
    const [currentPage, setCurrentPage] = useState(1)
    const pageSize = 5
    const totalPages = Math.ceil(todos.length / pageSize)
    const visibleTodos = todos.slice((currentPage - 1) * pageSize, currentPage * pageSize)
    const completedCount = todos.filter((todo) => todo.status === 'completed').length

    async function updateTodo(todo, updates) {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/todos/${todo.id}`, {
            method: 'PATCH',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates),
        })
        const data = await response.json()
        if (!response.ok) throw new Error(data?.error?.message || 'Could not update task.')
        setTodos((currentTodos) => currentTodos.map((item) => item.id === data.todo.id ? data.todo : item))
        return data.todo
    }

    async function handleToggleTodo(todo, status) {
        try {
            await updateTodo(todo, { status })
        } catch (error) {
            console.error(error.message || 'Could not update task status.')
        }
    }

    async function handleDeleteTodo(todo) {
        if (!window.confirm(`Delete "${todo.title}"?`)) return

        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/todos/${todo.id}`,
                {
                    method: 'DELETE',
                    credentials: 'include',
                },
            )

            if (!response.ok) {
                throw new Error('Could not delete task.')
            }
            
            setTodos((currentTodos) =>
                currentTodos.filter((item) => item.id !== todo.id),
            )
        } catch (error) {
            console.error(error.message || 'Could not delete task.')
        }
    }

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
            <TopBar firstName={user?.firstName} onAddTask={() => setIsAddTaskOpen(true)} />
            {isAddTaskOpen && (
                <AddTaskModal
                    onClose={() => setIsAddTaskOpen(false)}
                    onCreated={(todo) => setTodos((currentTodos) => [todo, ...currentTodos])}
                />
            )}
            <div className="page-shell">
                <SearchBar />
                <aside className="sidebar">
                    <WeekPicker />
                </aside>
                <main className="main-content">
                    <DayOverview />
                    <ProgressSummary done={completedCount} total={todos.length} />
                    <TodoList
                        todos={visibleTodos}
                        onToggle={handleToggleTodo}
                        onUpdated={(updatedTodo) => setTodos((currentTodos) => currentTodos.map((todo) => todo.id === updatedTodo.id ? updatedTodo : todo))}
                        onDelete={handleDeleteTodo}
                    />
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
