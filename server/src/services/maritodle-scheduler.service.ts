import maritodleDailyService from './maritodle-daily.service';

class MaritodleSchedulerService {
  private intervalId: NodeJS.Timeout | null = null;
  private readonly PORTUGAL_TIMEZONE = 'Europe/Lisbon';
  private readonly RESET_HOUR = 23; // 23:00

  // Iniciar scheduler para gerar jogos diários
  startDailyScheduler() {
    console.log('🕐 Starting Maritodle daily scheduler (23:00 Portugal time)...');
    
    // Configurar verificação a cada minuto para verificar se é hora de resetar
    this.intervalId = setInterval(async () => {
      await this.checkAndResetDaily();
    }, 60000); // Verificar a cada minuto
    
    // Executar uma verificação imediata na inicialização
    this.checkAndResetDaily();
  }

  // Parar scheduler
  stopDailyScheduler() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('⏹️ Stopped Maritodle daily scheduler');
    }
  }

  // Verificar se é hora de resetar (23:00 Portugal)
  private async checkAndResetDaily() {
    try {
      const now = new Date();
      
      // Converter para hora de Portugal
      const portugalTime = new Date(now.toLocaleString("en-US", {timeZone: this.PORTUGAL_TIMEZONE}));
      
      // Verificar se é 23:00 (com tolerância de 1 minuto)
      if (portugalTime.getHours() === this.RESET_HOUR && portugalTime.getMinutes() === 0) {
        console.log('🌙 Hora de resetar Maritodle! (23:00 Portugal)');
        await this.performDailyReset();
      }
    } catch (error) {
      console.error('❌ Error in daily reset check:', error);
    }
  }

  // Executar reset diário
  private async performDailyReset() {
    try {
      console.log('🔄 Performing daily Maritodle reset...');
      
      // Gerar jogo para o próximo dia
      await maritodleDailyService.generateNextDayGame();
      
      console.log('✅ Daily Maritodle reset completed successfully!');
      
    } catch (error) {
      console.error('❌ Error during daily reset:', error);
    }
  }

  // Método para forçar reset (para testes)
  async forceReset() {
    console.log('⚡ Force reset triggered...');
    await this.performDailyReset();
  }

  // Obter próximo horário de reset
  getNextResetTime(): Date {
    const now = new Date();
    const portugalTime = new Date(now.toLocaleString("en-US", {timeZone: this.PORTUGAL_TIMEZONE}));
    
    const nextReset = new Date(portugalTime);
    nextReset.setHours(this.RESET_HOUR, 0, 0, 0);
    
    // Se já passou das 23:00 hoje, agendar para amanhã
    if (portugalTime.getHours() >= this.RESET_HOUR) {
      nextReset.setDate(nextReset.getDate() + 1);
    }
    
    return nextReset;
  }
}

export default new MaritodleSchedulerService(); 