import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import NavBar from './components/NavBar';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import FileUpload from './components/FileUpload';
import FileView from './components/FileView';
import SystemConfig from './components/SystemConfig';
import ProtectedRoute from './components/ProtectedRoute';
import BlockView from './components/BlockView';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(Boolean(localStorage.getItem('accessToken')));

  useEffect(() => {
    // Verificar si hay un token en localStorage cuando el componente se monta
    setIsAuthenticated(Boolean(localStorage.getItem('accessToken')));
  }, []);

  return (
    <div className="container p-4">
      <Router basename="/">
        {/* Pasamos el estado y la función de actualización a NavBar */}
        {isAuthenticated && <NavBar setIsAuthenticated={setIsAuthenticated} />}
        <div className="navbar-spacing"></div>
        <Routes>
          <Route path="/login" element={<LoginForm setIsAuthenticated={setIsAuthenticated} />} />
          <Route path="/registrarse" element={<RegisterForm />} />
          <Route path="/" element={<LoginForm setIsAuthenticated={setIsAuthenticated} />} />

          {/* Rutas protegidas */}
          <Route path="/agregar documentos" element={<ProtectedRoute element={<FileUpload />} />} />
          <Route path="/ver bloques" element={<ProtectedRoute element={<BlockView />} />} />
          <Route path="/ver documentos" element={<ProtectedRoute element={<FileView />} />} />
          <Route path="/configuracion del sistema" element={<ProtectedRoute element={<SystemConfig />} />} />
        </Routes>
      </Router>
    </div>
  );
};

export default App;
