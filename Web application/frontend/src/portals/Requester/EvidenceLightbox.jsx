import React from 'react';
import { X, Download } from 'lucide-react';

export default function EvidenceLightbox({ isOpen, onClose, image }) {
  if (!isOpen || !image) return null;

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-md">
      <div className="relative max-w-4xl w-full bg-[#18181b] rounded-2xl overflow-hidden border border-zinc-700 shadow-2xl text-white">
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
          <div>
            <h3 className="font-semibold text-sm text-zinc-200">{image.name}</h3>
            <p className="text-xs text-zinc-400">{image.size || 'Diagnostic Log'}</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => window.open(image.url || image.preview, '_blank')}
              className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
              title="Download/Open original"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="p-4 flex items-center justify-center min-h-[400px] bg-zinc-950">
          <img
            src={image.url || image.preview}
            alt={image.name}
            className="max-h-[70vh] max-w-full object-contain rounded-lg shadow-md"
            onError={(e) => {
              // Fallback preview
              e.target.onerror = null;
              e.target.src = 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1000&q=80';
            }}
          />
        </div>
      </div>
    </div>
  );
}
