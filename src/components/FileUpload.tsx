import React, { useState, ChangeEvent, FormEvent } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';


// Definir la estructura del DTO que se enviará al backend
interface DocumentDto {
  owner: string;
  fileType: string;
  size: number;
  base64Content: string;
}

const FileUpload: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [owner, setOwner] = useState<string>('');

  // Función para manejar el cambio de archivo
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] || null;
    setFile(selectedFile);
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

    if (!file || !owner) {
      alert('Please provide a file and owner name');
      return;
    }

    try {
      const base64Content = await toBase64(file);
      const documentDto: DocumentDto = {
        owner: owner,
        fileType: file.type,
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
        alert('File uploaded successfully!');
      } else {
        alert('File upload failed.');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  return (
    <div className="container mt-5" style={styles.container}>
      <h2 style={styles.title}>Upload Document</h2>
      <form onSubmit={handleSubmit} className="needs-validation" noValidate>
        <div className="form-group mb-3">
          <label htmlFor="owner" className="form-label">Owner:</label>
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
          <label htmlFor="file" className="form-label">Select file:</label>
          <input
            type="file"
            className="form-control"
            id="file"
            onChange={handleFileChange}
            required
          />
        </div>
        <button type="submit" className="btn btn-primary btn-block" style={styles.button}>
          Upload
        </button>
      </form>
    </div>
  );
};

const styles = {
  container: {
    backgroundColor: '#e4ebf0', // color5
    padding: '20px',
    borderRadius: '10px',
    maxWidth: '400px',
    margin: '0 auto',
  },
  title: {
    color: '#4180ab', // color1
    marginBottom: '20px',
  },
  button: {
    backgroundColor: '#4180ab', // color1
    borderColor: '#4180ab',
    color: '#ffffff', // color2
  },
};
export default FileUpload;
