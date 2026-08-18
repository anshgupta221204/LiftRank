import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const GymDetails = () => {
  const { id } = useParams();
  const { user, loadUser } = useAuth();
  const navigate = useNavigate();

  const [gym, setGym] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchGymData = async () => {
    setLoading(true);
    setError('');
    try {
      const [gymRes, membersRes] = await Promise.all([
        api.get(`/gyms/${id}`),
        api.get(`/gyms/${id}/members`)
      ]);
      setGym(gymRes.data);
      setMembers(membersRes.data);
    } catch (err) {
      console.error('Error fetching gym details:', err);
      setError(err.response?.data?.message || 'Could not retrieve gym details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGymData();
  }, [id]);

  const handleJoin = async () => {
    setActionLoading(true);
    setError('');
    try {
      await api.post(`/gyms/${id}/join`);
      await loadUser(); // Refresh user session in context
      await fetchGymData(); // Reload gym member roster
    } catch (err) {
      setError(err.response?.data?.message || 'Error joining gym.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleLeave = async () => {
    const isOwner = gym?.owner?._id === user?.id || gym?.owner === user?.id;
    let message = 'Are you sure you want to leave this gym?';
    
    if (isOwner) {
      if (gym?.memberCount === 1) {
        message = 'You are the owner and only member. Leaving this gym will delete it from LiftRank. Do you want to proceed?';
      } else {
        message = 'You are the owner. Leaving this gym will automatically transfer ownership to the next member. Do you want to proceed?';
      }
    }

    if (!window.confirm(message)) {
      return;
    }

    setActionLoading(true);
    setError('');
    try {
      await api.post(`/gyms/${id}/leave`);
      await loadUser(); // Refresh user session in context
      navigate('/gyms');
    } catch (err) {
      setError(err.response?.data?.message || 'Error leaving gym.');
      setActionLoading(false);
    }
  };

  const userGymId = typeof user?.gym === 'object' ? user?.gym?._id : user?.gym;
  const isUserMember = userGymId ? String(userGymId) === String(id) : false;
  const hasGym = !!userGymId;

  return (
    <div className="min-h-screen bg-[#0b111e] text-slate-100 flex flex-col">
      {/* Navigation Header */}
      <header className="bg-[#111a2e]/60 backdrop-blur-md border-b border-[#334155]/40 px-6 py-6 sticky top-0 z-10">
        <div className="max-w-4xl w-full mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link to="/gyms" className="text-slate-400 hover:text-white transition-colors text-xs font-semibold flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              All Gyms
            </Link>
          </div>
          <Link to="/dashboard" className="text-xs font-semibold bg-[#1e293b]/60 border border-[#334155]/60 text-slate-300 hover:bg-[#1e293b] hover:text-white px-4 py-2 rounded-xl transition-all duration-200">
            Dashboard
          </Link>
        </div>
      </header>

      {/* Main Page Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="w-10 h-10 border-4 border-brand-500/20 border-t-brand-600 rounded-full animate-spin"></div>
            <p className="mt-4 text-slate-400 text-xs">Loading gym profile...</p>
          </div>
        ) : error && !gym ? (
          <div className="text-center py-16 bg-rose-950/20 border border-rose-500/20 rounded-2xl p-8 max-w-md mx-auto">
            <h3 className="text-base font-bold text-white mb-2">Error Loading Gym</h3>
            <p className="text-rose-300 text-xs mb-5">{error}</p>
            <Link to="/gyms" className="inline-block px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 text-slate-200 hover:bg-slate-700 transition-colors">
              Return to Directory
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            
            {/* Gym Summary Details Card */}
            <div className="bg-[#1e293b]/20 border border-[#334155]/60 rounded-3xl p-6 md:p-8 backdrop-blur-md">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-3xl font-extrabold text-white tracking-tight">{gym.name}</h2>
                  
                  <div className="flex items-center gap-1.5 text-slate-400 text-xs mt-2">
                    <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>{gym.location}</span>
                  </div>
                </div>

                {/* Membership Action Button */}
                <div>
                  {isUserMember ? (
                    <button
                      onClick={handleLeave}
                      disabled={actionLoading}
                      className="w-full md:w-auto px-6 py-3 rounded-xl text-xs font-bold bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {actionLoading && <div className="w-3.5 h-3.5 border-2 border-rose-400/20 border-t-rose-400 rounded-full animate-spin"></div>}
                      Leave Gym
                    </button>
                  ) : (
                    <button
                      onClick={handleJoin}
                      disabled={actionLoading || hasGym}
                      title={hasGym ? 'Please leave your current gym first' : 'Join Gym'}
                      className="w-full md:w-auto px-6 py-3 rounded-xl text-xs font-bold bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-500 hover:to-brand-600 text-white transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:from-slate-800 disabled:to-slate-800 disabled:border-[#334155]"
                    >
                      {actionLoading && <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>}
                      Join Gym
                    </button>
                  )}
                </div>
              </div>

              {hasGym && !isUserMember && (
                <div className="bg-amber-950/20 border border-amber-500/20 text-amber-300 text-xs rounded-xl p-3.5 mb-6 flex items-start gap-2.5">
                  <svg className="w-5 h-5 flex-shrink-0 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div>
                    <span className="font-semibold block">Active Membership Conflict</span>
                    <span className="text-[10px] text-amber-400/90 mt-0.5 block">
                      You are already associated with another gym. You must leave your current gym in order to join this one.
                    </span>
                  </div>
                </div>
              )}

              {error && (
                <div className="bg-rose-950/20 border border-rose-500/20 text-rose-300 text-xs rounded-xl p-3.5 mb-6">
                  {error}
                </div>
              )}

              <div className="border-t border-[#334155]/40 pt-6">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Description</h4>
                <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                  {gym.description || 'No description provided for this gym.'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-[#334155]/40 mt-6 pt-6 text-slate-400 text-xs">
                <div>
                  Owner: <span className="font-semibold text-white">{gym.owner?.name || 'Unknown'}</span>
                </div>
                <div>
                  Member Count: <span className="font-semibold text-white">{gym.memberCount}</span>
                </div>
              </div>
            </div>

            {/* Members Roster Card */}
            <div className="bg-[#1e293b]/20 border border-[#334155]/60 rounded-3xl p-6 backdrop-blur-md">
              <h3 className="text-lg font-bold text-white mb-4">Gym Members ({members.length})</h3>
              
              {members.length === 0 ? (
                <p className="text-slate-500 text-xs py-4 text-center">No members found in this gym.</p>
              ) : (
                <div className="divide-y divide-[#334155]/30">
                  {members.map((member) => (
                    <div key={member._id} className="py-3 flex items-center justify-between text-xs sm:text-sm">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center font-bold text-xs uppercase">
                          {member.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-200">{member.name}</p>
                          <p className="text-[10px] text-slate-400 font-mono sm:hidden">{member.email}</p>
                        </div>
                      </div>
                      <span className="text-xs text-slate-400 font-mono hidden sm:inline">
                        {member.email}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}
      </main>
    </div>
  );
};

export default GymDetails;
