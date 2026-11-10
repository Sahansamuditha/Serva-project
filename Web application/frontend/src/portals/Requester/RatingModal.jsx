import React, { useState } from 'react';
import { Star, X, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function RatingModal({ isOpen, onClose, ticket, onSubmit }) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen || !ticket) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(ticket.id, rating, feedback);
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        onClose();
      }, 1500);
    } catch (err) {
      alert('Failed to submit rating');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-modal w-full max-w-md overflow-hidden border border-[#e2e8f0]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#e2e8f0] bg-[#fff8f7]">
          <div>
            <h3 className="font-bold text-lg text-[#241919]">Rate & Confirm Service</h3>
            <p className="text-xs text-[#574141]">Ticket #{ticket.id} - {ticket.title}</p>
          </div>
          <button 
            onClick={onClose}
            className="text-[#8a7170] hover:text-[#241919] p-1 rounded-lg hover:bg-[#ffe9e8]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-bold text-[#241919]">Thank You for Your Feedback!</h4>
            <p className="text-xs text-[#574141]">The permanent ITUM maintenance ledger has been updated.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            <div>
              <label className="block text-xs font-bold text-[#574141] uppercase tracking-wider mb-2">
                Overall Technician Performance
              </label>
              <div className="flex items-center justify-center gap-2 py-3 bg-[#f8fafc] rounded-xl border border-[#e2e8f0]">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 text-2xl transition-transform hover:scale-110"
                  >
                    <Star
                      className={`w-7 h-7 ${
                        (hoverRating || rating) >= star
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-slate-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#574141] uppercase tracking-wider mb-2">
                Feedback & Notes (Optional)
              </label>
              <textarea
                rows={3}
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Was the problem resolved satisfactorily? Any remarks regarding technician conduct or cleanliness?"
                className="w-full px-3.5 py-2.5 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl text-sm input-focus"
              ></textarea>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-semibold text-[#574141] hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 text-sm font-semibold bg-[#7a1521] text-white hover:bg-[#58000f] rounded-lg shadow-sm transition-all flex items-center gap-2"
              >
                {loading ? 'Submitting...' : 'Confirm & Submit Rating'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
