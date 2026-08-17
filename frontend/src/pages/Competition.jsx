import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

const Competition = () => {
  const navigate = useNavigate();

  // Create room states
  const [createName, setCreateName] = useState('');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');
  const [newRoomCode, setNewRoomCode] = useState('');

  // Join room states
  const [joinCode, setJoinCode] = useState('');
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState('');

  // Active rooms list
  const [myRooms, setMyRooms] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [listError, setListError] = useState('');

  // Fetch user's competition rooms on mount
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await api.get('/competitions');
        setMyRooms(res.data || []);
      } catch (err) {
        console.error('Error fetching competitions:', err);
        setListError('Failed to load your active competitions.');
      } finally {
        setLoadingRooms(false);
      }
    };
    fetchRooms();
  }, []);

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    if (!createName.trim()) return;

    setCreating(true);
    setCreateError('');
    setNewRoomCode('');

    try {
      const res = await api.post('/competitions', { name: createName });
      setNewRoomCode(res.data.roomCode);
      setCreateName('');
      // Refresh list
      setMyRooms(prev => [res.data, ...prev]);
    } catch (err) {
      console.error('Create room error:', err);
      setCreateError(err.response?.data?.message || 'Could not create competition room.');
    } finally {
      setCreating(false);
    }
  };

  const handleJoinRoom = async (e) => {
    e.preventDefault();
    if (!joinCode.trim()) return;

    setJoining(true);
    setJoinError('');

    try {
      const res = await api.post('/competitions/join', { roomCode: joinCode });
      const compId = res.data.competition?._id || res.data.competition?.id;
      navigate(`/competition/${compId}`);
    } catch (err) {
      console.error('Join room error:', err);
      setJoinError(err.response?.data?.message || 'Could not join competition room. Verify the code.');
    } finally {
      setJoining(false);
    }
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    alert('Room code copied to clipboard!');
  };

  return (
    <div className="min-h-screen bg-[#0b111e] text-slate-100 flex flex-col">
      {/* Header Bar */}
      <header className="bg-[#111a2e]/60 backdrop-blur-md border-b border-[#334155]/40 px-6 py-5 sticky top-0 z-10">
        <div className="max-w-4xl w-full mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">Friend Competitions</h1>
            <p className="text-[10px] text-slate-400">Compete privately in custom rooms</p>
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
      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-8 space-y-8">
        
        {/* Create and Join Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Create Room Form */}
          <div className="bg-[#1e293b]/20 border border-[#334155]/60 rounded-3xl p-6 backdrop-blur-md flex flex-col justify-between">
            <div>
              <h2 className="text-base font-bold text-white mb-2">Create a Competition</h2>
              <p className="text-slate-400 text-xs mb-6 leading-relaxed">
                Set up a private room and get a unique join code to share with your gym buddies.
              </p>
              
              {createError && (
                <div className="bg-rose-950/20 border border-rose-500/20 text-rose-300 rounded-xl p-3 text-[10px] mb-4">
                  {createError}
                </div>
              )}

              {newRoomCode ? (
                <div className="bg-brand-500/5 border border-brand-500/30 rounded-2xl p-5 mb-4 text-center">
                  <span className="text-[9px] uppercase font-bold text-brand-400 tracking-wider">Room Created Successfully</span>
                  <div className="text-3xl font-black text-white tracking-widest my-2 select-all">{newRoomCode}</div>
                  <button
                    type="button"
                    onClick={() => handleCopyCode(newRoomCode)}
                    className="text-[10px] font-bold text-brand-400 bg-brand-500/10 hover:bg-brand-500/20 px-4 py-1.5 rounded-lg border border-brand-500/30 transition-all cursor-pointer"
                  >
                    Copy Code
                  </button>
                  <p className="text-[9px] text-slate-400 mt-3">Share this code with your friends so they can join.</p>
                </div>
              ) : (
                <form onSubmit={handleCreateRoom} className="space-y-4">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-2">Competition Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Gym Bros, PR Chasers"
                      value={createName}
                      onChange={(e) => setCreateName(e.target.value)}
                      disabled={creating}
                      className="w-full bg-[#0f172a]/60 border border-[#334155]/60 rounded-xl px-4 py-3 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 disabled:opacity-50 transition-all"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={creating || !createName.trim()}
                    className="w-full py-3 px-4 bg-brand-600 hover:bg-brand-500 text-white font-semibold rounded-xl text-xs transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    {creating ? 'Creating Room...' : 'Create Room'}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Join Room Form */}
          <div className="bg-[#1e293b]/20 border border-[#334155]/60 rounded-3xl p-6 backdrop-blur-md flex flex-col justify-between">
            <div>
              <h2 className="text-base font-bold text-white mb-2">Join with Code</h2>
              <p className="text-slate-400 text-xs mb-6 leading-relaxed">
                Enter a 6-character room code shared by your friend to join their private competition.
              </p>
              
              {joinError && (
                <div className="bg-rose-950/20 border border-rose-500/20 text-rose-300 rounded-xl p-3 text-[10px] mb-4">
                  {joinError}
                </div>
              )}

              <form onSubmit={handleJoinRoom} className="space-y-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-2">Room Code</label>
                  <input
                    type="text"
                    placeholder="Enter Code (e.g. XK7P92)"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value)}
                    disabled={joining}
                    maxLength={10}
                    className="w-full bg-[#0f172a]/60 border border-[#334155]/60 rounded-xl px-4 py-3 text-white text-xs placeholder-slate-500 uppercase tracking-widest font-mono text-center focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 disabled:opacity-50 transition-all"
                  />
                </div>
                <button
                  type="submit"
                  disabled={joining || !joinCode.trim()}
                  className="w-full py-3 px-4 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-semibold rounded-xl text-xs transition-all disabled:opacity-50 cursor-pointer shadow-md shadow-emerald-600/10"
                >
                  {joining ? 'Joining...' : 'Join Competition'}
                </button>
              </form>
            </div>
          </div>

        </div>

        {/* User's Active Rooms */}
        <div className="bg-[#1e293b]/20 border border-[#334155]/60 rounded-3xl p-6 backdrop-blur-md">
          <h2 className="text-base font-bold text-white mb-4">Your Active Rooms</h2>
          
          {listError && (
            <div className="bg-rose-950/20 border border-rose-500/20 text-rose-300 rounded-xl p-3 text-xs">
              {listError}
            </div>
          )}

          {loadingRooms ? (
            <div className="py-8 text-center text-xs text-slate-400">Loading your competitions...</div>
          ) : myRooms.length === 0 ? (
            <div className="py-12 text-center">
              <div className="text-slate-500 text-3xl mb-3">🏆</div>
              <h4 className="text-xs font-bold text-slate-300">No Competitions Joined</h4>
              <p className="text-[10px] text-slate-500 mt-1">Create a new room or ask a friend for their join code!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {myRooms.map((room) => (
                <div
                  key={room._id || room.id}
                  className="bg-[#0f172a]/60 border border-[#334155]/40 rounded-2xl p-4 flex flex-col justify-between hover:border-brand-500/70 transition-all group"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-sm font-bold text-white truncate max-w-[70%] group-hover:text-brand-400 transition-colors">
                      {room.name}
                    </h3>
                    <span className="bg-[#1e293b] border border-[#334155]/60 text-slate-400 font-mono text-[9px] px-2 py-0.5 rounded-lg select-all">
                      {room.roomCode}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center text-[10px] text-slate-400 mt-3 pt-2 border-t border-[#334155]/20">
                    <span>Members: <strong className="text-white">{room.members?.length || 1}</strong></span>
                    <Link
                      to={`/competition/${room._id || room.id}`}
                      className="text-xs font-semibold text-brand-400 hover:text-brand-300 flex items-center gap-1"
                    >
                      Enter Room ➔
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </main>
    </div>
  );
};

export default Competition;
