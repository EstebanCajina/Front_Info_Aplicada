import React, { useState } from 'react';
import RegisterForm from './components/RegisterForm';
import LoginForm from './components/LoginForm';
import FileUpload from './components/FileUpload';

const App: React.FC = () => {
  const [showRegister, setShowRegister] = useState(true);

  return (
    <div className="container">
      {showRegister ? <RegisterForm /> : <LoginForm />}
      <button className="btn btn-link mt-3" onClick={() => setShowRegister(!showRegister)}>
        {showRegister ? 'Go to Login' : 'Go to Register'}
      </button>

      <FileUpload />
    </div>
  );
};

export default App;
