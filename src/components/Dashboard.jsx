import React from 'react';
import { Play, Plus, Clock, Trash2 } from 'lucide-react';
import { formatTime } from '../utils/time';

function Dashboard({ workouts, customWorkouts = [], onStart, onCreate, onDelete }) {
  const calculateTotalTime = (intervals) => {
    return intervals.reduce((acc, curr) => acc + curr.duration, 0);
  };

  const renderWorkoutCard = (w, isCustom = false) => (
    <div key={w.id} className="glass" style={{ 
      padding: '1.25rem', 
      borderRadius: 'var(--radius-lg)',
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
      position: 'relative'
    }}>
      {isCustom && (
        <button 
          onClick={() => onDelete(w.id)}
          style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
        >
          <Trash2 size={18} />
        </button>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ paddingRight: isCustom ? '2rem' : '0' }}>
          <h4 style={{ fontWeight: 600, fontSize: '1.1rem', marginBottom: '0.25rem', color: isCustom ? 'var(--accent-green)' : 'inherit' }}>
            {w.name}
          </h4>
          <p className="text-muted" style={{ fontSize: '0.875rem' }}>{w.description}</p>
        </div>
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
          <Clock size={16} />
          <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>
            {formatTime(calculateTotalTime(w.intervals))}
          </span>
        </div>
        <button 
          className="btn btn-primary" 
          style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', borderRadius: 'var(--radius-full)' }}
          onClick={() => onStart(w)}
        >
          <Play size={16} fill="currentColor" /> Démarrer
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '6rem' }}>
      <div>
        <h2 className="text-display" style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>
          Salut ! Prêt à rouler ?
        </h2>
        <p className="text-muted" style={{ fontSize: '0.9rem' }}>
          Sélectionne un programme ou crées-en un nouveau. La résistance manuelle doit être sur la position 2.
        </p>
      </div>

      {customWorkouts.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 className="text-display" style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--accent-green)' }}>Mes programmes</h3>
          {customWorkouts.map(w => renderWorkoutCard(w, true))}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <h3 className="text-display" style={{ fontSize: '1.1rem', fontWeight: 600 }}>Entraînements standards</h3>
        {workouts.map(w => renderWorkoutCard(w, false))}
      </div>

      {/* Floating Action Button for mobile */}
      <button 
        className="btn btn-primary"
        onClick={onCreate}
        style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          width: '3.5rem',
          height: '3.5rem',
          borderRadius: '50%',
          padding: 0,
          boxShadow: '0 4px 12px rgba(59, 130, 246, 0.5)',
          zIndex: 10
        }}
      >
        <Plus size={24} />
      </button>
    </div>
  );
}

export default Dashboard;
