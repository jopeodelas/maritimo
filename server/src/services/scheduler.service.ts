import footballAPIService from './footballAPI.service';
import footballCacheService from './footballCache.service';

class SchedulerService {
  private intervalId: NodeJS.Timeout | null = null;
  private readonly CHECK_INTERVAL = 12 * 60 * 60 * 1000; // 12 horas (em vez de 30 minutos)

  // Iniciar verificação automática de novos jogos
  startAutoVotingCheck() {
    console.log('🕐 Starting automatic voting check every 12 hours...');
    
    // Verificar imediatamente
    this.checkForNewVotings();
    
    // Configurar verificação periódica
    this.intervalId = setInterval(async () => {
      await this.checkForNewVotings();
    }, this.CHECK_INTERVAL);
  }

  // Parar verificação automática
  stopAutoVotingCheck() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('⏹️ Stopped automatic voting check');
    }
  }

  // Verificar se há novos jogos para criar votações
  private async checkForNewVotings() {
    try {
      console.log('🔄 Scheduled check for new Marítimo matches...');
      
      // Verificar se precisa de sincronização
      const syncStatus = await footballCacheService.needsSync();
      
      if (syncStatus.needsFullSync) {
        console.log('📥 Running full sync...');
        await footballCacheService.fullSync();
      } else if (syncStatus.needsCheckSync) {
        console.log('⚡ Running quick sync...');
        await footballCacheService.quickSync();
      }
      
      // Verificar se há jogos não processados para criar votações
      await this.createVotingFromLatestMatch();
      
    } catch (error) {
      console.error('❌ Error in scheduled voting check:', error);
    }
  }

  // Criar votação do último jogo não processado
  private async createVotingFromLatestMatch() {
    try {
      const latestMatch = await footballCacheService.getLatestUnprocessedMatch();
      
      if (latestMatch) {
        console.log(`🆕 Found unprocessed match: ${latestMatch.home_team} vs ${latestMatch.away_team}`);
        
        // Tentar criar votação usando dados do cache
        const result = await footballAPIService.createAutoVotingFromRealMatch();
        
        if (result.success) {
          // Marcar como processado
          await footballCacheService.markMatchAsProcessed(latestMatch.fixture_id);
          console.log('✅ Voting created and match marked as processed');
        }
      } else {
        console.log('✅ No new unprocessed matches found');
      }
    } catch (error) {
      console.error('❌ Error creating voting from latest match:', error);
    }
  }

  // Criar votação automática imediatamente (para testes)
  async createVotingNow() {
    try {
      console.log('⚡ Manual trigger: Creating voting from latest match...');
      const result = await footballAPIService.createAutoVotingFromRealMatch();
      return result;
    } catch (error) {
      console.error('❌ Error in manual voting creation:', error);
      return { success: false, message: 'Erro na criação manual de votação' };
    }
  }
}

export default new SchedulerService(); 