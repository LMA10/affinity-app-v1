"use client";
import { withAuth } from "@/lib/hoc/withAuth"

const LegalLayoutComponent = function LegalLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export default withAuth(LegalLayoutComponent); 