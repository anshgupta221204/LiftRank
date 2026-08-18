import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const Gyms = () => {
  const { user } = useAuth();
  const [gyms, setGyms] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch gyms list
  const fetchGyms = async (searchQuery = '') => {
    setLoading(true);
    setError('');
    try {
      const url = searchQuery ? `/gyms?search=${encodeURIComponent(searchQuery)}` : '/gyms';
      const res = await api.get(url);
      setGyms(res.data);
    } catch (err) {
      console.error('Error fetching gyms:', err);
      setError('Could not retrieve gyms list. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGyms();
  }, []);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchGyms(search);
  };

  const handleClearSearch = () => {
    setSearch('');
    fetchGyms('');
  };

  return (
    <div className="min-h-screen bg-[#0b111e] text-slate-100 flex flex-col">
      {/* Top Header Section */}
      <header className="bg-[#111a2e]/60 backdrop-blur-md border-b border-[#334155]/40 px-6 py-6 sticky top-0 z-10">
        <div className="max-w-6xl w-full mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Gym Directory</h1>
            <p className="text-slate-400 text-xs mt-1">Search and join a fitness community or register a new gym</p>
          </div>
          
          <div className="flex gap-3">
            <Link
              to="/dashboard"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-[#1e293b]/60 border border-[#334155]/60 text-slate-300 hover:bg-[#1e293b] hover:text-white transition-all duration-200"
            >
              Back to Dashboard
            </Link>
            <Link
              to="/gyms/new"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-500 hover:to-brand-600 text-white transition-all duration-200 shadow-md shadow-brand-600/10"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Gym
            </Link>
          </div>
        </div>
      </header>

      {/* Main Page Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-8">
        
        {/* Search Bar Form */}
        <form onSubmit={handleSearchSubmit} className="mb-8 flex gap-3 max-w-lg">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search by gym name or city..."
              value={search}
              onChange={handleSearchChange}
              className="w-full bg-[#111a2e]/60 border border-[#334155]/60 rounded-xl pl-10 pr-10 py-3 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
            />
            {search && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-white transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          <button
            type="submit"
            className="px-5 py-3 rounded-xl text-xs font-semibold bg-brand-600 hover:bg-brand-500 text-white transition-colors"
          >
            Search
          </button>
        </form>

        {/* Error Notification */}
        {error && (
          <div className="bg-rose-950/20 border border-rose-500/20 text-rose-300 rounded-xl p-4 text-sm mb-6">
            {error}
          </div>
        )}

        {/* Gym List Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-brand-500/20 border-t-brand-600 rounded-full animate-spin"></div>
            <p className="mt-4 text-slate-400 text-xs">Loading gyms...</p>
          </div>
        ) : gyms.length === 0 ? (
          <div className="text-center py-16 bg-[#111a2e]/20 border border-[#334155]/40 rounded-2xl p-8 max-w-md mx-auto">
            <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 mx-auto mb-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-white">No Gyms Found</h3>
            <p className="text-slate-400 text-xs mt-1.5 mb-5">
              {search ? 'Try clearing your search query or look for another name.' : 'Be the first to create a gym community on LiftRank!'}
            </p>
            {!search && (
              <Link
                to="/gyms/new"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-brand-600 hover:bg-brand-500 text-white transition-colors"
              >
                Create Gym
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {gyms.map((gym) => {
              const userGymId = typeof user?.gym === 'object' ? user?.gym?._id : user?.gym;
              const isUserMember = userGymId ? String(userGymId) === String(gym._id) : false;
              
              return (
                <div 
                  key={gym._id} 
                  className={`bg-[#1e293b]/20 border rounded-2xl p-6 flex flex-col justify-between backdrop-blur-md transition-all duration-300 ${
                    isUserMember 
                      ? 'border-brand-500/60 shadow-lg shadow-brand-500/5' 
                      : 'border-[#334155]/60 hover:border-[#475569]'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <h3 className="text-lg font-bold text-white truncate leading-tight" title={gym.name}>
                        {gym.name}
                      </h3>
                      {isUserMember && (
                        <span className="flex-shrink-0 text-[10px] bg-brand-600/10 border border-brand-500/20 text-brand-400 font-semibold px-2.5 py-0.5 rounded-full">
                          Your Gym
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-3">
                      <svg className="w-3.5 h-3.5 flex-shrink-0 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="truncate">{gym.location}</span>
                    </div>

                    <p className="text-slate-400 text-xs line-clamp-2 mb-4 leading-relaxed">
                      {gym.description || 'No description provided.'}
                    </p>
                  </div>

                  <div className="border-t border-[#334155]/40 pt-4 flex items-center justify-between mt-2">
                    <div className="text-xs text-slate-400">
                      Members:{' '}
                      <span className="font-bold text-white">{gym.memberCount}</span>
                    </div>
                    
                    <Link
                      to={`/gyms/${gym._id}`}
                      className="text-xs font-semibold text-brand-500 hover:text-brand-400 flex items-center gap-1 transition-colors"
                    >
                      View Details
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </main>
    </div>
  );
};

export default Gyms;
