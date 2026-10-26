import { useEffect, useRef, useState } from 'react'

const STATUSES = [
    { value: 'pending', label: 'Pending', tone: 'pending' },
    { value: 'in_progress', label: 'In progress', tone: 'progress' },
    { value: 'completed', label: 'Completed', tone: 'completed' },
]

export function StatusPicker({ name, defaultValue = 'pending', id }) {
    const [value, setValue] = useState(defaultValue)
    const [isOpen, setIsOpen] = useState(false)
    const pickerRef = useRef(null)
    const selected = STATUSES.find((status) => status.value === value) || STATUSES[0]

    useEffect(() => {
        function handlePointerDown(event) {
            if (!pickerRef.current?.contains(event.target)) setIsOpen(false)
        }

        document.addEventListener('pointerdown', handlePointerDown)
        return () => document.removeEventListener('pointerdown', handlePointerDown)
    }, [])

    return (
        <div className="status-picker" ref={pickerRef}>
            <input type="hidden" name={name} value={value} />
            <button
                aria-expanded={isOpen}
                aria-haspopup="listbox"
                className="status-picker-trigger"
                id={id}
                onClick={() => setIsOpen((open) => !open)}
                type="button"
            >
                <span className={`status-picker-dot tone-${selected.tone}`} aria-hidden="true" />
                <span>{selected.label}</span>
                <span className={`status-picker-chevron${isOpen ? ' is-open' : ''}`} aria-hidden="true">⌄</span>
            </button>
            {isOpen && (
                <div className="status-picker-menu" role="listbox" aria-label="Task status">
                    {STATUSES.map((status) => (
                        <button
                            aria-selected={value === status.value}
                            className={`status-picker-option${value === status.value ? ' is-selected' : ''}`}
                            key={status.value}
                            onClick={() => { setValue(status.value); setIsOpen(false) }}
                            role="option"
                            type="button"
                        >
                            <span className={`status-picker-dot tone-${status.tone}`} aria-hidden="true" />
                            {status.label}
                            {value === status.value && <span className="status-picker-check" aria-hidden="true">✓</span>}
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}
