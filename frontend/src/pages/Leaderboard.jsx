import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Leaderboard = () => {
  const { user } = useAuth();
  
  // Navigation & filter states
  const [leaderboardType, setLeaderboardType] = useState('overall'); // 'overall' | 'muscle' | 'exercise'
  const [exercisesList, setExercisesList] = useState([]);
  const [groupedExercises, setGroupedExercises] = useState({});
  const [selectedExerciseId, setSelectedExerciseId] = useState('');
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState('Chest');
  
  // Rankings state
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [currentUserRank, setCurrentUserRank] = useState(null);
  const [totalRankedUsers, setTotalRankedUsers] = useState(0);
  const [totalGymMembers, setTotalGymMembers] = useState(0);
  const [totalExercisesInMuscle, setTotalExercisesInMuscle] = useState(0);
  
  const [loading, setLoading] = useState(false);
  const [fetchingExercises, setFetchingExercises] = useState(true);
  const [error, setError] = useState('');
  
  const muscleGroups = ['Chest', 'Back', 'Shoulders', 'Arms', 'Legs', 'Abs'];

  // 1. Fetch exercises list on mount
  useEffect(() => {
    const fetchExercises = async () => {
      try {
        const res = await api.get('/workouts/exercises');
        setExercisesList(res.data);
        
        // Group exercises by muscle group
        const grouped = res.data.reduce((acc, ex) => {
          if (!acc[ex.muscleGroup]) {
            acc[ex.muscleGroup] = [];
          }
          acc[ex.muscleGroup].push(ex);
          return acc;
        }, {});
        
        setGroupedExercises(grouped);
        
        // Find default exercise (Bench Press if available)
        if (res.data.length > 0) {
          const defaultEx = res.data.find(e => e.name === 'Bench Press') || res.data[0];
          setSelectedExerciseId(defaultEx._id);
        }
      } catch (err) {
        console.error('Error fetching exercises:', err);
        setError('Failed to load exercises database.');
      } finally {
        setFetchingExercises(false);
      }
    };
    fetchExercises();
  }, []);

  // 2. Fetch Leaderboard ranking data whenever parameters change
  useEffect(() => {
    const fetchLeaderboard = async () => {
      const gymId = user?.gym?._id || user?.gym;
      if (!gymId) return;

      setLoading(true);
      setError('');

      try {
        let url = '';
        if (leaderboardType === 'overall') {
          url = `/gyms/${gymId}/leaderboard/overall`;
        } else if (leaderboardType === 'exercise') {
          if (!selectedExerciseId) return;
          url = `/gyms/${gymId}/leaderboard/${selectedExerciseId}`;
        } else {
          url = `/gyms/${gymId}/leaderboard/muscle/${selectedMuscleGroup}`;
        }

        const res = await api.get(url);
        setLeaderboardData(res.data.leaderboard || []);
        setCurrentUserRank(res.data.currentUserRank);
        setTotalRankedUsers(res.data.leaderboard?.length || 0);
        setTotalGymMembers(res.data.totalGymMembers || 0);
        if (leaderboardType === 'muscle') {
          setTotalExercisesInMuscle(res.data.totalExercises || 0);
        }
      } catch (err) {
        console.error('Error fetching leaderboard:', err);
        setError(err.response?.data?.message || 'Could not load gym leaderboard rankings.');
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [leaderboardType, selectedExerciseId, selectedMuscleGroup, user?.gym]);

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

  // Helper to extract a normalized string user ID from user objects
  const getUserId = (u) => {
    if (!u) return null;
    if (typeof u === 'string') return u;
    return u.id || u._id || (u.user ? (u.user.id || u.user._id) : null);
  };

  // Helper to check if two user objects or IDs match
  const isSameUser = (u1, u2) => {
    const id1 = getUserId(u1);
    const id2 = getUserId(u2);
    if (!id1 || !id2) return false;
    return String(id1) === String(id2);
  };

  // Find current user's entry in leaderboardData safely for detailed breakdown
  const currentUserEntry = leaderboardData.find(
    (item) => isSameUser(item.user, user)
  );

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
            Leaderboards are calculated among members of the same gym hub. Join a gym directory to start competing!
          </p>
          <Link
            to="/gyms"
            className="inline-block w-full py-3 px-4 bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-500 hover:to-brand-600 text-white font-bold rounded-xl transition-all duration-300 shadow-md shadow-brand-600/15 text-center"
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
      {/* Header Bar */}
      <header className="bg-[#111a2e]/60 backdrop-blur-md border-b border-[#334155]/40 px-6 py-5 sticky top-0 z-10">
        <div className="max-w-5xl w-full mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🏆</span>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">{gymName} Leaderboard</h1>
              <p className="text-[10px] text-slate-400">Gym Hub Standings & Competition</p>
            </div>
          </div>
          <Link
            to="/dashboard"
            className="text-xs font-semibold bg-[#1e293b]/60 border border-[#334155]/60 text-slate-300 hover:bg-[#1e293b] hover:text-white px-4 py-2 rounded-xl transition-all duration-200"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-8">
        {error && (
          <div className="bg-[#e11d48]/10 border border-[#e11d48]/30 text-rose-300 rounded-xl p-4 text-xs mb-6 flex justify-between items-center">
            <span>{error}</span>
            <button
              onClick={() => {
                setLoading(true);
                // Trigger refetch by toggling setting or force state reload
                setLeaderboardType(leaderboardType);
              }}
              className="px-3 py-1 bg-[#e11d48]/20 border border-[#e11d48]/30 rounded-lg text-[10px] font-bold text-white hover:bg-[#e11d48]/30"
            >
              Try Again
            </button>
          </div>
        )}

        {fetchingExercises ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-8 h-8 border-3 border-brand-500/20 border-t-brand-600 rounded-full animate-spin"></div>
            <p className="mt-3 text-slate-400 text-xs">Loading exercises...</p>
          </div>
        ) : (
          <div className="space-y-6">
            
            {/* View Selector Toggle */}
            <div className="flex gap-4 border-b border-[#334155]/40 pb-4">
              <button
                type="button"
                onClick={() => setLeaderboardType('overall')}
                className={`text-xs uppercase font-bold tracking-wider pb-1 transition-all ${
                  leaderboardType === 'overall'
                    ? 'text-brand-400 border-b-2 border-brand-500 font-extrabold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Overall Standings
              </button>
              <button
                type="button"
                onClick={() => setLeaderboardType('muscle')}
                className={`text-xs uppercase font-bold tracking-wider pb-1 transition-all ${
                  leaderboardType === 'muscle'
                    ? 'text-brand-400 border-b-2 border-brand-500 font-extrabold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Muscle Groups
              </button>
              <button
                type="button"
                onClick={() => setLeaderboardType('exercise')}
                className={`text-xs uppercase font-bold tracking-wider pb-1 transition-all ${
                  leaderboardType === 'exercise'
                    ? 'text-brand-400 border-b-2 border-brand-500 font-extrabold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Individual Exercises
              </button>
            </div>

            {/* Dynamic Filter Selector */}
            {leaderboardType === 'exercise' && (
              <div className="bg-[#1e293b]/20 border border-[#334155]/60 rounded-2xl p-5 backdrop-blur-md">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Select Exercise</label>
                <select
                  value={selectedExerciseId}
                  onChange={(e) => setSelectedExerciseId(e.target.value)}
                  className="w-full bg-[#0f172a]/60 border border-[#334155]/60 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
                >
                  {Object.keys(groupedExercises || {}).map((groupName) => (
                    <optgroup key={groupName} label={groupName}>
                      {groupedExercises[groupName].map((ex) => (
                        <option key={ex._id} value={ex._id}>
                          {ex.name}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
            )}

            {leaderboardType === 'muscle' && (
              <div className="bg-[#1e293b]/20 border border-[#334155]/60 rounded-2xl p-4 backdrop-blur-md flex flex-wrap gap-2 items-center">
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

            {/* Current User Standings Panel */}
            <div className="bg-[#1e293b]/20 border border-[#334155]/60 rounded-2xl p-5 md:p-6 backdrop-blur-md grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Your Standings</span>
                {currentUserRank !== null ? (
                  <h2 className="text-3xl font-extrabold text-white mt-1">
                    #{currentUserRank} <span className="text-xs font-normal text-slate-400">/ {totalRankedUsers} ranked</span>
                  </h2>
                ) : (
                  <p className="text-xs text-rose-300 font-semibold mt-1">
                    {leaderboardType === 'overall' 
                      ? "You haven't logged any PRs yet. Log a workout to be ranked!"
                      : `You haven't recorded a PR for this ${leaderboardType === 'exercise' ? 'exercise' : 'muscle group'} yet.`}
                  </p>
                )}
              </div>
              
              <div className="sm:text-right">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  {leaderboardType === 'overall' ? 'Total Ranked Members' : leaderboardType === 'exercise' ? 'Exercise PR Ratio' : 'Muscle Group PR Ratio'}
                </span>
                <p className="text-sm text-slate-200 mt-1 font-semibold">
                  {totalRankedUsers} ranked users <span className="text-slate-400 font-normal">/ {totalGymMembers} gym members</span>
                </p>
              </div>
            </div>

            {/* Grid for Table & Breakdown Details */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Leaderboard Table Column */}
              <div className="lg:col-span-2 bg-[#1e293b]/20 border border-[#334155]/60 rounded-3xl overflow-hidden backdrop-blur-md self-start">
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-20">
                    <div className="w-8 h-8 border-3 border-brand-500/20 border-t-brand-600 rounded-full animate-spin"></div>
                    <p className="mt-3 text-slate-400 text-xs">Loading standings...</p>
                  </div>
                ) : leaderboardData.length === 0 ? (
                  <div className="text-center py-16 px-6">
                    <div className="w-12 h-12 rounded-full bg-[#1e293b]/20 flex items-center justify-center text-slate-500 mx-auto mb-3 border border-[#334155]/40">
                      <span className="text-xl">🏋️</span>
                    </div>
                    {leaderboardType === 'overall' ? (
                      <>
                        <h4 className="text-sm font-bold text-white">No Gym Standings Yet</h4>
                        <p className="text-slate-500 text-xs mt-1 mb-4">No gym members have recorded workouts yet.</p>
                        <Link to="/workouts/new" className="inline-block py-2 px-4 bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs rounded-lg transition-all">
                          Log Your First Workout
                        </Link>
                      </>
                    ) : leaderboardType === 'muscle' ? (
                      <>
                        <h4 className="text-sm font-bold text-white">No {selectedMuscleGroup} Data</h4>
                        <p className="text-slate-500 text-xs mt-1 mb-4">Start logging {selectedMuscleGroup} workouts to appear here.</p>
                        <Link to="/workouts/new" className="inline-block py-2 px-4 bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs rounded-lg transition-all">
                          Log Workout
                        </Link>
                      </>
                    ) : (
                      <>
                        <h4 className="text-sm font-bold text-white">No Lift PRs Recorded</h4>
                        <p className="text-slate-500 text-xs mt-1 mb-4">No gym members have recorded personal records for this exercise yet.</p>
                        <Link to="/workouts/new" className="inline-block py-2 px-4 bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs rounded-lg transition-all">
                          Log Workout
                        </Link>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-[#334155]/40 text-slate-400 uppercase tracking-wider font-bold text-[10px] bg-[#111a2e]/30">
                          <th className="py-4 px-6 text-center w-16">Rank</th>
                          <th className="py-4 px-6">User</th>
                          {leaderboardType !== 'exercise' && (
                            <th className="py-4 px-6 text-center">Exercises</th>
                          )}
                          <th className="py-4 px-6 text-right">
                            {leaderboardType === 'exercise' ? '1RM' : 'Score'}
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#334155]/20">
                        {leaderboardData.map((item) => {
                          const isMe = isSameUser(item.user, user);
                          
                          return (
                            <tr
                              key={item.user?.id || item.user?._id}
                              className={`transition-all hover:bg-slate-800/10 ${
                                isMe
                                  ? 'bg-brand-500/5 font-semibold border-l-4 border-l-brand-500'
                                  : 'border-l-4 border-l-transparent'
                              }`}
                            >
                              {/* Rank */}
                              <td className="py-4 px-6 text-center whitespace-nowrap">
                                <div className="flex justify-center">{renderRankBadge(item.rank)}</div>
                              </td>
                              
                              {/* User Name/Email */}
                              <td className="py-4 px-6">
                                <div>
                                  <p className="text-white text-sm font-semibold">
                                    {item.user?.name || item.user?.username}
                                    {isMe && (
                                      <span className="ml-2 text-[8px] bg-brand-600/20 border border-brand-500/30 text-brand-400 uppercase px-1.5 py-0.5 rounded font-bold">
                                        You
                                      </span>
                                    )}
                                  </p>
                                  <p className="text-[10px] text-slate-500 mt-0.5">{item.user?.email}</p>
                                </div>
                              </td>

                              {/* Completed Exercise fraction for muscle/overall type */}
                              {leaderboardType !== 'exercise' && (
                                <td className="py-4 px-6 text-center">
                                  <span className="bg-[#111a2e]/60 border border-[#334155]/30 text-slate-300 text-[10px] font-semibold px-2.5 py-1 rounded-lg">
                                    {leaderboardType === 'muscle' 
                                      ? `${item.exercisesCompleted}/${item.totalExercises}` 
                                      : `${item.exercisesCompleted} PRs`}
                                  </span>
                                </td>
                              )}
                              
                              {/* Score Metric */}
                              <td className="py-4 px-6 text-right whitespace-nowrap">
                                <span className={`text-sm font-extrabold font-mono ${
                                  isMe ? 'text-brand-400' : 'text-emerald-400'
                                }`}>
                                  {leaderboardType === 'exercise' ? `${item.oneRepMax} kg` : `${item.score} kg`}
                                </span>
                                {leaderboardType === 'exercise' && (
                                  <span className="text-[9px] text-slate-500 block font-mono">
                                    ({item.weight}kg × {item.reps})
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Detailed Breakdown Card Column */}
              <div className="lg:col-span-1 space-y-6">
                
                {/* Score Breakdown (Muscle Group or Overall info) */}
                {leaderboardType === 'muscle' && (
                  <div className="bg-[#1e293b]/20 border border-[#334155]/60 rounded-3xl p-5 md:p-6 backdrop-blur-md">
                    <h3 className="text-sm font-bold text-white mb-3 tracking-tight">Your {selectedMuscleGroup} Score</h3>
                    {currentUserEntry ? (
                      <div className="space-y-4">
                        <div className="p-4 bg-[#0f172a]/60 border border-[#334155]/30 rounded-2xl text-center">
                          <span className="text-[10px] uppercase font-bold text-slate-400">Average 1RM Score</span>
                          <h4 className="text-3xl font-extrabold text-brand-400 mt-1 font-mono">{currentUserEntry.score} kg</h4>
                          <span className="text-[9px] text-slate-500 mt-0.5 block">Calculated from {currentUserEntry.exercisesCompleted} active PRs</span>
                        </div>

                        <div className="space-y-2.5">
                          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider ml-1">Exercises Breakdown</span>
                          {groupedExercises[selectedMuscleGroup]?.map((ex) => {
                            const exPR = currentUserEntry.prs?.find((p) => p.exerciseId?.toString() === ex._id?.toString());
                            return (
                              <div key={ex._id} className="bg-[#111a2e]/30 border border-[#334155]/20 rounded-xl p-3 flex justify-between items-center text-xs">
                                <span className="font-semibold text-slate-300 truncate max-w-[65%]">{ex.name}</span>
                                {exPR ? (
                                  <div className="text-right">
                                    <span className="font-bold text-white font-mono">{exPR.oneRepMax} kg</span>
                                    <span className="text-[8px] text-slate-500 block">({exPR.weight}kg × {exPR.reps})</span>
                                  </div>
                                ) : (
                                  <span className="text-slate-600 italic text-[10px]">No PR logged</span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <div className="py-6 text-center">
                        <p className="text-slate-500 text-xs italic">No PRs tracked in this group.</p>
                        <Link
                          to="/workouts/new"
                          className="mt-3 inline-block text-[10px] font-bold text-brand-500 hover:text-brand-400"
                        >
                          Log a lift to set a PR
                        </Link>
                      </div>
                    )}
                  </div>
                )}

                {leaderboardType === 'overall' && (
                  <div className="bg-[#1e293b]/20 border border-[#334155]/60 rounded-3xl p-5 md:p-6 backdrop-blur-md">
                    <h3 className="text-sm font-bold text-white mb-3 tracking-tight">🏆 Gym Ranking Level</h3>
                    <div className="space-y-4">
                      <div className="p-4 bg-[#0f172a]/60 border border-[#334155]/30 rounded-2xl text-center">
                        <span className="text-[10px] uppercase font-bold text-slate-400">Your Gym Rank</span>
                        <h4 className="text-3xl font-extrabold text-brand-400 mt-1 font-mono">
                          {currentUserRank !== null ? `#${currentUserRank}` : 'Unranked'}
                        </h4>
                        {currentUserEntry && (
                          <span className="text-[9px] text-slate-500 mt-0.5 block">Overall Score: {currentUserEntry.score} kg</span>
                        )}
                      </div>
                      
                      <div className="text-xs text-slate-400 space-y-2 leading-relaxed">
                        <p className="font-semibold text-slate-300">How is this calculated?</p>
                        <p className="text-[11px]">
                          Your **Overall Score** is the average of all logged exercise PRs. Setting new PRs across different exercises increases this score.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {leaderboardType === 'exercise' && (
                  <div className="bg-[#1e293b]/20 border border-[#334155]/60 rounded-3xl p-5 md:p-6 backdrop-blur-md">
                    <h3 className="text-sm font-bold text-white mb-3 tracking-tight">🏋️ Exercise Standings</h3>
                    <div className="space-y-4">
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Compare your raw 1RM against other members for this lift. Estimated 1RMs are calculated automatically using the Epley formula:
                      </p>
                      <div className="bg-[#0f172a]/60 border border-[#334155]/30 rounded-xl p-3 text-center font-mono text-[10px] text-brand-400">
                        1RM = Weight × (1 + Reps / 30)
                      </div>
                    </div>
                  </div>
                )}
                
              </div>

            </div>

          </div>
        )}
      </main>
    </div>
  );
};

export default Leaderboard;
