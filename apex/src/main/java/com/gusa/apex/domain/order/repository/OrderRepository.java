package com.gusa.apex.domain.order.repository;

import com.gusa.apex.domain.order.entity.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long> {

    Optional<Order> findByOrderId(String orderId);

    Page<Order> findByUserIdOrderByCreatedAtDesc(String userId, Pageable pageable);

    @Query(
        value = """
            SELECT o FROM Order o
            WHERE (:keyword IS NULL OR
                   o.orderId       LIKE CONCAT('%', :keyword, '%') OR
                   o.userId        LIKE CONCAT('%', :keyword, '%') OR
                   o.recipientName LIKE CONCAT('%', :keyword, '%'))
              AND (:status IS NULL OR o.status = :status)
            ORDER BY o.createdAt DESC
        """,
        countQuery = """
            SELECT COUNT(o) FROM Order o
            WHERE (:keyword IS NULL OR
                   o.orderId       LIKE CONCAT('%', :keyword, '%') OR
                   o.userId        LIKE CONCAT('%', :keyword, '%') OR
                   o.recipientName LIKE CONCAT('%', :keyword, '%'))
              AND (:status IS NULL OR o.status = :status)
        """
    )
    Page<Order> searchOrders(
            @Param("keyword") String keyword,
            @Param("status") String status,
            Pageable pageable
    );
}
