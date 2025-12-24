/**
 * Debug Timeline Logger
 * 
 * Logs timing of all animated elements for debugging.
 * Enable by setting DEBUG_TIMELINE = true
 */

export const DEBUG_TIMELINE = true; // Set to false in production

interface TimelineEvent {
  timestamp: number;
  elapsed: number;
  element: string;
  action: string;
  progress?: number;
}

class TimelineLogger {
  private events: TimelineEvent[] = [];
  private startTime: number = 0;
  private isRunning: boolean = false;

  start() {
    this.events = [];
    this.startTime = performance.now();
    this.isRunning = true;
    this.log('Timeline', 'START');
  }

  log(element: string, action: string, progress?: number) {
    if (!this.isRunning) return;
    
    const timestamp = performance.now();
    const elapsed = timestamp - this.startTime;
    
    this.events.push({
      timestamp,
      elapsed,
      element,
      action,
      progress,
    });

    if (DEBUG_TIMELINE) {
      const progressStr = progress !== undefined ? ` (${(progress * 100).toFixed(1)}%)` : '';
      console.log(
        `%c[${(elapsed / 1000).toFixed(2)}s]%c ${element}: %c${action}${progressStr}`,
        'color: #00D4E5; font-weight: bold',
        'color: #888',
        'color: #4ADE80'
      );
    }
  }

  stop() {
    this.log('Timeline', 'END');
    this.isRunning = false;
    this.printSummary();
  }

  printSummary() {
    if (!DEBUG_TIMELINE) return;
    
    console.log('\n%c═══════════════════════════════════════════════════════════════', 'color: #00D4E5');
    console.log('%c                    TIMELINE SUMMARY                            ', 'color: #00D4E5; font-weight: bold');
    console.log('%c═══════════════════════════════════════════════════════════════\n', 'color: #00D4E5');
    
    const totalDuration = this.events[this.events.length - 1]?.elapsed || 0;
    
    // Group events by element
    const byElement = new Map<string, TimelineEvent[]>();
    this.events.forEach(event => {
      const existing = byElement.get(event.element) || [];
      existing.push(event);
      byElement.set(event.element, existing);
    });
    
    // Print timeline bar for each element
    const barWidth = 50;
    byElement.forEach((events, element) => {
      const firstAppear = events.find(e => e.action === 'APPEAR' || e.action === 'START');
      if (!firstAppear) return;
      
      const startPercent = (firstAppear.elapsed / totalDuration) * 100;
      const startBar = Math.round((startPercent / 100) * barWidth);
      
      const bar = '░'.repeat(startBar) + '█'.repeat(barWidth - startBar);
      console.log(
        `%c${element.padEnd(20)}%c ${bar} %c${(firstAppear.elapsed / 1000).toFixed(2)}s`,
        'color: #888',
        'color: #00D4E5',
        'color: #4ADE80'
      );
    });
    
    console.log('\n%c═══════════════════════════════════════════════════════════════\n', 'color: #00D4E5');
  }

  getEvents() {
    return [...this.events];
  }
}

export const timeline = new TimelineLogger();