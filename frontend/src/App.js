import React, { useState } from 'react';
import { BrowserRouter } from 'react-router-dom';  
import Login from './login';
import Register from './register';
import Credentials from './credentials';
import axios from 'axios';

const App = () => {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [credentials, setCredentials] = useState([]); 


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

  React.useEffect(() => {
    if (token) fetchCredentials();  // Buscar credenciais quando o token for válido
  }, [token]);
  
  return (
    <BrowserRouter>
      <div>
        <h1>Password Manager</h1>
        {token ? (
          <>
            <Credentials credentials={credentials} />  {/* Passando as credenciais para o componente */}
          </>
        ) : (
          <>
            <Login setToken={setToken} />
            <Register />
          </>
        )}
      </div>
    </BrowserRouter>
  );
};

export default App;
