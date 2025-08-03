import React, { useState, useEffect, useCallback } from 'react';
import { searchImages } from './api/unsplash';
import SearchBar from './components/SearchBar';
import ImageCard from './components/ImageCard';

const App = () => {
  const [images, setImages] = useState([]);
  const [term, setTerm] = useState('cats');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchImages = useCallback(async (searchTerm) => {
    setLoading(true);
    setError(null);
    try {
      const results = await searchImages(searchTerm);
      setImages(results);
    } catch (err) {
      setError('Failed to fetch images. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchImages(term);
  }, [term, fetchImages]);

  const renderContent = () => {
    if (loading) {
      return <p>Loading...</p>;
    }
    if (error) {
      return <p>{error}</p>;
    }
    return (
      <div className="image-grid">
        {images.map((image) => (
          <ImageCard key={image.id} image={image} />
        ))}
      </div>
    );
  };

  return (
    <div className="app">
      <SearchBar onSubmit={setTerm} />
      {renderContent()}
    </div>
  );
};

export default App;
