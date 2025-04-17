import React, { useState, useEffect } from 'react';
import '../styles/ProfileModal.css';
import {
    validateProfileField,
    validateProfileForm,
    validateProfilePasswordChange
} from '../utils/validation';
import API from '../services/api';

export default function ProfileModal({ onClose, onSave }) {
    const [form, setForm] = useState({
        firstName: '',
        lastName: '',
        address: '',
        dateOfBirth: '',
        email: '',
    });

    const [initialForm, setInitialForm] = useState(null);
    const [changePassword, setChangePassword] = useState(false);
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    const [errors, setErrors] = useState({});
    const [passwordErrors, setPasswordErrors] = useState({});
    const [serverError, setServerError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await API.get('/users/profile');
                const data = res.data;
                const loadedForm = {
                    firstName: data.firstName || '',
                    lastName: data.lastName || '',
                    address: data.address || '',
                    dateOfBirth: data.dateOfBirth ? data.dateOfBirth.split('T')[0] : '',
                    email: data.email || '',
                };
                setForm(loadedForm);
                setInitialForm(loadedForm);
            } catch (err) {
                console.error('Greška pri učitavanju profila:', err);
                setServerError('Greška prilikom učitavanja profila.');
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
        setErrors(prev => ({ ...prev, [name]: validateProfileField(name, value) }));
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordForm(prev => ({ ...prev, [name]: value }));
    };

    const resetPasswordSection = () => {
        setChangePassword(false);
        setPasswordForm({
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
        });
        setPasswordErrors({});
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setServerError('');
        setSuccessMessage('');

        const generalErrors = validateProfileForm(form);
        setErrors(generalErrors);
        if (Object.keys(generalErrors).length > 0) return;

        if (changePassword) {
            const passErrors = validateProfilePasswordChange(passwordForm);
            setPasswordErrors(passErrors);
            if (Object.keys(passErrors).length > 0) return;
        } else {
            setPasswordErrors({});
        }

        const hasFormChanged = JSON.stringify(form) !== JSON.stringify(initialForm);
        if (!hasFormChanged && !changePassword) {
            setSuccessMessage('Nema izmjena za čuvanje.');
            setTimeout(() => setSuccessMessage(''), 2000);
            return;
        }

        try {
            const payload = {
                ...form,
                dateOfBirth: form.dateOfBirth ? new Date(form.dateOfBirth).toISOString() : null,
            };

            await API.put('/users/profile', payload);

            if (changePassword) {
                await API.put('/users/change-password', {
                    currentPassword: passwordForm.currentPassword,
                    newPassword: passwordForm.newPassword,
                    confirmPassword: passwordForm.confirmPassword,
                });
            }

            setSuccessMessage('Profil uspješno ažuriran!');
            resetPasswordSection();
            setInitialForm(form);

            setTimeout(() => {
                setSuccessMessage('');
                handleClose();
            }, 2000);

        } catch (error) {
            console.error('Greška prilikom čuvanja profila:', error);
            if (error.response && error.response.status === 400) {
                setErrors(prev => ({ ...prev, email: 'Email adresa je već u upotrebi.' }));
            } else {
                setServerError('Došlo je do greške prilikom ažuriranja profila.');
            }
        }
    };

    const handleClose = () => {
        setErrors({});
        setPasswordErrors({});
        setServerError('');
        setSuccessMessage('');
        onClose();
    };

    const hasFormChanged = JSON.stringify(form) !== JSON.stringify(initialForm);

    if (loading) return <div className="modal-overlay"><div className="modal-box">Učitavanje...</div></div>;

    return (
        <div className="modal-overlay">
            <div className="modal-box">
                <h2>Moj profil</h2>

                {serverError && <p className="server-error-message">{serverError}</p>}
                {successMessage && <p className="success-message">{successMessage}</p>}

                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        name="firstName"
                        value={form.firstName}
                        onChange={handleChange}
                        placeholder="Ime"
                    />
                    {errors.firstName && <p className="input-error-message">{errors.firstName}</p>}

                    <input
                        type="text"
                        name="lastName"
                        value={form.lastName}
                        onChange={handleChange}
                        placeholder="Prezime"
                    />
                    {errors.lastName && <p className="input-error-message">{errors.lastName}</p>}

                    <input
                        type="text"
                        name="address"
                        value={form.address}
                        onChange={handleChange}
                        placeholder="Adresa"
                    />
                    {errors.address && <p className="input-error-message">{errors.address}</p>}

                    <input
                        type="date"
                        name="dateOfBirth"
                        value={form.dateOfBirth}
                        onChange={handleChange}
                    />
                    {errors.dateOfBirth && <p className="input-error-message">{errors.dateOfBirth}</p>}

                    <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="Email"
                    />
                    {errors.email && <p className="input-error-message">{errors.email}</p>}

                    {!changePassword ? (
                        <button
                            type="button"
                            className="link-button"
                            onClick={() => setChangePassword(true)}
                        >
                            Izmijeni lozinku
                        </button>
                    ) : (
                        <>
                            <input
                                type="password"
                                name="currentPassword"
                                value={passwordForm.currentPassword}
                                onChange={handlePasswordChange}
                                placeholder="Trenutna lozinka"
                                autoComplete="new-password"
                            />
                            {passwordErrors.currentPassword && (
                                <p className="input-error-message">{passwordErrors.currentPassword}</p>
                            )}

                            <input
                                type="password"
                                name="newPassword"
                                value={passwordForm.newPassword}
                                onChange={handlePasswordChange}
                                placeholder="Nova lozinka"
                                autoComplete="new-password"
                            />
                            {passwordErrors.newPassword && (
                                <p className="input-error-message">{passwordErrors.newPassword}</p>
                            )}

                            <input
                                type="password"
                                name="confirmPassword"
                                value={passwordForm.confirmPassword}
                                onChange={handlePasswordChange}
                                placeholder="Potvrdi novu lozinku"
                                autoComplete="new-password"
                            />
                            {passwordErrors.confirmPassword && (
                                <p className="input-error-message">{passwordErrors.confirmPassword}</p>
                            )}
                        </>
                    )}

                    <div className="modal-buttons">
                        <button
                            type="submit"
                            disabled={!hasFormChanged && !changePassword}
                        >
                            Sačuvaj
                        </button>
                        <button type="button" onClick={handleClose}>
                            Otkaži
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
