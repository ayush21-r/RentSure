import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, error: authError } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(email, password);
      
      // Redirect based on role
      if (user.role === 'tenant') {
        navigate('/listings/pune');
      } else if (user.role === 'owner') {
        navigate('/owner/dashboard');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoTenant = async () => {
    console.log('🎯 Demo Tenant button clicked');
    setEmail('tenant@rentsure.demo');
    setPassword('Tenant@123');
    setError('');
    setLoading(true);

    try {
      console.log('📞 Calling login function...');
      const user = await login('tenant@rentsure.demo', 'Tenant@123');
      console.log('👤 User received:', user);
      console.log('🚀 Navigating to /listings/nagpur');
      navigate('/listings/nagpur');
    } catch (err) {
      console.error('💥 Error in handleDemoTenant:', err);
      setError(err.message || 'Login failed');
    } finally {
      console.log('✅ Finally block - setting loading to false');
      setLoading(false);
    }
  };

  const handleDemoOwner = async () => {
    setEmail('owner@rentsure.demo');
    setPassword('Owner@123');
    setError('');
    setLoading(true);

    try {
      const user = await login('owner@rentsure.demo', 'Owner@123');
      navigate('/owner/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      maxWidth: '500px', 
      margin: '0 auto', 
      padding: '40px 20px',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center'
    }}>
      <h1 style={{ textAlign: 'center', color: '#0D6EFD', marginBottom: '10px' }}>
        🏠 RentSure
      </h1>
      <p style={{ textAlign: 'center', color: '#6c757d', marginBottom: '40px' }}>
        Find your perfect rental home
      </p>

      {error && (
        <div style={{
          padding: '12px',
          marginBottom: '20px',
          background: '#f8d7da',
          color: '#721c24',
          borderRadius: '4px',
          borderLeft: '4px solid #f5c6cb'
        }}>
          ❌ {error}
        </div>
      )}

      {authError && (
        <div style={{
          padding: '12px',
          marginBottom: '20px',
          background: '#f8d7da',
          color: '#721c24',
          borderRadius: '4px'
        }}>
          ❌ {authError}
        </div>
      )}

      <form onSubmit={handleLogin} style={{ marginBottom: '20px' }}>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600 }}>
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="input"
            required
            style={{ width: '100%' }}
          />
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600 }}>
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            className="input"
            required
            style={{ width: '100%' }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary"
          style={{ width: '100%', marginBottom: '16px' }}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '12px',
        marginBottom: '24px'
      }}>
        <button
          onClick={handleDemoTenant}
          disabled={loading}
          className="btn"
          style={{
            background: '#e7f3ff',
            border: '2px solid #0D6EFD',
            color: '#0D6EFD',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          👨‍🎓 Tenant Demo
        </button>
        <button
          onClick={handleDemoOwner}
          disabled={loading}
          className="btn"
          style={{
            background: '#fff3cd',
            border: '2px solid #ffc107',
            color: '#856404',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          🏠 Owner Demo
        </button>
      </div>

      <p style={{ textAlign: 'center', color: '#6c757d', fontSize: '0.9rem' }}>
        Don't have an account?{' '}
        <a 
          href="/signup/tenant" 
          style={{ color: '#0D6EFD', textDecoration: 'none', fontWeight: 600 }}
        >
          Sign up as Tenant
        </a>
        {' or '}
        <a 
          href="/signup/owner" 
          style={{ color: '#ffc107', textDecoration: 'none', fontWeight: 600 }}
        >
          Sign up as Owner
        </a>
      </p>
    </div>
  );
}
