import { useEffect, useRef, useState } from 'react'

const HOURS = Array.from({ length: 24 }, (_, index) => String(index).padStart(2, '0'))
const MINUTES = Array.from({ length: 60 }, (_, index) => String(index).padStart(2, '0'))

export function TimePicker({ name, defaultValue = '', id, label = 'Choose time' }) {
    const [value, setValue] = useState(defaultValue)
    const [isOpen, setIsOpen] = useState(false)
    const pickerRef = useRef(null)
    const [initialHour = '', initialMinute = ''] = value.split(':')
    const hour = initialHour || '09'
    const minute = initialMinute || '00'

    useEffect(() => {
        function handlePointerDown(event) {
            if (!pickerRef.current?.contains(event.target)) setIsOpen(false)
        }

        document.addEventListener('pointerdown', handlePointerDown)
        return () => document.removeEventListener('pointerdown', handlePointerDown)
    }, [])

    function updateTime(nextHour, nextMinute) {
        setValue(`${nextHour}:${nextMinute}`)
    }

    return (
        <div className="time-picker" ref={pickerRef}>
            <input type="hidden" name={name} value={value} />
            <button
                aria-label={value ? `${label}: ${value}` : label}
                aria-expanded={isOpen}
                aria-haspopup="listbox"
                className={`time-picker-trigger${value ? ' has-value' : ''}`}
                id={id}
                onClick={() => setIsOpen((open) => !open)}
                type="button"
            >
                <span>{value || 'Select a time'}</span>
                <span className="time-picker-icon" aria-hidden="true">◷</span>
            </button>
            {isOpen && (
                <div className="time-picker-popover" role="group" aria-label={label}>
                    <div className="time-picker-column" role="listbox" aria-label="Hour">
                        {HOURS.map((option) => (
                            <button
                                aria-selected={hour === option}
                                className={hour === option ? 'is-selected' : ''}
                                key={option}
                                onClick={() => updateTime(option, minute)}
                                role="option"
                                type="button"
                            >{option}</button>
                        ))}
                    </div>
                    <span className="time-picker-separator" aria-hidden="true">:</span>
                    <div className="time-picker-column" role="listbox" aria-label="Minute">
                        {MINUTES.map((option) => (
                            <button
                                aria-selected={minute === option}
                                className={minute === option ? 'is-selected' : ''}
                                key={option}
                                onClick={() => updateTime(hour, option)}
                                role="option"
                                type="button"
                            >{option}</button>
                        ))}
                    </div>
                    <button className="time-picker-clear" onClick={() => { setValue(''); setIsOpen(false) }} type="button">
                        Clear time
                    </button>
                </div>
            )}
        </div>
    )
}
