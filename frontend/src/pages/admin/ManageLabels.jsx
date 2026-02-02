import { useState, useEffect } from 'react';
import { fetchLabels, createLabel, updateLabel, deleteLabel } from '../../api/musicAPI';
import { FaTags, FaTrash, FaPlus, FaEdit, FaTimes } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

// Since deleteLabel wasn't in musicAPI yet, we'll implement it locally or update API.
// Let's update musicAPI first, but for now assuming it's there or using direct axios call if needed,
// but better to stick to pattern. I'll stick to pattern and update API file in next step if needed,
// but I remember seeing only fetch and create. I will assume I need to add delete.

const ManageLabels = () => {
    const [labels, setLabels] = useState([]);
    const [newLabel, setNewLabel] = useState({ name: '', color: '#3b82f6' });
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);

    useEffect(() => {
        loadLabels();
    }, []);

    const loadLabels = async () => {
        try {
            const data = await fetchLabels();
            setLabels(data);
        } catch (error) {
            console.error('Error loading labels:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (label) => {
        setNewLabel({ name: label.name, color: label.color });
        setIsEditing(true);
        setEditId(label.id);
    };

    const resetForm = () => {
        setNewLabel({ name: '', color: '#3b82f6' });
        setIsEditing(false);
        setEditId(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (!newLabel.name.trim()) return;

            if (isEditing) {
                await updateLabel(editId, newLabel);
            } else {
                await createLabel(newLabel);
            }

            resetForm();
            loadLabels();
            toast.success(isEditing ? 'Label updated successfully' : 'Label created successfully');
        } catch (error) {
            console.error('Error saving label:', error);
            toast.error('Failed to save label');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Delete this label?')) {
            try {
                await deleteLabel(id);
                setLabels(labels.filter(l => l.id !== id));
                toast.success('Label deleted successfully');
            } catch (error) {
                console.error('Error deleting label:', error);
                toast.error('Failed to delete label');
            }
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gray-900/50 p-6 rounded-2xl border border-white/5 backdrop-blur-sm">
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-3 text-white">
                        <span className="p-3 bg-yellow-500/10 text-yellow-400 rounded-xl"><FaTags size={24} /></span>
                        Manage Labels
                    </h2>
                    <p className="text-gray-400 mt-1 text-sm ml-14">Organize music by genre, mood, or category.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Create Label Form */}
                <div className="lg:col-span-1">
                    <div className="bg-[#181820] p-6 rounded-2xl border border-white/10 sticky top-6 shadow-xl">
                        <h3 className="text-xl font-bold mb-4 text-white flex items-center gap-2">
                            <span className="w-1 h-6 bg-yellow-500 rounded-full"></span>
                            {isEditing ? 'Edit Label' : 'Create New Label'}
                        </h3>
                        <p className="text-gray-500 text-sm mb-6">{isEditing ? 'Update label details.' : 'Add a new category to tag songs and albums.'}</p>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Label Name</label>
                                <input
                                    type="text"
                                    value={newLabel.name}
                                    onChange={(e) => setNewLabel({ ...newLabel, name: e.target.value })}
                                    className="w-full p-3.5 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-all font-medium placeholder-gray-600"
                                    placeholder="e.g. Pop, Summer Hits"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Color Tag</label>
                                <div className="flex gap-3 items-center">
                                    <input
                                        type="color"
                                        value={newLabel.color}
                                        onChange={(e) => setNewLabel({ ...newLabel, color: e.target.value })}
                                        className="h-12 w-16 rounded-lg cursor-pointer bg-transparent border-0 p-1 hover:bg-white/5 transition-colors"
                                    />
                                    <div className="text-sm text-gray-400">
                                        Selected: <span style={{ color: newLabel.color }} className="font-mono font-bold">{newLabel.color}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-2 mt-2">
                                <button
                                    type="submit"
                                    className="flex-1 bg-yellow-600 hover:bg-yellow-500 text-white font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-yellow-500/25 hover:-translate-y-0.5"
                                >
                                    {isEditing ? <FaEdit /> : <FaPlus />}
                                    {isEditing ? 'Update Label' : 'Create Label'}
                                </button>
                                {isEditing && (
                                    <button
                                        type="button"
                                        onClick={resetForm}
                                        className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center transition-all"
                                        title="Cancel Edit"
                                    >
                                        <FaTimes />
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>

                {/* Labels List */}
                <div className="lg:col-span-2">
                    <div className="bg-[#121218] rounded-2xl border border-white/5 shadow-xl overflow-hidden p-6">
                        <h3 className="text-lg font-semibold text-white mb-4">Existing Labels ({labels.length})</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {labels.map((label) => (
                                <div key={label.id} className="bg-white/5 hover:bg-white/10 p-4 rounded-xl border border-white/5 flex justify-between items-center group transition-all">
                                    <div className="flex items-center gap-4">
                                        <div
                                            className="w-10 h-10 rounded-xl shadow-lg flex items-center justify-center text-white"
                                            style={{ backgroundColor: label.color }}
                                        >
                                            <FaTags size={14} className="opacity-80" />
                                        </div>
                                        <div>
                                            <span className="font-bold text-white block">{label.name}</span>
                                            <span className="text-xs text-gray-500 font-mono" style={{ color: label.color }}>{label.color}</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleEdit(label)}
                                        className="text-gray-600 hover:text-blue-400 hover:bg-blue-500/10 p-2.5 rounded-xl transition-all opacity-0 group-hover:opacity-100 mr-1"
                                        title="Edit Label"
                                    >
                                        <FaEdit />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(label.id)}
                                        className="text-gray-600 hover:text-red-400 hover:bg-red-500/10 p-2.5 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                                        title="Delete Label"
                                    >
                                        <FaTrash />
                                    </button>
                                </div>
                            ))}
                            {labels.length === 0 && (
                                <div className="col-span-full p-12 text-center text-gray-500 flex flex-col items-center border-2 border-dashed border-white/10 rounded-2xl">
                                    <FaTags size={32} className="text-gray-700 mb-3" />
                                    <p>No labels found.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManageLabels;
