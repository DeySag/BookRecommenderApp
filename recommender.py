import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sentence_transformers import SentenceTransformer
from groq import Groq
import os
import numpy as np
from dotenv import load_dotenv

load_dotenv()

class BookRecommender:
    def __init__(self, csv_path):
        self.df = pd.read_csv(csv_path)
        self.df = self.df.fillna('')
        
        # Metadata content for keyword matching
        self.df['content'] = self.df['title'] + ' ' + self.df['authors'] + ' ' + self.df['categories'] + ' ' + self.df['description']
        
        # Initialize TF-IDF for fallback/title-based recommendations
        self.tfidf = TfidfVectorizer(stop_words='english')
        self.tfidf_matrix = self.tfidf.fit_transform(self.df['content'])
        self.cosine_sim = cosine_similarity(self.tfidf_matrix, self.tfidf_matrix)
        
        # Initialize Sentence Transformer for semantic search
        # Using a lightweight but effective model
        self.model = SentenceTransformer('all-MiniLM-L6-v2')
        
        # Pre-compute embeddings for book descriptions
        # We combine title and description for better context
        print("Computing semantic embeddings for books...")
        descriptions = (self.df['title'] + ": " + self.df['description']).tolist()
        self.embeddings = self.model.encode(descriptions, show_progress_bar=True)
        
        # Initialize Groq Client
        self.groq_key = os.getenv("GROQ_API_KEY", "")
        self.client = Groq(api_key=self.groq_key) if self.groq_key else None

    def get_recommendations(self, title, top_n=5):
        if title not in self.df['title'].values:
            return []
        
        idx = self.df[self.df['title'] == title].index[0]
        sim_scores = list(enumerate(self.cosine_sim[idx]))
        sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)
        sim_scores = sim_scores[1:top_n+1]
        
        book_indices = [i[0] for i in sim_scores]
        return self.df.iloc[book_indices].to_dict('records')

    def search_books(self, query, top_n=10):
        # Basic keyword search
        results = self.df[
            self.df['title'].str.contains(query, case=False) |
            self.df['authors'].str.contains(query, case=False) |
            self.df['categories'].str.contains(query, case=False)
        ]
        return results.head(top_n).to_dict('records')

    def semantic_search(self, user_query, top_n=5):
        """
        Interprets natural language queries using Groq (if available)
        and finds matching books using semantic embeddings.
        """
        refined_query = user_query
        
        # Use Groq to refine the query if available
        if self.client:
            try:
                chat_completion = self.client.chat.completions.create(
                    messages=[
                        {
                            "role": "system",
                            "content": "You are a book recommendation assistant. Your task is to extract key themes, genres, and moods from a user's request to create a highly descriptive search query for a semantic search engine. Focus on descriptive nouns and adjectives. Output only the refined query."
                        },
                        {
                            "role": "user",
                            "content": user_query,
                        }
                    ],
                    model="llama3-8b-8192",
                )
                refined_query = chat_completion.choices[0].message.content
                print(f"Refined Query: {refined_query}")
            except Exception as e:
                print(f"Groq API error: {e}. Falling back to original query.")

        # Compute query embedding
        query_embedding = self.model.encode([refined_query])
        
        # Compute cosine similarity between query and all books
        # self.embeddings is (N, D), query_embedding is (1, D)
        similarities = cosine_similarity(query_embedding, self.embeddings)[0]
        
        # Get top indices
        top_indices = np.argsort(similarities)[::-1][:top_n]
        
        return self.df.iloc[top_indices].to_dict('records')

    def get_all_books(self, page=1, limit=20):
        start = (page - 1) * limit
        end = start + limit
        return self.df.iloc[start:end].to_dict('records')

    def get_book_by_title(self, title):
        book = self.df[self.df['title'] == title]
        if book.empty:
            return None
        return book.iloc[0].to_dict()
