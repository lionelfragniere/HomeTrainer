// Speed Estimation (simplified approximation based on generic resistance 2 curve)
// Cadence, Plateau (front), Pignon (rear) -> Speed (km/h)
// Assuming 700c wheel (circ ~ 2.1m)
export const FRONT_GEARS = [34, 50]; // Example: Compact 34/50
// 12-speed cassette
export const REAR_GEARS = [30, 28, 26, 24, 22, 20, 18, 16, 15, 14, 13, 11]; 

export const estimateSpeed = (cadence, plateauIdx, pignonIdx) => {
  const front = FRONT_GEARS[plateauIdx - 1] || 34;
  const rear = REAR_GEARS[pignonIdx - 1] || 19;
  const dev = (front / rear) * 2.1; // meters per pedal stroke
  const speedMpM = dev * cadence; // meters per minute
  return (speedMpM * 60) / 1000; // km/h
};

// Power Approximation (Very rough for Resistance 2)
// P = c * v^3 + d * v (Simplified physics model, calibrated loosely)
export const estimatePower = (speedKmh) => {
  const v = speedKmh / 3.6; // m/s
  const power = (0.015 * 80 * 9.81 * v) + (0.5 * 1.2 * 0.4 * v * v * v); // mass 80kg, CdA 0.4
  // Tacx res 2 adds fixed friction. We just add an offset or multiplier.
  return Math.max(0, Math.round(power * 1.2)); 
};
