import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function TopNav() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="header">
      <div className="container">
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          padding: '0 20px',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          {/* Logo */}
          <Link to="/" style={{ 
            textDecoration: 'none', 
            color: '#0D6EFD', 
            fontWeight: 'bold', 
            fontSize: '1.5rem',
            minWidth: 'fit-content'
          }}>
            🏠 RentSure
          </Link>

          {/* Navigation Links */}
          <nav style={{ 
            display: 'flex', 
            gap: '20px', 
            alignItems: 'center',
            flexWrap: 'wrap'
          }}>
            {isAuthenticated ? (
              <>
                {user?.role === 'tenant' && (
                  <>
                    <NavLink 
                      to="/listings/pune" 
                      style={({ isActive }) => ({
                        textDecoration: 'none',
                        color: isActive ? '#0D6EFD' : '#6c757d',
                        fontWeight: isActive ? 600 : 400
                      })}
                    >
                      Listings
                    </NavLink>
                    <NavLink 
                      to="/trust-safety" 
                      style={({ isActive }) => ({
                        textDecoration: 'none',
                        color: isActive ? '#0D6EFD' : '#6c757d',
                        fontWeight: isActive ? 600 : 400
                      })}
                    >
                      Safety
                    </NavLink>
                    <NavLink 
                      to="/help" 
                      style={({ isActive }) => ({
                        textDecoration: 'none',
                        color: isActive ? '#0D6EFD' : '#6c757d',
                        fontWeight: isActive ? 600 : 400
                      })}
                    >
                      Help
                    </NavLink>
                  </>
                )}

                {user?.role === 'owner' && (
                  <>
                    <NavLink 
                      to="/owner/dashboard" 
                      style={({ isActive }) => ({
                        textDecoration: 'none',
                        color: isActive ? '#ffc107' : '#6c757d',
                        fontWeight: isActive ? 600 : 400
                      })}
                    >
                      Dashboard
                    </NavLink>
                    <NavLink 
                      to="/help" 
                      style={({ isActive }) => ({
                        textDecoration: 'none',
                        color: isActive ? '#ffc107' : '#6c757d',
                        fontWeight: isActive ? 600 : 400
                      })}
                    >
                      Help
                    </NavLink>
                  </>
                )}

                {/* User Info & Logout */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  paddingLeft: '12px',
                  borderLeft: '1px solid #dee2e6'
                }}>
                  <span style={{ fontSize: '0.9rem', color: '#6c757d' }}>
                    👤 {user?.name}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="btn"
                    style={{
                      background: '#6c757d',
                      color: 'white',
                      padding: '6px 12px',
                      fontSize: '0.85rem'
                    }}
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <NavLink 
                  to="/help" 
                  style={({ isActive }) => ({
                    textDecoration: 'none',
                    color: isActive ? '#0D6EFD' : '#6c757d',
                    fontWeight: isActive ? 600 : 400
                  })}
                >
                  Help
                </NavLink>
                <button
                  onClick={() => navigate('/login')}
                  className="btn btn-primary"
                  style={{ padding: '8px 16px' }}
                >
                  Login
                </button>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
