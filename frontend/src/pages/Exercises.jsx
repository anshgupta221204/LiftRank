import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const Exercises = () => {
  const [exercises, setExercises] = useState([]);
  const [search, setSearch] = useState('');
  const [muscleFilter, setMuscleFilter] = useState('All');
  const [equipmentFilter, setEquipmentFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const muscleGroups = ['All', 'Chest', 'Back', 'Shoulders', 'Arms', 'Legs', 'Abs', 'Full Body', 'Cardio'];
  const equipmentTypes = ['All', 'Barbell', 'Dumbbell', 'Cable', 'Machine', 'Bodyweight', 'Smith Machine', 'Kettlebell', 'Trap Bar', 'EZ Bar', 'Other'];

  const fetchExercises = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/workouts/exercises');
      setExercises(res.data || []);
    } catch (err) {
      console.error('Error fetching exercises:', err);
      setError('Could not load system exercise library. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExercises();
  }, []);

  // Filter exercises based on search, muscle group, and equipment
  const filteredExercises = exercises.filter((ex) => {
    const matchesSearch = ex.name.toLowerCase().includes(search.toLowerCase()) || 
                          (ex.description && ex.description.toLowerCase().includes(search.toLowerCase())) ||
                          (ex.category && ex.category.toLowerCase().includes(search.toLowerCase()));
    const matchesMuscle = muscleFilter === 'All' || ex.muscleGroup === muscleFilter;
    const matchesEquipment = equipmentFilter === 'All' || ex.equipment === equipmentFilter;
    return matchesSearch && matchesMuscle && matchesEquipment;
  });

  return (
    <div className="min-h-screen bg-[#0b111e] text-slate-100 flex flex-col font-sans">
      {/* Navigation Header */}
      <header className="bg-[#111a2e]/60 backdrop-blur-md border-b border-[#334155]/40 px-6 py-5 sticky top-0 z-10">
        <div className="max-w-6xl w-full mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 to-brand-500 flex items-center justify-center text-white text-xl shadow-md shadow-brand-500/10">
              📚
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-white tracking-tight">Master Exercise Library</h1>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-brand-500/10 text-brand-400 border border-brand-500/20">
                  System Data
                </span>
              </div>
              <p className="text-xs text-slate-400">System-managed database of 250+ standard lift formats & equipment styles</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Link
              to="/dashboard"
              className="text-xs font-semibold bg-[#1e293b]/60 border border-[#334155]/60 text-slate-300 hover:bg-[#1e293b] hover:text-white px-4 py-2 rounded-xl transition-all duration-200"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-8">
        
        {error && (
          <div className="bg-rose-950/20 border border-rose-500/20 text-rose-300 rounded-xl p-4 text-xs mb-6">
            {error}
          </div>
        )}

        {/* Filters Toolbar */}
        <div className="bg-[#1e293b]/20 border border-[#334155]/60 rounded-3xl p-5 backdrop-blur-md mb-8 space-y-4 shadow-md">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            {/* Search Input */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 ml-1">
                Search Exercise
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search Bench, Squat, Cable..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-[#0f172a]/60 border border-[#334155]/60 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-brand-500 transition-all"
                />
                {search && (
                  <button
                    onClick={() => setSearch('')}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-white text-xs"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Muscle Group Filter */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 ml-1">
                Muscle Group
              </label>
              <select
                value={muscleFilter}
                onChange={(e) => setMuscleFilter(e.target.value)}
                className="w-full bg-[#0f172a]/60 border border-[#334155]/60 rounded-xl px-4 py-2.5 text-slate-300 text-xs focus:outline-none focus:border-brand-500 transition-all"
              >
                {muscleGroups.map((mg) => (
                  <option key={mg} value={mg}>
                    {mg === 'All' ? 'All Muscle Groups' : mg}
                  </option>
                ))}
              </select>
            </div>

            {/* Equipment Filter */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 ml-1">
                Equipment Type
              </label>
              <select
                value={equipmentFilter}
                onChange={(e) => setEquipmentFilter(e.target.value)}
                className="w-full bg-[#0f172a]/60 border border-[#334155]/60 rounded-xl px-4 py-2.5 text-slate-300 text-xs focus:outline-none focus:border-brand-500 transition-all"
              >
                {equipmentTypes.map((eq) => (
                  <option key={eq} value={eq}>
                    {eq === 'All' ? 'All Equipment' : eq}
                  </option>
                ))}
              </select>
            </div>

          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-[#334155]/30">
            <span>
              Showing <strong className="text-white">{filteredExercises.length}</strong> of {exercises.length} system exercises
            </span>
            {(search || muscleFilter !== 'All' || equipmentFilter !== 'All') && (
              <button
                onClick={() => { setSearch(''); setMuscleFilter('All'); setEquipmentFilter('All'); }}
                className="text-brand-400 hover:underline font-semibold"
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>

        {/* Exercises Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="w-10 h-10 border-4 border-brand-500/20 border-t-brand-600 rounded-full animate-spin"></div>
            <p className="mt-4 text-slate-400 text-xs">Loading master exercise dataset...</p>
          </div>
        ) : filteredExercises.length === 0 ? (
          <div className="text-center py-16 bg-[#111a2e]/20 border border-[#334155]/40 rounded-3xl p-8 max-w-md mx-auto">
            <span className="text-4xl block mb-3">🔍</span>
            <h3 className="text-base font-bold text-white">No Exercises Found</h3>
            <p className="text-slate-400 text-xs mt-1">Try broadening your search term or resetting the category filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredExercises.map((ex) => (
              <div
                key={ex._id || ex.name}
                className="bg-[#1e293b]/20 border border-[#334155]/60 hover:border-[#475569] rounded-2xl p-5 backdrop-blur-md transition-all duration-200 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="text-base font-bold text-white group-hover:text-brand-400 transition-colors leading-tight">
                      {ex.name}
                    </h3>
                    <span className="text-[10px] font-semibold uppercase px-2.5 py-0.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 flex-shrink-0">
                      {ex.muscleGroup}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {ex.equipment && (
                      <span className="text-[9px] font-medium bg-[#0f172a]/80 text-slate-300 px-2 py-0.5 rounded-md border border-[#334155]/40">
                        ⚙️ {ex.equipment}
                      </span>
                    )}
                    {ex.category && ex.category !== ex.muscleGroup && (
                      <span className="text-[9px] font-medium bg-[#0f172a]/80 text-slate-400 px-2 py-0.5 rounded-md border border-[#334155]/40">
                        🎯 {ex.category}
                      </span>
                    )}
                  </div>

                  <p className="text-slate-400 text-xs leading-relaxed line-clamp-2">
                    {ex.description || 'Standard training exercise.'}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-[#334155]/30 flex items-center justify-between text-[10px]">
                  <span className="text-slate-500 font-mono">ID: {ex._id ? ex._id.substring(0, 8) : 'SYS'}</span>
                  <Link
                    to="/workouts/new"
                    className="text-brand-400 font-bold hover:underline"
                  >
                    + Log in Workout
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

      </main>
    </div>
  );
};

export default Exercises;
