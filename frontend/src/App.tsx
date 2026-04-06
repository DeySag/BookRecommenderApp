import React, { useState, useEffect } from 'react';
import './App.css';
import { Book } from './types';
import BookCard from './components/BookCard';
import SearchBar from './components/SearchBar';
import BookDetails from './components/BookDetails';

const API_BASE_URL = process.env.REACT_APP_API_URL || 
  (process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:8000');

function App() {
  const [books, setBooks] = useState<Book[]>([]);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [recommendations, setRecommendations] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchKey, setSearchKey] = useState(0); // Used to force reset SearchBar
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('theme') as 'light' | 'dark') || 'light';
  });

  useEffect(() => {
    fetchBooks();
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const fetchBooks = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/books?limit=20`);
      const data = await response.json();
      setBooks(data);
    } catch (err) {
      setError('Failed to fetch books. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query: string, mode: 'keyword' | 'semantic') => {
    if (!query) {
      handleReset();
      return;
    }
    setLoading(true);
    setError(null);
    setIsSearching(true);
    try {
      const endpoint = mode === 'keyword' ? '/books/search' : '/books/recommend/semantic';
      const response = await fetch(`${API_BASE_URL}${endpoint}?query=${encodeURIComponent(query)}`);
      if (!response.ok) throw new Error('Request failed');
      const data = await response.json();
      setBooks(data);
      setSelectedBook(null);
    } catch (err) {
      setError(`Search failed. Make sure your API key is configured if using Semantic Search.`);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setIsSearching(false);
    setSelectedBook(null);
    setSearchKey(prev => prev + 1); // Reset SearchBar internal state
    fetchBooks();
  };

  const handleBookClick = async (title: string) => {
    setLoading(true);
    setError(null);
    try {
      // Get book details
      const detailRes = await fetch(`${API_BASE_URL}/books/details/${encodeURIComponent(title)}`);
      if (!detailRes.ok) throw new Error('Failed to load book');
      const bookData = await detailRes.json();
      setSelectedBook(bookData);

      // Get recommendations
      const recRes = await fetch(`${API_BASE_URL}/books/recommendations/${encodeURIComponent(title)}`);
      if (recRes.ok) {
        const recData = await recRes.json();
        setRecommendations(recData);
      } else {
        setRecommendations([]);
      }
      
      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError('Failed to load book details');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <button className="theme-toggle" onClick={toggleTheme}>
          {theme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode'}
        </button>
        <div className="header-content">
          <h1 onClick={handleReset} style={{ cursor: 'pointer' }}>
            Semantic Book Recommender
          </h1>
          <p className="subtitle">Interpret moods, themes, and natural language descriptions</p>
          <SearchBar key={searchKey} onSearch={handleSearch} />
          {isSearching && !selectedBook && (
            <button className="clear-search-btn" onClick={handleReset}>
              ✕ Clear Search & View All Books
            </button>
          )}
        </div>
      </header>

      <main className="main-content">
        {loading && (
          <div className="loading-container">
            <div className="loader"></div>
            <p>Scanning the library...</p>
          </div>
        )}
        
        {error && <div className="error-message">{error}</div>}

        {!loading && !error && (
          selectedBook ? (
            <BookDetails 
              book={selectedBook} 
              recommendations={recommendations} 
              onBack={() => setSelectedBook(null)}
              onBookClick={handleBookClick}
            />
          ) : (
            <>
              {books.length === 0 ? (
                <div className="no-results">No books found matching your request. Try a different query.</div>
              ) : (
                <div className="books-grid">
                  {books.map(book => (
                    <BookCard key={book.isbn13 || book.title} book={book} onClick={handleBookClick} />
                  ))}
                </div>
              )}
            </>
          )
        )}
      </main>
      
      <footer className="app-footer">
        <p>© 2026 Semantic Recommender Powered by Groq LLM & Transformers</p>
      </footer>
    </div>
  );
}

export default App;
