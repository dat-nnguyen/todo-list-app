function toLocalDateKey(date) {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')

    return `${year}-${month}-${day}`
}

export function WeekPicker({ selectedDate, onSelectDate }) {
    const today = new Date()
    const mondayOffset = (today.getDay() + 6) % 7
    const monday = new Date(today)

    monday.setDate(today.getDate() - mondayOffset)
    monday.setHours(0, 0, 0, 0)

    const days = Array.from({ length: 7 }, (_, index) => {
        const date = new Date(monday)
        date.setDate(monday.getDate() + index)

        return {
            date,
            dateKey: toLocalDateKey(date),
            weekday: new Intl.DateTimeFormat(undefined, {
                weekday: 'short',
            }).format(date),
            dayOfMonth: date.getDate(),
        }
    })

    const selectedDateKey = toLocalDateKey(selectedDate)

    return (
        <section className="week-section" aria-label="Choose a day this week">
            <p className="section-eyebrow">This week</p>
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
