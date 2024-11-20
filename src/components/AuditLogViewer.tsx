import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Swal from 'sweetalert2';

interface AuditLog {
    id: number;
    description: string;
    createdAt: string;
}

const AuditLogViewer: React.FC = () => {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Obtener logs desde la API
    const fetchLogs = async () => {
        setLoading(true);
        try {
            const response = await fetch('https://localhost:7114/api/audit/logs');
            if (!response.ok) {
                throw new Error("No se encontraron registros de auditoría.");
            }
            const data = await response.json();
            setLogs(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Ocurrió un error desconocido.");
        } finally {
            setLoading(false);
        }
    };

    // Llamar a la función fetchLogs al montar el componente
    useEffect(() => {
        fetchLogs();
    }, []);

    // Eliminar todos los registros de auditoría
    const clearLogs = async () => {
        const confirm = await Swal.fire({
            title: "¿Estás seguro?",
            text: "Esto eliminará todos los registros de auditoría.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Sí, limpiar",
            cancelButtonText: "Cancelar"
        });

        if (!confirm.isConfirmed) return;

        try {
            const response = await fetch('https://localhost:7114/api/audit/logs', {
                method: 'DELETE'
            });
            if (!response.ok) {
                throw new Error("Error al eliminar los registros de auditoría.");
            }
            await Swal.fire("¡Éxito!", "Todos los registros de auditoría han sido eliminados.", "success");
            setLogs([]); // Actualizar la lista de logs después de limpiar
        } catch (err) {
            setError(err instanceof Error ? err.message : "Ocurrió un error al limpiar los registros.");
        }
    };

    return (
        <div className="container mt-5">
            <h2 className="mb-4">Registro de Auditoría del Sistema</h2>
            
            {loading && <p>Cargando registros...</p>}
            {error && <div className="alert alert-danger">{error}</div>}
            
            {!loading && logs.length > 0 && (
                <div>
                    <table className="table table-striped table-hover">
                        <thead className="table-dark">
                            <tr>
                                <th>#</th>
                                <th>Descripción</th>
                                <th>Fecha</th>
                            </tr>
                        </thead>
                        <tbody>
                            {logs.map((log, index) => (
                                <tr key={log.id}>
                                    <td>{index + 1}</td>
                                    <td>{log.description}</td>
                                    <td>{new Date(log.createdAt).toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <button className="btn btn-danger mt-3" onClick={clearLogs}>
                        Limpiar Registros
                    </button>
                </div>
            )}

            {!loading && logs.length === 0 && !error && (
                <div className="alert alert-info">
                    No hay registros de auditoría disponibles.
                </div>
            )}
        </div>
    );
};

export default AuditLogViewer;
