New features and styling have been added. (README will be updated ASAP)

# Trending Movies

A modern React movie discovery app that lets users search for movies, browse popular titles, and explore detailed information about each film in a clean modal interface.

## Features

- Search for movies with debounced input for a smoother user experience
- Browse the most popular movies currently available
- Open a detailed movie modal with:
  - runtime
  - genres
  - spoken languages
  - rating
  - overview
  - US and Greece release dates
  - certification
  - watch providers
  - trailer link when available
- View trending searched movies powered by Appwrite
- Responsive UI built for desktop and mobile

## Tech Stack

- React
- Vite
- TMDb API
- Appwrite
- Tailwind CSS

## Project Structure

```bash
src/
  components/
    MovieCard.jsx
    MovieModal.jsx
    Search.jsx
    Spinner.jsx
  App.jsx
  appwrite.js
  tmdb.js
  index.css
  main.jsx
public/
```

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/IKaramitsos/TrendingMovies.git
cd TrendingMovies
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create your environment variables

Create a `.env.local` file in the root of the project and add:

```env
VITE_TMDB_API_KEY=your_tmdb_read_access_token
VITE_APPWRITE_PROJECT_ID=your_appwrite_project_id
VITE_APPWRITE_DATABASE_ID=your_appwrite_database_id
VITE_APPWRITE_TABLE_ID=your_appwrite_table_id
```

## Running the project

Start the development server:

```bash
npm run dev
```

## How it works

The app fetches movie data from TMDb. When the user searches for a movie, the input is debounced before sending the request, which reduces unnecessary API calls and improves performance.

Popular movies are loaded by default when no search query is entered. When a movie card is selected, the app fetches extra details such as release dates, providers, spoken languages, and trailer data to display inside the modal.

Appwrite is used to store and update search counts, allowing the app to show trending searched movies based on actual user activity.

## Screenshots

<img width="1890" height="905" alt="image" src="https://github.com/user-attachments/assets/5233ab9f-252b-4bf2-9738-ee712da06e72" />
<img width="1890" height="905" alt="image" src="https://github.com/user-attachments/assets/7538df30-d66d-4349-976a-97ddce0966e2" />

## Future Improvements

- Add pagination for browsing more popular movies
- Add genre filtering
- Add sorting options
- Improve accessibility and keyboard navigation further
- Search outcomes (release date newest to oldest)
- Trending posters clickable (Modals)

## Lessons Learned

This project helped strengthen skills in:
- API integration
- React state management
- conditional rendering
- asynchronous data fetching
- modal UX patterns
- working with external services like Appwrite

## License

This project is for educational and portfolio purposes.
