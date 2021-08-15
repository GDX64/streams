import * as R from 'ramda';

class PIDController {
  nError = 0;
  nIntegral = 0;
  nOutput = 0;
  constructor(public kp = 1, public ki = 1) {}
  update(nError: number, dt: number) {
    this.nError = nError;
    this.nIntegral += R.clamp(-100, 100, nError * dt);
    this.nOutput = nError * this.kp + this.nIntegral * this.ki;
    return this.nOutput;
  }

  reachRef({ nRef = 1, nSimulation = 100, dt = 0.1 }, fnSystem: (x: number) => number) {
    return R.range(0, nSimulation).map(() => {
      const value = fnSystem(this.nOutput);
      this.update(nRef - value, dt);
      return { value, output: this.nOutput };
    });
  }
}

const dot = (arrValues: number[], arrSystem: number[]) =>
  R.zip(arrValues, arrSystem).reduce((acc, [value, coef]) => value * coef + acc, 0);

function makeSystem(arrSystem: number[], nInitial: number) {
  const arrValues = arrSystem.map(() => nInitial);
  return (nInput: number) => {
    arrValues.push(nInput + dot(arrValues, arrSystem));
    arrValues.shift();
    return R.last(arrValues) as number;
  };
}

export function testPID() {
  const pid = new PIDController(0.1, 10);
  const system = makeSystem([0.2, 0.6, 0.2], 0);
  const values = pid.reachRef({ nRef: 10, nSimulation: 1000, dt: 0.01 }, system);
  return values;
}

export default PIDController;
