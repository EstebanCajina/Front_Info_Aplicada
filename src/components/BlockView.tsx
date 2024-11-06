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

interface SystemConfig {
    quantityOfZeros: number;
}

interface Block {
    id: number;
  createdAt: string;
  documents: Document[];
  isMined: boolean;
}

const BlockView: React.FC = () => {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [error, setError] = useState<string>('');
  const [systemConfig, setSystemConfig] = useState<SystemConfig | null>(null);
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

    const fetchSystemConfig = async () => {
      try {        
        const response = await fetch('https://localhost:7114/api/systemconfig/get', {
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

    fetchBlocks();
    fetchSystemConfig();
  }, [token]);

  const handleMine = async (blockId: number) => {
    if (!systemConfig) {
      setError("No se ha cargado la configuración del sistema.");
      return;
    }
  
    const quantityOfZeros = systemConfig.quantityOfZeros;

    console.log(blockId

    );
  

    try {


        Swal.fire({
            title: 'En proceso de minado',
            text: 'Por favor espere...',
            icon: 'info',
            showConfirmButton: false,
            allowOutsideClick: false,
            didOpen: () => {
              Swal.showLoading();  // Muestra el spinner de carga
            }
          });


      const response = await fetch(`https://localhost:7114/api/blocks/mine/${blockId}/${quantityOfZeros}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
  
      if (!response.ok) {
        throw new Error('Error al minar el bloque.');
      }
  
      const updatedBlock = await response.json();
  
      // Si la respuesta del servidor devuelve el bloque actualizado
      if (updatedBlock) {
        // Actualizar los bloques en el estado
        const updatedBlocks = blocks.map((block) =>
          block.id === blockId ? { ...block, isMined: true } : block
        );
        setBlocks(updatedBlocks);

        Swal.fire({
            title: '¡Minado con éxito!',
            text: 'El bloque ha sido minado correctamente.',
            icon: 'success',
            confirmButtonText: 'Aceptar',
          });

      }
    } catch (error: unknown) {
      // Verificar si el error tiene la propiedad message
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Ocurrió un error desconocido al minar el bloque.');
      }
    }
  };
  
  

  return (
    <div className="container mt-5" style={styles.container}>
      <h2>Bloques de Documentos</h2>
      {error && <div className="alert alert-danger">{error}</div>}

      {blocks.map((block, index) => (
  <div key={block.id} style={styles.blockContainer}>
    <h3>Número de Bloque: {index + 1}</h3>
    <table className="table">
      <thead>
        <tr>
          <th scope="col">Propietario</th>
          <th scope="col">Tipo de archivo</th>
          <th scope="col">Fecha de creación</th>
          <th scope="col">Tamaño (MB)</th>
        </tr>
      </thead>
      <tbody>
        {block.documents.map((doc) => {
          // Obtener el tipo de archivo y el nombre corto
          const shortName = mimeToName[doc.fileType] || 'Desconocido'; // Obtener el nombre corto

          return (
            <tr key={doc.id}>
              <td>{userName}</td>
              <td>{shortName}</td> {/* Mostrar nombre corto y tipo de archivo */}
              <td>{new Date(doc.createdAt).toLocaleString()}</td>
              <td>{(doc.size / (1024 * 1024)).toFixed(5)}</td>
            </tr>
          );
        })}
      </tbody>
    </table>

    {/* Mostrar el botón "Minar" solo en el primer bloque no minado */}
    {!block.isMined && blocks.findIndex((b) => !b.isMined) === index && (
      <button
        className="btn btn-primary"
        onClick={() => handleMine(block.id)}
      >
        Minar
      </button>
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
