import Link from 'next/link';
import SectionHeader from '@/components/SectionHeader';
import SubmitEventModal from '@/components/events/SubmitEventModal';
import { createClient } from '@/utils/supabase/server';

export const revalidate = 0;

export default async function EventsPage({ params: { lang } }: { params: { lang: string } }) {
  const supabase = createClient();
  
  // Fetch upcoming events from the unified posts table
  const today = new Date();
  const { data: events } = await supabase
    .from('posts')
    .select('*')
    .eq('lang', lang)
    .eq('section', 'events')
    .eq('is_published', true)
    .gte('event_date', today.toISOString())
    .order('event_date', { ascending: true });

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="max-w-7xl mx-auto px-4 py-16">
        <header className="mb-20 text-center">
          <SectionHeader title="Global AI Summit" lang={lang} />
          <p className="text-2xl font-black italic text-[#ef4444] leading-none mt-6 uppercase tracking-tighter">
            SYNC YOUR CALENDAR WITH THE FUTURE.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {(events || []).length > 0 ? events?.map((event) => (
            <div key={event.id} className="group bg-white border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all flex flex-col h-full">
              {/* Date Header */}
              <div className="bg-black text-white p-6 border-b-4 border-black flex justify-between items-center group-hover:bg-[#ef4444] transition-colors">
                <div className="flex flex-col">
                  <span className="text-3xl font-black leading-none">{new Date(event.event_date).getDate()}</span>
                  <span className="text-xs font-black uppercase tracking-widest">{new Date(event.event_date).toLocaleString('default', { month: 'long' })}</span>
                </div>
                <div className="text-xs font-black uppercase border-2 border-white px-2 py-1">
                  {new Date(event.event_date).getFullYear()}
                </div>
              </div>

              {/* Content */}
              <div className="p-8 flex-grow flex flex-col">
                <h2 className="text-3xl font-black tracking-tighter leading-none mb-6 group-hover:text-[#ef4444] uppercase">
                  <Link href={`/${lang}/events/${event.slug}`}>{event.title}</Link>
                </h2>
                
                <div className="mt-auto space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 border-2 border-black flex items-center justify-center bg-slate-100">
                      <span className="text-[10px]">📍</span>
                    </div>
                    <span className="font-black uppercase text-sm">{event.location}</span>
                  </div>
                  
                  <div className="flex gap-2">
                    <Link 
                      href={`/${lang}/events/${event.slug}`}
                      className="flex-1 text-center bg-white text-black py-4 border-4 border-black font-black uppercase text-xs hover:bg-black hover:text-white transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none"
                    >
                      Details
                    </Link>
                    <Link 
                      href={event.registration_link || '#'} 
                      target="_blank"
                      className="flex-1 text-center bg-[#ef4444] text-white py-4 border-4 border-black font-black uppercase text-xs hover:bg-black hover:text-white transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none"
                    >
                      Tickets →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )) : (
            <div className="col-span-full border-8 border-black bg-slate-100 p-32 text-center">
              <p className="text-5xl font-black text-black uppercase italic tracking-tighter">THE CALENDAR IS EMPTY</p>
              <p className="text-xl font-bold text-slate-500 mt-4 uppercase">CHECK BACK SOON FOR THE NEXT WAVE OF INTELLIGENCE.</p>
            </div>
          )}
        </div>

        {/* Community Call to Action */}
        <div className="mt-24 bg-black p-12 border-4 border-black text-white text-center shadow-[16px_16px_0px_0px_rgba(239,68,68,1)]">
          <h2 className="text-4xl font-black uppercase italic tracking-tighter mb-4">Hosting an Event?</h2>
          <p className="text-xl font-bold mb-8 text-slate-400">Put your summit on the map and reach 500k+ AI professionals globally.</p>
          <SubmitEventModal lang={lang} />
        </div>
      </main>
    </div>
  );
}
