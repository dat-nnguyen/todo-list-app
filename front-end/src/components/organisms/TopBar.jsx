import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

export function TopBar({ firstName }) {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [logoutError, setLogoutError] = useState('')
    const [isLoggingOut, setIsLoggingOut] = useState(false)
    const navigate = useNavigate()

    async function handleLogout() {
        setIsLoggingOut(true)
        setLogoutError('')

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/logout`, {
                method: 'POST',
                credentials: 'include',
            })

            if (!response.ok) {
                throw new Error('Logout failed. Please try again.')
            }

            navigate('/login', { replace: true })
        } catch (error) {
            setLogoutError(error.message)
        } finally {
            setIsLoggingOut(false)
        }
    }

    return (
        <header className="topbar">
            <Link to="/todos" className="brand" aria-label="Todolist home">
                <span>DayList</span>
            </Link>
            <div className="topbar-actions">
               <div className="profile-menu-wrapper">
    <button
        className="avatar-button"
        type="button"
        aria-label="User profile"
        aria-expanded={isMenuOpen}
        aria-controls="profile-menu"
        onClick={() => setIsMenuOpen((open) => !open)}
    >
        {(firstName?.[0]?.toUpperCase()) || '…'}
    </button>

    {isMenuOpen && (
        <div className="profile-menu" id="profile-menu">

            {logoutError && (
                <p className="profile-menu-error" role="alert">
                    {logoutError}
                </p>
            )}

            <button
                className="profile-menu-logout"
                type="button"
                onClick={handleLogout}
                disabled={isLoggingOut}
            >
                {isLoggingOut ? 'Logging out…' : 'Log out'}
            </button>
        </div>
            )}
            </div>
            </div>
        </header>
    )
}