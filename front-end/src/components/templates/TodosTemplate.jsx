import { TopBar } from '../organisms/TopBar.jsx'
import { WeekPicker } from '../organisms/WeekPicker.jsx'
import { DayOverview } from '../organisms/DayOverView.jsx'
import { ProgressSummary } from '../organisms/ProgressSummary.jsx'
import { TodoList } from '../organisms/TodoList.jsx'
import { AddTaskModal } from '../organisms/AddTaskModal.jsx'

export function TodosTemplate({
    firstName,
    isAddTaskOpen,
    onOpenAddTask,
    onCloseAddTask,
    selectedDate,
    selectedDateKey,
    onSelectDate,
    onTaskCreated,
    currentDateTime,
    summary,
    isLoadingTodos,
    todosError,
    todos,
    sortOrder,
    onSortChange,
    statusFilter,
    onStatusFilterChange,
    onToggleTodo,
    onSaveTodo,
    onDeleteTodo,
    pagination,
}) {
    return (
        <div className="todo-page">
            <TopBar firstName={firstName} />
            {isAddTaskOpen && (
                <AddTaskModal
                    onClose={onCloseAddTask}
                    taskDate={selectedDateKey}
                    onCreated={onTaskCreated}
                />
            )}
            <div className="page-shell">
                <aside className="sidebar">
                    <WeekPicker
                        selectedDate={selectedDate}
                        onSelectDate={onSelectDate}
                        currentDateTime={currentDateTime}
                    />
                    <button className="add-task-button" type="button" onClick={onOpenAddTask}>
                        <span aria-hidden="true">＋</span> Add a task
                    </button>
                </aside>
                <main className="main-content">
                    <DayOverview selectedDate={selectedDate} currentDateTime={currentDateTime} />
                    <ProgressSummary done={summary.completedCount} total={summary.totalCount} />
                    <div className="todo-list-region" aria-busy={isLoadingTodos}>
                        {todosError && <p className="add-task-error" role="alert">{todosError}</p>}
                        <TodoList
                            todos={todos}
                            sortOrder={sortOrder}
                            onSortChange={onSortChange}
                            statusFilter={statusFilter}
                            onStatusFilterChange={onStatusFilterChange}
                            onToggle={onToggleTodo}
                            onSave={onSaveTodo}
                            onDelete={onDeleteTodo}
                        />
                    </div>
                    {(pagination.currentPage > 0 || pagination.nextCursor) && (
                        <nav className="todo-pagination" aria-label="Task pages">
                            <button
                                type="button"
                                onClick={pagination.onPrevious}
                                disabled={pagination.currentPage === 0 || isLoadingTodos}
                            >
                                <span aria-hidden="true">←</span> Previous
                            </button>
                            <span>
                                Page {pagination.currentPage + 1}
                                {pagination.totalPages >= pagination.currentPage + 1 && ` of ${pagination.totalPages}`}
                            </span>
                            <button
                                type="button"
                                onClick={pagination.onNext}
                                disabled={!pagination.nextCursor || isLoadingTodos}
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
