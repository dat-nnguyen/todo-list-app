export function SearchBar() {
    return (
        <div className="search-row">
            <label className="search-field" htmlFor="search">
                <span className="search-icon" aria-hidden="true">⌕</span>
                <input type="search" id="search" placeholder="Search your tasks..." />
                <kbd>⌘K</kbd>
            </label>
            <button className="filter-button" type="button" aria-label="Filter tasks">
                <span aria-hidden="true">☷</span>
                <span>Filter</span>
            </button>
        </div>
    )
}