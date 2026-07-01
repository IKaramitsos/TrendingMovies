import searchIcon from '../assets/search.svg';
import { useTranslation } from 'react-i18next';

const Search = ({ searchTerm, setSearchTerm, onClear }) => {
    const { t } = useTranslation();

    return (
        <div className="relative z-20 mt-0 w-full max-w-2xl rounded-3xl border border-white/10 bg-white/5 px-4 py-1">
            <div className="relative flex items-center">
                <img
                    src={searchIcon}
                    alt=""
                    className="pointer-events-none absolute left-2 h-5 w-5 opacity-70"
                />

                <input
                    type="text"
                    placeholder={t('search.placeholder')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-transparent py-2 pl-10 text-base text-white outline-none placeholder:text-light-200 sm:pr-10"
                />

                {searchTerm.trim() && (
                    <button
                        type="button"
                        className="absolute -right-1 flex h-8 w-8 items-center justify-center rounded-full text-lg text-light-200 transition-colors duration-200 hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
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