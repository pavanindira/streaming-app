import { Link } from 'react-router-dom';
import { FaLock } from 'react-icons/fa';

const NotAuthorized = () => {

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white text-center p-4">
      <FaLock className="text-6xl text-red-500 mb-6" />
      <h1 className="text-4xl font-bold mb-4">Access Denied</h1>
      <p className="text-gray-400 text-lg mb-8 max-w-md">
        You do not have permission to view this page. This area is restricted to administrators only.
      </p>

      {/* Debug Info Section Removed */}

      <Link
        to="/"
        className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-8 rounded-full transition-colors"
      >
        Go Home
      </Link>
    </div>
  );
};

export default NotAuthorized;
