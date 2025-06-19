"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransferRumorModel = void 0;
const db_1 = __importDefault(require("../config/db"));
class TransferRumorModel {
    // Obter todos os rumores (apenas os não deletados e aprovados)
    static getAllApproved() {
        return __awaiter(this, void 0, void 0, function* () {
            const query = `
      SELECT * FROM transfer_rumors 
      WHERE is_deleted = false AND is_approved = true
      ORDER BY created_at DESC
    `;
            const result = yield db_1.default.query(query);
            return result.rows;
        });
    }
    // Obter todos os rumores (incluindo não aprovados) para admin
    static getAllForAdmin() {
        return __awaiter(this, void 0, void 0, function* () {
            const query = `
      SELECT * FROM transfer_rumors 
      WHERE is_deleted = false
      ORDER BY created_at DESC
    `;
            const result = yield db_1.default.query(query);
            return result.rows;
        });
    }
    // Obter rumor por ID
    static getById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = 'SELECT * FROM transfer_rumors WHERE id = $1 AND is_deleted = false';
            const result = yield db_1.default.query(query, [id]);
            return result.rows[0] || null;
        });
    }
    // Obter rumor por unique_id
    static getByUniqueId(uniqueId) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = 'SELECT * FROM transfer_rumors WHERE unique_id = $1 AND is_deleted = false';
            const result = yield db_1.default.query(query, [uniqueId]);
            return result.rows[0] || null;
        });
    }
    // Criar novo rumor
    static create(rumor) {
        return __awaiter(this, void 0, void 0, function* () {
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
            const result = yield db_1.default.query(query, values);
            return result.rows[0];
        });
    }
    // Atualizar rumor
    static update(id, updates) {
        return __awaiter(this, void 0, void 0, function* () {
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
            const result = yield db_1.default.query(query, values);
            return result.rows[0] || null;
        });
    }
    // Soft delete (marcar como deletado)
    static softDelete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = `
      UPDATE transfer_rumors 
      SET is_deleted = true, deleted_at = CURRENT_TIMESTAMP 
      WHERE id = $1 AND is_deleted = false
      RETURNING id
    `;
            const result = yield db_1.default.query(query, [id]);
            return result.rows.length > 0;
        });
    }
    // Aprovar rumor
    static approve(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = `
      UPDATE transfer_rumors 
      SET is_approved = true 
      WHERE id = $1 AND is_deleted = false
      RETURNING *
    `;
            const result = yield db_1.default.query(query, [id]);
            return result.rows[0] || null;
        });
    }
    // Desaprovar rumor
    static disapprove(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = `
      UPDATE transfer_rumors 
      SET is_approved = false 
      WHERE id = $1 AND is_deleted = false
      RETURNING *
    `;
            const result = yield db_1.default.query(query, [id]);
            return result.rows[0] || null;
        });
    }
    // Verificar se já existe rumor com o mesmo unique_id
    static existsByUniqueId(uniqueId) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = 'SELECT id FROM transfer_rumors WHERE unique_id = $1 AND is_deleted = false';
            const result = yield db_1.default.query(query, [uniqueId]);
            return result.rows.length > 0;
        });
    }
    // Obter estatísticas
    static getStats() {
        return __awaiter(this, void 0, void 0, function* () {
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
            const result = yield db_1.default.query(query);
            return result.rows[0];
        });
    }
    // Migrar rumores existentes da memória para a base de dados
    static migrateFromMemory(rumorsFromMemory) {
        return __awaiter(this, void 0, void 0, function* () {
            for (const rumor of rumorsFromMemory) {
                try {
                    // Verificar se já existe
                    const exists = yield this.existsByUniqueId(rumor.id);
                    if (!exists) {
                        yield this.create({
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
                }
                catch (error) {
                    console.error(`Erro ao migrar rumor ${rumor.id}:`, error);
                }
            }
        });
    }
}
exports.TransferRumorModel = TransferRumorModel;
