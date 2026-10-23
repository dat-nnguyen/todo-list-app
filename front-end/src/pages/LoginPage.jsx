import { useState } from 'react'
import './AuthPages.css'
import { Link, useNavigate } from 'react-router-dom'

export function AuthPromoPanel() {
    return (
        <aside className="auth-promo" aria-label="Daylist introduction">
            <div className="auth-promo-topline">
                <span>A LITTLE FOCUS. A LITTLE FREEDOM.</span>
            </div>
            <div className="auth-promo-copy">
                <h2>Make room<br />for you.</h2>
                <p>Your tasks, your plans, your pace. A simpler space for everything that matters today.</p>
            </div>
            <div className="auth-preview">
                <div className="auth-preview-heading">
                    <strong>Today.</strong>
                    <span>Make room for you</span>
                </div>
                <div className="auth-preview-task is-complete"><span className="preview-check">✓</span><span><strong>Go for a morning walk</strong><small>Wellness · 8:00 AM</small></span></div>
                <div className="auth-preview-task"><span className="preview-check" /><span><strong>Design homepage</strong><small>Work · 10:00 AM</small></span></div>
                <div className="auth-preview-task"><span className="preview-check" /><span><strong>Read 20 pages</strong><small>Personal · Anytime</small></span></div>
                <div className="preview-progress"><span /><span /><span /></div>
            </div>
            <div className="auth-promo-footer"><span>Small steps. Good days.</span><span aria-hidden="true">↗</span></div>
        </aside>
    )
}

export default function LoginPage() {
    const navigate = useNavigate()
    const [loginError, setLoginError] = useState('')

    async function handleSubmit(event) {
        event.preventDefault()
        const formData = new FormData(event.currentTarget)
        setLoginError('')

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    email: formData.get('email'),
                    password: formData.get('password'),
                }),
            })

            const data = await response.json()
            if (!response.ok) {
                throw new Error(data?.error?.message || 'Login failed. Please try again.')
            }

            navigate('/todos')
        } catch (error) {
            setLoginError(error.message || 'Unable to log in. Please try again.')
        }
    }

    return (
        <main className="auth-page">
            <AuthPromoPanel />
            <section className="auth-content" aria-labelledby="login-title">
                <div className="auth-form-wrap">
                    <p className="auth-eyebrow">YOUR DAY, YOUR WAY</p>
                    <h1 id="login-title">Welcome back.</h1>
                    <p className="auth-intro">A fresh day. A little focus. Let’s pick up where you left off.</p>
                    <form className="auth-form" onSubmit={handleSubmit}>
                        <label className="auth-field">
                            <span>Email address</span>
                            <input type="email" name="email" placeholder="you@example.com" autoComplete="email" required />
                        </label>
                        <label className="auth-field">
                            <span>Password</span>
                            <input type="password" name="password" placeholder="Enter your password" autoComplete="current-password" required />
                        </label>
                        <div className="auth-form-options">
                            <Link to="/forgot-password">Forgot password?</Link>
                        </div>
                        {loginError && <p className="auth-feedback" role="alert">{loginError}</p>}
                        <button className="auth-submit" type="submit">Log in <span aria-hidden="true">↗</span></button>
                    </form>
                    <p className="auth-switch">New to daylist? <Link to="/register">Create an account</Link></p>
                </div>
            </section>
        </main>
    )
}
