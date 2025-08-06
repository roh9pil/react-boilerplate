import React, { useState, useEffect } from 'react';
import useImages from './hooks/useImages';
import SearchBar from './components/SearchBar';
import SortBar from './components/SortBar';
import ImageCard from './components/ImageCard';
import ImageModal from './components/ImageModal';
import styles from './App.module.css';

const App = () => {
  const [term, setTerm] = useState('cats');
  const [sortBy, setSortBy] = useState('relevant');
  const { images, loading, error, fetchImages, loadMore, hasMore } = useImages();
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    if (term) {
      fetchImages(term, sortBy);
    }
  }, [term, sortBy, fetchImages]);

  const handleImageClick = (image) => {
    setSelectedImage(image);
  };

  const handleCloseModal = () => {
    setSelectedImage(null);
  };

  const handleSortChange = (newSortBy) => {
    setSortBy(newSortBy);
  };

  const renderContent = () => {
    if (loading && images.length === 0) {
      return <p>Loading...</p>;
    }
    if (error) {
      return <p>{error}</p>;
    }
    return (
      <>
        <div className={styles.imageGrid}>
          {images.map((image) => (
            <ImageCard key={image.id} image={image} onImageClick={handleImageClick} />
          ))}
        </div>
        {loading && images.length > 0 && <p>Loading more...</p>}
        {hasMore && !loading && (
          <button onClick={loadMore} className={styles.loadMoreButton}>
            Load More
          </button>
        )}
      </>
    );
  };

  return (
    <div className={styles.app}>
      <SearchBar onSubmit={setTerm} />
      <SortBar onSortChange={handleSortChange} currentSort={sortBy} />
      {renderContent()}
      <ImageModal image={selectedImage} onClose={handleCloseModal} />
    </div>
  );
};

export default App;
