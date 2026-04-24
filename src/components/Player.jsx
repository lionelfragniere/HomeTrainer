import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipForward, Activity, Settings2, Plus, Minus } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, ReferenceLine, XAxis } from 'recharts';
import { formatDurationMMSS } from '../utils/time';
import { playCountdownBeep, playStartBeep, playPauseBeep } from '../utils/audio';
import { estimatePower, estimateSpeed, FRONT_GEARS, REAR_GEARS } from '../utils/power';

function Player({ workout }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0); 
  const [intervalElapsed, setIntervalElapsed] = useState(0); 
  const [currentIntervalIdx, setCurrentIntervalIdx] = useState(0);
  const [intensity, setIntensity] = useState(1.0); // 1.0 = 100%
  
  const timerRef = useRef(null);
  const intervals = workout.intervals;
  const currentInterval = intervals[currentIntervalIdx];
  const totalDuration = intervals.reduce((acc, curr) => acc + curr.duration, 0);
  const workoutProgress = (elapsedTime / totalDuration) * 100;
  const intervalProgress = (intervalElapsed / currentInterval.duration) * 100;
  
  const targetCadence = Math.round(currentInterval.cadence * intensity);
  const speed = estimateSpeed(targetCadence, currentInterval.plateau, currentInterval.pignon);
  const power = estimatePower(speed);

  // Prepare chart data (time vs power) for the whole workout
  const chartData = [];
  let cumTime = 0;
  
  intervals.forEach((inv) => {
    const invSpeed = estimateSpeed(Math.round(inv.cadence * intensity), inv.plateau, inv.pignon);
    const invPower = estimatePower(invSpeed);
    
    chartData.push({ time: cumTime, power: invPower });
    cumTime += inv.duration;
  });
  // Add final point to close the chart
  chartData.push({ time: cumTime, power: 0 });

  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setElapsedTime(prev => {
          if (prev + 1 >= totalDuration) {
            setIsPlaying(false);
            return totalDuration;
          }
          return prev + 1;
        });
        
        setIntervalElapsed(prev => {
          const next = prev + 1;
          const remaining = currentInterval.duration - next;
          
          if (remaining > 0 && remaining <= 3) {
            playCountdownBeep();
          } else if (remaining <= 0) {
            playStartBeep();
            setCurrentIntervalIdx(idx => Math.min(idx + 1, intervals.length - 1));
            return 0; 
          }
          return next;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isPlaying, currentIntervalIdx, intervals, currentInterval.duration, totalDuration]);

  const togglePlay = () => {
    if (!isPlaying) playStartBeep();
    else playPauseBeep();
    setIsPlaying(!isPlaying);
  };

  const skipInterval = () => {
    if (currentIntervalIdx < intervals.length - 1) {
      const remaining = currentInterval.duration - intervalElapsed;
      setElapsedTime(prev => Math.min(prev + remaining, totalDuration));
      setCurrentIntervalIdx(idx => idx + 1);
      setIntervalElapsed(0);
      playStartBeep();
    }
  };

  const changeIntensity = (delta) => {
    setIntensity(prev => Math.max(0.5, Math.min(2.0, prev + delta)));
  };

  // Visual Gears with Numbers
  const renderGears = () => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
      {/* Front Gears (Plateau) */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
        <span className="text-muted" style={{ fontSize: '0.7rem' }}>Plateau</span>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'flex-end' }}>
            {[1, 2].map(p => (
              <div key={p} style={{
                width: p === 2 ? '1.5rem' : '1.25rem',
                height: p === 2 ? '1.5rem' : '1.25rem',
                borderRadius: '50%',
                border: `2px solid ${p === currentInterval.plateau ? 'var(--primary)' : 'var(--border-color)'}`,
                backgroundColor: p === currentInterval.plateau ? 'var(--ring-color)' : 'transparent',
                transition: 'all 0.3s ease'
              }} />
            ))}
          </div>
          <span style={{ fontSize: '1.25rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--primary)' }}>
            P{currentInterval.plateau}
          </span>
        </div>
      </div>
      
      {/* Rear Gears (Pignon) */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
        <span className="text-muted" style={{ fontSize: '0.7rem' }}>Pignon</span>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <span style={{ fontSize: '1.25rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--accent-orange)' }}>
            V{currentInterval.pignon}
          </span>
          <div style={{ display: 'flex', gap: '2px', alignItems: 'flex-end', height: '1.5rem' }}>
            {REAR_GEARS.map((_, idx) => {
              const p = idx + 1;
              const size = 0.5 + (idx * 0.08);
              return (
                <div key={p} style={{
                  width: '0.3rem',
                  height: `${size}rem`,
                  borderRadius: '2px',
                  backgroundColor: p === currentInterval.pignon ? 'var(--accent-orange)' : 'var(--border-color)',
                  transition: 'all 0.3s ease'
                }} />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: 'var(--bg-base)' }}>
      {/* Top Bar Progress */}
      <div style={{ height: '4px', backgroundColor: 'var(--bg-surface-light)', width: '100%' }}>
        <div style={{ 
          height: '100%', 
          backgroundColor: 'var(--primary)', 
          width: `${workoutProgress}%`,
          transition: 'width 1s linear'
        }} />
      </div>

      <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem', overflowY: 'auto' }}>
        
        {/* Header Info */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h2 className="text-display" style={{ fontSize: '1.25rem', fontWeight: 700 }}>{workout.name}</h2>
            <p className="text-primary" style={{ fontWeight: 600 }}>{currentInterval.label}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div className="text-display" style={{ fontSize: '1.5rem', fontWeight: 800 }}>
              {formatDurationMMSS(elapsedTime)}
            </div>
            <div className="text-muted" style={{ fontSize: '0.875rem' }}>
              Reste {formatDurationMMSS(totalDuration - elapsedTime)}
            </div>
          </div>
        </div>

        {/* Workout Profile Graph - Fixed XAxis to track time properly */}
        <div style={{ height: '80px', width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <XAxis dataKey="time" type="number" domain={[0, totalDuration]} hide />
              <Area type="stepAfter" dataKey="power" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.2} isAnimationActive={false} />
              <ReferenceLine x={elapsedTime} stroke="var(--accent-green)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Current Targets */}
        <div className="glass" style={{ 
          padding: '1.5rem', 
          borderRadius: 'var(--radius-xl)', 
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Interval Progress Bar Background */}
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            height: '4px',
            backgroundColor: 'var(--accent-green)',
            width: `${intervalProgress}%`,
            transition: 'width 1s linear'
          }} />

          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'baseline', gap: '0.5rem', color: 'var(--accent-green)' }}>
            <div className="text-display" style={{ fontSize: '4.5rem', fontWeight: 800, lineHeight: 1, marginBottom: '0.25rem' }}>
              {targetCadence}
            </div>
            <div className="text-muted" style={{ fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 600 }}>
              RPM
            </div>
          </div>
          
          <div style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '0.5rem', fontFamily: 'var(--font-display)' }}>
            {formatDurationMMSS(currentInterval.duration - intervalElapsed)}
          </div>
        </div>

        {/* Gears and Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
          <div className="glass" style={{ padding: '1.25rem', borderRadius: 'var(--radius-lg)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <Settings2 size={20} color="var(--primary)" />
              <span className="text-muted" style={{ fontSize: '0.875rem' }}>Transmission</span>
            </div>
            {renderGears()}
          </div>
          
          <div className="glass" style={{ padding: '1.25rem', borderRadius: 'var(--radius-lg)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Activity size={20} color="var(--accent-orange)" />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span className="text-muted" style={{ fontSize: '0.875rem' }}>Est. Vitesse & Puissance</span>
                
                {/* Difficulty Controls */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <button onClick={() => changeIntensity(-0.05)} style={{ background: 'var(--bg-surface-light)', border: 'none', color: 'white', borderRadius: 'var(--radius-sm)', padding: '0.25rem' }}>
                    <Minus size={14} />
                  </button>
                  <span style={{ fontSize: '0.875rem', fontWeight: 600, width: '3rem', textAlign: 'center' }}>
                    {Math.round(intensity * 100)}%
                  </span>
                  <button onClick={() => changeIntensity(0.05)} style={{ background: 'var(--bg-surface-light)', border: 'none', color: 'white', borderRadius: 'var(--radius-sm)', padding: '0.25rem' }}>
                    <Plus size={14} />
                  </button>
                </div>

              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--accent-orange)' }}>
                ~{power}W
              </div>
              <div className="text-muted" style={{ fontSize: '0.875rem' }}>{speed.toFixed(1)} km/h</div>
            </div>
          </div>
        </div>

        {/* Upcoming interval preview */}
        {currentIntervalIdx < intervals.length - 1 && (
          <div style={{ marginTop: 'auto', padding: '1rem', backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-md)' }}>
            <div className="text-muted" style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>À suivre :</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 500, fontSize: '0.875rem' }}>
              <span>{intervals[currentIntervalIdx + 1].label}</span>
              <span>{intervals[currentIntervalIdx + 1].cadence} RPM | P{intervals[currentIntervalIdx + 1].plateau} / V{intervals[currentIntervalIdx + 1].pignon}</span>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div style={{ 
        padding: '1.5rem', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        gap: '1.5rem',
        borderTop: '1px solid var(--border-color)',
        backgroundColor: 'var(--bg-surface)'
      }}>
        <div style={{ width: '4rem' }} /> {/* Spacer */}
        
        <button 
          onClick={togglePlay}
          style={{
            width: '4.5rem',
            height: '4.5rem',
            borderRadius: '50%',
            backgroundColor: isPlaying ? 'var(--bg-surface-light)' : 'var(--primary)',
            color: 'white',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: isPlaying ? 'none' : 'var(--shadow-glow)',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          {isPlaying ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" style={{ marginLeft: '4px' }} />}
        </button>

        <button 
          onClick={skipInterval}
          disabled={currentIntervalIdx >= intervals.length - 1}
          style={{
            width: '4rem',
            height: '4rem',
            borderRadius: '50%',
            backgroundColor: 'transparent',
            color: currentIntervalIdx >= intervals.length - 1 ? 'var(--bg-surface-light)' : 'var(--text-main)',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: currentIntervalIdx >= intervals.length - 1 ? 'default' : 'pointer'
          }}
        >
          <SkipForward size={24} />
        </button>
      </div>

    </div>
  );
}

export default Player;
