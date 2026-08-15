import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const Workouts = () => {
  const [workouts, setWorkouts] = useState([]);
  const [prs, setPrs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchHistory = async () => {
    setLoading(true);
    setError('');
    try {
      const [workoutsRes, prsRes] = await Promise.all([
        api.get('/workouts'),
        api.get('/workouts/prs')
      ]);
      setWorkouts(workoutsRes.data);
      setPrs(prsRes.data);
    } catch (err) {
      console.error('Error fetching workout history:', err);
      setError('Could not retrieve workout history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const formatDate = (dateString) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Checks if a logged set matches the user's current PR for that exercise
  const checkIsPR = (exerciseId, set1RM, workoutId) => {
    return prs.some(
      (pr) =>
        pr.exercise?._id === exerciseId &&
        pr.oneRepMax === set1RM &&
        pr.workout === workoutId
    );
  };

  return (
    <div className="min-h-screen bg-[#0b111e] text-slate-100 flex flex-col">
      {/* Header Section */}
      <header className="bg-[#111a2e]/60 backdrop-blur-md border-b border-[#334155]/40 px-6 py-6 sticky top-0 z-10">
        <div className="max-w-4xl w-full mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Workout Logs</h1>
            <p className="text-slate-400 text-xs mt-1">Review your full training history and progress achievements</p>
          </div>
          
          <div className="flex gap-3">
            <Link
              to="/dashboard"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-[#1e293b]/60 border border-[#334155]/60 text-slate-300 hover:bg-[#1e293b] hover:text-white transition-all duration-200"
            >
              Dashboard
            </Link>
            <Link
              to="/workouts/new"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-500 hover:to-brand-600 text-white transition-all duration-200 shadow-md shadow-brand-600/10"
            >
              Log Workout
            </Link>
          </div>
        </div>
      </header>

      {/* Main Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-8">
        {error && (
          <div className="bg-rose-950/20 border border-rose-500/20 text-rose-300 rounded-xl p-4 text-xs mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="w-10 h-10 border-4 border-brand-500/20 border-t-brand-600 rounded-full animate-spin"></div>
            <p className="mt-4 text-slate-400 text-xs">Loading workout logs...</p>
          </div>
        ) : workouts.length === 0 ? (
          <div className="text-center py-16 bg-[#111a2e]/20 border border-[#334155]/40 rounded-2xl p-8 max-w-md mx-auto">
            <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 mx-auto mb-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-white">No Workouts Logged</h3>
            <p className="text-slate-400 text-xs mt-1.5 mb-5">You haven't recorded any training sessions yet.</p>
            <Link
              to="/workouts/new"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-brand-600 hover:bg-brand-500 text-white transition-colors"
            >
              Log Your First Workout
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {workouts.map((workout) => (
              <div
                key={workout._id}
                className="bg-[#1e293b]/20 border border-[#334155]/60 rounded-3xl p-6 backdrop-blur-md hover:border-[#475569]/80 transition-all duration-300"
              >
                {/* Date & Note Headers */}
                <div className="mb-4 border-b border-[#334155]/40 pb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <h3 className="text-base font-bold text-white tracking-tight">
                    {formatDate(workout.date)}
                  </h3>
                  {workout.notes && (
                    <span className="text-xs text-slate-400 italic bg-[#0f172a]/60 px-3 py-1 rounded-lg border border-[#334155]/20 max-w-sm truncate">
                      "{workout.notes}"
                    </span>
                  )}
                </div>

                {/* Exercises Stack */}
                <div className="space-y-4">
                  {workout.exercises.map((item) => (
                    <div key={item._id} className="bg-[#0f172a]/40 border border-[#334155]/30 rounded-2xl p-4">
                      
                      {/* Exercise Info */}
                      <div className="flex items-baseline justify-between mb-3 border-b border-[#334155]/20 pb-2">
                        <span className="text-sm font-bold text-slate-200">
                          {item.exercise?.name || 'Deleted Exercise'}
                        </span>
                        <span className="text-[9px] uppercase font-bold tracking-wider text-slate-500">
                          {item.exercise?.muscleGroup}
                        </span>
                      </div>

                      {/* Sets Renders */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                        {item.sets.map((set, idx) => {
                          const isRecord = checkIsPR(item.exercise?._id, set.oneRepMax, workout._id);
                          
                          return (
                            <div
                              key={set._id}
                              className={`rounded-xl p-3 border flex flex-col justify-between ${
                                isRecord
                                  ? 'bg-emerald-950/20 border-emerald-500/30 shadow-sm shadow-emerald-500/5'
                                  : 'bg-[#111a2e]/30 border-[#334155]/30'
                              }`}
                            >
                              <div className="flex justify-between items-center text-[10px] text-slate-500 font-bold mb-1">
                                <span>SET {idx + 1}</span>
                                {isRecord && (
                                  <span className="text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded text-[8px]">
                                    PR
                                  </span>
                                )}
                              </div>
                              <p className="font-semibold text-slate-200 text-sm">
                                {set.weight} kg <span className="text-xs text-slate-400 font-normal">× {set.reps} reps</span>
                              </p>
                              <p className="text-[10px] text-slate-400 mt-1 font-mono">
                                1RM: <span className={isRecord ? 'text-emerald-400 font-semibold' : 'text-slate-300'}>{set.oneRepMax} kg</span>
                              </p>
                            </div>
                          );
                        })}
                      </div>

                    </div>
                  ))}
                </div>

              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Workouts;
