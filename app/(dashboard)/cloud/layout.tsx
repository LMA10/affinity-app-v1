"use client";
import { withAuth } from "@/lib/hoc/withAuth"

const CloudLayoutComponent = function CloudLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export default withAuth(CloudLayoutComponent, { adminOnly: true }); 