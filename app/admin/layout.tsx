"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Verificar autenticación solo si no estamos en la página de login
    if (pathname !== "/admin/login") {
      checkAuth();
    }
  }, [pathname, router]);

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/admin/menu");
      if (!response.ok) {
        router.push("/admin/login");
      }
    } catch {
      router.push("/admin/login");
    }
  };

  return <>{children}</>;
}
