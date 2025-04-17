import React, { useEffect, useState } from "react";
import API from '../services/api';
import "../styles/UserHistory.css";

const PAGE_SIZE = 5;

const UserHistory = ({ userId, onClose }) => {
    const [versions, setVersions] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [loading, setLoading] = useState(false);

    const totalPages = Math.ceil(totalCount / PAGE_SIZE);

    const revertToVersion = (userId, versionId) => {
        if (window.confirm("Da li ste sigurni da želite da vratite ovu verziju?")) {
            API.post(`/users/${userId}/revert/${versionId}`)
                .then(() => {
                    alert("Verzija vraćena.");
                    window.location.reload();
                });
        }
    };

    useEffect(() => {
        const fetchVersions = async () => {
            setLoading(true);
            try {
                const res = await API.get(`/users/user-history/${userId}?page=${currentPage}`);
                setVersions(res.data.history);
                setTotalCount(res.data.totalCount);
            } catch (error) {
                console.error("Greška pri dohvaćanju audit logova:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchVersions();
    }, [userId, currentPage]);

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h2 align="center">Istorija izmjena korisnika</h2>
                <button className="close-button" onClick={onClose}>×</button>
                <table>
                    <thead>
                        <tr>
                            <th></th>
                            <th>Ime</th>
                            <th>Prezime</th>
                            <th>Uloga</th>
                            <th>Email</th>
                            <th>Aktivan</th>
                            <th>Izmijenio</th>
                            <th>Datum</th>
                            <th>Akcija</th>
                        </tr>
                    </thead>
                    <tbody>
                        {versions.map((version, index) => (
                            <tr key={version.id}>
                                <td>{(currentPage - 1) * PAGE_SIZE + index + 1}</td>
                                <td>{version.firstName}</td>
                                <td>{version.lastName}</td>
                                <td>{version.role}</td>
                                <td>{version.email}</td>
                                <td style={{ color: version.isActive ? "green" : "red" }}>
                                    {version.isActive ? "Aktivan" : "Neaktivan"}
                                </td>
                                <td>{version.changedBy}</td>
                                <td>{new Date(version.changedAt).toLocaleString()}</td>
                                <td>
                                    <button onClick={() => revertToVersion(userId, version.id)}>
                                        Vrati
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div className="pagination">
                    <button onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1}>
                        &lt; Prethodna
                    </button>
                    <span>Stranica {currentPage} od {totalPages}</span>
                    <button onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages}>
                        Sljedeća &gt;
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UserHistory;