package com.gusa.apex.domain.product.repository;

import com.gusa.apex.domain.product.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {

    List<Product> findBySubject(String subject);

    @Query(value = """
            SELECT p FROM Product p
            WHERE (:keyword  IS NULL OR p.title     LIKE CONCAT('%', :keyword, '%')
                                     OR p.author    LIKE CONCAT('%', :keyword, '%')
                                     OR p.publisher LIKE CONCAT('%', :keyword, '%'))
              AND (:subject  IS NULL OR p.subject = :subject)
              AND (:grade    IS NULL OR p.grade   LIKE CONCAT('%', :grade, '%'))
              AND (:isNew    IS NULL OR p.isNew   = :isNew)
              AND (:hasBadge IS NULL OR :hasBadge = false
                                     OR (p.badge IS NOT NULL AND p.badge <> ''))
            ORDER BY p.createdAt DESC
            """,
            countQuery = """
            SELECT COUNT(p) FROM Product p
            WHERE (:keyword  IS NULL OR p.title     LIKE CONCAT('%', :keyword, '%')
                                     OR p.author    LIKE CONCAT('%', :keyword, '%')
                                     OR p.publisher LIKE CONCAT('%', :keyword, '%'))
              AND (:subject  IS NULL OR p.subject = :subject)
              AND (:grade    IS NULL OR p.grade   LIKE CONCAT('%', :grade, '%'))
              AND (:isNew    IS NULL OR p.isNew   = :isNew)
              AND (:hasBadge IS NULL OR :hasBadge = false
                                     OR (p.badge IS NOT NULL AND p.badge <> ''))
            """)
    Page<Product> search(
            @Param("keyword")  String keyword,
            @Param("subject")  String subject,
            @Param("grade")    String grade,
            @Param("isNew")    Boolean isNew,
            @Param("hasBadge") Boolean hasBadge,
            Pageable pageable
    );
}
