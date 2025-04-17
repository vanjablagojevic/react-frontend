import React, { useEffect, useState } from "react";
import API from '../services/api';
import "../styles/AuditLog.css";

const PAGE_SIZE = 7;

const AuditLog = () => {
    const [versions, setVersions] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);


    useEffect(() => {
        const fetchVersions = async () => {
            try {
                const res = await API.get(`/users/audit-logs?page=${currentPage}`);
                setVersions(res.data.logs);
                setTotalCount(res.data.totalCount);
            } catch (error) {
                console.error("Greška pri dohvaćanju audit logova:", error);
            }
        };
        fetchVersions();
    }, [currentPage]);

    const totalPages = Math.ceil(totalCount / PAGE_SIZE);

    const goToPage = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    return (
        <div className="audit-log-container">
            <h2 align="center">Audit Log</h2>
            <div className="audit-log-table-wrapper">
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
                                <td>{(currentPage - 1) * PAGE_SIZE + index + 1}</td>
                                <td>{version.tableName}</td>
                                <td>{version.action}</td>
                                <td>{version.changedBy}</td>
                                <td>{new Date(version.changedAt).toLocaleString()}</td>
                            </tr>
                        ))}

                    </tbody>
                </table>
            </div>

            <div className="pagination">
                <button onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1}>
                    &lt; Prethodna
                </button>
                <span>Stranica {currentPage} od {totalPages}</span>
                <button onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages}>
                    Sljedeća &gt;
                </button>
            </div>
        </div>
    );
};

export default AuditLog;