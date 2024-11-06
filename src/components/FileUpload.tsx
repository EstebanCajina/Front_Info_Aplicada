import React, { useState, ChangeEvent, FormEvent } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

interface DocumentDto {

  ownerId: string;
  fileType: string;
  size: number;
  base64Content: string;
}

const FileUpload: React.FC = () => {
  const navigate = useNavigate();
  const [files, setFiles] = useState<File[]>([]);


  // Función para obtener el ID de usuario del token
  const getUserIdFromToken = (): string => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      console.log(payload);
      return payload.sub;
    }
    return '';
  };

  // Mapear tipos MIME a extensiones de archivo
  const mimeToExtension: { [key: string]: string } = {
    'text/plain': 'txt',
    'application/msword': 'doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
    'application/vnd.ms-excel': 'xls',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
    'application/vnd.ms-powerpoint': 'ppt',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx',
    'application/pdf': 'pdf',
    'image/jpeg': 'jpg',
    'image/png': 'png',
  };

  // Función para manejar el cambio de archivos
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    const allowedTypes = Object.keys(mimeToExtension);

    const validFiles = selectedFiles.filter(file => allowedTypes.includes(file.type));
    if (validFiles.length !== selectedFiles.length) {
     
      Swal.fire({
        title: 'Error',
        text: `Algunos archivos no cumplen con el formato permitido. Por favor, intente nuevamente con otro archivo.`,
        icon: 'error',
        confirmButtonText: 'Aceptar',
      });

    }

    setFiles(validFiles);
  };

  // Función para manejar la conversión a Base64
  const toBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result?.toString().split(',')[1] || '');
      reader.onerror = (error) => reject(error);
    });
  };

  // Función para manejar el envío del formulario
  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (files.length === 0 ) {
      Swal.fire({
        title: 'Error',
        text: `Por favor, seleccione al menos un archivo.`,
        icon: 'error',
        confirmButtonText: 'Aceptar',
      });
      return;
    }

    const userId = getUserIdFromToken();

    try {
      for (const file of files) {
        const base64Content = await toBase64(file);
        const fileExtension = mimeToExtension[file.type] || 'unknown';

        const documentDto: DocumentDto = {
        
          ownerId: userId,
          fileType: `${file.type}.${fileExtension}`,
          size: file.size,
          base64Content: base64Content,
        };

        const response = await fetch('https://localhost:7114/api/documents/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(documentDto),
        });

        if (response.ok) {
         
          Swal.fire({
            title: '¡Éxito!',
            text: 'Documentos subidos al bloque con éxito.',
            icon: 'success',
            confirmButtonText: 'Aceptar',
          }).then(() => {
            // Recargar la página
            window.location.reload();
            navigate('/ver documentos');
          });

        } else {
          Swal.fire({
            title: 'Error',
            text: `Error al subir el archivo ${file.name}. Por favor, intente nuevamente.`,
            icon: 'error',
            confirmButtonText: 'Aceptar',
          });
        }
      }
  
    
    } catch (error) {
      console.error('Error uploading files:', error);
    }
  };

  return (
    <div className="container mt-5" style={styles.container}>
      <h2 style={styles.title}>Subir Documento</h2>
      <form onSubmit={handleSubmit} className="needs-validation" noValidate>
       
        <div className="form-group mb-3">
          <label htmlFor="file" className="form-label">Seleccionar Archivos:</label>
          <input
            type="file"
            className="form-control"
            id="file"
            multiple
            onChange={handleFileChange}
            required
          />
        </div>
        <button type="submit" className="btn btn-primary btn-block" style={styles.button}>
          Subir
        </button>
      </form>
    </div>
  );
};

const styles = {
  container: {
    backgroundColor: '#e4ebf0',
    padding: '20px',
    borderRadius: '10px',
    maxWidth: '400px',
    margin: '0 auto',
  },
  title: {
    color: '#4180ab',
    marginBottom: '20px',
  },
  button: {
    backgroundColor: '#4180ab',
    borderColor: '#4180ab',
    color: '#ffffff',
  },
};

export default FileUpload;
