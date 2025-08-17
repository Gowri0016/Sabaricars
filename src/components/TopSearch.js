import React, { useState, useRef, useEffect } from 'react';
import './TopSearch.css';

function TopSearch({ onSearch, placeholder = 'Search vehicles by model, make or year...', autoFocus = false, initialTerm = '' }) {
  const [term, setTerm] = useState(initialTerm || '');
  const inputRef = useRef(null);

  useEffect(() => {
    if (initialTerm) setTerm(initialTerm);
  }, [initialTerm]);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
      // For some mobile browsers ensure keyboard shows by briefly selecting
      try { inputRef.current.select(); } catch (e) { /* noop */ }
    }
  }, [autoFocus]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch) onSearch(term.trim());
  };

  return (
    <form className="top-search" onSubmit={handleSubmit} role="search">
      <input
        ref={inputRef}
        className="top-search-input"
        type="search"
        aria-label="Search vehicles"
        placeholder={placeholder}
        value={term}
        onChange={(e) => setTerm(e.target.value)}
      />
      <button className="top-search-btn" type="submit" aria-label="Search">🔍</button>
    </form>
  );
}

export default TopSearch;
