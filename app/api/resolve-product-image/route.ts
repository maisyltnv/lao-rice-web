import { NextRequest, NextResponse } from "next/server";
import { isKommodoShareUrl } from "@/lib/product-image";

function extractDirectImageFromKommodoHtml(html: string): string | null {
  const og = html.match(
    /property=["']og:image["'][^>]*content=["']([^"']+)["']|content=["']([^"']+)["'][^>]*property=["']og:image["']/i
  );
  if (og) return og[1] ?? og[2] ?? null;

  const preload = html.match(
    /rel=["']preload["'][^>]*as=["']image["'][^>]*href=["']([^"']+)["']/i
  );
  if (preload?.[1]) return preload[1];

  const nextData = html.match(/"imageUrl":"(https:\/\/plain-apac-prod-public[^"]+)"/);
  if (nextData?.[1]) return nextData[1].replace(/\\u002F/g, "/");

  return null;
}

/** GET /api/resolve-product-image?url=... — ຊອກຫາ URL ຮູບໂດຍກົງຈາກໜ້າແບ່ງ Kommodo */
export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url")?.trim();
  if (!url) {
    return NextResponse.json({ error: "missing url" }, { status: 400 });
  }

  if (!isKommodoShareUrl(url)) {
    return NextResponse.json({ directUrl: url });
  }

  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; LaoRiceWeb/1.0; +image-resolver)",
        Accept: "text/html",
      },
      next: { revalidate: 3600 },
    });
    if (!res.ok) {
      return NextResponse.json({ directUrl: url });
    }
    const html = await res.text();
    const direct = extractDirectImageFromKommodoHtml(html);
    if (direct) {
      return NextResponse.json({ directUrl: direct });
    }
  } catch {
    /* fall through */
  }

  return NextResponse.json({ directUrl: url });
}
