import { Router } from 'express';
import { auth } from '../middleware/auth.middleware';
import { adminAuth } from '../middleware/admin.middleware';
import { 
  getAllRumorsForAdmin,
  createRumor,
  updateRumor,
  deleteRumor,
  approveRumor,
  disapproveRumor,
  getAdminStats,
  migrateRumorsFromMemory
} from '../controllers/transfer-admin.controller';

const router = Router();

// Todas as rotas necessitam autenticação e privilégios de admin
router.use(auth);
router.use(adminAuth);

// Obter todos os rumores (incluindo não aprovados)
router.get('/rumors', getAllRumorsForAdmin);

// Obter estatísticas para admin
router.get('/stats', getAdminStats);

// Criar novo rumor
router.post('/rumors', createRumor);

// Atualizar rumor existente
router.put('/rumors/:id', updateRumor);

// Remover rumor (soft delete)
router.delete('/rumors/:id', deleteRumor);

// Aprovar rumor
router.post('/rumors/:id/approve', approveRumor);

// Desaprovar rumor
router.post('/rumors/:id/disapprove', disapproveRumor);

// Migrar rumores da memória para a base de dados (executar uma vez)
router.post('/migrate', migrateRumorsFromMemory);

export default router; 