import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

const LogWorkout = () => {
  const navigate = useNavigate();
  const [exercisesList, setExercisesList] = useState([]);
  const [selectedExerciseId, setSelectedExerciseId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [workoutExercises, setWorkoutExercises] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingExercises, setFetchingExercises] = useState(true);
  const [error, setError] = useState('');
  const [exerciseSearch, setExerciseSearch] = useState('');
  const [exerciseMuscleFilter, setExerciseMuscleFilter] = useState('All');
  const muscleGroups = ['Chest', 'Back', 'Shoulders', 'Arms', 'Legs', 'Abs', 'Full Body', 'Cardio'];

  // Fetch all exercises on mount
  useEffect(() => {
    const fetchExercises = async () => {
      try {
        const res = await api.get('/workouts/exercises');
        setExercisesList(res.data);
      } catch (err) {
        console.error('Error fetching exercises:', err);
        setError('Could not retrieve exercise list.');
      } finally {
        setFetchingExercises(false);
      }
    };
    fetchExercises();
  }, []);

  // Epley 1RM calculation helper
  const calculate1RM = (weight, reps) => {
    const w = parseFloat(weight);
    const r = parseInt(reps);
    if (isNaN(w) || isNaN(r) || w <= 0 || r < 1) return 0;
    if (r === 1) return w;
    return Math.round(w * (1 + r / 30) * 10) / 10;
  };

  // Add exercise card to workout log
  const handleAddExercise = (e) => {
    e.preventDefault();
    if (!selectedExerciseId) return;

    const exerciseObj = exercisesList.find((ex) => ex._id === selectedExerciseId);
    if (!exerciseObj) return;

    // Check if exercise already added
    if (workoutExercises.some((item) => item.exercise._id === selectedExerciseId)) {
      setError(`"${exerciseObj.name}" is already added to this workout.`);
      return;
    }

    setError('');
    setWorkoutExercises([
      ...workoutExercises,
      {
        exercise: exerciseObj,
        sets: [{ weight: '', reps: '' }],
      },
    ]);
    setSelectedExerciseId('');
  };

  const handleRemoveExercise = (index) => {
    setWorkoutExercises(workoutExercises.filter((_, i) => i !== index));
  };

  const handleAddSet = (exerciseIndex) => {
    const updated = [...workoutExercises];
    // Copy the previous set weight/reps as a default starting value
    const lastSet = updated[exerciseIndex].sets[updated[exerciseIndex].sets.length - 1];
    updated[exerciseIndex].sets.push({
      weight: lastSet ? lastSet.weight : '',
      reps: lastSet ? lastSet.reps : '',
    });
    setWorkoutExercises(updated);
  };

  const handleRemoveSet = (exerciseIndex, setIndex) => {
    const updated = [...workoutExercises];
    updated[exerciseIndex].sets = updated[exerciseIndex].sets.filter((_, i) => i !== setIndex);
    
    // If no sets are left, remove the exercise card completely
    if (updated[exerciseIndex].sets.length === 0) {
      handleRemoveExercise(exerciseIndex);
    } else {
      setWorkoutExercises(updated);
    }
  };

  const handleSetChange = (exerciseIndex, setIndex, field, value) => {
    const updated = [...workoutExercises];
    updated[exerciseIndex].sets[setIndex][field] = value;
    setWorkoutExercises(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (workoutExercises.length === 0) {
      setError('Please add at least one exercise to your workout log.');
      return;
    }

    // Validation check on weights and reps
    for (const item of workoutExercises) {
      for (let s = 0; s < item.sets.length; s++) {
        const set = item.sets[s];
        const w = parseFloat(set.weight);
        const r = parseInt(set.reps);
        if (isNaN(w) || w < 0) {
          setError(`Please provide a valid weight (0 or higher) for set ${s + 1} of ${item.exercise.name}`);
          return;
        }
        if (isNaN(r) || r < 1) {
          setError(`Please provide valid reps (1 or higher) for set ${s + 1} of ${item.exercise.name}`);
          return;
        }
      }
    }

    setLoading(true);

    try {
      const payload = {
        date,
        notes,
        exercises: workoutExercises.map((item) => ({
          exercise: item.exercise._id,
          sets: item.sets.map((set) => ({
            weight: parseFloat(set.weight),
            reps: parseInt(set.reps),
          })),
        })),
      };

      await api.post('/workouts', payload);
      navigate('/workouts');
    } catch (err) {
      console.error('Error logging workout:', err);
      setError(err.response?.data?.message || 'Failed to save workout. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b111e] text-slate-100 flex flex-col">
      {/* Header Bar */}
      <header className="bg-[#111a2e]/60 backdrop-blur-md border-b border-[#334155]/40 px-6 py-5 sticky top-0 z-10">
        <div className="max-w-4xl w-full mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">Log Workout</h1>
            <p className="text-[10px] text-slate-400">Record your exercises and recalculate your 1RM standings</p>
          </div>
          <Link
            to="/dashboard"
            className="text-xs font-semibold bg-[#1e293b]/60 border border-[#334155]/60 text-slate-300 hover:bg-[#1e293b] hover:text-white px-4 py-2 rounded-xl transition-all duration-200"
          >
            Cancel
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-8">
        
        {/* Error Alert */}
        {error && (
          <div className="bg-rose-950/20 border border-rose-500/20 text-rose-300 rounded-xl p-4 text-xs mb-6 flex items-start gap-2.5">
            <svg className="w-5 h-5 flex-shrink-0 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span className="leading-relaxed">{error}</span>
          </div>
        )}

        {fetchingExercises ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="w-10 h-10 border-4 border-brand-500/20 border-t-brand-600 rounded-full animate-spin"></div>
            <p className="mt-4 text-slate-400 text-xs">Loading exercises list...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Session Metadata Grid */}
            <div className="bg-[#1e293b]/20 border border-[#334155]/60 rounded-2xl p-5 md:p-6 backdrop-blur-md grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5 ml-1">Workout Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-[#0f172a]/60 border border-[#334155]/60 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5 ml-1">Session Notes</label>
                <input
                  type="text"
                  placeholder="e.g., Felt strong today, focused on Bench Press control..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-[#0f172a]/60 border border-[#334155]/60 rounded-xl px-4 py-3 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
                />
              </div>
            </div>

            {/* Exercise Selector Panel with Search & Muscle Filter */}
            <div className="bg-[#1e293b]/20 border border-[#334155]/60 rounded-2xl p-5 backdrop-blur-md space-y-4">
              <span className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Add Exercise to Workout</span>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Search */}
                <div className="sm:col-span-1">
                  <input
                    type="text"
                    placeholder="Search lifts..."
                    value={exerciseSearch}
                    onChange={(e) => setExerciseSearch(e.target.value)}
                    className="w-full bg-[#0f172a]/60 border border-[#334155]/60 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-brand-500 transition-all"
                  />
                </div>
                
                {/* Muscle group selector */}
                <div className="sm:col-span-1">
                  <select
                    value={exerciseMuscleFilter}
                    onChange={(e) => setExerciseMuscleFilter(e.target.value)}
                    className="w-full bg-[#0f172a]/60 border border-[#334155]/60 rounded-xl px-4 py-2.5 text-slate-300 text-xs focus:outline-none focus:border-brand-500 transition-all"
                  >
                    <option value="All">All Muscle Groups</option>
                    {muscleGroups.map(mg => (
                      <option key={mg} value={mg}>{mg}</option>
                    ))}
                  </select>
                </div>
                
                {/* Choose matching exercise */}
                <div className="sm:col-span-1">
                  <select
                    value={selectedExerciseId}
                    onChange={(e) => setSelectedExerciseId(e.target.value)}
                    className="w-full bg-[#0f172a]/60 border border-[#334155]/60 rounded-xl px-4 py-2.5 text-white text-xs focus:outline-none focus:border-brand-500 transition-all"
                  >
                    <option value="">-- Select Exercise --</option>
                    {exercisesList
                      .filter(ex => {
                        const matchesSearch = ex.name.toLowerCase().includes(exerciseSearch.toLowerCase());
                        const matchesMuscle = exerciseMuscleFilter === 'All' || ex.muscleGroup === exerciseMuscleFilter;
                        return matchesSearch && matchesMuscle;
                      })
                      .map(ex => (
                        <option key={ex._id} value={ex._id}>
                          {ex.name}
                        </option>
                      ))
                    }
                  </select>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-between items-center gap-2 pt-2">
                <span className="text-[10px] text-slate-500">
                  Explore all 250+ standard lift formats in the <Link to="/exercises" className="text-brand-500 hover:underline font-semibold">Exercise Master Library</Link>.
                </span>
                <button
                  type="button"
                  onClick={handleAddExercise}
                  className="px-6 py-2.5 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-500 text-white transition-colors"
                >
                  + Add Exercise Card
                </button>
              </div>
            </div>

            {/* Logged Exercises Cards Stack */}
            {workoutExercises.length === 0 ? (
              <div className="text-center py-16 bg-[#1e293b]/10 border border-[#334155]/30 rounded-2xl p-8">
                <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-slate-500 mx-auto mb-3">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                </div>
                <h3 className="text-sm font-bold text-white">No Exercises Added</h3>
                <p className="text-slate-500 text-xs mt-1">Select an exercise from the list above and click "Add Exercise" to start logging.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {workoutExercises.map((item, exIndex) => (
                  <div key={item.exercise._id} className="bg-[#1e293b]/20 border border-[#334155]/60 rounded-3xl p-5 md:p-6 backdrop-blur-md">
                    
                    {/* Exercise Card Title */}
                    <div className="flex items-center justify-between mb-4 border-b border-[#334155]/40 pb-3">
                      <div>
                        <h3 className="text-lg font-bold text-white leading-tight">{item.exercise.name}</h3>
                        <span className="text-[10px] uppercase font-semibold tracking-wider text-brand-400 mt-0.5 inline-block">
                          {item.exercise.muscleGroup}
                        </span>
                      </div>
                      
                      <button
                        type="button"
                        onClick={() => handleRemoveExercise(exIndex)}
                        className="text-slate-400 hover:text-rose-400 text-xs font-semibold transition-colors flex items-center gap-1"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Remove
                      </button>
                    </div>

                    {/* Table Headers */}
                    <div className="grid grid-cols-12 gap-3 text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-2 px-1 text-center sm:text-left">
                      <div className="col-span-2 sm:col-span-1 text-center">Set</div>
                      <div className="col-span-4 sm:col-span-3">Weight (KG)</div>
                      <div className="col-span-4 sm:col-span-3">Reps</div>
                      <div className="col-span-10 sm:col-span-4 text-center sm:text-left">Estimated 1RM</div>
                      <div className="col-span-2 sm:col-span-1"></div>
                    </div>

                    {/* Sets Rows */}
                    <div className="space-y-3">
                      {item.sets.map((set, setIndex) => {
                        const est1RM = calculate1RM(set.weight, set.reps);
                        
                        return (
                          <div key={setIndex} className="grid grid-cols-12 gap-3 items-center text-slate-300 text-sm">
                            {/* Set Number */}
                            <div className="col-span-2 sm:col-span-1 text-center font-bold text-slate-500">
                              {setIndex + 1}
                            </div>
                            
                            {/* Weight Input */}
                            <div className="col-span-4 sm:col-span-3">
                              <input
                                type="number"
                                step="any"
                                placeholder="0"
                                value={set.weight}
                                onChange={(e) => handleSetChange(exIndex, setIndex, 'weight', e.target.value)}
                                className="w-full bg-[#0f172a]/60 border border-[#334155]/60 rounded-xl px-3 py-2 text-white text-center text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
                              />
                            </div>

                            {/* Reps Input */}
                            <div className="col-span-4 sm:col-span-3">
                              <input
                                type="number"
                                placeholder="0"
                                value={set.reps}
                                onChange={(e) => handleSetChange(exIndex, setIndex, 'reps', e.target.value)}
                                className="w-full bg-[#0f172a]/60 border border-[#334155]/60 rounded-xl px-3 py-2 text-white text-center text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
                              />
                            </div>

                            {/* Live 1RM display */}
                            <div className="col-span-10 sm:col-span-4 flex items-center justify-center sm:justify-start gap-1 text-xs">
                              {est1RM > 0 ? (
                                <span className="font-semibold text-emerald-400 bg-emerald-950/20 border border-emerald-500/20 px-2 py-1 rounded-lg">
                                  {est1RM} kg 1RM
                                </span>
                              ) : (
                                <span className="text-slate-500 italic">Enter specs</span>
                              )}
                            </div>

                            {/* Delete Set Button */}
                            <div className="col-span-2 sm:col-span-1 text-center">
                              <button
                                type="button"
                                onClick={() => handleRemoveSet(exIndex, setIndex)}
                                className="text-slate-500 hover:text-rose-400 p-1 rounded transition-colors"
                                title="Delete Set"
                              >
                                <svg className="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Add Set Button */}
                    <button
                      type="button"
                      onClick={() => handleAddSet(exIndex)}
                      className="mt-4 px-4 py-2 rounded-xl text-xs font-semibold bg-[#1e293b]/60 border border-[#334155]/60 text-slate-300 hover:bg-[#1e293b] hover:text-white transition-all duration-200 flex items-center gap-1.5"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Add Set
                    </button>

                  </div>
                ))}
              </div>
            )}

            {/* Form Save Button */}
            {workoutExercises.length > 0 && (
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 px-4 bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-500 hover:to-brand-600 text-white font-bold rounded-2xl transition-all duration-300 shadow-lg shadow-brand-600/10 active:scale-[0.98] disabled:opacity-55 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading && <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>}
                  Save Workout Log
                </button>
              </div>
            )}

          </form>
        )}

      </main>
    </div>
  );
};

export default LogWorkout;
