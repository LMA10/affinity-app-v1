"use client";
import { withAuth } from "@/lib/hoc/withAuth"

const AnalyticsLayoutComponent = function AnalyticsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export default withAuth(AnalyticsLayoutComponent, { adminOnly: true }); 