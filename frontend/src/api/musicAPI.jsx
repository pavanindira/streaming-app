import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// Add a request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Artists
export const fetchArtists = async () => {
  const response = await api.get('/artists');
  return response.data;
};

export const getArtistStats = async (artistId) => {
  const response = await api.get(`/artists/${artistId}/stats`);
  return response.data;
};

export const fetchAlbumsByArtist = async (artistId) => {
  const response = await api.get('/albums', { params: { artistId } });
  return response.data.data; // Assuming paginated response
};

export const getAdminStats = async () => {
  const response = await api.get('/admin/stats');
  return response.data;
};

export const createArtist = async (artistData) => {
  const response = await api.post('/artists', artistData);
  return response.data;
};

export const updateArtist = async (id, artistData) => {
  const response = await api.put(`/artists/${id}`, artistData);
  return response.data;
};

export const deleteArtist = async (id) => {
  const response = await api.delete(`/artists/${id}`);
  return response.data;
};

// User Auth
export const registerUser = async (userData) => {
  const response = await api.post('/users/register', userData);
  return response.data;
};

export const loginUser = async (userData) => {
  const response = await api.post('/users/login', userData);
  return response.data;
};

export const fetchAllUsers = async () => {
  const response = await api.get('/users');
  return response.data;
};

export const fetchUsers = fetchAllUsers;

export const deleteUser = async (id) => {
  const response = await api.delete(`/users/${id}`);
  return response.data;
};

export const createUser = async (userData) => {
  const response = await api.post('/users', userData);
  return response.data;
};

// Albums
export const fetchAlbums = async (filters = {}) => {
  const params = new URLSearchParams(filters).toString();
  const response = await api.get(`/albums?${params}`);
  return response.data;
};

export const createAlbum = async (albumData) => {
  const response = await api.post('/albums', albumData);
  return response.data;
};

export const deleteAlbum = async (id) => {
  const response = await api.delete(`/albums/${id}`);
  return response.data;
};

// Music Data
export const fetchSongs = async (filters = {}) => {
  const params = new URLSearchParams(filters).toString();
  const response = await api.get(`/songs?${params}`);
  return response.data;
};

export const fetchGenres = async () => {
  const response = await api.get('/songs/genres'); // Using songs/genres as route is on song router
  return response.data;
};

export const fetchSongById = async (id) => {
  const response = await api.get(`/songs/${id}`);
  return response.data;
};

export const createSong = async (songData) => {
  const response = await api.post('/songs', songData);
  return response.data;
};

export const deleteSong = async (id) => {
  const response = await api.delete(`/songs/${id}`);
  return response.data;
};

export const fetchArtistById = async (id) => {
  const response = await api.get(`/users/${id}`);
  return response.data;
};

export const followUser = async (id) => {
  const response = await api.post(`/users/${id}/follow`);
  return response.data;
};

export const unfollowUser = async (id) => {
  const response = await api.delete(`/users/${id}/follow`);
  return response.data;
};

// Player
export const streamSong = async (filename) => {
  // Note: The original instruction had `await api.delete(`/songs/${id}`);`
  // which was syntactically incorrect (await in non-async, `id` undefined)
  // and semantically incorrect for "streamSong".
  // This has been corrected to be an async function performing a GET request
  // for a song stream, assuming `filename` is the identifier.
  const response = await api.get(`/stream/songs/${filename}`, { responseType: 'blob' });
  return response.data;
};

export const fetchSongsByArtist = async (artistId) => {
  return fetchSongs({ artistId });
};

// Playlists
export const fetchPlaylists = async () => {
  const response = await api.get('/playlists');
  return response.data;
};

export const createPlaylist = async (data) => {
  const response = await api.post('/playlists', data);
  return response.data;
};

export const fetchPlaylistById = async (id) => {
  const response = await api.get(`/playlists/${id}`);
  return response.data;
};

export const addSongToPlaylist = async (playlistId, songId) => {
  const response = await api.post(`/playlists/${playlistId}/songs`, { songId });
  return response.data;
};

export const removeSongFromPlaylist = async (playlistId, songId) => {
  // DELETE with body is supported by axios but requires config object with data property
  const response = await api.delete(`/playlists/${playlistId}/songs`, { data: { songId } });
  return response.data;
};

export const updatePlaylist = async (playlistId, data) => {
  const response = await api.put(`/playlists/${playlistId}`, data);
  return response.data;
};

// Labels
// Update User
export const updateUser = async (id, userData) => {
  const response = await api.put(`/users/${id}`, userData);
  return response.data;
};

// Labels
export const fetchLabels = async () => {
  const response = await api.get('/labels');
  return response.data;
};

export const createLabel = async (data) => {
  const response = await api.post('/labels', data);
  return response.data;
};

export const updateLabel = async (id, data) => {
  const response = await api.put(`/labels/${id}`, data);
  return response.data;
};

export const deleteLabel = async (id) => {
  const response = await api.delete(`/labels/${id}`);
  return response.data;
};

// Favorites
export const fetchFavorites = async () => {
  const response = await api.get('/users/me/favorites'); // Note: /users prefix is likely from index.js
  return response.data;
};

export const fetchSearch = async (query) => {
  if (!query) return { songs: [], albums: [], artists: [] };
  const response = await api.get(`/search?q=${encodeURIComponent(query)}`);
  return response.data;
};

// Audiobooks
export const fetchAudiobooks = async (filters = {}) => {
  const params = new URLSearchParams(filters).toString();
  const response = await api.get(`/audiobooks?${params}`);
  return response.data;
};

export const fetchAudiobookById = async (id) => {
  const response = await api.get(`/audiobooks/${id}`);
  return response.data;
};

export const fetchAudiobookProgress = async (id) => {
  const response = await api.get(`/audiobooks/${id}/progress`);
  return response.data;
};

export const saveAudiobookProgress = async (id, data) => {
  const response = await api.post(`/audiobooks/${id}/progress`, data);
  return response.data;
};

export const fetchUserFeed = async () => {
  const response = await api.get('/songs/feed');
  return response.data;
};

// ... existing exports ...

export const updateAlbum = async (id, albumData) => {
  const response = await api.put(`/albums/${id}`, albumData);
  return response.data;
};

export const updateSong = async (id, songData) => {
  // If songData contains files, we need headers for multipart/form-data
  // But axios instances usually handle standard objects. 
  // If we pass FormData, browser sets content-type automatically.
  const response = await api.put(`/songs/${id}`, songData);
  return response.data;
};

export const likeSong = async (id) => {
  const response = await api.post(`/songs/${id}/like`);
  return response.data;
};

export const unlikeSong = async (id) => {
  const response = await api.delete(`/songs/${id}/like`);
  return response.data;
};

// Activity Feed
export const logPlay = async (songId) => {
  const response = await api.post('/activity/play', { songId });
  return response.data;
};

export const fetchFriendActivity = async () => {
  const response = await api.get('/activity/friends');
  return response.data;
};

// Playlist Collaboration
export const addCollaborator = async (playlistId, userId) => {
  const response = await api.post(`/playlists/${playlistId}/collaborators`, { userId });
  return response.data;
};

export const removeCollaborator = async (playlistId, userId) => {
  const response = await api.delete(`/playlists/${playlistId}/collaborators/${userId}`);
  return response.data;
};

export default api;
