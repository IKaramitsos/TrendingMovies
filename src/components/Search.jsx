import searchIcon from '../assets/search.svg';
import { useTranslation } from 'react-i18next';

const Search = ({ searchTerm, setSearchTerm, onClear }) => {
    const { t } = useTranslation();

    return (
        <div className="search">
            <div>
                <img src={searchIcon} alt="Search" />

                <input
                    type="text"
                    placeholder={t('search.placeholder')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />

                {searchTerm.trim() && (
                    <button
                        type="button"
                        className="search-clear"
                        onClick={onClear}
                        aria-label={t('search.clear')}
                    >
                        ✖
                    </button>
                )}
            </div>
        </div>
    );
};

export default Search;