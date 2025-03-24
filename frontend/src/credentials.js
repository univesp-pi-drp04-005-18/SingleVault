import React, { useEffect, useState, useCallback } from 'react';
import { FaEye, FaEyeSlash, FaCopy, FaPlus } from 'react-icons/fa';

const CredenciaisList = () => {
  const [credentials, setCredentials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [revealedCredentials, setRevealedCredentials] = useState({});
  const [selectedCredential, setSelectedCredential] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newCredential, setNewCredential] = useState({
    name: '',
    owner: '',
    site: '',
    username: '',
    password: '',
    token: '',
    api_key: '',
    private_key: '',
    public_key: '',
    text: '',
  });
  const [copyMessage, setCopyMessage] = useState('');
  
  // Estados para a geração de senha
  const [passwordLength, setPasswordLength] = useState(12); // Tamanho da senha
  const [includeUppercase, setIncludeUppercase] = useState(true); // Maiúsculas
  const [includeLowercase, setIncludeLowercase] = useState(true); // Minúsculas
  const [includeSpecialChars, setIncludeSpecialChars] = useState(true); // Caracteres especiais

  // Função para gerar senha aleatória
  const generatePassword = () => {
    const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
    const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    const allChars = [
      ...(includeLowercase ? lowercaseChars : ''),
      ...(includeUppercase ? uppercaseChars : ''),
      ...(includeSpecialChars ? specialChars : ''),
    ];

    if (allChars.length === 0) {
      alert('Pelo menos uma categoria de caracteres deve ser selecionada!');
      return;
    }

    let password = '';
    for (let i = 0; i < passwordLength; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }

    setNewCredential((prev) => ({
      ...prev,
      password, // Define a senha gerada
    }));
  };

  // Função para buscar as credenciais do usuário
  const fetchCredentials = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Você precisa estar logado.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:8083/credentials', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Erro ao buscar credenciais');
      }

      const data = await response.json();
      setCredentials(data);
      setLoading(false);
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCredentials();
  }, [fetchCredentials]);

  const renderField = (field, label, fieldKey) => {
    if (!field) return null;
    return (
      <div style={{ display: 'flex', alignItems: 'center', marginTop: '5px' }}>
        <strong style={{ width: '150px' }}>{label}:</strong>
        <span>{revealedCredentials[fieldKey] ? field : '*****'}</span>
        <button onClick={() => copyToClipboard(field)} style={{ marginLeft: '10px' }}>
          <FaCopy />
        </button>
        <button onClick={() => toggleReveal(fieldKey)} style={{ marginLeft: '10px' }}>
          {revealedCredentials[fieldKey] ? <FaEyeSlash /> : <FaEye />}
        </button>
      </div>
    );
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopyMessage('Texto copiado!');
      setTimeout(() => setCopyMessage(''), 2000);
    });
  };

  const toggleReveal = (credentialKey) => {
    setRevealedCredentials((prevState) => ({
      ...prevState,
      [credentialKey]: !prevState[credentialKey],
    }));
  };

  const addCredential = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Você precisa estar logado.');
      return;
    }

    try {
      const response = await fetch('http://localhost:8083/credentials', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newCredential),
      });

      if (!response.ok) {
        throw new Error('Erro ao adicionar credencial');
      }

      const data = await response.json();
      setCredentials((prev) => [...prev, data]);
      setIsAdding(false);
      setNewCredential({
        name: '',
        owner: '',
        site: '',
        username: '',
        password: '',
        token: '',
        api_key: '',
        private_key: '',
        public_key: '',
        text: '',
      });
    } catch (error) {
      setError(error.message);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewCredential((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectCredential = (cred) => {
    setSelectedCredential(cred);
    setRevealedCredentials({});
  };

  if (loading) {
    return <div>Carregando...</div>;
  }

  if (error) {
    return <div>Erro: {error}</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'row', height: '100vh' }}>
      <div style={{ width: '300px', marginRight: '20px', padding: '20px', overflowY: 'auto', maxHeight: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
          <FaPlus onClick={() => setIsAdding(true)} style={{ cursor: 'pointer', marginRight: '10px' }} />
          <strong>Adicionar Credencial</strong>
        </div>

        {credentials.length > 0 ? (
          <div>
            {credentials.map((cred, index) => (
              <div
                key={index}
                style={{
                  marginBottom: '5px',
                  padding: '5px',
                  borderBottom: '1px solid #ccc',
                  cursor: 'pointer',
                  backgroundColor: selectedCredential?.name === cred.name ? '#f0f0f0' : 'transparent',
                }}
                onClick={() => handleSelectCredential(cred)}
              >
                {cred.name}
              </div>
            ))}
          </div>
        ) : (
          <p>Nenhuma credencial encontrada.</p>
        )}
      </div>

      <div style={{ flex: 1, padding: '10px', borderLeft: '1px solid #ccc', overflowY: 'auto', maxHeight: '100%' }}>
        {isAdding ? (
          <div>
            <h3>Adicionar Nova Credencial</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[ 
                { label: 'Nome', name: 'name' },
                { label: 'Url', name: 'site' },
                { label: 'Usuario', name: 'username' },
                { label: 'Senha', name: 'password', type: 'text' },
                { label: 'Token', name: 'token' },
                { label: 'API Key', name: 'api_key' },
                { label: 'Private Key', name: 'private_key' },
                { label: 'Public Key', name: 'public_key' },
                { label: 'Texto', name: 'text' },
              ].map(({ label, name, type = 'text' }) => (
                <div key={name} style={{ display: 'flex', alignItems: 'center' }}>
                  <label style={{ width: '100px', textAlign: 'right', marginRight: '10px' }}>{label}:</label>
                  <input
                    type={name === 'password' ? 'text' : type}
                    name={name}
                    value={newCredential[name]}
                    onChange={handleInputChange}
                    style={{ flex: 1, padding: '5px' }}
                  />
                </div>
              ))}
              
              {/* Campos de configuração de senha */}
              <div>
                <label>Tamanho da Senha:</label>
                <input
                  type="number"
                  value={passwordLength}
                  onChange={(e) => setPasswordLength(Number(e.target.value))}
                  min="8"
                  max="32"
                />
              </div>
              <div>
                <label>
                  <input
                    type="checkbox"
                    checked={includeUppercase}
                    onChange={() => setIncludeUppercase(!includeUppercase)}
                  />
                  Incluir Maiúsculas
                </label>
              </div>
              <div>
                <label>
                  <input
                    type="checkbox"
                    checked={includeLowercase}
                    onChange={() => setIncludeLowercase(!includeLowercase)}
                  />
                  Incluir Minúsculas
                </label>
              </div>
              <div>
                <label>
                  <input
                    type="checkbox"
                    checked={includeSpecialChars}
                    onChange={() => setIncludeSpecialChars(!includeSpecialChars)}
                  />
                  Incluir Caracteres Especiais
                </label>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', width: '12%', marginTop: '20px', marginLeft: 'auto', marginRight: 'auto' }}>
              <button onClick={generatePassword} style={{ padding: '8px 16px', backgroundColor: 'green', color: 'white' }}>Gerar Senha</button>
              <button onClick={() => setIsAdding(false)} style={{ padding: '8px 16px', backgroundColor: 'red', color: 'white' }}>Cancelar</button>
              <button onClick={addCredential} style={{ padding: '8px 16px', backgroundColor: 'green', color: 'white' }}>Salvar</button>
            </div>
          </div>
        ) : (
          <div>
            {selectedCredential && (
              <>
                <h3>{selectedCredential.name}</h3>
                {renderField(selectedCredential.site, 'Url', 'site')}
                {renderField(selectedCredential.password, 'Senha', 'password')}
                {renderField(selectedCredential.username, 'Usuario', 'username')}
                {renderField(selectedCredential.token, 'Token', 'token')}
                {renderField(selectedCredential.api_key, 'API Key', 'api_key')}
                {renderField(selectedCredential.private_key, 'Private Key', 'private_key')}
                {renderField(selectedCredential.public_key, 'Public Key', 'public_key')}
                {renderField(selectedCredential.text, 'Texto', 'text')}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CredenciaisList;
