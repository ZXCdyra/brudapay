import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const url = request.nextUrl.pathname;

  // Проксируем все API запросы к Go бэкенду
  if (url.startsWith("/api/v1/")) {
    // Обработка preflight OPTIONS запросов
    if (request.method === "OPTIONS") {
      return new NextResponse(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization, X-API-Key, X-Signature",
          "Access-Control-Max-Age": "86400",
        },
      });
    }

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";
    const path = url.replace(/^\/api\/v1/, "");
    const targetUrl = `${backendUrl}/api/v1${path}`;

    const headers = new Headers(request.headers);
    
    // Получаем реальный IP из x-forwarded-for
    const forwardedFor = request.headers.get("x-forwarded-for") || "";
    const realIp = forwardedFor.split(",")[0].trim();
    
    headers.set("X-Forwarded-Host", request.headers.get("host") || "");
    headers.set("X-Forwarded-For", realIp);
    headers.set("X-Forwarded-Proto", request.headers.get("x-forwarded-proto") || "https");

    // Проксируем Authorization заголовок
    const authHeader = request.headers.get("authorization");
    if (authHeader) {
      headers.set("Authorization", authHeader);
    }

    const body = request.method !== "GET" && request.method !== "HEAD" ? request.body : undefined;

    try {
      const response = await fetch(targetUrl, {
        method: request.method,
        headers,
        body,
        redirect: "follow",
      });

      const responseHeaders = new Headers(response.headers);
      responseHeaders.set("Access-Control-Allow-Origin", "*");
      responseHeaders.set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
      responseHeaders.set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-API-Key, X-Signature, X-Forwarded-Host, X-Forwarded-For, X-Forwarded-Proto");

      return new NextResponse(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders,
      });
    } catch (error) {
      console.error("[Proxy Error]", error);
      return NextResponse.json(
        { error: "Backend unavailable" },
        { status: 502 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/v1/:path*"],
};
