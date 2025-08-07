  This project is a web application that allows users to search for, view, and sort images from the Unsplash
   API. It's a single-page application built with React.

  Core Functionality

   * Image Search: Users can type a search term into a search bar to find images. The default search is for
     "cats".
   * Image Display: Search results are displayed in a responsive grid of image cards.
   * Sorting: The search results can be sorted by relevance or other criteria provided by the Unsplash API.
   * Infinite Scroll: As the user scrolls down, they can click a "Load More" button to fetch and display more
     images for the current search query.
   * Image Modal: Clicking on an individual image opens a modal window to display a larger version of that
     image.

  Project Structure

  The project follows a standard create-react-app structure:

   * `public/index.html`: The main HTML file for the application.
   * `src/index.js`: The entry point of the React application.
   * `src/App.js`: The main application component that manages the overall layout and state.
   * `src/components/`: This directory contains reusable UI components:
       * SearchBar.js: The search input field.
       * SortBar.js: The control for sorting images.
       * ImageCard.js: The component for displaying a single image preview.
       * ImageModal.js: The modal for displaying a larger image.
   * `src/hooks/`: This directory contains custom React hooks:
       * useImages.js: A custom hook that encapsulates the logic for fetching images from the API, managing
         the image state, loading and error states, and pagination.
   * `src/api/`: This directory handles communication with external APIs:
       * unsplash.js: Contains the function to make requests to the Unsplash API using axios. It requires an
         Unsplash API key to be set as an environment variable (REACT_APP_UNSPLASH_ACCESS_KEY).

  How to Run the Project

  You can run, build, or test the application using the following npm scripts defined in package.json:

   * To start the development server: npm start
   * To create a production build: npm run build
   * To run the tests: npm test
