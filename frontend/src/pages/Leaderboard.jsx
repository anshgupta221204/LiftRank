import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Leaderboard = () => {
  const { user } = useAuth();
  
  // Navigation & filter states
  const [activeTab, setActiveTab] = useState('overall'); // 'exercise' | 'muscleGroup' | 'overall'
  const [exercisesList, setExercisesList] = useState([]);
  const [selectedExerciseId, setSelectedExerciseId] = useState('');
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState('Chest');
  
  // Rankings state
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const muscleGroups = ['Chest', 'Back', 'Shoulders', 'Arms', 'Legs', 'Abs'];

  // 1. Fetch exercises list if activeTab is 'exercise'
  useEffect(() => {
    if (activeTab === 'exercise' && exercisesList.length === 0) {
      const fetchExercises = async () => {
        try {
          const res = await api.get('/workouts/exercises');
          setExercisesList(res.data);
          if (res.data.length > 0) {
            setSelectedExerciseId(res.data[0]._id);
          }
        } catch (err) {
          console.error('Error fetching exercises list:', err);
          setError('Failed to fetch exercises list.');
        }
      };
      fetchExercises();
    }
  }, [activeTab]);

  // 2. Fetch Leaderboard ranking data whenever parameters change
  const fetchRankings = async () => {
    if (!user?.gym) return;
    
    setLoading(true);
    setError('');
    
    try {
      let url = '/gyms/my/leaderboard?';
      if (activeTab === 'exercise') {
        if (!selectedExerciseId) return;
        url += `type=exercise&exerciseId=${selectedExerciseId}`;
      } else if (activeTab === 'muscleGroup') {
        url += `type=muscleGroup&muscleGroup=${selectedMuscleGroup}`;
      } else {
        url += 'type=overall';
      }
      
      const res = await api.get(url);
      setLeaderboardData(res.data.leaderboard || []);
    } catch (err) {
      console.error('Error loading leaderboard standings:', err);
      setError(err.response?.data?.message || 'Could not load leaderboard rankings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRankings();
  }, [activeTab, selectedExerciseId, selectedMuscleGroup]);

  // Helper to render rank indicator
  const renderRankBadge = (rank) => {
    if (rank === 1) {
      return (
        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 font-bold border border-amber-500/30 text-xs shadow-sm shadow-amber-500/10">
          🥇
        </span>
      );
    }
    if (rank === 2) {
      return (
        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-400/20 text-slate-300 font-bold border border-slate-400/30 text-xs">
          🥈
        </span>
      );
    }
    if (rank === 3) {
      return (
        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-amber-700/20 text-amber-600 font-bold border border-amber-800/30 text-xs">
          🥉
        </span>
      );
    }
    return <span className="text-slate-500 font-mono text-xs pl-2">{rank}</span>;
  };

  // If user has no associated gym, prompt them to join one
  if (!user?.gym) {
    return (
      <div className="min-h-screen bg-[#0b111e] text-slate-100 flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full text-center bg-[#1e293b]/20 border border-[#334155]/60 rounded-3xl p-8 backdrop-blur-md">
          <div className="w-16 h-16 rounded-2xl bg-brand-500/10 text-brand-400 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-brand-500/5">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">Leaderboard Locked</h2>
          <p className="text-slate-400 text-xs mt-2 mb-6 leading-relaxed">
            Standings are calculated locally among members of the same gym hub. Join a gym directory to start competing!
          </p>
          <Link
            to="/gyms"
            className="inline-block w-full py-3 px-4 bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-500 hover:to-brand-600 text-white font-bold rounded-xl transition-all duration-300 shadow-md shadow-brand-600/15"
          >
            Browse Gyms Directory
          </Link>
        </div>
      </div>
    );
  }

  const gymName = user.gym.name || 'Your Gym';

  return (
    <div className="min-h-screen bg-[#0b111e] text-slate-100 flex flex-col">
      
      {/* Header Navigation */}
      <header className="bg-[#111a2e]/60 backdrop-blur-md border-b border-[#334155]/40 px-6 py-5 sticky top-0 z-10">
        <div className="max-w-5xl w-full mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">{gymName} Leaderboards</h1>
            <p className="text-[10px] text-slate-400">Compete with other members in your gym</p>
          </div>
          <Link
            to="/dashboard"
            className="text-xs font-semibold bg-[#1e293b]/60 border border-[#334155]/60 text-slate-300 hover:bg-[#1e293b] hover:text-white px-4 py-2 rounded-xl transition-all duration-200"
          >
            Dashboard
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-8">
        
        {/* Error Alert */}
        {error && (
          <div className="bg-rose-950/20 border border-rose-500/20 text-rose-300 rounded-xl p-4 text-xs mb-6">
            {error}
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex border-b border-[#334155]/40 mb-6 gap-2">
          <button
            onClick={() => setActiveTab('overall')}
            className={`pb-3 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
              activeTab === 'overall'
                ? 'border-brand-500 text-white'
                : 'border-transparent text-slate-500 hover:text-slate-300'
            }`}
          >
            Overall Strength
          </button>
          <button
            onClick={() => setActiveTab('exercise')}
            className={`pb-3 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
              activeTab === 'exercise'
                ? 'border-brand-500 text-white'
                : 'border-transparent text-slate-500 hover:text-slate-300'
            }`}
          >
            By Exercise
          </button>
          <button
            onClick={() => setActiveTab('muscleGroup')}
            className={`pb-3 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
              activeTab === 'muscleGroup'
                ? 'border-brand-500 text-white'
                : 'border-transparent text-slate-500 hover:text-slate-300'
            }`}
          >
            By Muscle Group
          </button>
        </div>

        {/* Dynamic Filters Bar */}
        {activeTab === 'exercise' && exercisesList.length > 0 && (
          <div className="bg-[#1e293b]/20 border border-[#334155]/60 rounded-2xl p-4 mb-6 backdrop-blur-md flex items-center gap-3">
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Select Exercise:</span>
            <select
              value={selectedExerciseId}
              onChange={(e) => setSelectedExerciseId(e.target.value)}
              className="bg-[#0f172a]/60 border border-[#334155]/60 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-brand-500"
            >
              {exercisesList.map((ex) => (
                <option key={ex._id} value={ex._id}>
                  {ex.name} ({ex.muscleGroup})
                </option>
              ))}
            </select>
          </div>
        )}

        {activeTab === 'muscleGroup' && (
          <div className="bg-[#1e293b]/20 border border-[#334155]/60 rounded-2xl p-4 mb-6 backdrop-blur-md flex flex-wrap gap-2 items-center">
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider mr-2">Select Muscle Group:</span>
            <div className="flex flex-wrap gap-1.5">
              {muscleGroups.map((mg) => (
                <button
                  key={mg}
                  onClick={() => setSelectedMuscleGroup(mg)}
                  className={`text-[10px] font-bold px-3 py-1.5 rounded-lg border transition-all ${
                    selectedMuscleGroup === mg
                      ? 'bg-brand-600/20 border-brand-500 text-white'
                      : 'bg-[#0f172a]/60 border-[#334155]/60 text-slate-400 hover:text-white'
                  }`}
                >
                  {mg}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Rankings Table Card */}
        <div className="bg-[#1e293b]/20 border border-[#334155]/60 rounded-3xl overflow-hidden backdrop-blur-md">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-8 h-8 border-3 border-brand-500/20 border-t-brand-600 rounded-full animate-spin"></div>
              <p className="mt-3 text-slate-400 text-xs">Fetching standings...</p>
            </div>
          ) : leaderboardData.length === 0 ? (
            <div className="text-center py-16 px-6">
              <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-slate-500 mx-auto mb-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h4 className="text-sm font-bold text-white">No Standings Available</h4>
              <p className="text-slate-500 text-xs mt-1">No members of this gym have tracked logs for these criteria yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[#334155]/40 text-slate-400 uppercase tracking-wider font-bold text-[10px] bg-[#111a2e]/30">
                    <th className="py-4 px-6 text-center w-16">Rank</th>
                    <th className="py-4 px-4">Member Name</th>
                    {activeTab === 'exercise' && (
                      <>
                        <th className="py-4 px-4 text-center">Best Lift</th>
                        <th className="py-4 px-4 text-center">Reps</th>
                      </>
                    )}
                    {activeTab === 'muscleGroup' && (
                      <th className="py-4 px-4 text-center">PRs Logged</th>
                    )}
                    {activeTab === 'overall' && (
                      <th className="py-4 px-4 text-center">PRs Logged</th>
                    )}
                    <th className="py-4 px-6 text-right">
                      {activeTab === 'exercise' ? 'Est. 1RM (KG)' : 'Strength Score (KG)'}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#334155]/20">
                  {leaderboardData.map((item) => {
                    const isMe = item.userId === user.id || item.userId?._id === user.id;
                    
                    return (
                      <tr
                        key={item.userId}
                        className={`transition-all hover:bg-slate-800/10 ${
                          isMe
                            ? 'bg-brand-500/5 font-semibold border-l-4 border-l-brand-500'
                            : 'border-l-4 border-l-transparent'
                        }`}
                      >
                        {/* Rank Badge */}
                        <td className="py-4 px-6 text-center whitespace-nowrap">
                          <div className="flex justify-center">{renderRankBadge(item.rank)}</div>
                        </td>
                        
                        {/* Member Name */}
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <div>
                              <p className="text-white text-sm">
                                {item.userName}
                                {isMe && (
                                  <span className="ml-2 text-[8px] bg-brand-600/20 border border-brand-500/30 text-brand-400 uppercase px-1.5 py-0.5 rounded font-bold">
                                    You
                                  </span>
                                )}
                              </p>
                              <p className="text-[10px] text-slate-500 font-mono mt-0.5">{item.userEmail}</p>
                            </div>
                          </div>
                        </td>
                        
                        {/* Exercise Sets/Reps */}
                        {activeTab === 'exercise' && (
                          <>
                            <td className="py-4 px-4 text-center font-mono text-sm text-slate-300">
                              {item.weight} kg
                            </td>
                            <td className="py-4 px-4 text-center text-slate-400">
                              {item.reps}
                            </td>
                          </>
                        )}

                        {/* Muscle Group Detail Counts */}
                        {activeTab === 'muscleGroup' && (
                          <td className="py-4 px-4 text-center">
                            <span className="bg-[#111a2e]/60 border border-[#334155]/30 text-slate-300 text-[10px] font-semibold px-2.5 py-1 rounded-lg">
                              {item.prs?.length || 0} exercises
                            </span>
                          </td>
                        )}

                        {/* Overall Counts */}
                        {activeTab === 'overall' && (
                          <td className="py-4 px-4 text-center">
                            <span className="bg-[#111a2e]/60 border border-[#334155]/30 text-slate-300 text-[10px] font-semibold px-2.5 py-1 rounded-lg">
                              {item.prsCount || 0} exercises
                            </span>
                          </td>
                        )}

                        {/* Score Metric Column */}
                        <td className="py-4 px-6 text-right whitespace-nowrap">
                          <span className={`text-sm font-extrabold font-mono ${
                            isMe ? 'text-brand-400' : 'text-emerald-400'
                          }`}>
                            {activeTab === 'exercise' ? item.oneRepMax : item.score} kg
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </main>
    </div>
  );
};

export default Leaderboard;
