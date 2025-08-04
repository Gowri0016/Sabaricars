import React, { useState } from 'react';
import { FiSearch } from 'react-icons/fi';
import './Page.css';

const Search = ({ onSearch }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch && query.trim()) {
      onSearch(query.trim());
    }
  };

  return (
    <div className="search-page">
      <form className="search-bar" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Search vehicles..."
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
        <button type="submit"><FiSearch /></button>
      </form>
    </div>
  );
};

export default Search;
