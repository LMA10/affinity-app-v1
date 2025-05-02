"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/context/auth-context";
import { isUserAdmin } from "@/lib/state/userState/userState"

export function withAuth<P extends object>(WrappedComponent: React.ComponentType<P>, options?: { adminOnly?: boolean }) {
  return function WithAuthComponent(props: P) {
    const router = useRouter();
    const { isAuthenticated, isLoading, user } = useAuth();

    // Get current user and groups from localStorage
    let currentUser = null;
    let userGroups = {};
    if (typeof window !== "undefined") {
      try {
        const stored = JSON.parse(localStorage.getItem("currentUser") || "null");
        currentUser = stored?.[0] || null;
        userGroups = JSON.parse(localStorage.getItem("userGroups") || "{}") || {};
      } catch {}
    }
    const isAdmin = currentUser ? isUserAdmin(currentUser, userGroups) : false;

    useEffect(() => {
      if (!isLoading && !isAuthenticated) {
        router.replace("/login");
      }
    }, [isLoading, isAuthenticated, router]);

    if (isLoading || !isAuthenticated) {
      return (
        <div className="flex h-screen items-center justify-center bg-[#0a1419]">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div>
        </div>
      );
    }

    if (options?.adminOnly && !isAdmin) {
      if (typeof window !== "undefined") {
        router.replace("/unauthorized");
      }
      return null;
    }

    return <WrappedComponent {...props} />;
  };
} 