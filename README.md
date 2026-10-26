# Trending Movies

A modern movie discovery app built with React and Vite that lets users search for films, browse trending searches, explore popular titles, and open rich movie details in an accessible modal interface.

## Features

- Search for movies with debounced input for a smoother user experience
- Browse the most popular movies 
- Open a detailed movie modal with:
  - runtime
  - genres
  - spoken languages
  - rating
  - overview
  - US and GR release dates
  - certification
  - watch providers
  - trailer link when available
- Switch between English and Greek
- Responsive UI for desktop and mobile
- Improved keyboard accessibility with visible focus states for movie cards and modal actions
- Better modal usability with Escape support, focus management, and clearer keyboard navigation

## Tech Stack

- React
- Vite
- TMDb API
- Appwrite
- Tailwind CSS
- react-i18next
- reast-use

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
TMDB_ACCESS_TOKEN=your_tmdb_read_access_token
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

Appwrite is used to store and update search counts, allowing the app to show trending searched movies based on real user activity.

## Accessibility and UX

This project includes several usability improvements:

- Keyboard-friendly navigation with visible focus indicators
- Better movie card focus styling so keyboard users can clearly identify the selected card
- Accessible modal behavior with dialog semantics, focus control, and Escape-to-close support
- Improved labeling for icon-only controls
- Cleaner decorative image handling through appropriate `alt` usage

## Lessons Learned

This project helped strengthen skills in:

- API integration
- React state management
- conditional rendering
- asynchronous data fetching
- debounced search patterns
- modal UX and accessibility patterns
- Tailwind CSS architecture and utility-first styling
- working with external services like Appwrite
- responsive design and keyboard usability

## License

This project is for educational and portfolio purposes.
