import React, { useState, useEffect } from 'react';
import { collabService } from '../services/api';
import { 
  Users, Calendar, Video, Plus, CheckCircle2, Clock, 
  MessageSquare, User, Building, ArrowRight 
} from 'lucide-react';

const MentorshipsPage = () => {
  const [mentorships, setMentorships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [newReq, setNewReq] = useState({ mentor_id: 3, topic: 'Strategic Guidance: Transitioning to Health Informatics Specialist', notes: '' });

  const fetchMentorships = async () => {
    try {
      const res = await collabService.getMentorships();
      setMentorships(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMentorships();
  }, []);

  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    try {
      await collabService.requestMentorship(newReq);
      setShowRequestModal(false);
      fetchMentorships();
    } catch (err) {
      console.error(err);
    }
  };

  const mentorsList = [
    { id: 3, name: 'Dr. Rajesh Verma', role: 'Professor & Head of AyurInformatics', org: 'All India Institute of Ayurveda' },
    { id: 4, name: 'Prof. Anita Deshmukh', role: 'Professor of AI & NLP', org: 'Delhi Technological University' },
    { id: 2, name: 'Dabur Talent Acquisition Lead', role: 'Industry Mentor', org: 'Dabur AyurTech India' }
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white font-display">Faculty & Industry Mentorship</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Connect with seasoned academicians and industry directors for 1-on-1 career steering
          </p>
        </div>
        <button
          onClick={() => setShowRequestModal(true)}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-ayush-500 to-emerald-600 text-slate-950 font-extrabold text-xs shadow-lg shadow-emerald-500/20 transition flex items-center space-x-1"
        >
          <Plus className="w-4 h-4" />
          <span>Request Session</span>
        </button>
      </div>

      {/* Mentorship Sessions List */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400">Loading mentorship sessions...</div>
      ) : mentorships.length === 0 ? (
        <div className="p-12 text-center glass-panel rounded-2xl border border-slate-800">
          <Users className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-white">No mentorship sessions booked yet</h3>
          <p className="text-xs text-slate-400 mt-1 mb-4">Request guidance from AIIA professors or industry leads.</p>
          <button
            onClick={() => setShowRequestModal(true)}
            className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs"
          >
            Request 1-on-1 Guidance
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {mentorships.map((m) => (
            <div
              key={m.id}
              className="p-5 rounded-2xl glass-panel border border-slate-800 hover:border-emerald-500/30 transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                    Mentor: {m.mentor_name} ({m.mentor_role})
                  </span>
                  <h3 className="text-sm font-bold text-white mt-0.5">{m.topic}</h3>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold border self-start sm:self-auto ${
                  m.status === 'Accepted' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                }`}>
                  {m.status}
                </span>
              </div>

              <div className="pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-300">
                <div className="flex items-center space-x-4">
                  <span className="flex items-center space-x-1 text-slate-400">
                    <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{m.scheduled_time || 'Schedule pending'}</span>
                  </span>
                  {m.notes && (
                    <span className="text-slate-400 italic">"{m.notes}"</span>
                  )}
                </div>

                {m.meeting_link && m.status === 'Accepted' && (
                  <a
                    href={m.meeting_link}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3.5 py-1.5 rounded-xl bg-purple-500 hover:bg-purple-400 text-white font-bold text-xs flex items-center space-x-1.5 transition self-start sm:self-auto"
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>Join Google Meet</span>
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Request Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <form onSubmit={handleRequestSubmit} className="w-full max-w-md glass-panel p-6 rounded-2xl border border-slate-700 bg-slate-900 space-y-4">
            <h3 className="text-base font-bold text-white mb-2">Request 1-on-1 Mentorship</h3>
            
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Select Mentor</label>
              <select
                value={newReq.mentor_id}
                onChange={(e) => setNewReq({ ...newReq, mentor_id: parseInt(e.target.value) })}
                className="w-full glass-input rounded-xl px-3 py-2 text-xs font-semibold text-white bg-slate-900"
              >
                {mentorsList.map((mentor) => (
                  <option key={mentor.id} value={mentor.id}>
                    {mentor.name} — {mentor.org}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Discussion Topic / Objective</label>
              <input
                type="text"
                required
                value={newReq.topic}
                onChange={(e) => setNewReq({ ...newReq, topic: e.target.value })}
                placeholder="e.g. Research roadmap & Clinical trials transition"
                className="w-full glass-input rounded-xl px-3 py-2 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Additional Context / Notes</label>
              <textarea
                rows={3}
                value={newReq.notes}
                onChange={(e) => setNewReq({ ...newReq, notes: e.target.value })}
                placeholder="Share your background or specific questions..."
                className="w-full glass-input rounded-xl p-3 text-xs"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-3">
              <button
                type="button"
                onClick={() => setShowRequestModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs"
              >
                Send Request
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};

export default MentorshipsPage;
