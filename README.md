# Free Course Finder — React.js Edition

AI-powered free online course discovery, roadmap generation, and learning assistance.

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript + Vite |
| Styling | Tailwind CSS v3 |
| Routing | React Router DOM v7 |
| State | Context API + Custom Hooks |
| Backend | Express.js (Node.js) |
| AI | Google Gemini + Mistral AI |
| Search | Tavily API + Serper API |
| PDF | jsPDF |

## 📁 Project Structure

```
react-app/
├── server/
│   └── index.js            # Express API server (port 3001)
│
├── src/
│   ├── assets/             # Static assets
│   ├── components/
│   │   ├── features/       # Feature-specific components
│   │   │   ├── ChatDrawer.tsx
│   │   │   ├── ChatHistory.tsx
│   │   │   ├── ChatTrigger.tsx
│   │   │   ├── CourseCard.tsx
│   │   │   ├── ExportButton.tsx
│   │   │   ├── FavoritesSection.tsx
│   │   │   ├── PopularTopics.tsx
│   │   │   ├── RoadmapView.tsx
│   │   │   ├── SearchBar.tsx
│   │   │   ├── SettingsModal.tsx
│   │   │   └── TabNav.tsx
│   │   ├── layout/         # Layout components
│   │   │   ├── Header.tsx
│   │   │   └── Footer.tsx
│   │   └── ui/             # Reusable UI primitives
│   │       ├── Button.tsx
│   │       ├── Card.tsx
│   │       ├── Input.tsx
│   │       └── Modal.tsx
│   ├── constants/          # App-wide constants
│   │   └── index.ts
│   ├── context/            # React Context providers
│   │   └── AISettingsContext.tsx
│   ├── hooks/              # Custom React hooks
│   │   ├── useChat.ts
│   │   ├── useChatHistory.ts
│   │   ├── useFavorites.ts
│   │   ├── useSearch.ts
│   │   └── useSuggestions.ts
│   ├── pages/              # Page components
│   │   └── HomePage.tsx
│   ├── routes/             # React Router config
│   │   └── AppRoutes.tsx
│   ├── services/           # API service layer
│   │   └── api.ts
│   ├── styles/             # Global styles
│   │   └── globals.css
│   ├── types/              # TypeScript types
│   │   └── index.ts
│   ├── utils/              # Utility functions
│   │   └── cn.ts
│   ├── App.tsx             # Root component
│   └── main.tsx            # Entry point
```

## ⚙️ Setup

1. **Copy the environment file:**
   ```bash
   cp .env.example .env
   ```

2. **Add your API keys to `.env`:**
   ```env
   GEMINI_API_KEY=your-gemini-api-key
   MISTRAL_API_KEY=your-mistral-api-key
   TAVILY_API_KEY=your-tavily-api-key    # Optional
   SERPER_API_KEY=your-serper-api-key    # Optional
   PORT=3001
   ```

3. **Install dependencies:**
   ```bash
   npm install
   ```

4. **Start development:**
   ```bash
   npm run dev
   ```
   - Frontend: http://localhost:3000
   - API Backend: http://localhost:3001

## 🔑 API Keys

Get your API keys from:
- **Gemini**: https://aistudio.google.com/
- **Mistral**: https://console.mistral.ai/
- **Tavily**: https://tavily.com/ (for web search)
- **Serper**: https://serper.dev/ (fallback search)

You can also set API keys directly in the app via the **Settings** gear icon.

## 📦 Build for Production

```bash
npm run build
```

The frontend will be built to the `dist/` directory. Serve the Express server with `node server/index.js` and configure it to serve the static `dist/` folder.

---
**Built With Love ❤️ By Tofik & Ibrahim**  
Connect with me: [LinkedIn - Tofik Tamboli](https://www.linkedin.com/in/tofik-tamboli-91986a337/)
