import React, { useState, useEffect } from 'react';
import '../styles/UserFormModal.css';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Button as MuiButton,
    FormHelperText,
} from '@mui/material';
import API from '../services/api';
import { validateField, validateForm } from '../utils/validation';

const UserFormModal = ({ open, onClose, onSubmit, initialData }) => {
    const emptyForm = {
        email: '',
        password: '',
        role: '',
        isActive: true,
    };

    const [formData, setFormData] = useState(emptyForm);
    const [errors, setErrors] = useState({});

    const isEdit = !!initialData;

    useEffect(() => {
        if (open) {
            if (initialData) {
                setFormData({
                    email: initialData.email || '',
                    password: '',
                    role: initialData.role || '',
                    isActive:
                        initialData.isActive === true || initialData.isActive === 'Da',
                });
            } else {
                setFormData(emptyForm);
            }
            setErrors({});
        }
    }, [open, initialData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        const newValue = name === 'isActive' ? value === 'true' : value;

        setFormData((prev) => ({
            ...prev,
            [name]: newValue,
        }));

        const error = validateField(name, newValue, { ...formData, [name]: newValue }, isEdit);
        setErrors((prev) => ({
            ...prev,
            [name]: error,
        }));
    };

    const validateAll = () => {
        const newErrors = validateForm(formData, isEdit);
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleClose = () => {
        setFormData(emptyForm);
        setErrors({});
        onClose();
    };

    const handleSubmit = async () => {
        if (!validateAll()) return;
        const payload = {
            ...formData,
            isActive: formData.isActive === true || formData.isActive === 'true',
        };

        try {
            if (isEdit) {
                if (!formData.password) {
                    delete payload.password;
                }
                await API.put(`/users/${initialData.id}`, payload);
            } else {
                await API.post('/users', payload);
            }

            onSubmit();
            handleClose();
        } catch (err) {
            console.error('Greška prilikom spremanja korisnika:', err);

        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSubmit();
        }
    };

    return (
        <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm" className="custom-modal">
            <DialogTitle>{isEdit ? 'Izmijeni korisnika' : 'Dodaj korisnika'}</DialogTitle>
            <DialogContent dividers onKeyDown={handleKeyDown}>
                <TextField
                    label="Email"
                    name="email"
                    fullWidth
                    margin="normal"
                    value={formData.email}
                    onChange={handleChange}
                    error={!!errors.email}
                    helperText={errors.email}
                />
                {!isEdit && (
                    <TextField
                        label="Lozinka"
                        name="password"
                        type="password"
                        fullWidth
                        margin="normal"
                        value={formData.password}
                        onChange={handleChange}
                        error={!!errors.password}
                        helperText={errors.password}
                    />
                )}
                <FormControl fullWidth margin="normal" error={!!errors.role}>
                    <InputLabel id="role-label">Uloga</InputLabel>
                    <Select
                        labelId="role-label"
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                        label="Uloga"
                    >
                        <MenuItem value="Admin">Admin</MenuItem>
                        <MenuItem value="User">User</MenuItem>
                    </Select>
                    {errors.role && <FormHelperText>{errors.role}</FormHelperText>}
                </FormControl>

                <FormControl fullWidth margin="normal">
                    <InputLabel id="isActive-label">Aktivan</InputLabel>
                    <Select
                        labelId="isActive-label"
                        name="isActive"
                        value={formData.isActive.toString()}
                        onChange={handleChange}
                        label="Aktivan"
                    >
                        <MenuItem value="true">Da</MenuItem>
                        <MenuItem value="false">Ne</MenuItem>
                    </Select>
                </FormControl>
            </DialogContent>
            <DialogActions>
                <MuiButton onClick={handleClose}>Otkaži</MuiButton>
                <MuiButton onClick={handleSubmit} variant="contained" color="primary" >
                    Spremi
                </MuiButton>
            </DialogActions>
        </Dialog>
    );
};

export default UserFormModal;
