import { TimePicker } from './TimePicker.jsx'
import { StatusPicker } from './StatusPicker.jsx'

export function TaskFormFields({
    defaultTitle = '',
    defaultDescription = '',
    defaultStatus = 'pending',
    defaultDueTime = '',
    idPrefix,
    titlePlaceholder = 'What needs to get done?',
    descriptionPlaceholder = 'Add a few details',
}) {
    return (
        <>
            <label className="task-form-field">
                <span>Title</span>
                <input
                    type="text"
                    name="title"
                    placeholder={titlePlaceholder}
                    defaultValue={defaultTitle}
                    maxLength={255}
                    required
                />
            </label>
            <label className="task-form-field">
                <span>Description <small>(Optional)</small></span>
                <textarea
                    name="description"
                    placeholder={descriptionPlaceholder}
                    defaultValue={defaultDescription}
                    maxLength={2000}
                    rows={3}
                />
            </label>
            <div className="task-form-row">
                <label className="task-form-field">
                    <span>Status</span>
                    <StatusPicker
                        name="status"
                        id={`${idPrefix}-status`}
                        defaultValue={defaultStatus}
                    />
                </label>
                <label className="task-form-field">
                    <span>Due time <small>(Optional)</small></span>
                    <TimePicker
                        name="dueTime"
                        id={`${idPrefix}-due-time`}
                        label="Choose due time"
                        defaultValue={defaultDueTime}
                    />
                </label>
            </div>
        </>
    )
}
