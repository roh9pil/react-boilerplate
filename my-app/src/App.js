import React, { useState, useEffect } from 'react';
import useImages from './hooks/useImages';
import SearchBar from './components/SearchBar';
import ImageCard from './components/ImageCard';
import styles from './App.module.css';

const App = () => {
  const [term, setTerm] = useState('cats');
  const { images, loading, error, fetchImages } = useImages();

  useEffect(() => {
    if (term) {
      fetchImages(term);
    }
  }, [term, fetchImages]);

  const renderContent = () => {
    if (loading) {
      return <p>Loading...</p>;
    }
    if (error) {
      return <p>{error}</p>;
    }
    return (
      <div className={styles.imageGrid}>
        {images.map((image) => (
          <ImageCard key={image.id} image={image} />
        ))}
      </div>
    );
  };

  return (
    <div className={styles.app}>
      <SearchBar onSubmit={setTerm} />
      {renderContent()}
    </div>
  );
};

export default App;
