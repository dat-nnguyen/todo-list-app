import { Link } from 'react-router-dom'
import { AuthPromoPanel } from './LoginPage.jsx'

export default function RegisterPage() {
    function handleSubmit(event) {
        event.preventDefault()
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
                            <span>Full name</span>
                            <input type="text" name="name" placeholder="Your name" autoComplete="name" required />
                        </label>
                        <label className="auth-field">
                            <span>Email address</span>
                            <input type="email" name="email" placeholder="you@example.com" autoComplete="email" required />
                        </label>
                        <label className="auth-field">
                            <span>Password</span>
                            <input type="password" name="password" placeholder="Create a password" autoComplete="new-password" minLength={8} required />
                            <small>Use at least 8 characters, including at least one number, one special character and one capital letter.</small>
                        </label>
                        <button className="auth-submit" type="submit">Create account <span aria-hidden="true">↗</span></button>
                    </form>
                    <p className="auth-switch">Already have an account? <Link to="/login">Log in</Link></p>
                </div>
            </section>
        </main>
    )
}
