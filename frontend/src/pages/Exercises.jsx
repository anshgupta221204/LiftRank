import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const Exercises = () => {
  const [exercises, setExercises] = useState([]);
  const [search, setSearch] = useState('');
  const [muscleFilter, setMuscleFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Add Exercise Form state
  const [showAddModal, setShowAddModal] = useState(false);
  const [formName, setFormName] = useState('');
  const [formMuscleGroup, setFormMuscleGroup] = useState('Chest');
  const [formDescription, setFormDescription] = useState('');
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const muscleGroups = ['Chest', 'Back', 'Shoulders', 'Arms', 'Legs', 'Abs'];

  const fetchExercises = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/workouts/exercises');
      setExercises(res.data);
    } catch (err) {
      console.error('Error fetching exercises:', err);
      setError('Could not load exercise library. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExercises();
  }, []);

  const handleAddExercise = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!formName.trim()) {
      setFormError('Exercise name is required');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/workouts/exercises', {
        name: formName.trim(),
        muscleGroup: formMuscleGroup,
        description: formDescription.trim(),
      });
      
      setFormSuccess(res.data.message || 'Exercise added successfully.');
      setFormName('');
      setFormDescription('');
      
      // Refresh list
      fetchExercises();
      
      // Auto close success message after 2.5s
      setTimeout(() => {
        setFormSuccess('');
        setShowAddModal(false);
      }, 2000);
    } catch (err) {
      console.error('Error adding exercise:', err);
      setFormError(err.response?.data?.message || 'Failed to add exercise definition.');
    } finally {
      setSubmitting(false);
    }
  };

  // Filter exercises
  const filteredExercises = exercises.filter((ex) => {
    const matchesSearch = ex.name.toLowerCase().includes(search.toLowerCase()) || 
                          (ex.description && ex.description.toLowerCase().includes(search.toLowerCase()));
    const matchesMuscle = muscleFilter === 'All' || ex.muscleGroup === muscleFilter;
    return matchesSearch && matchesMuscle;
  });

  return (
    <div className="min-h-screen bg-[#0b111e] text-slate-100 flex flex-col">
      {/* Navigation Header */}
      <header className="bg-[#111a2e]/60 backdrop-blur-md border-b border-[#334155]/40 px-6 py-5 sticky top-0 z-10">
        <div className="max-w-5xl w-full mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🏋️</span>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">Exercise Library</h1>
              <p className="text-[10px] text-slate-400">Search and customize available lift formats</p>
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
      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-8">
        
        {error && (
          <div className="bg-rose-950/20 border border-rose-500/20 text-rose-300 rounded-xl p-4 text-xs mb-6">
            {error}
          </div>
        )}

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-3 flex-1">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search exercises by name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-[#1e293b]/20 border border-[#334155]/60 rounded-xl pl-4 pr-10 py-3 text-slate-200 placeholder-slate-500 text-xs focus:outline-none focus:border-brand-500 transition-colors"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-xs">🔍</span>
            </div>
            
            <select
              value={muscleFilter}
              onChange={(e) => setMuscleFilter(e.target.value)}
              className="bg-[#1e293b]/20 border border-[#334155]/60 text-slate-300 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-brand-500 transition-colors"
            >
              <option value="All" className="bg-[#0f172a]">All Muscle Groups</option>
              {muscleGroups.map(mg => (
                <option key={mg} value={mg} className="bg-[#0f172a]">{mg}</option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs px-5 py-3 rounded-xl transition-all duration-300 shadow-md shadow-brand-600/10 flex items-center justify-center gap-1.5 whitespace-nowrap"
          >
            <span>+</span> Add Exercise
          </button>
        </div>

        {/* Exercises Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-8 h-8 border-3 border-brand-500/20 border-t-brand-600 rounded-full animate-spin"></div>
            <p className="mt-3 text-slate-400 text-xs">Loading library...</p>
          </div>
        ) : filteredExercises.length === 0 ? (
          <div className="text-center py-20 bg-[#1e293b]/10 border border-[#334155]/40 rounded-3xl p-8">
            <span className="text-3xl block mb-3">🏋️</span>
            <h3 className="text-sm font-bold text-white">No Exercises Found</h3>
            <p className="text-xs text-slate-500 mt-1 mb-5">
              Could not find any exercises matching your filter.
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="text-xs text-brand-400 font-bold hover:underline"
            >
              Define your own custom exercise
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredExercises.map((ex) => (
              <div
                key={ex._id}
                className="bg-[#1e293b]/10 border border-[#334155]/40 rounded-2xl p-5 hover:border-brand-500/50 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-sm font-bold text-white tracking-tight">{ex.name}</h4>
                    <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded bg-brand-500/15 border border-brand-500/30 text-brand-400">
                      {ex.muscleGroup}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed font-normal line-clamp-3">
                    {ex.description || 'No description provided.'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Add Custom Exercise Dialog/Modal Backdrop */}
      {showAddModal && (
        <div className="fixed inset-0 bg-[#060913]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-[#111a2e] border border-[#334155]/80 rounded-3xl p-6 shadow-2xl relative">
            <button
              onClick={() => {
                setShowAddModal(false);
                setFormError('');
                setFormSuccess('');
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-white font-bold text-sm"
            >
              ✕
            </button>

            <h3 className="text-base font-bold text-white mb-4 tracking-tight">🏋️ Add Custom Exercise</h3>

            {formError && (
              <div className="bg-rose-950/20 border border-rose-500/20 text-rose-300 rounded-xl p-3 text-xs mb-4">
                {formError}
              </div>
            )}

            {formSuccess && (
              <div className="bg-emerald-950/20 border border-emerald-500/20 text-emerald-300 rounded-xl p-3 text-xs mb-4">
                {formSuccess}
              </div>
            )}

            <form onSubmit={handleAddExercise} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Exercise Name</label>
                <input
                  type="text"
                  placeholder="e.g. Cable Crossover"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full bg-[#0f172a]/60 border border-[#334155]/60 rounded-xl px-4 py-2.5 text-white text-xs focus:outline-none focus:border-brand-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Target Muscle Group</label>
                <select
                  value={formMuscleGroup}
                  onChange={(e) => setFormMuscleGroup(e.target.value)}
                  className="w-full bg-[#0f172a]/60 border border-[#334155]/60 rounded-xl px-4 py-2.5 text-slate-300 text-xs focus:outline-none focus:border-brand-500 transition-colors"
                >
                  {muscleGroups.map(mg => (
                    <option key={mg} value={mg} className="bg-[#0f172a]">{mg}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Description <span className="text-[10px] text-slate-500 font-normal">(Optional)</span></label>
                <textarea
                  rows="3"
                  placeholder="Describe form tips, setup, or execution cues..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full bg-[#0f172a]/60 border border-[#334155]/60 rounded-xl px-4 py-2.5 text-white text-xs focus:outline-none focus:border-brand-500 transition-colors resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-3 bg-[#1e293b]/60 border border-[#334155]/60 text-slate-300 hover:bg-[#1e293b] hover:text-white rounded-xl text-xs font-bold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-brand-600/10 disabled:opacity-50"
                >
                  {submitting ? 'Adding...' : 'Add Exercise'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Exercises;
