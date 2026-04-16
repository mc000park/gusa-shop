package com.gusa.apex.domain.dashboard.dto;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class DashboardResponse {

    private long todayOrderCount;
    private long monthlyRevenue;
    private long totalUsers;
    private long totalProducts;
    private List<MonthlyGradeSales> monthlyGradeSales;

    @Getter
    @Builder
    public static class MonthlyGradeSales {
        private int month;
        private String gradeCategory;
        private long quantity;
    }
}
