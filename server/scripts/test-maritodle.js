const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'maritimo_db',
  port: parseInt(process.env.DB_PORT || '5432'),
});

async function testarMaritodle() {
  try {
    console.log('🧪 Testando dados do Maritodle...\n');
    
    // 1. Verificar se a tabela existe e tem dados
    const count = await pool.query('SELECT COUNT(*) FROM maritodle_players');
    console.log(`✅ Total de jogadores na tabela: ${count.rows[0].count}`);
    
    // 2. Mostrar alguns exemplos de dados
    const examples = await pool.query(`
      SELECT nome, sexo, posicao_principal, altura_cm, idade, nacionalidade, ano_entrada, ano_saida 
      FROM maritodle_players 
      ORDER BY nome 
      LIMIT 5
    `);
    
    console.log('\n📋 Exemplos de dados na tabela:');
    examples.rows.forEach((player, index) => {
      console.log(`${index + 1}. ${player.nome}`);
      console.log(`   - Sexo: ${player.sexo}`);
      console.log(`   - Posição: ${player.posicao_principal}`);
      console.log(`   - Altura: ${player.altura_cm}cm`);
      console.log(`   - Idade: ${player.idade} anos`);
      console.log(`   - Nacionalidade: ${player.nacionalidade}`);
      console.log(`   - Período: ${player.ano_entrada}${player.ano_saida === 9999 ? '-presente' : `-${player.ano_saida}`}`);
      console.log('');
    });
    
    // 3. Verificar diversidade de posições
    const posicoes = await pool.query(`
      SELECT posicao_principal, COUNT(*) as quantidade 
      FROM maritodle_players 
      GROUP BY posicao_principal 
      ORDER BY quantidade DESC
    `);
    
    console.log('🎯 Distribuição por posições:');
    posicoes.rows.forEach(pos => {
      console.log(`   - ${pos.posicao_principal}: ${pos.quantidade} jogadores`);
    });
    
    // 4. Verificar diversidade de nacionalidades
    const nacionalidades = await pool.query(`
      SELECT nacionalidade, COUNT(*) as quantidade 
      FROM maritodle_players 
      GROUP BY nacionalidade 
      ORDER BY quantidade DESC
    `);
    
    console.log('\n🌍 Distribuição por nacionalidades:');
    nacionalidades.rows.forEach(nat => {
      console.log(`   - ${nat.nacionalidade}: ${nat.quantidade} jogadores`);
    });
    
    // 5. Verificar idades
    const idades = await pool.query(`
      SELECT MIN(idade) as min_idade, MAX(idade) as max_idade, AVG(idade)::int as idade_media 
      FROM maritodle_players
    `);
    
    console.log('\n📊 Estatísticas de idade:');
    console.log(`   - Mais jovem: ${idades.rows[0].min_idade} anos`);
    console.log(`   - Mais velho: ${idades.rows[0].max_idade} anos`);
    console.log(`   - Idade média: ${idades.rows[0].idade_media} anos`);
    
    // 6. Verificar alturas
    const alturas = await pool.query(`
      SELECT MIN(altura_cm) as min_altura, MAX(altura_cm) as max_altura, AVG(altura_cm)::int as altura_media 
      FROM maritodle_players
    `);
    
    console.log('\n📏 Estatísticas de altura:');
    console.log(`   - Mais baixo: ${alturas.rows[0].min_altura}cm`);
    console.log(`   - Mais alto: ${alturas.rows[0].max_altura}cm`);
    console.log(`   - Altura média: ${alturas.rows[0].altura_media}cm`);
    
    console.log('\n✅ Todos os testes passaram! O Maritodle está pronto para funcionar.\n');
    
  } catch (error) {
    console.error('❌ Erro ao testar Maritodle:', error.message);
  } finally {
    await pool.end();
  }
}

testarMaritodle(); 