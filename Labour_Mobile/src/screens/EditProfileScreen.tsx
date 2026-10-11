import React, { useState } from 'react';
import { LaborerProfile } from '../types';

interface EditProfileScreenProps {
  profile: LaborerProfile;
  onSaveProfile: (updated: Partial<LaborerProfile>) => Promise<void> | void;
  onBack: () => void;
  onOpenAvatarPicker: () => void;
}

export const EditProfileScreen: React.FC<EditProfileScreenProps> = ({
  profile,
  onSaveProfile,
  onBack,
  onOpenAvatarPicker,
}) => {
  const [name, setName] = useState(profile.name);
  const [employeeId, setEmployeeId] = useState(profile.employeeId);
  const [workshopBase, setWorkshopBase] = useState(profile.workshopBase);
  const [title, setTitle] = useState(profile.title);
  const [division, setDivision] = useState(profile.division);
  const [shift, setShift] = useState(profile.shift);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Form Validation
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!name.trim() || name.trim().length < 3) {
      newErrors.name = 'Full name must be at least 3 characters.';
    }
    if (!employeeId.trim() || !employeeId.trim().startsWith('EMP-')) {
      newErrors.employeeId = 'Employee ID must start with "EMP-" (e.g. EMP-T8402).';
    }
    if (!workshopBase.trim()) {
      newErrors.workshopBase = 'Assigned Bay / Zone is required.';
    }
    if (!title.trim()) {
      newErrors.title = 'Designation is required.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSaving(true);
    setSaveSuccess(false);

    try {
      // Simulate API server call
      await new Promise((resolve) => setTimeout(resolve, 600));

      await onSaveProfile({
        name: name.trim(),
        employeeId: employeeId.trim(),
        workshopBase: workshopBase.trim(),
        title: title.trim(),
        division: division.trim(),
        shift: shift.trim(),
      });

      setSaveSuccess(true);
      setTimeout(() => {
        onBack();
      }, 1000);
    } catch (err) {
      console.error('Failed to update profile:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 pb-24 max-w-md mx-auto animate-in fade-in duration-150">
      {/* Top Header / Breadcrumb navigation */}
      <div className="flex items-center justify-between bg-white rounded-2xl p-3 shadow-xs border border-[#debfbf]/50">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#fff0ef] hover:bg-[#ffe9e8] text-[#7a1521] text-xs font-bold transition-all active:scale-95"
        >
          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
          <span>Back</span>
        </button>
        <div className="flex flex-col text-right">
          <span className="text-xs font-bold text-[#241919]">Officer Credentials</span>
          <span className="text-[10px] text-[#574141]">ITUM Operations Registry</span>
        </div>
      </div>

      {/* Success notification banner */}
      {saveSuccess && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2.5 text-emerald-800 animate-in fade-in slide-in-from-top-1">
          <span className="material-symbols-outlined text-[20px] text-emerald-600">check_circle</span>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-bold">Profile Updated Successfully!</span>
            <span className="text-[11px] text-emerald-700">Changes synchronized to campus gateway.</span>
          </div>
        </div>
      )}

      {/* Profile Avatar Card with Camera Badge */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#debfbf]/40 flex flex-col items-center text-center relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-16 bg-gradient-to-r from-[#7a1521]/15 via-[#ffe9e8] to-[#7a1521]/15" />

        <div className="relative mt-2">
          <div className="w-20 h-20 rounded-full overflow-hidden shadow-md ring-4 ring-white bg-[#f9e3e2] relative">
            <img
              src={profile.avatarUrl}
              alt={profile.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Interactive Camera Badge Button */}
          <button
            type="button"
            onClick={onOpenAvatarPicker}
            aria-label="Change profile photo"
            title="Click to change photo"
            className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-[#7a1521] hover:bg-[#58000f] text-white flex items-center justify-center shadow-md ring-2 ring-white active:scale-90 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[14px]">photo_camera</span>
          </button>
        </div>

        <h2 className="text-base font-bold text-[#241919] mt-2.5">{name}</h2>
        <p className="text-xs font-bold text-[#7a1521]">{title}</p>
        <p className="text-[11px] text-[#574141] mt-0.5">{employeeId} • {workshopBase}</p>

        <button
          type="button"
          onClick={onOpenAvatarPicker}
          className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#fff0ef] hover:bg-[#ffe9e8] text-[#7a1521] text-[11px] font-bold border border-[#ffe9e8] transition-colors"
        >
          <span className="material-symbols-outlined text-[14px]">edit</span>
          <span>Change Photo Avatar</span>
        </button>
      </div>

      {/* Edit Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-4 shadow-sm border border-[#debfbf]/40 flex flex-col gap-3.5">
        <div className="flex items-center gap-2 pb-2 border-b border-[#ffe9e8]">
          <span className="material-symbols-outlined text-[#7a1521] text-[20px]">badge</span>
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#7a1521]">
            Official Officer Details
          </h3>
        </div>

        {/* 1. Full Name */}
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-bold uppercase tracking-wider text-[#574141]">
            Officer Full Name <span className="text-[#ba1a1a]">*</span>
          </label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-[#8a7170] text-[18px]">
              person
            </span>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
              }}
              placeholder="e.g. Kasun Perera"
              className={`w-full pl-9 pr-3 py-2 text-xs font-semibold rounded-xl border bg-[#fff8f7] text-[#241919] focus:outline-none focus:ring-1 transition-all ${
                errors.name
                  ? 'border-[#ba1a1a] focus:ring-[#ba1a1a]'
                  : 'border-[#debfbf] focus:ring-[#7a1521] focus:border-[#7a1521]'
              }`}
            />
          </div>
          {errors.name && (
            <span className="text-[10px] font-bold text-[#ba1a1a]">{errors.name}</span>
          )}
        </div>

        {/* 2. Employee ID */}
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-bold uppercase tracking-wider text-[#574141]">
            Employee Badge ID <span className="text-[#ba1a1a]">*</span>
          </label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-[#8a7170] text-[18px]">
              badge
            </span>
            <input
              type="text"
              value={employeeId}
              onChange={(e) => {
                setEmployeeId(e.target.value);
                if (errors.employeeId) setErrors((prev) => ({ ...prev, employeeId: '' }));
              }}
              placeholder="e.g. EMP-T8402"
              className={`w-full pl-9 pr-3 py-2 text-xs font-semibold rounded-xl border bg-[#fff8f7] text-[#241919] focus:outline-none focus:ring-1 transition-all ${
                errors.employeeId
                  ? 'border-[#ba1a1a] focus:ring-[#ba1a1a]'
                  : 'border-[#debfbf] focus:ring-[#7a1521] focus:border-[#7a1521]'
              }`}
            />
          </div>
          {errors.employeeId && (
            <span className="text-[10px] font-bold text-[#ba1a1a]">{errors.employeeId}</span>
          )}
        </div>

        {/* 3. Assigned Workshop Bay / Zone */}
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-bold uppercase tracking-wider text-[#574141]">
            Assigned Workshop Bay / Zone <span className="text-[#ba1a1a]">*</span>
          </label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-[#8a7170] text-[18px]">
              home_repair_service
            </span>
            <input
              type="text"
              value={workshopBase}
              onChange={(e) => {
                setWorkshopBase(e.target.value);
                if (errors.workshopBase) setErrors((prev) => ({ ...prev, workshopBase: '' }));
              }}
              placeholder="e.g. Workshop Bay 3"
              className={`w-full pl-9 pr-3 py-2 text-xs font-semibold rounded-xl border bg-[#fff8f7] text-[#241919] focus:outline-none focus:ring-1 transition-all ${
                errors.workshopBase
                  ? 'border-[#ba1a1a] focus:ring-[#ba1a1a]'
                  : 'border-[#debfbf] focus:ring-[#7a1521] focus:border-[#7a1521]'
              }`}
            />
          </div>
          {errors.workshopBase && (
            <span className="text-[10px] font-bold text-[#ba1a1a]">{errors.workshopBase}</span>
          )}
        </div>

        {/* 4. Designation / Title */}
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-bold uppercase tracking-wider text-[#574141]">
            Official Title / Role
          </label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-[#8a7170] text-[18px]">
              engineering
            </span>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Senior HVAC & Electrical Technician"
              className="w-full pl-9 pr-3 py-2 text-xs font-semibold rounded-xl border border-[#debfbf] bg-[#fff8f7] text-[#241919] focus:outline-none focus:ring-1 focus:ring-[#7a1521] focus:border-[#7a1521]"
            />
          </div>
        </div>

        {/* 5. Division */}
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-bold uppercase tracking-wider text-[#574141]">
            Assigned Division
          </label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-[#8a7170] text-[18px]">
              domain
            </span>
            <input
              type="text"
              value={division}
              onChange={(e) => setDivision(e.target.value)}
              placeholder="e.g. Central Maintenance Division"
              className="w-full pl-9 pr-3 py-2 text-xs font-semibold rounded-xl border border-[#debfbf] bg-[#fff8f7] text-[#241919] focus:outline-none focus:ring-1 focus:ring-[#7a1521] focus:border-[#7a1521]"
            />
          </div>
        </div>

        {/* 6. Shift Timing */}
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-bold uppercase tracking-wider text-[#574141]">
            Assigned Duty Shift
          </label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-[#8a7170] text-[18px]">
              schedule
            </span>
            <input
              type="text"
              value={shift}
              onChange={(e) => setShift(e.target.value)}
              placeholder="e.g. Shift 1 (08:00 AM – 05:00 PM)"
              className="w-full pl-9 pr-3 py-2 text-xs font-semibold rounded-xl border border-[#debfbf] bg-[#fff8f7] text-[#241919] focus:outline-none focus:ring-1 focus:ring-[#7a1521] focus:border-[#7a1521]"
            />
          </div>
        </div>

        {/* Save Button */}
        <div className="pt-2 flex items-center gap-2">
          <button
            type="button"
            onClick={onBack}
            className="px-4 py-2.5 rounded-xl border border-[#debfbf] text-[#574141] hover:bg-[#fff0ef] text-xs font-bold transition-all"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isSaving}
            className="flex-1 py-2.5 rounded-xl bg-[#7a1521] hover:bg-[#58000f] text-white text-xs font-bold shadow-md active:scale-95 transition-all flex items-center justify-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px]">
              {isSaving ? 'sync' : 'save'}
            </span>
            <span>{isSaving ? 'Saving Updates to Server...' : 'Save Profile Changes'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
