import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import '../styles/LoginForm.css';
import { validateField, validateForm } from '../utils/validation';
import { toast } from 'react-toastify';

export default function RegisterForm() {
  const [form, setForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    let updatedForm = { ...form, [name]: value };
    let updatedErrors = { ...errors };

    if (name === 'password') {
      // Resetuj confirmPassword i njegovu grešku
      updatedForm.confirmPassword = '';
      delete updatedErrors.confirmPassword;

      // Validiraj password
      const error = validateField('password', value, updatedForm);
      updatedErrors.password = error;
    } else if (name === 'confirmPassword') {
      // Validiraj confirmPassword odmah
      const error = validateField('confirmPassword', value, updatedForm);
      updatedErrors.confirmPassword = error;
    } else {
      // Validiraj druga polja normalno
      const error = validateField(name, value, updatedForm);
      updatedErrors[name] = error;
    }

    setForm(updatedForm);
    setErrors(updatedErrors);

    if (apiError) setApiError('');
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = validateForm(form);
    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) return;

    try {
      await API.post('/auth/register', {
        email: form.email,
        password: form.password,
      });
      toast.success('Registracija uspješna! Možete se prijaviti.');
      navigate('/login');
    } catch (err) {
      setApiError(err.response?.data || 'Greška pri registraciji.');
    }
  };

  return (
    <div className="form-container">
      <form onSubmit={handleSubmit} className="form-box">
        <h2>Registracija</h2>

        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="Email"
        />
        {errors.email && <p className="input-error-message">{errors.email}</p>}

        <input
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
          placeholder="Lozinka"
        />
        {errors.password && (
          <p className="input-error-message">{errors.password}</p>
        )}

        <input
          type="password"
          name="confirmPassword"
          value={form.confirmPassword}
          onChange={handleChange}
          placeholder="Potvrdi lozinku"
        />
        {errors.confirmPassword && (
          <p className="input-error-message">{errors.confirmPassword}</p>
        )}

        {apiError && <p className="api-error">{apiError}</p>}

        <button type="submit">Registruj se</button>

        <p>Već imate nalog?</p>
        <button
          type="button"
          onClick={() => navigate('/login')}
          className="secondary-button"
        >
          Prijavi se ovdje
        </button>
      </form>
    </div>
  );
}
