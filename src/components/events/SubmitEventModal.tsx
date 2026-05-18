'use client';

import { useState } from 'react';
import { X, Calendar, MapPin, Link as LinkIcon, Send, CheckCircle2 } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

export default function SubmitEventModal({ lang }: { lang: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClient();

  // Form State
  const [title, setTitle] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [location, setLocation] = useState('');
  const [registrationLink, setRegistrationLink] = useState('');

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const slug = `${generateSlug(title)}-${Math.random().toString(36).substring(2, 7)}`;
      
      const { error } = await supabase
        .from('posts')
        .insert([{
          title,
          slug,
          content: `User submitted event at ${location}`,
          section: 'events',
          is_published: false,
          lang: lang,
          event_date: eventDate || null,
          location: location || null,
          registration_link: registrationLink || null,
          author_name: 'Community'
        }]);

      if (error) throw error;
      
      setIsSubmitted(true);
    } catch (error: any) {
      alert('Error submitting event: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="bg-[#ef4444] text-white px-12 py-5 font-black uppercase text-sm border-4 border-[#ef4444] hover:bg-white hover:text-black hover:border-white transition-all shadow-[8px_8px_0px_0px_rgba(255,255,255,0.2)] hover:shadow-none"
      >
        Submit Your Event
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-white border-4 border-black shadow-[20px_20px_0px_0px_rgba(239,68,68,1)] overflow-hidden">
        <div className="bg-black text-white p-6 flex justify-between items-center border-b-4 border-black">
          <h3 className="text-2xl font-black uppercase italic tracking-tighter">Event Submission</h3>
          <button onClick={() => setIsOpen(false)} className="hover:rotate-90 transition-transform p-1">
            <X size={24} />
          </button>
        </div>

        <div className="p-8">
          {isSubmitted ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 border-4 border-black mb-6">
                <CheckCircle2 size={40} className="text-green-600" />
              </div>
              <h4 className="text-3xl font-black uppercase italic mb-2">Success!</h4>
              <p className="font-bold text-slate-500 uppercase text-sm mb-8">Your event has been sent for verification.</p>
              <button 
                onClick={() => { setIsOpen(false); setIsSubmitted(false); }}
                className="w-full bg-black text-white py-4 font-black uppercase text-sm border-4 border-black hover:bg-[#ef4444] transition-colors"
              >
                Return to Events
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="block text-xs font-black uppercase tracking-widest text-slate-400">Event Title</label>
                <input 
                  required 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-4 border-4 border-black font-bold uppercase text-sm focus:bg-slate-50 outline-none" 
                  placeholder="e.g. GLOBAL AI SUMMIT 2026" 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-xs font-black uppercase tracking-widest text-slate-400">Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="date" 
                      required 
                      value={eventDate}
                      onChange={(e) => setEventDate(e.target.value)}
                      className="w-full p-4 pl-12 border-4 border-black font-bold uppercase text-sm focus:bg-slate-50 outline-none" 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-black uppercase tracking-widest text-slate-400">Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      required 
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full p-4 pl-12 border-4 border-black font-bold uppercase text-sm focus:bg-slate-50 outline-none" 
                      placeholder="LONDON, UK" 
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-black uppercase tracking-widest text-slate-400">Registration Link</label>
                <div className="relative">
                  <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="url" 
                    required 
                    value={registrationLink}
                    onChange={(e) => setRegistrationLink(e.target.value)}
                    className="w-full p-4 pl-12 border-4 border-black font-bold uppercase text-sm focus:bg-slate-50 outline-none" 
                    placeholder="https://..." 
                  />
                </div>
              </div>

              <button 
                disabled={isLoading}
                type="submit"
                className="w-full bg-[#ef4444] text-white py-5 font-black uppercase text-sm border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
              >
                {isLoading ? <span className="animate-pulse">Verifying...</span> : <><Send size={18} /> Deploy Submission</>}
              </button>
            </form>
          )}
        </div>
        
        <div className="bg-slate-50 border-t-4 border-black p-4 text-center">
          <p className="text-[10px] font-black uppercase text-slate-400 italic">Submissions are reviewed within 24 hours</p>
        </div>
      </div>
    </div>
  );
}
