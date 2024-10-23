import React, { useState, ChangeEvent, FormEvent } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/Login.css';
import { useNavigate } from 'react-router-dom';
import { redirect } from 'react-router-dom';

interface RegisterDto {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string; // dd/MM/yyyy
}

const RegisterForm: React.FC = () => {
  const [formData, setFormData] = useState<RegisterDto>({
    username: '',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    dateOfBirth: '',
  });

  const navigate = useNavigate(); // Initialize useNavigate

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('https://localhost:7114/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert('User registered successfully');
        navigate('/login');
      } else {
        alert('Registration failed');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="container mt-5" style={styles.container}>
      <h2 className='tittleRegist' style={styles.title}>Registro </h2>
      <form onSubmit={handleSubmit} className="needs-validation" noValidate>
        <div className="form-group">
          <input
            type="text"
            className="form-control mb-3"
            name="username"
            placeholder="Nombre De Usuario"
            value={formData.username}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <input
            type="email"
            className="form-control mb-3"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <input
            type="password"
            className="form-control mb-3"
            name="password"
            placeholder="Contraseña"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <input
            type="text"
            className="form-control mb-3"
            name="firstName"
            placeholder="Nombre"
            value={formData.firstName}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <input
            type="text"
            className="form-control mb-3"
            name="lastName"
            placeholder="Apellido"
            value={formData.lastName}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <input
            type="text"
            className="form-control mb-3"
            name="dateOfBirth"
            placeholder="Fecha De Nacimiento (dd/MM/yyyy)"
            value={formData.dateOfBirth}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit" className="btn btn-primary btn-block" id='btnRegist' style={styles.button}>
          Registrarse
        </button>
      </form>
    </div>
  );
};

const styles = {
  container: {
    backgroundColor: '#e4ebf0', // color5
    padding: '20px',
    borderRadius: '10px',
    maxWidth: '400px',
    margin: '0 auto',
  },
  title: {
    color: '#4180ab', // color1
    marginBottom: '20px',
  },
  button: {
    backgroundColor: '#4180ab', // color1
    borderColor: '#4180ab',
    color: '#ffffff', // color2
  },
};

export default RegisterForm;
