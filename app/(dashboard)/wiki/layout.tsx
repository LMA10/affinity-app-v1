"use client";
import { withAuth } from "@/lib/hoc/withAuth"

const WikiLayoutComponent = function WikiLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export default withAuth(WikiLayoutComponent); 