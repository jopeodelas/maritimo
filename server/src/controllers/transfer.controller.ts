import { Request, Response } from 'express';
import { transferService } from '../services/transferService';

export const getTransferRumors = async (req: Request, res: Response) => {
  try {
    const rumors = await transferService.getRumors();
    res.json({
      success: true,
      data: rumors
    });
  } catch (error) {
    console.error('Error fetching transfer rumors:', error);
    res.status(500).json({ 
      error: 'Failed to fetch transfer rumors',
      message: 'Unable to retrieve transfer information at this time'
    });
  }
};

export const getTransferStats = async (req: Request, res: Response) => {
  try {
    const stats = await transferService.getStats();
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching transfer stats:', error);
    res.status(500).json({ 
      error: 'Failed to fetch transfer statistics',
      message: 'Unable to retrieve transfer statistics at this time'
    });
  }
};

export const refreshTransferRumors = async (req: Request, res: Response) => {
  try {
    const rumors = await transferService.refreshRumors();
    res.json({
      success: true,
      message: 'Transfer rumors refreshed successfully',
      count: rumors.length,
      data: rumors
    });
  } catch (error) {
    console.error('Error refreshing transfer rumors:', error);
    res.status(500).json({ 
      error: 'Failed to refresh transfer rumors',
      message: 'Unable to update transfer information at this time'
    });
  }
};

export const addManualTransferRumor = async (req: Request, res: Response) => {
  try {
    const {
      player_name,
      type,
      club,
      value,
      status,
      source,
      reliability,
      description
    } = req.body;

    // Validate required fields
    if (!player_name || !type || !club) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'player_name, type, and club are required'
      });
    }

    // Validate type
    if (!['compra', 'venda', 'renovação'].includes(type)) {
      return res.status(400).json({
        error: 'Invalid transfer type',
        message: 'type must be either "compra", "venda", or "renovação"'
      });
    }

    // Validate status
    if (status && !['rumor', 'negociação', 'confirmado'].includes(status)) {
      return res.status(400).json({
        error: 'Invalid status',
        message: 'status must be one of: rumor, negociação, confirmado'
      });
    }

    // Validate reliability
    if (reliability && (reliability < 1 || reliability > 5)) {
      return res.status(400).json({
        error: 'Invalid reliability',
        message: 'reliability must be between 1 and 5'
      });
    }

    const newRumor = await transferService.addManualRumor({
      player_name,
      type,
      club,
      value: value || 'Valor não revelado',
      status: status || 'rumor',
      source: source || 'Manual',
      reliability: reliability || 3,
      description
    }, req);

    res.status(201).json({
      success: true,
      message: 'Transfer rumor added successfully',
      data: newRumor
    });
  } catch (error) {
    console.error('Error adding manual transfer rumor:', error);
    res.status(500).json({ 
      error: 'Failed to add transfer rumor',
      message: 'Unable to add transfer rumor at this time'
    });
  }
}; 