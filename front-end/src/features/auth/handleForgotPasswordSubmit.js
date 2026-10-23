export function createForgotPasswordSubmitHandler({
    setMessage,
    setIsSubmitting,
    setRequestSent,
}) {
    return async function handleForgotPasswordSubmit(event) {
        event.preventDefault()
        setMessage('')
        setIsSubmitting(true)

        try {
            const formData = new FormData(event.currentTarget)
            const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: formData.get('email') }),
            })
            const data = await response.json()

            if (!response.ok) {
                throw new Error(data?.error?.message || 'Unable to submit the request. Please try again.')
            }

            setRequestSent(true)
            setMessage(data.message || 'Request received. Email verification is not configured yet, so no password has been changed.')
        } catch (error) {
            setMessage(error.message || 'Unable to submit the request. Please try again.')
        } finally {
            setIsSubmitting(false)
        }
    }
}
