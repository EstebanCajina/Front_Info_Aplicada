import React, { useState } from 'react';
import RegisterForm from './components/RegisterForm';
import LoginForm from './components/LoginForm';
import FileUpload from './components/FileUpload';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import NavBar from './components/NavBar';
import './components/styles/Login.css';
import FileView from './components/FileView';

const App: React.FC = () => {
  const [showRegister, setShowRegister] = useState(true);

  return (
    <div className="container p-4">
      <Router basename="/Proyecto_info_aplicada">
        <NavBar />
        {/* Añadir espacio entre NavBar y el contenido */}
        <div className="navbar-spacing"></div>
        <Routes>
          <Route path="/login" element={<LoginForm />} />
          <Route path="/registrarse" element={<RegisterForm />} />
          <Route path="/fileupload" element={<FileUpload />} />
          <Route path="agregar documentos" element={<FileUpload />} />
          <Route path="ver documentos" element={< FileView />} />
        </Routes>
      </Router>

      
    </div>
  );
};

export default App;
