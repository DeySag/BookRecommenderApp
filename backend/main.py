from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from recommender import BookRecommender
import os

app = FastAPI()

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize recommender with data
data_path = os.path.join(os.path.dirname(__file__), "..", "data", "books.csv")
recommender = BookRecommender(data_path)

@app.get("/")
def read_root():
    return {"message": "Welcome to the Semantic Book Recommender API"}

@app.get("/books")
def get_books(page: int = 1, limit: int = 20):
    return recommender.get_all_books(page, limit)

@app.get("/books/search")
def search_books(query: str):
    # This remains the simple keyword search
    return recommender.search_books(query)

@app.get("/books/recommend/semantic")
def recommend_semantic(query: str = Query(..., description="Natural language description of what you're looking for")):
    """
    Advanced semantic search that understands intent and context.
    """
    try:
        recommendations = recommender.semantic_search(query)
        return recommendations
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/books/recommendations/{title}")
def get_recommendations(title: str):
    # Content-based recommendations based on a specific book
    recommendations = recommender.get_recommendations(title)
    if not recommendations:
        raise HTTPException(status_code=404, detail="Book not found or no recommendations available")
    return recommendations

@app.get("/books/details/{title}")
def get_book_details(title: str):
    book = recommender.get_book_by_title(title)
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    return book

if __name__ == "__main__":
    import uvicorn
    # Pre-loading is done during BookRecommender init
    uvicorn.run(app, host="0.0.0.0", port=8000)
