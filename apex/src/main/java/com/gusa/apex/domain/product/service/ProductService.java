package com.gusa.apex.domain.product.service;

import com.gusa.apex.domain.product.dto.ProductPageResponse;
import com.gusa.apex.domain.product.dto.ProductRequest;
import com.gusa.apex.domain.product.dto.ProductResponse;
import com.gusa.apex.domain.product.dto.ProductSearchRequest;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface ProductService {

    ProductResponse createProduct(ProductRequest request);

    ProductResponse updateProduct(Long id, ProductRequest request);

    void deleteProduct(Long id);

    ProductResponse getProduct(Long id);

    List<ProductResponse> getAllProducts();

    ProductPageResponse searchProducts(ProductSearchRequest condition);

    ProductResponse uploadImage(Long id, MultipartFile file);
}
