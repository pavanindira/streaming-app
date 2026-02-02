import { useState, useEffect } from 'react';
import axios from 'axios';
import { UserContext } from '../hooks/useUser';

const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch user data from API
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token'); // Assuming token is stored in localStorage
        if (token) {
          const response = await axios.get('/api/users/me', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          setUser(response.data); // Set user data from API response
        }
      } catch (error) {
        console.error('Failed to fetch user data:', error);
        if (error.response && error.response.status === 401) {
          localStorage.removeItem('token');
        }
        setUser(null); // Clear user data on error
      } finally {
        setLoading(false); // Set loading to false after fetch is complete (success or failure)
      }
    };
    fetchUser();
  }, []);

  // Logout handler
  const logout = () => {
    localStorage.removeItem('token'); // Remove token from localStorage
    setUser(null);
  };

  return (
    <UserContext.Provider value={{ user, setUser, logout, loading }}>
      {children}
    </UserContext.Provider>
  );
};

export default UserProvider;
