const { Pool } = require('pg');

// Usar as mesmas configurações do projeto principal
const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT || '5432'),
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function testarConexao() {
  try {
    console.log('🔄 Testando conexão à base de dados...\n');
    
    // Testar conexão
    const result = await pool.query('SELECT COUNT(*) FROM maritodle_players');
    console.log(`✅ Conexão bem-sucedida! ${result.rows[0].count} jogadores na base de dados.\n`);
    
    // Atualizar alguns jogadores específicos com os dados reais
    const atualizacoes = [
      {
        nome: 'Preslav Borukov',
        contribuicoes: ['12 golos', '4 assistências']
      },
      {
        nome: 'Patrick Fernandes', 
        contribuicoes: ['6 golos', '3 assistências']
      },
      {
        nome: 'Carlos Daniel',
        contribuicoes: ['2 golos', '4 assistências']
      },
      {
        nome: 'Pedro Silva',
        contribuicoes: ['2 golos', '3 assistências']
      },
      {
        nome: 'Fábio China',
        contribuicoes: ['3 golos', '5 assistências']
      }
    ];
    
    for (const update of atualizacoes) {
      try {
        const result = await pool.query(`
          UPDATE maritodle_players 
          SET trofeus = $1, updated_at = CURRENT_TIMESTAMP
          WHERE nome = $2
        `, [update.contribuicoes, update.nome]);
        
        if (result.rowCount > 0) {
          console.log(`✅ ${update.nome} - Contribuições atualizadas: ${update.contribuicoes.join(', ')}`);
        } else {
          console.log(`❌ ${update.nome} - Não encontrado`);
        }
      } catch (error) {
        console.log(`❌ Erro ao atualizar ${update.nome}:`, error.message);
      }
    }
    
    console.log('\n✅ Atualizações de teste concluídas!\n');
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await pool.end();
  }
}

testarConexao(); 