import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles/TodosPage.css'
import { TopBar } from '../components/TodosPageComponents/TopBar'
import { WeekPicker } from '../components/TodosPageComponents/WeekPicker'
import { DayOverview } from '../components/TodosPageComponents/DayOverView'
import { ProgressSummary } from '../components/TodosPageComponents/ProgressSummary'
import { TodoList } from '../components/TodosPageComponents/TodoList'
import { AddTaskModal } from '../components/TodosPageComponents/AddTaskModal'
import { createToggleTodoHandler } from '../features/todos/handleToggleTodo.js'
import { createDeleteTodoHandler } from '../features/todos/handleDeleteTodo.js'
import { useCurrentUser } from '../hooks/useCurrentUser.js'
import { useTodos } from '../hooks/useTodos.js'
import { useCurrentDateTime } from '../hooks/useCurrentDateTime.js'

function toLocalDateKey(date) {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
}

export default function TodosPage() {
    const navigate = useNavigate()
    const [currentPage, setCurrentPage] = useState(0)
    const [pageCursors, setPageCursors] = useState([null])
    const [reloadKey, setReloadKey] = useState(0)
    const [selectedDate, setSelectedDate] = useState(new Date())
    const [sortOrder, setSortOrder] = useState('createdAt')
    const [statusFilter, setStatusFilter] = useState('all')
    const currentCursor = pageCursors[currentPage]
    const [isAddTaskOpen, setIsAddTaskOpen] = useState(false)
    const user = useCurrentUser(navigate)
    const selectedDateKey = toLocalDateKey(selectedDate)
    const {
        todos,
        setTodos,
        summary,
        nextCursor,
        isLoadingTodos,
        todosError,
        pageSize,
    } = useTodos({ currentCursor, reloadKey, navigate, date: selectedDateKey })
    const totalPages = Math.ceil(summary.totalCount / pageSize)
    const visibleTodos = todos
        .filter((todo) => statusFilter === 'all' || todo.status === statusFilter)
        .sort((first, second) => {
            if (sortOrder === 'title') return first.title.localeCompare(second.title)
            if (sortOrder === 'dueTime') return (first.dueTime || '99:99').localeCompare(second.dueTime || '99:99')
            return 0
        })
    const handleToggleTodo = createToggleTodoHandler({ setTodos })
    const handleDeleteTodo = createDeleteTodoHandler({ setTodos })
    const currentDateTime = useCurrentDateTime()

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
                    taskDate={selectedDateKey}
                    onCreated={() => {
                        setPageCursors([null])
                        setCurrentPage(0)
                        setReloadKey((key) => key + 1)
                    }}
                />
            )}
            <div className="page-shell">

                <aside className="sidebar">
                    <WeekPicker
                        selectedDate={selectedDate}
                        onSelectDate={(date) => {
                            setSelectedDate(date)
                            setPageCursors([null])
                            setCurrentPage(0)
                        }}
                    />
                    <button className="add-task-button" type="button" onClick={() => setIsAddTaskOpen(true)}>
                        <span aria-hidden="true">＋</span> Add a task
                    </button>
                </aside>
                <main className="main-content">
                    <DayOverview selectedDate={selectedDate} currentDateTime={currentDateTime} />
                    <ProgressSummary done={summary.completedCount} total={summary.totalCount} />
                    <div className="todo-list-region" aria-busy={isLoadingTodos}>
                        {todosError && <p className="add-task-error" role="alert">{todosError}</p>}
                        <TodoList
                            todos={visibleTodos}
                            sortOrder={sortOrder}
                            onSortChange={setSortOrder}
                            statusFilter={statusFilter}
                            onStatusFilterChange={setStatusFilter}
                            onToggle={handleToggleTodo}
                            onUpdated={(updatedTodo) => setTodos((currentTodos) => currentTodos.map((todo) => todo.id === updatedTodo.id ? updatedTodo : todo))}
                            onDelete={handleDeleteTodo}
                        />
                    </div>
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
