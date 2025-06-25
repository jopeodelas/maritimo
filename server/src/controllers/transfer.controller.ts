import { Request, Response } from 'express';
import { transferService } from '../services/transferService';

// PERFORMANCE: Simple cache for transfer rumors
let transferRumorsCache: any = null;
let transferRumorsCacheTime = 0;
const TRANSFER_CACHE_DURATION = 60_000; // 1 minute

export const getTransferRumors = async (req: Request, res: Response) => {
  try {
    console.time('getTransferRumors');
    console.log('🔄 TRANSFER API: Getting transfer rumors with filters...');
    
    const { 
      includeYouth = 'false', 
      includeStaff = 'false',
      includeCoaches = 'true',
      minReliability = '0',
      category 
    } = req.query;

    const now = Date.now();
    const cacheKey = JSON.stringify(req.query);
    
    // PERFORMANCE: Check cache first (only for simple queries without complex filters)
    if (!category && minReliability === '0' && transferRumorsCache && (now - transferRumorsCacheTime) < TRANSFER_CACHE_DURATION) {
      console.log(`🔄 PERFORMANCE: Serving transfer rumors from cache`);
      console.timeEnd('getTransferRumors');
      
      res.setHeader('X-Cache-Status', 'HIT');
      
      // Apply filters to cached data
      let cachedRumors = transferRumorsCache;
      
      if (includeYouth === 'false') {
        cachedRumors = cachedRumors.filter((rumor: any) => rumor.category !== 'youth');
      }
      if (includeStaff === 'false') {
        cachedRumors = cachedRumors.filter((rumor: any) => rumor.category !== 'staff');
      }
      if (includeCoaches === 'false') {
        cachedRumors = cachedRumors.filter((rumor: any) => rumor.category !== 'coach');
      }
      
      res.json({
        success: true,
        data: cachedRumors,
        filters: {
          includeYouth: includeYouth === 'true',
          includeStaff: includeStaff === 'true',
          includeCoaches: includeCoaches === 'true',
          minReliability: parseInt(minReliability as string),
          category: category || 'all'
        }
      });
      return;
    }

    console.log('🔄 PERFORMANCE: Cache miss - fetching transfer rumors...');
    
    // Obter rumores usando a lógica unificada (BD com fallback)
    let rumors = await transferService.getRumors();
    
    // Update cache only for basic queries
    if (!category && minReliability === '0') {
      transferRumorsCache = rumors;
      transferRumorsCacheTime = now;
      console.log('🔄 PERFORMANCE: Transfer rumors cached');
    }

    // Apply additional filters based on query parameters
    if (includeYouth === 'false') {
      rumors = rumors.filter(rumor => rumor.category !== 'youth');
    }

    if (includeStaff === 'false') {
      rumors = rumors.filter(rumor => rumor.category !== 'staff');
    }

    if (includeCoaches === 'false') {
      rumors = rumors.filter(rumor => rumor.category !== 'coach');
    }

    if (minReliability) {
      const minRel = parseInt(minReliability as string);
      rumors = rumors.filter(rumor => rumor.reliability >= minRel);
    }

    if (category) {
      rumors = rumors.filter(rumor => rumor.category === category);
    }

    console.log(`🔄 TRANSFER API: Returning ${rumors.length} filtered transfer rumors`);
    console.timeEnd('getTransferRumors');
    
    res.setHeader('X-Cache-Status', 'MISS');
    res.json({
      success: true,
      data: rumors,
      filters: {
        includeYouth: includeYouth === 'true',
        includeStaff: includeStaff === 'true',
        includeCoaches: includeCoaches === 'true',
        minReliability: parseInt(minReliability as string),
        category: category || 'all'
      }
    });
  } catch (error) {
    console.error('❌ TRANSFER API Error:', error);
    console.timeEnd('getTransferRumors');
    res.status(500).json({ 
      error: 'Failed to fetch transfer rumors',
      message: 'Unable to retrieve transfer information at this time'
    });
  }
};

export const getTransferStats = async (req: Request, res: Response) => {
  try {
    const stats = await transferService.getStats();
    const detailedStats = await transferService.getDetailedStats();
    
    res.json({
      success: true,
      data: {
        ...stats,
        detailed: detailedStats
      }
    });
  } catch (error) {
    console.error('Error fetching transfer stats:', error);
    res.status(500).json({ 
      error: 'Failed to fetch transfer statistics',
      message: 'Unable to retrieve statistics at this time'
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
    const { player_name, type, club, value, status, source, reliability, description } = req.body;

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
      message: 'Unable to add rumor at this time'
    });
  }
};

// NEW: Get rumor quality report
export const getQualityReport = async (req: Request, res: Response) => {
  try {
    const report = await transferService.getQualityReport();
    
    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    console.error('Error fetching quality report:', error);
    res.status(500).json({
      error: 'Failed to fetch quality report',
      message: 'Unable to retrieve quality information at this time'
    });
  }
};

// NEW: Clean duplicate rumors
export const cleanDuplicates = async (req: Request, res: Response) => {
  try {
    const result = await transferService.cleanDuplicateRumors();
    
    res.json({
      success: true,
      message: `Removed ${result.removedCount} duplicate rumors`,
      data: {
        removedCount: result.removedCount,
        remainingCount: result.remainingCount
      }
    });
  } catch (error) {
    console.error('Error cleaning duplicates:', error);
    res.status(500).json({
      error: 'Failed to clean duplicates',
      message: 'Unable to clean duplicates at this time'
    });
  }
}; 