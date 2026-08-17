import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const CompetitionDetails = () => {
  const { competitionId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Room details states
  const [competition, setCompetition] = useState(null);
  const [loadingRoom, setLoadingRoom] = useState(true);
  const [roomError, setRoomError] = useState('');

  // Leaderboard states
  const [leaderboardType, setLeaderboardType] = useState('overall'); // 'overall' | 'muscle' | 'exercise'
  const [exercisesList, setExercisesList] = useState([]);
  const [groupedExercises, setGroupedExercises] = useState({});
  const [selectedExerciseId, setSelectedExerciseId] = useState('');
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState('Chest');

  const [leaderboardData, setLeaderboardData] = useState([]);
  const [currentUserRank, setCurrentUserRank] = useState(null);
  const [totalRankedUsers, setTotalRankedUsers] = useState(0);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);
  const [leaderboardError, setLeaderboardError] = useState('');

  const muscleGroups = ['Chest', 'Back', 'Shoulders', 'Arms', 'Legs', 'Abs'];

  // 1. Fetch room details and exercises on mount
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Fetch room info
        const roomRes = await api.get(`/competitions/${competitionId}`);
        setCompetition(roomRes.data);

        // Fetch exercises list
        const exRes = await api.get('/workouts/exercises');
        setExercisesList(exRes.data);
        
        // Group exercises by muscle group
        const grouped = exRes.data.reduce((acc, ex) => {
          if (!acc[ex.muscleGroup]) {
            acc[ex.muscleGroup] = [];
          }
          acc[ex.muscleGroup].push(ex);
          return acc;
        }, {});
        setGroupedExercises(grouped);

        // Set default exercise
        if (exRes.data.length > 0) {
          const defaultEx = exRes.data.find(e => e.name === 'Bench Press') || exRes.data[0];
          setSelectedExerciseId(defaultEx._id);
        }
      } catch (err) {
        console.error('Error fetching room details:', err);
        setRoomError(err.response?.data?.message || 'Could not load competition details.');
      } finally {
        setLoadingRoom(false);
      }
    };

    fetchInitialData();
  }, [competitionId]);

  // 2. Fetch Leaderboard rankings when filters change
  useEffect(() => {
    const fetchLeaderboard = async () => {
      if (!competition || !competitionId) return;
      if (leaderboardType === 'exercise' && !selectedExerciseId) return;

      setLoadingLeaderboard(true);
      setLeaderboardError('');

      try {
        let url = '';
        if (leaderboardType === 'overall') {
          url = `/competitions/${competitionId}/leaderboard/overall`;
        } else if (leaderboardType === 'exercise') {
          url = `/competitions/${competitionId}/leaderboard/exercise/${selectedExerciseId}`;
        } else {
          url = `/competitions/${competitionId}/leaderboard/muscle/${selectedMuscleGroup}`;
        }

        const res = await api.get(url);
        setLeaderboardData(res.data.leaderboard || []);
        setCurrentUserRank(res.data.currentUserRank);
        setTotalRankedUsers(res.data.leaderboard?.length || 0);
      } catch (err) {
        console.error('Error loading leaderboard:', err);
        setLeaderboardError('Failed to fetch competition leaderboard.');
      } finally {
        setLoadingLeaderboard(false);
      }
    };

    fetchLeaderboard();
  }, [competitionId, leaderboardType, selectedExerciseId, selectedMuscleGroup, competition]);

  // Action: Copy join room code to clipboard
  const handleCopyCode = async () => {
    if (!competition?.roomCode) return;
    try {
      await navigator.clipboard.writeText(competition.roomCode);
      alert('Room code copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  // Action: Leave room
  const handleLeaveRoom = async () => {
    if (!window.confirm('Are you sure you want to leave this competition room?')) return;
    try {
      await api.post(`/competitions/${competitionId}/leave`);
      navigate('/competition');
    } catch (err) {
      console.error('Error leaving room:', err);
      alert(err.response?.data?.message || 'Failed to leave competition room.');
    }
  };

  // Action: Delete room (Owner only)
  const handleDeleteRoom = async () => {
    if (!window.confirm('WARNING: Are you sure you want to delete this competition room? This cannot be undone.')) return;
    try {
      await api.delete(`/competitions/${competitionId}`);
      navigate('/competition');
    } catch (err) {
      console.error('Error deleting room:', err);
      alert(err.response?.data?.message || 'Failed to delete competition room.');
    }
  };

  // Rank helper
  const renderRankBadge = (rank) => {
    if (rank === 1) return <span className="text-xs">🥇</span>;
    if (rank === 2) return <span className="text-xs">🥈</span>;
    if (rank === 3) return <span className="text-xs">🥉</span>;
    return <span className="text-slate-500 font-mono text-xs pl-2">{rank}</span>;
  };

  if (loadingRoom) {
    return (
      <div className="min-h-screen bg-[#0b111e] text-slate-100 flex flex-col items-center justify-center p-6">
        <div className="w-12 h-12 border-4 border-brand-500/20 border-t-brand-600 rounded-full animate-spin"></div>
        <p className="mt-4 text-slate-400 text-xs">Loading competition room...</p>
      </div>
    );
  }

  if (roomError || !competition) {
    return (
      <div className="min-h-screen bg-[#0b111e] text-slate-100 flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full bg-[#1e293b]/20 border border-[#334155]/60 rounded-3xl p-8 text-center">
          <span className="text-3xl block mb-4">⚠️</span>
          <h2 className="text-lg font-bold text-white tracking-tight">Access Restricted</h2>
          <p className="text-slate-400 text-xs mt-2 mb-6 leading-relaxed">
            {roomError || 'This room does not exist or you are not a member.'}
          </p>
          <Link
            to="/competition"
            className="inline-block w-full py-3 bg-[#1e293b] border border-[#334155]/60 hover:text-white text-slate-300 font-bold rounded-xl transition-all"
          >
            Back to Competitions
          </Link>
        </div>
      </div>
    );
  }

  const isOwner = competition.owner?._id === user?.id || competition.owner === user?.id;

  return (
    <div className="min-h-screen bg-[#0b111e] text-slate-100 flex flex-col">
      {/* Header bar */}
      <header className="bg-[#111a2e]/60 backdrop-blur-md border-b border-[#334155]/40 px-6 py-5 sticky top-0 z-10">
        <div className="max-w-5xl w-full mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🏆</span>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">{competition.name}</h1>
              <p className="text-[10px] text-slate-400">Friend Competition Room</p>
            </div>
          </div>
          <Link
            to="/competition"
            className="text-xs font-semibold bg-[#1e293b]/60 border border-[#334155]/60 text-slate-300 hover:bg-[#1e293b] hover:text-white px-4 py-2 rounded-xl transition-all duration-200"
          >
            ← Competitions Hub
          </Link>
        </div>
      </header>

      {/* Content Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-8 space-y-6">
        
        {/* Controls Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Join Code Card */}
          <div className="bg-[#1e293b]/20 border border-[#334155]/60 rounded-3xl p-6 backdrop-blur-md flex flex-col justify-between items-center text-center">
            <div>
              <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Room Code</span>
              <div className="text-3xl font-black text-white tracking-widest my-2 select-all font-mono">{competition.roomCode}</div>
              <button
                type="button"
                onClick={handleCopyCode}
                className="text-[10px] font-bold text-brand-400 bg-brand-500/10 hover:bg-brand-500/20 px-4 py-1.5 rounded-lg border border-brand-500/30 transition-all cursor-pointer"
              >
                Copy Code
              </button>
            </div>
            
            <div className="w-full mt-6 pt-4 border-t border-[#334155]/20 flex flex-col gap-2">
              <span className="text-[9px] text-slate-500">Room Owner: {competition.owner?.name}</span>
              {isOwner ? (
                <button
                  type="button"
                  onClick={handleDeleteRoom}
                  className="w-full py-2 bg-rose-950/20 border border-rose-500/30 text-rose-300 hover:bg-rose-900/40 text-[10px] font-bold rounded-xl transition-all cursor-pointer"
                >
                  Delete Room
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleLeaveRoom}
                  className="w-full py-2 bg-slate-800/40 border border-slate-700/60 text-slate-300 hover:bg-slate-800 text-[10px] font-bold rounded-xl transition-all cursor-pointer"
                >
                  Leave Room
                </button>
              )}
            </div>
          </div>

          {/* Members List Card */}
          <div className="md:col-span-2 bg-[#1e293b]/20 border border-[#334155]/60 rounded-3xl p-6 backdrop-blur-md">
            <h3 className="text-sm font-bold text-white mb-4">Room Members ({competition.members?.length || 0}/20)</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-48 overflow-y-auto pr-1">
              {competition.members?.map((m) => {
                if (!m) return null;
                const isRoomOwner = m._id === competition.owner?._id || m._id === competition.owner;
                const isUserMe = m._id === user?.id;
                return (
                  <div
                    key={m._id}
                    className="bg-[#0f172a]/60 border border-[#334155]/30 rounded-xl p-3 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2 truncate max-w-[80%]">
                      <span className="text-slate-500 text-sm">👤</span>
                      <div className="truncate">
                        <p className="text-white text-xs font-semibold truncate">
                          {m.name}
                          {isUserMe && (
                            <span className="ml-1.5 text-[8px] bg-brand-500/20 text-brand-400 font-bold px-1 py-0.5 rounded">
                              YOU
                            </span>
                          )}
                        </p>
                        <p className="text-[9px] text-slate-500 truncate">{m.email}</p>
                      </div>
                    </div>
                    {isRoomOwner && (
                      <span className="text-[8px] bg-amber-500/10 border border-amber-500/30 text-amber-400 px-2 py-0.5 rounded font-extrabold">
                        OWNER
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Tab Selection */}
        <div className="flex gap-4 border-b border-[#334155]/40 pb-3 mt-6">
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
            Exercises
          </button>
        </div>

        {/* Dynamic Standing Filters */}
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

        {/* Leaderboard Table */}
        <div className="bg-[#1e293b]/20 border border-[#334155]/60 rounded-3xl overflow-hidden backdrop-blur-md">
          {loadingLeaderboard ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-8 h-8 border-3 border-brand-500/20 border-t-brand-600 rounded-full animate-spin"></div>
              <p className="mt-3 text-slate-400 text-xs">Loading standings...</p>
            </div>
          ) : leaderboardData.length === 0 ? (
            <div className="text-center py-16 px-6">
              <div className="w-12 h-12 rounded-full bg-[#1e293b]/20 border border-[#334155]/40 flex items-center justify-center text-slate-500 mx-auto mb-3">
                <span className="text-lg">🏆</span>
              </div>
              <h4 className="text-sm font-bold text-white">No Standings Data Yet</h4>
              <p className="text-slate-500 text-xs mt-1">No room members have recorded personal records matching these criteria.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[#334155]/40 text-slate-400 uppercase tracking-wider font-bold text-[10px] bg-[#111a2e]/30">
                    <th className="py-4 px-6 text-center w-16">Rank</th>
                    <th className="py-4 px-6">Member</th>
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
                    const isMe = item.user?.id === user?.id || item.user?._id === user?.id || item.user?.id === user?._id || item.user?._id === user?._id;
                    
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

                        {/* Completed Exercises fraction for muscle/overall type */}
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
      </main>
    </div>
  );
};

export default CompetitionDetails;
