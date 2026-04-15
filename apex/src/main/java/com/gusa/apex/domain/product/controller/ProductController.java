package com.gusa.apex.domain.product.controller;

import com.gusa.apex.domain.product.dto.ProductPageResponse;
import com.gusa.apex.domain.product.dto.ProductRequest;
import com.gusa.apex.domain.product.dto.ProductResponse;
import com.gusa.apex.domain.product.dto.ProductSearchRequest;
import com.gusa.apex.domain.product.service.ProductService;
import com.gusa.apex.global.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<ProductResponse> createProduct(@RequestBody @Valid ProductRequest request) {
        return ApiResponse.success(productService.createProduct(request));
    }

    @PutMapping("/{id}")
    public ApiResponse<ProductResponse> updateProduct(
            @PathVariable Long id,
            @RequestBody @Valid ProductRequest request) {
        return ApiResponse.success(productService.updateProduct(id, request));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
    }

    @GetMapping("/{id}")
    public ApiResponse<ProductResponse> getProduct(@PathVariable Long id) {
        return ApiResponse.success(productService.getProduct(id));
    }

    @GetMapping
    public ApiResponse<List<ProductResponse>> getAllProducts() {
        return ApiResponse.success(productService.getAllProducts());
    }

    @PostMapping("/{id}/image")
    public ApiResponse<ProductResponse> uploadImage(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file) {
        return ApiResponse.success(productService.uploadImage(id, file));
    }

    @GetMapping("/search")
    public ApiResponse<ProductPageResponse> searchProducts(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String subject,
            @RequestParam(required = false) String grade,
            @RequestParam(required = false) Boolean isNew,
            @RequestParam(required = false) Boolean hasBadge,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "12") int size) {

        ProductSearchRequest condition = new ProductSearchRequest();
        condition.setKeyword(keyword);
        condition.setSubject(subject);
        condition.setGrade(grade);
        condition.setIsNew(isNew);
        condition.setHasBadge(hasBadge);
        condition.setPage(page);
        condition.setSize(size);

        return ApiResponse.success(productService.searchProducts(condition));
    }
}
