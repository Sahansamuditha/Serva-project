import React, { useEffect, useState, useRef } from 'react';
import { User, Check, Building, ShieldCheck, Camera, Save } from 'lucide-react';
import StatusBadge from '../common/StatusBadge';
import { api } from '../../services/api';
import { useUser } from '../../context/UserContext';

export default function ProfileSettings() {
  const [profile, setProfile] = useState({
    firstName: 'Anura',
    lastName: 'Perera',
    email: 'anura.perera@itum.mrt.ac.lk',
    contact: '+94 77 123 4567',
    department: 'ITUM Central',
    designation: 'Director',
    avatar: 'D',
    verified: true
  });

  const { avatarUrl, updateAvatar, firstName, lastName, updateProfileName } = useUser();
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    setProfile((prev) => ({
      ...prev,
      firstName: firstName || prev.firstName,
      lastName: lastName || prev.lastName
    }));
    api.getProfile().then((res) => {
      if (res && res.success) {
        setProfile((prev) => ({
          ...res.profile,
          firstName: firstName || res.profile.firstName,
          lastName: lastName || res.profile.lastName
        }));
      }
    }).catch(console.error);
  }, []);

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size exceeds 5MB limit.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        updateAvatar(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveAvatar = () => {
    updateAvatar(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      updateProfileName(profile.firstName, profile.lastName);
      const res = await api.updateProfile(profile);
      alert('Profile and system preferences saved successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Title Banner */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
        <div>
          <h1 className="page-header-title" style={{ fontSize: '22px' }}>System Settings</h1>
          <p className="page-header-subtitle">
            Configure and manage system preferences and configurations.
          </p>
        </div>

        <button className="btn-primary" onClick={handleSave} disabled={saving}>
          <Save size={15} />
          <span>{saving ? 'Saving...' : 'Save All Changes'}</span>
        </button>
      </div>

      {/* Card 1: Profile Management */}
      <div className="content-card" style={{ marginBottom: 0 }}>
        <div className="card-header-row" style={{ marginBottom: '20px' }}>
          <div>
            <h2 className="card-title" style={{ fontSize: '15px' }}>
              <User size={16} color="#7a1521" />
              Profile Management
            </h2>
            <p style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
              Update your personal details, profile picture, and institutional assignment.
            </p>
          </div>

          <button className="btn-primary" style={{ padding: '6px 14px', fontSize: '12px' }} onClick={handleSave}>
            <Check size={14} />
            <span>Save Profile</span>
          </button>
        </div>

        {/* Profile Photo Section */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
            paddingBottom: '20px',
            borderBottom: '1px solid #f1f5f9',
            marginBottom: '20px'
          }}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageUpload}
            accept="image/*"
            style={{ display: 'none' }}
          />

          <div
            style={{ position: 'relative', cursor: 'pointer' }}
            onClick={() => fileInputRef.current?.click()}
            title="Click to upload profile photo"
          >
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Director Profile"
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '2px solid #7a1521'
                }}
              />
            ) : (
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  backgroundColor: '#58000f',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px',
                  fontWeight: '700'
                }}
              >
                D
              </div>
            )}
            <div
              style={{
                position: 'absolute',
                bottom: '-2px',
                right: '-2px',
                width: '22px',
                height: '22px',
                borderRadius: '50%',
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#64748b'
              }}
            >
              <Camera size={12} />
            </div>
          </div>

          <div>
            <div style={{ fontSize: '14px', fontWeight: '600', color: '#0f172a' }}>
              Profile Photo
            </div>
            <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
              Allowed formats: JPG, PNG, WEBP. Maximum file size: 5MB.
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px' }}>
              <button
                type="button"
                className="btn-outline"
                style={{ padding: '4px 10px', fontSize: '11px' }}
                onClick={() => fileInputRef.current?.click()}
              >
                ↑ Change Avatar
              </button>
              {avatarUrl && (
                <span
                  style={{ fontSize: '11px', color: '#dc2626', cursor: 'pointer', fontWeight: '500' }}
                  onClick={handleRemoveAvatar}
                >
                  Remove
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Form Inputs Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div className="form-group">
            <label className="form-label">First Name</label>
            <input
              type="text"
              className="form-input"
              value={profile.firstName}
              onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Last Name</label>
            <input
              type="text"
              className="form-input"
              value={profile.lastName}
              onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-input"
              value={profile.email}
              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Contact Number</label>
            <input
              type="text"
              className="form-input"
              value={profile.contact}
              onChange={(e) => setProfile({ ...profile, contact: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Assigned Division / Department</label>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 12px',
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '13px',
                color: '#334155'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Building size={14} color="#64748b" />
                <span>{profile.department}</span>
              </div>
              <span
                style={{
                  fontSize: '11px',
                  backgroundColor: '#f1f5f9',
                  color: '#475569',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontWeight: '500'
                }}
              >
                Verified
              </span>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Official Designation</label>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 12px',
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '13px',
                color: '#334155'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShieldCheck size={14} color="#7a1521" />
                <span>{profile.designation}</span>
              </div>
              <span
                style={{
                  fontSize: '11px',
                  backgroundColor: '#fff0ef',
                  color: '#7a1521',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontWeight: '600'
                }}
              >
                Director
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
