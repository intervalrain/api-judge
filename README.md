# ⚖️ API Judge - RESTful API Design Checker

使用 Gemini AI 評估 OpenAPI/Swagger 規格是否符合 RESTful 設計標準的智能工具，基於 **Next.js** 構建。

## ✨ 功能特色

- 📋 **智能分析**: 使用 Google Gemini AI 進行深度 API 設計分析
- 🏗️ **7大類別評估**: 資源設計、HTTP方法、狀態碼、命名規範、請求/回應、版本控制、文件完整性
- 🏭 **工業物聯網標準**: 特別針對工業 IoT API 設計需求進行評估
- 📊 **視覺化報告**: 直觀的評分報告和詳細改進建議
- 🎯 **拖放上傳**: 支援拖放檔案上傳和剪貼簿貼上
- ⚡ **Next.js 架構**: 一致的前後端 TypeScript 開發體驗

## 🚀 快速開始

### 本地開發

1. **克隆專案**
```bash
git clone <repository-url>
cd api-judge
```

2. **安裝依賴**
```bash
npm install
```

3. **設定環境變數**
```bash
cp .env.example .env.local
```

編輯 `.env.local` 加入你的 Gemini API Key：
```env
GEMINI_API_KEY=你的真實API金鑰
ACCOUNT=登入帳號
PASSWORD=登入密碼
```

獲取 API Key: [Google AI Studio](https://aistudio.google.com/app/apikey)

4. **啟動開發伺服器**
```bash
npm run dev
```

開啟 [http://localhost:3000](http://localhost:3000) 查看應用。

### 🌐 Vercel 部署

1. **一鍵部署**
   
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/api-judge)

2. **手動部署**
```bash
# 安裝 Vercel CLI
npm i -g vercel

# 部署
vercel

# 設定環境變數
vercel env add GEMINI_API_KEY
```

3. **環境變數設定**
   - 在 Vercel Dashboard 中設定 `GEMINI_API_KEY`
   - 或使用 CLI: `vercel env add GEMINI_API_KEY`

## 📖 使用方法

1. **輸入 API 規格**
   - 拖放 `.json` 檔案到上傳區域
   - 或直接複製貼上 OpenAPI/Swagger JSON 內容
   - 點擊「從剪貼簿貼上」快速輸入

2. **開始評估**
   - 點擊「開始評估」按鈕
   - AI 將在 10-30 秒內完成分析

3. **查看報告**
   - 總體評分和各類別詳細評分
   - 具體問題指出和改進建議
   - 可展開查看詳細內容
   - 支援列印報告功能

## 🏗️ 技術架構

- **框架**: Next.js 15 + TypeScript
- **前端**: React 19 + Tailwind CSS
- **後端**: Next.js API Routes (Serverless)
- **AI 模型**: Google Gemini-2.5-pro
- **部署**: Vercel (一鍵部署)
- **檔案處理**: react-dropzone

### 專案結構

```
api-judge/
├── pages/
│   ├── api/
│   │   └── evaluate.ts          # Next.js API Route
│   ├── _app.tsx                 # App 配置
│   ├── _document.tsx            # HTML Document
│   └── index.tsx                # 主頁面
├── components/
│   ├── SwaggerInput.tsx         # 輸入組件
│   └── EvaluationReport.tsx     # 報告組件
├── types/
│   └── evaluation.ts            # TypeScript 類型
├── styles/
│   └── globals.css              # 全域樣式
├── context.md                   # RESTful 設計標準
├── next.config.js               # Next.js 配置
└── package.json                 # 專案依賴
```

## 📊 評估標準

系統根據以下 RESTful API 設計標準進行評估：

### 1. 🏗️ 資源設計 (Resource Design)
- URI 結構合理性
- 資源命名規範
- 階層關係設計
- 業務實體建模

### 2. 🔧 HTTP 方法 (HTTP Methods)
- GET、POST、PUT、PATCH、DELETE 使用正確性
- 冪等性考慮
- 安全性設計

### 3. 📊 狀態碼 (Status Codes)
- HTTP 狀態碼使用適當性
- 錯誤回應設計
- 成功回應格式

### 4. 📝 命名規範 (Naming Conventions)
- 一致的命名慣例
- 複數/單數使用
- 駝峰/底線命名

### 5. 🔄 請求/回應 (Request/Response)
- JSON 格式設計
- Content-Type 設定
- 錯誤處理機制

### 6. 📋 版本控制 (Versioning)
- API 版本策略
- 向後相容性
- 棄用政策

### 7. 📚 文件完整性 (Documentation)
- OpenAPI 規格完整性
- 描述資訊品質
- 範例提供

## 🛡️ 安全與限制

- ⏱️ **速率限制**: 每分鐘限制 1 次評估（防止濫用）
- 🔒 **隱私保護**: API 規格不會被儲存或記錄
- 📦 **檔案限制**: 支援最大 10MB JSON 檔案
- 🌐 **CORS**: 已設定適當的跨域政策

## 🤖 API 端點

### POST `/api/evaluate`

評估 OpenAPI/Swagger 規格。

**請求格式:**
```json
{
  "swagger": "OpenAPI/Swagger JSON string or object"
}
```

**回應格式:**
```json
{
  "success": true,
  "evaluation": {
    "overall_score": 85,
    "categories": { ... },
    "summary": "整體評估摘要",
    "critical_issues": [...],
    "best_practices_followed": [...]
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 🧪 範例測試

專案包含 `example-swagger.json` 範例檔案，可用於測試系統功能：

```bash
# 本地測試
curl -X POST http://localhost:3000/api/evaluate \
  -H "Content-Type: application/json" \
  -d @example-swagger.json
```

## 📦 Next.js 優勢

### 開發體驗
- **統一技術棧**: 前後端都使用 TypeScript
- **零配置**: 開箱即用的 TypeScript、ESLint、Tailwind CSS
- **熱重載**: 快速開發體驗
- **API Routes**: 無需額外的後端服務器

### 部署優勢
- **Vercel 最佳化**: 為 Vercel 平台最佳化
- **Serverless**: 自動擴展，按需付費
- **邊緣計算**: 全球 CDN 加速
- **零冷啟動**: 比 Express 更快的啟動時間

### 維護性
- **統一依賴**: 一個 package.json 管理所有依賴
- **一致的程式碼風格**: 前後端使用相同的 linting 規則
- **類型安全**: 端到端的 TypeScript 類型檢查

## 🚀 部署指令

```bash
# 開發
npm run dev

# 建置
npm run build

# 生產啟動
npm start

# 程式碼檢查
npm run lint
```

## 🤝 貢獻指南

1. Fork 專案
2. 建立功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交變更 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 建立 Pull Request

## 📄 授權條款

此專案採用 MIT 授權條款。

## 🙏 致謝

- [Next.js](https://nextjs.org/) - React 全端框架
- [Google Gemini AI](https://ai.google.dev/) - 提供強大的 AI 分析能力
- [Vercel](https://vercel.com/) - 最佳的部署平台
- [Tailwind CSS](https://tailwindcss.com/) - 實用的 CSS 框架

---

**API Judge** - 讓您的 API 設計更符合業界標準 ⚖️