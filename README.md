# 台灣化轉換器 taiwanize

簡體字稿一鍵轉台灣正體+在地用語:軟件變軟體、視頻變影片、網絡變網路。打字即轉。

**線上使用:https://yazelin.github.io/taiwanize/**

免費、免註冊、無廣告、零追蹤——轉換全在你的瀏覽器內完成,**文字不會送到任何伺服器**。

## 為什麼不用繁化姬就好

| | 繁化姬 | 這個工具 |
|--|--|--|
| 文字去哪 | 全文送它的伺服器轉換 | 不離開你的瀏覽器(機密文案敢貼) |
| 廣告 | 有贊助廣告 | 無 |
| 操作 | 貼上→按轉換 | 打字即轉 |
| 自訂取代 | 有(功能較深) | 有(每行「原詞=新詞」,存 localStorage) |
| 詞庫深度 | 社群維護,較深,含字幕/注音等模組 | OpenCC 標準詞庫,一般行銷文案夠用 |

誠實說:需要進階詞庫模組時,繁化姬仍是好選擇;頁面上也留了它的連結。

## 模式

- 簡體 → 台灣正體+在地用語(OpenCC `cn→twp`,預設)
- 簡體 → 正體只轉字(`cn→tw`)
- 繁體 → 簡體(`tw→cn`)

## 繁化姬模式(選用)

打開「繁化姬模式」開關,轉換改走[繁化姬](https://zhconvert.org)的雲端詞庫(錯字修正、網路用語、專有名詞等模組,比 OpenCC 深)。

- 依繁化姬服務條款標註:**本功能使用繁化姬服務(https://zhconvert.org)**
- 繁化姬 API 未開放瀏覽器跨域讀取,文字會經本站的 `zhconvert-proxy` Cloudflare Worker 轉送(`worker/`,白名單 converter、5 萬字上限、每分鐘 20 次限流,不儲存內容)
- 開關打開時頁面會明示資料路徑;機密文案請關閉,走預設的本機 OpenCC
- 繁化姬服務連不上時自動退回本機引擎

Worker 部署:`cd worker && npx wrangler deploy`。

## 開發

單檔 index.html。轉換引擎 [opencc-js](https://github.com/nk2028/opencc-js)(MIT)+ [OpenCC](https://github.com/BYVoid/OpenCC) 詞庫(Apache-2.0):
頁面主載 jsDelivr(pin 1.0.5),失敗時 fallback 到 `vendor/opencc-full.js` repo 內副本。

```bash
python3 -m http.server 8003
NODE_PATH=$(npm root -g) node verify/check.cjs http://localhost:8003/
```

## 更多工具

這是[行銷工具箱](https://yazelin.github.io/marketing-toolbox/)的自製工具之一——免費、免註冊、開瀏覽器就能用的行銷小工具書籤站。

## 關於作者

林亞澤(Yaze Lin)——工業自動化 SI 轉 AI 應用。

- Blog:https://yazelin.github.io/
- Facebook:https://www.facebook.com/yaze.lin.gm
- Buy Me a Coffee:https://buymeacoffee.com/yazelin

## License

MIT © 2026 林亞澤 (Yaze Lin)
