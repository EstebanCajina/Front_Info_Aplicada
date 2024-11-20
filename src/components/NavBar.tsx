import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './styles/Login.css';

interface NavBarProps {
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
}

const pages: string[] = ['configuracion del sistema', 'agregar documentos', 'ver documentos', 'ver bloques', 'ver registros'];
const loginSetting: string[] = ['Login'];

const NavBar: React.FC<NavBarProps> = ({ setIsAuthenticated }) => {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem('accessToken');
    setIsAuthenticated(false);
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-custom">
      <div className="container-fluid">
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            {pages.map((page) => (
              <li className="nav-item" key={page}>
                <Link className="nav-link" to={`/${page.toLowerCase()}`}>
                  {page}
                </Link>
              </li>
            ))}
          </ul>
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <button className="nav-link btn btn-link" onClick={logout}>
                Logout
              </button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
