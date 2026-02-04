import { LiveData } from '../types';

export class DataSimulator {
  private startTime: number;
  private baseTemp = 25;
  private tempVariation = 5;

  constructor() {
    this.startTime = Date.now();
  }

  generateLiveData(
    voltage: number,
    current: number,
    relays: [boolean, boolean, boolean, boolean]
  ): LiveData {
    const elapsed = (Date.now() - this.startTime) / 1000;
    const power = voltage * current;

    const tempOffset = power / 100;
    const noise = () => (Math.random() - 0.5) * this.tempVariation;

    const T_ch0 = this.baseTemp + tempOffset * 1.2 + noise();
    const T_ch1 = this.baseTemp + tempOffset * 1.1 + noise();
    const T_ch2 = this.baseTemp + tempOffset * 0.9 + noise();
    const T_ch3 = this.baseTemp + tempOffset * 1.0 + noise();
    const T_ch4 = this.baseTemp + tempOffset * 0.8 + noise();
    const T_ch5 = this.baseTemp + tempOffset * 0.95 + noise();
    const T_ch6 = this.baseTemp + tempOffset * 1.05 + noise();
    const T_ch7 = this.baseTemp + tempOffset * 0.85 + noise();

    const T_evap_avg = (T_ch0 + T_ch1 + T_ch2 + T_ch3) / 4;
    const T_cond_avg = (T_ch4 + T_ch5 + T_ch6 + T_ch7) / 4;

    const deltaT = T_evap_avg - T_cond_avg;
    const R_thermal = deltaT !== 0 ? deltaT / power : 0;

    return {
      timestamp: new Date().toISOString(),
      elapsed_time: parseFloat(elapsed.toFixed(2)),
      voltaje: parseFloat(voltage.toFixed(2)),
      corriente: parseFloat(current.toFixed(3)),
      potencia: parseFloat(power.toFixed(2)),
      T_ch0: parseFloat(T_ch0.toFixed(2)),
      T_ch1: parseFloat(T_ch1.toFixed(2)),
      T_ch2: parseFloat(T_ch2.toFixed(2)),
      T_ch3: parseFloat(T_ch3.toFixed(2)),
      T_ch4: parseFloat(T_ch4.toFixed(2)),
      T_ch5: parseFloat(T_ch5.toFixed(2)),
      T_ch6: parseFloat(T_ch6.toFixed(2)),
      T_ch7: parseFloat(T_ch7.toFixed(2)),
      T_evap_avg: parseFloat(T_evap_avg.toFixed(2)),
      T_cond_avg: parseFloat(T_cond_avg.toFixed(2)),
      R_thermal: parseFloat(R_thermal.toFixed(4)),
      relay_1: relays[0],
      relay_2: relays[1],
      relay_3: relays[2],
      relay_4: relays[3],
    };
  }

  reset() {
    this.startTime = Date.now();
  }
}
