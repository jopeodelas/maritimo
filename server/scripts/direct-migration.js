// Carregar variáveis de ambiente
require('dotenv').config();

const { Pool } = require('pg');

// Configuração da base de dados
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'maritimo_voting',
  password: process.env.DB_PASSWORD || '123asd!',
  port: process.env.DB_PORT || 5432,
});

// Dados dos rumores que estão na memória (baseado na imagem)
const rumorsToMigrate = [
  {
    unique_id: 'vitor_matos_2024',
    player_name: 'Vítor Matos',
    type: 'compra',
    club: 'CS Marítimo',
    value: 'Valor não revelado',
    status: 'confirmado',
    date: '2024-01-06',
    source: 'Google News',
    reliability: 5,
    description: 'Oficial: Vítor Matos é o novo treinador do Marítimo - Record',
    is_main_team: true,
    category: 'coach',
    position: null,
    is_approved: true,
    created_by: null
  },
  {
    unique_id: 'patrick_fernandes_2024',
    player_name: 'Patrick Fernandes',
    type: 'compra',
    club: 'Destino a confirmar',
    value: 'Valor não revelado',
    status: 'rumor',
    date: '2024-01-06',
    source: 'Google News',
    reliability: 3,
    description: 'Internacional cabo-verdiano Patrick Fernandes deixa Marítimo para assinar pelos romenos do Otelul Galati - Expresso das Ilhas',
    is_main_team: true,
    category: 'senior',
    position: null,
    is_approved: true,
    created_by: null
  }
];

async function directMigration() {
  try {
    console.log('🔄 Executando migração direta dos rumores...');
    
    for (const rumor of rumorsToMigrate) {
      try {
        // Verificar se já existe
        const existsQuery = 'SELECT id FROM transfer_rumors WHERE unique_id = $1';
        const existsResult = await pool.query(existsQuery, [rumor.unique_id]);
        
        if (existsResult.rows.length > 0) {
          console.log(`⏭️ Rumor ${rumor.player_name} já existe, a saltar...`);
          continue;
        }
        
        // Inserir rumor
        const insertQuery = `
          INSERT INTO transfer_rumors (
            unique_id, player_name, type, club, value, status, date, source, 
            reliability, description, is_main_team, category, position, 
            is_approved, created_by
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
          RETURNING id, player_name
        `;
        
        const values = [
          rumor.unique_id,
          rumor.player_name,
          rumor.type,
          rumor.club,
          rumor.value,
          rumor.status,
          rumor.date,
          rumor.source,
          rumor.reliability,
          rumor.description,
          rumor.is_main_team,
          rumor.category,
          rumor.position,
          rumor.is_approved,
          rumor.created_by
        ];
        
        const result = await pool.query(insertQuery, values);
        console.log(`✅ Migrado: ${result.rows[0].player_name} (ID: ${result.rows[0].id})`);
        
      } catch (error) {
        console.error(`❌ Erro ao migrar ${rumor.player_name}:`, error.message);
      }
    }
    
    // Verificar quantos rumores existem agora
    const countQuery = 'SELECT COUNT(*) as total FROM transfer_rumors WHERE is_deleted = false';
    const countResult = await pool.query(countQuery);
    const total = countResult.rows[0].total;
    
    console.log(`📊 Total de rumores na base de dados: ${total}`);
    console.log('✅ Migração direta concluída!');
    
  } catch (error) {
    console.error('❌ Erro na migração direta:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  directMigration()
    .then(() => {
      console.log('🎉 Migração direta concluída com sucesso!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Falha na migração direta:', error);
      process.exit(1);
    });
}

module.exports = { directMigration }; 