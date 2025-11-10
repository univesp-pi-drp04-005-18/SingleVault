// import React, { useState, useEffect } from 'react';
// import { BrowserRouter } from 'react-router-dom';
// import Auth from './Auth';
// import Credentials from './credentials';
// import axios from 'axios';

// const App = () => {
//   const [token, setToken] = useState(() => localStorage.getItem('token') || '');
//   const [credentials, setCredentials] = useState([]);

//   useEffect(() => {
//     const fetchCredentials = async () => {
//       try {
//         const response = await axios.get('/api/credentials', {
//           headers: { Authorization: `Bearer ${token}` }
//         });
//         setCredentials(response.data);
//       } catch (error) {
//         console.error('Erro ao buscar credenciais:', error);
//       }
//     };

//     if (token) {
//       fetchCredentials();
//     }
//   }, [token]);

  

//   return (
//     <BrowserRouter>
//       <div>
//         {token ? (
//           <>
//             <Credentials credentials={credentials} />
//           </>
//         ) : (
//           <Auth setToken={setToken} />
//         )}
//       </div>
//     </BrowserRouter>
//   );
// };

// export default App;


import React, { useState, useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import Auth from './Auth';
import Credentials from './credentials';
import axios from 'axios';
import { useTheme } from './hooks/useTheme';

const App = () => {
  const [token, setToken] = useState(() => localStorage.getItem('token') || '');
  const [credentials, setCredentials] = useState([]);
  const { theme, toggleTheme } = useTheme();

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
      <div
        style={{
          backgroundColor: 'var(--bg-color)',
          color: 'var(--text-color)',
          minHeight: '100vh',
          transition: 'background-color 0.3s ease, color 0.3s ease'
        }}
      >
        <header style={{ padding: '10px', textAlign: 'right' }}>
          <button
            onClick={toggleTheme}
            style={{
              background: 'none',
              border: '1px solid var(--text-color)',
              borderRadius: '8px',
              padding: '6px 12px',
              color: 'var(--text-color)',
              cursor: 'pointer'
            }}
          >
            {theme === 'light' ? '🌙 Escuro' : '☀️ Claro'}
          </button>
        </header>

        {token ? (
          <Credentials credentials={credentials} />
        ) : (
          <Auth setToken={setToken} />
        )}
      </div>
    </BrowserRouter>
  );
};

export default App;
