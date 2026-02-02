import { useState, useEffect } from 'react';
import { fetchArtists, createArtist, deleteArtist, updateArtist } from '../../api/musicAPI';
import { FaTrash, FaEdit, FaUserAstronaut, FaPlus, FaTimes } from 'react-icons/fa';

const ManageArtists = () => {
    const [artists, setArtists] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editingArtist, setEditingArtist] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        bio: '',
        image: null
    });

    useEffect(() => {
        loadArtists();
    }, []);

    const loadArtists = async () => {
        try {
            const data = await fetchArtists();
            setArtists(data);
        } catch (error) {
            console.error('Failed to load artists:', error);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure? This will unlink their albums and songs.')) {
            try {
                await deleteArtist(id);
                loadArtists();
            } catch (error) {
                console.error('Failed to delete artist:', error);
            }
        }
    };

    const handleInputChange = (e) => {
        const { name, value, files } = e.target;
        if (name === 'image') {
            setFormData({ ...formData, image: files[0] });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = new FormData();
        data.append('name', formData.name);
        data.append('bio', formData.bio);
        if (formData.image) data.append('image', formData.image);

        try {
            if (editingArtist) {
                await updateArtist(editingArtist.id, data);
            } else {
                await createArtist(data);
            }
            loadArtists();
            closeModal();
        } catch (error) {
            console.error('Failed to save artist:', error);
            alert('Failed to save artist');
        }
    };

    const openModal = (artist = null) => {
        if (artist) {
            setEditingArtist(artist);
            setFormData({ name: artist.name, bio: artist.bio || '', image: null });
        } else {
            setEditingArtist(null);
            setFormData({ name: '', bio: '', image: null });
        }
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingArtist(null);
        setFormData({ name: '', bio: '', image: null });
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-gray-900/50 p-6 rounded-2xl border border-white/5 backdrop-blur-sm">
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-3 text-white">
                        <span className="p-3 bg-purple-500/10 text-purple-400 rounded-xl"><FaUserAstronaut size={24} /></span>
                        Manage Artists
                    </h2>
                    <p className="text-gray-400 mt-1 text-sm ml-14">Curate artist profiles and bios.</p>
                </div>
                <button
                    onClick={() => openModal()}
                    className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 px-6 rounded-xl flex items-center gap-2 transition-all shadow-lg hover:shadow-purple-500/25 hover:-translate-y-0.5"
                >
                    <FaPlus /> Add New Artist
                </button>
            </div>

            <div className="bg-[#121218] rounded-2xl overflow-hidden border border-white/5 shadow-xl">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-white/5 text-gray-400 uppercase text-xs font-bold tracking-wider">
                            <th className="p-6 font-semibold">ID</th>
                            <th className="p-6 font-semibold">Image</th>
                            <th className="p-6 font-semibold">Name</th>
                            <th className="p-6 font-semibold">Bio</th>
                            <th className="p-6 font-semibold text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {artists.map((artist) => (
                            <tr key={artist.id} className="hover:bg-white/5 transition-colors group">
                                <td className="p-6 text-gray-500 font-mono text-sm">#{artist.id}</td>
                                <td className="p-6">
                                    {artist.image_url ? (
                                        <img src={artist.image_url} alt={artist.name} className="w-12 h-12 rounded-full object-cover border-2 border-white/10 shadow-sm" />
                                    ) : (
                                        <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center text-gray-500 text-xs font-bold border-2 border-white/5">
                                            <FaUserAstronaut size={20} />
                                        </div>
                                    )}
                                </td>
                                <td className="p-6 text-white font-medium text-lg">{artist.name}</td>
                                <td className="p-6 text-gray-400 text-sm max-w-md truncate">{artist.bio || <span className="text-gray-600 italic">No bio available</span>}</td>
                                <td className="p-6 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button onClick={() => openModal(artist)} className="text-gray-500 hover:text-blue-400 hover:bg-blue-500/10 p-2.5 rounded-xl transition-all" title="Edit Artist">
                                            <FaEdit />
                                        </button>
                                        <button onClick={() => handleDelete(artist.id)} className="text-gray-500 hover:text-red-400 hover:bg-red-500/10 p-2.5 rounded-xl transition-all" title="Delete Artist">
                                            <FaTrash />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {artists.length === 0 && (
                    <div className="p-12 text-center text-gray-500 flex flex-col items-center">
                        <FaUserAstronaut size={48} className="text-gray-700 mb-4" />
                        <p className="text-lg">No artists found.</p>
                        <p className="text-sm">Add artists to start building your library.</p>
                    </div>
                )}
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                    <div className="bg-[#181820] p-8 rounded-3xl w-full max-w-lg shadow-2xl border border-white/10 transform transition-all scale-100 relative">
                        <div className="flex justify-between items-start mb-8">
                            <div>
                                <h3 className="text-3xl font-bold text-white">{editingArtist ? 'Edit Artist' : 'Add New Artist'}</h3>
                                <p className="text-gray-400 mt-1">Manage artist details and profile image.</p>
                            </div>
                            <button onClick={closeModal} className="text-gray-500 hover:text-white transition-colors">✕</button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-5">
                                <div>
                                    <label className="block text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        className="w-full p-3.5 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all font-medium"
                                        required
                                        placeholder="Artist Name"
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Bio</label>
                                    <textarea
                                        name="bio"
                                        value={formData.bio}
                                        onChange={handleInputChange}
                                        className="w-full p-3.5 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all font-medium h-32 resize-none"
                                        placeholder="Enter artist biography..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Profile Image</label>
                                    <input
                                        type="file"
                                        name="image"
                                        accept="image/*"
                                        onChange={handleInputChange}
                                        className="w-full p-3 rounded-xl bg-black/40 border border-white/10 text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-500 transition-all"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-white/10">
                                <button type="button" onClick={closeModal} className="px-6 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all font-medium">Cancel</button>
                                <button type="submit" className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 px-8 rounded-xl shadow-lg hover:shadow-purple-500/25 transition-all transform hover:-translate-y-0.5">
                                    {editingArtist ? 'Update Artist' : 'Create Artist'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageArtists;
