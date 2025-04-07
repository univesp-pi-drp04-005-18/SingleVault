import React, { useEffect, useState, useCallback } from 'react';
import { 
  FaEye, 
  FaEyeSlash, 
  FaCopy, 
  FaPlus, 
  FaSearch, 
  FaEdit, 
  FaTrash, 
  FaUser, 
  FaSignOutAlt 
} from 'react-icons/fa';

const CredentialField = ({ field, label, fieldKey, revealed, onToggleReveal, onCopy }) => {
  if (!field) return null;

  return (
    <div style={{ display: 'flex', alignItems: 'center', marginTop: '10px', padding: '5px', backgroundColor: '#f9f9f9', borderRadius: '4px' }}>
      <strong style={{ width: '150px' }}>{label}:</strong>
      <span>{revealed ? field : '••••••••'}</span>
      <button 
        onClick={() => onCopy(field)} 
        style={{ marginLeft: '10px', padding: '5px', border: 'none', background: 'none', cursor: 'pointer' }}
        title="Copiar"
      >
        <FaCopy />
      </button>
      <button 
        onClick={() => onToggleReveal(fieldKey)} 
        style={{ marginLeft: '10px', padding: '5px', border: 'none', background: 'none', cursor: 'pointer' }}
        title={revealed ? "Ocultar" : "Revelar"}
      >
        {revealed ? <FaEyeSlash /> : <FaEye />}
      </button>
    </div>
  );
};

const PasswordGenerator = ({ 
  passwordLength, 
  setPasswordLength,
  includeUppercase,
  setIncludeUppercase,
  includeLowercase,
  setIncludeLowercase,
  includeSpecialChars,
  setIncludeSpecialChars,
  onGenerate
}) => {
  return (
    <div style={{ marginTop: '20px', padding: '15px', border: '1px solid #eee', borderRadius: '4px' }}>
      <h4>Gerador de Senha</h4>
      <div style={{ marginBottom: '10px' }}>
        <label>Tamanho: </label>
        <input
          type="number"
          value={passwordLength}
          onChange={(e) => setPasswordLength(Number(e.target.value))}
          min="8"
          max="32"
          style={{ padding: '8px', marginLeft: '10px' }}
        />
      </div>
      <div style={{ marginBottom: '5px' }}>
        <label>
          <input 
            type="checkbox" 
            checked={includeUppercase} 
            onChange={() => setIncludeUppercase(!includeUppercase)} 
          />
          Incluir Maiúsculas
        </label>
      </div>
      <div style={{ marginBottom: '5px' }}>
        <label>
          <input 
            type="checkbox" 
            checked={includeLowercase} 
            onChange={() => setIncludeLowercase(!includeLowercase)} 
          />
          Incluir Minúsculas
        </label>
      </div>
      <div style={{ marginBottom: '15px' }}>
        <label>
          <input 
            type="checkbox" 
            checked={includeSpecialChars} 
            onChange={() => setIncludeSpecialChars(!includeSpecialChars)} 
          />
          Incluir Caracteres Especiais
        </label>
      </div>
      <button 
        onClick={onGenerate}
        style={{ 
          padding: '8px 16px', 
          backgroundColor: '#4caf50', 
          color: 'white', 
          border: 'none', 
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Gerar Senha
      </button>
    </div>
  );
};

const CredenciaisList = () => {
  const [credentials, setCredentials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [revealedCredentials, setRevealedCredentials] = useState({});
  const [selectedCredential, setSelectedCredential] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [copyMessage, setCopyMessage] = useState('');
  const [username, setUsername] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmReveal, setConfirmReveal] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [editData, setEditData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [apiError, setApiError] = useState('');
  const [apiSuccess, setApiSuccess] = useState('');

  const [currentCredential, setCurrentCredential] = useState({
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

  const [passwordLength, setPasswordLength] = useState(12);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeLowercase, setIncludeLowercase] = useState(true);
  const [includeSpecialChars, setIncludeSpecialChars] = useState(true);

  const generatePassword = useCallback(() => {
    const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
    const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    const allChars = [
      ...(includeLowercase ? lowercaseChars : ''),
      ...(includeUppercase ? uppercaseChars : ''),
      ...(includeSpecialChars ? specialChars : ''),
    ];

    if (allChars.length === 0) {
      setError('Pelo menos uma categoria de caracteres deve ser selecionada!');
      return;
    }

    let password = '';
    for (let i = 0; i < passwordLength; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }

    setCurrentCredential(prev => ({
      ...prev,
      password,
    }));
  }, [passwordLength, includeLowercase, includeUppercase, includeSpecialChars]);

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
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Erro ao buscar credenciais');
      }

      const data = await response.json();
      setCredentials(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const user = localStorage.getItem('username');
    if (user) setUsername(user);
    fetchCredentials();
  }, [fetchCredentials]);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopyMessage('Copiado para a área de transferência!');
      setTimeout(() => setCopyMessage(''), 3000);
    });
  };

  const toggleReveal = (credentialKey) => {
    if (!revealedCredentials[credentialKey]) {
      setConfirmReveal(credentialKey);
      return;
    }
    
    setRevealedCredentials(prev => ({
      ...prev,
      [credentialKey]: !prev[credentialKey],
    }));
  };

  const confirmRevealAction = () => {
    setRevealedCredentials(prev => ({
      ...prev,
      [confirmReveal]: true,
    }));
    setConfirmReveal(null);
  };

  const addCredential = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Você precisa estar logado.');
      return;
    }

    if (!currentCredential.name.trim()) {
      setError('O nome da credencial é obrigatório');
      return;
    }

    try {
      const credentialToSend = {
        ...currentCredential,
        owner: localStorage.getItem('username') || '',
      };

      const response = await fetch('http://localhost:8083/credentials', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentialToSend),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.detail || 'Erro ao adicionar credencial');
      }

      await fetchCredentials();
      setIsAdding(false);
      resetCredentialForm();
      setError(null);
      
    } catch (error) {
      console.error('Erro ao adicionar credencial:', error);
      setError(error.message);
    }
  };

  const updateCredential = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Você precisa estar logado.');
      return;
    }

    try {
      const credentialToSend = {
        ...currentCredential,
        owner: localStorage.getItem('username') || '',
      };

      const response = await fetch(`http://localhost:8083/credentials/${selectedCredential.name}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentialToSend),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.detail || 'Erro ao atualizar credencial');
      }

      await fetchCredentials();
      setIsEditing(false);
      resetCredentialForm();
      setError(null);
    } catch (error) {
      console.error('Erro ao atualizar credencial:', error);
      setError(error.message);
    }
  };

  const deleteCredential = async () => {
    if (!window.confirm('Tem certeza que deseja excluir esta credencial?')) return;

    const token = localStorage.getItem('token');
    if (!token) {
      setError('Você precisa estar logado.');
      return;
    }

    try {
      const response = await fetch(`http://localhost:8083/credentials/${selectedCredential.name}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Erro ao excluir credencial');
      }

      await fetchCredentials();
      setSelectedCredential(null);
      setIsEditing(false);
      setError(null);
    } catch (error) {
      console.error('Erro ao excluir credencial:', error);
      setError(error.message);
    }
  };

  const resetCredentialForm = () => {
    setCurrentCredential({
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
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentCredential(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectCredential = (cred) => {
    setSelectedCredential(cred);
    setRevealedCredentials({});
    setIsEditing(false);
  };

  const handleEditCredential = () => {
    setCurrentCredential({ ...selectedCredential });
    setIsEditing(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    window.location.href = '/login';
  };

  const handleDeleteAccount = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Você precisa estar logado.');
        return;
      }

      if (!deletePassword) {
        setApiError('Por favor, digite sua senha para confirmar a exclusão');
        return;
      }

      const response = await fetch('http://localhost:8083/users/delete', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          password: deletePassword
        }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.detail || 'Senha incorreta. A conta não foi excluída.');
      }

      // Verifica explicitamente se a conta foi realmente excluída
      if (!responseData.success) {
        throw new Error('Falha ao excluir conta.');
      }

      // Só faz logout se a exclusão foi confirmada
      handleLogout();
    } catch (error) {
      console.error('Erro ao excluir conta:', error);
      setApiError(error.message);
      setDeletePassword('');
    }
  };

  const handleChangePassword = async () => {
    try {
      if (editData.newPassword !== editData.confirmPassword) {
        throw new Error('As senhas não coincidem');
      }

      const token = localStorage.getItem('token');
      if (!token) {
        setError('Você precisa estar logado.');
        return;
      }

      const response = await fetch('http://localhost:8083/users/update', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          current_password: editData.currentPassword,
          new_password: editData.newPassword
        }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.detail || 'Erro ao alterar senha');
      }

      if (!responseData.success) {
        throw new Error('Falha ao alterar senha.');
      }

      setShowPasswordModal(false);
      setApiSuccess('Senha alterada com sucesso!');
      setTimeout(() => setApiSuccess(''), 3000);
    } catch (error) {
      console.error('Erro ao alterar senha:', error);
      setApiError(error.message);
    }
  };

  const filteredCredentials = credentials.filter(cred => 
    cred.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (cred.site && cred.site.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (cred.username && cred.username.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) return <div>Carregando...</div>;
  if (error) return <div>Erro: {error}</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* Navbar */}
      <div style={{ 
        height: '50px', 
        backgroundColor: '#333', 
        color: '#fff', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        padding: '0 20px',
        position: 'relative'
      }}>
        <div><strong>Minhas Credenciais</strong></div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ position: 'relative' }}>
            <button 
              onClick={() => setShowUserMenu(!showUserMenu)}
              style={{ 
                background: 'none', 
                border: 'none', 
                color: '#fff', 
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                padding: '5px',
                fontSize: '0.9em'
              }}
            >
              <FaUser style={{ marginRight: '5px' }} />
              {username}
            </button>
            
            {showUserMenu && (
              <div style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                backgroundColor: '#fff',
                color: '#333',
                borderRadius: '4px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
                zIndex: 100,
                minWidth: '200px'
              }}>
                <div style={{ padding: '10px', borderBottom: '1px solid #eee' }}>
                  <strong>{username}</strong>
                </div>
                <button 
                  onClick={() => {
                    setShowPasswordModal(true);
                    setShowUserMenu(false);
                    setEditData({
                      currentPassword: '',
                      newPassword: '',
                      confirmPassword: ''
                    });
                    setApiError('');
                  }}
                  style={{
                    width: '100%',
                    padding: '10px',
                    textAlign: 'left',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <FaEdit /> Alterar Senha
                </button>
                <button 
                  onClick={() => {
                    setShowDeleteAccountModal(true);
                    setShowUserMenu(false);
                    setApiError('');
                    setDeletePassword('');
                  }}
                  style={{
                    width: '100%',
                    padding: '10px',
                    textAlign: 'left',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: '#f44336'
                  }}
                >
                  <FaTrash /> Excluir Conta
                </button>
                <button 
                  onClick={handleLogout}
                  style={{
                    width: '100%',
                    padding: '10px',
                    textAlign: 'left',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    borderTop: '1px solid #eee'
                  }}
                >
                  <FaSignOutAlt /> Sair
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {apiSuccess && (
        <div style={{
          backgroundColor: '#4caf50',
          color: 'white',
          padding: '10px 20px',
          textAlign: 'center',
          margin: '0 auto',
          borderRadius: '4px',
          maxWidth: '80%',
          marginTop: '10px'
        }}>
          {apiSuccess}
        </div>
      )}

      {/* Conteúdo Principal */}
      <div style={{ display: 'flex', flex: 1 }}>
        {/* Sidebar */}
        <div style={{ 
          width: '300px', 
          marginRight: '20px', 
          padding: '20px', 
          overflowY: 'auto', 
          maxHeight: '100%', 
          backgroundColor: '#f5f5f5' 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
            <button 
              onClick={() => { 
                setIsAdding(true); 
                setIsEditing(false); 
                setSelectedCredential(null);
                resetCredentialForm();
              }}
              style={{
                padding: '8px 16px', 
                backgroundColor: '#4caf50', 
                color: 'white', 
                border: 'none', 
                borderRadius: '4px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <FaPlus style={{ marginRight: '5px' }} /> Adicionar
            </button>
          </div>

          <div style={{ display: 'flex', marginBottom: '20px', alignItems: 'center' }}>
            <input 
              type="text" 
              placeholder="Buscar credenciais..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ 
                flex: 1, 
                padding: '8px', 
                border: '1px solid #ddd', 
                borderRadius: '4px' 
              }}
            />
            <button style={{ 
              marginLeft: '10px', 
              padding: '8px', 
              border: 'none', 
              background: 'none', 
              cursor: 'pointer' 
            }}>
              <FaSearch />
            </button>
          </div>

          {filteredCredentials.length > 0 ? (
            filteredCredentials.map((cred) => (
              <div 
                key={cred.name}
                style={{
                  marginBottom: '5px',
                  padding: '10px',
                  borderBottom: '1px solid #ddd',
                  cursor: 'pointer',
                  backgroundColor: selectedCredential?.name === cred.name ? '#e0e0e0' : 'transparent',
                  transition: 'background-color 0.2s',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
                onClick={() => handleSelectCredential(cred)}
              >
                <div>{cred.name}</div>
              </div>
            ))
          ) : (
            <p>{searchTerm ? 'Nenhuma credencial encontrada.' : 'Nenhuma credencial cadastrada.'}</p>
          )}
        </div>

        {/* Painel de Detalhes */}
        <div style={{ 
          flex: 1, 
          padding: '20px', 
          borderLeft: '1px solid #ccc', 
          overflowY: 'auto', 
          maxHeight: '100%' 
        }}>
          {isAdding || isEditing ? (
            <div>
              <h3>{isEditing ? 'Editar Credencial' : 'Adicionar Nova Credencial'}</h3>
              {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {[
                  { label: 'Nome', name: 'name', required: true },
                  { label: 'URL', name: 'site' },
                  { label: 'Usuário', name: 'username' },
                  { label: 'Senha', name: 'password'},
                  { label: 'Token', name: 'token'},
                  { label: 'API Key', name: 'api_key'},
                  { label: 'Private Key', name: 'private_key'},
                  { label: 'Public Key', name: 'public_key'},
                  { label: 'Texto', name: 'text', type: 'textarea' },
                ].map(({ label, name, type, required }) => (
                  <div key={name} style={{ display: 'flex', alignItems: 'center' }}>
                    <label style={{ width: '100px', textAlign: 'right', marginRight: '10px' }}>
                      {label} {required && <span style={{ color: 'red' }}>*</span>}:
                    </label>
                    {type === 'textarea' ? (
                      <textarea
                        name={name}
                        value={currentCredential[name]}
                        onChange={handleInputChange}
                        style={{ flex: 1, padding: '8px', minHeight: '100px' }}
                      />
                    ) : (
                      <input
                        type={type === 'password' ? 'password' : 'text'}
                        name={name}
                        value={currentCredential[name]}
                        onChange={handleInputChange}
                        required={required}
                        style={{ 
                          flex: 1, 
                          padding: '8px', 
                          border: '1px solid #ddd', 
                          borderRadius: '4px' 
                        }}
                      />
                    )}
                  </div>
                ))}

                <PasswordGenerator
                  passwordLength={passwordLength}
                  setPasswordLength={setPasswordLength}
                  includeUppercase={includeUppercase}
                  setIncludeUppercase={setIncludeUppercase}
                  includeLowercase={includeLowercase}
                  setIncludeLowercase={setIncludeLowercase}
                  includeSpecialChars={includeSpecialChars}
                  setIncludeSpecialChars={setIncludeSpecialChars}
                  onGenerate={generatePassword}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button 
                  onClick={() => { 
                    isEditing ? setIsEditing(false) : setIsAdding(false);
                    resetCredentialForm();
                    setError(null);
                  }}
                  style={{ 
                    padding: '8px 16px', 
                    backgroundColor: '#f44336', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Cancelar
                </button>
                <button 
                  onClick={isEditing ? updateCredential : addCredential}
                  style={{ 
                    padding: '8px 16px', 
                    backgroundColor: '#4caf50', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  {isEditing ? 'Atualizar' : 'Salvar'}
                </button>
              </div>
            </div>
          ) : selectedCredential ? (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3>{selectedCredential.name}</h3>
                <div>
                  <button 
                    onClick={handleEditCredential} 
                    title="Editar"
                    style={{ 
                      padding: '5px', 
                      border: 'none', 
                      background: 'none', 
                      cursor: 'pointer',
                      marginRight: '10px'
                    }}
                  >
                    <FaEdit />
                  </button>
                  <button 
                    onClick={deleteCredential} 
                    title="Excluir"
                    style={{ 
                      padding: '5px', 
                      border: 'none', 
                      backgroundColor: '#f44336', 
                      color: 'white',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>

              <CredentialField 
                field={selectedCredential.site} 
                label="URL" 
                fieldKey="site" 
                revealed={revealedCredentials.site}
                onToggleReveal={toggleReveal}
                onCopy={copyToClipboard}
              />

              <CredentialField 
                field={selectedCredential.username} 
                label="Usuário" 
                fieldKey="username" 
                revealed={revealedCredentials.username}
                onToggleReveal={toggleReveal}
                onCopy={copyToClipboard}
              />

              <CredentialField 
                field={selectedCredential.password} 
                label="Senha" 
                fieldKey="password" 
                revealed={revealedCredentials.password}
                onToggleReveal={toggleReveal}
                onCopy={copyToClipboard}
              />

              <CredentialField 
                field={selectedCredential.token} 
                label="Token" 
                fieldKey="token" 
                revealed={revealedCredentials.token}
                onToggleReveal={toggleReveal}
                onCopy={copyToClipboard}
              />

              <CredentialField 
                field={selectedCredential.api_key} 
                label="API Key" 
                fieldKey="api_key" 
                revealed={revealedCredentials.api_key}
                onToggleReveal={toggleReveal}
                onCopy={copyToClipboard}
              />

              <CredentialField 
                field={selectedCredential.private_key} 
                label="Private Key" 
                fieldKey="private_key" 
                revealed={revealedCredentials.private_key}
                onToggleReveal={toggleReveal}
                onCopy={copyToClipboard}
              />

              <CredentialField 
                field={selectedCredential.public_key} 
                label="Public Key" 
                fieldKey="public_key" 
                revealed={revealedCredentials.public_key}
                onToggleReveal={toggleReveal}
                onCopy={copyToClipboard}
              />

              <CredentialField 
                field={selectedCredential.text} 
                label="Texto" 
                fieldKey="text" 
                revealed={revealedCredentials.text}
                onToggleReveal={toggleReveal}
                onCopy={copyToClipboard}
              />
            </>
          ) : (
            <div style={{ textAlign: 'center', marginTop: '50px', color: '#666' }}>
              <h3>Selecione uma credencial ou adicione uma nova</h3>
              <p>Nenhuma credencial selecionada</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal de confirmação para revelar credencial */}
      {confirmReveal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            maxWidth: '400px',
          }}>
            <h3>Confirmar Revelação</h3>
            <p>Tem certeza que deseja revelar esta informação sensível?</p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
              <button 
                onClick={() => setConfirmReveal(null)}
                style={{ 
                  padding: '8px 16px', 
                  backgroundColor: '#f44336', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Cancelar
              </button>
              <button 
                onClick={confirmRevealAction}
                style={{ 
                  padding: '8px 16px', 
                  backgroundColor: '#4caf50', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Alteração de Senha */}
      {showPasswordModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            maxWidth: '400px',
            width: '100%'
          }}>
            <h3>Alterar Senha</h3>
            {apiError && <div style={{ color: 'red', marginBottom: '10px' }}>{apiError}</div>}
            
            <div style={{ marginBottom: '15px' }}>
              <label>Senha atual:</label>
              <input
                type="password"
                value={editData.currentPassword}
                onChange={(e) => setEditData({...editData, currentPassword: e.target.value})}
                style={{ width: '95%', padding: '8px', marginTop: '5px' }}
              />
            </div>
            
            <div style={{ marginBottom: '15px' }}>
              <label>Nova senha:</label>
              <input
                type="password"
                value={editData.newPassword}
                onChange={(e) => setEditData({...editData, newPassword: e.target.value})}
                style={{ width: '95%', padding: '8px', marginTop: '5px' }}
              />
            </div>
            
            <div style={{ marginBottom: '15px' }}>
              <label>Confirmar nova senha:</label>
              <input
                type="password"
                value={editData.confirmPassword}
                onChange={(e) => setEditData({...editData, confirmPassword: e.target.value})}
                style={{ width: '95%', padding: '8px', marginTop: '5px' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
              <button 
                onClick={() => {
                  setShowPasswordModal(false);
                  setApiError('');
                }}
                style={{ 
                  padding: '8px 16px', 
                  backgroundColor: '#f44336', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Cancelar
              </button>
              <button 
                onClick={handleChangePassword}
                style={{ 
                  padding: '8px 16px', 
                  backgroundColor: '#4caf50', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Alterar Senha
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Exclusão de Conta */}
      {showDeleteAccountModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            maxWidth: '400px',
            width: '100%'
          }}>
            <h3>Confirmar Exclusão de Conta</h3>
            <p style={{ marginBottom: '15px' }}>Esta ação é irreversível! Todos os seus dados serão permanentemente removidos.</p>
            
            {apiError && <div style={{ color: 'red', marginBottom: '10px' }}>{apiError}</div>}
            
            <div style={{ marginBottom: '15px' }}>
              <label>Digite sua senha para confirmar:</label>
              <input
                type="password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                style={{ width: '95%', padding: '8px', marginTop: '5px' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
              <button 
                onClick={() => {
                  setShowDeleteAccountModal(false);
                  setApiError('');
                  setDeletePassword('');
                }}
                style={{ 
                  padding: '8px 16px', 
                  backgroundColor: '#f44336', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Cancelar
              </button>
              <button 
                onClick={handleDeleteAccount}
                style={{ 
                  padding: '8px 16px', 
                  backgroundColor: '#4caf50', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Confirmar Exclusão
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mensagem de cópia */}
      {copyMessage && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          backgroundColor: '#4caf50',
          color: 'white',
          padding: '10px 20px',
          borderRadius: '4px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
          animation: 'fadeInOut 3s forwards',
        }}>
          {copyMessage}
        </div>
      )}
    </div>
  );
};

export default CredenciaisList;