import React, { useState } from 'react';
import { Plus, Trash2, Save, X } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, XAxis } from 'recharts';
import { formatDurationMMSS } from '../utils/time';
import { estimatePower, estimateSpeed } from '../utils/power';

function Builder({ onSave, onCancel }) {
  const [name, setName] = useState('Nouvel Entraînement');
  const [description, setDescription] = useState('');
  const [intervals, setIntervals] = useState([
    { duration: 300, cadence: 80, plateau: 1, pignon: 4, label: 'Échauffement' }
  ]);

  const addInterval = () => {
    setIntervals([
      ...intervals, 
      { duration: 60, cadence: 90, plateau: 2, pignon: 4, label: 'Effort' }
    ]);
  };

  const removeInterval = (index) => {
    if (intervals.length > 1) {
      setIntervals(intervals.filter((_, i) => i !== index));
    }
  };

  const updateInterval = (index, field, value) => {
    const newIntervals = [...intervals];
    newIntervals[index][field] = value;
    setIntervals(newIntervals);
  };

  const handleSave = () => {
    onSave({
      id: `custom-${Date.now()}`,
      name,
      description,
      intervals
    });
  };

  const calculateTotalTime = () => intervals.reduce((acc, curr) => acc + curr.duration, 0);

  // Prepare chart data (time vs power) for the builder preview
  const chartData = [];
  let cumTime = 0;
  if (intervals.length > 0) {
    intervals.forEach((inv) => {
      const invSpeed = estimateSpeed(inv.cadence, inv.plateau, inv.pignon);
      const invPower = estimatePower(invSpeed);
      chartData.push({ time: cumTime, power: invPower });
      cumTime += inv.duration;
    });
    chartData.push({ time: cumTime, power: 0 });
  }

  return (
    <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', height: '100%', gap: '1.5rem', paddingBottom: '2rem' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 className="text-display" style={{ fontSize: '1.25rem', fontWeight: 700 }}>Créateur</h2>
        <button className="btn btn-surface" onClick={onCancel} style={{ padding: '0.5rem' }}>
          <X size={20} />
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <input 
          type="text" 
          value={name} 
          onChange={(e) => setName(e.target.value)}
          placeholder="Nom de l'entraînement"
          style={{
            width: '100%',
            padding: '1rem',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            color: 'white',
            fontFamily: 'var(--font-sans)',
            fontSize: '1rem'
          }}
        />
        <input 
          type="text" 
          value={description} 
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description courte"
          style={{
            width: '100%',
            padding: '1rem',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            color: 'white',
            fontFamily: 'var(--font-sans)',
            fontSize: '1rem'
          }}
        />
      </div>

      {/* Preview Graph */}
      <div className="glass" style={{ height: '100px', width: '100%', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <XAxis dataKey="time" type="number" domain={[0, calculateTotalTime()]} hide />
            <Area type="stepAfter" dataKey="power" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.3} isAnimationActive={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 className="text-display" style={{ fontSize: '1rem', fontWeight: 600 }}>Intervalles</h3>
          <span className="text-muted" style={{ fontSize: '0.875rem' }}>Total : {formatDurationMMSS(calculateTotalTime())}</span>
        </div>

        {intervals.map((inv, idx) => {
          const speed = estimateSpeed(inv.cadence, inv.plateau, inv.pignon);
          const power = estimatePower(speed);
          
          return (
            <div key={idx} className="glass" style={{ padding: '1rem', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <input 
                  type="text" 
                  value={inv.label}
                  onChange={(e) => updateInterval(idx, 'label', e.target.value)}
                  style={{
                    background: 'transparent', border: 'none', color: 'white', 
                    fontSize: '1rem', fontWeight: 600, width: '100%'
                  }}
                />
                <button 
                  onClick={() => removeInterval(idx)}
                  style={{ background: 'transparent', border: 'none', color: 'var(--accent-red)', cursor: 'pointer' }}
                >
                  <Trash2 size={18} />
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="text-muted" style={{ fontSize: '0.75rem', display: 'block', marginBottom: '0.25rem' }}>Durée (min)</label>
                  <input 
                    type="number" 
                    value={inv.duration / 60}
                    step="0.5"
                    min="0.5"
                    onChange={(e) => updateInterval(idx, 'duration', Math.round(parseFloat(e.target.value) * 60) || 60)}
                    style={{ width: '100%', padding: '0.5rem', backgroundColor: 'var(--bg-base)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: 'white' }}
                  />
                </div>
                <div>
                  <label className="text-muted" style={{ fontSize: '0.75rem', display: 'block', marginBottom: '0.25rem' }}>Cadence</label>
                  <input 
                    type="number" 
                    value={inv.cadence}
                    onChange={(e) => updateInterval(idx, 'cadence', parseInt(e.target.value) || 0)}
                    style={{ width: '100%', padding: '0.5rem', backgroundColor: 'var(--bg-base)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: 'white' }}
                  />
                </div>
                <div>
                  <label className="text-muted" style={{ fontSize: '0.75rem', display: 'block', marginBottom: '0.25rem' }}>Plateau (1-2)</label>
                  <input 
                    type="number" 
                    min="1" max="2"
                    value={inv.plateau}
                    onChange={(e) => updateInterval(idx, 'plateau', parseInt(e.target.value) || 1)}
                    style={{ width: '100%', padding: '0.5rem', backgroundColor: 'var(--bg-base)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: 'white' }}
                  />
                </div>
                <div>
                  <label className="text-muted" style={{ fontSize: '0.75rem', display: 'block', marginBottom: '0.25rem' }}>Pignon (1-12)</label>
                  <input 
                    type="number" 
                    min="1" max="12"
                    value={inv.pignon}
                    onChange={(e) => updateInterval(idx, 'pignon', parseInt(e.target.value) || 1)}
                    style={{ width: '100%', padding: '0.5rem', backgroundColor: 'var(--bg-base)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: 'white' }}
                  />
                </div>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', fontSize: '0.75rem', color: 'var(--accent-orange)' }}>
                <span>~{speed.toFixed(1)} km/h</span>
                <span>~{power} W</span>
              </div>

            </div>
          );
        })}

        <button 
          className="btn btn-surface"
          onClick={addInterval}
          style={{ width: '100%', borderStyle: 'dashed', borderWidth: '1px', borderColor: 'var(--border-color)' }}
        >
          <Plus size={18} /> Ajouter un intervalle
        </button>

      </div>

      <button className="btn btn-primary" onClick={handleSave} style={{ width: '100%', marginTop: 'auto', flexShrink: 0 }}>
        <Save size={18} /> Sauvegarder
      </button>

    </div>
  );
}

export default Builder;
