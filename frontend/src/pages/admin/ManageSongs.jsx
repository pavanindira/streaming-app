import { useState, useEffect } from 'react';
import { fetchSongs, createSong, updateSong, deleteSong, fetchArtists, fetchAlbums, fetchLabels } from '../../api/musicAPI';
import { FaMusic, FaTrash, FaPlus, FaLink, FaEdit } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

const ManageSongs = () => {
  const [songs, setSongs] = useState([]);
  const [artists, setArtists] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [labels, setLabels] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newSong, setNewSong] = useState({
    title: '',
    artist_id: '',
    album_id: '',
    singer: '',
    lyricist: '',
    isrc: '',
    track_number: '',
    explicit: false,
    composer: '',
    producer: '',
    lyrics: '',

    labels: [], // Array of selected label IDs
    is_featured: false,
    url: ''
  });
  const [songFile, setSongFile] = useState(null);
  const [coverImage, setCoverImage] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  // Fetch songs and artists from the API
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [songsData, artistsData, albumsData, labelsData] = await Promise.all([
        fetchSongs(),
        fetchArtists(),
        fetchAlbums(),
        fetchLabels()
      ]);
      setSongs(songsData);
      setArtists(artistsData);
      setAlbums(albumsData.data || albumsData);
      setLabels(labelsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  // Handle form changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewSong({
      ...newSong,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleLabelToggle = (labelId) => {
    setNewSong(prev => {
      const currentLabels = prev.labels || [];
      if (currentLabels.includes(labelId)) {
        return { ...prev, labels: currentLabels.filter(id => id !== labelId) };
      } else {
        return { ...prev, labels: [...currentLabels, labelId] };
      }
    });
  };

  const handleFileChange = (e) => {
    if (e.target.name === 'file') {
      setSongFile(e.target.files[0]);
    } else if (e.target.name === 'cover_image') {
      setCoverImage(e.target.files[0]);
    }
  };

  const handleEdit = (song) => {
    setNewSong({
      title: song.title,
      artist_id: song.artist_id || '',
      album_id: song.album_id || '',
      singer: song.singer || '',
      lyricist: song.lyricist || '',
      isrc: song.isrc || '',
      track_number: song.track_number || '',
      explicit: song.explicit || false,
      composer: song.composer || '',
      producer: song.producer || '',
      lyrics: song.lyrics || '',
      labels: song.labels ? song.labels.map(l => l.id) : [],
      is_featured: song.is_featured || false,
      url: song.file_url || ''
    });
    setSongFile(null); // Reset files, user has to re-upload if they want to change
    setCoverImage(null);
    setIsEditing(true);
    setEditId(song.id);
    setShowModal(true);
  };

  const resetForm = () => {
    setNewSong({
      title: '',
      artist_id: '',
      album_id: '',
      singer: '',
      lyricist: '',
      isrc: '',
      track_number: '',
      explicit: false,
      composer: '',
      producer: '',
      lyrics: '',
      labels: [],
      is_featured: false,
      url: ''
    });
    setSongFile(null);
    setCoverImage(null);
    setIsEditing(false);
    setEditId(null);
    setShowModal(false);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!songFile && !newSong.url) { // Allow URL if provided (legacy) but prioritize file
      // valid
    }

    try {
      const formData = new FormData();
      Object.keys(newSong).forEach(key => {
        if (key === 'labels') {
          formData.append('labels', JSON.stringify(newSong.labels));
        } else if (key === 'is_featured') {
          formData.append('is_featured', newSong.is_featured);
        } else if (newSong[key] !== '' && newSong[key] !== null && newSong[key] !== undefined) {
          formData.append(key, newSong[key]);
        }
      });

      if (songFile) {
        formData.append('file', songFile);
      }
      if (coverImage) {
        formData.append('cover_image', coverImage);
      }

      if (coverImage) {
        formData.append('cover_image', coverImage);
      }

      if (isEditing) {
        await updateSong(editId, formData);
      } else {
        await createSong(formData);
      }

      // Refresh strictly to ensure we get the associated artist object back
      loadData();
      resetForm();
      toast.success(isEditing ? 'Song updated successfully' : 'Song created successfully');
    } catch (error) {
      console.error('Error saving song:', error);
      toast.error('Failed to save song. Please check the inputs.');
    }
  };

  const handleDelete = async (songId) => {
    if (window.confirm('Are you sure you want to delete this song?')) {
      try {
        await deleteSong(songId);
        setSongs(songs.filter((song) => song.id !== songId));
        toast.success('Song deleted successfully');
      } catch (error) {
        console.error('Failed to delete song:', error);
        toast.error('Failed to delete song');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-gray-900/50 p-6 rounded-2xl border border-white/5 backdrop-blur-sm">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-3 text-white">
            <span className="p-3 bg-blue-500/10 text-blue-400 rounded-xl"><FaMusic size={24} /></span>
            Manage Songs
          </h2>
          <p className="text-gray-400 mt-1 text-sm ml-14">View, edit, or delete tracks in your library.</p>
        </div>
        <button
          className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-xl flex items-center gap-2 transition-all shadow-lg hover:shadow-blue-500/25 hover:-translate-y-0.5"
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
        >
          <FaPlus /> Add New Song
        </button>
      </div>

      <div className="bg-[#121218] rounded-2xl overflow-hidden border border-white/5 shadow-xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/5 text-gray-400 uppercase text-xs font-bold tracking-wider">
              <th className="p-6 font-semibold">Title</th>
              <th className="p-6 font-semibold">Artist</th>
              <th className="p-6 font-semibold">Album</th>
              <th className="p-6 font-semibold">URL</th>
              <th className="p-6 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {songs.map((song) => (
              <tr key={song.id} className="hover:bg-white/5 transition-colors group">
                <td className="p-6 text-white font-medium flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center overflow-hidden">
                    {song.cover_image_url ? (
                      <img src={song.cover_image_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <FaMusic className="text-gray-600" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      {song.title}
                      {song.is_featured && <span className="px-2 py-0.5 rounded-full text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/30 uppercase tracking-wide font-bold">Featured</span>}
                    </div>
                  </div>
                </td>
                <td className="p-6 text-gray-400 font-medium group-hover:text-gray-300 transition-colors">{song.artist?.name || 'Unknown Artist'}</td>
                <td className="p-6 text-gray-400 font-medium">{song.album?.title || '-'}</td>
                <td className="p-6">
                  <a
                    href={song.url || song.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 flex items-center gap-1 text-sm font-medium"
                  >
                    <FaLink size={12} /> Link
                  </a>
                </td>
                <td className="p-6 text-right">
                  <button
                    onClick={() => handleEdit(song)}
                    className="text-gray-500 hover:text-blue-400 hover:bg-blue-500/10 p-2.5 rounded-xl transition-all mr-2"
                    title="Edit Song"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDelete(song.id)}
                    className="text-gray-500 hover:text-red-400 hover:bg-red-500/10 p-2.5 rounded-xl transition-all"
                    title="Delete Song"
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {songs.length === 0 && (
          <div className="p-12 text-center text-gray-500 flex flex-col items-center">
            <FaMusic size={48} className="text-gray-700 mb-4" />
            <p className="text-lg">No songs found.</p>
            <p className="text-sm">Start by adding a new track to your library.</p>
          </div>
        )}
      </div>

      {/* Modal for Adding Song */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-[#181820] p-8 rounded-3xl w-full max-w-4xl shadow-2xl border border-white/10 transform transition-all scale-100 overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h3 className="text-3xl font-bold text-white">{isEditing ? 'Edit Song' : 'Add New Song'}</h3>
                <p className="text-gray-400 mt-1">{isEditing ? 'Update song details.' : 'Fill in the details to upload a new track.'}</p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-white transition-colors">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Column 1: Basic Info */}
                <div className="space-y-5">
                  <div className="bg-white/5 p-5 rounded-2xl border border-white/5">
                    <h4 className="text-white font-semibold mb-4 flex items-center gap-2"><div className="w-1 h-5 bg-blue-500 rounded-full" /> Basic Info</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Title</label>
                        <input
                          type="text"
                          name="title"
                          placeholder="Song Title"
                          value={newSong.title}
                          onChange={handleChange}
                          className="w-full p-3.5 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium placeholder-gray-600"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Artist</label>
                        <select
                          name="artist_id"
                          value={newSong.artist_id}
                          onChange={handleChange}
                          className="w-full p-3.5 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium appearance-none"
                          required
                        >
                          <option value="">Select Artist</option>
                          {artists.map((artist) => (
                            <option key={artist.id} value={artist.id}>
                              {artist.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Album (Optional)</label>
                        <select
                          name="album_id"
                          value={newSong.album_id}
                          onChange={handleChange}
                          className="w-full p-3.5 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium appearance-none"
                        >
                          <option value="">Select Album</option>
                          {Array.isArray(albums) && albums.map((album) => (
                            <option key={album.id} value={album.id}>
                              {album.title}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/5 p-5 rounded-2xl border border-white/5">
                    <h4 className="text-white font-semibold mb-4 flex items-center gap-2"><div className="w-1 h-5 bg-green-500 rounded-full" /> File & Media</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Song File (MP3)</label>
                        <div className="relative">
                          <input
                            type="file"
                            name="file"
                            accept="audio/*"
                            onChange={handleFileChange}
                            className="w-full p-3 rounded-xl bg-black/40 border border-white/10 text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-500 transition-all"
                            required={!isEditing && !newSong.url}
                          />
                        </div>
                      </div>

                      <div className="text-center text-gray-500 text-xs font-bold my-2">- OR -</div>

                      <div>
                        <label className="block text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Song URL</label>
                        <input
                          type="url"
                          name="url"
                          placeholder="https://example.com/audio.mp3"
                          value={newSong.url}
                          onChange={handleChange}
                          className="w-full p-3.5 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium placeholder-gray-600"
                        />
                        <p className="text-xs text-gray-500 mt-1">Provide a direct link to an audio file to auto-download.</p>
                      </div>

                      <div>
                        <label className="block text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Cover Image</label>
                        <input
                          type="file"
                          name="cover_image"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="w-full p-3 rounded-xl bg-black/40 border border-white/10 text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-500 transition-all"
                        />
                      </div>
                    </div>
                  </div>


                </div>

                {/* Column 2: Credits & Metadata */}
                <div className="space-y-5">
                  <div className="bg-white/5 p-5 rounded-2xl border border-white/5">
                    <h4 className="text-white font-semibold mb-4 flex items-center gap-2"><div className="w-1 h-5 bg-purple-500 rounded-full" /> Metadata & Credits</h4>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Singer</label>
                          <input
                            type="text"
                            name="singer"
                            value={newSong.singer}
                            onChange={handleChange}
                            className="w-full p-3.5 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Lyricist</label>
                          <input
                            type="text"
                            name="lyricist"
                            value={newSong.lyricist}
                            onChange={handleChange}
                            className="w-full p-3.5 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Composer</label>
                          <input
                            type="text"
                            name="composer"
                            value={newSong.composer}
                            onChange={handleChange}
                            className="w-full p-3.5 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Producer</label>
                          <input
                            type="text"
                            name="producer"
                            value={newSong.producer}
                            onChange={handleChange}
                            className="w-full p-3.5 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                          />
                        </div>
                      </div>

                      {/* Lyrics */}
                      <div>
                        <label className="block text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Lyrics</label>
                        <textarea
                          name="lyrics"
                          rows="4"
                          placeholder="Add song lyrics here..."
                          value={newSong.lyrics}
                          onChange={handleChange}
                          className="w-full p-3.5 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all font-mono text-sm leading-relaxed scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent"
                        />
                      </div>


                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">ISRC</label>
                          <input
                            type="text"
                            name="isrc"
                            placeholder="US-XXX-24..."
                            value={newSong.isrc}
                            onChange={handleChange}
                            className="w-full p-3.5 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Track #</label>
                          <input
                            type="number"
                            name="track_number"
                            placeholder="1"
                            value={newSong.track_number}
                            onChange={handleChange}
                            className="w-full p-3.5 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/5 p-5 rounded-2xl border border-white/5">
                    <h4 className="text-white font-semibold mb-4 flex items-center gap-2"><div className="w-1 h-5 bg-yellow-500 rounded-full" /> Classification</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Labels</label>
                        <div className="grid grid-cols-2 gap-3 max-h-32 overflow-y-auto p-3 bg-black/40 rounded-xl border border-white/10">
                          {labels.map(label => (
                            <div key={label.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors">
                              <input
                                type="checkbox"
                                id={`label-${label.id}`}
                                checked={(newSong.labels || []).includes(label.id)}
                                onChange={() => handleLabelToggle(label.id)}
                                className="rounded bg-gray-800 border-gray-600 text-green-500 focus:ring-green-500 w-4 h-4"
                              />
                              <label htmlFor={`label-${label.id}`} className="text-sm text-gray-300 cursor-pointer select-none flex-1">
                                {label.name}
                              </label>
                            </div>
                          ))}
                          {labels.length === 0 && <span className="text-gray-500 text-xs">No labels available. Create one first.</span>}
                        </div>
                      </div>

                      <div className="pt-2 flex gap-4">
                        <label className="flex items-center gap-3 cursor-pointer group bg-black/40 p-3 rounded-xl border border-white/10 hover:border-red-500/50 transition-all flex-1">
                          <input
                            type="checkbox"
                            name="explicit"
                            checked={newSong.explicit}
                            onChange={(e) => setNewSong({ ...newSong, explicit: e.target.checked })}
                            className="w-5 h-5 rounded bg-gray-800 border-gray-600 text-red-500 focus:ring-red-500"
                          />
                          <span className="text-gray-300 text-sm font-medium group-hover:text-red-400">Explicit</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer group bg-black/40 p-3 rounded-xl border border-white/10 hover:border-purple-500/50 transition-all flex-1">
                          <input
                            type="checkbox"
                            name="is_featured"
                            checked={newSong.is_featured}
                            onChange={(e) => setNewSong({ ...newSong, is_featured: e.target.checked })}
                            className="w-5 h-5 rounded bg-gray-800 border-gray-600 text-purple-500 focus:ring-purple-500"
                          />
                          <span className="text-gray-300 text-sm font-medium group-hover:text-purple-400">Featured</span>
                        </label>
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              <div className="flex justify-end gap-4 pt-6 mt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-8 rounded-xl shadow-lg hover:shadow-blue-500/25 transition-all transform hover:-translate-y-0.5"
                >
                  {isEditing ? 'Update Song' : 'Create Song'}
                </button>
              </div>
            </form>
          </div>
        </div >
      )}
    </div >
  );
};

export default ManageSongs;
