import React from 'react';
import { Navbar } from './Navbar';

export const Layout = ({ children, onOpenNewEntry }) => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar onOpenNewEntry={onOpenNewEntry} />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {children}
      </main>
      <footer className="border-t border-slate-200/80 bg-white py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} SkillTrack — Personal & Team Learning & Activity Tracker</p>
          <div className="flex items-center gap-6">
            <span>Built with MERN Stack</span>
            <span>•</span>
            <span className="font-medium text-indigo-600">Continuous Growth</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
