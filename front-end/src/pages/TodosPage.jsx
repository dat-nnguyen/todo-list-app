import { useState } from 'react'
import './TodosPage.css'

function TopBar() {
    return (
        <header className="topbar">
            <a className="brand" href="/todos" aria-label="Daylist home">
                <span>Todo List</span>
            </a>
            <div className="topbar-actions">
                <button className="avatar-button" type="button" aria-label="User profile">Dat</button>
                <button className="add-task-button" type="button">
                    <span aria-hidden="true">＋</span> Add a task
                </button>
            </div>
        </header>
    )
}

function SearchBar() {
    return (
        <div className="search-row">
            <label className="search-field" htmlFor="search">
                <span className="search-icon" aria-hidden="true">⌕</span>
                <input type="search" id="search" placeholder="Search your tasks..." />
                <kbd>⌘K</kbd>
            </label>
            <button className="filter-button" type="button" aria-label="Filter tasks">
                <span aria-hidden="true">☷</span>
                <span>Filter</span>
            </button>
        </div>
    )
}



function WeekPicker() {
    const days = [
        { letter: 'M', date: '19' },
        { letter: 'T', date: '20' },
        { letter: 'W', date: '21', selected: true },
        { letter: 'T', date: '22' },
        { letter: 'F', date: '23' },
        { letter: 'S', date: '24' },
        { letter: 'S', date: '25' },
    ]

    return (
        <section className="week-section" aria-label="Choose a day this week">
            <p className="section-eyebrow">This week</p>
            <ol className="week-picker">
                {days.map((day, index) => (
                    <li key={`${day.letter}-${day.date}-${index}`}>
                        <button className={`day-button${day.selected ? ' is-selected' : ''}`} type="button" aria-pressed={Boolean(day.selected)}>
                            <span>{day.letter}</span>
                            <strong>{day.date}</strong>
                        </button>
                    </li>
                ))}
            </ol>
        </section>
    )
}

function DayOverview() {
    return (
        <section className="day-overview">
            <div>
                <p className="overview-kicker">Wednesday, October 21</p>
                <h1>Today.</h1>
                <p className="overview-subtitle">Make room for what matters.</p>
            </div>
        </section>
    )
}

function ProgressSummary({ done, total }) {
    return (
        <section className="progress-summary" aria-label="Task completion progress">
            <div className="progress-copy">
                <p><strong>{done} / {total}</strong><span>tasks done</span></p>
                <span className="progress-caption">Just keep going</span>
            </div>
            <div className="progress-track" role="progressbar" aria-valuenow={done} aria-valuemin="0" aria-valuemax={total}>
                {Array.from({ length: total }, (_, index) => (
                    <span className={index < done ? 'is-done' : ''} key={index} />
                ))}
            </div>
        </section>
    )
}

function TodoList({ todos }) {
    return (
        <section className="todo-list-card">
            <div className="todo-list-heading">
                <h2>Your tasks <span>{String(todos.length).padStart(2, '0')}</span></h2>
                <button className="sort-button" type="button">↕ <span>My order</span></button>
            </div>
            <ul>
                {todos.map((todo) => (
                    <TodoItem key={todo.id} todo={todo} />
                ))}
            </ul>
        </section>
    )
}

function TodoItem({ todo }) {
    return (
        <li className="todo-item">
            <button className="todo-check" type="button" aria-label={`Mark ${todo.title} complete`} />
            <div className="todo-copy">
                <strong>{todo.title}</strong>
                <p>{todo.description || 'Personal'}<span>·</span>{todo.dueDate ? `Due ${todo.dueDate}` : 'No due date'}</p>
            </div>
            <button className="todo-more" type="button" aria-label={`More options for ${todo.title}`}>···</button>
        </li>
    )
}

export default function TodosPage() {
    const todos = []
    const [currentPage, setCurrentPage] = useState(1)
    const pageSize = 5
    const totalPages = Math.ceil(todos.length / pageSize)
    const visibleTodos = todos.slice((currentPage - 1) * pageSize, currentPage * pageSize)

    return (
        <div className="todo-page">
            <TopBar />
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