import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const url = request.nextUrl.pathname;

  if (!url.startsWith("/api/v1/")) {
    return NextResponse.next();
  }

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";
  const path = url.replace(/^\/api\/v1/, "");
  const targetUrl = `${backendUrl}/api/v1${path}`;

  const headers = new Headers();
  request.headers.forEach((value, key) => {
    if (key.toLowerCase() !== "host") {
      headers.set(key, value);
    }
  });
  headers.set("X-Forwarded-Host", request.headers.get("host") || "");
  headers.set("X-Forwarded-For", request.headers.get("x-forwarded-for") || "");
  headers.set("X-Forwarded-Proto", "https");

  const init: RequestInit = {
    method: request.method,
    headers,
    redirect: "follow",
  };

  if (request.method !== "GET" && request.method !== "HEAD") {
    const clonedBody = request.body;
    if (clonedBody) {
      init.body = clonedBody;
    }
  }

  try {
    const response = await fetch(targetUrl, init);
    const responseHeaders = new Headers(response.headers);
    responseHeaders.set("Access-Control-Allow-Origin", "*");
    responseHeaders.set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
    responseHeaders.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    return new NextResponse(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error("[Proxy Error]", error);
    return NextResponse.json(
      { success: false, error: { code: "BACKEND_ERROR", message: "Backend unavailable" } },
      { status: 502 }
    );
  }
}

export const config = {
  matcher: ["/api/v1/:path*"],
};
