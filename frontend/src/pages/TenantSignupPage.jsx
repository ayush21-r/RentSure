import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function TenantSignupPage() {
  const navigate = useNavigate();
  const { registerTenant } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    city: 'pune',
    student_or_working: 'student',
    budget_preference: 10000,
    gender_preference: 'any',
    password: '',
    confirmPassword: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const submitData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        city: formData.city,
        student_or_working: formData.student_or_working,
        budget_preference: parseInt(formData.budget_preference),
        gender_preference: formData.gender_preference,
        password: formData.password
      };

      await registerTenant(submitData);
      navigate('/listings/pune');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      maxWidth: '600px', 
      margin: '0 auto', 
      padding: '40px 20px',
      minHeight: '100vh'
    }}>
      <h1 style={{ textAlign: 'center', color: '#0D6EFD', marginBottom: '30px' }}>
        👨‍🎓 Tenant Registration
      </h1>

      {error && (
        <div style={{
          padding: '12px',
          marginBottom: '20px',
          background: '#f8d7da',
          color: '#721c24',
          borderRadius: '4px'
        }}>
          ❌ {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600 }}>
              Full Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="input"
              required
              style={{ width: '100%' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600 }}>
              Phone *
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="input"
              required
              style={{ width: '100%' }}
            />
          </div>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600 }}>
            Email *
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="input"
            required
            style={{ width: '100%' }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600 }}>
              City *
            </label>
            <select
              name="city"
              value={formData.city}
              onChange={handleChange}
              className="select"
              style={{ width: '100%' }}
            >
              <option value="pune">Pune</option>
              <option value="bengaluru">Bengaluru</option>
              <option value="nagpur">Nagpur</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600 }}>
              Student or Working *
            </label>
            <select
              name="student_or_working"
              value={formData.student_or_working}
              onChange={handleChange}
              className="select"
              style={{ width: '100%' }}
            >
              <option value="student">Student</option>
              <option value="working">Working Professional</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600 }}>
              Budget Preference (₹)
            </label>
            <input
              type="number"
              name="budget_preference"
              value={formData.budget_preference}
              onChange={handleChange}
              className="input"
              style={{ width: '100%' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600 }}>
              Gender Preference
            </label>
            <select
              name="gender_preference"
              value={formData.gender_preference}
              onChange={handleChange}
              className="select"
              style={{ width: '100%' }}
            >
              <option value="any">Any</option>
              <option value="male">Male Only</option>
              <option value="female">Female Only</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600 }}>
              Password *
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="input"
              required
              style={{ width: '100%' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600 }}>
              Confirm Password *
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="input"
              required
              style={{ width: '100%' }}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary"
          style={{ width: '100%', marginBottom: '16px' }}
        >
          {loading ? 'Creating Account...' : 'Create Account'}
        </button>

        <p style={{ textAlign: 'center', color: '#6c757d' }}>
          Already have an account?{' '}
          <a href="/login" style={{ color: '#0D6EFD', textDecoration: 'none', fontWeight: 600 }}>
            Login here
          </a>
        </p>
      </form>
    </div>
  );
}
