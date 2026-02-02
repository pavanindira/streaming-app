import { useState, useEffect } from 'react';
import { fetchAlbums, createAlbum, updateAlbum, deleteAlbum, fetchArtists } from '../../api/musicAPI';
import { FaCompactDisc, FaTrash, FaPlus, FaImage, FaEdit } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

const ManageAlbums = () => {
    const [albums, setAlbums] = useState([]);
    const [artists, setArtists] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [newAlbum, setNewAlbum] = useState({
        title: '',
        artist_id: '',
        release_date: '',
        cover_image_url: '',
        upc: '',
        label: '',
        album_type: 'Album',
        is_featured: false
    });
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [albumsData, artistsData] = await Promise.all([fetchAlbums(), fetchArtists()]);
            setAlbums(albumsData.data || albumsData); // Handle paginated response if any
            setArtists(artistsData);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setNewAlbum({ ...newAlbum, [name]: type === 'checkbox' ? checked : value });
    };

    const handleEdit = (album) => {
        setNewAlbum({
            title: album.title,
            artist_id: album.artist_id || '',
            release_date: album.release_date ? new Date(album.release_date).toISOString().split('T')[0] : '',
            cover_image_url: album.cover_image_url || '',
            upc: album.upc || '',
            label: album.label || '',
            album_type: album.album_type || 'Album',
            is_featured: album.is_featured || false
        });
        setIsEditing(true);
        setEditId(album.id);
        setShowModal(true);
    };

    const resetForm = () => {
        setNewAlbum({
            title: '',
            artist_id: '',
            release_date: '',
            cover_image_url: '',
            upc: '',
            label: '',
            album_type: 'Album',
            is_featured: false
        });
        setIsEditing(false);
        setEditId(null);
        setShowModal(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const albumData = {
                ...newAlbum,
                artist_id: parseInt(newAlbum.artist_id, 10),
            };

            if (isEditing) {
                await updateAlbum(editId, albumData);
            } else {
                await createAlbum(albumData);
            }

            loadData();
            resetForm();
            toast.success(isEditing ? 'Album updated successfully' : 'Album created successfully');
        } catch (error) {
            console.error('Error saving album:', error);
            toast.error('Failed to save album');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this album?')) {
            try {
                await deleteAlbum(id);
                setAlbums(albums.filter((a) => a.id !== id));
                toast.success('Album deleted successfully');
            } catch (error) {
                console.error('Failed to delete album:', error);
                toast.error('Failed to delete album');
            }
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-gray-900/50 p-6 rounded-2xl border border-white/5 backdrop-blur-sm">
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-3 text-white">
                        <span className="p-3 bg-purple-500/10 text-purple-400 rounded-xl"><FaCompactDisc size={24} /></span>
                        Manage Albums
                    </h2>
                    <p className="text-gray-400 mt-1 text-sm ml-14">Curate albums, singles, and EPs.</p>
                </div>
                <button
                    className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 px-6 rounded-xl flex items-center gap-2 transition-all shadow-lg hover:shadow-purple-500/25 hover:-translate-y-0.5"
                    onClick={() => {
                        resetForm();
                        setShowModal(true);
                    }}
                >
                    <FaPlus /> Add New Album
                </button>
            </div>

            <div className="bg-[#121218] rounded-2xl overflow-hidden border border-white/5 shadow-xl">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-white/5 text-gray-400 uppercase text-xs font-bold tracking-wider">
                            <th className="p-6 font-semibold">Cover</th>
                            <th className="p-6 font-semibold">Title</th>
                            <th className="p-6 font-semibold">Artist</th>
                            <th className="p-6 font-semibold">Release Date</th>
                            <th className="p-6 font-semibold text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {Array.isArray(albums) && albums.map((album) => (
                            <tr key={album.id} className="hover:bg-white/5 transition-colors group">
                                <td className="p-6">
                                    {album.cover_image_url ? (
                                        <img src={album.cover_image_url} alt={album.title} className="w-12 h-12 object-cover rounded-lg shadow-md" />
                                    ) : (
                                        <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center text-gray-500">
                                            <FaCompactDisc size={20} />
                                        </div>
                                    )}
                                </td>
                                <td className="p-6 text-white font-medium">
                                    {album.title}
                                    {album.is_featured && <span className="ml-2 px-2 py-0.5 rounded-full text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/30 uppercase tracking-wide font-bold">Featured</span>}
                                </td>
                                <td className="p-6 text-gray-400 font-medium group-hover:text-gray-300 transition-colors">{album.artist?.name || 'Unknown'}</td>
                                <td className="p-6 text-gray-400 font-medium">{album.release_date ? new Date(album.release_date).toLocaleDateString() : '-'}</td>
                                <td className="p-6 text-right">
                                    <button
                                        onClick={() => handleEdit(album)}
                                        className="text-gray-500 hover:text-purple-400 hover:bg-purple-500/10 p-2.5 rounded-xl transition-all mr-2"
                                        title="Edit Album"
                                    >
                                        <FaEdit />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(album.id)}
                                        className="text-gray-500 hover:text-red-400 hover:bg-red-500/10 p-2.5 rounded-xl transition-all"
                                        title="Delete Album"
                                    >
                                        <FaTrash />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {(!albums || albums.length === 0) && (
                    <div className="p-12 text-center text-gray-500 flex flex-col items-center">
                        <FaCompactDisc size={48} className="text-gray-700 mb-4" />
                        <p className="text-lg">No albums found.</p>
                        <p className="text-sm">Create an album to start organizing your music.</p>
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 animate-in fade-in duration-200 p-4">
                    <div className="bg-[#181820] p-8 rounded-3xl w-full max-w-xl shadow-2xl border border-white/10 transform transition-all scale-100 overflow-y-auto max-h-[90vh]">
                        <div className="flex justify-between items-start mb-8">
                            <div>
                                <h3 className="text-3xl font-bold text-white">{isEditing ? 'Edit Album' : 'Add New Album'}</h3>
                                <p className="text-gray-400 mt-1">{isEditing ? 'Update album details.' : 'Create a new album or single release.'}</p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-white transition-colors">✕</button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-5">
                                <div>
                                    <label className="block text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Title</label>
                                    <input
                                        type="text"
                                        name="title"
                                        placeholder="Album Title"
                                        value={newAlbum.title}
                                        onChange={handleChange}
                                        className="w-full p-3.5 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all font-medium placeholder-gray-600"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Artist</label>
                                    <select
                                        name="artist_id"
                                        value={newAlbum.artist_id}
                                        onChange={handleChange}
                                        className="w-full p-3.5 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all font-medium appearance-none"
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
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Release Date</label>
                                        <input
                                            type="date"
                                            name="release_date"
                                            value={newAlbum.release_date}
                                            onChange={handleChange}
                                            className="w-full p-3.5 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all font-medium color-scheme-dark"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Album Type</label>
                                        <select
                                            name="album_type"
                                            value={newAlbum.album_type}
                                            onChange={handleChange}
                                            className="w-full p-3.5 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all font-medium appearance-none"
                                        >
                                            <option value="Album">Album</option>
                                            <option value="Single">Single</option>
                                            <option value="EP">EP</option>
                                            <option value="Compilation">Compilation</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Cover Image URL</label>
                                    <input
                                        type="url"
                                        name="cover_image_url"
                                        placeholder="https://example.com/cover.jpg"
                                        value={newAlbum.cover_image_url}
                                        onChange={handleChange}
                                        className="w-full p-3.5 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all font-medium placeholder-gray-600"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">UPC (Barcode)</label>
                                        <input
                                            type="text"
                                            name="upc"
                                            placeholder="123456789012"
                                            value={newAlbum.upc}
                                            onChange={handleChange}
                                            className="w-full p-3.5 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all font-medium placeholder-gray-600"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Label</label>
                                        <input
                                            type="text"
                                            name="label"
                                            placeholder="Record Label"
                                            value={newAlbum.label}
                                            onChange={handleChange}
                                            className="w-full p-3.5 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all font-medium placeholder-gray-600"
                                        />
                                    </div>
                                </div>

                                <div className="pt-2">
                                    <label className="flex items-center gap-3 cursor-pointer group bg-black/40 p-3 rounded-xl border border-white/10 hover:border-purple-500/50 transition-all">
                                        <input
                                            type="checkbox"
                                            name="is_featured"
                                            id="album_is_featured"
                                            checked={newAlbum.is_featured}
                                            onChange={handleChange}
                                            className="w-5 h-5 rounded bg-gray-800 border-gray-600 text-purple-500 focus:ring-purple-500"
                                        />
                                        <span className="text-gray-300 text-sm font-medium group-hover:text-purple-400">Featured Album</span>
                                    </label>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-white/10">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-6 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 px-8 rounded-xl shadow-lg hover:shadow-purple-500/25 transition-all transform hover:-translate-y-0.5"
                                >
                                    {isEditing ? 'Update Album' : 'Create Album'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div >
            )}
        </div >
    );
};

export default ManageAlbums;
