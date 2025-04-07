import React, { useState } from 'react';
import Login from './login';
import Register from './register';


const Auth = ({ setToken }) => {
    const [isLoginView, setIsLoginView] = useState(true);
    const [authError, setAuthError] = useState('');
  
    const handleAuthSuccess = (token) => {
      setToken(token);
      setAuthError('');
    };
  
    return (
      <>
        {isLoginView ? (
          <Login 
            setToken={handleAuthSuccess}
            onSwitchView={() => setIsLoginView(false)}
            authError={authError}
          />
        ) : (
          <Register 
            onSwitchView={() => setIsLoginView(true)}
            setAuthError={setAuthError}
          />
        )}
      </>
    );
  };

export default Auth;

