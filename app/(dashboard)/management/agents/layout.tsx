"use client";
import { withAuth } from "@/lib/hoc/withAuth"

const ManagementAgentsLayoutComponent = function ManagementAgentsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export default withAuth(ManagementAgentsLayoutComponent, { adminOnly: true }); 