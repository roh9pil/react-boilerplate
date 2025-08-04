import { useState, useCallback } from 'react';
import { searchImages } from '../api/unsplash';

const useImages = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchImages = useCallback(async (searchTerm) => {
    setLoading(true);
    setError(null);
    setImages([]); // Clear previous images
    try {
      const results = await searchImages(searchTerm);
      setImages(results);
    } catch (err) {
      setError('Failed to fetch images. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, []);

  return { images, loading, error, fetchImages };
};

export default useImages;
