import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/Login.css';
import SystemConfig, { SystemConfigDto } from './SystemConfig';

interface Document {
  id: number;
  owner: string;
  fileType: string;
  createdAt: string;
  size: number;
  base64Content: string | null;
}



interface SystemConfig {
  maxDocs: number;
}

const FileView: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocuments, setSelectedDocuments] = useState<number[]>([]); // Estado para documentos seleccionados
  const [systemConfig, setSystemConfig] = useState<SystemConfig | null>(null);
  const [error, setError] = useState<string>('');

  const token = localStorage.getItem('accessToken');
  const user = token ? JSON.parse(atob(token.split('.')[1])) : null;
  const userId = user ? user.sub : '';
  const userName = user ? user.unique_name : '';

  // Mapa de tipos de archivo
  const mimeToName: Record<string, string> = {
    'text/plain.txt': 'txt',
    'application/msword.doc': 'doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document.docx': 'docx',
    'application/vnd.ms-excel.excel': 'xls',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.xlsx': 'xlsx',
    'application/vnd.ms-powerpoint.ppt': 'ppt',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation.pptx': 'pptx',
    'application/pdf.pdf': 'pdf',
    'image/jpeg.jpg': 'jpg',
    'image/png.png': 'png',
  };

  useEffect(() => {
    const fetchDocuments = async () => {
      if (!userId) return;
      try {
        const response = await fetch(`https://localhost:7114/api/documents/documents/${userId}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setDocuments(data);
        } else {
          console.error('Error fetching documents:', response.statusText);
        }
      } catch (error: unknown) {
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError('Ocurrió un error desconocido.');
        }
      }
    };
  
    const fetchSystemConfig = async () => {
      try {
        const response = await fetch('https://localhost:7114/api/SystemConfig/get', {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!response.ok) {
          throw new Error('Error al obtener la configuración del sistema.');
        }
        const data = await response.json();
        setSystemConfig(data);
        console.log(data);
        
      } catch (error: unknown) {
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError('Ocurrió un error desconocido.');
        }
      }
    };
  
    // Ejecuta ambas funciones asíncronas
    fetchDocuments();
    fetchSystemConfig();
  }, [token, userId]);
  

  const handleSelectDocument = (id: number) => {
    setSelectedDocuments(prev =>
      prev.includes(id) ? prev.filter(docId => docId !== id) : [...prev, id]
    );
  };

  const handleDownload = async (documento: Document) => {
    try {
      const response = await fetch(`https://localhost:7114/api/documents/download/${documento.id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`, // Agregar token en la cabecera
        },
      });

      if (!response.ok) {
        throw new Error('Error al descargar el documento.');
      }

      const { base64Content, fileType } = await response.json();

      // Crear un enlace de descarga
      const link = document.createElement('a');
      link.href = `data:${fileType};base64,${base64Content}`;
      link.download = `document_${documento.id}.${fileType.split('/')[1] || 'bin'}`; // Usar la extensión corta
      document.body.appendChild(link); // Agregar el enlace al DOM
      link.click(); // Simular el clic en el enlace
      document.body.removeChild(link); // Remover el enlace del DOM después de descargar

      alert(`Documento ${documento.owner} descargado.`);
    } catch (error) {
      console.error('Error al descargar el documento:', error);
      alert('Error al descargar el documento.');
    }
  };

  const handleDelete = async (document: Document) => {
    const response = await fetch(`https://localhost:7114/api/documents/delete/${document.id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`, // Agregar token en la cabecera
      },
    });

    if (response.ok) {
      alert(`Documento ${document.owner} eliminado.`);
      setDocuments(documents.filter(doc => doc.id !== document.id));
    } else {
      alert('Error al eliminar el documento.');
    }
  };

  const handleDownloadSelected = async () => {
    try {
      const response = await fetch(`https://localhost:7114/api/documents/download/zip`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(selectedDocuments),
      });

      if (!response.ok) {
        throw new Error('Error al crear el ZIP.');
      }

      const blob = await response.blob();
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'documents.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      alert('Documentos descargados como ZIP.');
    } catch (error) {
      console.error('Error al descargar documentos:', error);
      alert('Error al descargar documentos.');
    }
  };

  const handleDeleteSelected = async () => {
    const confirmDelete = window.confirm('¿Estás seguro de que quieres eliminar estos documentos?');
    if (!confirmDelete) return;

    try {
      const response = await fetch('https://localhost:7114/api/documents/delete/multiple', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(selectedDocuments),
      });

      if (response.ok) {
        setDocuments(documents.filter(doc => !selectedDocuments.includes(doc.id)));
        setSelectedDocuments([]); // Limpiar selección
        alert('Documentos eliminados.');
      } else {
        alert('Error al eliminar documentos.');
      }
    } catch (error) {
      console.error('Error al eliminar documentos:', error);
      alert('Error al eliminar documentos.');
    }
  };

  return (
    <div className="container mt-5" style={styles.container}>
      <h2 >Documentos</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      <table className="table table-striped" style={styles.table}>
        <thead>
          <tr>
            <th scope="col">
              <input
                type="checkbox"
                onChange={e => {
                  if (e.target.checked) {
                    setSelectedDocuments(documents.map(doc => doc.id)); // Seleccionar todos
                  } else {
                    setSelectedDocuments([]); // Deseleccionar todos
                  }
                }}
              />
            </th>
            <th scope="col">Propietario</th>
            <th scope="col">Tipo de archivo</th>
            <th scope="col">Fecha de creación</th>
            <th scope="col">Tamaño (MB)</th>
            <th scope="col">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {documents.map((document) => {
            const fileType = document.fileType.split('/')[0]; // Obtener el tipo de archivo
            const shortName = mimeToName[document.fileType] || 'Desconocido'; // Obtener el nombre corto

            return (
              <tr key={document.id}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedDocuments.includes(document.id)}
                    onChange={() => handleSelectDocument(document.id)}
                  />
                </td>
                <td>{userName}</td>
                <td>{`${shortName}`}</td> {/* Mostrar nombre corto y tipo de archivo */}
                <td>{new Date(document.createdAt).toLocaleString()}</td>
                <td>{(document.size / (1024 * 1024)).toFixed(5)}</td>

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
            );
          })}
        </tbody>
      </table>
      <div className="d-flex">

      <button className="btn btn-primary btn-block" style={styles.button}>
        Subir al bloque
      </button>

        <button className="btn btn-primary me-2" onClick={handleDownloadSelected} disabled={selectedDocuments.length === 0}>
          Descargar Seleccionados
        </button>
        <button className="btn btn-danger" onClick={handleDeleteSelected} disabled={selectedDocuments.length === 0}>
          Eliminar Seleccionados
        </button>
      </div>
      
    </div>
  );
};

const styles = {
  container: {
    width: '80%',
    margin: '0 auto',
    backgroundColor: '#f9f9f9',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
  },
  title: {
    textAlign: 'center',
  },
  table: {
    marginTop: '20px',
  },
  button: {
    marginRight: '10px',
  },
};

export default FileView;
