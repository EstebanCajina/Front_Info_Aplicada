import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/Login.css';
import Swal from 'sweetalert2';

interface Document {
  id: number;
  owner: string;
  fileType: string;
  createdAt: string;
  size: number;
  base64Content: string | null;
  blockId: number | null;
}

interface SystemConfig {
  maxDocs: number;
  quantityOfZeros: number;
}

const FileView: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocuments, setSelectedDocuments] = useState<number[]>([]);
  const [systemConfig, setSystemConfig] = useState<SystemConfig | null>(null);
  const [error, setError] = useState<string>('');

  const token = localStorage.getItem('accessToken');
  const user = token ? JSON.parse(atob(token.split('.')[1])) : null;
  const userId = user ? user.sub : '';
  const userName = user ? user.unique_name : '';

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
      } catch (error: unknown) {
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError('Ocurrió un error desconocido.');
        }
      }
    };

    fetchDocuments();
    fetchSystemConfig();
  }, [token, userId]);

  const validateMaxDocs = (): boolean => {
    const documentsToUpload = documents.filter(doc => doc.blockId === null);
    if (documentsToUpload.length < (systemConfig?.maxDocs ?? 0)) {
      alert('Se necesitan más documentos para subir al bloque.');
      return false;
    }
    handleUploadToBlock();
    return true;
  };

  const handleUploadToBlock = async () => {
    const maxDocs = systemConfig?.maxDocs ?? 0;
    const quantityOfZeros = systemConfig?.quantityOfZeros ?? 4;

    try {
      Swal.fire({
        title: 'Creando y minando el bloque...',
        text: 'Por favor espere, esto puede tardar un momento.',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      const response = await fetch(`https://localhost:7114/api/blocks/create-and-mine/${maxDocs}/${quantityOfZeros}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error("Error al crear y minar el bloque.");
      }

      Swal.close();
      Swal.fire({
        title: '¡Éxito!',
        text: 'Bloque creado y minado exitosamente.',
        icon: 'success',
        confirmButtonText: 'Aceptar',
      }).then(() => {
        window.location.reload();
      });
    } catch (error: unknown) {
      Swal.close();
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Ocurrió un error desconocido.');
      }
    }
  };

  const handleDownloadDocument = async (documentId: number, fileType: string) => {
    try {
      const response = await fetch(`https://localhost:7114/api/documents/download/${documentId}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error('Error al descargar el documento.');
      }

      const { base64Content } = await response.json();
      const blob = new Blob([Uint8Array.from(atob(base64Content), c => c.charCodeAt(0))], { type: fileType });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `document_${documentId}.${fileType.split('/')[1]}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      Swal.fire('¡Éxito!', 'Documento descargado con éxito.', 'success');
    } catch (error) {
      console.error('Error al descargar el documento:', error);
      Swal.fire('Error', 'No se pudo descargar el documento.', 'error');
    }
  };

  const handleDownloadSelected = async () => {
    if (selectedDocuments.length === 0) {
      Swal.fire('Advertencia', 'No has seleccionado ningún documento.', 'warning');
      return;
    }

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
      Swal.fire('¡Éxito!', 'Documentos descargados como ZIP.', 'success');
    } catch (error) {
      console.error('Error al descargar documentos:', error);
      Swal.fire('Error', 'Error al descargar documentos.', 'error');
    }
  };

  const handleDeleteDocument = async (documentId: number) => {
    const confirmDelete = await Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    });

    if (!confirmDelete.isConfirmed) return;

    try {
      const response = await fetch(`https://localhost:7114/api/documents/delete/${documentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        Swal.fire('¡Éxito!', 'Documento eliminado.', 'success');
        setDocuments(documents.filter(doc => doc.id !== documentId));
      } else {
        Swal.fire('Error', 'No se pudo eliminar el documento.', 'error');
      }
    } catch (error) {
      console.error('Error al eliminar documento:', error);
      Swal.fire('Error', 'Hubo un problema al eliminar el documento.', 'error');
    }
  };

  const handleDeleteSelected = async () => {
    const deletableDocuments = selectedDocuments.filter(id => {
      const doc = documents.find(d => d.id === id);
      return doc && doc.blockId === null;
    });

    if (deletableDocuments.length === 0) {
      Swal.fire('Advertencia', 'No has seleccionado ningún documento sin bloque para eliminar.', 'warning');
      return;
    }

    const confirmDelete = await Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    });

    if (!confirmDelete.isConfirmed) return;

    try {
      const response = await fetch('https://localhost:7114/api/documents/delete/multiple', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(deletableDocuments),
      });

      if (response.ok) {
        Swal.fire('¡Éxito!', 'Documentos eliminados.', 'success');
        setDocuments(documents.filter(doc => !deletableDocuments.includes(doc.id)));
        setSelectedDocuments(selectedDocuments.filter(id => !deletableDocuments.includes(id)));
      } else {
        Swal.fire('Error', 'No se pudieron eliminar los documentos.', 'error');
      }
    } catch (error) {
      console.error('Error al eliminar documentos:', error);
      Swal.fire('Error', 'Hubo un problema al eliminar los documentos.', 'error');
    }
  };

  const handleSelectDocument = (id: number) => {
    setSelectedDocuments(prev =>
      prev.includes(id) ? prev.filter(docId => docId !== id) : [...prev, id]
    );
  };

  return (
    <div className="container mt-5" style={styles.container}>
      <h2>Documentos</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      <table>
        <thead>
          <tr>
            <th scope="col">
              <input
                type="checkbox"
                onChange={e => {
                  if (e.target.checked) {
                    setSelectedDocuments(documents.map(doc => doc.id));
                  } else {
                    setSelectedDocuments([]);
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
            const shortName = mimeToName[document.fileType] || 'Desconocido';
            const rowStyle = document.blockId !== null ? { backgroundColor: '#8ab3cf', color: 'white' } : {};
            return (
              <tr key={document.id} style={rowStyle}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedDocuments.includes(document.id)}
                    onChange={() => handleSelectDocument(document.id)}
                  />
                </td>
                <td>{userName}</td>
                <td>{shortName}</td>
                <td>{new Date(document.createdAt).toLocaleString()}</td>
                <td>{(document.size / (1024 * 1024)).toFixed(5)}</td>
                <td>
                  <div className="d-flex">
                    <button
                      className="btn btn-primary me-2"
                      onClick={() => handleDownloadDocument(document.id, document.fileType)}
                    >
                      Descargar
                    </button>
                    {document.blockId === null && (
                      <button
                        className="btn btn-danger"
                        onClick={() => handleDeleteDocument(document.id)}
                      >
                        Eliminar
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="d-flex">
        <button className="btn btn-primary me-2" onClick={validateMaxDocs}>
          Subir al bloque
        </button>
        <button className="btn btn-secondary me-2" onClick={handleDownloadSelected}>
          Descargar Seleccionados
        </button>
        <button className="btn btn-danger" onClick={handleDeleteSelected}>
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
};

export default FileView;
