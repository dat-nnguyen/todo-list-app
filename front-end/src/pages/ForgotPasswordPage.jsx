import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AuthPromoPanel } from './LoginPage.jsx'
import { createForgotPasswordSubmitHandler } from '../features/auth/handleForgotPasswordSubmit.js'

export default function ForgotPasswordPage() {
    const [message, setMessage] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [requestSent, setRequestSent] = useState(false)
    const handleForgotPasswordSubmit = createForgotPasswordSubmitHandler({
        setMessage,
        setIsSubmitting,
        setRequestSent,
    })

    return (
        <main className="auth-page">
            <AuthPromoPanel />
            <section className="auth-content" aria-labelledby="forgot-password-title">
                <div className="auth-form-wrap">
                    <p className="auth-eyebrow">ACCOUNT RECOVERY</p>
                    <h1 id="forgot-password-title">Reset your password.</h1>
                    <p className="auth-intro">Enter your email to request a reset. Email verification will be added before passwords can be changed.</p>
                    <form className="auth-form" onSubmit={handleForgotPasswordSubmit}>
                        <label className="auth-field">
                            <span>Email address</span>
                            <input type="email" name="email" placeholder="you@example.com" autoComplete="email" required disabled={requestSent} />
                        </label>
                        {message && <p className="auth-feedback" role="status">{message}</p>}
                        <button className="auth-submit" type="submit" disabled={isSubmitting || requestSent}>
                            {isSubmitting ? 'Sending request…' : requestSent ? 'Request sent' : 'Send reset link'}
                            <span aria-hidden="true">↗</span>
                        </button>
                    </form>
                    <p className="auth-switch"><Link to="/login">Back to log in</Link></p>
                </div>
            </section>
        </main>
    )
}
