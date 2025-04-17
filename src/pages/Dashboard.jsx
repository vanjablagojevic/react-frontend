import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import ProfileModal from '../components/ProfileModal';
import '../styles/Dashboard.css';
import { getUserRole } from '../services/jwtUtils';

export default function Dashboard() {
    const navigate = useNavigate();
    const [statistics, setStatistics] = useState({ activeUsers: 0, inactiveUsers: 0 });
    const [user, setUser] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const role = getUserRole();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const statsRes = await API.get('/users/statistics');
                setStatistics(statsRes.data);

                const userRes = await API.get('/users/profile');
                setUser(userRes.data);
            } catch (err) {
                console.error('Greška pri dohvaćanju podataka:', err);
            }
        };

        fetchData();
    }, []);

    const handleLogout = () => {
        sessionStorage.removeItem('jwt');
        window.location.href = '/login';
    };

    const handleGoToUsers = () => {
        navigate('/users');
    };

    const handleSaveProfile = async (payload) => {
        try {
            await API.put('/users/profile', payload, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            setShowModal(false);
            const refreshed = await API.get('/users/profile');
            setUser(refreshed.data);
        } catch (error) {
            console.error('Greška pri ažuriranju profila:', error);
        }
    };

    return (
        <div className="dashboard-container">
            <div className="dashboard-nav">
                {role === 'Admin' && (
                    <button onClick={handleGoToUsers}>Adminski panel</button>
                )}
                <button onClick={() => setShowModal(true)}>Moj profil</button>
                <button onClick={handleLogout}>Odjavi se</button>
            </div>

            <div className="dashboard-content">
                <h2>Statistika korisnika</h2>
                <div className="stats-box">
                    <p>Aktivni korisnici: {statistics.activeUsers}</p>
                    <p>Neaktivni korisnici: {statistics.inactiveUsers}</p>
                </div>
            </div>

            {showModal && (
                <ProfileModal
                    user={user}
                    onClose={() => setShowModal(false)}
                    onSave={handleSaveProfile}
                />
            )}
        </div>
    );
}
