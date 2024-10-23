import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/Login.css';

interface Document {
  id: number;               // Agregar ID al documento
  owner: string;           // Propiedad correspondiente en la respuesta de la API
  fileType: string;        // Propiedad correspondiente en la respuesta de la API
  createdAt: string;       // Propiedad correspondiente en la respuesta de la API
  size: number;            // Propiedad correspondiente en la respuesta de la API
  base64Content: string | null; // Propiedad correspondiente en la respuesta de la API
}

interface SystemConfig {
  maxDocs: number;         // Propiedad que define el tamaño máximo del bloque
}

const FileView: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [systemConfig, setSystemConfig] = useState<SystemConfig | null>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const response = await fetch('https://localhost:7114/api/documents/documents');
        if (response.ok) {
          const data = await response.json();
          setDocuments(data);
        } else {
          console.error('Error fetching documents:', response.statusText);
        }
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.error('Error:', error.message);
          setError(error.message);
        } else {
          console.error('Error:', error);
          setError('Ocurrió un error desconocido.');
        }
      }
    };

    const fetchSystemConfig = async () => {
      try {
        const response = await fetch('https://localhost:7114/api/SystemConfig/get');
        if (response.ok) {
          const config = await response.json();
          setSystemConfig(config);
        } else {
          console.error('Error fetching system configuration:', response.statusText);
        }
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.error('Error:', error.message);
          setError(error.message);
        } else {
          console.error('Error:', error);
          setError('Ocurrió un error desconocido.');
        }
      }
    };

    fetchDocuments();
    fetchSystemConfig();
  }, []);

  

  const handleDownload = (document: Document) => {
    alert(`Descargando ${document.owner}`);
  };

  const handleDelete = async (document: Document) => {
    const response = await fetch(`https://localhost:7114/api/documents/delete/${document.id}`, { // Llama al endpoint de eliminación con el ID
      method: 'DELETE',
    });

    if (response.ok) {
      alert(`Documento ${document.owner} eliminado.`);
      setDocuments(documents.filter(doc => doc.id !== document.id)); // Actualiza la lista de documentos
    } else {
      alert('Error al eliminar el documento.');
    }
  };

  return (
    <div className="container mt-5" style={styles.container}>
      <h2 style={styles.title}>Documentos</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      <table className="table table-striped" style={styles.table}>
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
              <td>{(document.size / 1024).toFixed(2)}</td>
              <td>
                <div className="d-flex">
                  <button 
                    style={styles.button}
                    className="btn btn-primary me-2" 
                    onClick={() => handleDownload(document)}
                  >
                    Descargar
                  </button>
                  <button 
                    style={styles.button}
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
      <button className="btn btn-primary btn-block" style={styles.button}>
        Subir al bloque
      </button>
    </div>
  );
};

const styles = {
  container: {
    backgroundColor: '#e4ebf0',
    padding: '20px',
    borderRadius: '10px',
   
    margin: '0 auto',
  },
  title: {
    color: '#4180ab',
    marginBottom: '20px',
  },
  table: {
    backgroundColor: '#ffffff',
  },
  button: {
    backgroundColor: '#4180ab',
    borderColor: '#4180ab',
    color: '#ffffff',
  },
};

export default FileView;
