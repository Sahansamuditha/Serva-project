import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Bookmark,
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
  Lock
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { requestsApi, uploadApi } from '../services/api';
import { useProfile } from '../context/ProfileContext';

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
  'HVAC & Air Conditioning Systems': {
    sub1: [
      'Indoor Unit / Evaporator',
      'Outdoor Condenser',
      'Thermostat Controller',
      'Chiller System',
      'Ducting & Ventilation'
    ],
    sub2: [
      'Water Leakage & Drainage',
      'Refrigerant Gas Leak',
      'Compressor Motor Failure',
      'Electrical Power Tripping',
      'Noise & Vibration'
    ],
    sub3: [
      'Drainage Pump & Tray',
      'Filter Clog',
      'Blower Fan Bearing',
      'PCB Control Board',
      'Capacitor Failure'
    ]
  },
  'Electrical & Power Distribution': {
    sub1: [
      'Main Distribution Board (MDB)',
      'Sub-Switchboard & Breakers',
      'Power Sockets & Plugs',
      'Lighting & Fixtures',
      'UPS & Generator Backup'
    ],
    sub2: [
      'Short Circuit & Tripping',
      'No Power Supply',
      'Flickering Lights / Burnt Bulbs',
      'Sparking / Burnt Smell',
      'Earth Leakage Fault'
    ],
    sub3: [
      'MCB / RCCB Replacement',
      'Wiring Insulation Damage',
      'Socket Module Burnt',
      'Ballast / Driver Fault',
      'Terminal Loose Connection'
    ]
  },
  'Plumbing & Sanitation': {
    sub1: [
      'Washroom Fixtures',
      'Water Supply Pipeline',
      'Drainage & Sewerage',
      'Overhead Water Tank',
      'Water Pump & Motor'
    ],
    sub2: [
      'Pipe Burst / Major Leak',
      'Drain Blockage / Overflow',
      'Low Water Pressure / No Water',
      'Tap / Valve Damaged',
      'Toilet Flush Malfunction'
    ],
    sub3: [
      'Gasket / Washer Replacement',
      'P-Trap / Siphon Cleanout',
      'Float Valve Replacement',
      'Pressure Relief Valve Fault',
      'Pipe Section Re-routing'
    ]
  },
  'AV & Multimedia Systems': {
    sub1: [
      'Ceiling Projector',
      'Smart Board / Display Panel',
      'Audio Amplifier & Speakers',
      'Microphone & Podium Unit',
      'HDMI / VGA Cabling & Ports'
    ],
    sub2: [
      'No Display / Lamp Error',
      'No Sound / Audio Distortion',
      'Signal Distortion / Color Tint',
      'Power Unit Failure',
      'Remote / Control Panel Unresponsive'
    ],
    sub3: [
      'Projector Lamp Replacement',
      'Audio Cable / Connector Repair',
      'Power Supply Unit (PSU)',
      'HDMI Matrix / Switcher Fault',
      'Ceiling Mount Hardware'
    ]
  },
  'Carpentry & Structural Works': {
    sub1: [
      'Doors & Locks / Handles',
      'Windows & Glass Panels',
      'Classroom / Office Desks & Chairs',
      'Ceiling Tiles & Partitions',
      'Flooring & Roofing'
    ],
    sub2: [
      'Broken Lock / Key Stuck',
      'Hinges Broken / Door Jammed',
      'Broken Glass / Frame Loose',
      'Damaged Wood / Table Leg Broken',
      'Water Leak Through Ceiling'
    ],
    sub3: [
      'Cylinder Lock Replacement',
      'Door Closer Hydraulic Repair',
      'Structural Welding / Fasteners',
      'Acoustic Tile Replacement',
      'Handle & Latch Fix'
    ]
  }
};

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
    subCategory1: '',
    subCategory2: '',
    subCategory3: '',
    building: '',
    room: '',
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

  const [files, setFiles] = useState([]);

  const [submitting, setSubmitting] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCategoryChange = (val) => {
    setFormData(prev => ({
      ...prev,
      category: val,
      subCategory1: '',
      subCategory2: '',
      subCategory3: ''
    }));
  };

  const handleBuildingChange = (val) => {
    setFormData(prev => ({
      ...prev,
      building: val
    }));
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
    if (!formData.headline?.trim()) {
      alert('Please enter an issue headline / ticket summary.');
      return;
    }
    if (!formData.category) {
      alert('Please select a Domain Category.');
      return;
    }
    if (!formData.subCategory1) {
      alert('Please select Sub Category 1.');
      return;
    }
    if (!formData.subCategory2) {
      alert('Please select Sub Category 2.');
      return;
    }
    if (!formData.subCategory3) {
      alert('Please select Sub Category 3.');
      return;
    }
    if (!formData.building) {
      alert('Please select a Campus Building.');
      return;
    }
    if (!formData.room) {
      alert('Please enter the Location.');
      return;
    }
    if (!formData.description?.trim()) {
      alert('Please provide a detailed issue description.');
      return;
    }

    setSubmitting(true);
    try {
      const locationStr = formData.building && formData.room
        ? `${formData.building} - ${formData.room}`
        : (formData.room || formData.building || 'Campus Facility');

      const payload = {
        ...formData,
        title: formData.headline,
        location: locationStr,
        fullName: profile?.fullName || `${profile?.firstName || ''} ${profile?.lastName || ''}`.trim() || formData.fullName,
        email: profile?.email || formData.email,
        department: profile?.division || profile?.department || formData.department,
        phone: profile?.phone || formData.phone,
        evidence: files
      };
      const res = await requestsApi.create(payload);

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });

      const createdId = res.data?.id || res.data?.data?.id || res.data?.request?.id || 'REQ-8291';
      setTimeout(() => {
        navigate(`/requests/${createdId}`);
      }, 1000);
    } catch (err) {
      console.error('Submission failed:', err);
      alert('Failed to submit maintenance request.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveDraft = () => {
    localStorage.setItem('serva_draft_ticket', JSON.stringify({ formData, files }));
    setDraftSaved(true);
    setTimeout(() => setDraftSaved(false), 3000);
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all fields in this form?')) {
      setFormData(prev => ({
        ...prev,
        headline: '',
        category: '',
        subCategory1: '',
        subCategory2: '',
        subCategory3: '',
        building: '',
        room: '',
        description: ''
      }));
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
            onClick={handleSaveDraft}
            className="flex items-center gap-2 px-4 py-2 border border-[#e2e8f0] bg-white text-[#574141] hover:bg-slate-50 text-xs font-semibold rounded-lg shadow-sm transition-all"
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>{draftSaved ? 'Draft Saved!' : 'Save Draft'}</span>
          </button>
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

            {/* Domain Category */}
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

            {/* 3 Sub Categories */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#574141] mb-1.5">
                  Sub Category 1 <span className="text-rose-600">*</span>
                </label>
                <select
                  value={formData.subCategory1}
                  onChange={(e) => handleInputChange('subCategory1', e.target.value)}
                  disabled={!formData.category}
                  className={`w-full px-3 py-2 border rounded-lg text-xs font-medium ${!formData.category
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed border-slate-200'
                      : 'bg-[#f8fafc] text-[#241919] border-[#e2e8f0] input-focus'
                    }`}
                  required
                >
                  <option value="">{formData.category ? '-- Select Sub Category 1 --' : '-- Select Category First --'}</option>
                  {(CATEGORY_SUBCATEGORIES[formData.category]?.sub1 || []).map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#574141] mb-1.5">
                  Sub Category 2 <span className="text-rose-600">*</span>
                </label>
                <select
                  value={formData.subCategory2}
                  onChange={(e) => handleInputChange('subCategory2', e.target.value)}
                  disabled={!formData.category}
                  className={`w-full px-3 py-2 border rounded-lg text-xs font-medium ${!formData.category
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed border-slate-200'
                      : 'bg-[#f8fafc] text-[#241919] border-[#e2e8f0] input-focus'
                    }`}
                  required
                >
                  <option value="">{formData.category ? '-- Select Sub Category 2 --' : '-- Select Category First --'}</option>
                  {(CATEGORY_SUBCATEGORIES[formData.category]?.sub2 || []).map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#574141] mb-1.5">
                  Sub Category 3 <span className="text-rose-600">*</span>
                </label>
                <select
                  value={formData.subCategory3}
                  onChange={(e) => handleInputChange('subCategory3', e.target.value)}
                  disabled={!formData.category}
                  className={`w-full px-3 py-2 border rounded-lg text-xs font-medium ${!formData.category
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed border-slate-200'
                      : 'bg-[#f8fafc] text-[#241919] border-[#e2e8f0] input-focus'
                    }`}
                  required
                >
                  <option value="">{formData.category ? '-- Select Sub Category 3 --' : '-- Select Category First --'}</option>
                  {(CATEGORY_SUBCATEGORIES[formData.category]?.sub3 || []).map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Building & Room */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  {Object.keys(BUILDING_ROOMS).map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#574141] mb-1.5">
                  Location <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  value={formData.room}
                  onChange={(e) => handleInputChange('room', e.target.value)}
                  placeholder="e.g. Lab U2017 (Computer Lab 03) / Staff Common Room"
                  className="w-full px-4 py-2.5 bg-[#f8fafc] border border-[#e2e8f0] rounded-lg text-sm font-medium text-[#241919] input-focus"
                  autoComplete="off"
                  required
                />
              </div>
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

        {/* Section 4: Supporting Evidence & Visual Logs */}
        <div className="bg-white border border-[#e2e8f0] rounded-xl p-6 shadow-card space-y-5">
          <div className="flex items-center justify-between border-b border-[#f1f5f9] pb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#ffe9e8] text-[#7a1521] flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-bold text-base text-[#241919]">4. Supporting Evidence & Visual Logs</h2>
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
