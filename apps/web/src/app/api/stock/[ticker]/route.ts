import type { NextRequest } from "next/server";

export async function GET(
  _req: NextRequest,
  ctx: RouteContext<"/api/stock/[ticker]">
) {
  const { ticker } = await ctx.params;
  const code = ticker.replace(/^KRX:/i, "").toUpperCase();

  const now = new Date();
  const yearAgo = new Date(now);
  yearAgo.setFullYear(yearAgo.getFullYear() - 1);

  const fmt = (d: Date) =>
    `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;

  try {
    const url =
      `https://fchart.stock.naver.com/siseJson.nhn` +
      `?symbol=${code}&requestType=1` +
      `&startTime=${fmt(yearAgo)}&endTime=${fmt(now)}&timeframe=day`;

    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
        Referer: "https://finance.naver.com/",
        Accept: "*/*",
      },
    });

    if (!res.ok) throw new Error(`upstream ${res.status}`);

    const text = await res.text();
    const rows: string[][] = JSON.parse(text);

    const candles = rows
      .filter((row) => /^\d{8}$/.test(row[0] ?? ""))
      .map((row) => ({
        time: `${row[0].slice(0, 4)}-${row[0].slice(4, 6)}-${row[0].slice(6, 8)}`,
        open: Number(row[1]),
        high: Number(row[2]),
        low: Number(row[3]),
        close: Number(row[4]),
        volume: Number(row[5]),
      }))
      .filter((c) => c.open > 0 && c.close > 0)
      .sort((a, b) => a.time.localeCompare(b.time));

    return Response.json({ candles }, {
      headers: { "Cache-Control": "public, max-age=300, s-maxage=300" },
    });
  } catch (err) {
    return Response.json({ error: String(err), candles: [] }, { status: 500 });
  }
}
