import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Layout } from './components/layout/Layout';
import { DashboardPage } from './pages/DashboardPage';
import { EntriesPage } from './pages/EntriesPage';
import { ManagePage } from './pages/ManagePage';
import { EntryModal } from './components/entries/EntryModal';
import { categoryApi } from './api/categoryApi';
import { personApi } from './api/personApi';

export function App() {
  const [entryModalOpen, setEntryModalOpen] = useState(false);
  const [entryToEdit, setEntryToEdit] = useState(null);

  const [categories, setCategories] = useState([]);
  const [people, setPeople] = useState([]);
  const [dataVersion, setDataVersion] = useState(0);

  const refreshGlobalData = async () => {
    try {
      const [catRes, peopleRes] = await Promise.all([
        categoryApi.getAll(),
        personApi.getAll(),
      ]);
      setCategories(catRes.data || []);
      setPeople(peopleRes.data || []);
    } catch (e) {
      console.error('Failed to load global categories/people', e);
    }
  };

  useEffect(() => {
    refreshGlobalData();
  }, [dataVersion]);

  const handleOpenNewEntry = () => {
    setEntryToEdit(null);
    setEntryModalOpen(true);
  };

  const handleOpenEditEntry = (entry) => {
    setEntryToEdit(entry);
    setEntryModalOpen(true);
  };

  const handleEntrySaved = () => {
    setDataVersion((v) => v + 1);
  };

  const handlePersonCreated = (newPerson) => {
    setPeople((prev) => [...prev, newPerson]);
  };

  return (
    <Layout onOpenNewEntry={handleOpenNewEntry}>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            background: '#0F172A',
            color: '#F8FAFC',
            borderRadius: '12px',
            fontSize: '13px',
            fontWeight: '600',
            boxShadow: '0 10px 15px -3px rgba(15, 23, 42, 0.2)',
          },
          success: {
            iconTheme: {
              primary: '#22C55E',
              secondary: '#FFFFFF',
            },
          },
          error: {
            iconTheme: {
              primary: '#EF4444',
              secondary: '#FFFFFF',
            },
          },
        }}
      />

      <Routes>
        <Route
          path="/"
          element={
            <DashboardPage
              key={`dash-${dataVersion}`}
              onOpenNewEntry={handleOpenNewEntry}
              onEditEntry={handleOpenEditEntry}
            />
          }
        />
        <Route
          path="/entries"
          element={
            <EntriesPage
              key={`entries-${dataVersion}`}
              onOpenNewEntry={handleOpenNewEntry}
              onEditEntry={handleOpenEditEntry}
            />
          }
        />
        <Route
          path="/manage"
          element={
            <ManagePage
              key={`manage-${dataVersion}`}
              onDataChanged={() => setDataVersion((v) => v + 1)}
            />
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Global Add / Edit Entry Modal */}
      <EntryModal
        isOpen={entryModalOpen}
        onClose={() => setEntryModalOpen(false)}
        entryToEdit={entryToEdit}
        categories={categories}
        people={people}
        onSaved={handleEntrySaved}
        onPersonCreated={handlePersonCreated}
      />
    </Layout>
  );
}

export default App;
