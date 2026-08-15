import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [prs, setPrs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPRs = async () => {
      try {
        const res = await api.get('/workouts/prs');
        setPrs(res.data);
      } catch (err) {
        console.error('Error fetching PRs for dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPRs();
  }, []);

  return (
    <div className="min-h-screen bg-[#0b111e] text-slate-100 flex flex-col">
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
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8">
        
        {/* Welcome Section */}
        <div className="mb-8 p-6 rounded-3xl bg-gradient-to-r from-brand-700/20 to-brand-500/5 border border-[#334155]/40 relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
            <svg className="w-60 h-60 text-brand-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Welcome, {user?.name}!</h2>
          <p className="text-slate-400 text-sm mt-2 max-w-xl">
            You are successfully authenticated. Log workouts to track your training sessions, automatically compute Epley One-Rep Maxes, and compete on personal records standing.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          
          {/* Gym Association */}
          <div className="bg-[#1e293b]/20 border border-[#334155]/60 rounded-2xl p-5 backdrop-blur-md flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Gym Hub</span>
                <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
              </div>
              <p className="text-xl font-bold text-white truncate">
                {user?.gym?.name || 'No Gym Associated'}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                {user?.gym ? `Location: ${user.gym.location}` : 'Join a gym to see your standings and compete'}
              </p>
            </div>
            <div className="mt-4 border-t border-[#334155]/30 pt-3">
              {user?.gym ? (
                <Link
                  to={`/gyms/${user.gym._id || user.gym}`}
                  className="text-xs font-semibold text-brand-500 hover:text-brand-400 flex items-center gap-1 transition-colors"
                >
                  View Gym Details
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              ) : (
                <Link
                  to="/gyms"
                  className="text-xs font-semibold text-brand-500 hover:text-brand-400 flex items-center gap-1 transition-colors"
                >
                  Browse Gyms Directory
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              )}
            </div>
          </div>

          {/* Exercises Tracked */}
          <div className="bg-[#1e293b]/20 border border-[#334155]/60 rounded-2xl p-5 backdrop-blur-md">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">PR Benchmarks</span>
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
            <p className="text-2xl font-bold text-white">
              {loading ? '...' : `${prs.length} Exercises`}
            </p>
            <p className="text-xs text-slate-500 mt-2">
              {prs.length === 1 ? '1 exercise personal record achieved' : `${prs.length} exercise personal records achieved`}
            </p>
          </div>

          {/* Ranking Position */}
          <div className="bg-[#1e293b]/20 border border-[#334155]/60 rounded-2xl p-5 backdrop-blur-md">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Global Standing</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="text-2xl font-bold text-white">Unranked</p>
            <p className="text-xs text-slate-500 mt-2">Log exercises to qualify for active leaderboards</p>
          </div>

        </div>

        {/* Workout Actions & PR List Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Quick Actions Panel */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-[#1e293b]/20 border border-[#334155]/60 rounded-3xl p-6 backdrop-blur-md">
              <h3 className="text-lg font-bold text-white mb-4">Training Center</h3>
              <div className="space-y-4">
                <Link
                  to="/workouts/new"
                  className="w-full py-3.5 px-4 bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-500 hover:to-brand-600 text-white font-bold rounded-xl transition-all duration-300 text-center block shadow-lg shadow-brand-600/10"
                >
                  Log New Workout
                </Link>
                <Link
                  to="/workouts"
                  className="w-full py-3.5 px-4 bg-[#1e293b]/60 border border-[#334155]/60 text-slate-300 hover:bg-[#1e293b] hover:text-white font-semibold rounded-xl transition-all duration-200 text-center block"
                >
                  View Workout History
                </Link>
              </div>
            </div>

            {/* Gym Leaderboards Card */}
            <Link
              to="/leaderboard"
              className="bg-[#1e293b]/20 border border-[#334155]/60 rounded-2xl p-6 relative overflow-hidden group hover:border-brand-500/80 transition-all duration-300 block"
            >
              <div className="absolute right-4 top-4 text-brand-500/60 group-hover:text-brand-500 transition-colors">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <h4 className="text-sm font-bold text-white mb-1.5 group-hover:text-brand-400 transition-colors">Gym Leaderboards</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Compare Bench Press, Squat, or overall Strength Scores against other members. See where you stand on the podium!
              </p>
            </Link>
          </div>

          {/* Personal Records Listing */}
          <div className="lg:col-span-2 bg-[#1e293b]/20 border border-[#334155]/60 rounded-3xl p-6 backdrop-blur-md flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-bold text-white mb-4">Your Personal Records</h3>
              
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-6 h-6 border-2 border-brand-500/20 border-t-brand-600 rounded-full animate-spin"></div>
                </div>
              ) : prs.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-slate-500 text-xs italic">No personal records achieved yet.</p>
                  <p className="text-slate-600 text-[10px] mt-1">Log a workout with weights and reps to establish your PRs!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[300px] overflow-y-auto pr-1">
                  {prs.map((pr) => (
                    <div key={pr._id} className="bg-[#111a2e]/40 border border-[#334155]/30 rounded-2xl p-4 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start gap-1">
                          <span className="font-bold text-sm text-slate-200 truncate">{pr.exercise?.name}</span>
                          <span className="text-[8px] bg-slate-800 text-brand-400 font-bold px-1.5 py-0.5 rounded uppercase">
                            {pr.exercise?.muscleGroup}
                          </span>
                        </div>
                        <p className="text-lg font-extrabold text-white mt-2">
                          {pr.weight} kg <span className="text-xs text-slate-400 font-normal">× {pr.reps} reps</span>
                        </p>
                      </div>
                      <div className="mt-3 pt-2 border-t border-[#334155]/20 flex justify-between items-center text-[10px] text-slate-400">
                        <span>Est. 1RM: <strong className="text-emerald-400 font-bold">{pr.oneRepMax} kg</strong></span>
                        <span className="text-[9px] text-slate-500">{new Date(pr.date).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}</span>
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
