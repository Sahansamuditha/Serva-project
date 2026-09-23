import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Printer, 
  Phone, 
  Mail, 
  Info, 
  MapPin, 
  Calendar, 
  Tag, 
  User, 
  History,
  CheckCircle2,
  Clock,
  ChevronRight,
  ExternalLink,
  X
} from 'lucide-react';
import { api } from '../services/api';

export default function JobDetail({ jobId = '#JOB-1024', onBack }) {
  const [job, setJob] = useState(null);
  const [selectedAction, setSelectedAction] = useState(null);
  const [highlightedSection, setHighlightedSection] = useState(null);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const data = await api.getJobById(jobId);
        setJob(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchJob();
  }, [jobId]);

  const handlePrint = () => {
    window.print();
  };

  const handleActionClick = (item) => {
    setSelectedAction(item);

    // Determine target section ID
    let targetId = 'job-details-card';
    if (item.action.includes('Diagnosis') || item.action.includes('Parts')) {
      targetId = 'reference-images-card';
    } else if (item.action.includes('Scheduled') || item.action.includes('Assigned')) {
      targetId = 'assigned-personnel-card';
    } else if (item.action.includes('Approved') || item.action.includes('Created')) {
      targetId = 'job-details-card';
    }

    setHighlightedSection(targetId);
    const el = document.getElementById(targetId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    setTimeout(() => {
      setHighlightedSection(null);
    }, 3000);
  };

  const defaultJob = {
    jobId: '#JOB-1024',
    status: 'In Progress',
    priority: 'Critical',
    fullTitle: 'AC Unit Compressor Replacement',
    id: '#REQ-8291',
    locationFull: 'Science Bldg U2017',
    category: 'HVAC',
    reportedDate: 'Oct 24, 2023',
    requester: 'Dr. Sarah Jenkins',
    description: 'The main compressor unit has failed. Requires full replacement and system testing. Unit is currently leaking coolant and making abnormal grinding noises when powered on. Immediate attention required to prevent further damage to the central air system in the Science wing.',
    lead: 'David Chen',
    leadRole: 'Lead Technician / Supervisor',
    images: [
      '/images/electrical_panel_repair.png',
      '/images/ac_compressor_leak.png'
    ],
    actionHistory: [
      { 
        action: 'Diagnosis Complete - Parts ordered', 
        time: 'Today, 09:45 AM', 
        current: true,
        executor: 'David Chen (Lead Supervisor)',
        notes: 'Compressor replacement unit (Part #AC-9942) ordered from Central HVAC Warehouse. Estimated delivery: 2 hours.'
      },
      { 
        action: 'Job Scheduled', 
        time: 'Oct 24, 14:30 PM',
        executor: 'Central Dispatching Officer',
        notes: 'Team Alpha assigned with supervisor David Chen. Inspection slot booked for 14:30 PM.'
      },
      { 
        action: 'Request Approved', 
        time: 'Oct 24, 10:15 AM',
        executor: 'Dr. Anura Perera (Director)',
        notes: 'Urgent priority approval granted due to server room thermal threshold risk.'
      },
      { 
        action: 'Request Created', 
        time: 'Oct 24, 08:00 AM',
        executor: 'Dr. Sarah Jenkins (Requester)',
        notes: 'Initial work order REQ-8291 created for Science Bldg U2017 AC compressor failure.'
      }
    ]
  };

  const currentJob = job || defaultJob;
  const imageList = (currentJob.images && currentJob.images.length > 0) 
    ? currentJob.images 
    : ['/images/electrical_panel_repair.png', '/images/ac_compressor_leak.png'];

  return (
    <div className="space-y-6 w-full animate-in fade-in duration-200">
      {/* Back button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Jobs</span>
      </button>

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{currentJob.jobId || '#JOB-1024'}</h1>
            <span className="bg-blue-100 text-blue-700 font-medium px-3 py-0.5 rounded-full text-xs">
              {currentJob.jobStatus || currentJob.status || 'In Progress'}
            </span>
            <span className="bg-red-50 text-red-600 border border-red-200/80 px-2.5 py-0.5 rounded text-xs font-semibold flex items-center gap-1">
              <span>▲</span> {currentJob.priority || 'Critical'}
            </span>
          </div>
          <p className="text-sm text-slate-600 font-medium mt-1">{currentJob.fullTitle || currentJob.title}</p>
        </div>

        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg text-xs font-semibold text-slate-700 shadow-sm transition-colors"
        >
          <Printer className="w-4 h-4 text-slate-500" />
          <span>Print Work Order</span>
        </button>
      </div>

      {/* Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 cols): Job Details + Assigned Personnel */}
        <div className="lg:col-span-8 space-y-6">
          {/* Job Details Card */}
          <div
            id="job-details-card"
            className={`admin-card p-6 transition-all duration-500 ${
              highlightedSection === 'job-details-card'
                ? 'ring-2 ring-[#7a1521] shadow-lg scale-[1.01]'
                : ''
            }`}
          >
            <div className="flex items-center gap-2 font-bold text-slate-800 text-base mb-5">
              <Info className="w-4 h-4 text-slate-400" />
              <span>Job Details</span>
            </div>

            {/* Meta Attributes Grid */}
            <div className="grid grid-cols-2 gap-y-5 gap-x-6 pb-6 border-b border-slate-100 text-xs">
              <div>
                <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  REQUEST ID
                </span>
                <span className="font-semibold text-slate-700">{currentJob.id || '#REQ-8291'}</span>
              </div>

              <div>
                <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  LOCATION
                </span>
                <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {currentJob.locationFull || currentJob.location}
                </span>
              </div>

              <div>
                <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  CATEGORY
                </span>
                <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-slate-400" />
                  {currentJob.category}
                </span>
              </div>

              <div>
                <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  REPORTED DATE
                </span>
                <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  {currentJob.reportedDate || 'Oct 24, 2023'}
                </span>
              </div>

              <div className="col-span-2">
                <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  REQUESTER
                </span>
                <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  {currentJob.requester || 'Dr. Sarah Jenkins'}
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="py-5 border-b border-slate-100">
              <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                DESCRIPTION
              </span>
              <div className="p-4 bg-slate-50 rounded-xl text-xs text-slate-700 leading-relaxed border border-slate-100">
                {currentJob.description}
              </div>
            </div>

            {/* Reference Images */}
            <div
              id="reference-images-card"
              className={`pt-5 transition-all duration-500 rounded-xl ${
                highlightedSection === 'reference-images-card'
                  ? 'ring-2 ring-[#7a1521] p-3 bg-[#fff8f7]/50'
                  : ''
              }`}
            >
              <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">
                REFERENCE IMAGES
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="aspect-video bg-slate-100 rounded-xl overflow-hidden border border-slate-200 relative group shadow-sm">
                  <img
                    src={imageList[0] || '/images/electrical_panel_repair.png'}
                    alt="Electrical Panel Inspection"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/images/electrical_panel_repair.png';
                    }}
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent p-2.5 pt-6 text-white text-[11px] font-semibold flex items-center justify-between">
                    <span>Electrical Main Panel Inspection</span>
                    <span className="bg-white/20 backdrop-blur-md px-2 py-0.5 rounded text-[10px]">Photo #1</span>
                  </div>
                </div>

                <div className="aspect-video bg-slate-100 rounded-xl overflow-hidden border border-slate-200 relative group shadow-sm">
                  <img
                    src={imageList[1] || '/images/ac_compressor_leak.png'}
                    alt="Compressor Leak Inspection"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/images/ac_compressor_leak.png';
                    }}
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent p-2.5 pt-6 text-white text-[11px] font-semibold flex items-center justify-between">
                    <span>AC Unit Compressor Leak</span>
                    <span className="bg-red-500/80 backdrop-blur-md px-2 py-0.5 rounded text-[10px]">Critical Evidence</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Assigned Personnel Card */}
          <div
            id="assigned-personnel-card"
            className={`admin-card p-6 transition-all duration-500 ${
              highlightedSection === 'assigned-personnel-card'
                ? 'ring-2 ring-[#7a1521] shadow-lg scale-[1.01]'
                : ''
            }`}
          >
            <div className="flex items-center gap-2 font-bold text-slate-800 text-base mb-4">
              <User className="w-4 h-4 text-slate-400" />
              <span>Assigned Personnel</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-200 border border-slate-300 shrink-0">
                  <img
                    src="/images/david_chen_avatar.png"
                    alt="David Chen"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/images/david_chen_avatar.png';
                    }}
                  />
                </div>
                <div>
                  <div className="font-bold text-xs text-slate-800">{currentJob.lead || 'David Chen'}</div>
                  <div className="text-[11px] text-slate-500">{currentJob.leadRole || 'Lead Technician / Supervisor'}</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => alert("Calling technician")}
                  className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 shadow-sm"
                >
                  <Phone className="w-4 h-4" />
                </button>
                <button
                  onClick={() => alert("Sending email")}
                  className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 shadow-sm"
                >
                  <Mail className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): Action History Timeline */}
        <div className="lg:col-span-4">
          <div className="admin-card p-6 sticky top-24">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2 font-bold text-slate-800 text-base">
                <History className="w-4 h-4 text-[#58000f]" />
                <span>Action History</span>
              </div>
              <span className="text-[10px] bg-slate-100 text-slate-500 font-medium px-2 py-0.5 rounded">
                Click to Navigate
              </span>
            </div>

            <div className="space-y-3 relative before:absolute before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-100">
              {(currentJob.actionHistory || []).map((item, idx) => {
                const isCurrent = item.current;
                return (
                  <div
                    key={idx}
                    onClick={() => handleActionClick(item)}
                    className="flex items-start gap-3.5 relative p-2.5 rounded-xl border border-slate-100 hover:border-[#7a1521]/40 bg-white hover:bg-[#fff8f7]/60 cursor-pointer transition-all group shadow-2xs"
                  >
                    <div className={`w-4 h-4 rounded-full border-2 border-white shrink-0 mt-0.5 z-10 ${
                      isCurrent ? 'bg-blue-600 ring-4 ring-blue-100' : 'bg-emerald-500'
                    }`}></div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <div className="text-xs font-semibold text-slate-900 group-hover:text-[#58000f] transition-colors truncate">
                          {item.action}
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#58000f] group-hover:translate-x-0.5 transition-all shrink-0" />
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{item.time}</span>
                        {isCurrent && (
                          <span className="ml-auto text-[10px] bg-blue-50 text-blue-700 font-bold px-1.5 py-0.2 rounded border border-blue-200">
                            ACTIVE
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Action Telemetry & Navigation Modal */}
      {selectedAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 space-y-5 animate-in zoom-in-95 duration-150 relative">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#58000f]/10 text-[#58000f] flex items-center justify-center font-bold">
                  <History className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Action Telemetry & Navigation</h3>
                  <p className="text-[11px] text-slate-500">Audit details for action event log</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedAction(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Action Details Body */}
            <div className="space-y-3.5 text-xs">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-slate-900">{selectedAction.action}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    selectedAction.current ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {selectedAction.current ? 'Current Active Action' : 'Completed Event'}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-slate-500 text-[11px]">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    {selectedAction.time}
                  </span>
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3 text-slate-400" />
                    {selectedAction.executor || 'David Chen (Lead Supervisor)'}
                  </span>
                </div>
              </div>

              {/* Detailed Audit Description */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  ACTION SUMMARY & AUDIT LOG
                </span>
                <p className="p-3 bg-white border border-slate-200 rounded-xl text-slate-700 leading-relaxed text-xs">
                  {selectedAction.notes || (
                    selectedAction.action.includes('Diagnosis')
                      ? 'Technician inspected AC compressor unit in Science Bldg U2017. Confirmed coolant leak and grinding noise. Replacement compressor unit (Model: AC-9942) ordered from Central HVAC Stockroom.'
                      : selectedAction.action.includes('Scheduled')
                      ? 'Work order assigned to Team Alpha with supervisor David Chen. Field inspection slot booked for 14:30 PM.'
                      : selectedAction.action.includes('Approved')
                      ? 'Director Dr. Anura Perera authorized emergency dispatch under Server Room Thermal Threshold Protection guidelines.'
                      : 'Initial ticket logged by requester Dr. Sarah Jenkins detailing AC failure in Science Wing U2017.'
                  )}
                </p>
              </div>
            </div>

            {/* Navigation Actions Footer */}
            <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                onClick={() => {
                  const targetId = selectedAction.action.includes('Diagnosis')
                    ? 'reference-images-card'
                    : selectedAction.action.includes('Scheduled')
                    ? 'assigned-personnel-card'
                    : 'job-details-card';
                  
                  setSelectedAction(null);
                  setHighlightedSection(targetId);
                  const el = document.getElementById(targetId);
                  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  setTimeout(() => setHighlightedSection(null), 3000);
                }}
                className="w-full sm:w-auto px-4 py-2 bg-[#58000f] hover:bg-[#7a1521] text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-sm"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Navigate & Highlight Target Section</span>
              </button>

              <button
                onClick={() => setSelectedAction(null)}
                className="w-full sm:w-auto px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

