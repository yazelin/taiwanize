// zhconvert-proxy:繁化姬 API 的 CORS 代理(它的 API 實際回應不帶 allow-origin,瀏覽器讀不到)
// 只轉發文字轉換,白名單 converter、限長、限流,保護上游免費服務。
// 依繁化姬服務條款:使用端(taiwanize 頁面)已標註使用繁化姬服務並附 https://zhconvert.org

const ALLOWED = new Set(["Taiwan", "Traditional", "Simplified"]);
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};
const json = (o, s = 200) =>
  new Response(JSON.stringify(o), { status: s, headers: { ...CORS, "Content-Type": "application/json" } });

const rate = new Map();
function limited(ip) {
  const now = Date.now();
  if (rate.size > 5000) rate.clear();
  const arr = (rate.get(ip) || []).filter((t) => now - t < 60000);
  if (arr.length >= 20) return true;
  arr.push(now);
  rate.set(ip, arr);
  return false;
}

export default {
  async fetch(request) {
    if (request.method === "OPTIONS") return new Response(null, { headers: CORS });
    if (request.method !== "POST") return json({ error: "POST only" }, 405);
    const ip = request.headers.get("CF-Connecting-IP") || "unknown";
    if (limited(ip)) return json({ error: "轉換太頻繁,請等一分鐘再試" }, 429);

    let body;
    try { body = await request.json(); } catch { return json({ error: "bad json" }, 400); }
    const text = String(body.text || "");
    const converter = String(body.converter || "");
    if (!ALLOWED.has(converter)) return json({ error: "converter 不在白名單" }, 400);
    if (!text) return json({ error: "text 必填" }, 400);
    if (text.length > 50000) return json({ error: "文字太長(上限 5 萬字)" }, 413);

    try {
      const ctl = new AbortController();
      const t = setTimeout(() => ctl.abort(), 15000);
      const r = await fetch("https://api.zhconvert.org/convert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, converter }),
        signal: ctl.signal,
      });
      clearTimeout(t);
      const j = await r.json();
      if (j.code !== 0) return json({ error: "繁化姬回傳錯誤:" + (j.msg || j.code) }, 502);
      return json({ text: j.data.text, usedModules: j.data.usedModules || [] });
    } catch {
      return json({ error: "繁化姬服務連不上,已退回本機引擎" }, 502);
    }
  },
};
