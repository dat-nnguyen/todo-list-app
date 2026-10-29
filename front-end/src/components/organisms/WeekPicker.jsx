function toLocalDateKey(date) {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')

    return `${year}-${month}-${day}`
}

function getWeekStart(date) {
    const monday = new Date(date)
    const mondayOffset = (monday.getDay() + 6) % 7

    monday.setDate(monday.getDate() - mondayOffset)
    monday.setHours(0, 0, 0, 0)
    return monday
}

function addDays(date, days) {
    const nextDate = new Date(date)
    nextDate.setDate(nextDate.getDate() + days)
    return nextDate
}

export function WeekPicker({ selectedDate, onSelectDate, currentDateTime }) {
    const weekStart = getWeekStart(selectedDate)
    const todayKey = toLocalDateKey(currentDateTime)
    const selectedDateKey = toLocalDateKey(selectedDate)
    const days = Array.from({ length: 7 }, (_, index) => {
        const date = addDays(weekStart, index)

        return {
            date,
            dateKey: toLocalDateKey(date),
            weekday: new Intl.DateTimeFormat(undefined, { weekday: 'short' }).format(date),
            dayOfMonth: date.getDate(),
        }
    })
    const weekLabel = new Intl.DateTimeFormat(undefined, {
        month: 'short',
        day: 'numeric',
    }).formatRange(weekStart, addDays(weekStart, 6))

    return (
        <section className="week-section" aria-label="Choose a day">
            <div className="week-picker-heading">
                <button
                    className="week-nav-button"
                    type="button"
                    aria-label="Previous week"
                    onClick={() => onSelectDate(addDays(selectedDate, -7))}
                >
                    <span aria-hidden="true">‹</span>
                </button>
                <div className="week-picker-title">
                    <p className="section-eyebrow">{weekLabel}</p>
                    <button
                        className="week-today-button"
                        type="button"
                        onClick={() => onSelectDate(new Date())}
                        disabled={selectedDateKey === todayKey}
                    >
                        Today
                    </button>
                </div>
                <button
                    className="week-nav-button"
                    type="button"
                    aria-label="Next week"
                    onClick={() => onSelectDate(addDays(selectedDate, 7))}
                >
                    <span aria-hidden="true">›</span>
                </button>
            </div>
            <ol className="week-picker">
                {days.map((day) => {
                    const isSelected = day.dateKey === selectedDateKey

                    return (
                        <li key={day.dateKey}>
                            <button
                                className={`day-button${isSelected ? ' is-selected' : ''}`}
                                type="button"
                                aria-pressed={isSelected}
                                onClick={() => onSelectDate(day.date)}
                            >
                                <span>{day.weekday}</span>
                                <strong>{day.dayOfMonth}</strong>
                            </button>
                        </li>
                    )
                })}
            </ol>
        </section>
    )
}
