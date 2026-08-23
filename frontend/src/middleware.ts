import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const url = request.nextUrl.pathname;

  // Проксируем все API запросы к Go бэкенду
  if (url.startsWith("/api/v1/")) {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";
    const path = url.replace(/^\/api\/v1/, "");
    const targetUrl = `${backendUrl}/api/v1${path}`;

    const headers = new Headers();
    request.headers.forEach((value, key) => {
      if (key !== "host") {
        headers.set(key, value);
      }
    });
    headers.set("X-Forwarded-Host", request.headers.get("host") || "");
    headers.set("X-Forwarded-For", request.headers.get("x-forwarded-for") || request.ip || "");
    headers.set("X-Forwarded-Proto", "https");

    const body = request.method !== "GET" && request.method !== "HEAD" ? request.body : undefined;

    try {
      const response = await fetch(targetUrl, {
        method: request.method,
        headers,
        body,
      });

      // Пропускаем body как stream без чтения
      return new NextResponse(response.body, {
        status: response.status,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
      });
    } catch (error) {
      console.error("[Proxy Error]", error);
      return NextResponse.json(
        { success: false, error: { code: "BACKEND_ERROR", message: "Backend unavailable" } },
        { status: 502 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/v1/:path*"],
};
