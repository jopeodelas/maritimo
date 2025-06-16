import { Request, Response } from 'express';
import { transferService } from '../services/transferService';
import { TransferRumorModel } from '../models/transfer-rumor.model';

// Obter todos os rumores para admin (incluindo não aprovados)
export const getAllRumorsForAdmin = async (req: Request, res: Response) => {
  try {
    const rumors = await transferService.getAllRumorsFromDB();
    
    res.json({
      success: true,
      data: rumors,
      total: rumors.length
    });
  } catch (error) {
    console.error('Erro ao obter rumores para admin:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      message: 'Não foi possível obter os rumores'
    });
  }
};

// Criar novo rumor
export const createRumor = async (req: Request, res: Response) => {
  try {
    const { player_name, type, club, value, status, source, reliability, description, category, position } = req.body;
    const userId = (req as any).user?.id;

    // Validações básicas
    if (!player_name || !type || !club) {
      return res.status(400).json({
        success: false,
        error: 'Campos obrigatórios em falta',
        message: 'Nome do jogador, tipo e clube são obrigatórios'
      });
    }

    if (!['compra', 'venda', 'renovação'].includes(type)) {
      return res.status(400).json({
        success: false,
        error: 'Tipo inválido',
        message: 'Tipo deve ser: compra, venda ou renovação'
      });
    }

    if (status && !['rumor', 'negociação', 'confirmado'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Status inválido',
        message: 'Status deve ser: rumor, negociação ou confirmado'
      });
    }

    const newRumor = await transferService.createRumorInDB({
      player_name,
      type,
      club,
      value: value || 'Valor não revelado',
      status: status || 'rumor',
      source: source || 'Admin',
      reliability: reliability || 5, // Admin rumors get high reliability
      description,
      category: category || 'senior',
      position
    }, userId);

    res.status(201).json({
      success: true,
      message: 'Rumor criado com sucesso',
      data: newRumor
    });
  } catch (error) {
    console.error('Erro ao criar rumor:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      message: 'Não foi possível criar o rumor'
    });
  }
};

// Atualizar rumor existente
export const updateRumor = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Validar ID
    const rumorId = parseInt(id);
    if (isNaN(rumorId)) {
      return res.status(400).json({
        success: false,
        error: 'ID inválido',
        message: 'O ID do rumor deve ser um número'
      });
    }

    // Verificar se o rumor existe
    const existingRumor = await TransferRumorModel.getById(rumorId);
    if (!existingRumor) {
      return res.status(404).json({
        success: false,
        error: 'Rumor não encontrado',
        message: 'O rumor especificado não existe'
      });
    }

    const updatedRumor = await transferService.updateRumorInDB(rumorId, updates);

    if (updatedRumor) {
      res.json({
        success: true,
        message: 'Rumor atualizado com sucesso',
        data: updatedRumor
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Rumor não encontrado',
        message: 'O rumor especificado não existe'
      });
    }
  } catch (error) {
    console.error('Erro ao atualizar rumor:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      message: 'Não foi possível atualizar o rumor'
    });
  }
};

// Remover rumor (soft delete)
export const deleteRumor = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Validar ID
    const rumorId = parseInt(id);
    if (isNaN(rumorId)) {
      return res.status(400).json({
        success: false,
        error: 'ID inválido',
        message: 'O ID do rumor deve ser um número'
      });
    }

    const deleted = await transferService.deleteRumorFromDB(rumorId);

    if (deleted) {
      res.json({
        success: true,
        message: 'Rumor removido com sucesso'
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Rumor não encontrado',
        message: 'O rumor especificado não existe'
      });
    }
  } catch (error) {
    console.error('Erro ao remover rumor:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      message: 'Não foi possível remover o rumor'
    });
  }
};

// Aprovar rumor
export const approveRumor = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Validar ID
    const rumorId = parseInt(id);
    if (isNaN(rumorId)) {
      return res.status(400).json({
        success: false,
        error: 'ID inválido',
        message: 'O ID do rumor deve ser um número'
      });
    }

    const approvedRumor = await transferService.approveRumor(rumorId);

    if (approvedRumor) {
      res.json({
        success: true,
        message: 'Rumor aprovado com sucesso',
        data: approvedRumor
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Rumor não encontrado',
        message: 'O rumor especificado não existe'
      });
    }
  } catch (error) {
    console.error('Erro ao aprovar rumor:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      message: 'Não foi possível aprovar o rumor'
    });
  }
};

// Desaprovar rumor
export const disapproveRumor = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Validar ID
    const rumorId = parseInt(id);
    if (isNaN(rumorId)) {
      return res.status(400).json({
        success: false,
        error: 'ID inválido',
        message: 'O ID do rumor deve ser um número'
      });
    }

    const disapprovedRumor = await transferService.disapproveRumor(rumorId);

    if (disapprovedRumor) {
      res.json({
        success: true,
        message: 'Rumor desaprovado com sucesso',
        data: disapprovedRumor
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Rumor não encontrado',
        message: 'O rumor especificado não existe'
      });
    }
  } catch (error) {
    console.error('Erro ao desaprovar rumor:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      message: 'Não foi possível desaprovar o rumor'
    });
  }
};

// Obter estatísticas para admin
export const getAdminStats = async (req: Request, res: Response) => {
  try {
    const stats = await transferService.getStatsFromDB();
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Erro ao obter estatísticas:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      message: 'Não foi possível obter as estatísticas'
    });
  }
};

// Migrar rumores da memória para a base de dados
export const migrateRumorsFromMemory = async (req: Request, res: Response) => {
  try {
    // Obter rumores atuais da memória
    const memoryRumors = await transferService.getRumors();
    
    // Migrar para a base de dados
    await TransferRumorModel.migrateFromMemory(memoryRumors);
    
    res.json({
      success: true,
      message: `${memoryRumors.length} rumores migrados da memória para a base de dados`,
      migrated: memoryRumors.length
    });
  } catch (error) {
    console.error('Erro na migração:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      message: 'Não foi possível migrar os rumores'
    });
  }
}; 