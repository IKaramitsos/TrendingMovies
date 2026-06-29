import searchIcon from '../assets/search.svg';

const Search = ({ searchTerm, setSearchTerm, onClear }) => {
    return (
        <div className="search">
            <div>
                <img src={searchIcon} alt="Search" />

                <input
                    type="text"
                    placeholder="Search through thousands of movies..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />

                {searchTerm.trim() && (
                    <button
                        type="button"
                        className="search-clear"
                        onClick={onClear}
                        aria-label="Clear search"
                    >
                        ✖
                    </button>
                )}
            </div>
        </div>
    );
};

export default Search;