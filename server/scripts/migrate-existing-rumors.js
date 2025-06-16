// Carregar variáveis de ambiente
require('dotenv').config();

const axios = require('axios');

async function migrateExistingRumors() {
  try {
    console.log('🔄 Migrando rumores existentes da memória para a base de dados...');
    
    // Fazer uma chamada ao endpoint de migração que criamos
    const response = await axios.post('http://localhost:5000/api/admin/transfer/migrate', {}, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Resposta da migração:', response.data);
    console.log(`🎉 ${response.data.migrated || 0} rumores migrados com sucesso!`);
    
  } catch (error) {
    if (error.response) {
      console.error('❌ Erro na migração:', error.response.data);
    } else {
      console.error('❌ Erro de conexão:', error.message);
      console.log('💡 Certifique-se de que o servidor está a correr em http://localhost:5000');
    }
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  migrateExistingRumors()
    .then(() => {
      console.log('🏁 Script de migração terminado!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Falha na migração:', error.message);
      process.exit(1);
    });
}

module.exports = { migrateExistingRumors }; 