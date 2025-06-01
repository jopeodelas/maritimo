const { Pool } = require('pg');
require('dotenv').config({ path: '../.env' });

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '123asd!',
  database: process.env.DB_NAME || 'maritimo_voting',
  port: parseInt(process.env.DB_PORT || '5432'),
});

// VALORES EXATOS DA LISTA FORNECIDA PELO USUÁRIO
const contribuicoesExatas = [
  { nome: 'Samu Silva', contribuicoes: 0 },
  { nome: 'Kimiss Zavala', contribuicoes: 0 },
  { nome: 'Junior Almeida', contribuicoes: 1 },
  { nome: 'Afonso Freitas', contribuicoes: 0 },
  { nome: 'Rodrigo Borges', contribuicoes: 4 },
  { nome: 'Romain Correia', contribuicoes: 3 },
  { nome: 'Noah Madsen', contribuicoes: 1 },
  { nome: 'Pedro Silva', contribuicoes: 5 },
  { nome: 'Ibrahima Guirassy', contribuicoes: 9 },
  { nome: 'Carlos Daniel', contribuicoes: 10 },
  { nome: 'Vladan Danilović', contribuicoes: 6 },
  { nome: 'Michel Costa', contribuicoes: 4 },
  { nome: 'Rodrigo Andrade', contribuicoes: 3 },
  { nome: 'Fábio Blanco', contribuicoes: 11 },
  { nome: 'Preslav Borukov', contribuicoes: 14 },
  { nome: 'Alexandre Guedes', contribuicoes: 11 },
  { nome: 'Patrick Fernandes', contribuicoes: 8 },
  { nome: 'Martim Tavares', contribuicoes: 9 },
  { nome: 'Nachon Nsingi', contribuicoes: 6 },
  { nome: 'Daniel Benchimol', contribuicoes: 8 },
  { nome: 'Enrique Peña Zauner', contribuicoes: 8 },
  { nome: 'Fábio China', contribuicoes: 5 },
  { nome: 'Igor Julião', contribuicoes: 0 },
  { nome: 'Tomás Domingos', contribuicoes: 1 },
  { nome: 'Francisco França', contribuicoes: 5 },
  { nome: 'Gonçalo Tabuaço', contribuicoes: 0 }
];

async function corrigirContribuicoesUrgente() {
  try {
    console.log('🚨 CORREÇÃO URGENTE DAS CONTRIBUIÇÕES! 🚨\n');
    
    let corrigidos = 0;
    
    for (const player of contribuicoesExatas) {
      try {
        // Criar array correto para as contribuições
        const trofeus = player.contribuicoes > 0 ? [`${player.contribuicoes} contribuições`] : [];
        
        const result = await pool.query(`
          UPDATE maritodle_players 
          SET 
            trofeus = $1,
            updated_at = CURRENT_TIMESTAMP
          WHERE nome = $2
        `, [trofeus, player.nome]);
        
        if (result.rowCount > 0) {
          console.log(`✅ ${player.nome} - ${player.contribuicoes} contribuições ${player.contribuicoes === 0 ? '(NENHUMA)' : '✓'}`);
          corrigidos++;
        } else {
          console.log(`❌ ${player.nome} - NÃO ENCONTRADO!`);
        }
      } catch (error) {
        console.log(`💥 ERRO ${player.nome}:`, error.message);
      }
    }
    
    console.log(`\n🎯 RESUMO URGENTE:`);
    console.log(`   ✅ Jogadores corrigidos: ${corrigidos}`);
    console.log(`   📊 Total processado: ${contribuicoesExatas.length}`);
    
    // Verificar os 3 jogadores problemáticos
    const problematicosList = ['Alexandre Guedes', 'Enrique Peña Zauner', 'Daniel Benchimol'];
    
    console.log('\n🔍 VERIFICAÇÃO DOS JOGADORES PROBLEMÁTICOS:');
    for (const nome of problematicosList) {
      const checkResult = await pool.query(`
        SELECT nome, trofeus 
        FROM maritodle_players 
        WHERE nome = $1
      `, [nome]);
      
      if (checkResult.rows.length > 0) {
        const player = checkResult.rows[0];
        console.log(`✅ ${player.nome}: ${JSON.stringify(player.trofeus)}`);
      }
    }
    
    console.log('\n🎉 CONTRIBUIÇÕES CORRIGIDAS! AGORA DEVE FUNCIONAR! 🎉\n');
    
  } catch (error) {
    console.error('💥 ERRO CRÍTICO:', error.message);
  } finally {
    await pool.end();
  }
}

corrigirContribuicoesUrgente(); 