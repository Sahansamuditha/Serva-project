import React, { useState } from 'react';

interface PhotoUploaderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: (photoUrl: string, notes: string) => void;
  ticketId?: string;
}

export const PhotoUploaderModal: React.FC<PhotoUploaderModalProps> = ({
  isOpen,
  onClose,
  onUploadSuccess,
  ticketId = '#REQ-8291',
}) => {
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [remarks, setRemarks] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  if (!isOpen) return null;

  const demoPhotos = [
    {
      url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAm84UGWK9BoQ1beXiCNHf4gcXpMfp6DWzoIVKvJQKIQeNllURyL_usxq9rDcrxdaqILWGtuwphTz69n3xCo8ek7nAKYlfQbqOVUqJC7Elcrcewx0GA6dmHj75fbMS0X2dPQvcK6kboRDq6X0lQYsZU_dKjg7OEHWz4m6cggssJ5FGtN9bEAC0fSvVd-fV7QOoEwF26LCzf0m19Q5SWey0p5j1dg7o2oZJam_THQ7oPvst0lKRQEgVA',
      label: 'Newly replaced ballast coil & wire harness (GPS Stamped)',
    },
    {
      url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBVLVsU8RQgn97JUTj4h6RmlrsCcRWlMT7Hk9VFswn_vFCXmIoFUOIPb6pyLUiXakoIcibSaW2Sfs0oR8BgiGi2HvWHV4dUkHkABuV6WY1wbELQKu5TCk7a8SRSvuuQ-hf3qEhcFid9KXhuKVw0MFeIRKrj4h2Iv8v5aF-jp9jaoN3oWzCl9q3L3Vo72htlCNZtqGJC7puuafszKHzVcZ2IgkDa0BPEsl0kkWWEOogj5IXtrSeYtA4OTQ',
      label: 'Pressure gauge reading optimal 120 PSI post gas refill',
    },
  ];

  const quickTags = [
    '+ Flushed drain line',
    '+ Refilled R410A',
    '+ Cleaned coils',
    '+ Replaced faceplate',
    '+ Inspected wiring',
  ];

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSave = () => {
    setIsUploading(true);
    setTimeout(() => {
      const fullNotes = [
        ...selectedTags,
        remarks,
      ].filter(Boolean).join(' • ');

      const finalPhoto = selectedPhoto || demoPhotos[0].url;
      onUploadSuccess(finalPhoto, fullNotes || 'Work verified and rectified.');
      setIsUploading(false);
      onClose();
    }, 800);
  };

  return (
    <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end justify-center p-0 animate-in fade-in duration-200 rounded-[44px] overflow-hidden">
      <div className="w-full max-w-lg bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl border border-[#debfbf] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-4 py-3 bg-[#fff0ef] border-b border-[#ffe9e8] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#7a1521] text-[22px]">photo_camera</span>
            <div>
              <h3 className="text-sm font-bold text-[#241919]">Capture Proof of Work</h3>
              <p className="text-[11px] text-[#574141] font-semibold">{ticketId} • Field Audit Evidence</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#574141] hover:bg-[#ffe9e8]"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 overflow-y-auto">
          {/* Camera Trigger Area */}
          <div>
            <label className="text-xs font-bold text-[#241919] block mb-1.5">
              Select or Take Field Evidence Photo
            </label>
            <div className="grid grid-cols-2 gap-2">
              {demoPhotos.map((photo, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedPhoto(photo.url)}
                  className={`relative rounded-xl overflow-hidden border-2 cursor-pointer transition-all aspect-video bg-slate-100 ${
                    selectedPhoto === photo.url
                      ? 'border-[#7a1521] ring-2 ring-[#7a1521]/30 scale-[1.02]'
                      : 'border-slate-200 opacity-80 hover:opacity-100'
                  }`}
                >
                  <img src={photo.url} alt="Proof" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent p-2 flex items-end">
                    <span className="text-[10px] text-white font-medium leading-tight line-clamp-2">
                      {photo.label}
                    </span>
                  </div>
                  {selectedPhoto === photo.url && (
                    <span className="absolute top-2 right-2 w-6 h-6 rounded-full bg-[#7a1521] text-white flex items-center justify-center text-xs shadow-md">
                      ✓
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Quick Tag Insertion Chips */}
          <div>
            <label className="text-xs font-bold text-[#241919] block mb-1.5">
              Technician Action Chips
            </label>
            <div className="flex flex-wrap gap-1.5">
              {quickTags.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border transition-colors ${
                      isSelected
                        ? 'bg-[#7a1521] text-white border-[#7a1521]'
                        : 'bg-[#fff0ef] text-[#574141] border-[#debfbf] hover:bg-[#ffe9e8]'
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Remarks Textarea */}
          <div>
            <label className="text-xs font-bold text-[#241919] block mb-1">
              Field Technician Remarks
            </label>
            <textarea
              rows={3}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Describe work completed (e.g. Cleared drain line blockage, washed evaporator coils, checked pressure)..."
              className="w-full text-xs rounded-xl border-[#debfbf] focus:border-[#7a1521] focus:ring-1 focus:ring-[#7a1521] p-2.5 bg-[#fff8f7]"
            />
          </div>

          <div className="p-2.5 rounded-lg bg-[#fff0ef] border border-[#debfbf]/40 flex items-center gap-2 text-[11px] text-[#574141]">
            <span className="material-symbols-outlined text-[16px] text-[#7a1521]">verified_user</span>
            <span>GPS location & timestamp will be attached to ISO compliance audit record.</span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-3 bg-white border-t border-slate-200 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isUploading}
            className="px-5 py-2 rounded-xl bg-[#7a1521] hover:bg-[#58000f] text-white text-xs font-bold shadow-md flex items-center gap-1.5 transition-all active:scale-95 disabled:opacity-50"
          >
            {isUploading ? (
              <>
                <span className="material-symbols-outlined text-[16px] animate-spin">sync</span>
                <span>Uploading & Stamping...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[16px]">check_circle</span>
                <span>Attach & Confirm Proof</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
