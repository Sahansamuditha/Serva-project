import React, { useState, useRef } from 'react';

interface AvatarPickerModalProps {
  isOpen: boolean;
  currentAvatarUrl: string;
  userName: string;
  onClose: () => void;
  onSaveAvatar: (newUrl: string) => void;
}

export const AvatarPickerModal: React.FC<AvatarPickerModalProps> = ({
  isOpen,
  currentAvatarUrl,
  userName,
  onClose,
  onSaveAvatar,
}) => {
  const [selectedPhoto, setSelectedPhoto] = useState<string>(currentAvatarUrl);
  const [activeTab, setActiveTab] = useState<'presets' | 'upload' | 'camera'>('presets');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Curated realistic technician & engineering avatars
  const presetAvatars = [
    {
      id: 'default',
      name: 'Default Official Portrait',
      url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCEWRH06Wr_jVDeWhraMa89yVAS5PuqahaXycJqIG_rseR7pac7Ghv0dCrPxdB2aNQtlyCn1B0XqKwmp--g1zTs_oSXKbL77R9oKWXFUeT8WJHFfjezW-SFWAptCEwqlbveOQKJtXDNByX0TU0qsP_V5WmCVp4zwj8cHNE-zQOOuh7PyoQfJT7b8YoJpYMeppGIPAl8DUOYij_Rgo-WJgt8v-iiCmiJQ7P501yuJwwWeY662nY-4x5ObA',
    },
    {
      id: 'engineer_2',
      name: 'Field Vest & Hard Hat',
      url: 'https://images.unsplash.com/photo-1541888946425-d0fbb1861593?auto=format&fit=crop&w=400&q=80',
    },
    {
      id: 'engineer_3',
      name: 'HVAC Specialist Formal',
      url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    },
    {
      id: 'engineer_4',
      name: 'Electrical Workshop Uniform',
      url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    },
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setSelectedPhoto(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCameraSnap = () => {
    setIsCameraActive(true);
    setTimeout(() => {
      // Simulate snapshot
      setSelectedPhoto(presetAvatars[1].url);
      setIsCameraActive(false);
    }, 600);
  };

  const handleConfirm = () => {
    setIsSaving(true);
    setTimeout(() => {
      onSaveAvatar(selectedPhoto);
      setIsSaving(false);
      onClose();
    }, 400);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-[#debfbf] overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-4 py-3 bg-[#fff0ef] border-b border-[#ffe9e8] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#7a1521] text-white flex items-center justify-center shadow-xs">
              <span className="material-symbols-outlined text-[18px]">photo_camera</span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#241919]">Update Profile Picture</h3>
              <p className="text-[11px] text-[#574141] font-semibold">{userName} • EMP-T8402</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#574141] hover:bg-[#ffe9e8] transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Live Preview Avatar */}
        <div className="p-4 bg-gradient-to-b from-[#fff0ef]/60 to-white flex flex-col items-center justify-center border-b border-[#ffe9e8]">
          <div className="relative">
            <div className="w-24 h-24 rounded-full overflow-hidden ring-4 ring-[#7a1521]/20 shadow-md bg-[#f9e3e2]">
              <img
                src={selectedPhoto}
                alt="Avatar preview"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-[#7a1521] text-white flex items-center justify-center shadow-md ring-2 ring-white">
              <span className="material-symbols-outlined text-[14px]">verified</span>
            </div>
          </div>
          <span className="text-xs font-bold text-[#241919] mt-2">Active Photo Preview</span>
          <span className="text-[10px] text-[#8a7170]">Synced with Central Campus Gateway</span>
        </div>

        {/* Tab Controls: Presets / Upload / Camera */}
        <div className="flex border-b border-[#ffe9e8] bg-[#fff8f7] text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('presets')}
            className={`flex-1 py-2.5 text-center border-b-2 transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === 'presets'
                ? 'border-[#7a1521] text-[#7a1521] bg-white font-bold'
                : 'border-transparent text-[#574141] hover:text-[#241919]'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">collections</span>
            <span>Presets</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`flex-1 py-2.5 text-center border-b-2 transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === 'upload'
                ? 'border-[#7a1521] text-[#7a1521] bg-white font-bold'
                : 'border-transparent text-[#574141] hover:text-[#241919]'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">upload_file</span>
            <span>Gallery</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('camera')}
            className={`flex-1 py-2.5 text-center border-b-2 transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === 'camera'
                ? 'border-[#7a1521] text-[#7a1521] bg-white font-bold'
                : 'border-transparent text-[#574141] hover:text-[#241919]'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">photo_camera</span>
            <span>Camera</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-4 flex-1 overflow-y-auto">
          {activeTab === 'presets' && (
            <div className="flex flex-col gap-2">
              <span className="text-[11px] font-bold text-[#574141] uppercase tracking-wider">
                Select Technician Preset:
              </span>
              <div className="grid grid-cols-2 gap-2.5">
                {presetAvatars.map((preset) => {
                  const isSelected = selectedPhoto === preset.url;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => setSelectedPhoto(preset.url)}
                      className={`p-2 rounded-xl border flex flex-col items-center gap-1.5 text-center transition-all ${
                        isSelected
                          ? 'border-[#7a1521] bg-[#fff0ef] ring-2 ring-[#7a1521]/30 shadow-xs'
                          : 'border-[#debfbf]/60 hover:border-[#7a1521]/40 bg-white'
                      }`}
                    >
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-[#f9e3e2] ring-1 ring-[#ffe9e8]">
                        <img
                          src={preset.url}
                          alt={preset.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className="text-[10px] font-bold text-[#241919] leading-tight line-clamp-1">
                        {preset.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'upload' && (
            <div className="flex flex-col items-center justify-center py-4 gap-3 text-center">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <div className="w-14 h-14 rounded-2xl bg-[#fff0ef] border-2 border-dashed border-[#7a1521]/40 flex items-center justify-center text-[#7a1521]">
                <span className="material-symbols-outlined text-[28px]">add_photo_alternate</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-[#241919]">Select from Phone Storage</span>
                <span className="text-[11px] text-[#574141] mt-0.5">JPG, PNG or WEBP up to 5MB</span>
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 rounded-xl bg-[#7a1521] text-white text-xs font-bold shadow-sm active:scale-95 transition-all flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">folder_open</span>
                <span>Browse Files</span>
              </button>
            </div>
          )}

          {activeTab === 'camera' && (
            <div className="flex flex-col items-center justify-center py-4 gap-3 text-center">
              <div className="w-16 h-16 rounded-full bg-[#ffdad9] text-[#7a1521] flex items-center justify-center shadow-inner">
                <span className="material-symbols-outlined text-[32px]">
                  {isCameraActive ? 'hourglass_top' : 'photo_camera'}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-[#241919]">
                  {isCameraActive ? 'Capturing Photo...' : 'Capture with Front Camera'}
                </span>
                <span className="text-[11px] text-[#574141] mt-0.5">
                  Point camera at well-lit environment
                </span>
              </div>
              <button
                type="button"
                onClick={handleCameraSnap}
                disabled={isCameraActive}
                className="px-4 py-2 rounded-xl bg-[#7a1521] text-white text-xs font-bold shadow-sm active:scale-95 transition-all flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">camera</span>
                <span>{isCameraActive ? 'Processing...' : 'Take Snap'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Modal Action Buttons */}
        <div className="p-3 bg-[#fff0ef] border-t border-[#ffe9e8] flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg border border-[#debfbf] text-[#574141] hover:bg-white text-xs font-semibold transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isSaving}
            className="px-4 py-1.5 rounded-lg bg-[#7a1521] hover:bg-[#58000f] text-white text-xs font-bold shadow-sm active:scale-95 transition-all flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[15px]">check</span>
            <span>{isSaving ? 'Applying...' : 'Apply Photo'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
