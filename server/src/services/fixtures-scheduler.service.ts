import footballCacheService from './footballCache.service';

class FixturesSchedulerService {
  private readonly INTERVAL_MS = 30 * 60 * 1000; // 30 minutos
  private intervalId: NodeJS.Timeout | null = null;
  private readonly SEASON = 2025;
  private readonly LEAGUE_ID = 92;

  start() {
    this.runSync();
    this.intervalId = setInterval(() => this.runSync(), this.INTERVAL_MS);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  private async runSync() {
    try {
      await footballCacheService.syncSeasonFixtures(this.SEASON, this.LEAGUE_ID);
    } catch (error) {
      console.error('❌ Error during scheduled fixtures sync:', error);
    }
  }
}

export default new FixturesSchedulerService(); 