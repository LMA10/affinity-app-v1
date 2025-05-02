"use client";
import { withAuth } from "@/lib/hoc/withAuth"

const DashboardSectionLayoutComponent = function DashboardSectionLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export default withAuth(DashboardSectionLayoutComponent); 