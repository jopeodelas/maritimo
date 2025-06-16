import db from '../config/db';

export interface TransferRumorDB {
  id: number;
  unique_id: string;
  player_name: string;
  type: "compra" | "venda" | "renovação";
  club: string;
  value: string;
  status: "rumor" | "negociação" | "confirmado";
  date: string;
  source: string;
  reliability: number;
  description?: string;
  is_main_team: boolean;
  category?: string;
  position?: string;
  is_approved: boolean;
  is_deleted: boolean;
  created_by?: number;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export interface CreateTransferRumorInput {
  unique_id: string;
  player_name: string;
  type: "compra" | "venda" | "renovação";
  club: string;
  value?: string;
  status?: "rumor" | "negociação" | "confirmado";
  date: string;
  source: string;
  reliability?: number;
  description?: string;
  is_main_team?: boolean;
  category?: string;
  position?: string;
  is_approved?: boolean;
  created_by?: number;
}

export interface UpdateTransferRumorInput {
  player_name?: string;
  type?: "compra" | "venda" | "renovação";
  club?: string;
  value?: string;
  status?: "rumor" | "negociação" | "confirmado";
  date?: string;
  source?: string;
  reliability?: number;
  description?: string;
  is_main_team?: boolean;
  category?: string;
  position?: string;
  is_approved?: boolean;
}

export class TransferRumorModel {
  
  // Obter todos os rumores (apenas os não deletados e aprovados)
  static async getAllApproved(): Promise<TransferRumorDB[]> {
    const query = `
      SELECT * FROM transfer_rumors 
      WHERE is_deleted = false AND is_approved = true
      ORDER BY created_at DESC
    `;
    const result = await db.query(query);
    return result.rows;
  }

  // Obter todos os rumores (incluindo não aprovados) para admin
  static async getAllForAdmin(): Promise<TransferRumorDB[]> {
    const query = `
      SELECT * FROM transfer_rumors 
      WHERE is_deleted = false
      ORDER BY created_at DESC
    `;
    const result = await db.query(query);
    return result.rows;
  }

  // Obter rumor por ID
  static async getById(id: number): Promise<TransferRumorDB | null> {
    const query = 'SELECT * FROM transfer_rumors WHERE id = $1 AND is_deleted = false';
    const result = await db.query(query, [id]);
    return result.rows[0] || null;
  }

  // Obter rumor por unique_id
  static async getByUniqueId(uniqueId: string): Promise<TransferRumorDB | null> {
    const query = 'SELECT * FROM transfer_rumors WHERE unique_id = $1 AND is_deleted = false';
    const result = await db.query(query, [uniqueId]);
    return result.rows[0] || null;
  }

  // Criar novo rumor
  static async create(rumor: CreateTransferRumorInput): Promise<TransferRumorDB> {
    const query = `
      INSERT INTO transfer_rumors (
        unique_id, player_name, type, club, value, status, date, source, 
        reliability, description, is_main_team, category, position, 
        is_approved, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING *
    `;
    
    const values = [
      rumor.unique_id,
      rumor.player_name,
      rumor.type,
      rumor.club,
      rumor.value || 'Valor não revelado',
      rumor.status || 'rumor',
      rumor.date,
      rumor.source,
      rumor.reliability || 3,
      rumor.description,
      rumor.is_main_team !== false,
      rumor.category || 'senior',
      rumor.position,
      rumor.is_approved || false,
      rumor.created_by
    ];

    const result = await db.query(query, values);
    return result.rows[0];
  }

  // Atualizar rumor
  static async update(id: number, updates: UpdateTransferRumorInput): Promise<TransferRumorDB | null> {
    const fields = [];
    const values = [];
    let paramCount = 1;

    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) {
        fields.push(`${key} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    }

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    const query = `
      UPDATE transfer_rumors 
      SET ${fields.join(', ')} 
      WHERE id = $${paramCount} AND is_deleted = false
      RETURNING *
    `;
    values.push(id);

    const result = await db.query(query, values);
    return result.rows[0] || null;
  }

  // Soft delete (marcar como deletado)
  static async softDelete(id: number): Promise<boolean> {
    const query = `
      UPDATE transfer_rumors 
      SET is_deleted = true, deleted_at = CURRENT_TIMESTAMP 
      WHERE id = $1 AND is_deleted = false
      RETURNING id
    `;
    const result = await db.query(query, [id]);
    return result.rows.length > 0;
  }

  // Aprovar rumor
  static async approve(id: number): Promise<TransferRumorDB | null> {
    const query = `
      UPDATE transfer_rumors 
      SET is_approved = true 
      WHERE id = $1 AND is_deleted = false
      RETURNING *
    `;
    const result = await db.query(query, [id]);
    return result.rows[0] || null;
  }

  // Desaprovar rumor
  static async disapprove(id: number): Promise<TransferRumorDB | null> {
    const query = `
      UPDATE transfer_rumors 
      SET is_approved = false 
      WHERE id = $1 AND is_deleted = false
      RETURNING *
    `;
    const result = await db.query(query, [id]);
    return result.rows[0] || null;
  }

  // Verificar se já existe rumor com o mesmo unique_id
  static async existsByUniqueId(uniqueId: string): Promise<boolean> {
    const query = 'SELECT id FROM transfer_rumors WHERE unique_id = $1 AND is_deleted = false';
    const result = await db.query(query, [uniqueId]);
    return result.rows.length > 0;
  }

  // Obter estatísticas
  static async getStats(): Promise<any> {
    const query = `
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE type = 'compra') as compras,
        COUNT(*) FILTER (WHERE type = 'venda') as vendas,
        COUNT(*) FILTER (WHERE type = 'renovação') as renovacoes,
        COUNT(*) FILTER (WHERE status = 'rumor') as rumores,
        COUNT(*) FILTER (WHERE status = 'negociação') as negociacoes,
        COUNT(*) FILTER (WHERE status = 'confirmado') as confirmados,
        COUNT(*) FILTER (WHERE is_approved = true) as aprovados,
        COUNT(*) FILTER (WHERE is_approved = false) as pendentes,
        AVG(reliability) as avg_reliability
      FROM transfer_rumors 
      WHERE is_deleted = false
    `;
    const result = await db.query(query);
    return result.rows[0];
  }

  // Migrar rumores existentes da memória para a base de dados
  static async migrateFromMemory(rumorsFromMemory: any[]): Promise<void> {
    for (const rumor of rumorsFromMemory) {
      try {
        // Verificar se já existe
        const exists = await this.existsByUniqueId(rumor.id);
        if (!exists) {
          await this.create({
            unique_id: rumor.id,
            player_name: rumor.player_name,
            type: rumor.type,
            club: rumor.club,
            value: rumor.value,
            status: rumor.status,
            date: rumor.date,
            source: rumor.source,
            reliability: rumor.reliability,
            description: rumor.description,
            is_main_team: rumor.isMainTeam !== false,
            category: rumor.category || 'senior',
            position: rumor.position,
            is_approved: true // Aprovar automaticamente os rumores migrados
          });
        }
      } catch (error) {
        console.error(`Erro ao migrar rumor ${rumor.id}:`, error);
      }
    }
  }
} 