export function createLoginSubmitHandler({ setLoginError, navigate }) {
    return async function handleLoginSubmit(event) {
        event.preventDefault()
        const formData = new FormData(event.currentTarget)
        setLoginError('')

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
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
}
