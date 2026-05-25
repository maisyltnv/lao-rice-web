import { NextResponse } from "next/server";

const ALLOWED_HOSTS = new Set([
  "plain-apac-prod-public.komododecks.com",
  "kommodo-ai-prod-static.komododecks.com",
  "images.unsplash.com",
]);

export async function GET(request: Request) {
  const raw = new URL(request.url).searchParams.get("url");
  if (!raw?.trim()) {
    return NextResponse.json({ error: "missing url" }, { status: 400 });
  }

  let target: URL;
  try {
    target = new URL(raw.trim());
  } catch {
    return NextResponse.json({ error: "invalid url" }, { status: 400 });
  }

  if (target.protocol !== "https:" || !ALLOWED_HOSTS.has(target.hostname)) {
    return NextResponse.json({ error: "host not allowed" }, { status: 403 });
  }

  try {
    const upstream = await fetch(target.toString(), {
      headers: { Accept: "image/*" },
      next: { revalidate: 3600 },
    });

    if (!upstream.ok) {
      return NextResponse.json(
        { error: "upstream failed" },
        { status: upstream.status }
      );
    }

    const contentType = upstream.headers.get("content-type") ?? "image/png";
    if (!contentType.startsWith("image/")) {
      return NextResponse.json(
        { error: "not an image" },
        { status: 502 }
      );
    }

    const body = await upstream.arrayBuffer();
    return new NextResponse(body, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
      },
    });
  } catch {
    return NextResponse.json({ error: "fetch failed" }, { status: 502 });
  }
}
