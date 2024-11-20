import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
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

interface Block {
  id: number;
  createdAt: string;
  documents: Document[];
  isMined: boolean;
  previousHash: string;
  hash: string;
  minedAt: string;
  proof: number;
  milliseconds: number;
}

interface ValidationError {
  id: number;
  error: string;
}

const BlockView: React.FC = () => {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [error, setError] = useState<string>('');
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [selectedDocuments, setSelectedDocuments] = useState<{ [blockId: number]: number[] }>({});
  const token = localStorage.getItem('accessToken');
  const user = token ? JSON.parse(atob(token.split('.')[1])) : null;
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
    fetchBlocks();
    validateChain(); // Llama a la validación de la cadena al cargar el componente
  }, [token]);

  const fetchBlocks = async () => {
    try {
      const response = await fetch('https://localhost:7114/api/blocks/all', {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error('Error al obtener los bloques.');
      }

      const data = await response.json();
      setBlocks(data);
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Ocurrió un error desconocido.');
      }
    }
  };

  const validateChain = async () => {
    try {
      const response = await fetch('https://localhost:7114/api/blocks/validate-chain', {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error('Error al validar la cadena de bloques.');
      }

      const data = await response.json();

      if (data.isValid) {
        Swal.fire('Cadena Válida', 'La cadena de bloques es válida.', 'success');
        setValidationErrors([]);
      } else {
        Swal.fire('Errores de Validación', 'Se encontraron errores en la cadena de bloques.', 'error');
        setValidationErrors(data.errors || []);
      }
    } catch (error) {
      console.error('Error al validar la cadena de bloques:', error);
      Swal.fire('Error', 'Error al validar la cadena de bloques.', 'error');
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

  const handleDownloadSelectedDocumentsInBlock = async (blockId: number) => {
    const documentIds = selectedDocuments[blockId] || [];

    if (documentIds.length === 0) {
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
        body: JSON.stringify(documentIds),
      });

      if (!response.ok) {
        throw new Error('Error al crear el ZIP.');
      }

      const blob = await response.blob();
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'block_documents.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      Swal.fire('¡Éxito!', 'Documentos seleccionados descargados como ZIP.', 'success');
    } catch (error) {
      console.error('Error al descargar documentos:', error);
      Swal.fire('Error', 'Error al descargar documentos.', 'error');
    }
  };

  const handleSelectDocument = (blockId: number, documentId: number) => {
    setSelectedDocuments(prevSelected => {
      const selectedForBlock = prevSelected[blockId] || [];
      const isSelected = selectedForBlock.includes(documentId);
      const updatedSelection = isSelected
        ? selectedForBlock.filter(id => id !== documentId)
        : [...selectedForBlock, documentId];

      return { ...prevSelected, [blockId]: updatedSelection };
    });
  };

  return (
    <div className="container mt-5" style={styles.container}>
      <h2>Bloques de Documentos</h2>
      <button className="btn btn-primary mb-4" onClick={validateChain}>Validar Cadena</button>
      {error && <div className="alert alert-danger">{error}</div>}

      {validationErrors && validationErrors.length > 0 && (
        <div className="alert alert-danger">
          <h4>Errores de Validación</h4>
          <ul>
            {validationErrors.map((error) => (
              <li key={error.id}>Bloque {error.id}: {error.error}</li>
            ))}
          </ul>
        </div>
      )}

      {blocks.map((block, index) => (
        <div key={block.id} style={styles.blockContainer}>
          <h3>Bloque: {index + 1}</h3>

          <table className="table">
            <thead>
              <tr>
                <th scope="col">Propiedad</th>
                <th scope="col">Valor</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Hash Anterior</td>
                <td>{block.previousHash}</td>
              </tr>
              <tr>
                <td>Hash Actual</td>
                <td>{block.hash}</td>
              </tr>
              <tr>
                <td>Minado</td>
                <td>{block.isMined ? 'Sí' : 'No'}</td>
              </tr>
              <tr>
                <td>Fecha de Minado</td>
                <td>{block.isMined ? new Date(block.minedAt).toLocaleString() : 'N/A'}</td>
              </tr>
              <tr>
                <td>Prueba</td>
                <td>{block.proof}</td>
              </tr>
              <tr>
                <td>Milisegundos</td>
                <td>{block.milliseconds}</td>
              </tr>
            </tbody>
          </table>

          <h3>Documentos del Bloque: {index + 1}</h3>

          <button
            className="btn btn-secondary mb-3"
            onClick={() => handleDownloadSelectedDocumentsInBlock(block.id)}
          >
            Descargar Seleccionados en ZIP
          </button>

          <table className="table">
            <thead>
              <tr>
                <th scope="col">
                  <input
                    type="checkbox"
                    onChange={e => {
                      const allDocIds = block.documents.map(doc => doc.id);
                      setSelectedDocuments(prev => ({
                        ...prev,
                        [block.id]: e.target.checked ? allDocIds : [],
                      }));
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
              {block.documents.map((doc) => {
                const shortName = mimeToName[doc.fileType] || 'Desconocido';
                return (
                  <tr key={doc.id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={(selectedDocuments[block.id] || []).includes(doc.id)}
                        onChange={() => handleSelectDocument(block.id, doc.id)}
                      />
                    </td>
                    <td>{userName}</td>
                    <td>{shortName}</td>
                    <td>{new Date(doc.createdAt).toLocaleString()}</td>
                    <td>{(doc.size / (1024 * 1024)).toFixed(5)}</td>
                    <td>
                      <button
                        className="btn btn-primary"
                        onClick={() => handleDownloadDocument(doc.id, doc.fileType)}
                      >
                        Descargar
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {block.isMined && (
            <div className="alert alert-success mt-3">
              Bloque minado con éxito.
            </div>
          )}
        </div>
      ))}
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
  blockContainer: {
    marginBottom: '20px',
    padding: '15px',
    backgroundColor: '#e9ecef',
    borderRadius: '8px',
  },
};

export default BlockView;
