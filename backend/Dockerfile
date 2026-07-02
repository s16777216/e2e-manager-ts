# 使用微軟官方 Playwright 執行環境映像檔，版本與 package.json 一致
FROM mcr.microsoft.com/playwright:v1.44.0-jammy
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3001
# 輪詢間隔 (ms)
ENV QUEUE_PORT=3002

# 複製 Monorepo 設定與依賴描述檔
COPY package.json package-lock.json ./
COPY backend/package.json ./backend/

# 安裝依賴 (含開發期編譯需要的 devDependencies，例如 typescript)
RUN npm ci --include=dev

# 複製後端專案原始碼
COPY backend/ ./backend/

# 編譯後端 TypeScript 程式碼，輸出至 backend/dist
RUN npm run build -w backend

# 進入 backend 目錄，清除開發依賴以優化體積
WORKDIR /app/backend
RUN npm prune --production

# 建立空前端靜態目錄，防止 Hono serveStatic 中介軟體因找不到目錄而報錯
RUN mkdir -p /app/frontend/dist

# 顯式安裝 Google Chrome，以相容後端 browser.ts 寫死的 channel: "chrome" 設定
RUN npx playwright install chrome

EXPOSE 3001

# 以 production 運行編譯後的 server.js
CMD ["node", "dist/server.js"]
