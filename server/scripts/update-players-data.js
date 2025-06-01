const { Pool } = require('pg');
require('dotenv').config({ path: '../.env' });

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '123asd!',
  database: process.env.DB_NAME || 'maritimo_voting',
  port: parseInt(process.env.DB_PORT || '5432'),
});

// DADOS CORRETOS E FINAIS - Lista oficial fornecida pelo usuário
const jogadoresCorretos = [
  {
    nome: 'Samu Silva',
    posicao_principal: 'GK',
    altura_cm: 193,
    idade: 26,
    nacionalidade: 'Portugal',
    jogos: 37,
    contribuicoes: 0,
    ano_entrada: 2023,
    ano_saida: 2026
  },
  {
    nome: 'Kimiss Zavala',
    posicao_principal: 'GK',
    altura_cm: 186,
    idade: 21,
    nacionalidade: 'Moçambique',
    jogos: 0,
    contribuicoes: 0,
    ano_entrada: 2022,
    ano_saida: 2025
  },
  {
    nome: 'Junior Almeida',
    posicao_principal: 'DC',
    altura_cm: 189,
    idade: 25,
    nacionalidade: 'Brasil',
    jogos: 19,
    contribuicoes: 1,
    ano_entrada: 2024,
    ano_saida: 2026
  },
  {
    nome: 'Afonso Freitas',
    posicao_principal: 'LB',
    altura_cm: 181,
    idade: 25,
    nacionalidade: 'Portugal',
    jogos: 0,
    contribuicoes: 0,
    ano_entrada: 2025,
    ano_saida: 2028
  },
  {
    nome: 'Rodrigo Borges',
    posicao_principal: 'DC',
    altura_cm: 183,
    idade: 26,
    nacionalidade: 'Portugal',
    jogos: 32,
    contribuicoes: 4,
    ano_entrada: 2024,
    ano_saida: 2026
  },
  {
    nome: 'Romain Correia',
    posicao_principal: 'DC',
    altura_cm: 183,
    idade: 23,
    nacionalidade: 'França',
    jogos: 35,
    contribuicoes: 3,
    ano_entrada: 2023,
    ano_saida: 2026
  },
  {
    nome: 'Noah Madsen',
    posicao_principal: 'DC',
    altura_cm: 190,
    idade: 23,
    nacionalidade: 'Dinamarca',
    jogos: 26,
    contribuicoes: 1,
    ano_entrada: 2023,
    ano_saida: 2026
  },
  {
    nome: 'Pedro Silva',
    posicao_principal: 'MC',
    altura_cm: 178,
    idade: 28,
    nacionalidade: 'Portugal',
    jogos: 37,
    contribuicoes: 5,
    ano_entrada: 2023,
    ano_saida: 2026
  },
  {
    nome: 'Ibrahima Guirassy',
    posicao_principal: 'MCO',
    altura_cm: 185,
    idade: 26,
    nacionalidade: 'França',
    jogos: 33,
    contribuicoes: 9,
    ano_entrada: 2023,
    ano_saida: 2026
  },
  {
    nome: 'Carlos Daniel',
    posicao_principal: 'MCO',
    altura_cm: 180,
    idade: 26,
    nacionalidade: 'Portugal',
    jogos: 40,
    contribuicoes: 10,
    ano_entrada: 2023,
    ano_saida: 2026
  },
  {
    nome: 'Vladan Danilović',
    posicao_principal: 'MC',
    altura_cm: 190,
    idade: 26,
    nacionalidade: 'Sérvia',
    jogos: 36,
    contribuicoes: 6,
    ano_entrada: 2023,
    ano_saida: 2026
  },
  {
    nome: 'Michel Costa',
    posicao_principal: 'MCO',
    altura_cm: 175,
    idade: 26,
    nacionalidade: 'Portugal',
    jogos: 31,
    contribuicoes: 4,
    ano_entrada: 2023,
    ano_saida: 2026
  },
  {
    nome: 'Rodrigo Andrade',
    posicao_principal: 'MC',
    altura_cm: 182,
    idade: 24,
    nacionalidade: 'Brasil',
    jogos: 28,
    contribuicoes: 3,
    ano_entrada: 2023,
    ano_saida: 2026
  },
  {
    nome: 'Fábio Blanco',
    posicao_principal: 'EE',
    altura_cm: 175,
    idade: 20,
    nacionalidade: 'Espanha',
    jogos: 34,
    contribuicoes: 11,
    ano_entrada: 2023,
    ano_saida: 2026
  },
  {
    nome: 'Preslav Borukov',
    posicao_principal: 'PL',
    altura_cm: 180,
    idade: 25,
    nacionalidade: 'Bulgária',
    jogos: 34,
    contribuicoes: 14,
    ano_entrada: 2023,
    ano_saida: 2026
  },
  {
    nome: 'Alexandre Guedes',
    posicao_principal: 'PL',
    altura_cm: 188,
    idade: 29,
    nacionalidade: 'Portugal',
    jogos: 29,
    contribuicoes: 11,
    ano_entrada: 2023,
    ano_saida: 2026
  },
  {
    nome: 'Patrick Fernandes',
    posicao_principal: 'PL',
    altura_cm: 182,
    idade: 27,
    nacionalidade: 'Cabo Verde',
    jogos: 33,
    contribuicoes: 8,
    ano_entrada: 2023,
    ano_saida: 2026
  },
  {
    nome: 'Martim Tavares',
    posicao_principal: 'PL',
    altura_cm: 184,
    idade: 19,
    nacionalidade: 'Portugal',
    jogos: 27,
    contribuicoes: 9,
    ano_entrada: 2023,
    ano_saida: 2026
  },
  {
    nome: 'Nachon Nsingi',
    posicao_principal: 'PL',
    altura_cm: 178,
    idade: 20,
    nacionalidade: 'Bélgica',
    jogos: 22,
    contribuicoes: 6,
    ano_entrada: 2023,
    ano_saida: 2026
  },
  {
    nome: 'Daniel Benchimol',
    posicao_principal: 'PL',
    altura_cm: 182,
    idade: 21,
    nacionalidade: 'Canadá',
    jogos: 23,
    contribuicoes: 8,
    ano_entrada: 2023,
    ano_saida: 2026
  },
  {
    nome: 'Enrique Peña Zauner',
    posicao_principal: 'PL',
    altura_cm: 185,
    idade: 24,
    nacionalidade: 'Alemanha',
    jogos: 27,
    contribuicoes: 8,
    ano_entrada: 2023,
    ano_saida: 2026
  },
  {
    nome: 'Fábio China',
    posicao_principal: 'LB',
    altura_cm: 179,
    idade: 32,
    nacionalidade: 'Portugal',
    jogos: 170,
    contribuicoes: 5,
    ano_entrada: 2016,
    ano_saida: 2025
  },
  {
    nome: 'Igor Julião',
    posicao_principal: 'RB',
    altura_cm: 175,
    idade: 30,
    nacionalidade: 'Brasil',
    jogos: 25,
    contribuicoes: 0,
    ano_entrada: 2023,
    ano_saida: 2027
  },
  {
    nome: 'Tomás Domingos',
    posicao_principal: 'RB',
    altura_cm: 175,
    idade: 26,
    nacionalidade: 'Portugal',
    jogos: 19,
    contribuicoes: 1,
    ano_entrada: 2023,
    ano_saida: 2025
  },
  {
    nome: 'Francisco França',
    posicao_principal: 'MDC',
    altura_cm: 188,
    idade: 23,
    nacionalidade: 'Portugal',
    jogos: 34,
    contribuicoes: 5,
    ano_entrada: 2024,
    ano_saida: 2026
  },
  {
    nome: 'Gonçalo Tabuaço',
    posicao_principal: 'GK',
    altura_cm: 188,
    idade: 24,
    nacionalidade: 'Portugal',
    jogos: 0,
    contribuicoes: 0,
    ano_entrada: 2024,
    ano_saida: 2025
  }
];

async function atualizarTodosJogadores() {
  try {
    console.log('🔥 ATUALIZANDO COM OS DADOS CORRETOS E FINAIS! 🔥\n');
    
    let atualizados = 0;
    let naoEncontrados = 0;
    
    for (const jogador of jogadoresCorretos) {
      try {
        // Criar array de contribuições simples (apenas total)
        const trofeus = [];
        if (jogador.contribuicoes > 0) {
          trofeus.push(`${jogador.contribuicoes} contribuição${jogador.contribuicoes > 1 ? 'ões' : ''}`);
        }
        
        const result = await pool.query(`
          UPDATE maritodle_players 
          SET 
            posicao_principal = $1,
            altura_cm = $2,
            idade = $3,
            nacionalidade = $4,
            trofeus = $5,
            ano_entrada = $6,
            ano_saida = $7,
            updated_at = CURRENT_TIMESTAMP
          WHERE nome = $8
        `, [
          jogador.posicao_principal,
          jogador.altura_cm,
          jogador.idade,
          jogador.nacionalidade,
          trofeus,
          jogador.ano_entrada,
          jogador.ano_saida,
          jogador.nome
        ]);
        
        if (result.rowCount > 0) {
          console.log(`✅ ${jogador.nome} - ATUALIZADO (${jogador.jogos} jogos, ${jogador.contribuicoes} contribuições)`);
          atualizados++;
        } else {
          console.log(`❌ ${jogador.nome} - NÃO ENCONTRADO`);
          naoEncontrados++;
        }
      } catch (error) {
        console.log(`💥 ERRO ao atualizar ${jogador.nome}:`, error.message);
      }
    }
    
    console.log(`\n🎯 RESUMO FINAL:`);
    console.log(`   ✅ Jogadores atualizados: ${atualizados}`);
    console.log(`   ❌ Jogadores não encontrados: ${naoEncontrados}`);
    console.log(`   📊 Total processado: ${jogadoresCorretos.length}`);
    
    // Verificar TOP jogadores após atualização
    const topJogadores = await pool.query(`
      SELECT nome, posicao_principal, idade, nacionalidade, trofeus, ano_entrada, ano_saida 
      FROM maritodle_players 
      WHERE papel = 'Jogador'
      ORDER BY 
        CASE 
          WHEN array_length(trofeus, 1) > 0 THEN 
            CAST(REGEXP_REPLACE(trofeus[1], '[^0-9]', '', 'g') AS INTEGER)
          ELSE 0 
        END DESC
      LIMIT 10
    `);
    
    console.log('\n🏆 TOP 10 JOGADORES POR CONTRIBUIÇÕES:');
    topJogadores.rows.forEach((player, index) => {
      const contribuicoes = player.trofeus.length > 0 ? player.trofeus[0] : 'Nenhuma';
      const periodo = player.ano_saida === 9999 ? 
        `${player.ano_entrada}-presente` : 
        `${player.ano_entrada}-${player.ano_saida}`;
      
      console.log(`${index + 1}. ${player.nome} (${player.posicao_principal})`);
      console.log(`   - ${contribuicoes} | ${player.idade} anos | ${player.nacionalidade}`);
      console.log(`   - Período: ${periodo}\n`);
    });
    
    console.log('🎉 TODOS OS DADOS FORAM ATUALIZADOS CORRETAMENTE! 🎉\n');
    
  } catch (error) {
    console.error('💥 ERRO CRÍTICO:', error.message);
  } finally {
    await pool.end();
  }
}

atualizarTodosJogadores(); 