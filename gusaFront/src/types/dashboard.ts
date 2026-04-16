export interface MonthlyGradeSales {
  month: number;
  gradeCategory: string;
  quantity: number;
}

export interface DashboardStats {
  todayOrderCount: number;
  monthlyRevenue: number;
  totalUsers: number;
  totalProducts: number;
  monthlyGradeSales: MonthlyGradeSales[];
}
