import React, { useState, useEffect } from 'react';
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
  AlertTriangle,
  Lock,
  Users
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { requestsApi, uploadApi } from '../services/api';
import { useProfile } from '../context/ProfileContext';
import { CAMPUS_ZONES, BUILDING_TO_ZONE } from '../utils/campusLocations';

const BUILDING_ROOMS = {
  'IT Center Complex (Block C)': [
    'Lab U2017 (Computer Lab 03)',
    'Lab U2018 (Networking Lab)',
    'Lab U2019 (Software Engineering Lab)',
    'Server Room (U2017-SR)',
    'Lecturer Room C-101',
    'Staff Common Room'
  ],
  'Science Building (Block S)': [
    'Chemistry Lab (Block S - 101)',
    'Physics Lab (Block S - 102)',
    'Materials Science Lab (Block S - 201)',
    'Lecture Hall S-01',
    'Faculty Office S-02'
  ],
  'Main Block (Complex B)': [
    'Lecture Hall A (Complex B)',
    'Lecture Hall B (Complex B)',
    'Auditorium (Ground Floor)',
    "Dean's Office / Administration",
    'Conference Room 1'
  ],
  'Library Complex': [
    'Reading Hall (1st Floor)',
    'Reading Hall (2nd Floor)',
    'Digital Library / IT Corner',
    'Reference Section',
    'Periodicals Section'
  ],
  'Engineering Workshop': [
    'Mechanical Workshop Bay 1',
    'Welding & Fabrication Unit',
    'Automotive Bay 2',
    'Carpentry & Timber Section',
    'Electrical Machine Lab'
  ]
};

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
    fullName: profile?.fullName || `${profile?.firstName || ''} ${profile?.lastName || ''}`.trim() || 'Anura Perera',
    email: profile?.email || 'anura.perera@itum.mrt.ac.lk',
    department: profile?.division || profile?.department || 'ITUM Central',
    phone: profile?.phone || '+94 77 123 4567',
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
    if (profile && profile.firstName) {
      setFormData(prev => ({
        ...prev,
        fullName: profile.fullName || `${profile.firstName} ${profile.lastName}`.trim(),
        email: profile.email || prev.email,
        department: profile.division || profile.department || prev.department,
        phone: profile.phone || prev.phone
      }));
    }
  }, [profile]);

  const [files, setFiles] = useState([]);

  const [submitting, setSubmitting] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = async (e) => {
    const uploaded = Array.from(e.target.files);
    if (!uploaded.length) return;

    const data = new FormData();
    uploaded.forEach(file => data.append('files', file));

    try {
      const res = await uploadApi.uploadFiles(data);
      setFiles(prev => [...prev, ...res.data.files]);
    } catch (err) {
      // Create local fallback
      const newItems = uploaded.map(f => ({
        name: f.name,
        size: `${(f.size / (1024 * 1024)).toFixed(1)} MB`,
        url: URL.createObjectURL(f),
        uploadedAt: 'Uploaded just now'
      }));
      setFiles(prev => [...prev, ...newItems]);
    }
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!formData.headline || !formData.description) {
      alert('Please provide an issue headline and detailed description.');
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
        location: locationStr,
        evidence: files
      };
      const res = await requestsApi.create(payload);

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });

      setTimeout(() => {
        navigate(`/requests/${res.data.id || 'REQ-8291'}`);
      }, 1000);
    } catch (err) {
      console.error('Submission failed:', err);
      alert('Failed to submit maintenance request.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all fields in this form?')) {
      setFormData({
        fullName: '',
        email: '',
        department: 'Information Technology Division',
        phone: '',
        headline: '',
        category: 'HVAC & Air Conditioning Systems',
        subCategory1: '',
        subCategory2: '',
        subCategory3: '',
        building: 'IT Center Complex (Block C)',
        room: '',
        description: ''
      });
      setFiles([]);
    }
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
          href="tel:1199"
          className="whitespace-nowrap flex items-center gap-2 px-5 py-2.5 bg-white text-[#ba1a1a] font-bold text-xs rounded-lg hover:bg-rose-50 shadow-sm transition-all"
        >
          <PhoneCall className="w-4 h-4" />
          <span>Call Hotline: 1199</span>
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
                <p className="text-xs text-[#574141]">Verified against ITUM staff academic directory</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 bg-[#ffe9e8] text-[#7a1521] rounded-full text-xs font-semibold border border-[#ffdad9]">
              <ShieldCheck className="w-4 h-4" />
              <span>Faculty SSO Active</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Requester Full Name */}
            <div>
              <label className="block text-xs font-bold text-[#574141] mb-1.5">
                Requester Full Name <span className="text-rose-600">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-[#8a7170] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#f8fafc] border border-[#e2e8f0] rounded-lg text-sm text-[#241919] font-medium input-focus"
                  required
                />
              </div>
            </div>

            {/* Institutional Email */}
            <div>
              <label className="block text-xs font-bold text-[#574141] mb-1.5">
                Institutional Email <span className="text-rose-600">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#8a7170] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#f8fafc] border border-[#e2e8f0] rounded-lg text-sm text-[#241919] font-medium input-focus"
                  required
                />
              </div>
            </div>

            {/* Academic Division / Unit */}
            <div>
              <label className="block text-xs font-bold text-[#574141] mb-1.5">
                Academic Division / Unit <span className="text-rose-600">*</span>
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-[#8a7170] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <select
                  value={formData.department}
                  onChange={(e) => handleInputChange('department', e.target.value)}
                  className="w-full pl-10 pr-8 py-2.5 bg-[#f8fafc] border border-[#e2e8f0] rounded-lg text-sm text-[#241919] font-medium appearance-none input-focus"
                >
                  <option value="Information Technology Division">Information Technology Division</option>
                  <option value="Civil Engineering Division">Civil Engineering Division</option>
                  <option value="Electrical & Electronics Division">Electrical & Electronics Division</option>
                  <option value="Mechanical Engineering Division">Mechanical Engineering Division</option>
                </select>
              </div>
            </div>

            {/* Direct Mobile / Intercom */}
            <div>
              <label className="block text-xs font-bold text-[#574141] mb-1.5">
                Direct Mobile / Intercom Ext. <span className="text-rose-600">*</span>
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-[#8a7170] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#f8fafc] border border-[#e2e8f0] rounded-lg text-sm text-[#241919] font-medium input-focus"
                  required
                />
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
                  onChange={(e) => {
                    handleInputChange('category', e.target.value);
                    handleInputChange('subCategory', '');
                    handleInputChange('subCategory1', '');
                  }}
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
                  onChange={(e) => {
                    const b = e.target.value;
                    const z = BUILDING_TO_ZONE[b] || '';
                    setFormData(prev => ({
                      ...prev,
                      building: b,
                      zone: z
                    }));
                  }}
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
              {files.map((file, idx) => (
                <div
                  key={idx}
                  className="bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-3.5 flex items-center justify-between gap-3 shadow-sm relative overflow-hidden"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-[#241919] text-white flex items-center justify-center shrink-0">
                      <ImageIcon className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[#241919] truncate">{file.name}</p>
                      <p className="text-[10px] text-[#574141]">{file.size} • {file.uploadedAt}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFile(idx)}
                    className="p-1.5 text-[#8a7170] hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  {/* Progress bar line */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#7a1521]"></div>
                </div>
              ))}
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
    </div>
  );
}
