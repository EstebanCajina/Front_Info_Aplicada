import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Swal from 'sweetalert2';

export interface SystemConfigDto {
  maxDocs: number;
  processTime: number;
  quantityOfZeros: number;
}

const SystemConfig: React.FC = () => {
  const [maxDocs, setMaxDocs] = useState<number>(0);
  const [processTime, setProcessTime] = useState<number>(0);
  const [quantityOfZeros, setQuantityOfZeros] = useState<number>(0);
  const [config, setConfig] = useState<SystemConfigDto | null>(null);
  const [editableConfig, setEditableConfig] = useState<SystemConfigDto | null>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch('https://localhost:7114/api/SystemConfig/get');
        if (!response.ok) throw new Error('Failed to fetch system configuration');
        const data: SystemConfigDto | null = await response.json();
        setConfig(data);
      } catch (err: any) {
        setError(err.message);
      }
    };

    fetchConfig();
  }, []);

  const handleSaveOrUpdate = async () => {
    if (editableConfig) {
      // Editar configuración existente
      try {
        const response = await fetch('https://localhost:7114/api/SystemConfig/edit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(editableConfig),
        });

        if (!response.ok) throw new Error('Error updating system configuration');

        
        Swal.fire({
          title: '¡Éxito!',
          text: 'Documentos subidos al bloque con éxito.',
          icon: 'success',
          confirmButtonText: 'Aceptar',
        }).then(() => {
          // Recargar la página
          window.location.reload();
        });

      } catch (err: any) {
        setError(err.message);
      }
    } else {
      // Añadir nueva configuración
      try {
        const response = await fetch('https://localhost:7114/api/SystemConfig/add', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            maxDocs,
            processTime,
            quantityOfZeros,
          }),
        });

        if (!response.ok) throw new Error('Error adding system configuration');

        alert('System configuration added successfully.');
        window.location.reload(); // Refrescar la página
      } catch (err: any) {
        setError(err.message);
      }
    }
  };

  return (
    <div className="container mt-5" style={styles.container}>
      <h2 style={styles.title}>Configuracion Del Sistema</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      
      {config ? (
        <div>
          <h4>Configuracion Actual</h4>
          <table className="table">
            <thead>
              <tr>
                <th>Configuración</th>
                <th>Valor</th>

                <th>Acción</th>


              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Documentos Maximos</td>
                <td>
                  {editableConfig ? (
                    <input
                      type="number"
                      value={editableConfig.maxDocs}
                      onChange={(e) => setEditableConfig({ ...editableConfig, maxDocs: Number(e.target.value) })}
                    />
                  ) : (
                    config.maxDocs
                  )}
                </td>
                <td>
                {!editableConfig && (
                  <button
                    className="btn btn-secondary"
                    onClick={() => {
                      setEditableConfig(editableConfig ? null : { ...config });
                    }}
                    style={styles.button}
                  >
                    {editableConfig ? 'Save' : 'Edit'}
                  </button>
                )}

                </td>
              </tr>
              <tr>
                <td>Tiempo De Carga (segundos)</td>
                <td>
                  {editableConfig ? (
                    <input
                      type="number"
                      value={editableConfig.processTime}
                      onChange={(e) => setEditableConfig({ ...editableConfig, processTime: Number(e.target.value) })}
                    />
                  ) : (
                    config.processTime
                  )}
                </td>
                <td>
                {!editableConfig && (
                  <button
                    className="btn btn-secondary"
                    onClick={() => {
                      setEditableConfig(editableConfig ? null : { ...config });
                    }}
                    style={styles.button}
                  >
                    {editableConfig ? 'Save' : 'Edit'}
                  </button>
                )}

                </td>
              </tr>
              <tr>
                <td>Ceros A La Izquierda</td>
                <td>
                  {editableConfig ? (
                    <input
                      type="number"
                      value={editableConfig.quantityOfZeros}
                      onChange={(e) => setEditableConfig({ ...editableConfig, quantityOfZeros: Number(e.target.value) })}
                    />
                  ) : (
                    config.quantityOfZeros
                  )}
                </td>
                <td>
{!editableConfig && (
                  <button
                    className="btn btn-secondary"
                    onClick={() => {
                      setEditableConfig(editableConfig ? null : { ...config });
                    }}
                    style={styles.button}
                  >
                    {editableConfig ? 'Save' : 'Edit'}
                  </button>
                )}

                 
                </td>
              </tr>
            </tbody>
          </table>
          {editableConfig && (
            <button className="btn btn-primary" onClick={handleSaveOrUpdate} style={styles.button}>
              Guardar Cambios
            </button>
          )}
        </div>
      ) : (
        <form onSubmit={(e) => { e.preventDefault(); handleSaveOrUpdate(); }} className="needs-validation" noValidate>
          <div className="form-group mb-3">
            <label htmlFor="maxDocs" className="form-label">Max Documents:</label>
            <input
              type="number"
              className="form-control"
              id="maxDocs"
              value={maxDocs}
              onChange={(e) => setMaxDocs(Number(e.target.value))}
              required
            />
          </div>
          <div className="form-group mb-3">
            <label htmlFor="processTime" className="form-label">Process Time (seconds):</label>
            <input
              type="number"
              className="form-control"
              id="processTime"
              value={processTime}
              onChange={(e) => setProcessTime(Number(e.target.value))}
              required
            />
          </div>
          <div className="form-group mb-3">
            <label htmlFor="quantityOfZeros" className="form-label">Leading Zeros:</label>
            <input
              type="number"
              className="form-control"
              id="quantityOfZeros"
              value={quantityOfZeros}
              onChange={(e) => setQuantityOfZeros(Number(e.target.value))}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary btn-block" style={styles.button}>
            Guardar Configuracion
          </button>
        </form>
      )}
    </div>
  );
};

const styles = {
  container: {
    backgroundColor: '#e4ebf0',
    padding: '20px',
    borderRadius: '10px',
    maxWidth: '600px',
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

export default SystemConfig;
