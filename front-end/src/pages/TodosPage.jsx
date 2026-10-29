import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles/TodosPage.css'
import { TodosTemplate } from '../components/templates/TodosTemplate.jsx'
import { createDeleteTodoHandler } from '../features/todos/handleDeleteTodo.js'
import { createToggleTodoHandler } from '../features/todos/handleToggleTodo.js'
import { updateTodo } from '../features/todos/updateTodo.js'
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
    const [selectedDate, setSelectedDate] = useState(() => new Date())
    const [sortOrder, setSortOrder] = useState('createdAt')
    const [statusFilter, setStatusFilter] = useState('all')
    const currentCursor = pageCursors[currentPage]
    const [isAddTaskOpen, setIsAddTaskOpen] = useState(false)
    const user = useCurrentUser(navigate)
    const selectedDateKey = toLocalDateKey(selectedDate)
    const {
        todos,
        summary,
        filteredCount,
        nextCursor,
        isLoadingTodos,
        todosError,
        pageSize,
    } = useTodos({ currentCursor, reloadKey, navigate, date: selectedDateKey, status: statusFilter, sort: sortOrder })

    const totalPages = Math.ceil(filteredCount / pageSize)
    const handleToggleTodo = createToggleTodoHandler({ onSuccess: refreshAfterMutation })
    const handleDeleteTodo = createDeleteTodoHandler({ onSuccess: refreshAfterMutation })
    async function handleSaveTodo(todo, updates) {
        await updateTodo({ todo, updates })
        refreshAfterMutation()
    }
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

    function handleSelectDate(date) {
        setSelectedDate(date)
        setPageCursors([null])
        setCurrentPage(0)
    }

    function resetPagination() {
        setPageCursors([null])
        setCurrentPage(0)
    }

    function handleSortChange(value) {
        setSortOrder(value)
        resetPagination()
    }

    function handleStatusFilterChange(value) {
        setStatusFilter(value)
        resetPagination()
    }

    function refreshAfterMutation() {
        setReloadKey((key) => key + 1)
    }

    return (
        <TodosTemplate
            firstName={user?.firstName}
            isAddTaskOpen={isAddTaskOpen}
            onOpenAddTask={() => setIsAddTaskOpen(true)}
            onCloseAddTask={() => setIsAddTaskOpen(false)}
            selectedDate={selectedDate}
            selectedDateKey={selectedDateKey}
            onSelectDate={handleSelectDate}
            onTaskCreated={refreshAfterMutation}
            currentDateTime={currentDateTime}
            summary={summary}
            isLoadingTodos={isLoadingTodos}
            todosError={todosError}
            todos={todos}
            sortOrder={sortOrder}
            onSortChange={handleSortChange}
            statusFilter={statusFilter}
            onStatusFilterChange={handleStatusFilterChange}
            onToggleTodo={handleToggleTodo}
            onSaveTodo={handleSaveTodo}
            onDeleteTodo={handleDeleteTodo}
            pagination={{
                currentPage,
                nextCursor,
                totalPages,
                onPrevious: goToPreviousPage,
                onNext: goToNextPage,
            }}
        />
    )
}
