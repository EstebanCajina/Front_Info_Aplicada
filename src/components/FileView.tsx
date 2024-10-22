import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/Login.css';

interface Document {
  owner: string;         // Propiedad correspondiente en la respuesta de la API
  fileType: string;      // Propiedad correspondiente en la respuesta de la API
  createdAt: string;     // Propiedad correspondiente en la respuesta de la API
  size: number;          // Propiedad correspondiente en la respuesta de la API
  base64Content: string | null; // Propiedad correspondiente en la respuesta de la API
}

const FileView: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const response = await fetch('https://localhost:7114/api/Documents/mempool');
        if (response.ok) {
          const data = await response.json();
          console.log(data); // Verifica la estructura de los datos
          setDocuments(data);
        } else {
          console.error('Error fetching documents:', response.statusText);
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };

    fetchDocuments();
  }, []);

  const handleDownload = (document: Document) => {
    // Implementar la funcionalidad de descarga aquí
    alert(`Descargando ${document.owner}`);
  };

  const handleDelete = (document: Document) => {
    // Implementar la funcionalidad de eliminación aquí
    alert(`Eliminando ${document.owner}`);
  };

  return (
    <div className="documents-container">
      <h2 className="documents-title">Documentos</h2>
      <table className="table table-striped">
        <thead>
          <tr>
            <th scope="col">Propietario</th>
            <th scope="col">Tipo de archivo</th>
            <th scope="col">Fecha de creación</th>
            <th scope="col">Tamaño (KB)</th>
            <th scope="col">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {documents.map((document, index) => (
            <tr key={index}>
              <td>{document.owner}</td>
              <td>{document.fileType}</td>
              <td>{new Date(document.createdAt).toLocaleString()}</td>
              <td>{(document.size / 1024).toFixed(2)}</td> {/* Convertimos bytes a KB */}
              <td>
                <div className="d-flex">
                  <button 
                    style={{ backgroundColor: '#4180ab', borderColor: '#4180ab' }}
                    className="btn btn-primary me-2" 
                    onClick={() => handleDownload(document)}
                  >
                    Descargar
                  </button>
                  <button 
                    style={{ backgroundColor: '#4180ab', borderColor: '#4180ab' }}
                    className="btn btn-danger" 
                    onClick={() => handleDelete(document)}
                  >
                    Eliminar
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const styles = {
  container: {
    backgroundColor: '#e4ebf0', // color5
    padding: '20px',
    borderRadius: '10px',
  },
  title: {
    color: '#4180ab', // color1
    marginBottom: '20px',
  },
};

export default FileView;
