import React, { useState } from 'react';

const SearchBar = ({ onSubmit }) => {
  const [term, setTerm] = useState('');

  const onFormSubmit = (event) => {
    event.preventDefault();
    onSubmit(term);
  };

  return (
    <div className="search-bar">
      <form onSubmit={onFormSubmit}>
        <input
          type="text"
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder="Search for images..."
        />
      </form>
    </div>
  );
};

export default SearchBar;
