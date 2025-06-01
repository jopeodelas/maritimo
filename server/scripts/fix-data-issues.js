const { Pool } = require('pg');
require('dotenv').config({ path: '../.env' });

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '123asd!',
  database: process.env.DB_NAME || 'maritimo_voting',
  port: parseInt(process.env.DB_PORT || '5432'),
});

async function verificarECorrigir() {
  try {
    console.log('🔍 Verificando dados do Daniel Benchimol...\n');
    
    // Verificar dados atuais do Daniel Benchimol
    const result = await pool.query(`
      SELECT nome, sexo, posicao_principal, altura_cm, idade, nacionalidade, trofeus, ano_entrada, ano_saida 
      FROM maritodle_players 
      WHERE nome = 'Daniel Benchimol'
    `);
    
    if (result.rows.length > 0) {
      const player = result.rows[0];
      console.log('📊 Dados atuais do Daniel Benchimol:');
      console.log(`   - Nome: ${player.nome}`);
      console.log(`   - Campo "sexo" (jogos): ${player.sexo}`);
      console.log(`   - Posição: ${player.posicao_principal}`);
      console.log(`   - Altura: ${player.altura_cm}cm`);
      console.log(`   - Idade: ${player.idade} anos`);
      console.log(`   - Nacionalidade: ${player.nacionalidade}`);
      console.log(`   - Contribuições: ${player.trofeus}`);
      console.log(`   - Período: ${player.ano_entrada}-${player.ano_saida}\n`);
    }
    
    console.log('🔧 Corrigindo dados...\n');
    
    // Corrigir o campo "sexo" que representa o número de jogos
    // O problema é que o campo "sexo" não está sendo atualizado com o número de jogos
    
    // Lista de correções para o campo "sexo" (jogos)
    const correcoes = [
      { nome: 'Daniel Benchimol', jogos: '23 jogos', contribuicoes: ['8 contribuições'] },
      { nome: 'Samu Silva', jogos: '37 jogos', contribuicoes: [] },
      { nome: 'Kimiss Zavala', jogos: '0 jogos', contribuicoes: [] },
      { nome: 'Junior Almeida', jogos: '19 jogos', contribuicoes: ['1 contribuição'] },
      { nome: 'Afonso Freitas', jogos: '0 jogos', contribuicoes: [] },
      { nome: 'Rodrigo Borges', jogos: '32 jogos', contribuicoes: ['4 contribuições'] },
      { nome: 'Romain Correia', jogos: '35 jogos', contribuicoes: ['3 contribuições'] },
      { nome: 'Noah Madsen', jogos: '26 jogos', contribuicoes: ['1 contribuição'] },
      { nome: 'Pedro Silva', jogos: '37 jogos', contribuicoes: ['5 contribuições'] },
      { nome: 'Ibrahima Guirassy', jogos: '33 jogos', contribuicoes: ['9 contribuições'] },
      { nome: 'Carlos Daniel', jogos: '40 jogos', contribuicoes: ['10 contribuições'] },
      { nome: 'Vladan Danilović', jogos: '36 jogos', contribuicoes: ['6 contribuições'] },
      { nome: 'Michel Costa', jogos: '31 jogos', contribuicoes: ['4 contribuições'] },
      { nome: 'Rodrigo Andrade', jogos: '28 jogos', contribuicoes: ['3 contribuições'] },
      { nome: 'Fábio Blanco', jogos: '34 jogos', contribuicoes: ['11 contribuições'] },
      { nome: 'Preslav Borukov', jogos: '34 jogos', contribuicoes: ['14 contribuições'] },
      { nome: 'Alexandre Guedes', jogos: '29 jogos', contribuicoes: ['11 contribuições'] },
      { nome: 'Patrick Fernandes', jogos: '33 jogos', contribuicoes: ['8 contribuições'] },
      { nome: 'Martim Tavares', jogos: '27 jogos', contribuicoes: ['9 contribuições'] },
      { nome: 'Nachon Nsingi', jogos: '22 jogos', contribuicoes: ['6 contribuições'] },
      { nome: 'Enrique Peña Zauner', jogos: '27 jogos', contribuicoes: ['8 contribuições'] },
      { nome: 'Fábio China', jogos: '170 jogos', contribuicoes: ['5 contribuições'] },
      { nome: 'Igor Julião', jogos: '25 jogos', contribuicoes: [] },
      { nome: 'Tomás Domingos', jogos: '19 jogos', contribuicoes: ['1 contribuição'] },
      { nome: 'Francisco França', jogos: '34 jogos', contribuicoes: ['5 contribuições'] },
      { nome: 'Gonçalo Tabuaço', jogos: '0 jogos', contribuicoes: [] }
    ];
    
    let corrigidos = 0;
    
    for (const correcao of correcoes) {
      try {
        // Corrigir ano_saida para 9999 se for > 2025 (ainda estão no clube)
        let anoSaida = 9999; // Por defeito, considerar que ainda estão no clube
        
        // Exceções: jogadores que saem em 2025
        if (['Kimiss Zavala', 'Fábio China', 'Tomás Domingos', 'Gonçalo Tabuaço'].includes(correcao.nome)) {
          anoSaida = 2025;
        }
        
        const updateResult = await pool.query(`
          UPDATE maritodle_players 
          SET 
            sexo = $1,
            trofeus = $2,
            ano_saida = $3,
            updated_at = CURRENT_TIMESTAMP
          WHERE nome = $4
        `, [
          correcao.jogos,
          correcao.contribuicoes,
          anoSaida,
          correcao.nome
        ]);
        
        if (updateResult.rowCount > 0) {
          const periodo = anoSaida === 9999 ? 'presente' : anoSaida;
          console.log(`✅ ${correcao.nome} - ${correcao.jogos}, ${correcao.contribuicoes.length > 0 ? correcao.contribuicoes[0] : 'sem contribuições'}, período corrigido para mostrar "presente"`);
          corrigidos++;
        }
      } catch (error) {
        console.log(`❌ Erro ao corrigir ${correcao.nome}:`, error.message);
      }
    }
    
    console.log(`\n📊 Resumo das correções:`);
    console.log(`   ✅ Jogadores corrigidos: ${corrigidos}`);
    console.log(`   📝 Total processado: ${correcoes.length}`);
    
    // Verificar Daniel Benchimol novamente
    const resultFinal = await pool.query(`
      SELECT nome, sexo, posicao_principal, altura_cm, idade, nacionalidade, trofeus, ano_entrada, ano_saida 
      FROM maritodle_players 
      WHERE nome = 'Daniel Benchimol'
    `);
    
    if (resultFinal.rows.length > 0) {
      const player = resultFinal.rows[0];
      console.log('\n✅ Dados corrigidos do Daniel Benchimol:');
      console.log(`   - Nome: ${player.nome}`);
      console.log(`   - Campo "sexo" (jogos): ${player.sexo}`);
      console.log(`   - Posição: ${player.posicao_principal}`);
      console.log(`   - Nacionalidade: ${player.nacionalidade}`);
      console.log(`   - Contribuições: ${player.trofeus}`);
      console.log(`   - Período: ${player.ano_entrada}-${player.ano_saida === 9999 ? 'presente' : player.ano_saida}`);
    }
    
    console.log('\n🎉 Correções concluídas! Daniel Benchimol agora tem 23 jogos e períodos corretos!\n');
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await pool.end();
  }
}

verificarECorrigir(); 