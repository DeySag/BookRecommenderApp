import React, { useState } from 'react';

interface SearchBarProps {
  onSearch: (query: string, mode: 'keyword' | 'semantic') => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState<'keyword' | 'semantic'>('keyword');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    onSearch(query, mode);
  };

  return (
    <div className="search-container">
      <div className="search-mode-toggle">
        <button 
          className={mode === 'keyword' ? 'active' : ''} 
          onClick={() => setMode('keyword')}
        >
          Keyword Search
        </button>
        <button 
          className={mode === 'semantic' ? 'active' : ''} 
          onClick={() => setMode('semantic')}
        >
          Semantic Recommendation
        </button>
      </div>
      <form className="search-bar" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder={mode === 'keyword' ? "Search title, author, category..." : "Describe the mood, theme, or plot..."}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="search-input"
        />
        <button type="submit" className="search-button">
          {mode === 'keyword' ? 'Search' : 'Recommend'}
        </button>
      </form>
    </div>
  );
};

export default SearchBar;
