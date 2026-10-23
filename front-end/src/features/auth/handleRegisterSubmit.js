export function createRegisterSubmitHandler({ setPasswordError, navigate }) {
    return async function handleRegisterSubmit(event) {
        event.preventDefault()
        const formData = new FormData(event.currentTarget)
        const password = formData.get('password')
        const confirmPassword = formData.get('confirmPassword')

        if (password !== confirmPassword) {
            setPasswordError('Passwords do not match.')
            return
        }

        setPasswordError('')

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    first_name: formData.get('first_name'),
                    last_name: formData.get('last_name'),
                    email: formData.get('email'),
                    password,
                }),
            })

            const data = await response.json()

            if (!response.ok) {
                const passwordMessages = data?.error?.details
                    ?.filter((issue) => issue.field === 'password')
                    .map((issue) => issue.message) ?? []

                if (passwordMessages.length) {
                    const hasCharacterRuleError = passwordMessages.some((message) =>
                        /uppercase letter|at least one number|special character/i.test(message),
                    )

                    setPasswordError(
                        hasCharacterRuleError
                            ? 'Password must contain at least one uppercase letter, one number, and one special character.'
                            : passwordMessages.join(' '),
                    )
                    return
                }

                throw new Error(data?.error?.message || 'Registration failed. Please try again.')
            }

            navigate('/login')
        } catch (error) {
            setPasswordError(error.message || 'Unable to register. Please try again.')
        }
    }
}