# 🎵 Music Streaming App

A modern, full-featured music streaming platform built with the PERN stack (PostgreSQL, Express, React, Node.js). Features include artist dashboards, synchronized lyrics, real-time visualizers, and robust playlist management.

## ✨ Features

- **🎧 Music Playback**: Seamless audio streaming with a custom player, queue management, and visualizer.
- **🎤 Synchronized Lyrics**: Real-time lyric synchronization (LRC format) with auto-scrolling.
- **👨‍🎤 Artist Studio**: dedicated dashboard for artists to upload tracks, manage albums, and view analytics.
- **📂 Playlist Management**: Create, edit, and share playlists.
- **❤️ Favorites & Library**: Save songs and albums to your personal library.
- **🔍 Smart Search**: Find artists, songs, and albums instantly.
- **🐳 Dockerized**: Fully containerized stack for easy deployment.

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite, TailwindCSS, Framer Motion, TanStack Query
- **Backend**: Node.js, Express, Sequelize ORM
- **Database**: PostgreSQL
- **Cache**: Redis
- **Storage**: MinIO (S3 Compatible)

## 🚀 Getting Started

### Option 1: Docker (Recommended)
The easiest way to run the application is using Docker Compose. This sets up the Frontend, Backend, Database, Redis, and Object Storage automatically.

```bash
# 1. Clone the repository
git clone <repository-url>

# 2. Run with Docker Compose
docker-compose up --build
```

- **Frontend**: [http://localhost](http://localhost)
- **MinIO Console**: [http://localhost:9001](http://localhost:9001) (User: `miniouser`, Pass: `miniopassword`)

### Option 2: Manual Setup

#### Prerequisites
- Node.js (v18+)
- PostgreSQL
- Redis
- MinIO Server

#### Backend Setup
1. Navigate to `backend/`.
2. Copy `.env.example` to `.env` and configure your database credentials.
3. Install dependencies and start server:
   ```bash
   cd backend
   npm install
   npm start
   ```

#### Frontend Setup
1. Navigate to `frontend/`.
2. Install dependencies and start dev server:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## 📝 API Documentation
Swagger documentation is available when running the backend locally:
- **URL**: [http://localhost:3000/api-docs](http://localhost:3000/api-docs)

## 📜 License
This project is licensed under the MIT License.
