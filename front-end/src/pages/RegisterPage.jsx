import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AuthPromoPanel } from './LoginPage.jsx'

export default function RegisterPage() {
    const [passwordError, setPasswordError] = useState('')

    function handleSubmit(event) {
        event.preventDefault()
        const formData = new FormData(event.currentTarget)
        const password = formData.get('password')
        const confirmPassword = formData.get('confirmPassword')

        if (password !== confirmPassword) {
            setPasswordError('Passwords do not match.')
            return
        }

        setPasswordError('')
        // Registration API submission can continue here.
    }

    return (
        <main className="auth-page">
            <AuthPromoPanel />
            <section className="auth-content" aria-labelledby="register-title">
                <div className="auth-form-wrap">
                    <p className="auth-eyebrow">A LITTLE FOCUS. A LITTLE FREEDOM.</p>
                    <h1 id="register-title">Your day starts here.</h1>
                    <p className="auth-intro">Create an account. Make space for what matters.</p>
                    <form className="auth-form" onSubmit={handleSubmit}>
                        <label className="auth-field">
                            <span>First name</span>
                            <input type="text" name="first_name" placeholder="First name" autoComplete="given-name" required />
                        </label>
                        <label className="auth-field">
                            <span>Last name</span>
                            <input type="text" name="last_name" placeholder="Last name" autoComplete="family-name" required />
                        </label>
                        <label className="auth-field">
                            <span>Email address</span>
                            <input type="email" name="email" placeholder="you@example.com" autoComplete="email" required />
                        </label>
                        <label className="auth-field">
                            <span>Password</span>
                            <input type="password" name="password" placeholder="Create a password" autoComplete="new-password" minLength={8} required />
                            <small>At least 8 characters, including 1 uppercase, 1 number, and 1 special character.</small>
                        </label>
                        <label className="auth-field">
                            <span>Confirm password</span>
                            <input type="password" name="confirmPassword" placeholder="Confirm your password" autoComplete="new-password" minLength={8} required />
                        </label>
                        {passwordError && <p className="auth-feedback" role="alert">{passwordError}</p>}
                        <button className="auth-submit" type="submit">Create account <span aria-hidden="true">↗</span></button>
                    </form>
                    <p className="auth-switch">Already have an account? <Link to="/login">Log in</Link></p>
                </div>
            </section>
        </main>
    )
}
