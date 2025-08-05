import { useState, useCallback } from 'react';
import { searchImages } from '../api/unsplash';

const useImages = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [currentTerm, setCurrentTerm] = useState('');
  const [hasMore, setHasMore] = useState(true);

  const fetchImages = useCallback(async (searchTerm) => {
    setCurrentTerm(searchTerm);
    setPage(1);
    setLoading(true);
    setError(null);
    setImages([]);
    try {
      const results = await searchImages(searchTerm, 1);
      setImages(results);
      setHasMore(results.length > 0);
    } catch (err) {
      setError('Failed to fetch images. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;

    const nextPage = page + 1;
    setPage(nextPage);
    setLoading(true);
    try {
      const results = await searchImages(currentTerm, nextPage);
      setImages(prevImages => [...prevImages, ...results]);
      setHasMore(results.length > 0);
    } catch (err) {
      setError('Failed to fetch more images. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [currentTerm, page, loading, hasMore]);

  return { images, loading, error, fetchImages, loadMore, hasMore };
};

export default useImages;
