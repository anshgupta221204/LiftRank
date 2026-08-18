import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { getRandomQuote } from '../utils/quotes';
import { getNextHinglishGreeting } from '../utils/hinglishGreetings';

const Dashboard = () => {
  const { user, logout, loadUser } = useAuth();
  const [sessionQuote] = useState(() => getRandomQuote());
  const [hinglishGreeting] = useState(() => getNextHinglishGreeting());
  
  // Dashboard states
  const [prs, setPrs] = useState([]);
  const [workoutsCount, setWorkoutsCount] = useState(0);
  const [exercisesCount, setExercisesCount] = useState(0);
  
  // Overall Gym Leaderboard preview
  const [gymRank, setGymRank] = useState('Unranked');
  const [gymLeaderPreview, setGymLeaderPreview] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [loadingGym, setLoadingGym] = useState(false);
  const [gymError, setGymError] = useState('');

  const gymId = user?.gym?._id || user?.gym;

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // 1. Fetch user's PRs
      const prsRes = await api.get('/workouts/prs');
      setPrs(prsRes.data || []);

      // 2. Fetch user's workouts count
      const workoutsRes = await api.get('/workouts');
      setWorkoutsCount(workoutsRes.data?.length || 0);

      // 3. Fetch total available exercises
      const exercisesRes = await api.get('/workouts/exercises');
      setExercisesCount(exercisesRes.data?.length || 0);
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchGymLeaderboard = async () => {
    if (!gymId) {
      setGymRank('Unranked');
      setGymLeaderPreview([]);
      return;
    }
    setLoadingGym(true);
    setGymError('');
    try {
      const res = await api.get(`/gyms/${gymId}/leaderboard/overall`);
      const list = res.data.leaderboard || [];
      setGymLeaderPreview(list.slice(0, 3)); // Top 3 preview
      
      // Find current user's rank
      const myId = user?.id || user?._id;
      const myEntry = list.find(item => item.user?.id === myId || item.user?._id === myId);
      if (myEntry) {
        setGymRank(`#${myEntry.rank}`);
      } else {
        setGymRank('Unranked');
      }
    } catch (err) {
      console.error('Error fetching gym standings preview:', err);
      setGymError('Could not load gym standings.');
    } finally {
      setLoadingGym(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    fetchGymLeaderboard();
  }, [gymId, user]);

  const handleLeaveGym = async () => {
    if (!window.confirm('Are you sure you want to leave your current gym membership? You will be removed from all standings.')) return;
    try {
      await api.post(`/gyms/${gymId}/leave`);
      // Update session context
      await loadUser();
    } catch (err) {
      console.error('Error leaving gym:', err);
      alert(err.response?.data?.message || 'Failed to leave gym.');
    }
  };

  return (
    <div className="min-h-screen bg-[#0b111e] text-slate-100 flex flex-col font-sans">
      {/* Navigation Header */}
      <nav className="bg-[#111a2e]/60 backdrop-blur-md border-b border-[#334155]/40 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-brand-500 flex items-center justify-center text-white font-extrabold shadow-md shadow-brand-500/10">
            LR
          </div>
          <span className="text-xl font-bold tracking-tight text-white">LiftRank</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-white">{user?.name}</p>
            <p className="text-[10px] text-slate-400 font-mono">{user?.email}</p>
          </div>
          
          <button
            onClick={logout}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white transition-all duration-300"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 space-y-8">
        
        {/* Dynamic Hinglish Gym Greeting & Motivation Hero */}
        <div className="bg-gradient-to-r from-[#111a2e] via-[#1e293b]/70 to-[#111a2e] border border-[#334155]/60 rounded-3xl p-6 md:p-8 backdrop-blur-md relative overflow-hidden shadow-xl shadow-black/20">
          <div className="absolute top-0 right-0 w-72 h-72 bg-brand-500/10 rounded-full blur-3xl -mr-24 -mt-24 pointer-events-none"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{hinglishGreeting.icon}</span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-brand-500/15 border border-brand-500/30 text-brand-400">
                  {hinglishGreeting.title} {user?.name ? `, ${user.name.split(' ')[0]}` : ''}
                </span>
              </div>
              
              <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight leading-tight">
                "{hinglishGreeting.text}"
              </h2>

              <p className="text-slate-400 text-xs font-medium flex items-center gap-2">
                <span className="text-brand-400 font-bold">Daily Quote:</span> "{sessionQuote.quote}" — <span className="italic">{sessionQuote.author}</span>
              </p>
            </div>
            
            <div className="flex-shrink-0 flex items-center gap-3">
              <Link
                to="/workouts/new"
                className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-500 hover:to-brand-600 text-white font-extrabold text-xs shadow-lg shadow-brand-600/20 hover:scale-[1.02] transition-all duration-300 flex items-center gap-2.5"
              >
                <span className="text-base">🏋️</span>
                <span>Start Workout</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Dashboard Main Grid Split */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column: Active Gym & Grid Quick Actions */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Active Gym Membership Card */}
            <div className="bg-[#1e293b]/20 border border-[#334155]/60 rounded-3xl p-6 backdrop-blur-md shadow-md">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Current Gym Hub</h3>
              
              {!gymId ? (
                <div className="space-y-4">
                  <div className="p-5 bg-[#0f172a]/60 border border-[#334155]/40 rounded-2xl text-center">
                    <span className="text-3xl block mb-2">🏋️</span>
                    <h4 className="text-sm font-bold text-white">No Gym Selected</h4>
                    <p className="text-xs text-slate-400 mt-1">
                      Join a gym community to view rankings and compete on leaderboards.
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Link
                      to="/gyms/new"
                      className="py-3 bg-[#1e293b]/80 border border-[#334155]/60 text-slate-300 hover:bg-[#1e293b] hover:text-white text-xs font-bold rounded-xl text-center transition-all"
                    >
                      Create Gym
                    </Link>
                    <Link
                      to="/gyms"
                      className="py-3 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold rounded-xl text-center transition-all shadow-md shadow-brand-600/10"
                    >
                      Join Gym
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 bg-[#0f172a]/60 border border-[#334155]/40 rounded-2xl">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-brand-400">Active Gym</span>
                    <h4 className="text-base font-bold text-white mt-1 truncate">
                      {user?.gym?.name || 'Your Associated Gym'}
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5 truncate flex items-center gap-1">
                      <span>📍</span> {user?.gym?.location || 'Fitness Hub'}
                    </p>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <Link
                      to={`/gyms/${user.gym._id || user.gym}`}
                      className="py-2.5 bg-[#1e293b]/80 border border-[#334155]/60 text-slate-300 hover:bg-[#1e293b] hover:text-white text-[10px] font-bold rounded-xl text-center transition-all"
                    >
                      View Gym
                    </Link>
                    <button
                      type="button"
                      onClick={handleLeaveGym}
                      className="py-2.5 bg-rose-950/30 border border-rose-500/30 text-rose-300 hover:bg-rose-900/40 text-[10px] font-bold rounded-xl text-center transition-all"
                    >
                      Leave
                    </button>
                    <Link
                      to="/gyms"
                      className="py-2.5 bg-[#0f172a]/80 border border-[#334155]/60 text-slate-300 hover:text-white text-[10px] font-bold rounded-xl text-center transition-all"
                    >
                      Browse
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Redesigned Grid Quick Actions */}
            <div className="bg-[#1e293b]/20 border border-[#334155]/60 rounded-3xl p-6 backdrop-blur-md shadow-md">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Quick Actions</h3>
              
              <div className="grid grid-cols-2 gap-3">
                <Link
                  to="/workouts/new"
                  className="flex flex-col items-center justify-center p-4 bg-gradient-to-br from-brand-600/20 to-brand-900/30 border border-brand-500/40 hover:border-brand-400 rounded-2xl transition-all duration-300 hover:scale-[1.02] group shadow-sm"
                >
                  <span className="text-3xl mb-2 group-hover:scale-110 transition-transform">🏋️</span>
                  <span className="text-xs font-bold text-white">Log Workout</span>
                  <span className="text-[9px] text-slate-400 mt-0.5">Record sets</span>
                </Link>
                
                <Link
                  to="/exercises"
                  className="flex flex-col items-center justify-center p-4 bg-[#1e293b]/40 border border-[#334155]/60 hover:border-slate-400 rounded-2xl transition-all duration-300 hover:scale-[1.02] group shadow-sm"
                >
                  <span className="text-3xl mb-2 group-hover:scale-110 transition-transform">📚</span>
                  <span className="text-xs font-bold text-white">Exercises</span>
                  <span className="text-[9px] text-slate-400 mt-0.5">Master Library</span>
                </Link>

                <Link
                  to="/leaderboard"
                  className="flex flex-col items-center justify-center p-4 bg-[#1e293b]/40 border border-[#334155]/60 hover:border-slate-400 rounded-2xl transition-all duration-300 hover:scale-[1.02] group shadow-sm"
                >
                  <span className="text-3xl mb-2 group-hover:scale-110 transition-transform">🏆</span>
                  <span className="text-xs font-bold text-white">Leaderboards</span>
                  <span className="text-[9px] text-slate-400 mt-0.5">Gym Standings</span>
                </Link>

                <Link
                  to="/competition"
                  className="flex flex-col items-center justify-center p-4 bg-[#1e293b]/40 border border-[#334155]/60 hover:border-slate-400 rounded-2xl transition-all duration-300 hover:scale-[1.02] group shadow-sm"
                >
                  <span className="text-3xl mb-2 group-hover:scale-110 transition-transform">👥</span>
                  <span className="text-xs font-bold text-white">Competitions</span>
                  <span className="text-[9px] text-slate-400 mt-0.5">Friend Rooms</span>
                </Link>
              </div>

              <Link
                to="/ai-coach"
                className="mt-3 flex items-center justify-between p-4 bg-gradient-to-r from-purple-950/40 via-indigo-950/40 to-purple-950/40 border border-purple-500/40 hover:border-purple-400 rounded-2xl transition-all duration-300 hover:scale-[1.01] group shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl group-hover:scale-110 transition-transform">🤖</span>
                  <div>
                    <h4 className="text-xs font-bold text-white">AI Coach Assistant</h4>
                    <p className="text-[9px] text-slate-400">Get personalized workout advice & 1RM guidance</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-purple-400 group-hover:translate-x-1 transition-transform">Ask Coach →</span>
              </Link>
            </div>

          </div>

          {/* Right Column: Standings Previews & PRs list */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Overall Gym Standings Preview Card */}
            {gymId && (
              <div className="bg-[#1e293b]/20 border border-[#334155]/60 rounded-3xl p-6 backdrop-blur-md">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-bold text-white tracking-tight">🏆 Gym Ranking Standings</h3>
                  <Link
                    to="/leaderboard"
                    className="text-[10px] font-bold text-brand-500 hover:text-brand-400"
                  >
                    View Full Standings
                  </Link>
                </div>

                {loadingGym ? (
                  <div className="flex items-center justify-center py-6">
                    <div className="w-5 h-5 border-2 border-brand-500/20 border-t-brand-600 rounded-full animate-spin"></div>
                  </div>
                ) : gymLeaderPreview.length === 0 ? (
                  <p className="text-xs text-slate-500 italic py-2">No standing scores computed yet.</p>
                ) : (
                  <div className="space-y-2">
                    {gymLeaderPreview.map((item, idx) => {
                      const isMe = item.user?.id === user?.id || item.user?._id === user?.id || item.user?.id === user?._id || item.user?._id === user?._id;
                      return (
                        <div
                          key={item.user?.id || item.user?._id}
                          className={`flex items-center justify-between p-3 rounded-xl border text-xs transition-all ${
                            isMe
                              ? 'bg-brand-500/5 border-brand-500/40 font-semibold'
                              : 'bg-[#0f172a]/60 border-[#334155]/30'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-slate-500 font-mono w-4">#{item.rank}</span>
                            <span className="text-white font-medium">{item.user?.name || item.user?.username}</span>
                          </div>
                          <span className="font-extrabold font-mono text-emerald-400">{item.score} kg</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Muscle Group rankings prompt if no gym */}
            {!gymId && (
              <div className="bg-[#1e293b]/10 border border-[#334155]/30 rounded-3xl p-6 text-center">
                <span className="text-xl block mb-2">🏆</span>
                <p className="text-xs text-slate-400">
                  Connect to a Gym Hub to join leaderboards and compete.
                </p>
              </div>
            )}

            {/* Top PRs list */}
            <div className="bg-[#1e293b]/20 border border-[#334155]/60 rounded-3xl p-6 backdrop-blur-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-bold text-white tracking-tight">💪 Your Personal Records</h3>
                <Link
                  to="/workouts"
                  className="text-[10px] font-bold text-brand-500 hover:text-brand-400"
                >
                  View All Workout Logs
                </Link>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-5 h-5 border-2 border-brand-500/20 border-t-brand-600 rounded-full animate-spin"></div>
                </div>
              ) : prs.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-xs text-slate-500 italic">No personal records achieved yet.</p>
                  <Link
                    to="/workouts/new"
                    className="inline-block mt-3 text-[10px] font-bold text-brand-400 hover:underline"
                  >
                    Log your first lift
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {prs.slice(0, 4).map((pr) => (
                    <div
                      key={pr._id}
                      className="bg-[#0f172a]/60 border border-[#334155]/30 rounded-xl p-4 flex flex-col justify-between"
                    >
                      <div className="flex justify-between items-start gap-1">
                        <span className="font-bold text-xs text-slate-200 truncate">{pr.exercise?.name}</span>
                        <span className="text-[8px] bg-slate-800 border border-slate-700 text-slate-400 px-1.5 py-0.5 rounded uppercase font-bold">
                          {pr.exercise?.muscleGroup}
                        </span>
                      </div>
                      <div className="flex items-baseline justify-between mt-3">
                        <p className="text-lg font-extrabold text-white font-mono">
                          {pr.weight} kg <span className="text-[10px] text-slate-400 font-normal font-sans">× {pr.reps} reps</span>
                        </p>
                        <span className="text-[10px] text-slate-500">
                          Est. 1RM: <strong className="text-emerald-400 font-bold font-mono">{pr.oneRepMax} kg</strong>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>

      </main>
    </div>
  );
};

export default Dashboard;
