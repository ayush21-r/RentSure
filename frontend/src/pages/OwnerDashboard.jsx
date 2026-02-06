import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const cityMeta = {
  pune: {
    colleges: ["COEP", "Symbiosis", "MIT-WPU", "Fergusson College", "PICT"],
    offices: ["Hinjewadi IT Park", "Magarpatta", "Kharadi EON", "Baner Business Bay", "Viman Nagar Hub"],
  },
  bengaluru: {
    colleges: ["Christ University", "St. Joseph's", "PES", "IIM-B", "RVCE"],
    offices: ["Manyata Tech Park", "Koramangala Startup Hub", "Sarjapur ORR", "HSR Sector 2", "Whitefield ITPL"],
  },
  nagpur: {
    colleges: ["VNIT", "RTMNU", "YCCE", "RCOEM", "LIT", "SB JAIN"],
    offices: ["MIHAN", "Civil Lines", "Sitabuldi", "Sadar Market", "Dharampeth Hub"],
  },
};

const getCollegesForCity = (city) => cityMeta[city]?.colleges || [];
const getOfficesForCity = (city) => cityMeta[city]?.offices || [];

const getDefaultFormData = (city = 'pune') => ({
  title: '',
  description: '',
  address: '',
  city,
  rent: '',
  availability: true,
  safety_score: '',
  nearby_college: '',
  college_distance_km: '',
  nearby_office_hub: '',
  office_distance_km: '',
  thumbnail_url: '',
  gallery_photos: []
});

export default function OwnerDashboard() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [editDescription, setEditDescription] = useState('');
  const [propertyPhotos, setPropertyPhotos] = useState([]);
  const [galleryPhotos, setGalleryPhotos] = useState([]);
  
  const [formData, setFormData] = useState(() => getDefaultFormData('pune'));
  const [collegeOptions, setCollegeOptions] = useState(() => getCollegesForCity('pune'));
  const [officeOptions, setOfficeOptions] = useState(() => getOfficesForCity('pune'));

  // Fetch properties on mount
  useEffect(() => {
    fetchProperties();
  }, []);

  useEffect(() => {
    const colleges = getCollegesForCity(formData.city);
    const offices = getOfficesForCity(formData.city);
    setCollegeOptions(colleges);
    setOfficeOptions(offices);
    setFormData(prev => ({
      ...prev,
      nearby_college: colleges.includes(prev.nearby_college) ? prev.nearby_college : '',
      nearby_office_hub: offices.includes(prev.nearby_office_hub) ? prev.nearby_office_hub : ''
    }));
  }, [formData.city]);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8000/owner/properties', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) throw new Error('Failed to fetch properties');
      
      const data = await response.json();
      setProperties(data.properties || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (name.includes('_') && name !== 'nearby_college' && name !== 'nearby_office_hub' ? parseFloat(value) : value)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const method = editingId ? 'PUT' : 'POST';
      const url = editingId 
        ? `http://localhost:8000/owner/properties/${editingId}`
        : 'http://localhost:8000/owner/properties';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || 'Failed to save property');
      }

      setSuccess(editingId ? 'Property updated!' : 'Property created!');
      setFormData(getDefaultFormData(formData.city));
      setGalleryPhotos([]);
      setEditingId(null);
      setShowAddForm(false);
      
      setTimeout(() => fetchProperties(), 1000);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAddGalleryPhoto = () => {
    setGalleryPhotos([...galleryPhotos, { id: Date.now(), url: '' }]);
  };

  const handleRemoveGalleryPhoto = (id) => {
    setGalleryPhotos(galleryPhotos.filter(p => p.id !== id));
  };

  const handleGalleryPhotoChange = (id, url) => {
    setGalleryPhotos(galleryPhotos.map(p => p.id === id ? { ...p, url } : p));
  };

  const handleUpdateFormData = (updatedPhotos) => {
    setFormData({
      ...formData,
      gallery_photos: updatedPhotos.filter(p => p.url.trim()).map(p => p.url)
    });
  };

  const handleDelete = async (propertyId) => {
    if (!window.confirm('Are you sure you want to delete this property?')) return;

    try {
      const response = await fetch(`http://localhost:8000/owner/properties/${propertyId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Failed to delete property');
      
      setSuccess('Property deleted!');
      fetchProperties();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleToggleAvailability = async (propertyId, currentAvailability) => {
    try {
      const response = await fetch(
        `http://localhost:8000/owner/properties/${propertyId}/availability?availability=${!currentAvailability}`,
        {
          method: 'PATCH',
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      if (!response.ok) throw new Error('Failed to update availability');
      
      fetchProperties();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleViewDetails = (property) => {
    setSelectedProperty(property);
    setEditDescription(property.description || '');
    // Initialize property photos with demo data
    setPropertyPhotos([
      { id: 1, label: 'Master Bedroom', emoji: '🛏️' },
      { id: 2, label: 'Living Room', emoji: '🛋️' },
      { id: 3, label: 'Kitchen', emoji: '🍳' },
      { id: 4, label: 'Bathroom', emoji: '🚿' },
      { id: 5, label: 'Balcony View', emoji: '🌅' },
      { id: 6, label: 'Entrance', emoji: '🚪' }
    ]);
  };

  const handleUpdateDescription = async () => {
    if (!selectedProperty) return;
    
    try {
      const response = await fetch(
        `http://localhost:8000/owner/properties/${selectedProperty.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            ...selectedProperty,
            description: editDescription
          })
        }
      );

      if (!response.ok) throw new Error('Failed to update description');
      
      setSuccess('Description updated!');
      setSelectedProperty({ ...selectedProperty, description: editDescription });
      fetchProperties();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeletePhoto = (photoId) => {
    setPropertyPhotos(propertyPhotos.filter(p => p.id !== photoId));
    setSuccess('Photo deleted!');
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleAddPhoto = () => {
    const newPhoto = {
      id: Math.max(...propertyPhotos.map(p => p.id), 0) + 1,
      label: 'New Room',
      emoji: '📸'
    };
    setPropertyPhotos([...propertyPhotos, newPhoto]);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '30px',
        paddingBottom: '20px',
        borderBottom: '2px solid #e9ecef'
      }}>
        <div>
          <h1 style={{ margin: 0, color: '#333' }}>🏠 Owner Dashboard</h1>
          <p style={{ margin: '6px 0 0 0', color: '#6c757d' }}>
            Welcome, {user?.name}!
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="btn"
          style={{ background: '#6c757d', color: 'white' }}
        >
          Logout
        </button>
      </div>

      {/* Messages */}
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

      {success && (
        <div style={{
          padding: '12px',
          marginBottom: '20px',
          background: '#d4edda',
          color: '#155724',
          borderRadius: '4px'
        }}>
          ✓ {success}
        </div>
      )}

      {/* Action Bar */}
      <div style={{ marginBottom: '30px' }}>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="btn btn-primary"
          style={{ marginBottom: showAddForm ? '20px' : 0 }}
        >
          {showAddForm ? '✕ Cancel' : '+ Add New Property'}
        </button>

        {/* Add/Edit Form */}
        {showAddForm && (
          <form
            onSubmit={handleSubmit}
            style={{
              background: '#f8f9fa',
              padding: '20px',
              borderRadius: '8px',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '16px'
            }}
          >
            <div style={{ gridColumn: '1/-1' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600 }}>
                Property Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="input"
                placeholder="e.g., Spacious 1BHK near college"
                required
                style={{ width: '100%' }}
              />
            </div>

            <div style={{ gridColumn: '1/-1' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600 }}>
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="input"
                rows="4"
                placeholder="e.g., Well-ventilated, WiFi, water 24x7, safe locality"
                style={{ width: '100%' }}
              />
            </div>

            <div style={{ gridColumn: '1/-1' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600 }}>
                Full Address
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="input"
                rows="2"
                placeholder="House/Flat No., Street, Area, Landmark"
                style={{ width: '100%' }}
              />
              <div style={{ fontSize: '0.8rem', color: '#6c757d', marginTop: '4px' }}>
                Example: Flat 204, Shree Towers, Pratap Nagar, near Metro Station
              </div>
            </div>

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
                Monthly Rent (₹) *
              </label>
              <input
                type="number"
                name="rent"
                value={formData.rent}
                onChange={handleChange}
                className="input"
                placeholder="e.g., 12000"
                required
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600 }}>
                Safety Score (1-5)
              </label>
              <input
                type="number"
                name="safety_score"
                value={formData.safety_score}
                onChange={handleChange}
                min="1"
                max="5"
                step="0.1"
                className="input"
                placeholder="1 to 5"
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600 }}>
                Nearby College
              </label>
              <select
                name="nearby_college"
                value={formData.nearby_college}
                onChange={handleChange}
                className="select"
                style={{ width: '100%' }}
              >
                <option value="">Select a college</option>
                {collegeOptions.length === 0 && (
                  <option value="">No colleges available</option>
                )}
                {collegeOptions.map((college) => (
                  <option key={college} value={college}>{college}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600 }}>
                Distance to College (km)
              </label>
              <input
                type="number"
                name="college_distance_km"
                value={formData.college_distance_km}
                onChange={handleChange}
                step="0.1"
                className="input"
                placeholder="e.g., 2.5"
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600 }}>
                Nearby Office Hub
              </label>
              <select
                name="nearby_office_hub"
                value={formData.nearby_office_hub}
                onChange={handleChange}
                className="select"
                style={{ width: '100%' }}
              >
                <option value="">Select an office hub</option>
                {officeOptions.length === 0 && (
                  <option value="">No office hubs available</option>
                )}
                {officeOptions.map((office) => (
                  <option key={office} value={office}>{office}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600 }}>
                Distance to Office (km)
              </label>
              <input
                type="number"
                name="office_distance_km"
                value={formData.office_distance_km}
                onChange={handleChange}
                step="0.1"
                className="input"
                placeholder="e.g., 4.0"
                style={{ width: '100%' }}
              />
            </div>

            {/* Photo Upload Section */}
            <div style={{ gridColumn: '1/-1', borderTop: '2px solid #dee2e6', paddingTop: '16px', marginTop: '16px' }}>
              <div style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '12px', color: '#212529' }}>
                📸 Property Photos
              </div>
            </div>

            {/* Thumbnail Photo */}
            <div style={{ gridColumn: '1/-1' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600 }}>
                🎯 Thumbnail (Main Property Image)
              </label>
              <input
                type="url"
                name="thumbnail_url"
                value={formData.thumbnail_url}
                onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
                className="input"
                placeholder="https://drive.google.com/... or https://example.com/photo.jpg"
                style={{ width: '100%' }}
              />
              <div style={{ fontSize: '0.8rem', color: '#6c757d', marginTop: '4px' }}>
                💡 Paste image URL from Google Drive, Imgur, or any web image link
              </div>
              {formData.thumbnail_url && (
                <div style={{ marginTop: '8px', padding: '8px', background: '#e7f3ff', borderRadius: '4px', fontSize: '0.85rem', color: '#0c5460' }}>
                  ✓ Preview: <a href={formData.thumbnail_url} target="_blank" rel="noopener noreferrer" style={{ color: '#0D6EFD' }}>View Image</a>
                </div>
              )}
            </div>

            {/* Gallery Photos */}
            <div style={{ gridColumn: '1/-1' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600 }}>
                🖼️ Gallery Photos (Multiple Images)
              </label>
              <div style={{ fontSize: '0.85rem', color: '#0c5460', marginBottom: '10px', padding: '8px', background: '#d1ecf1', borderRadius: '4px', border: '1px solid #bee5eb' }}>
                📌 <strong>URL Links Only:</strong> Paste image URLs from Google Drive, Imgur, or any web image link. No file uploads.
              </div>
              <div style={{ marginBottom: '12px' }}>
                {galleryPhotos.length === 0 ? (
                  <div style={{ padding: '12px', background: '#f8f9fa', borderRadius: '6px', color: '#6c757d', fontSize: '0.9rem' }}>
                    No photos added yet. Click "Add Photo" to add gallery images.
                  </div>
                ) : (
                  galleryPhotos.map((photo, idx) => (
                    <div key={photo.id} style={{ marginBottom: '12px', padding: '12px', background: '#f8f9fa', borderRadius: '6px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ fontWeight: 600, color: '#212529' }}>Photo {idx + 1}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveGalleryPhoto(photo.id)}
                          style={{ background: '#dc3545', color: 'white', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' }}
                        >
                          ✕ Remove
                        </button>
                      </div>
                      <input
                        type="url"
                        value={photo.url}
                        onChange={(e) => handleGalleryPhotoChange(photo.id, e.target.value)}
                        className="input"
                        placeholder="https://drive.google.com/... or https://example.com/room.jpg"
                        style={{ width: '100%' }}
                      />
                      {photo.url && (
                        <div style={{ marginTop: '6px', fontSize: '0.8rem', color: '#28a745' }}>
                          ✓ <a href={photo.url} target="_blank" rel="noopener noreferrer" style={{ color: '#28a745' }}>View Photo</a>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
              <button
                type="button"
                onClick={handleAddGalleryPhoto}
                style={{
                  width: '100%',
                  padding: '10px',
                  background: '#e9ecef',
                  border: '2px dashed #6c757d',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 600,
                  color: '#212529',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = '#dee2e6';
                  e.currentTarget.style.borderColor = '#212529';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = '#e9ecef';
                  e.currentTarget.style.borderColor = '#6c757d';
                }}
              >
                ➕ Add Photo
              </button>
              <div style={{ fontSize: '0.8rem', color: '#6c757d', marginTop: '8px' }}>
                💡 Add multiple room photos using URLs only - bedroom, living room, kitchen, bathroom, etc. (Google Drive or web links)
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="checkbox"
                id="availability"
                name="availability"
                checked={formData.availability}
                onChange={handleChange}
              />
              <label htmlFor="availability" style={{ margin: 0, fontWeight: 600 }}>
                Available for rent
              </label>
            </div>

            <div style={{ gridColumn: '1/-1' }}>
              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%' }}
              >
                {editingId ? 'Update Property' : 'Create Property'}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Properties List */}
      <div>
        <h2 style={{ marginBottom: '20px', color: '#333' }}>
          Your Properties ({properties.length})
        </h2>

        {loading ? (
          <p style={{ color: '#6c757d' }}>Loading properties...</p>
        ) : properties.length === 0 ? (
          <div style={{
            padding: '20px',
            background: '#f8f9fa',
            borderRadius: '8px',
            textAlign: 'center',
            color: '#6c757d'
          }}>
            No properties yet. Click "Add New Property" to get started!
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '20px'
          }}>
            {properties.map(prop => (
              <div
                key={prop.id}
                style={{
                  padding: '16px',
                  border: '1px solid #dee2e6',
                  borderRadius: '8px',
                  background: '#fff'
                }}
              >
                <h3 style={{ marginTop: 0, marginBottom: '8px', color: '#333' }}>
                  {prop.title}
                </h3>
                <p style={{ margin: '4px 0', color: '#6c757d', fontSize: '0.9rem' }}>
                  <strong>₹{prop.rent.toLocaleString('en-IN')}</strong>/month
                </p>
                <p style={{ margin: '4px 0', color: '#6c757d', fontSize: '0.9rem' }}>
                  City: <strong>{prop.city}</strong>
                </p>
                <p style={{ margin: '4px 0', color: '#6c757d', fontSize: '0.9rem' }}>
                  Safety: <strong>{prop.safety_score}/5</strong>
                </p>
                <p style={{
                  margin: '8px 0',
                  padding: '6px 10px',
                  background: prop.availability ? '#d4edda' : '#f8d7da',
                  color: prop.availability ? '#155724' : '#721c24',
                  borderRadius: '4px',
                  fontSize: '0.85rem',
                  fontWeight: 600
                }}>
                  {prop.availability ? '✓ Available' : '✗ Unavailable'}
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginTop: '12px' }}>
                  <button
                    onClick={() => handleViewDetails(prop)}
                    className="btn"
                    style={{ fontSize: '0.85rem', padding: '8px', background: '#0D6EFD', color: 'white' }}
                  >
                    👁️ View Details
                  </button>
                  <button
                    onClick={() => handleToggleAvailability(prop.id, prop.availability)}
                    className="btn"
                    style={{ fontSize: '0.85rem', padding: '8px' }}
                  >
                    {prop.availability ? '📍 Unavailable' : '📍 Available'}
                  </button>
                  <button
                    onClick={() => handleDelete(prop.id)}
                    className="btn"
                    style={{ fontSize: '0.85rem', padding: '8px', background: '#dc3545', color: 'white' }}
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Property Details Modal */}
      {selectedProperty && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }} onClick={() => setSelectedProperty(null)}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            maxWidth: '800px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto',
            padding: '24px'
          }} onClick={(e) => e.stopPropagation()}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0, color: '#212529' }}>{selectedProperty.title}</h2>
              <button onClick={() => setSelectedProperty(null)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>✕</button>
            </div>

            {/* Property Info */}
            <div style={{ background: '#f8f9fa', padding: '16px', borderRadius: '8px', marginBottom: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#6c757d', fontWeight: 600 }}>💰 Rent</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0D6EFD' }}>₹{selectedProperty.rent.toLocaleString('en-IN')}/month</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#6c757d', fontWeight: 600 }}>📍 City</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>{selectedProperty.city}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#6c757d', fontWeight: 600 }}>🛡️ Safety Score</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>{selectedProperty.safety_score}/5</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#6c757d', fontWeight: 600 }}>Status</div>
                  <div style={{ fontSize: '0.9rem', padding: '4px 8px', background: selectedProperty.availability ? '#d4edda' : '#f8d7da', color: selectedProperty.availability ? '#155724' : '#721c24', borderRadius: '4px', display: 'inline-block' }}>
                    {selectedProperty.availability ? '✓ Available' : '✗ Unavailable'}
                  </div>
                </div>
              </div>
            </div>

            {/* Edit Description */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '8px', color: '#212529' }}>📝 Edit Description</div>
              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                style={{
                  width: '100%',
                  minHeight: '100px',
                  padding: '12px',
                  border: '1px solid #dee2e6',
                  borderRadius: '8px',
                  fontFamily: 'inherit',
                  fontSize: '0.9rem'
                }}
              />
              <button
                onClick={handleUpdateDescription}
                style={{
                  marginTop: '8px',
                  padding: '8px 16px',
                  background: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                💾 Save Description
              </button>
            </div>

            {/* Tenant Information */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '12px', color: '#212529' }}>👥 Tenant Information</div>
              <div style={{ background: '#f8f9fa', padding: '16px', borderRadius: '8px' }}>
                <div style={{ marginBottom: '12px' }}>
                  <div style={{ fontSize: '0.85rem', color: '#6c757d', fontWeight: 600, marginBottom: '4px' }}>Current Tenant</div>
                  <div style={{ fontSize: '0.95rem' }}>Rajesh Patel</div>
                  <div style={{ fontSize: '0.8rem', color: '#6c757d' }}>Rented since: Jan 15, 2026</div>
                  <div style={{ fontSize: '0.8rem', color: '#6c757d' }}>Contact: +91-9876543210</div>
                </div>
                <div style={{ borderTop: '1px solid #e9ecef', paddingTop: '8px' }}>
                  <div style={{ fontSize: '0.85rem', color: '#6c757d', fontWeight: 600, marginBottom: '4px' }}>Tenant Rating</div>
                  <div style={{ fontSize: '1rem', color: '#ffc107' }}>⭐⭐⭐⭐⭐ 4.8/5</div>
                </div>
              </div>
            </div>

            {/* Tenant Reviews */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '12px', color: '#212529' }}>⭐ Reviews from Tenants</div>
              {[
                { tenant: 'Rajesh Patel', rating: 5, comment: 'Great property! Well-maintained and owner is very responsive.' },
                { tenant: 'Priya Singh', rating: 4, comment: 'Good location, perfect for college. Minor maintenance needed.' }
              ].map((review, idx) => (
                <div key={idx} style={{ background: '#f8f9fa', padding: '12px', borderRadius: '8px', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <strong>{review.tenant}</strong>
                    <div style={{ color: '#ffc107' }}>{'⭐'.repeat(review.rating)}</div>
                  </div>
                  <div style={{ fontSize: '0.9rem', color: '#495057' }}>{review.comment}</div>
                </div>
              ))}
            </div>

            {/* Property Photos Management */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '12px', color: '#212529' }}>📸 Property Photos</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '12px', marginBottom: '12px' }}>
                {propertyPhotos.map((photo) => (
                  <div
                    key={photo.id}
                    style={{
                      height: '120px',
                      background: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`,
                      borderRadius: '8px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      position: 'relative'
                    }}
                  >
                    <div style={{ fontSize: '2rem', marginBottom: '4px' }}>{photo.emoji}</div>
                    <div style={{ fontSize: '0.75rem', textAlign: 'center', marginBottom: '8px' }}>{photo.label}</div>
                    <button
                      onClick={() => handleDeletePhoto(photo.id)}
                      style={{
                        position: 'absolute',
                        top: '4px',
                        right: '4px',
                        background: 'rgba(0,0,0,0.5)',
                        border: 'none',
                        color: 'white',
                        borderRadius: '50%',
                        width: '24px',
                        height: '24px',
                        cursor: 'pointer',
                        fontSize: '0.8rem'
                      }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
                <button
                  onClick={handleAddPhoto}
                  style={{
                    height: '120px',
                    background: '#e9ecef',
                    border: '2px dashed #6c757d',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '2rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = '#dee2e6';
                    e.currentTarget.style.borderColor = '#212529';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = '#e9ecef';
                    e.currentTarget.style.borderColor = '#6c757d';
                  }}
                >
                  ➕
                </button>
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={() => setSelectedProperty(null)}
              style={{
                width: '100%',
                padding: '12px',
                background: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
