import { useState } from 'react'

const FILTERS = [
    { value: 'all', label: 'All tasks' },
    { value: 'pending', label: 'Pending' },
    { value: 'in_progress', label: 'In progress' },
    { value: 'completed', label: 'Completed' },
]

export function TaskListControls({ sortOrder, onSortChange, statusFilter, onStatusFilterChange }) {
    const [openMenu, setOpenMenu] = useState(null)

    return (
        <div className="task-list-controls">
            <div className="task-control-wrap">
                <button
                    className="sort-button"
                    type="button"
                    aria-expanded={openMenu === 'sort'}
                    onClick={() => setOpenMenu((open) => open === 'sort' ? null : 'sort')}
                >
                    ↕ <span>{sortOrder === 'dueTime' ? 'Due time' : sortOrder === 'title' ? 'Title' : 'Sort'}</span>
                </button>
                {openMenu === 'sort' && (
                    <div className="task-control-menu" role="group" aria-label="Sort tasks">
                        <button type="button" onClick={() => { onSortChange('createdAt'); setOpenMenu(null) }}>My order</button>
                        <button type="button" onClick={() => { onSortChange('dueTime'); setOpenMenu(null) }}>Due time</button>
                        <button type="button" onClick={() => { onSortChange('title'); setOpenMenu(null) }}>Title</button>
                    </div>
                )}
            </div>
            <div className="task-control-wrap">
                <button
                    className={`filter-button${statusFilter !== 'all' ? ' is-active' : ''}`}
                    type="button"
                    aria-expanded={openMenu === 'filter'}
                    onClick={() => setOpenMenu((open) => open === 'filter' ? null : 'filter')}
                >
                    <span aria-hidden="true">☷</span><span>Filter</span>
                </button>
                {openMenu === 'filter' && (
                    <div className="task-control-menu task-filter-menu" role="group" aria-label="Filter tasks by status">
                        {FILTERS.map((filter) => (
                            <button
                                className={statusFilter === filter.value ? 'is-selected' : ''}
                                key={filter.value}
                                onClick={() => { onStatusFilterChange(filter.value); setOpenMenu(null) }}
                                type="button"
                            >{filter.label}</button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
