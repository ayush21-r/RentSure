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
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f8f9fa',
      padding: '20px'
    }}>
      <div style={{
        maxWidth: '440px',
        width: '100%',
        background: 'white',
        borderRadius: '16px',
        padding: '48px 40px',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ 
            fontSize: '2rem', 
            color: '#0D6EFD', 
            marginBottom: '8px',
            fontWeight: '700'
          }}>
            🏠 RentSure
          </h1>
          <p style={{ color: '#6c757d', fontSize: '0.95rem' }}>
            Find your perfect rental home
          </p>
        </div>

        {error && (
          <div style={{
            padding: '14px 16px',
            marginBottom: '24px',
            background: '#fee',
            color: '#c33',
            borderRadius: '8px',
            border: '1px solid #fcc',
            fontSize: '0.9rem'
          }}>
            ❌ {error}
          </div>
        )}

        {authError && (
          <div style={{
            padding: '14px 16px',
            marginBottom: '24px',
            background: '#fee',
            color: '#c33',
            borderRadius: '8px',
            border: '1px solid #fcc',
            fontSize: '0.9rem'
          }}>
            ❌ {authError}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ marginBottom: '24px' }}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontWeight: '600',
              color: '#212529',
              fontSize: '0.9rem'
            }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              style={{ 
                width: '100%',
                padding: '12px 16px',
                border: '2px solid #e0e0e0',
                borderRadius: '8px',
                fontSize: '1rem',
                transition: 'border-color 0.2s',
                outline: 'none'
              }}
              onFocus={(e) => e.target.style.borderColor = '#0D6EFD'}
              onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
            />
          </div>

          <div style={{ marginBottom: '28px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontWeight: '600',
              color: '#212529',
              fontSize: '0.9rem'
            }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              style={{ 
                width: '100%',
                padding: '12px 16px',
                border: '2px solid #e0e0e0',
                borderRadius: '8px',
                fontSize: '1rem',
                transition: 'border-color 0.2s',
                outline: 'none'
              }}
              onFocus={(e) => e.target.style.borderColor = '#0D6EFD'}
              onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{ 
              width: '100%',
              padding: '14px',
              background: loading ? '#9ec5fe' : '#0D6EFD',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              boxShadow: loading ? 'none' : '0 4px 12px rgba(13, 110, 253, 0.3)'
            }}
            onMouseOver={(e) => !loading && (e.target.style.background = '#0b5ed7')}
            onMouseOut={(e) => !loading && (e.target.style.background = '#0D6EFD')}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '12px',
          marginBottom: '28px'
        }}>
        <button
          onClick={handleDemoTenant}
          disabled={loading}
          style={{
            padding: '12px',
            background: '#e7f3ff',
            border: '2px solid #0D6EFD',
            color: '#0D6EFD',
            fontWeight: '600',
            borderRadius: '8px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '0.9rem',
            transition: 'all 0.2s',
            opacity: loading ? 0.6 : 1
          }}
          onMouseOver={(e) => !loading && (e.target.style.transform = 'translateY(-2px)')}
          onMouseOut={(e) => !loading && (e.target.style.transform = 'translateY(0)')}
        >
          👨‍🎓 Tenant Demo
        </button>
        <button
          onClick={handleDemoOwner}
          disabled={loading}
          style={{
            padding: '12px',
            background: '#fff3cd',
            border: '2px solid #ffc107',
            color: '#856404',
            fontWeight: '600',
            borderRadius: '8px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '0.9rem',
            transition: 'all 0.2s',
            opacity: loading ? 0.6 : 1
          }}
          onMouseOver={(e) => !loading && (e.target.style.transform = 'translateY(-2px)')}
          onMouseOut={(e) => !loading && (e.target.style.transform = 'translateY(0)')}
        >
          🏠 Owner Demo
        </button>
      </div>

      <div style={{ 
        textAlign: 'center', 
        paddingTop: '24px',
        borderTop: '1px solid #e0e0e0'
      }}>
        <p style={{ color: '#6c757d', fontSize: '0.9rem', marginBottom: '0' }}>
          Don't have an account?
        </p>
        <div style={{ 
          display: 'flex', 
          gap: '12px', 
          justifyContent: 'center',
          marginTop: '12px'
        }}>
          <a 
            href="/signup/tenant" 
            style={{ 
              color: '#0D6EFD', 
              textDecoration: 'none', 
              fontWeight: '600',
              fontSize: '0.95rem'
            }}
          >
            Sign up as Tenant
          </a>
          <span style={{ color: '#dee2e6' }}>|</span>
          <a 
            href="/signup/owner" 
            style={{ 
              color: '#ffc107', 
              textDecoration: 'none', 
              fontWeight: '600',
              fontSize: '0.95rem'
            }}
          >
            Sign up as Owner
          </a>
        </div>
      </div>
    </div>
  </div>
  );
}
