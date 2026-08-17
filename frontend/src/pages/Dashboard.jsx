import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Dashboard = () => {
  const { user, logout, loadUser } = useAuth();
  
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
        
        {/* Welcome Section */}
        <div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Good morning, {user?.name} 👋</h2>
          <p className="text-slate-400 text-xs mt-1.5 leading-relaxed">
            Here's your current fitness standings and personal training log overview.
          </p>
        </div>

        {/* Training Overview Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          
          {/* Gym Rank */}
          <div className="bg-[#1e293b]/20 border border-[#334155]/60 rounded-2xl p-5 backdrop-blur-md">
            <div className="text-[9px] uppercase font-bold text-slate-500 tracking-wider mb-2">🏆 Gym Rank</div>
            <div className="text-2xl font-extrabold text-white font-mono">{gymRank}</div>
            <div className="text-[10px] text-slate-400 mt-1">Gym Overall Rank</div>
          </div>

          {/* Personal Records count */}
          <div className="bg-[#1e293b]/20 border border-[#334155]/60 rounded-2xl p-5 backdrop-blur-md">
            <div className="text-[9px] uppercase font-bold text-slate-500 tracking-wider mb-2">💪 Personal Records</div>
            <div className="text-2xl font-extrabold text-white font-mono">{prs.length}</div>
            <div className="text-[10px] text-slate-400 mt-1">Exercises logged</div>
          </div>

          {/* Workouts logged count */}
          <div className="bg-[#1e293b]/20 border border-[#334155]/60 rounded-2xl p-5 backdrop-blur-md">
            <div className="text-[9px] uppercase font-bold text-slate-500 tracking-wider mb-2">🔥 Workouts Logged</div>
            <div className="text-2xl font-extrabold text-white font-mono">{workoutsCount}</div>
            <div className="text-[10px] text-slate-400 mt-1">Training sessions</div>
          </div>

          {/* Available Exercises count */}
          <div className="bg-[#1e293b]/20 border border-[#334155]/60 rounded-2xl p-5 backdrop-blur-md">
            <div className="text-[9px] uppercase font-bold text-slate-500 tracking-wider mb-2">🏋️ Exercises</div>
            <div className="text-2xl font-extrabold text-white font-mono">{exercisesCount}</div>
            <div className="text-[10px] text-slate-400 mt-1">Library lift formats</div>
          </div>

        </div>

        {/* Dashboard Columns split */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column: Gym & Quick Actions */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Gym Membership Panel */}
            <div className="bg-[#1e293b]/20 border border-[#334155]/60 rounded-3xl p-6 backdrop-blur-md">
              <h3 className="text-sm font-bold text-white mb-3 tracking-tight">Active Hub</h3>
              
              {!gymId ? (
                <div className="space-y-4">
                  <div className="p-4 bg-[#0f172a]/60 border border-[#334155]/30 rounded-2xl text-center">
                    <span className="text-2xl block mb-2">🏋️</span>
                    <h4 className="text-xs font-bold text-white">No Gym Yet</h4>
                    <p className="text-[10px] text-slate-500 mt-1">
                      You're not currently associated with a gym hub.
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2.5">
                    <Link
                      to="/gyms/new"
                      className="py-2.5 bg-[#1e293b]/60 border border-[#334155]/60 text-slate-300 hover:bg-[#1e293b] hover:text-white text-[10px] font-bold rounded-xl text-center transition-all"
                    >
                      Create Gym
                    </Link>
                    <Link
                      to="/gyms"
                      className="py-2.5 bg-brand-600 hover:bg-brand-500 text-white text-[10px] font-bold rounded-xl text-center transition-all"
                    >
                      Join Gym
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 bg-[#0f172a]/60 border border-[#334155]/30 rounded-2xl">
                    <span className="text-[8px] font-bold uppercase tracking-wider text-slate-500">Current Gym</span>
                    <h4 className="text-sm font-bold text-white mt-1 truncate">
                      {user?.gym?.name || 'Your Gym'}
                    </h4>
                    <p className="text-[10px] text-slate-400 mt-0.5 truncate">
                      📍 {user?.gym?.location || 'Unknown Location'}
                    </p>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <Link
                      to={`/gyms/${user.gym._id || user.gym}`}
                      className="py-2 bg-[#1e293b]/60 border border-[#334155]/60 text-slate-300 hover:bg-[#1e293b] hover:text-white text-[9px] font-bold rounded-lg text-center transition-all"
                    >
                      View Gym
                    </Link>
                    <button
                      type="button"
                      onClick={handleLeaveGym}
                      className="py-2 bg-rose-950/20 border border-rose-500/30 text-rose-300 hover:bg-rose-900/40 text-[9px] font-bold rounded-lg text-center transition-all"
                    >
                      Leave Gym
                    </button>
                    <Link
                      to="/gyms"
                      className="py-2 bg-[#0f172a]/60 border border-[#334155]/60 text-slate-300 hover:text-white text-[9px] font-bold rounded-lg text-center transition-all"
                    >
                      Change Gym
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Actions Panel */}
            <div className="bg-[#1e293b]/20 border border-[#334155]/60 rounded-3xl p-6 backdrop-blur-md">
              <h3 className="text-sm font-bold text-white mb-4 tracking-tight">Quick Actions</h3>
              <div className="grid grid-cols-1 gap-2.5">
                <Link
                  to="/workouts/new"
                  className="py-3 px-4 bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs rounded-xl text-center transition-all shadow-md shadow-brand-600/10"
                >
                  Log Workout
                </Link>
                <Link
                  to="/exercises"
                  className="py-3 px-4 bg-[#1e293b]/60 border border-[#334155]/60 text-slate-300 hover:bg-[#1e293b] hover:text-white font-bold text-xs rounded-xl text-center transition-all"
                >
                  Exercise Library
                </Link>
                <Link
                  to="/leaderboard"
                  className="py-3 px-4 bg-[#1e293b]/60 border border-[#334155]/60 text-slate-300 hover:bg-[#1e293b] hover:text-white font-bold text-xs rounded-xl text-center transition-all"
                >
                  Gym Leaderboards
                </Link>
                <Link
                  to="/competition"
                  className="py-3 px-4 bg-[#1e293b]/60 border border-[#334155]/60 text-slate-300 hover:bg-[#1e293b] hover:text-white font-bold text-xs rounded-xl text-center transition-all"
                >
                  Friend Competitions
                </Link>
                <Link
                  to="/ai-coach"
                  className="py-3 px-4 bg-[#1e293b]/60 border border-[#334155]/60 text-slate-300 hover:bg-[#1e293b] hover:text-white font-bold text-xs rounded-xl text-center transition-all"
                >
                  🤖 AI Coach
                </Link>
              </div>
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
