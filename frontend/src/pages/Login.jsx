import { useState } from 'react';
import { loginUser } from '../api/musicAPI';
import { useNavigate, Link } from 'react-router-dom';
import { FaEnvelope, FaLock } from 'react-icons/fa';
import { useUser } from '../hooks/useUser';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const { setUser } = useUser(); // Get setUser from context

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const data = await loginUser(formData);
      localStorage.setItem('token', data.token); // Save token
      setUser(data.user); // Update context

      // Redirect based on role
      if (data.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="glass p-8 rounded-2xl w-full max-w-md shadow-2xl">
        <h2 className="text-3xl font-bold text-center text-white mb-6">Welcome Back</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-200 text-sm p-3 rounded-lg text-center">
              {error}
            </div>
          )}

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
            className="w-full p-4 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-lg hover:shadow-purple-600/30 transform hover:-translate-y-0.5 transition-all duration-200"
          >
            Log In
          </button>

          <p className="text-center text-gray-400 text-sm">
            Don't have an account?{' '}
            <Link to="/register" className="text-purple-400 hover:text-purple-300 font-medium hover:underline">
              Create Account
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
