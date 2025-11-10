import React, { useState, useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import Auth from './Auth';
import Credentials from './credentials';
import axios from 'axios';

const App = () => {
  const [token, setToken] = useState(() => localStorage.getItem('token') || '');
  const [credentials, setCredentials] = useState([]);

  useEffect(() => {
    const fetchCredentials = async () => {
      try {
        const response = await axios.get('/api/credentials', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCredentials(response.data);
      } catch (error) {
        console.error('Erro ao buscar credenciais:', error);
      }
    };

    if (token) {
      fetchCredentials();
    }
  }, [token]);

  

  return (
    <BrowserRouter>
      <div>
        {token ? (
          <>
            <Credentials credentials={credentials} />
          </>
        ) : (
          <Auth setToken={setToken} />
        )}
      </div>
    </BrowserRouter>
  );
};

export default App;