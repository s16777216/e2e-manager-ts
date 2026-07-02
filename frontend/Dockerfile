# ==========================================
# 階段 1：編譯 Vite 前端靜態資源
# ==========================================
FROM node:20-slim AS builder
WORKDIR /app

# 複製 Monorepo 套件設定與 Lock 檔，以便快取依賴安裝
COPY package.json package-lock.json ./
COPY frontend/package.json ./frontend/

# 安裝依賴 (npm ci)
RUN npm ci

# 複製前端專案原始碼
COPY frontend/ ./frontend/

# 執行編譯，輸出 dist 目錄
RUN npm run build -w frontend

# ==========================================
# 階段 2：使用 Nginx 託管靜態資源
# ==========================================
FROM nginx:1.25-alpine

# 複製編譯後的前端靜態檔案到 Nginx html 目錄
COPY --from=builder /app/frontend/dist /usr/share/nginx/html

# 複製自訂的 Nginx 設定覆寫預設設定
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
