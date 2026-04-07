import React from 'react';

const SearchBar: React.FC = () => {
  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-8">
      <div className="relative group">
        <input 
          type="text" 
          placeholder="¿A dónde quieres ir?" 
          className="input-base pr-12 h-14 text-lg shadow-lg focus:shadow-xl transition-shadow"
        />
        <button className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-primary hover:text-accent transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default SearchBar;
