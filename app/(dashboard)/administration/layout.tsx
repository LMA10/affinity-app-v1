"use client";
import { withAuth } from "@/lib/hoc/withAuth"

const AdministrationLayoutComponent = function AdministrationLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export default withAuth(AdministrationLayoutComponent, { adminOnly: true }); 