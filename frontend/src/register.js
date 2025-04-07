// import React, { useState } from 'react';
// import axios from 'axios';

// const Register = () => {
//   const [username, setUsername] = useState('');
//   const [password, setPassword] = useState('');

//   const handleRegister = async () => {
//     try {
//       await axios.post('http://localhost:8083/users/register', {
//         username,
//         password,
//       });
//       alert('Usuário registrado com sucesso!');
//     } catch (error) {
//       alert('Erro ao registrar usuário');
//     }
//   };

//   return (
//     <div>
//       <h2>Register</h2>
//       <input
//         type="text"
//         placeholder="Username"
//         value={username}
//         onChange={(e) => setUsername(e.target.value)}
//       />
//       <input
//         type="password"
//         placeholder="Password"
//         value={password}
//         onChange={(e) => setPassword(e.target.value)}
//       />
//       <button onClick={handleRegister}>Register</button>
//     </div>
//   );
// };

// export default Register;
import React, { useState } from 'react';
import axios from 'axios';

const Register = ({ onSwitchView }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      await axios.post('http://localhost:8083/users/register', {
        username,
        password,
      });
      setSuccess(true);
    } catch (error) {
      setError(error.response?.data?.message || 'Erro ao registrar usuário');
      console.error('Registration error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <h2 style={styles.title}>Registro concluído!</h2>
          <p style={{...styles.success, textAlign: 'center'}}>
            Usuário registrado com sucesso.
          </p>
          <button 
            onClick={onSwitchView}
            style={styles.button}
          >
            Ir para Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Criar conta</h2>
        {error && <div style={styles.error}>{error}</div>}
        
        <form onSubmit={handleRegister} style={styles.form}>
          <div style={styles.inputGroup}>
            <label htmlFor="username" style={styles.label}>Username</label>
            <input
              id="username"
              type="text"
              placeholder="Escolha um username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              style={styles.input}
            />
          </div>
          
          <div style={styles.inputGroup}>
            <label htmlFor="password" style={styles.label}>Password</label>
            <input
              id="password"
              type="password"
              placeholder="Crie uma senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={styles.input}
            />
          </div>
          
          <button 
            type="submit" 
            style={styles.button}
            disabled={isLoading}
          >
            {isLoading ? 'Registrando...' : 'Criar conta'}
          </button>
        </form>
        
        <div style={styles.footer}>
          Já tem uma conta?{' '}
          <button 
            type="button" 
            onClick={onSwitchView}
            style={styles.linkButton}
          >
            Faça login
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
    padding: '20px',
  },
  card: {
    background: 'white',
    borderRadius: '16px',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
    padding: '40px',
    width: '100%',
    maxWidth: '400px',
  },
  title: {
    color: '#333',
    fontSize: '24px',
    fontWeight: '600',
    marginBottom: '30px',
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: '20px',
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    color: '#555',
    fontSize: '14px',
    fontWeight: '500',
  },
  input: {
    width: '90%',
    padding: '12px 15px',
    border: '1px solid #ddd',
    borderRadius: '10px',
    fontSize: '14px',
  },
  button: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#4a90e2',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '500',
    cursor: 'pointer',
    marginTop: '10px',
  },
  footer: {
    textAlign: 'center',
    marginTop: '20px',
    color: '#666',
    fontSize: '14px',
  },
  linkButton: {
    background: 'none',
    border: 'none',
    color: '#4a90e2',
    textDecoration: 'underline',
    cursor: 'pointer',
    fontSize: 'inherit',
    padding: '0',
  },
  error: {
    color: '#e74c3c',
    backgroundColor: '#fdecea',
    padding: '12px',
    borderRadius: '8px',
    marginBottom: '20px',
    fontSize: '14px',
  },
  success: {
    color: '#2ecc71',
    marginBottom: '20px',
  },
  form: {
    width: '100%',
  }
};

export default Register;