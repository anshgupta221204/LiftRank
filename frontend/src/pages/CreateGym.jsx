import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const CreateGym = () => {
  const { loadUser } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    location: '',
    description: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { name, location, description } = formData;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Form validation
    if (!name || !location) {
      setError('Gym Name and Location are required fields');
      return;
    }

    setLoading(true);

    try {
      const res = await api.post('/gyms', { name, location, description });
      
      // Refresh user context to pick up user.gym ObjectId association
      await loadUser();

      // Navigate to the newly created gym details page
      const gymId = res.data.gym?.id || res.data.gym?._id;
      if (gymId) {
        navigate(`/gyms/${gymId}`);
      } else {
        navigate('/gyms');
      }
    } catch (err) {
      console.error('Error creating gym:', err);
      setError(err.response?.data?.message || 'Error occurred during gym creation.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-[#0f172a] via-[#0b111e] to-[#090d16]">
      <div className="max-w-md w-full bg-[#1e293b]/30 backdrop-blur-xl border border-[#334155]/60 rounded-3xl p-8 shadow-2xl text-center transition-all duration-300 hover:border-brand-500/40">
        
        {/* Header Icon */}
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-600 to-brand-500 text-white mb-6 shadow-lg shadow-brand-500/10">
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>

        <h1 className="text-3xl font-extrabold text-white tracking-tight">Create Gym</h1>
        <p className="text-slate-400 text-sm mt-1.5 mb-8">Register a gym community for competition rankings</p>

        {/* Error Alert */}
        {error && (
          <div className="flex items-start text-left bg-rose-950/20 border border-rose-500/20 text-rose-300 rounded-xl p-3.5 text-xs mb-5 gap-2.5">
            <svg className="w-5 h-5 flex-shrink-0 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <p className="font-semibold">Creation failed</p>
              <p className="text-[10px] text-rose-400/90 mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="text-left space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5 ml-1">Gym Name</label>
            <input
              type="text"
              name="name"
              value={name}
              onChange={handleChange}
              placeholder="e.g. Iron Forge Gym"
              className="w-full bg-[#0f172a]/60 border border-[#334155]/60 rounded-xl px-4 py-3 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5 ml-1">Location / City</label>
            <input
              type="text"
              name="location"
              value={location}
              onChange={handleChange}
              placeholder="e.g. New York, NY"
              className="w-full bg-[#0f172a]/60 border border-[#334155]/60 rounded-xl px-4 py-3 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5 ml-1">Description <span className="text-[10px] text-slate-500 font-normal">(Optional)</span></label>
            <textarea
              name="description"
              value={description}
              onChange={handleChange}
              placeholder="Tell others about the gym equipment, rules, or vibe..."
              rows="3"
              className="w-full bg-[#0f172a]/60 border border-[#334155]/60 rounded-xl px-4 py-3 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-500 hover:to-brand-600 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-brand-600/10 active:scale-[0.98] disabled:opacity-55 disabled:cursor-not-allowed mt-4 flex items-center justify-center"
          >
            {loading ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              'Create & Join Gym'
            )}
          </button>
        </form>

        <p className="text-slate-400 text-xs mt-6">
          Cancel and{' '}
          <Link to="/gyms" className="text-brand-500 hover:text-brand-400 font-semibold transition-colors">
            return to directory
          </Link>
        </p>

      </div>
    </div>
  );
};

export default CreateGym;
