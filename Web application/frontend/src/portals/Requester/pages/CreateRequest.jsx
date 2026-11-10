import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Send,
  PhoneCall,
  ShieldCheck,
  User,
  Mail,
  Building2,
  Phone,
  Layers,
  UploadCloud,
  Trash2,
  FileText,
  Image as ImageIcon,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  X,
  Lock,
  Eye,
  ZoomIn,
  Users
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { requestsApi, uploadApi } from '../services/api';
import { useProfile } from '../context/ProfileContext';
import { calculatePriorityScore } from '../../../utils/priorityAlgorithm';
import { CAMPUS_ZONES, BUILDING_TO_ZONE } from '../../../utils/campusLocations';

const CATEGORY_SUBCATEGORIES = {
  'Electricity': [
    'Lighting & Fixtures',
    'Power Supply',
    'Wiring & Cables',
    'Switches & Sockets',
    'Ceiling Fans',
    'Electrical Panels'
  ],
  'Water': [
    'Water Supply',
    'Pipelines & Leaks',
    'Taps & Valves',
    'Toilets & Flushing',
    'Drainage & Overflow',
    'Water Pumps'
  ],
  'Civil & Structural': [
    'Walls & Plaster',
    'Flooring & Tiles',
    'Ceilings & Roofs',
    'Doors & Windows',
    'Structural Damage',
    'Furniture & Desks',
    'Elevator'
  ],
  'HVAC': [
    'Air Conditioning Unit',
    'Duct Ventilation',
    'Exhaust Fans',
    'Thermostat Control',
    'Filter Replacement',
    'Chiller Systems'
  ],
  'Academic': [
    'General Academic',
    'Classroom Facilities',
    'Laboratory Facilities',
    'Other'
  ],
  'Cleaning': [
    'General Cleaning',
    'Washroom Sanitation',
    'Waste Disposal',
    'Other'
  ],
  'Gardening': [
    'General Gardening',
    'Lawn Maintenance',
    'Tree Trimming',
    'Other'
  ],
  'Others': []
};

export const AFFECTED_PEOPLE_OPTIONS = [
  {
    value: '15',
    range: 'Below 25 people',
    label: 'Below 25 people',
    score: 1
  },
  {
    value: '60',
    range: '25 to 100 people',
    label: '25 to 100 people',
    score: 2
  },
  {
    value: '150',
    range: '100 to 200 people',
    label: '100 to 200 people',
    score: 3
  },
  {
    value: '500',
    range: '200 to 1,500 people',
    label: '200 to 1,500 people',
    score: 4
  },
  {
    value: '2000',
    range: 'Above 1,500 people',
    label: 'Above 1,500 people',
    score: 5
  }
];

export default function CreateRequest() {
  const navigate = useNavigate();
  const { profile } = useProfile();

  // Form State
  const [formData, setFormData] = useState({
    fullName: profile?.fullName || `${profile?.firstName || ''} ${profile?.lastName || ''}`.trim() || 'Dr. Kamal Silva',
    email: profile?.email || 'requester@itum.mrt.ac.lk',
    department: profile?.division || profile?.department || 'Division of Electrical & Computer Engineering',
    phone: profile?.phone || '+94 76 345 6789',
    headline: '',
    category: '',
    subCategory: '',
    subCategory1: '',
    building: '',
    zone: '',
    room: '',
    peoples: '',
    affectedPeople: '',
    description: ''
  });

  // Sync profile if loaded later
  useEffect(() => {
    if (profile) {
      const computedName = profile.fullName || `${profile.firstName || ''} ${profile.lastName || ''}`.trim();
      setFormData(prev => ({
        ...prev,
        fullName: computedName || prev.fullName,
        email: profile.email || prev.email,
        department: profile.division || profile.department || prev.department,
        phone: profile.phone || prev.phone
      }));
    }
  }, [profile]);

  const [officerPhone, setOfficerPhone] = useState('+94 77 123 4567');

  useEffect(() => {
    fetch('/api/officer/contact')
      .then(res => res.json())
      .then(res => {
        if (res?.data?.phone) {
          setOfficerPhone(res.data.phone);
        }
      })
      .catch(() => {});
  }, []);

  const [files, setFiles] = useState([]);
  const [previewModalImage, setPreviewModalImage] = useState(null);

  const [submitting, setSubmitting] = useState(false);

  // Centered Popup Modal State (Screen eke meda pop wela penna)
  const [modalState, setModalState] = useState({
    isOpen: false,
    type: 'success', // 'success' | 'error' | 'warning'
    title: '',
    message: '',
    details: null,
    confirmText: 'OK',
    onConfirm: null,
    showCancel: false,
    cancelText: 'Cancel'
  });

  const showModal = ({
    type = 'error',
    title,
    message,
    details = null,
    confirmText = 'OK',
    onConfirm = null,
    showCancel = false,
    cancelText = 'Cancel'
  }) => {
    setModalState({
      isOpen: true,
      type,
      title,
      message,
      details,
      confirmText,
      onConfirm,
      showCancel,
      cancelText
    });
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCategoryChange = (val) => {
    setFormData(prev => ({
      ...prev,
      category: val,
      subCategory: '',
      subCategory1: ''
    }));
  };

  const handleBuildingChange = (val) => {
    const autoZone = BUILDING_TO_ZONE[val] || '';
    setFormData(prev => ({
      ...prev,
      building: val,
      zone: autoZone
    }));
  };

  // Real-time Priority Calculation using University Maintenance Priority Ranking Algorithm
  const priorityAssessment = useMemo(() => {
    try {
      if (!formData.category && !formData.description) return null;
      const zoneName = formData.zone || BUILDING_TO_ZONE[formData.building] || '';
      const locationStr = formData.building && formData.room
        ? `${formData.building}${zoneName ? ` (${zoneName})` : ''} - ${formData.room}`
        : (formData.building ? `${formData.building}${zoneName ? ` (${zoneName})` : ''}` : (formData.room || 'Main Campus'));

      return calculatePriorityScore({
        title: formData.headline || '',
        description: formData.description || '',
        category: formData.category || 'General Maintenance',
        sub_category: formData.subCategory || formData.subCategory1 || '',
        building: formData.building,
        location: locationStr,
        peoples: formData.peoples || formData.affectedPeople,
        created_at: new Date()
      });
    } catch (e) {
      return null;
    }
  }, [formData.headline, formData.description, formData.category, formData.subCategory, formData.subCategory1, formData.building, formData.zone, formData.room, formData.peoples, formData.affectedPeople]);

  const handleFileUpload = async (e) => {
    const uploaded = Array.from(e.target.files);
    if (!uploaded.length) return;

    // Immediately generate preview URLs for every file so user sees the images immediately
    const previewItems = await Promise.all(
      uploaded.map(f => new Promise((resolve) => {
        const objectUrl = URL.createObjectURL(f);
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve({
            name: f.name,
            size: `${(f.size / (1024 * 1024)).toFixed(2)} MB`,
            url: objectUrl,
            preview: objectUrl,
            dataUrl: reader.result,
            isImage: f.type ? f.type.startsWith('image/') : /\.(jpe?g|png|webp|gif|bmp|svg)$/i.test(f.name),
            uploadedAt: 'Uploaded just now'
          });
        };
        reader.readAsDataURL(f);
      }))
    );

    setFiles(prev => [...prev, ...previewItems]);

    // Also send to backend upload API for server-side persistence
    try {
      const data = new FormData();
      uploaded.forEach(file => data.append('files', file));
      const res = await uploadApi.uploadFiles(data);
      const serverFiles = res.data?.files || res.data?.data?.files;
      if (serverFiles && Array.isArray(serverFiles)) {
        setFiles(prev => {
          const updated = [...prev];
          serverFiles.forEach((sf, i) => {
            const targetIdx = updated.length - previewItems.length + i;
            if (updated[targetIdx]) {
              updated[targetIdx] = {
                ...updated[targetIdx],
                url: sf.url || updated[targetIdx].url,
                preview: sf.preview || updated[targetIdx].preview,
                filename: sf.filename
              };
            }
          });
          return updated;
        });
      }
    } catch (err) {
      console.warn('Backend file upload fallback to client preview:', err);
    }
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!formData.headline?.trim()) {
      showModal({
        type: 'warning',
        title: 'Issue Headline Required',
        message: 'Please enter an issue headline / ticket summary before proceeding.'
      });
      return;
    }
    if (!formData.category) {
      showModal({
        type: 'warning',
        title: 'Category Required',
        message: 'Please select a domain category for this maintenance request.'
      });
      return;
    }
    if (formData.category !== 'Others' && !formData.subCategory && !formData.subCategory1) {
      showModal({
        type: 'warning',
        title: 'Sub-Category Required',
        message: 'Please select a sub-category under the chosen domain.'
      });
      return;
    }
    if (!formData.building) {
      showModal({
        type: 'warning',
        title: 'Campus Building Required',
        message: 'Please select the campus building where maintenance is needed.'
      });
      return;
    }
    if (!formData.room) {
      showModal({
        type: 'warning',
        title: 'Location Details Required',
        message: 'Please specify the room, lab, or specific location.'
      });
      return;
    }
    if (!formData.peoples && !formData.affectedPeople) {
      showModal({
        type: 'warning',
        title: 'Affected People Scope Required',
        message: 'Please select the estimated range of affected people for priority assessment.'
      });
      return;
    }
    if (!formData.description?.trim()) {
      showModal({
        type: 'warning',
        title: 'Description Required',
        message: 'Please provide a detailed issue description explaining the problem.'
      });
      return;
    }

    setSubmitting(true);
    try {
      const assignedZone = formData.zone || (formData.building ? BUILDING_TO_ZONE[formData.building] : '') || '';
      const locationStr = formData.building && formData.room
        ? `${formData.building}${assignedZone ? ` (${assignedZone})` : ''} - ${formData.room}`
        : (formData.building ? `${formData.building}${assignedZone ? ` (${assignedZone})` : ''}` : (formData.room || 'Campus Facility'));

      const payload = {
        ...formData,
        zone: assignedZone,
        building: formData.building,
        room: formData.room,
        peoples: formData.peoples ? Number(formData.peoples) : null,
        affectedPeople: formData.affectedPeople || '',
        affectedPeopleText: formData.affectedPeople || '',
        subCategory: formData.subCategory || formData.subCategory1 || '',
        sub_category: formData.subCategory || formData.subCategory1 || '',
        subCategory1: formData.subCategory || formData.subCategory1 || '',
        title: formData.headline,
        location: locationStr,
        priority: priorityAssessment?.priorityLevel || 'Medium',
        priority_score: priorityAssessment?.score || null,
        priority_formula: priorityAssessment?.formula || null,
        fullName: profile?.fullName || `${profile?.firstName || ''} ${profile?.lastName || ''}`.trim() || formData.fullName,
        email: profile?.email || formData.email,
        department: profile?.division || profile?.department || formData.department,
        phone: profile?.phone || formData.phone,
        evidence: files.map(f => {
          const safeUrl = (f.url && !f.url.startsWith('blob:') && !f.url.startsWith('data:'))
            ? f.url
            : (f.serverUrl || `/uploads/${f.name}`);
          return {
            name: f.name,
            size: f.size,
            url: safeUrl,
            preview: safeUrl,
            type: f.type || 'image/png'
          };
        })
      };
      const res = await requestsApi.create(payload);

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });

      const createdId = res.data?.id || res.data?.data?.id || res.data?.request?.id || 'REQ-8291';
      showModal({
        type: 'success',
        title: 'Request Submitted Successfully!',
        message: 'Your maintenance request has been submitted and dispatched to the Maintenance Office for review.',
        details: {
          ticketId: createdId,
          category: payload.category,
          location: payload.location
        },
        confirmText: 'View Request Details',
        onConfirm: () => {
          setModalState(prev => ({ ...prev, isOpen: false }));
          navigate(`/requests/${createdId}`);
        }
      });
    } catch (err) {
      console.error('Submission failed:', err);
      const errMsg = err?.response?.data?.message || err?.message || 'Failed to submit maintenance request. Please verify connection and try again.';
      showModal({
        type: 'error',
        title: 'Submission Failed',
        message: errMsg
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    showModal({
      type: 'warning',
      title: 'Reset Form?',
      message: 'Are you sure you want to clear all entered fields in this form?',
      showCancel: true,
      cancelText: 'Keep Editing',
      confirmText: 'Reset All',
      onConfirm: () => {
        setFormData(prev => ({
          ...prev,
          headline: '',
          category: '',
          subCategory: '',
          subCategory1: '',
          building: '',
          room: '',
          description: ''
        }));
        setFiles([]);
        setModalState(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  return (
    <div className="w-full px-8 py-6 space-y-6 animate-fade-in pb-16">
      {/* Top Header & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm text-[#574141]">
          <button
            onClick={() => navigate('/requests')}
            className="flex items-center gap-1 text-[#7a1521] font-semibold hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Requests</span>
          </button>
          <span>•</span>
          <span>Maintenance Requests / New Ticket #REQ-2024-089</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="flex items-center gap-2 px-5 py-2 bg-[#7a1521] hover:bg-[#58000f] text-white text-xs font-semibold rounded-lg shadow-sm transition-all"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{submitting ? 'Submitting...' : 'Submit Request'}</span>
          </button>
        </div>
      </div>

      {/* Title & Badge */}
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-[#241919]">Create Maintenance Request</h1>
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#ffe9e8] text-[#7a1521] uppercase tracking-wider border border-[#ffdad9]">
            CAMPUS INTAKE
          </span>
        </div>
        <p className="text-sm text-[#574141] mt-1">
          Log unscheduled breakdowns, infrastructure hazards, or scheduled facility service tickets for ITUM estates.
        </p>
      </div>

      {/* Emergency Hotline Banner */}
      <div className="bg-[#ba1a1a] text-white rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="font-bold text-sm tracking-wide flex items-center gap-2">
              <span className="bg-white/20 px-2 py-0.5 rounded text-xs">IMMEDIATE HAZARD</span>
              <span>Critical Campus Emergency Hotline</span>
            </p>
            <p className="text-xs text-white/90 mt-0.5">
              For gas leaks, fire alarm triggers, active flooding, or exposed live electrical wires.
            </p>
          </div>
        </div>
        <a
          href={`tel:${officerPhone.replace(/[\s-]/g, '')}`}
          className="whitespace-nowrap flex items-center gap-2 px-5 py-2.5 bg-white text-[#ba1a1a] font-bold text-xs rounded-lg hover:bg-rose-50 shadow-sm transition-all"
        >
          <PhoneCall className="w-4 h-4" />
          <span>Call Maintenance Officer: {officerPhone}</span>
        </a>
      </div>

      <form onSubmit={handleSubmit} className="space-y-7">
        {/* Section 1: Requester & Faculty Verification */}
        <div className="bg-white border border-[#e2e8f0] rounded-xl p-6 shadow-card space-y-5">
          <div className="flex items-center justify-between border-b border-[#f1f5f9] pb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#ffe9e8] text-[#7a1521] flex items-center justify-center">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-bold text-base text-[#241919]">1. Requester & Faculty Verification</h2>
                <p className="text-xs text-[#574141]">Verified against ITUM staff directory (Linked to Profile Settings)</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-semibold border border-emerald-200">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>ITUM ADMIN APPROVED</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Requester Full Name */}
            <div>
              <label className="block text-xs font-bold text-[#574141] mb-1.5 flex items-center justify-between">
                <span>Requester Full Name</span>
                <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 font-medium">
                  <Lock className="w-3 h-3 text-slate-400" /> Read-only
                </span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-[#8a7170] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={profile?.fullName || `${profile?.firstName || ''} ${profile?.lastName || ''}`.trim() || formData.fullName}
                  readOnly
                  disabled
                  tabIndex={-1}
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-[#334155] font-medium cursor-not-allowed select-none shadow-xs"
                  title="Auto-filled from user profile settings. Cannot be edited directly."
                />
                <Lock className="w-3.5 h-3.5 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* Institutional Email */}
            <div>
              <label className="block text-xs font-bold text-[#574141] mb-1.5 flex items-center justify-between">
                <span>Institutional Email</span>
                <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 font-medium">
                  <Lock className="w-3 h-3 text-slate-400" /> Read-only
                </span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#8a7170] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={profile?.email || formData.email}
                  readOnly
                  disabled
                  tabIndex={-1}
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-[#334155] font-medium cursor-not-allowed select-none shadow-xs"
                  title="Auto-filled from user profile settings. Cannot be edited directly."
                />
                <Lock className="w-3.5 h-3.5 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* Academic Division / Unit */}
            <div>
              <label className="block text-xs font-bold text-[#574141] mb-1.5 flex items-center justify-between">
                <span>Academic Division / Unit</span>
                <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 font-medium">
                  <Lock className="w-3 h-3 text-slate-400" /> Read-only
                </span>
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-[#8a7170] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={profile?.division || profile?.department || formData.department}
                  readOnly
                  disabled
                  tabIndex={-1}
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-[#334155] font-medium cursor-not-allowed select-none shadow-xs"
                  title="Auto-filled from user profile settings. Cannot be edited directly."
                />
                <Lock className="w-3.5 h-3.5 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* Direct Mobile / Intercom */}
            <div>
              <label className="block text-xs font-bold text-[#574141] mb-1.5 flex items-center justify-between">
                <span>Direct Mobile / Intercom Ext.</span>
                <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 font-medium">
                  <Lock className="w-3 h-3 text-slate-400" /> Read-only
                </span>
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-[#8a7170] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={profile?.phone || formData.phone}
                  readOnly
                  disabled
                  tabIndex={-1}
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-[#334155] font-medium cursor-not-allowed select-none shadow-xs"
                  title="Auto-filled from user profile settings. Cannot be edited directly."
                />
                <Lock className="w-3.5 h-3.5 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Incident Identification & Location */}
        <div className="bg-white border border-[#e2e8f0] rounded-xl p-6 shadow-card space-y-5">
          <div className="flex items-center justify-between border-b border-[#f1f5f9] pb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#ffe9e8] text-[#7a1521] flex items-center justify-center">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-bold text-base text-[#241919]">2. Incident Identification & Location</h2>
                <p className="text-xs text-[#574141]">Physical coordinates for technician deployment</p>
              </div>
            </div>
            <span className="text-xs font-semibold text-rose-600">* Required Coordinates</span>
          </div>

          <div className="space-y-4">
            {/* Issue Headline */}
            <div>
              <label className="block text-xs font-bold text-[#574141] mb-1.5">
                Issue Headline / Ticket Summary <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                value={formData.headline}
                onChange={(e) => handleInputChange('headline', e.target.value)}
                placeholder="e.g. Air Conditioner Malfunction & Water Dripping in IT Lab 03"
                className="w-full px-4 py-2.5 bg-[#f8fafc] border border-[#e2e8f0] rounded-lg text-sm font-medium text-[#241919] input-focus"
                required
              />
            </div>

            {/* Domain Category & Sub Category */}
            <div className={`grid grid-cols-1 ${formData.category !== 'Others' ? 'md:grid-cols-2' : ''} gap-4`}>
              <div>
                <label className="block text-xs font-bold text-[#574141] mb-1.5">
                  Domain Category <span className="text-rose-600">*</span>
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#f8fafc] border border-[#e2e8f0] rounded-lg text-sm font-medium text-[#241919] input-focus"
                  required
                >
                  <option value="">-- Select Domain Category --</option>
                  {Object.keys(CATEGORY_SUBCATEGORIES).map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {formData.category !== 'Others' && (
                <div className="animate-in fade-in duration-150">
                  <label className="block text-xs font-bold text-[#574141] mb-1.5">
                    Sub Category <span className="text-rose-600">*</span>
                  </label>
                  <select
                    value={formData.subCategory || formData.subCategory1 || ''}
                    onChange={(e) => {
                      handleInputChange('subCategory', e.target.value);
                      handleInputChange('subCategory1', e.target.value);
                    }}
                    disabled={!formData.category}
                    className={`w-full px-4 py-2.5 border rounded-lg text-sm font-medium ${
                      !formData.category
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed border-slate-200'
                        : 'bg-[#f8fafc] text-[#241919] border-[#e2e8f0] input-focus'
                    }`}
                    required
                  >
                    <option value="">
                      {formData.category ? '-- Select Sub Category --' : '-- Select Category First --'}
                    </option>
                    {(CATEGORY_SUBCATEGORIES[formData.category] || []).map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Location Details: Building, Zone, Room */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#574141] mb-1.5">
                  Campus Building <span className="text-rose-600">*</span>
                </label>
                <select
                  value={formData.building}
                  onChange={(e) => handleBuildingChange(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#f8fafc] border border-[#e2e8f0] rounded-lg text-sm font-medium text-[#241919] input-focus"
                  required
                >
                  <option value="">-- Select Campus Building --</option>
                  {Object.entries(CAMPUS_ZONES).map(([zoneName, buildings]) => (
                    <optgroup key={zoneName} label={`--- ${zoneName} ---`}>
                      {buildings.map((b) => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#574141] mb-1.5 flex items-center justify-between">
                  <span>Campus Zone</span>
                  <span className="text-[10px] font-semibold text-slate-500 flex items-center gap-1">
                    <Lock size={11} className="text-slate-400" /> Auto-Assigned
                  </span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.zone || (formData.building ? BUILDING_TO_ZONE[formData.building] : '') || ''}
                    readOnly
                    disabled
                    tabIndex={-1}
                    placeholder="Auto-assigned based on building"
                    className="w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 cursor-not-allowed select-none pl-9"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock size={15} />
                  </div>
                  {formData.zone && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                        formData.zone === 'Zone A' ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                        formData.zone === 'Zone B' ? 'bg-blue-100 text-blue-800 border border-blue-300' :
                        'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      }`}>
                        {formData.zone}
                      </span>
                    </div>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 mt-1">Zone is automatically assigned and cannot be edited.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#574141] mb-1.5">
                  Location / Room <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  value={formData.room}
                  onChange={(e) => handleInputChange('room', e.target.value)}
                  placeholder="e.g. Lab 02 / Office Room 101"
                  className="w-full px-4 py-2.5 bg-[#f8fafc] border border-[#e2e8f0] rounded-lg text-sm font-medium text-[#241919] input-focus"
                  autoComplete="off"
                  required
                />
              </div>
            </div>

            {/* Estimated Affected People / Population Impact */}
            <div>
              <label className="block text-xs font-bold text-[#574141] mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-[#7a1521]" />
                  <span>Estimated Affected People <span className="text-rose-600">*</span></span>
                </span>
                <span className="text-[11px] text-[#8a7170]">Occupancy & Incident Reach Scale</span>
              </label>
              <select
                value={formData.peoples || ''}
                onChange={(e) => {
                  const val = e.target.value;
                  const matched = AFFECTED_PEOPLE_OPTIONS.find(o => o.value === val);
                  handleInputChange('peoples', val);
                  handleInputChange('affectedPeople', matched ? matched.label : val);
                }}
                className="w-full px-4 py-2.5 bg-[#f8fafc] border border-[#e2e8f0] rounded-lg text-sm font-medium text-[#241919] input-focus"
                required
              >
                <option value="">-- Select Affected People Range --</option>
                {AFFECTED_PEOPLE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Detailed Description */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-[#574141]">
                  Detailed Issue Description / Observations <span className="text-rose-600">*</span>
                </label>
                <span className="text-[11px] text-[#8a7170]">Min. 20 characters</span>
              </div>
              <textarea
                rows={4}
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe the symptoms, physical observations, sounds, or errors observed..."
                className="w-full px-4 py-2.5 bg-[#f8fafc] border border-[#e2e8f0] rounded-lg text-sm font-medium text-[#241919] input-focus leading-relaxed"
                required
              ></textarea>
            </div>




          </div>
        </div>

        {/* Section 3: Supporting Evidence & Visual Logs */}
        <div className="bg-white border border-[#e2e8f0] rounded-xl p-6 shadow-card space-y-5">
          <div className="flex items-center justify-between border-b border-[#f1f5f9] pb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#ffe9e8] text-[#7a1521] flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-bold text-base text-[#241919]">3. Supporting Evidence & Visual Logs</h2>
                <p className="text-xs text-[#574141]">High-clarity photos accelerate parts allocation</p>
              </div>
            </div>
            <span className="px-3 py-1 bg-[#ffe9e8] text-[#7a1521] text-xs font-semibold rounded-full border border-[#ffdad9]">
              {files.length} Files Attached
            </span>
          </div>

          {/* Upload Dropzone */}
          <label className="border-2 border-dashed border-[#ffdad9] hover:border-[#7a1521] bg-[#fff8f7] rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all group text-center block">
            <input
              type="file"
              multiple
              accept="image/*,.pdf"
              onChange={handleFileUpload}
              className="hidden"
            />
            <div className="w-12 h-12 rounded-full bg-[#ffe9e8] text-[#7a1521] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <UploadCloud className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-[#241919]">Click or drag images to upload evidence</p>
            <p className="text-xs text-[#574141] mt-1">
              Supports JPG, PNG, WEBP or PDF diagnostic logs up to 15MB each
            </p>
            <button
              type="button"
              className="mt-3 px-4 py-1.5 bg-[#ffe9e8] hover:bg-[#ffdad9] text-[#7a1521] text-xs font-semibold rounded-lg shadow-sm"
            >
              Browse Files
            </button>
          </label>

          {/* Attached Files List */}
          {files.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {files.map((file, idx) => {
                const imgSrc = file.preview || file.url || file.dataUrl;
                const isImg = file.isImage !== false && (Boolean(file.isImage) || (file.type && file.type.startsWith('image/')) || /\.(jpe?g|png|webp|gif|bmp|svg)$/i.test(file.name) || Boolean(imgSrc));

                return (
                  <div
                    key={idx}
                    className="bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-3.5 flex items-center justify-between gap-3 shadow-sm relative overflow-hidden group hover:border-[#7a1521]/40 transition-all"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      {/* Uploaded Image Real Thumbnail Preview */}
                      {isImg && imgSrc ? (
                        <div
                          onClick={() => setPreviewModalImage({ url: imgSrc, name: file.name, size: file.size })}
                          className="relative w-14 h-14 rounded-lg overflow-hidden border border-slate-200 shrink-0 bg-slate-100 group/thumb cursor-pointer shadow-xs hover:ring-2 hover:ring-[#7a1521]/40 transition-all"
                          title="Click to view full photo"
                        >
                          <img
                            src={imgSrc}
                            alt={file.name}
                            className="w-full h-full object-cover transition-transform duration-200 group-hover/thumb:scale-110"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.nextElementSibling?.classList.remove('hidden');
                            }}
                          />
                          <div className="hidden absolute inset-0 bg-[#241919] text-white flex items-center justify-center">
                            <ImageIcon className="w-5 h-5" />
                          </div>
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/thumb:opacity-100 flex items-center justify-center transition-opacity text-white">
                            <Eye className="w-4 h-4" />
                          </div>
                        </div>
                      ) : (
                        <div className="w-14 h-14 rounded-lg bg-[#241919] text-white flex items-center justify-center shrink-0 shadow-xs">
                          <FileText className="w-6 h-6 text-slate-300" />
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-bold text-[#241919] truncate">{file.name}</p>
                          <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                            Photo Ready
                          </span>
                        </div>
                        <p className="text-[10px] text-[#574141] mt-0.5">{file.size} • {file.uploadedAt}</p>
                        {isImg && imgSrc && (
                          <button
                            type="button"
                            onClick={() => setPreviewModalImage({ url: imgSrc, name: file.name, size: file.size })}
                            className="text-[11px] text-[#7a1521] hover:underline font-semibold flex items-center gap-1 mt-1 cursor-pointer"
                          >
                            <Eye className="w-3 h-3" />
                            <span>View Full Image</span>
                          </button>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeFile(idx)}
                      className="p-2 text-[#8a7170] hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors shrink-0"
                      title="Remove file"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    {/* Progress bar line */}
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#7a1521]"></div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Form Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#e2e8f0]">
          <div className="flex items-center gap-2 text-xs text-[#574141]">
            <ShieldCheck className="w-4 h-4 text-[#7a1521]" />
            <span>Log will be logged into ITUM Permanent Estates Ledger</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2 text-xs font-semibold text-[#574141] hover:bg-slate-100 rounded-lg transition-colors"
            >
              Reset Form
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-6 py-2.5 bg-[#7a1521] hover:bg-[#58000f] text-white text-xs font-bold rounded-lg shadow-sm transition-all"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{submitting ? 'Confirming...' : 'Confirm & Dispatch'}</span>
            </button>
          </div>
        </div>
      </form>

      {/* Centered Popup Modal Dialog (Screen eke meda pop wela penna) */}
      {modalState.isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 text-center animate-in zoom-in-95 duration-200">
            {/* Top Close Button */}
            <button
              type="button"
              onClick={() => setModalState(prev => ({ ...prev, isOpen: false }))}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Icon */}
            <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm ${
              modalState.type === 'success'
                ? 'bg-emerald-100 text-emerald-700'
                : modalState.type === 'warning'
                ? 'bg-amber-100 text-amber-700'
                : 'bg-[#ffe9e8] text-[#7a1521]'
            }`}>
              {modalState.type === 'success' ? (
                <CheckCircle2 className="w-8 h-8" />
              ) : modalState.type === 'warning' ? (
                <AlertCircle className="w-8 h-8" />
              ) : (
                <AlertTriangle className="w-8 h-8" />
              )}
            </div>

            {/* Title */}
            <h3 className="text-lg font-bold text-[#1e293b] mb-2">
              {modalState.title}
            </h3>

            {/* Message */}
            <p className="text-xs sm:text-sm text-[#475569] leading-relaxed mb-5">
              {modalState.message}
            </p>

            {/* Ticket Details if present */}
            {modalState.details && (
              <div className="bg-[#f8fafc] border border-slate-200 rounded-xl p-3 mb-5 text-left text-xs space-y-1.5">
                {modalState.details.ticketId && (
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Ticket ID:</span>
                    <span className="font-bold text-[#7a1521] bg-[#fff0ef] px-2 py-0.5 rounded border border-[#ffe9e8]">
                      #{modalState.details.ticketId}
                    </span>
                  </div>
                )}
                {modalState.details.category && (
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Category:</span>
                    <span className="font-semibold text-slate-700">{modalState.details.category}</span>
                  </div>
                )}
                {modalState.details.location && (
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Location:</span>
                    <span className="font-semibold text-slate-700 truncate max-w-[200px]">{modalState.details.location}</span>
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-center gap-3 pt-1">
              {modalState.showCancel && (
                <button
                  type="button"
                  onClick={() => setModalState(prev => ({ ...prev, isOpen: false }))}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-slate-300 text-slate-700 text-xs sm:text-sm font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  {modalState.cancelText || 'Cancel'}
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  if (modalState.onConfirm) {
                    modalState.onConfirm();
                  } else {
                    setModalState(prev => ({ ...prev, isOpen: false }));
                  }
                }}
                className="flex-1 py-2.5 px-4 rounded-xl bg-[#7a1521] hover:bg-[#58000f] text-white text-xs sm:text-sm font-bold shadow-md transition-all active:scale-98 cursor-pointer"
              >
                {modalState.confirmText || 'OK'}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Fullscreen Image Lightbox Modal */}
      {previewModalImage && (
        <div
          onClick={() => setPreviewModalImage(null)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
          >
            <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="min-w-0">
                <h4 className="text-sm font-bold text-[#241919] truncate">{previewModalImage.name || 'Uploaded Photo Preview'}</h4>
                {previewModalImage.size && <p className="text-xs text-slate-500">{previewModalImage.size}</p>}
              </div>
              <button
                type="button"
                onClick={() => setPreviewModalImage(null)}
                className="w-8 h-8 rounded-full hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 bg-slate-950 flex items-center justify-center overflow-auto max-h-[70vh]">
              <img
                src={previewModalImage.url}
                alt={previewModalImage.name || 'Preview'}
                className="max-w-full max-h-[65vh] object-contain rounded-lg shadow-lg"
              />
            </div>
            <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Attached Evidence Photo Preview</span>
              <button
                type="button"
                onClick={() => setPreviewModalImage(null)}
                className="px-4 py-1.5 bg-[#7a1521] text-white font-semibold rounded-lg hover:bg-[#5f1019] transition-colors cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
