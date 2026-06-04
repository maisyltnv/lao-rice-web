import { NextRequest, NextResponse } from "next/server";
import { isKommodoShareUrl } from "@/lib/product-image";

function extractOgImageUrlFromNextData(html: string): string | null | undefined {
  const block = html.match(
    /<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/
  );
  if (!block?.[1]) return undefined;
  try {
    const data = JSON.parse(block[1]) as {
      page?: string;
      props?: { pageProps?: { ogImageUrl?: string | null; initialData?: unknown } };
    };
    if (data.page !== "/i/[id]") return undefined;
    return data.props?.pageProps?.ogImageUrl ?? null;
  } catch {
    return undefined;
  }
}

function extractDirectImageFromKommodoHtml(html: string): string | null {
  const fromNextData = extractOgImageUrlFromNextData(html);
  if (fromNextData === null) return null;
  if (typeof fromNextData === "string" && fromNextData.trim()) {
    return fromNextData.trim();
  }

  const preload = html.match(
    /rel=["']preload["'][^>]*as=["']image["'][^>]*href=["']([^"']+)["']/i
  );
  if (preload?.[1] && !preload[1].includes("kommodo-og.jpg")) {
    return preload[1];
  }

  const nextData = html.match(/"imageUrl":"(https:\/\/plain-apac-prod-public[^"]+)"/);
  if (nextData?.[1]) return nextData[1].replace(/\\u002F/g, "/");

  const og = html.match(
    /property=["']og:image["'][^>]*content=["']([^"']+)["']|content=["']([^"']+)["'][^>]*property=["']og:image["']/i
  );
  const ogUrl = og?.[1] ?? og?.[2] ?? null;
  if (ogUrl && !ogUrl.includes("kommodo-og.jpg")) return ogUrl;

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
