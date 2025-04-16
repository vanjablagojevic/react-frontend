import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import '../styles/LoginForm.css';
import { validateField, validateForm } from '../utils/validation';

export default function LoginForm() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    const error = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));

    if (apiError) setApiError('');
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = validateForm(form);
    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) return;

    try {
      const res = await API.post('/auth/login', form);
      sessionStorage.setItem('jwt', res.data.token);
      window.dispatchEvent(new Event('storage'));
      setApiError('');
      navigate('/dashboard');
    } catch (err) {
      setApiError(err.response?.data || 'Greška pri prijavi.');
    }
  };

  return (
    <div className="form-container">
      <form onSubmit={handleSubmit} className="form-box">
        <h2>Prijava</h2>

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
        {errors.password && <p className="input-error-message">{errors.password}</p>}
        {apiError && <p className="api-error">{apiError}</p>}


        <button type="submit">Prijavi se</button>

        <p>Nemate nalog?</p>
        <button
          type="button"
          onClick={() => navigate('/register')}
          className="secondary-button"
        >
          Registruj se ovdje
        </button>
      </form>
    </div>
  );
}
