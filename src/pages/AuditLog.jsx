import React, { useEffect, useState } from "react";
import API from '../services/api';
import "../styles/UserHistory.css";

const AuditLog = () => {
    const [versions, setVersions] = useState([]);

    useEffect(() => {
        const fetchVersions = async () => {
            const res = await API.get('/users/audit-logs');
            const data = res.data.map(userHistory => ({
                ...userHistory
            }));
            setVersions(data);
        };
        fetchVersions();
    });

    return (
        <div className="user-history-modal">
            <h2>Audit Log</h2>
            <table>
                <thead>
                    <tr>
                        <th></th>
                        <th>Tabela</th>
                        <th>Naziv akcije</th>
                        <th>Izmijenio</th>
                        <th>Datum</th>
                    </tr>
                </thead>
                <tbody>
                    {versions.map((version, index) => (
                        <tr key={version.id}>
                            <td>{index + 1}</td>
                            <td>{version.tableName}</td>
                            <td>{version.action}</td>
                            <td>{version.changedBy}</td>
                            <td>{new Date(version.changedAt).toLocaleString()}</td>
                        </tr>
                    ))}
                </tbody>

            </table>


        </div>
    );
};

export default AuditLog;
