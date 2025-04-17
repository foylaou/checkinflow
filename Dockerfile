# 基礎階段
FROM node:20-alpine AS base

# 依賴階段
FROM base AS deps
WORKDIR /app

# 複製依賴文件 - 移到安裝前
COPY package.json yarn.lock ./

# 安裝依賴
RUN apk add --no-cache libc6-compat
RUN yarn install --network-timeout 1000000

# 構建階段
FROM base AS builder
WORKDIR /app

# 複製依賴
COPY --from=deps /app/node_modules ./node_modules
COPY . .


ARG NODE_ENV
# 數據庫設定
ARG DB_HOST
ARG DB_PORT
ARG DB_USERNAME
ARG DB_PASSWORD
ARG DB_DATABASE
ARG LINE_CHANNEL_ID
ARG LINE_CHANNEL_SECRET
ARG LINE_CALLBACK_URL
ARG NEXT_PUBLIC_LINE_CHANNEL_ID
ARG NEXT_PUBLIC_LINE_CALLBACK_URL
# Next.js 設定
ARG NEXT_PUBLIC_BASE_URL
# JWT 設定
ARG JWT_SECRET


# 設置構建參數和環境變數
ENV DB_HOST=${DB_HOST}
ENV DB_PORT=${DB_PORT}
ENV DB_USERNAME=${DB_USERNAME}
ENV DB_PASSWORD=${DB_PASSWORD}
ENV DB_DATABASE=${DB_DATABASE}
ENV LINE_CHANNEL_ID=${LINE_CHANNEL_ID}
ENV LINE_CHANNEL_SECRET=${LINE_CHANNEL_SECRET}
ENV LINE_CALLBACK_URL=${LINE_CALLBACK_URL}
ENV NEXT_PUBLIC_LINE_CHANNEL_ID=${NEXT_PUBLIC_LINE_CHANNEL_ID}
ENV NEXT_PUBLIC_LINE_CALLBACK_URL=${NEXT_PUBLIC_LINE_CALLBACK_URL}
# Next.js 設定
ENV NEXT_PUBLIC_BASE_URL=${NEXT_PUBLIC_BASE_URL}
# JWT 設定
ENV JWT_SECRET=${JWT_SECRET}
# 設置構建參數和環境變數


# 構建應用
RUN yarn build

# 運行階段
FROM node:20-alpine AS runner
WORKDIR /app

# 安裝運行時所需的工具
RUN apk add --no-cache curl wget

# 設置環境變數
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# 創建非 root 用戶和確保快取目錄可寫
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs && \
    mkdir -p /home/nextjs/.cache/yarn && \
    chown -R nextjs:nodejs /home/nextjs/.cache

# 複製 builder 階段的輸出
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./



# 切換到非 root 用戶
USER nextjs

# 開放端口
EXPOSE 3000

# 啟動命令
CMD ["yarn", "start"]
