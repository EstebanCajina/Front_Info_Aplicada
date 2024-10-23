import React from 'react';
import { Link } from 'react-router-dom';
import './styles/Login.css';

const pages: string[] = ['configuracion del sistema', 'agregar documentos', 'ver documentos', 'ver bloques'];
const settings: string[] = [];
const loginSetting: string[] = ['Login'];

const NavBar: React.FC = () => {
    return (
        <nav className="navbar navbar-expand-lg navbar-custom"> {/* Añade una clase CSS personalizada */}
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
                        <li className="nav-item dropdown">
                            <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="navbarDropdown">
                                {settings.map((setting) => (
                                    <li key={setting}>
                                        <Link className="dropdown-item" to={`/${setting.toLowerCase()}`}>
                                            {setting}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link" to="/login">
                                {loginSetting[0]}
                            </Link>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    );
};

export default NavBar;
