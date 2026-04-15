import api from './axios';
import type { Product, ProductRequest, ProductPageResponse, ProductSearchParams } from '../types/product';

interface ApiWrapper<T> {
  status: number;
  message: string;
  data: T;
}

export const fetchProducts = async (): Promise<Product[]> => {
  const res = await api.get<ApiWrapper<Product[]>>('/products');
  return res.data.data;
};

export const fetchProduct = async (id: number): Promise<Product> => {
  const res = await api.get<ApiWrapper<Product>>(`/products/${id}`);
  return res.data.data;
};

export const createProduct = async (req: ProductRequest): Promise<Product> => {
  const res = await api.post<ApiWrapper<Product>>('/products', req);
  return res.data.data;
};

export const updateProduct = async (id: number, req: ProductRequest): Promise<Product> => {
  const res = await api.put<ApiWrapper<Product>>(`/products/${id}`, req);
  return res.data.data;
};

export const deleteProduct = async (id: number): Promise<void> => {
  await api.delete(`/products/${id}`);
};

export const searchProducts = async (params: ProductSearchParams = {}): Promise<ProductPageResponse> => {
  const res = await api.get<ApiWrapper<ProductPageResponse>>('/products/search', { params });
  return res.data.data;
};

export const uploadProductImage = async (id: number, file: File): Promise<Product> => {
  const formData = new FormData();
  formData.append('file', file);
  const res = await api.post<ApiWrapper<Product>>(`/products/${id}/image`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data.data;
};
