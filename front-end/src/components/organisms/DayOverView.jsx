function toLocalDateKey(date) {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
}

export function DayOverview({ selectedDate, currentDateTime }) {
    const selectedWeekday = new Intl.DateTimeFormat(undefined, {
        weekday: 'long',
    }).format(selectedDate)
    const selectedDayAndMonth = new Intl.DateTimeFormat('en-US', {
        month: 'long',
        day: 'numeric',
    }).format(selectedDate)
    const isToday = toLocalDateKey(selectedDate) === toLocalDateKey(currentDateTime)

    return (
        <section className="day-overview">
            <div>
                <p className="overview-kicker">{selectedWeekday}, {selectedDayAndMonth}</p>
                <h1>{isToday ? 'Today.' : `${selectedWeekday}.`}</h1>
                <p className="overview-subtitle">{isToday ? 'Make room for what matters.' : 'Your plan for the day.'}</p>
            </div>
        </section>
    )
}