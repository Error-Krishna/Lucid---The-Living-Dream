export type SensitivityPreset = 'default' | 'smooth' | 'agile';

export interface FlightSensitivityConfig {
  mouseSensitivity: number; // dx / dy factor
  yawTurnRate: number; // radians per second
  pitchClampRad: number; // max pitch angle in radians (e.g. 1.45 ~ 83 deg)
  rollTurnRate: number; // roll speed
  rollAutoLevelRate: number; // return-to-center damping
  thrustAcceleration: number; // base thrust
  boostMultiplier: number;
  brakeStep: number;
}

export const FLIGHT_SENSITIVITY_PRESETS: Record<SensitivityPreset, FlightSensitivityConfig> = {
  default: {
    mouseSensitivity: 0.0028, // refined from 0.0035 for smoother fine steering
    yawTurnRate: 1.6, // rad/sec keyboard turn
    pitchClampRad: 1.45,
    rollTurnRate: 1.2,
    rollAutoLevelRate: 4.0,
    thrustAcceleration: 90,
    boostMultiplier: 2.4,
    brakeStep: 0.1,
  },
  smooth: {
    mouseSensitivity: 0.0018, // softer look for fine alignment
    yawTurnRate: 1.2,
    pitchClampRad: 1.45,
    rollTurnRate: 0.9,
    rollAutoLevelRate: 5.0,
    thrustAcceleration: 80,
    boostMultiplier: 2.0,
    brakeStep: 0.08,
  },
  agile: {
    mouseSensitivity: 0.0042,
    yawTurnRate: 2.2,
    pitchClampRad: 1.45,
    rollTurnRate: 1.5,
    rollAutoLevelRate: 3.5,
    thrustAcceleration: 105,
    boostMultiplier: 2.8,
    brakeStep: 0.14,
  },
};
