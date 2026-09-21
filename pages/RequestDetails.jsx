import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  User,
  Building2,
  MapPin,
  Phone,
  Mail,
  FileText,
  History,
  ShieldCheck,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Star
} from 'lucide-react';
import { requestsApi } from '../services/api';
import EvidenceLightbox from '../components/EvidenceLightbox';
import RatingModal from '../components/RatingModal';

export default function RequestDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(null);
  const [showRatingModal, setShowRatingModal] = useState(false);

  useEffect(() => {
    async function loadTicket() {
      setLoading(true);
      try {
        let targetId = id;
        if (!targetId) {
          const all = await requestsApi.getAll({ limit: 1 });
          const list = all.data?.data || all.data?.requests || all.data || [];
          if (list.length > 0) {
            targetId = list[0].id;
          }
        }
        if (!targetId) {
          setTicket(null);
          setLoading(false);
          return;
        }
        const res = await requestsApi.getById(targetId);
        const raw = res.data?.data || res.data?.request || res.data;
        setTicket(raw);
      } catch (err) {
        console.error('Failed to load ticket details:', err);
        setTicket(null);
      } finally {
        setLoading(false);
      }
    }
    loadTicket();
  }, [id]);

  if (loading) {
    return (
      <div className="p-12 text-center text-[#574141]">
        <div className="w-8 h-8 border-4 border-[#7a1521] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-sm font-semibold">Loading permanent ledger records...</p>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="w-full px-8 py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-[#ffe9e8] text-[#7a1521] flex items-center justify-center mx-auto">
          <FileText className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-[#241919]">Request Not Found</h2>
        <p className="text-sm text-[#574141] max-w-md mx-auto">
          The requested maintenance ticket does not exist or has been removed.
        </p>
        <button
          onClick={() => navigate('/requests')}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#7a1521] hover:bg-[#58000f] text-white text-xs font-semibold rounded-lg shadow-sm transition-all"
        >
          Back to Requests
        </button>
      </div>
    );
  }

  // Normalize database and state properties
  const evidenceList = (() => {
    let imgs = ticket.images || ticket.evidence || [];
    if (typeof imgs === 'string') {
      try { imgs = JSON.parse(imgs); } catch (e) { imgs = []; }
    }
    if (!Array.isArray(imgs)) imgs = [];
    return imgs.map((img, idx) => {
      if (typeof img === 'string') {
        return { url: img, name: `Evidence_${idx + 1}.jpg`, size: '1.2 MB' };
      }
      return img;
    });
  })();

  const req = {
    ...ticket,
    id: ticket.id,
    title: ticket.title || 'Maintenance Request',
    description: ticket.description || 'No detailed description provided.',
    categoryFullName: ticket.category || ticket.categoryFullName || 'General Maintenance',
    priority: ticket.priority || 'Medium',
    status: ticket.status || 'Pending',
    location: ticket.location || 'Main Campus',
    requester: {
      name: ticket.requester?.name || ticket.requester_name || 'Dr. Kamal Silva',
      department: ticket.requester?.department || ticket.requester_dept || 'Division of Electrical & Computer Engineering',
      phone: ticket.requester?.phone || ticket.requester_phone || '+94 76 345 6789',
      email: ticket.requester?.email || ticket.requester_email || 'requester@itum.mrt.ac.lk'
    },
    evidence: evidenceList,
    timeAgo: ticket.created_at ? new Date(ticket.created_at).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }) : 'Recently',
    timeline: ticket.timeline || [
      {
        id: 1,
        title: 'Request Submitted',
        timestamp: ticket.created_at ? new Date(ticket.created_at).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }) : 'Recently',
        description: `Logged into system by ${ticket.requester_name || ticket.requester?.name || 'Requester'}.`
      },
      ...(ticket.status === 'In Progress' || ticket.status === 'Scheduled' || ticket.status === 'Completed' ? [{
        id: 2,
        title: 'Under Review & Processing',
        timestamp: ticket.scheduled_date ? new Date(ticket.scheduled_date).toLocaleDateString() : 'Active',
        description: ticket.assigned_team_name ? `Assigned to ${ticket.assigned_team_name}` : 'Reviewing personnel and allocation.'
      }] : []),
      ...(ticket.status === 'Completed' ? [{
        id: 3,
        title: 'Completed & Verified',
        timestamp: ticket.completion_date ? new Date(ticket.completion_date).toLocaleDateString() : 'Resolved',
        description: 'Maintenance work was finished successfully.'
      }] : [])
    ]
  };

  return (
    <div className="w-full px-8 py-6 space-y-6 animate-fade-in pb-16">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs font-semibold text-[#574141]">
        <Link to="/dashboard" className="hover:text-[#7a1521] transition-colors">Dashboard</Link>
        <ChevronRight className="w-3.5 h-3.5 text-[#8a7170]" />
        <Link to="/requests" className="hover:text-[#7a1521] transition-colors">Requests</Link>
        <ChevronRight className="w-3.5 h-3.5 text-[#8a7170]" />
        <span className="text-[#7a1521]">Review & Process Task (#{req.id})</span>
      </div>

      {/* Main Title Banner Card */}
      <div className="bg-white border border-[#e2e8f0] rounded-xl p-6 shadow-card space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-[#241919]">{req.title}</h1>
            <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-[#fef3c7] text-[#92400e] border border-[#fde68a]">
              #{req.id}
            </span>
          </div>
        </div>

        {/* Badges & Timestamp */}
        <div className="flex flex-wrap items-center gap-2.5 text-xs">
          <span className="px-2.5 py-0.5 rounded-full font-semibold bg-[#e0f2fe] text-[#0369a1] border border-[#bae6fd]">
            {req.categoryFullName}
          </span>
          <span className="px-2.5 py-0.5 rounded-full font-semibold bg-[#fef08a] text-[#854d0e] border border-[#fde047]">
            {req.priority} Priority
          </span>
          <span className="px-2.5 py-0.5 rounded-full font-semibold bg-[#ede9fe] text-[#5b21b6] border border-[#ddd6fe]">
            {req.status}
          </span>
          <span className="text-[#8a7170] ml-1">
            {req.timeAgo}
          </span>
        </div>
      </div>

      {/* Card 1: Requester & Faculty Information */}
      <div className="bg-white border border-[#e2e8f0] rounded-xl p-6 shadow-card space-y-4">
        <div className="flex items-center justify-between border-b border-[#f1f5f9] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#ffe9e8] text-[#7a1521] flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
            <h2 className="font-bold text-sm text-[#241919]">Requester & Faculty Information</h2>
          </div>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            Staff Verified
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          <div className="space-y-3">
            <div>
              <p className="text-[#8a7170] font-medium mb-1">Faculty Member / Requester</p>
              <p className="font-bold text-sm text-[#241919] flex items-center gap-1.5">
                <User className="w-4 h-4 text-[#7a1521]" />
                <span>{req.requester?.name || 'Dr. Kasun Perera'}</span>
              </p>
            </div>
            <div>
              <p className="text-[#8a7170] font-medium mb-1">Designated Location</p>
              <p className="font-semibold text-[#241919] flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[#7a1521]" />
                <span>{req.location || 'Main Block, Lecture Hall A (Complex B)'}</span>
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <p className="text-[#8a7170] font-medium mb-1">Academic Department</p>
              <p className="font-bold text-sm text-[#241919] flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-[#7a1521]" />
                <span>{req.requester?.department || 'Information Technology Division'}</span>
              </p>
            </div>
            <div>
              <p className="text-[#8a7170] font-medium mb-1">Direct Contact / Institutional Email</p>
              <p className="font-semibold text-[#241919] flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-[#7a1521]" />
                  {req.requester?.phone || '+94 77 890 1234'}
                </span>
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-[#7a1521]" />
                  {req.requester?.email || 'kasun.p@itum.mrt.ac.lk'}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Card 2: Incident Description & Evidence */}
      <div className="bg-white border border-[#e2e8f0] rounded-xl p-6 shadow-card space-y-4">
        <div className="flex items-center gap-2.5 border-b border-[#f1f5f9] pb-3">
          <div className="w-8 h-8 rounded-lg bg-[#ffe9e8] text-[#7a1521] flex items-center justify-center">
            <FileText className="w-4 h-4" />
          </div>
          <h2 className="font-bold text-sm text-[#241919]">Incident Description & Evidence</h2>
        </div>

        {/* Description box */}
        <div className="p-4 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl text-sm text-[#241919] leading-relaxed">
          {req.description}
        </div>

        {/* Evidence Photos */}
        <div>
          <div className="flex items-center justify-between mb-3 text-xs">
            <span className="font-bold text-[#574141]">
              Attached Visual Evidence ({req.evidence?.length || 0} Photos)
            </span>
            <span className="text-[#8a7170]">Uploaded during submission</span>
          </div>

          {req.evidence && req.evidence.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {req.evidence.map((img, idx) => (
                <div
                  key={idx}
                  className="bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-3 flex items-center gap-3 shadow-sm hover:border-[#ffb3b2] transition-colors group cursor-pointer"
                  onClick={() => setActiveImage(img)}
                >
                  <div className="w-14 h-14 rounded-lg bg-[#18181b] overflow-hidden shrink-0 border border-slate-300 flex items-center justify-center">
                    <img
                      src={img.url}
                      alt={img.name || 'Evidence'}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=200&q=80';
                      }}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-[#241919] truncate">{img.name || 'Photo Evidence'}</p>
                    <p className="text-[10px] text-[#574141]">{img.size || 'Attachment'}</p>
                    <span className="text-[11px] font-semibold text-[#7a1521] group-hover:underline flex items-center gap-1 mt-0.5">
                      Inspect full view
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-5 bg-[#f8fafc] border border-dashed border-[#e2e8f0] rounded-xl text-center text-xs font-semibold text-[#8a7170]">
              No image
            </div>
          )}
        </div>
      </div>

      {/* Card 3: Activity & Audit History */}
      <div className="bg-white border border-[#e2e8f0] rounded-xl p-6 shadow-card space-y-4">
        <div className="flex items-center justify-between border-b border-[#f1f5f9] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#ffe9e8] text-[#7a1521] flex items-center justify-center">
              <History className="w-4 h-4" />
            </div>
            <h2 className="font-bold text-sm text-[#241919]">Activity & Audit History</h2>
          </div>
          <span className="text-xs font-medium text-[#8a7170]">ITUM Permanent Ledger</span>
        </div>

        {/* Timeline */}
        <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#e2e8f0]">
          {(req.timeline || []).map((step, idx) => {
            const isFirst = idx === 0;
            return (
              <div key={step.id || idx} className="relative group">
                {/* Node circle */}
                <div
                  className={`absolute -left-6 top-1 w-4 h-4 rounded-full border-2 border-white shadow-sm flex items-center justify-center ${isFirst ? 'bg-[#ba1a1a]' : 'bg-[#94a3b8]'
                    }`}
                ></div>

                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                  <h4 className="text-xs font-bold text-[#241919]">{step.title}</h4>
                  <span className="text-[11px] font-medium text-[#8a7170] shrink-0">
                    {step.timestamp}
                  </span>
                </div>
                <p className="text-xs text-[#574141] mt-0.5">{step.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Lightbox for Evidence */}
      <EvidenceLightbox
        isOpen={Boolean(activeImage)}
        image={activeImage}
        onClose={() => setActiveImage(null)}
      />

      {/* Rating Modal */}
      <RatingModal
        isOpen={showRatingModal}
        ticket={req}
        onClose={() => setShowRatingModal(false)}
        onSubmit={async (ticketId, rating, feedback) => {
          await requestsApi.rate(ticketId, { rating, feedback });
          const updated = await requestsApi.getById(ticketId);
          setTicket(updated.data?.data || updated.data?.request || updated.data);
        }}
      />
    </div>
  );
}
