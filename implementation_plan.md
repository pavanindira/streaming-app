# Roadmap: Music Streaming App Enhancement

This roadmap outlines the steps to elevate the application from a functional prototype to a premium, visually appealing, and fully integrated platform.

## Phase 1: Visual Polish & UX Overhaul (The "Wow" Factor)
**Goal:** Create a stunning first impression with modern design trends.

### 1.1. Modern Design System
-   [x] **Theme Setup:** Define a rich color palette (deep blacks, vibrant accents) and typography (Inter/Outfit) in `index.css`/Tailwind config.
-   [x] **Glassmorphism:** Implement frosted glass effects for the **Sidebar**, **Header**, and **Player** bar using `backdrop-blur`.

### 1.2. Interactive Home Page
-   [x] **Hero Section:** Create a dynamic "Featured" banner on the generic Home Page with high-quality imagery and a "Play Now" CTA.
-   [x] **Animated Cards:** precise hover effects for album/song cards using simple CSS transitions or Framer Motion.
-   [x] **Smooth Transitions:** Add page transition animations for a seamless app-like feel.

### 1.3. Enhanced Player UI
-   [x] **Now Playing View:** specific "Full Screen" or "Expanded" view for the player showing high-res cover art.
-   [?] **Visualizer:** Add a simple CSS-based audio visualizer animation when the track is playing. (De-prioritized for now)

---

## Phase 2: Backend Integration & Real Data
**Goal:** Replace hardcoded mocks with real data from the database.

### 2.1. API Connection
-   [x] **Service Layer:** Create a robust `api/music.service.js` to fetch songs, albums, and artists.
-   [x] **State Management:** Use `React Query` efficiently to cache and manage server state.
-   [x] **CORS & Env:** Ensure environment variables are correctly set for `localhost` communication.

### 2.2. Real Audio Playback
-   [x] **Data Wiring:** Connect the `MainLayout` player to the `songs` API response.
-   [x] **Streaming:** Ensure audio files served from the backend (static files or cloud storage URLs) play correctly.
> [!IMPORTANT]
> **Database Setup**: The code is ready, but the local database needs to be created (`npx sequelize-cli db:create`) and seeded (`node seed.js`) for data to appear.

---

## Phase 3: Advanced Features
**Goal:** Add functional depth to rival commercial streaming apps.

### 3.1. Lyrics Support
-   [x] **Database Update:** Add `text` column `lyrics` to the `Songs` table via a new migration.
-   [x] **API Update:** Update `SongController` to handle lyrics in Create/Read operations.
-   [x] **UI Integration:** Add a "Lyrics" button in the player that opens a scrolling lyrics view.

### 3.2. Discovery & Recommendations
-   [x] **"Made for You":** Algorithm (or randomizer for V1) to fetch songs based on user's favorite genre.
-   [x] **Search:** Implement real-time search for songs and artists using the backend query operators.

---

## Phase 4: User Playlists (Completed)
- [x] **Database & API:** Create `Playlists` table and relationships (User hasMany Playlists, Playlist hasMany Songs).
- [x] **Playlist Management:** Create, Read, Update, Delete playlists via API.
- [x] **Add/Remove Songs:** Endpoints to manage songs within a playlist.
- [x] **Library UI:** A "Your Library" page to view all playlists.
- [x] **Playlist Details:** A dedicated page view for a single playlist.
- [x] **Context Actions:** "Add to Playlist" option from song menus (Home, Search).

## Phase 5: Refinement (Completed)
- [x] **Authentication UI Polish:** Improved Login/Register screens with Glassmorphism and better animations.
- [x] **Audio Visualizer:** Added real-time Canvas API audio visualizer to the Player component.

## Phase 6: Artist Ecosystem (Completed)
- [x] **Artist Dashboard:** Dedicated analytics view (Tracks, Streams, Followers).
- [x] **Content Management:** Upload Songs (with Audio/Cover), Create Albums.
- [x] **Artist Profile:** Public profile page showcasing Discography and stats.

## Phase 7: Administrative Control (Completed)
- [x] **Admin Dashboard:** System-wide metrics (Users, Songs, Albums, Artists).
- [x] **User Management:** Ban/Delete users capability.
- [x] **Content Moderation:** Manage Songs and Albums (Delete/Edit).
- [x] **Security:** Robust `adminMiddleware` and protected routes.

## Phase 8: Final Polish (Completed)
- [x] **Skeleton Loaders:** replaced text loading states with shimmer effects.
- [x] **Home Page:** Dynamic time-based greetings and smooth hero animations.
- [x] **Music Player:** Refined UI with gradient progress bars.

## Phase 9: Future Roadmap (Next Steps)
### 9.1. Social & Community
- [ ] **Follow System:** UI for following Artists and other Users (Backend ready).
- [ ] **Activity Feed:** See what friends are listening to.
- [ ] **Sharing:** Share song/album links.

### 9.2. Advanced Discovery
- [ ] **Genre Browsing:** Dedicated pages for genres (Pop, Rock, etc.).
- [ ] **Smart Playlists:** "Daily Mix" or "Discover Weekly" generation.

