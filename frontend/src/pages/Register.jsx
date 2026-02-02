import { useState } from 'react';
import { registerUser } from '../api/musicAPI';
import { useNavigate, Link } from 'react-router-dom';
import { FaUserAlt, FaEnvelope, FaLock, FaRegIdBadge } from 'react-icons/fa';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: ''
  });

  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await registerUser(formData);
      // alert('Registration successful! Please login.'); // Can skip alert for cleaner UX
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[70vh]">
      <div className="glass p-8 rounded-2xl w-full max-w-md shadow-2xl">
        <h2 className="text-3xl font-bold text-center text-white mb-6">Create Account</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-200 text-sm p-3 rounded-lg text-center">
              {error}
            </div>
          )}

          {/* Name Field */}
          <div className="relative group">
            <FaRegIdBadge className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-400 transition-colors" />
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleChange}
              className="w-full p-4 pl-10 bg-white/5 border border-white/10 text-white rounded-xl focus:outline-none focus:border-purple-500 focus:bg-white/10 transition-all placeholder-gray-500"
              required
            />
          </div>

          {/* Username Field */}
          <div className="relative group">
            <FaUserAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-400 transition-colors" />
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              className="w-full p-4 pl-10 bg-white/5 border border-white/10 text-white rounded-xl focus:outline-none focus:border-purple-500 focus:bg-white/10 transition-all placeholder-gray-500"
              required
            />
          </div>

          {/* Email Field */}
          <div className="relative group">
            <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-400 transition-colors" />
            <input
              type="email"
              name="email"
              placeholder="Email address"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-4 pl-10 bg-white/5 border border-white/10 text-white rounded-xl focus:outline-none focus:border-purple-500 focus:bg-white/10 transition-all placeholder-gray-500"
              required
            />
          </div>

          {/* Password Field */}
          <div className="relative group">
            <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-400 transition-colors" />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="w-full p-4 pl-10 bg-white/5 border border-white/10 text-white rounded-xl focus:outline-none focus:border-purple-500 focus:bg-white/10 transition-all placeholder-gray-500"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full p-4 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-lg hover:shadow-purple-600/30 transform hover:-translate-y-0.5 transition-all duration-200 mt-2"
          >
            Sign Up
          </button>

          <p className="text-center text-gray-400 text-sm mt-4">
            Already have an account?{' '}
            <Link to="/login" className="text-purple-400 hover:text-purple-300 font-medium hover:underline transition">
              Log In
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Register;
