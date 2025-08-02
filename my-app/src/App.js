import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SearchBar from './components/SearchBar';
import ImageCard from './components/ImageCard';

const App = () => {
  const [images, setImages] = useState([]);
  const [term, setTerm] = useState('cats');

  useEffect(() => {
    const search = async () => {
      const response = await axios.get('https://api.unsplash.com/search/photos', {
        headers: {
          Authorization: `Client-ID ${process.env.REACT_APP_UNSPLASH_ACCESS_KEY}`,
        },
        params: {
          query: term,
        },
      });
      setImages(response.data.results);
    };
    search();
  }, [term]);

  return (
    <div className="app">
      <SearchBar onSubmit={setTerm} />
      <div className="image-grid">
        {images.map((image) => (
          <ImageCard key={image.id} image={image} />
        ))}
      </div>
    </div>
  );
};

export default App;
