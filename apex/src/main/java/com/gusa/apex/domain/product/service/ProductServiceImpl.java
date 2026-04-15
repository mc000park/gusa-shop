package com.gusa.apex.domain.product.service;

import com.gusa.apex.domain.product.dto.ProductPageResponse;
import com.gusa.apex.domain.product.dto.ProductRequest;
import com.gusa.apex.domain.product.dto.ProductResponse;
import com.gusa.apex.domain.product.dto.ProductSearchRequest;
import com.gusa.apex.domain.product.entity.Product;
import com.gusa.apex.domain.product.repository.ProductRepository;
import com.gusa.apex.global.exception.CustomException;
import com.gusa.apex.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;

    @Value("${upload.dir:./uploads/products}")
    private String uploadDir;

    @Value("${upload.url-prefix:/uploads/products}")
    private String urlPrefix;

    @Override
    @Transactional
    public ProductResponse createProduct(ProductRequest request) {
        Product product = Product.builder()
                .title(request.getTitle())
                .subject(request.getSubject())
                .grade(request.getGrade())
                .price(request.getPrice())
                .originalPrice(request.getOriginalPrice())
                .author(request.getAuthor())
                .publisher(request.getPublisher())
                .publishedDate(request.getPublishedDate())
                .pages(request.getPages())
                .isbn(request.getIsbn())
                .description(request.getDescription())
                .tableOfContents(tocToString(request))
                .badge(request.getBadge())
                .isNew(request.isNew())
                .build();

        return ProductResponse.from(productRepository.save(product));
    }

    @Override
    @Transactional
    public ProductResponse updateProduct(Long id, ProductRequest request) {
        Product product = findById(id);

        product.update(
                request.getTitle(),
                request.getSubject(),
                request.getGrade(),
                request.getPrice(),
                request.getOriginalPrice(),
                request.getAuthor(),
                request.getPublisher(),
                request.getPublishedDate(),
                request.getPages(),
                request.getIsbn(),
                request.getDescription(),
                tocToString(request),
                request.getBadge(),
                request.isNew()
        );

        return ProductResponse.from(product);
    }

    @Override
    @Transactional
    public void deleteProduct(Long id) {
        Product product = findById(id);
        productRepository.delete(product);
    }

    @Override
    @Transactional(readOnly = true)
    public ProductResponse getProduct(Long id) {
        return ProductResponse.from(findById(id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductResponse> getAllProducts() {
        return productRepository.findAll().stream()
                .map(ProductResponse::from)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public ProductPageResponse searchProducts(ProductSearchRequest condition) {
        String keyword = StringUtils.hasText(condition.getKeyword()) ? condition.getKeyword() : null;
        String subject = StringUtils.hasText(condition.getSubject()) ? condition.getSubject() : null;
        String grade   = StringUtils.hasText(condition.getGrade())   ? condition.getGrade()   : null;

        Page<Product> page = productRepository.search(
                keyword, subject, grade,
                condition.getIsNew(), condition.getHasBadge(),
                PageRequest.of(condition.getPage(), condition.getSize())
        );

        return ProductPageResponse.builder()
                .content(page.getContent().stream().map(ProductResponse::from).toList())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .page(page.getNumber())
                .size(page.getSize())
                .build();
    }

    @Override
    @Transactional
    public ProductResponse uploadImage(Long id, MultipartFile file) {
        Product product = findById(id);

        try {
            Path dir = Paths.get(uploadDir);
            Files.createDirectories(dir);

            String ext = StringUtils.getFilenameExtension(file.getOriginalFilename());
            String filename = UUID.randomUUID() + (ext != null ? "." + ext : "");
            Path dest = dir.resolve(filename);
            file.transferTo(dest);

            product.updateImage(urlPrefix + "/" + filename);
            log.info("[Product] 이미지 업로드 id={} url={}", id, product.getImageUrl());
            return ProductResponse.from(product);

        } catch (IOException e) {
            throw new RuntimeException("이미지 저장 실패", e);
        }
    }

    private Product findById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new CustomException(ErrorCode.PRODUCT_NOT_FOUND));
    }

    private String tocToString(ProductRequest request) {
        if (request.getTableOfContents() == null || request.getTableOfContents().isEmpty()) {
            return null;
        }
        return String.join("\n", request.getTableOfContents());
    }
}
