const AuthLayout = ({ children }) => {
  return (
    <div className="flex items-center justify-center min-h-screen">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-white mb-2">🎵 Music Streamer</h1>
          <p className="text-gray-400">Your favorite music, everywhere.</p>
        </div>
      <div className="w-full max-w-md p-8 bg-gray-900 bg-opacity-90 rounded-lg shadow-lg border border-gray-700">
        {children}
      </div>
    </div>
  );
};

export default AuthLayout;
