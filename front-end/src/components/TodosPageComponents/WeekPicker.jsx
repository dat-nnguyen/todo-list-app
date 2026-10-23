export function WeekPicker() {
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