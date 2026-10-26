export function TaskModalShell({ titleId, eyebrow, title, onClose, closeDisabled = false, children }) {
    return (
        <div
            className="add-task-modal-backdrop"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget && !closeDisabled) onClose?.()
            }}
        >
            <section className="add-task-modal" role="dialog" aria-modal="true" aria-labelledby={titleId}>
                <div className="add-task-modal-heading">
                    <div>
                        <p className="section-eyebrow">{eyebrow}</p>
                        <h2 id={titleId}>{title}</h2>
                    </div>
                    <button
                        className="add-task-modal-close"
                        type="button"
                        onClick={onClose}
                        aria-label="Close dialog"
                        disabled={closeDisabled}
                    >×</button>
                </div>
                {children}
            </section>
        </div>
    )
}
