import React, { useEffect, useState } from "react";
import API from '../services/api';
import "../styles/UserHistory.css";

const UserHistory = ({ userId, onClose }) => {
    const [versions, setVersions] = useState([]);

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
            const res = await API.get(`/users/user-history/${userId}`);
            setVersions(res.data);
        };
        fetchVersions();
    }, [userId]);

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h2>Istorija izmjena korisnika</h2>
                <button className="close-button" onClick={onClose}>×</button>
                <table>
                    <thead>
                        <tr>
                            <th>Verzija</th>
                            <th>Ime</th>
                            <th>Prezime</th>
                            <th>Email</th>
                            <th>Izmijenio</th>
                            <th>Datum</th>
                            <th>Akcija</th>
                        </tr>
                    </thead>
                    <tbody>
                        {versions.map((version, index) => (
                            <tr key={version.id}>
                                <td>{index + 1}</td>
                                <td>{version.firstName}</td>
                                <td>{version.lastName}</td>
                                <td>{version.email}</td>
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
            </div>
        </div>
    );
};

export default UserHistory;
