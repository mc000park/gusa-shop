export interface Product {
  id: number;
  title: string;
  subject: string;
  grade: string;
  price: number;
  originalPrice: number;
  author: string;
  publisher: string;
  publishedDate: string;
  pages: number;
  isbn: string;
  description: string;
  tableOfContents: string[];
  badge: string;
  isNew: boolean;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProductPageResponse {
  content: Product[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
}

export interface ProductSearchParams {
  keyword?: string;
  subject?: string;
  grade?: string;
  isNew?: boolean;
  hasBadge?: boolean;
  page?: number;
  size?: number;
}

export interface ProductRequest {
  title: string;
  subject: string;
  grade: string;
  price: number;
  originalPrice: number;
  author: string;
  publisher: string;
  publishedDate: string;
  pages: number;
  isbn: string;
  description: string;
  tableOfContents: string[];
  badge: string;
  isNew: boolean;
}
