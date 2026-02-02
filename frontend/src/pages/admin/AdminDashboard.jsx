import { useState, useEffect } from 'react';
import { FaMusic, FaCompactDisc, FaUsers, FaMicrophone, FaTags, FaPlus } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { fetchSongs, fetchAlbums, fetchArtists, fetchLabels, fetchUsers, getAdminStats } from '../../api/musicAPI';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    songs: 0,
    albums: 0,
    artists: 0,
    users: 0,
    labels: 0,
    analytics: {
      userGrowth: [],
      songsByGenre: [],
      userRoles: []
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      // Use the dedicated admin stats endpoint for efficiency
      const statsData = await getAdminStats();

      setStats({
        songs: statsData.songs,
        albums: statsData.albums,
        artists: statsData.artists,
        users: statsData.users,
        labels: 0,
        analytics: statsData.analytics || { userGrowth: [], songsByGenre: [], userRoles: [] }
      });

      // Fetch labels separately if needed, or update backend to include them
      // const labelsData = await fetchLabels(); 
      // setStats(prev => ({ ...prev, labels: labelsData.length }));

    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, count, icon: Icon, color, link, linkText }) => (
    <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] group">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl bg-opacity-20 ${color.bg} ${color.text}`}>
          <Icon size={24} />
        </div>
        {link && (
          <Link to={link} className="text-gray-400 hover:text-white text-sm transition-colors flex items-center gap-1 group-hover:translate-x-1 transition-transform">
            {linkText} &rarr;
          </Link>
        )}
      </div>
      <h3 className="text-gray-400 text-sm font-medium uppercase tracking-wider">{title}</h3>
      <p className="text-3xl font-bold text-white mt-1">{loading ? '...' : count}</p>
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-gray-400">Welcome back, Admin. Here's what's happening today.</p>
        </div>
        <div className="flex gap-3">
          <Link to="/admin/songs" className="bg-purple-600 hover:bg-purple-500 text-white px-5 py-2.5 rounded-xl font-semibold shadow-lg hover:shadow-purple-500/25 transition-all flex items-center gap-2">
            <FaPlus size={14} /> Add Song
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Songs"
          count={stats.songs}
          icon={FaMusic}
          color={{ bg: 'bg-blue-500', text: 'text-blue-400' }}
          link="/admin/songs"
          linkText="Manage Songs"
        />
        <StatCard
          title="Total Albums"
          count={stats.albums}
          icon={FaCompactDisc}
          color={{ bg: 'bg-purple-500', text: 'text-purple-400' }}
          link="/admin/albums"
          linkText="Manage Albums"
        />
        <StatCard
          title="Total Artists"
          count={stats.artists}
          icon={FaMicrophone}
          color={{ bg: 'bg-pink-500', text: 'text-pink-400' }}
          link="/admin/artists"
          linkText="Manage Artists"
        />
        <StatCard
          title="Total Users"
          count={stats.users}
          icon={FaUsers}
          color={{ bg: 'bg-green-500', text: 'text-green-400' }}
          link="/admin/users"
          linkText="Manage Users"
        />
      </div>

      {/* Charts Section */}
      {!loading && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* User Growth */}
          <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 shadow-lg">
            <h3 className="text-xl font-bold text-white mb-4">User Growth</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.analytics.userGrowth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none' }} itemStyle={{ color: '#fff' }} />
                  <Line type="monotone" dataKey="users" stroke="#8884d8" name="New Users" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Songs by Genre */}
          <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 shadow-lg">
            <h3 className="text-xl font-bold text-white mb-4">Songs by Genre</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.analytics.songsByGenre}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="genre" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none' }} cursor={{ fill: '#374151' }} itemStyle={{ color: '#fff' }} />
                  <Bar dataKey="count" fill="#82ca9d" name="Songs" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* User Roles Dist */}
          <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 shadow-lg lg:col-span-2">
            <h3 className="text-xl font-bold text-white mb-4">User Distribution</h3>
            <div className="h-64 flex justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.analytics.userRoles}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="count"
                    nameKey="role"
                    label
                  >
                    {stats.analytics.userRoles?.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none' }} itemStyle={{ color: '#fff' }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions / Getting Started */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-gray-800 rounded-2xl p-6 border border-gray-700">
          <h3 className="text-xl font-bold text-white mb-6">Quick Actions</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <Link to="/admin/songs" className="p-4 bg-gray-900 rounded-xl hover:bg-gray-750 border border-gray-700 hover:border-gray-600 transition-all text-center group">
              <div className="w-10 h-10 mx-auto bg-blue-500/10 text-blue-400 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <FaPlus />
              </div>
              <span className="text-gray-300 font-medium group-hover:text-white">New Song</span>
            </Link>
            <Link to="/admin/albums" className="p-4 bg-gray-900 rounded-xl hover:bg-gray-750 border border-gray-700 hover:border-gray-600 transition-all text-center group">
              <div className="w-10 h-10 mx-auto bg-purple-500/10 text-purple-400 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <FaPlus />
              </div>
              <span className="text-gray-300 font-medium group-hover:text-white">New Album</span>
            </Link>
            <Link to="/admin/artists" className="p-4 bg-gray-900 rounded-xl hover:bg-gray-750 border border-gray-700 hover:border-gray-600 transition-all text-center group">
              <div className="w-10 h-10 mx-auto bg-pink-500/10 text-pink-400 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <FaPlus />
              </div>
              <span className="text-gray-300 font-medium group-hover:text-white">New Artist</span>
            </Link>
            <Link to="/admin/labels" className="p-4 bg-gray-900 rounded-xl hover:bg-gray-750 border border-gray-700 hover:border-gray-600 transition-all text-center group">
              <div className="w-10 h-10 mx-auto bg-yellow-500/10 text-yellow-400 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <FaTags />
              </div>
              <span className="text-gray-300 font-medium group-hover:text-white">New Label</span>
            </Link>
            <Link to="/admin/users" className="p-4 bg-gray-900 rounded-xl hover:bg-gray-750 border border-gray-700 hover:border-gray-600 transition-all text-center group">
              <div className="w-10 h-10 mx-auto bg-green-500/10 text-green-400 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <FaUsers />
              </div>
              <span className="text-gray-300 font-medium group-hover:text-white">Manage Users</span>
            </Link>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-900/50 to-blue-900/50 rounded-2xl p-6 border border-white/10 relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-xl font-bold text-white mb-2">Pro Tip</h3>
            <p className="text-gray-300 mb-6 text-sm">Use "Featured Content" to promote new albums or tracks directly to the Home Page hero section.</p>
            <Link to="/admin/songs" className="inline-block bg-white text-purple-900 font-bold py-2 px-4 rounded-lg text-sm hover:bg-gray-100 transition-colors">
              Promote a Song
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
