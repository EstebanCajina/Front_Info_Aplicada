import React, { useState, ChangeEvent, FormEvent } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useNavigate } from 'react-router-dom';

interface DocumentDto {
  owner: string;
  ownerId: string;
  fileType: string;
  size: number;
  base64Content: string;
}

const FileUpload: React.FC = () => {
  const navigate = useNavigate();
  const [files, setFiles] = useState<File[]>([]);
  const [owner, setOwner] = useState<string>('');

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
      alert('Some files were not accepted due to their format. Please upload valid files only.');
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

    if (files.length === 0 || !owner) {
      alert('Please provide a file and owner name');
      return;
    }

    const userId = getUserIdFromToken();

    try {
      for (const file of files) {
        const base64Content = await toBase64(file);
        const fileExtension = mimeToExtension[file.type] || 'unknown';

        const documentDto: DocumentDto = {
          owner: owner,
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
          alert(`File ${file.name} uploaded successfully!`);
        } else {
          alert(`File ${file.name} upload failed.`);
        }
      }
      navigate('/ver documentos');
    } catch (error) {
      console.error('Error uploading files:', error);
    }
  };

  return (
    <div className="container mt-5" style={styles.container}>
      <h2 style={styles.title}>Subir Documento</h2>
      <form onSubmit={handleSubmit} className="needs-validation" noValidate>
        <div className="form-group mb-3">
          <label htmlFor="owner" className="form-label">Dueño :</label>
          <input
            type="text"
            className="form-control"
            id="owner"
            value={owner}
            onChange={(e) => setOwner(e.target.value)}
            required
          />
        </div>
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
