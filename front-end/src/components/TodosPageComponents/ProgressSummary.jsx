export function ProgressSummary({ done, total }) {
    return (
        <section className="progress-summary" aria-label="Task completion progress">
            <div className="progress-copy">
                <p><strong>{done} / {total}</strong><span>tasks done</span></p>
                <span className="progress-caption">Just keep going</span>
            </div>
            <div className="progress-track" role="progressbar" aria-valuenow={done} aria-valuemin="0" aria-valuemax={total}>
                {Array.from({ length: total }, (_, index) => (
                    <span className={index < done ? 'is-done' : ''} key={index} />
                ))}
            </div>
        </section>
    )
}
