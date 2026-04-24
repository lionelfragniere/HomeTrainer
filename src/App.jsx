import { useState, useEffect } from 'react';
import { Bike } from 'lucide-react';
import { standardWorkouts } from './data/workouts';
import './App.css';

import Dashboard from './components/Dashboard';
import Player from './components/Player';
import Builder from './components/Builder';

function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [activeWorkout, setActiveWorkout] = useState(null);
  const [customWorkouts, setCustomWorkouts] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem('tacx-custom-workouts');
    if (saved) {
      try {
        setCustomWorkouts(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse custom workouts', e);
      }
    }
  }, []);

  const handleStartWorkout = (workout) => {
    setActiveWorkout(workout);
    setCurrentView('player');
  };

  const handleSaveCustom = (workout) => {
    const updated = [...customWorkouts, workout];
    setCustomWorkouts(updated);
    localStorage.setItem('tacx-custom-workouts', JSON.stringify(updated));
    setCurrentView('dashboard');
  };

  const handleDeleteCustom = (id) => {
    const updated = customWorkouts.filter(w => w.id !== id);
    setCustomWorkouts(updated);
    localStorage.setItem('tacx-custom-workouts', JSON.stringify(updated));
  };

  return (
    <div className="app-container">
      <header style={{ 
        padding: '1rem', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        borderBottom: '1px solid var(--border-color)',
        backgroundColor: 'var(--bg-base)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Bike color="var(--primary)" size={24} />
          <h1 className="text-display" style={{ fontSize: '1.25rem', fontWeight: 800 }}>
            Tacx<span className="text-primary">Trainer</span>
          </h1>
        </div>
        {currentView !== 'dashboard' && (
          <button 
            className="btn btn-surface" 
            style={{ padding: '0.4rem 0.8rem', fontSize: '0.875rem' }}
            onClick={() => setCurrentView('dashboard')}
          >
            Quitter
          </button>
        )}
      </header>

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
        {currentView === 'dashboard' && (
          <Dashboard 
            workouts={standardWorkouts} 
            customWorkouts={customWorkouts}
            onStart={handleStartWorkout} 
            onCreate={() => setCurrentView('builder')}
            onDelete={handleDeleteCustom}
          />
        )}
        {currentView === 'player' && activeWorkout && (
          <Player workout={activeWorkout} />
        )}
        {currentView === 'builder' && (
          <Builder 
            onSave={handleSaveCustom} 
            onCancel={() => setCurrentView('dashboard')} 
          />
        )}
      </main>
    </div>
  );
}

export default App;
