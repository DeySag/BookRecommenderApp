export interface Book {
  isbn13: string;
  isbn10: string;
  title: string;
  subtitle: string;
  authors: string;
  categories: string;
  thumbnail: string;
  description: string;
  published_year: number | string;
  average_rating: number | string;
  num_pages: number | string;
  ratings_count: number | string;
}
