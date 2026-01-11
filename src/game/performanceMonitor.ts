export interface PerformanceStats {
  fps: number;
  logicTime: number;
  renderTime: number;
  custom: Record<string, number>;
  extraInfo: Record<string, number>;
}

export class PerformanceMonitor {
  private static instance: PerformanceMonitor;

  private frames: number = 0;
  private lastTime: number = 0;
  private accumulators: Record<string, number> = {};
  private counts: Record<string, number> = {};
  private startTimes: Record<string, number> = {};

  // Rolling averages
  private avgFps: number = 0;
  private avgLogic: number = 0;
  private avgRender: number = 0;
  private avgCustom: Record<string, number> = {};

  public extraInfo: Record<string, number> = {};

  private lastUpdate: number = 0;
  private readonly refreshRate: number = 500; // Update stats every 500ms

  private constructor() {
    this.lastTime = performance.now();
  }

  public static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  public startFrame(): void {
    const now = performance.now();
    this.frames++;
    if (now - this.lastTime >= 1000) {
      this.avgFps = this.frames;
      this.frames = 0;
      this.lastTime = now;
    }
  }

  public startMeasure(label: string): void {
    this.startTimes[label] = performance.now();
  }

  public endMeasure(label: string): void {
    const start = this.startTimes[label];
    if (start === undefined) {
      return;
    }

    const duration = performance.now() - start;

    if (!this.accumulators[label]) {
      this.accumulators[label] = 0;
      this.counts[label] = 0;
    }
    this.accumulators[label] += duration;
    this.counts[label]++;
  }

  /**
   * Called periodically (e.g. by the UI polling) to get the latest averaged stats.
   * This logic resets the accumulators for the next interval.
   */
  public getStats(): PerformanceStats {
    const now = performance.now();
    if (now - this.lastUpdate > this.refreshRate) {
      this.lastUpdate = now;

      // Calculate averages for logic and render if they exist
      this.avgLogic = this.calculateAverage("logic");
      this.avgRender = this.calculateAverage("render");

      // Calculate averages for custom keys
      this.avgCustom = {};
      for (const key in this.accumulators) {
        if (key !== "logic" && key !== "render") {
          this.avgCustom[key] = this.calculateAverage(key);
        }
      }

      // Reset accumulators
      this.accumulators = {};
      this.counts = {};
    }

    return {
      fps: this.avgFps,
      logicTime: this.avgLogic,
      renderTime: this.avgRender,
      custom: this.avgCustom,
      extraInfo: this.extraInfo,
    };
  }

  private calculateAverage(label: string): number {
    if (!this.accumulators[label] || !this.counts[label]) {
      return 0;
    }
    // We want average per frame (or per call),
    // but typically we want "time spent per frame".
    // If we call 'logic' multiple times per frame (fixed time step),
    // we might want the sum of those times per frame, or the average per call.
    // For simplicity, let's just return average duration per call for now,
    // or arguably better: total time spent in this interval divided by number of frames passed?
    // Actually, "average time per call" is usually what we want for specific functions.
    return this.accumulators[label] / this.counts[label];
  }
}
