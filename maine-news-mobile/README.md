# Maine News Today - Mobile App

A React Native mobile app for Maine News Today, built with Expo.

## Features
- 📰 Real-time news feed from Maine News API
- 🔍 Search functionality
- 📱 Category filtering (Local, Politics, Health, Opinion)
- 🌙 Dark theme matching website design
- 💾 Offline mode (caches last posts)
- 🔄 Pull-to-refresh
- 🎨 Clean, editorial design

## Setup

### Prerequisites
- Node.js 18+
- Expo CLI
- iOS Simulator (Mac) or Android Emulator

### Installation

```bash
npm install
```

### Configuration

Update the API URL in `services/api.ts`:
```typescript
const API_BASE_URL = 'https://your-vercel-url.vercel.app';
```

### Run

```bash
# Start Expo dev server
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android

# Run on web
npm run web
```

## Project Structure

```
maine-news-mobile/
├── App.tsx              # Main app component (Home screen)
├── constants/
│   └── theme.ts         # Design system (colors, fonts, spacing)
├── services/
│   └── api.ts           # API service with offline caching
└── assets/              # Images and icons
```

## Design System

Matches the Maine News Today website:
- **Background**: #0a0a0a (deep near-black)
- **Text**: #f5f5f5 (off-white)
- **Accent**: #bf9b30 (muted gold)
- **Fonts**: Oswald (headings), Inter (body)

## API Integration

Fetches from `/api/posts` endpoint:
```typescript
interface Post {
  slug: string;
  title: string;
  author: string;
  category: string;
  publishedDate: string;
}
```

## Offline Mode

Posts are automatically cached using AsyncStorage. If the API is unavailable, the app loads from cache.

## Future Features
- [ ] Article detail view with full content
- [ ] Text-to-speech narration
- [ ] Share functionality
- [ ] Push notifications
- [ ] Tip submission
- [ ] User accounts
- [ ] Comments

## License
MIT
