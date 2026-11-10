import React, { useEffect, useState } from 'react';
import { 
  User, 
  Upload, 
  Trash2, 
  ShieldCheck, 
  Save, 
  Camera, 
  Building2, 
  Briefcase,
  CheckCircle2,
  Loader2,
  AlertCircle
} from 'lucide-react';
import SettingsNav from '../components/SettingsNav';
import { uploadApi } from '../services/api';
import { useProfile } from '../context/ProfileContext';

export default function ProfileSettings() {
  const { profile: globalProfile, updateProfile } = useProfile();

  const [formData, setFormData] = useState({
    firstName: 'Anura',
    lastName: 'Perera',
    email: 'anura.perera@itum.mrt.ac.lk',
    phone: '+94 77 123 4567',
    division: 'ITUM Central',
    designation: 'Requester',
    avatar: ''
  });


  const [pendingAvatarFile, setPendingAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Sync initial global profile into form state
  useEffect(() => {
    if (globalProfile) {
      setFormData({
        firstName: globalProfile.firstName || 'Anura',
        lastName: globalProfile.lastName || 'Perera',
        email: globalProfile.email || 'anura.perera@itum.mrt.ac.lk',
        phone: globalProfile.phone || '+94 77 123 4567',
        division: globalProfile.division || globalProfile.department || 'ITUM Central',
        designation: globalProfile.designation || 'Requester',
        avatar: globalProfile.avatar || ''
      });
      setAvatarPreview(globalProfile.avatar || '');
    }
  }, [globalProfile]);


  // Handle local avatar file selection (PREVIEW ONLY - does NOT upload or update header yet)
  const handleAvatarFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setPendingAvatarFile(file);
      const localUrl = URL.createObjectURL(file);
      setAvatarPreview(localUrl);
    }
    e.target.value = '';
  };

  const handleRemoveAvatar = () => {
    setPendingAvatarFile(null);
    setAvatarPreview('');
    setFormData(prev => ({ ...prev, avatar: '' }));
  };

  // Only upload and apply changes to header/sidebar when user clicks SAVE
  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);

    try {
      let finalAvatarUrl = formData.avatar;

      // 1. If user selected a new image file, upload it now
      if (pendingAvatarFile) {
        const uploadData = new FormData();
        uploadData.append('files', pendingAvatarFile);
        const res = await uploadApi.uploadFiles(uploadData);
        if (res.data?.files?.[0]?.url) {
          finalAvatarUrl = res.data.files[0].url;
        }
      } else if (avatarPreview === '') {
        finalAvatarUrl = '';
      }

      const updatedData = {
        ...formData,
        avatar: finalAvatarUrl
      };

      // 2. Persist profile to backend and update global context (updates header & sidebar)
      await updateProfile(updatedData);

      setPendingAvatarFile(null);
      setFormData(updatedData);
      setAvatarPreview(finalAvatarUrl);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 4000);
    } catch (err) {
      console.error('Failed to save profile:', err);
      alert('Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full px-8 py-6 space-y-6 animate-fade-in pb-16">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#241919]">System Settings</h1>
          <p className="text-sm text-[#574141] mt-0.5">
            Configure and manage system preferences and configurations.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#7a1521] hover:bg-[#58000f] text-white text-xs font-semibold rounded-lg shadow-sm transition-all disabled:opacity-50"
          title="Save Settings"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Save Changes</span>
            </>
          )}
        </button>
      </div>

      {savedSuccess && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Profile details and image successfully saved and updated across the system!</span>
        </div>
      )}

      {/* Main Layout Grid */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Left Settings Menu */}
        <SettingsNav />

        {/* Right Settings Cards */}
        <div className="flex-1 space-y-6 w-full">
          {/* Card 1: Profile Management */}
          <div className="bg-white border border-[#e2e8f0] rounded-xl p-6 shadow-card space-y-6">
            <div className="flex items-center gap-3 border-b border-[#f1f5f9] pb-4">
              <div className="w-9 h-9 rounded-lg bg-[#ffe9e8] text-[#7a1521] flex items-center justify-center">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-bold text-base text-[#241919]">Profile Management</h2>
                <p className="text-xs text-[#574141]">
                  Update your personal details, profile picture, and institutional assignment.
                </p>
              </div>
            </div>

            {/* Profile Photo */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-5">
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-[#7a1521] text-white flex items-center justify-center font-bold text-2xl shadow-md overflow-hidden shrink-0">
                  {avatarPreview ? (
                    <img 
                      key={avatarPreview}
                      src={avatarPreview} 
                      alt="Profile" 
                      className="w-full h-full object-cover" 
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                  ) : (
                    (formData.firstName?.[0] || 'R').toUpperCase()
                  )}
                </div>
                <label className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white border border-[#e2e8f0] text-[#7a1521] flex items-center justify-center shadow-sm cursor-pointer hover:bg-[#ffe9e8] transition-colors">
                  <input type="file" accept="image/*" onChange={handleAvatarFileSelect} className="hidden" />
                  <Camera className="w-3.5 h-3.5" />
                </label>
              </div>

              <div>
                <h4 className="text-sm font-bold text-[#241919]">Profile Photo</h4>
                <p className="text-xs text-[#574141] mt-0.5">
                  Allowed formats: JPG, PNG, WEBP. Maximum file size: 2MB.
                </p>
                <div className="flex items-center gap-3 mt-2">
                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#e2e8f0] bg-white hover:bg-slate-50 text-xs font-semibold text-[#241919] rounded-lg shadow-sm cursor-pointer transition-all">
                    <input type="file" accept="image/*" onChange={handleAvatarFileSelect} className="hidden" />
                    <Upload className="w-3.5 h-3.5 text-[#7a1521]" />
                    <span>Change Avatar</span>
                  </label>
                  {avatarPreview && (
                    <button
                      type="button"
                      onClick={handleRemoveAvatar}
                      className="text-xs font-semibold text-rose-600 hover:underline"
                    >
                      Remove
                    </button>
                  )}
                  {pendingAvatarFile && (
                    <span className="text-[11px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      Unsaved preview • click Save below to apply
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Form Fields */}
            <form onSubmit={handleSave} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#574141] mb-1.5">First Name</label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#f8fafc] border border-[#e2e8f0] rounded-lg text-sm text-[#241919] font-medium input-focus"
                    placeholder="First Name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#574141] mb-1.5">Last Name</label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#f8fafc] border border-[#e2e8f0] rounded-lg text-sm text-[#241919] font-medium input-focus"
                    placeholder="Last Name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#574141] mb-1.5">Email Address</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#f8fafc] border border-[#e2e8f0] rounded-lg text-sm text-[#241919] font-medium input-focus"
                    placeholder="name@itum.mrt.ac.lk"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#574141] mb-1.5">Contact Number</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#f8fafc] border border-[#e2e8f0] rounded-lg text-sm text-[#241919] font-medium input-focus"
                    placeholder="+94 77 123 4567"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#574141] mb-1.5">
                    Assigned Division / Department
                  </label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-[#8a7170] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <select
                      value={formData.division}
                      onChange={(e) => setFormData({ ...formData, division: e.target.value })}
                      className="w-full pl-10 pr-20 py-2.5 bg-[#f8fafc] border border-[#e2e8f0] rounded-lg text-sm text-[#241919] font-medium appearance-none input-focus"
                    >
                      <option value="ITUM Central">ITUM Central</option>
                      <option value="Information Technology Division">Information Technology Division</option>
                      <option value="Civil Engineering Division">Civil Engineering Division</option>
                      <option value="Electrical & Electronics Division">Electrical & Electronics Division</option>
                      <option value="Mechanical Engineering Division">Mechanical Engineering Division</option>
                      <option value="General Administration">General Administration</option>
                    </select>
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 pointer-events-none">
                      Verified
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#574141] mb-1.5">
                    Official Designation
                  </label>
                  <div className="relative">
                    <Briefcase className="w-4 h-4 text-[#8a7170] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={formData.designation}
                      onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                      className="w-full pl-10 pr-3.5 py-2.5 bg-[#f8fafc] border border-[#e2e8f0] rounded-lg text-sm text-[#241919] font-medium input-focus"
                      placeholder="e.g. Requester, Senior Lecturer, etc."
                    />
                  </div>
                </div>
              </div>

              {/* Dedicated Save Profile Button Section */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-5 border-t border-[#f1f5f9]">
                <div className="text-xs text-[#8a7170]">
                  {savedSuccess ? (
                    <span className="text-emerald-700 font-semibold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Profile details saved successfully!
                    </span>
                  ) : pendingAvatarFile ? (
                    <span className="text-amber-700 font-semibold flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4 text-amber-600" />
                      New image selected. Click 'Save Profile Details' to apply it to your account.
                    </span>
                  ) : (
                    <span>Click save to apply your changes to your header profile and all records.</span>
                  )}
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-[#7a1521] hover:bg-[#58000f] text-white text-xs font-semibold rounded-lg shadow-sm hover:shadow transition-all disabled:opacity-50 whitespace-nowrap shrink-0"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
                        <span className="whitespace-nowrap">Saving...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-3.5 h-3.5 shrink-0" />
                        <span className="whitespace-nowrap">Save Profile Details</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>


        </div>
      </div>
    </div>
  );
}
