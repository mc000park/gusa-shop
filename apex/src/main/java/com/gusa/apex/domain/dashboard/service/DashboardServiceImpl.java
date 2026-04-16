package com.gusa.apex.domain.dashboard.service;

import com.gusa.apex.domain.dashboard.dto.DashboardResponse;
import com.gusa.apex.domain.order.repository.OrderRepository;
import com.gusa.apex.domain.product.repository.ProductRepository;
import com.gusa.apex.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    @Override
    @Transactional(readOnly = true)
    public DashboardResponse getStats() {
        LocalDate today = LocalDate.now();
        LocalDateTime dayStart = today.atStartOfDay();
        LocalDateTime dayEnd = today.plusDays(1).atStartOfDay();

        LocalDateTime monthStart = today.withDayOfMonth(1).atStartOfDay();

        long todayOrderCount = orderRepository.countByCreatedAtBetween(dayStart, dayEnd);
        long monthlyRevenue = orderRepository.sumRevenueByPeriod(monthStart, dayEnd);
        long totalUsers = userRepository.count();
        long totalProducts = productRepository.count();

        int year = today.getYear();
        List<Object[]> rawSales = orderRepository.findMonthlyGradeSales(year);
        List<DashboardResponse.MonthlyGradeSales> monthlyGradeSales = new ArrayList<>();

        for (Object[] row : rawSales) {
            int month = ((Number) row[0]).intValue();
            String gradeCategory = (String) row[1];
            long quantity = ((Number) row[2]).longValue();
            monthlyGradeSales.add(DashboardResponse.MonthlyGradeSales.builder()
                    .month(month)
                    .gradeCategory(gradeCategory)
                    .quantity(quantity)
                    .build());
        }

        return DashboardResponse.builder()
                .todayOrderCount(todayOrderCount)
                .monthlyRevenue(monthlyRevenue)
                .totalUsers(totalUsers)
                .totalProducts(totalProducts)
                .monthlyGradeSales(monthlyGradeSales)
                .build();
    }
}
