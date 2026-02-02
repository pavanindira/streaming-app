import { useState, useEffect } from 'react';
import { fetchAllUsers, deleteUser, createUser, updateUser } from '../../api/musicAPI';
import { useUser } from '../../hooks/useUser';
import { FaTrash, FaUser, FaPlus, FaTimes, FaEdit } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const { user: currentUser } = useUser();

  const [newUser, setNewUser] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    role: 'listener'
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await fetchAllUsers();
      setUsers(data);
    } catch (error) {
      console.error('Failed to load users:', error);
    }
  };

  const handleDelete = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await deleteUser(userId);
        setUsers(users.filter((user) => user.id !== userId));
        toast.success('User deleted successfully');
      } catch (error) {
        console.error('Failed to delete user:', error);
        toast.error('Failed to delete user');
      }
    }
  };

  const handleInputChange = (e) => {
    setNewUser({ ...newUser, [e.target.name]: e.target.value });
  };

  const handleEdit = (user) => {
    setNewUser({
      name: user.name,
      username: user.username,
      email: user.email,
      password: '', // Don't show existing password
      role: user.role
    });
    setIsEditing(true);
    setEditId(user.id);
    setShowModal(true);
  };

  const resetForm = () => {
    setNewUser({
      name: '',
      username: '',
      email: '',
      password: '',
      role: 'listener'
    });
    setIsEditing(false);
    setEditId(null);
    setShowModal(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        // Only send password if provided
        const userData = { ...newUser };
        if (!userData.password) delete userData.password;
        await updateUser(editId, userData);
      } else {
        await createUser(newUser);
      }

      loadUsers();
      resetForm();
      toast.success(isEditing ? 'User updated successfully' : 'User created successfully');
    } catch (error) {
      console.error('Failed to save user:', error);
      toast.error('Failed to save user: ' + (error.response?.data?.message || error.message));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-gray-900/50 p-6 rounded-2xl border border-white/5 backdrop-blur-sm">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-3 text-white">
            <span className="p-3 bg-blue-500/10 text-blue-400 rounded-xl"><FaUser size={24} /></span>
            Manage Users
          </h2>
          <p className="text-gray-400 mt-1 text-sm ml-14">Oversee user accounts and permissions.</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-xl flex items-center gap-2 transition-all shadow-lg hover:shadow-blue-500/25 hover:-translate-y-0.5"
        >
          <FaPlus /> Add New User
        </button>
      </div>

      <div className="bg-[#121218] rounded-2xl overflow-hidden border border-white/5 shadow-xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/5 text-gray-400 uppercase text-xs font-bold tracking-wider">
              <th className="p-6 font-semibold">ID</th>
              <th className="p-6 font-semibold">Name</th>
              <th className="p-6 font-semibold">Email</th>
              <th className="p-6 font-semibold">Role</th>
              <th className="p-6 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-white/5 transition-colors group">
                <td className="p-6 text-gray-500 font-mono text-sm">#{user.id}</td>
                <td className="p-6 text-white font-medium flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white uppercase">
                    {user.name.charAt(0)}
                  </div>
                  {user.name}
                </td>
                <td className="p-6 text-gray-400 font-medium">{user.email}</td>
                <td className="p-6">
                  <span
                    className={`px-3 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold border ${user.role === 'admin'
                      ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                      : user.role === 'artist'
                        ? 'bg-green-500/10 text-green-400 border-green-500/20'
                        : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                      }`}
                  >
                    {user.role}
                  </span>
                </td>
                <td className="p-6 text-right">
                  <button
                    onClick={() => handleEdit(user)}
                    className="text-gray-500 hover:text-blue-400 hover:bg-blue-500/10 p-2.5 rounded-xl transition-all mr-2"
                    title="Edit User"
                  >
                    <FaEdit />
                  </button>
                  {user.id !== currentUser.id && (
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="text-gray-500 hover:text-red-400 hover:bg-red-500/10 p-2.5 rounded-xl transition-all"
                      title="Delete User"
                    >
                      <FaTrash />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && (
          <div className="p-12 text-center text-gray-500 flex flex-col items-center">
            <FaUser size={48} className="text-gray-700 mb-4" />
            <p className="text-lg">No users found.</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-[#181820] p-8 rounded-3xl w-full max-w-lg shadow-2xl border border-white/10 transform transition-all scale-100 relative">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h3 className="text-3xl font-bold text-white">{isEditing ? 'Edit User' : 'Add New User'}</h3>
                <p className="text-gray-400 mt-1">{isEditing ? 'Update user details.' : 'Create a new account manually.'}</p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-white transition-colors">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-5">
                <div>
                  <label className="block text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    placeholder="John Doe"
                    value={newUser.name}
                    onChange={handleInputChange}
                    className="w-full p-3.5 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium placeholder-gray-600"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Username</label>
                  <input
                    type="text"
                    name="username"
                    placeholder="johndoe"
                    value={newUser.username}
                    onChange={handleInputChange}
                    className="w-full p-3.5 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium placeholder-gray-600"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    placeholder="john@example.com"
                    value={newUser.email}
                    onChange={handleInputChange}
                    className="w-full p-3.5 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium placeholder-gray-600"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Password</label>
                  <input
                    type="password"
                    name="password"
                    placeholder="********"
                    value={newUser.password}
                    onChange={handleInputChange}
                    className="w-full p-3.5 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium placeholder-gray-600"
                    required={!isEditing}
                    minLength={6}
                  />
                  {isEditing && <p className="text-xs text-gray-500 mt-1">Leave blank to keep current password</p>}
                </div>
                <div>
                  <label className="block text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Role</label>
                  <select
                    name="role"
                    value={newUser.role}
                    onChange={handleInputChange}
                    className="w-full p-3.5 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium appearance-none"
                  >
                    <option value="listener">Listener</option>
                    <option value="artist">Artist</option>
                    <option value="admin">Admin</option>
                  </select>
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
                  className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-8 rounded-xl shadow-lg hover:shadow-blue-500/25 transition-all transform hover:-translate-y-0.5"
                >
                  {isEditing ? 'Update User' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageUsers;
