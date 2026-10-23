import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles/TodosPage.css'
import { TopBar } from '../components/TodosPageComponents/TopBar'
import { SearchBar } from '../components/TodosPageComponents/SearchBar'
import { WeekPicker } from '../components/TodosPageComponents/WeekPicker'
import { DayOverview } from '../components/TodosPageComponents/DayOverView'
import { ProgressSummary } from '../components/TodosPageComponents/ProgressSummary'
import { TodoList } from '../components/TodosPageComponents/TodoList'
import { AddTaskModal } from '../components/TodosPageComponents/AddTaskModal'
import { createToggleTodoHandler } from '../features/todos/handleToggleTodo.js'
import { createDeleteTodoHandler } from '../features/todos/handleDeleteTodo.js'
import { useCurrentUser } from '../hooks/useCurrentUser.js'
import { useTodos } from '../hooks/useTodos.js'

export default function TodosPage() {
    const navigate = useNavigate()
    const [currentPage, setCurrentPage] = useState(0)
    const [pageCursors, setPageCursors] = useState([null])
    const [reloadKey, setReloadKey] = useState(0)
    const currentCursor = pageCursors[currentPage]
    const [isAddTaskOpen, setIsAddTaskOpen] = useState(false)
    const user = useCurrentUser(navigate)
    const {
        todos,
        setTodos,
        summary,
        nextCursor,
        isLoadingTodos,
        todosError,
        pageSize,
    } = useTodos({ currentCursor, reloadKey, navigate })
    const totalPages = Math.ceil(summary.totalCount / pageSize)
    const handleToggleTodo = createToggleTodoHandler({ setTodos })
    const handleDeleteTodo = createDeleteTodoHandler({ setTodos })

    function goToNextPage() {
        if (!nextCursor || isLoadingTodos) return

        setPageCursors((cursor) => [
            ...cursor.slice(0, currentPage + 1), 
            nextCursor
        ])
        setCurrentPage((page) => page + 1) 
    }

    function goToPreviousPage() {
        setCurrentPage((page) => Math.max(0, page - 1))
    }



    return (
        <div className="todo-page">
            <TopBar firstName={user?.firstName} />
            {isAddTaskOpen && (
                <AddTaskModal
                    onClose={() => setIsAddTaskOpen(false)}
                    onCreated={() => {
                        setPageCursors([null])
                        setCurrentPage(0)
                        setReloadKey((key) => key + 1)
                    }}
                />
            )}
            <div className="page-shell">
                <SearchBar />

                <aside className="sidebar">
                    <WeekPicker />
                    <button className="add-task-button" type="button" onClick={() => setIsAddTaskOpen(true)}>
                        <span aria-hidden="true">＋</span> Add a task
                    </button>
                </aside>
                <main className="main-content">
                    <DayOverview />
                    <ProgressSummary done={summary.completedCount} total={summary.totalCount} />
                    {isLoadingTodos && <p role="status">Loading tasks…</p>}

                    {todosError && <p className="add-task-error" role="alert">{todosError}</p>}

                    <TodoList
                        todos={todos}
                        onToggle={handleToggleTodo}
                        onUpdated={(updatedTodo) => setTodos((currentTodos) => currentTodos.map((todo) => todo.id === updatedTodo.id ? updatedTodo : todo))}
                        onDelete={handleDeleteTodo}
                    />
                    {(currentPage > 0 || nextCursor) && (
                        <nav className="todo-pagination" aria-label="Task pages">
                            <button
                                type="button"
                                onClick={goToPreviousPage}
                                disabled={currentPage === 0 || isLoadingTodos}
                            >
                                <span aria-hidden="true">←</span> Previous
                            </button>

                            <span>Page {currentPage + 1} of {totalPages}</span>

                            <button
                                type="button"
                                onClick={goToNextPage}
                                disabled={!nextCursor || isLoadingTodos}
                            >
                                Next <span aria-hidden="true">→</span>
                            </button>
                        </nav>
                    )}
                </main>
            </div>
        </div>
    )
}
