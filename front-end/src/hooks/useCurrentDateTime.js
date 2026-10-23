import { useEffect, useState } from "react";

export function useCurrentDateTime() {
    const [currentDateTime, setCurrentDateTime] = useState(() => new Date())

    useEffect(() => {
        const updateDateTime = () => setCurrentDateTime(new Date())

        const intervalId = window.setInterval(updateDateTime, 60_000)
        window.addEventListener('focus', updateDateTime)

        return () => {
            window.clearInterval(intervalId)
            window.removeEventListener('focus', updateDateTime)
        }

    }, [])
    return currentDateTime
}