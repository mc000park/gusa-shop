package com.gusa.apex.domain.order.repository;

import com.gusa.apex.domain.order.entity.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
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

    /** 특정 기간 주문 수 */
    long countByCreatedAtBetween(LocalDateTime from, LocalDateTime to);

    /** 특정 기간 + 상태별 매출 합계 */
    @Query("SELECT COALESCE(SUM(o.finalAmount), 0) FROM Order o WHERE o.createdAt BETWEEN :from AND :to AND o.status IN ('PAID', 'DELIVERED', 'SHIPPING')")
    long sumRevenueByPeriod(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to);

    /** 특정 연도의 월별 학년별 판매량 */
    @Query(value = """
        SELECT
          MONTH(o.created_at) AS month,
          CASE
            WHEN p.grade LIKE '초등%' THEN '초등'
            WHEN p.grade LIKE '중등%' THEN '중등'
            WHEN p.grade LIKE '고등%' THEN '고등'
            ELSE '기타'
          END AS grade_category,
          COALESCE(SUM(oi.quantity), 0) AS quantity
        FROM orders o
        JOIN order_items oi ON oi.order_id = o.id
        JOIN products p ON p.id = oi.product_id
        WHERE YEAR(o.created_at) = :year
          AND o.status IN ('PAID', 'DELIVERED', 'SHIPPING')
        GROUP BY month, grade_category
        ORDER BY month
        """, nativeQuery = true)
    List<Object[]> findMonthlyGradeSales(@Param("year") int year);
}
