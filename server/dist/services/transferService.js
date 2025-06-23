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
Object.defineProperty(exports, "__esModule", { value: true });
exports.transferService = void 0;
const realNewsService_1 = require("./realNewsService");
const transfer_rumor_model_1 = require("../models/transfer-rumor.model");
const RELIABILITY_THRESHOLD = 0;
class TransferService {
    constructor() {
        this.rumors = [];
        this.lastUpdate = null;
        this.isUpdating = false;
        // Cache for duplicate detection
        this.rumorSignatures = new Set();
        this.contentHashes = new Set();
        // Known main team players (should be moved to database in future)
        this.CURRENT_MAIN_TEAM_PLAYERS = [
            'romain correia', 'rodrigo borges', 'afonso freitas', 'igor julião',
            'noah madsen', 'tomas domingos', 'fábio china', 'carlos daniel',
            'pedro silva', 'michel costa', 'rodrigo andrade', 'vladan danilovic',
            'ibrahima guirassy', 'fabio blanco', 'preslav borukov', 'alexandre guedes',
            'vitor costa', 'joão afonso', 'josé brígido', 'diogo mendes',
            'edgar costa', 'martim tavares', 'renato alves', 'bruno gomes'
        ];
        // Staff and management names to filter out (UPDATED - separated coaches from staff)
        this.STAFF_AND_MANAGEMENT = [
            'administração', 'direção', 'presidente', 'adjunto',
            'preparador físico', 'fisioterapeuta', 'team manager',
            'massagista', 'kitman', 'segurança', 'jardineiro',
            'administrativa', 'secretária', 'rececionista'
        ];
        // NEW: Main team coaches (current and potential)
        this.MAIN_TEAM_COACHES = [
            'vitor matos', 'vítor matos', 'vasco santos', 'joão henriques',
            'ricardo sousa', 'treinador principal', 'técnico principal',
            'novo treinador', 'novo técnico', 'comandante técnico'
        ];
        // Youth/academy keywords to filter appropriately
        this.YOUTH_KEYWORDS = [
            'sub-15', 'sub-17', 'sub-19', 'sub-21', 'sub-23', 'juvenis', 'juniores',
            'academia', 'formação', 'escalões jovens', 'youth', 'academy'
        ];
        // NEW: Coach-related keywords
        this.COACH_KEYWORDS = [
            'treinador', 'técnico', 'comandante técnico', 'mister',
            'comando técnico', 'staff técnico', 'equipa técnica',
            'assume funções', 'toma posse', 'inicia funções',
            'apresentado', 'oficializado', 'nomeado', 'escolhido'
        ];
        this.initializeDefaultRumors();
        this.updateRumors();
        this.migrateToDatabase();
    }
    initializeDefaultRumors() {
        // Initialize with some realistic rumors
        this.rumors = [];
        this.rumorSignatures.clear();
        this.contentHashes.clear();
    }
    getRumors() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Primeiro, tentar buscar da base de dados
                const dbRumors = yield this.getRumorsFromDB();
                if (dbRumors.length > 0) {
                    return dbRumors;
                }
                // Fallback para o sistema antigo se a base de dados estiver vazia
                if (!this.lastUpdate || Date.now() - this.lastUpdate.getTime() > 60 * 60 * 1000) {
                    yield this.updateRumors();
                    yield this.saveNewRumorsToDB(); // Guardar na base de dados
                }
                // Return main team rumors including coaches
                return this.rumors.filter(rumor => rumor.isMainTeam !== false || rumor.category === 'coach');
            }
            catch (error) {
                console.error('Error fetching rumors from database, using fallback:', error);
                // Fallback para o sistema antigo em caso de erro
                if (!this.lastUpdate || Date.now() - this.lastUpdate.getTime() > 60 * 60 * 1000) {
                    yield this.updateRumors();
                }
                return this.rumors.filter(rumor => rumor.isMainTeam !== false || rumor.category === 'coach');
            }
        });
    }
    refreshRumors() {
        return __awaiter(this, void 0, void 0, function* () {
            // Primeiro, atualizar com novos rumores do sistema de scraping
            yield this.updateRumors();
            // Apply corrections to existing Vítor Matos rumors
            this.correctVitorMatosRumors();
            // Guardar novos rumores na base de dados
            yield this.saveNewRumorsToDB();
            // Retornar rumores da base de dados (fonte única da verdade)
            return yield this.getRumorsFromDB();
        });
    }
    correctVitorMatosRumors() {
        // First pass: correct status and reliability
        this.rumors.forEach((rumor, index) => {
            if (['vítor matos', 'vitor matos'].includes(rumor.player_name.toLowerCase())) {
                rumor.status = 'confirmado';
                rumor.reliability = 5;
            }
        });
        // Second pass: keep only ONE Vítor Matos rumor
        const vitorMatosRumors = this.rumors.filter(rumor => ['vítor matos', 'vitor matos'].includes(rumor.player_name.toLowerCase()));
        if (vitorMatosRumors.length > 1) {
            // Find the best one (prefer more recent, then better source)
            const bestRumor = vitorMatosRumors.reduce((best, current) => {
                if (new Date(current.date) > new Date(best.date))
                    return current;
                if (new Date(current.date).getTime() === new Date(best.date).getTime()) {
                    // Prefer non-Google News sources
                    if (current.source !== 'Google News' && best.source === 'Google News')
                        return current;
                    if (current.source.length > best.source.length)
                        return current;
                }
                return best;
            });
            // Remove all Vítor Matos rumors
            this.rumors = this.rumors.filter(rumor => !['vítor matos', 'vitor matos'].includes(rumor.player_name.toLowerCase()));
            // Add back only the best one
            this.rumors.unshift(bestRumor);
        }
    }
    getStats() {
        return __awaiter(this, void 0, void 0, function* () {
            const rumors = yield this.getRumors();
            const stats = {
                total: rumors.length,
                compras: rumors.filter(r => r.type === 'compra').length,
                vendas: rumors.filter(r => r.type === 'venda').length,
                renovacoes: rumors.filter(r => r.type === 'renovação').length,
                rumores: rumors.filter(r => r.status === 'rumor').length,
                negociacoes: rumors.filter(r => r.status === 'negociação').length,
                confirmados: rumors.filter(r => r.status === 'confirmado').length,
                recentRumors: this.getRecentRumorsCount(rumors),
                averageReliability: this.calculateAverageReliability(rumors)
            };
            return stats;
        });
    }
    addManualRumor(rumor, req) {
        return __awaiter(this, void 0, void 0, function* () {
            // SPECIAL HANDLING: Force correct status and info for Vítor Matos
            if (['vítor matos', 'vitor matos'].includes(rumor.player_name.toLowerCase())) {
                rumor.status = 'confirmado';
                rumor.reliability = 5;
                rumor.club = 'CS Marítimo'; // CORREÇÃO: Sempre CS Marítimo
                rumor.type = 'compra'; // CORREÇÃO: Sempre compra (chegada ao Marítimo)
            }
            // Adicionar rumor diretamente à base de dados
            const newRumor = yield this.createRumorInDB(rumor);
            return newRumor;
        });
    }
    updateRumors() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.isUpdating)
                return;
            this.isUpdating = true;
            try {
                // Scrape real news from Portuguese sports websites
                const scrapedRumors = yield realNewsService_1.realNewsService.fetchRealTransferNews();
                if (scrapedRumors.length > 0) {
                    // Enhanced processing with strict filtering
                    const processedRumors = this.enhanceRumorAnalysis(scrapedRumors);
                    // Apply strict filtering for quality and relevance
                    const filteredRumors = this.applyStrictFiltering(processedRumors);
                    // Advanced duplicate detection
                    const newRumors = this.advancedDuplicateFilter(filteredRumors);
                    // Add new rumors to the beginning
                    this.rumors = [...newRumors, ...this.rumors];
                    // Sort by date (newest first) and limit to 50
                    this.rumors.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
                    this.rumors = this.rumors.slice(0, 50);
                    // Rebuild caches for duplicate detection
                    this.rebuildCaches();
                    this.lastUpdate = new Date();
                }
            }
            catch (error) {
                console.error('Error updating transfer rumors:', error);
            }
            finally {
                this.isUpdating = false;
            }
        });
    }
    enhanceRumorAnalysis(rumors) {
        return rumors.map(rumor => {
            const enhancedRumor = Object.assign({}, rumor);
            // Enhanced transfer type detection
            enhancedRumor.type = this.detectTransferType(rumor.description || '', rumor.player_name);
            // Enhanced club detection for current Marítimo players
            enhancedRumor.club = this.enhanceClubDetection(rumor.description || '', rumor.club, rumor.type);
            // Enhanced reliability calculation
            enhancedRumor.reliability = this.calculateEnhancedReliability(rumor.source, rumor.description || '', rumor.status);
            // Enhanced status detection
            enhancedRumor.status = this.detectTransferStatus(rumor.description || '', rumor.source);
            // SPECIAL HANDLING: Force correct status for Vítor Matos
            if (['vítor matos', 'vitor matos'].includes(rumor.player_name.toLowerCase())) {
                enhancedRumor.status = 'confirmado';
                enhancedRumor.reliability = 5;
            }
            // New: Categorize and check if main team related
            enhancedRumor.isMainTeam = this.isMainTeamRelated(rumor.player_name, rumor.description || '');
            enhancedRumor.category = this.categorizeRumor(rumor.player_name, rumor.description || '');
            // NEW: Add position for coaches
            if (enhancedRumor.category === 'coach') {
                enhancedRumor.position = this.extractCoachPosition(rumor.description || '');
            }
            enhancedRumor.duplicateSignature = this.createAdvancedRumorSignature(rumor.player_name, enhancedRumor.club, enhancedRumor.type, rumor.description || '');
            return enhancedRumor;
        });
    }
    // NEW METHOD: Strict filtering for quality and relevance
    applyStrictFiltering(rumors) {
        return rumors.filter(rumor => {
            // Filter 1: Must have a valid player name
            if (!rumor.player_name || rumor.player_name.length < 3) {
                return false;
            }
            // Filter 2: Must be clearly transfer-related
            if (!this.isValidTransferRumor(rumor)) {
                return false;
            }
            // Filter 3: Filter out obvious non-football content
            if (this.isNonFootballContent(rumor.description || '')) {
                return false;
            }
            // Filter 4: Minimum reliability threshold
            if (rumor.reliability < 2) {
                return false;
            }
            // Filter 5: UPDATED - Allow coaches even with medium reliability
            if (!rumor.isMainTeam && rumor.category !== 'coach' && rumor.reliability < 4) {
                return false;
            }
            return true;
        });
    }
    // NEW METHOD: Advanced duplicate detection
    advancedDuplicateFilter(rumors) {
        const uniqueRumors = [];
        let bestVitorMatosRumor = null;
        for (const rumor of rumors) {
            // ULTRA-AGGRESSIVE: Keep only ONE Vítor Matos rumor - the best one
            if (['vítor matos', 'vitor matos'].includes(rumor.player_name.toLowerCase())) {
                if (!bestVitorMatosRumor) {
                    bestVitorMatosRumor = rumor;
                }
                else {
                    // Compare and keep the best one
                    const shouldReplace = rumor.reliability > bestVitorMatosRumor.reliability ||
                        (rumor.reliability === bestVitorMatosRumor.reliability && new Date(rumor.date) > new Date(bestVitorMatosRumor.date)) ||
                        (rumor.reliability === bestVitorMatosRumor.reliability && new Date(rumor.date).getTime() === new Date(bestVitorMatosRumor.date).getTime() && rumor.source.length > bestVitorMatosRumor.source.length);
                    if (shouldReplace) {
                        bestVitorMatosRumor = rumor;
                    }
                }
                continue;
            }
            // Regular duplicate handling for other players
            if (!this.isDuplicateRumor(rumor)) {
                uniqueRumors.push(rumor);
                this.updateSignatureCaches(rumor);
            }
        }
        // Add the single best Vítor Matos rumor
        if (bestVitorMatosRumor) {
            uniqueRumors.push(bestVitorMatosRumor);
            this.updateSignatureCaches(bestVitorMatosRumor);
        }
        return uniqueRumors;
    }
    // NEW METHOD: Check if rumor is duplicate using multiple methods
    isDuplicateRumor(rumor) {
        // Method 1: Check signature
        if (this.rumorSignatures.has(rumor.duplicateSignature || '')) {
            return true;
        }
        // Method 2: Check content hash
        const contentHash = this.createContentHash(rumor.description || '');
        if (this.contentHashes.has(contentHash)) {
            return true;
        }
        // Method 3: Check similar rumors (fuzzy matching)
        const similarRumor = this.rumors.find(existing => this.areSimilarRumors(existing, rumor));
        return !!similarRumor;
    }
    // NEW METHOD: Check if two rumors are similar
    areSimilarRumors(rumor1, rumor2) {
        // Same player and same type within 3 days
        if (rumor1.player_name.toLowerCase() === rumor2.player_name.toLowerCase() &&
            rumor1.type === rumor2.type) {
            const date1 = new Date(rumor1.date);
            const date2 = new Date(rumor2.date);
            const daysDiff = Math.abs((date1.getTime() - date2.getTime()) / (1000 * 60 * 60 * 24));
            return daysDiff <= 3;
        }
        return false;
    }
    // NEW METHOD: Determine if rumor is about main team (UPDATED for coaches)
    isMainTeamRelated(playerName, description) {
        const lowerName = playerName.toLowerCase();
        const lowerDesc = description.toLowerCase();
        // Check if it's a known main team player
        if (this.CURRENT_MAIN_TEAM_PLAYERS.some(player => lowerName.includes(player) || lowerDesc.includes(player))) {
            return true;
        }
        // NEW: Check if it's about main team coach
        if (this.isMainTeamCoach(playerName, description)) {
            return true;
        }
        // Check if it's staff/management (not main team players or coaches)
        if (this.STAFF_AND_MANAGEMENT.some(staff => lowerName.includes(staff) || lowerDesc.includes(staff))) {
            return false;
        }
        // Check for youth team indicators
        if (this.YOUTH_KEYWORDS.some(keyword => lowerDesc.includes(keyword))) {
            return false;
        }
        // Check for main team indicators
        const mainTeamKeywords = [
            'equipa principal', 'equipa sénior', 'plantel principal',
            'primeira equipa', 'equipe principal'
        ];
        if (mainTeamKeywords.some(keyword => lowerDesc.includes(keyword))) {
            return true;
        }
        // Default: assume main team for senior age players with transfer activity
        return !this.isYouthPlayer(playerName, description);
    }
    // NEW METHOD: Check if it's about main team coach
    isMainTeamCoach(playerName, description) {
        const lowerName = playerName.toLowerCase();
        const lowerDesc = description.toLowerCase();
        // Excluir treinadores de equipas femininas e formação
        const excludeKeywords = [
            'feminino', 'feminina', 'equipa feminina', 'equipa das mulheres',
            'sub-15', 'sub-17', 'sub-19', 'sub-21', 'sub-23', 'juniores', 'juvenis',
            'formação', 'academia', 'escalão', 'escalões', 'youth', 'academy'
        ];
        if (excludeKeywords.some(keyword => lowerName.includes(keyword) || lowerDesc.includes(keyword))) {
            return false;
        }
        // Check if it's a known main team coach
        if (this.MAIN_TEAM_COACHES.some(coach => lowerName.includes(coach) || lowerDesc.includes(coach))) {
            return true;
        }
        // Check for coach-related keywords
        const hasCoachKeyword = this.COACH_KEYWORDS.some(keyword => lowerDesc.includes(keyword));
        if (!hasCoachKeyword) {
            return false;
        }
        // Check for main team indicators
        const mainTeamKeywords = [
            'equipa principal', 'equipa sénior', 'plantel principal',
            'primeira equipa', 'equipe principal', 'marítimo',
            'cs marítimo', 'clube sport marítimo'
        ];
        return mainTeamKeywords.some(keyword => lowerDesc.includes(keyword));
    }
    // NEW METHOD: Categorize rumor type (UPDATED for coaches)
    categorizeRumor(playerName, description) {
        const lowerName = playerName.toLowerCase();
        const lowerDesc = description.toLowerCase();
        // NEW: Check for coaches first
        if (this.isMainTeamCoach(playerName, description)) {
            return 'coach';
        }
        // Check for staff (excluding coaches)
        if (this.STAFF_AND_MANAGEMENT.some(staff => lowerName.includes(staff) || lowerDesc.includes(staff))) {
            return 'staff';
        }
        // Check for youth
        if (this.YOUTH_KEYWORDS.some(keyword => lowerDesc.includes(keyword)) ||
            this.isYouthPlayer(playerName, description)) {
            return 'youth';
        }
        // Check for senior/main team
        if (this.CURRENT_MAIN_TEAM_PLAYERS.some(player => lowerName.includes(player) || lowerDesc.includes(player))) {
            return 'senior';
        }
        return 'senior'; // Default to senior for unknown players
    }
    // NEW METHOD: Check if player is youth
    isYouthPlayer(playerName, description) {
        const lowerDesc = description.toLowerCase();
        // Age indicators for youth
        const youthAgePatterns = [
            /\b1[6-9] anos?\b/, /\b20 anos?\b/, /\b21 anos?\b/
        ];
        return youthAgePatterns.some(pattern => pattern.test(lowerDesc)) ||
            this.YOUTH_KEYWORDS.some(keyword => lowerDesc.includes(keyword));
    }
    // NEW METHOD: Check if content is valid transfer rumor
    isValidTransferRumor(rumor) {
        var _a;
        // Aceitar sempre rumores de treinador principal com nome e clube
        if (rumor.category === 'coach' && rumor.player_name && rumor.club) {
            return true;
        }
        const desc = ((_a = rumor.description) === null || _a === void 0 ? void 0 : _a.toLowerCase()) || '';
        // Must contain transfer-related keywords
        const transferKeywords = [
            'transfer', 'contrat', 'assina', 'renova', 'saída', 'chegada',
            'reforço', 'venda', 'compra', 'renovação', 'acordo', 'negociação'
        ];
        return transferKeywords.some(keyword => desc.includes(keyword));
    }
    // NEW METHOD: Check if content is non-football
    isNonFootballContent(description) {
        const lowerDesc = description.toLowerCase();
        const nonFootballKeywords = [
            'política', 'economia', 'covid', 'pandemia', 'eleições',
            'temperatura', 'tempo', 'trânsito', 'acidentes', 'crime',
            'música', 'filme', 'teatro', 'festival', 'concerto'
        ];
        return nonFootballKeywords.some(keyword => lowerDesc.includes(keyword));
    }
    // NEW METHOD: Create advanced rumor signature
    createAdvancedRumorSignature(playerName, club, type, description) {
        const normalizedName = playerName.toLowerCase().trim().replace(/\s+/g, ' ');
        const normalizedClub = club.toLowerCase().trim();
        const descHash = this.createContentHash(description).substring(0, 8);
        return `${normalizedName}|${normalizedClub}|${type}|${descHash}`;
    }
    // NEW METHOD: Update signature caches
    updateSignatureCaches(rumor) {
        if (rumor.duplicateSignature) {
            this.rumorSignatures.add(rumor.duplicateSignature);
        }
        const contentHash = this.createContentHash(rumor.description || '');
        this.contentHashes.add(contentHash);
    }
    // NEW METHOD: Rebuild all caches
    rebuildCaches() {
        this.rumorSignatures.clear();
        this.contentHashes.clear();
        this.rumors.forEach(rumor => {
            this.updateSignatureCaches(rumor);
        });
    }
    // NEW METHOD: Create content hash
    createContentHash(content) {
        let hash = 0;
        if (content.length === 0)
            return hash.toString();
        for (let i = 0; i < content.length; i++) {
            const char = content.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return Math.abs(hash).toString(36);
    }
    detectTransferType(description, playerName) {
        const lowerDesc = description.toLowerCase();
        // Known current Marítimo players (this should ideally come from a database)
        const currentPlayers = this.CURRENT_MAIN_TEAM_PLAYERS;
        const isCurrentPlayer = currentPlayers.some(player => lowerDesc.includes(player.toLowerCase()) ||
            playerName.toLowerCase().includes(player.toLowerCase()));
        // Contract renewal indicators
        const renewalKeywords = [
            'renovação', 'renovacao', 'renova', 'prolonga', 'contrato',
            'até 202', 'extensão', 'extensao', 'acordo', 'permanece',
            'fica no', 'continua no', 'renegociou'
        ];
        if (renewalKeywords.some(keyword => lowerDesc.includes(keyword))) {
            return 'renovação';
        }
        // If it's a current player and not renewal, it's likely a sale
        if (isCurrentPlayer) {
            const sellKeywords = ['saída', 'saida', 'deixa', 'sai', 'venda', 'transfere-se'];
            if (sellKeywords.some(keyword => lowerDesc.includes(keyword))) {
                return 'venda';
            }
            // If current player but no clear sale indicators, might be renewal
            return 'renovação';
        }
        // For non-current players, likely a purchase
        const buyKeywords = ['chegada', 'reforço', 'reforco', 'contratação', 'contratacao', 'assina'];
        if (buyKeywords.some(keyword => lowerDesc.includes(keyword))) {
            return 'compra';
        }
        return 'compra'; // Default for external players
    }
    enhanceClubDetection(description, originalClub, type) {
        const lowerDesc = description.toLowerCase();
        // If it's a renewal or current player situation
        if (type === 'renovação') {
            return 'CS Marítimo'; // Player is staying with Marítimo
        }
        // Enhanced club detection with common Portuguese/international clubs
        const clubPatterns = [
            { pattern: /sporting/i, name: 'Sporting CP' },
            { pattern: /benfica/i, name: 'SL Benfica' },
            { pattern: /porto/i, name: 'FC Porto' },
            { pattern: /braga/i, name: 'SC Braga' },
            { pattern: /vitória.*guimarães/i, name: 'Vitória SC' },
            { pattern: /vitória.*setúbal/i, name: 'Vitória FC' },
            { pattern: /boavista/i, name: 'Boavista FC' },
            { pattern: /famalicão/i, name: 'FC Famalicão' },
            { pattern: /gil.*vicente/i, name: 'Gil Vicente FC' },
            { pattern: /paços.*ferreira/i, name: 'FC Paços de Ferreira' },
            { pattern: /moreirense/i, name: 'Moreirense FC' },
            { pattern: /arouca/i, name: 'FC Arouca' },
            { pattern: /chaves/i, name: 'GD Chaves' },
            { pattern: /portimonense/i, name: 'Portimonense SC' }
        ];
        for (const club of clubPatterns) {
            if (club.pattern.test(description)) {
                return club.name;
            }
        }
        // If no specific club found but it's a sale, indicate unknown destination
        if (type === 'venda' && originalClub === 'Clube não especificado') {
            return 'Destino a confirmar';
        }
        return originalClub;
    }
    calculateEnhancedReliability(source, description, status) {
        let reliability = 3; // Base reliability
        // Official sources get maximum reliability
        const officialKeywords = ['oficial', 'comunicado', 'clube anuncia', 'confirmado pelo clube'];
        if (officialKeywords.some(keyword => description.toLowerCase().includes(keyword))) {
            return 5;
        }
        // Status-based reliability
        if (status === 'confirmado') {
            reliability = Math.min(5, reliability + 1.5);
        }
        else if (status === 'negociação') {
            reliability = Math.min(5, reliability + 0.5);
        }
        // Source-based reliability
        const highReliabilitySources = ['record', 'abola', 'ojogo', 'maisfutebol', 'zerozero'];
        const mediumReliabilitySources = ['sapo', 'rtp', 'tvi', 'cmjornal'];
        if (highReliabilitySources.some(src => source.toLowerCase().includes(src))) {
            reliability += 1;
        }
        else if (mediumReliabilitySources.some(src => source.toLowerCase().includes(src))) {
            reliability += 0.5;
        }
        // Confirmation words boost reliability
        const confirmationWords = ['confirma', 'anuncia', 'assinou', 'fechado', 'acordo'];
        if (confirmationWords.some(word => description.toLowerCase().includes(word))) {
            reliability += 1;
        }
        return Math.min(5, Math.max(1, Math.round(reliability)));
    }
    detectTransferStatus(description, source) {
        const lowerDesc = description.toLowerCase();
        // Confirmed indicators
        const confirmedKeywords = [
            'confirmado', 'oficial', 'assinou', 'fechado', 'comunicado',
            'anuncia', 'apresentado', 'acordo fechado'
        ];
        if (confirmedKeywords.some(keyword => lowerDesc.includes(keyword))) {
            return 'confirmado';
        }
        // Negotiation indicators
        const negotiationKeywords = [
            'negociação', 'negociacao', 'acordo', 'proposta', 'interessado',
            'sondagem', 'conversa', 'perto de', 'próximo de'
        ];
        if (negotiationKeywords.some(keyword => lowerDesc.includes(keyword))) {
            return 'negociação';
        }
        return 'rumor';
    }
    getRecentRumorsCount(rumors) {
        const threeDaysAgo = new Date();
        threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
        return rumors.filter(rumor => new Date(rumor.date) >= threeDaysAgo).length;
    }
    calculateAverageReliability(rumors) {
        if (rumors.length === 0)
            return 0;
        const totalReliability = rumors.reduce((sum, rumor) => sum + rumor.reliability, 0);
        return Math.round((totalReliability / rumors.length) * 10) / 10;
    }
    // NEW METHOD: Get detailed statistics (UPDATED for coaches)
    getDetailedStats() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const rumors = this.rumors; // Get all rumors including filtered ones
            return {
                byCategory: {
                    senior: rumors.filter(r => r.category === 'senior').length,
                    youth: rumors.filter(r => r.category === 'youth').length,
                    staff: rumors.filter(r => r.category === 'staff').length,
                    coach: rumors.filter(r => r.category === 'coach').length,
                    other: rumors.filter(r => r.category === 'other').length
                },
                byReliability: {
                    high: rumors.filter(r => r.reliability >= 4).length,
                    medium: rumors.filter(r => r.reliability === 3).length,
                    low: rumors.filter(r => r.reliability <= 2).length
                },
                mainTeamVsOthers: {
                    mainTeam: rumors.filter(r => r.isMainTeam === true).length,
                    coaches: rumors.filter(r => r.category === 'coach').length,
                    others: rumors.filter(r => r.isMainTeam === false && r.category !== 'coach').length
                },
                duplicateSignatures: this.rumorSignatures.size,
                contentHashes: this.contentHashes.size,
                lastUpdate: ((_a = this.lastUpdate) === null || _a === void 0 ? void 0 : _a.toISOString()) || 'Never'
            };
        });
    }
    // NEW METHOD: Get quality report
    getQualityReport() {
        return __awaiter(this, void 0, void 0, function* () {
            const rumors = this.rumors;
            // Find potential duplicates by similar content
            const potentialDuplicates = this.findPotentialDuplicates();
            // Quality metrics
            const lowReliabilityRumors = rumors.filter(r => r.reliability <= 2);
            const nonMainTeamRumors = rumors.filter(r => r.isMainTeam === false);
            const oldRumors = rumors.filter(r => {
                const rumorDate = new Date(r.date);
                const weekAgo = new Date();
                weekAgo.setDate(weekAgo.getDate() - 7);
                return rumorDate < weekAgo;
            });
            return {
                totalRumors: rumors.length,
                qualityIssues: {
                    potentialDuplicates: potentialDuplicates.length,
                    lowReliability: lowReliabilityRumors.length,
                    nonMainTeam: nonMainTeamRumors.length,
                    oldRumors: oldRumors.length
                },
                recommendations: this.generateQualityRecommendations(potentialDuplicates, lowReliabilityRumors, nonMainTeamRumors, oldRumors),
                cacheStats: {
                    signaturesCached: this.rumorSignatures.size,
                    contentHashesCached: this.contentHashes.size
                }
            };
        });
    }
    // NEW METHOD: Clean duplicate rumors
    cleanDuplicateRumors() {
        return __awaiter(this, void 0, void 0, function* () {
            const originalCount = this.rumors.length;
            const potentialDuplicates = this.findPotentialDuplicates();
            // Remove duplicates - keep the one with highest reliability
            const duplicateGroups = this.groupDuplicates(potentialDuplicates);
            let removedCount = 0;
            for (const group of duplicateGroups) {
                if (group.length > 1) {
                    // Sort by reliability descending and keep the best one
                    group.sort((a, b) => b.reliability - a.reliability);
                    const toKeep = group[0];
                    const toRemove = group.slice(1);
                    // Remove duplicates from main array
                    toRemove.forEach(rumor => {
                        const index = this.rumors.findIndex(r => r.id === rumor.id);
                        if (index !== -1) {
                            this.rumors.splice(index, 1);
                            removedCount++;
                        }
                    });
                }
            }
            // Rebuild caches after cleaning
            this.rebuildCaches();
            return {
                removedCount,
                remainingCount: this.rumors.length
            };
        });
    }
    // Helper method: Find potential duplicates
    findPotentialDuplicates() {
        const duplicates = [];
        const checked = new Set();
        for (const rumor of this.rumors) {
            if (checked.has(rumor.id))
                continue;
            const similarRumors = this.rumors.filter(other => other.id !== rumor.id && this.areSimilarRumors(rumor, other));
            if (similarRumors.length > 0) {
                duplicates.push(rumor, ...similarRumors);
                checked.add(rumor.id);
                similarRumors.forEach(r => checked.add(r.id));
            }
        }
        return duplicates;
    }
    // Helper method: Group duplicates
    groupDuplicates(duplicates) {
        const groups = [];
        const processed = new Set();
        for (const rumor of duplicates) {
            if (processed.has(rumor.id))
                continue;
            const group = [rumor];
            processed.add(rumor.id);
            // Find all similar rumors for this group
            for (const other of duplicates) {
                if (!processed.has(other.id) && this.areSimilarRumors(rumor, other)) {
                    group.push(other);
                    processed.add(other.id);
                }
            }
            if (group.length > 1) {
                groups.push(group);
            }
        }
        return groups;
    }
    // Helper method: Generate quality recommendations
    generateQualityRecommendations(potentialDuplicates, lowReliabilityRumors, nonMainTeamRumors, oldRumors) {
        const recommendations = [];
        if (potentialDuplicates.length > 0) {
            recommendations.push(`Considere limpar ${potentialDuplicates.length} rumores potencialmente duplicados`);
        }
        if (lowReliabilityRumors.length > 5) {
            recommendations.push(`${lowReliabilityRumors.length} rumores têm baixa confiabilidade - considere filtrar`);
        }
        if (nonMainTeamRumors.length > this.rumors.length * 0.3) {
            recommendations.push(`${nonMainTeamRumors.length} rumores não são sobre a equipa principal`);
        }
        if (oldRumors.length > 10) {
            recommendations.push(`${oldRumors.length} rumores são antigos (mais de 1 semana)`);
        }
        if (recommendations.length === 0) {
            recommendations.push('A qualidade dos rumores está boa!');
        }
        return recommendations;
    }
    // NEW METHOD: Extract coach position from description
    extractCoachPosition(description) {
        const lowerDesc = description.toLowerCase();
        if (lowerDesc.includes('treinador principal') || lowerDesc.includes('técnico principal')) {
            return 'Treinador Principal';
        }
        if (lowerDesc.includes('treinador adjunto') || lowerDesc.includes('adjunto')) {
            return 'Treinador Adjunto';
        }
        if (lowerDesc.includes('preparador físico')) {
            return 'Preparador Físico';
        }
        if (lowerDesc.includes('treinador') || lowerDesc.includes('técnico')) {
            return 'Treinador';
        }
        return 'Staff Técnico';
    }
    extractCoachNameFromText(text) {
        const lowerText = text.toLowerCase();
        // Common patterns for coach announcements
        const patterns = [
            /(?:novo|novo treinador|novo técnico|comandante técnico)\s+(?:do|do cs|do clube sport)?\s+marítimo\s+(?:é|será|foi)\s+([^,.]+)/i,
            /(?:marítimo|cs marítimo)\s+(?:anuncia|apresenta|oficializa|nomeia|escolhe)\s+(?:o|a|como)\s+(?:novo|novo treinador|novo técnico)\s+([^,.]+)/i,
            /(?:treinador|técnico)\s+(?:do|do cs|do clube sport)?\s+marítimo\s+(?:é|será|foi)\s+([^,.]+)/i,
            /(?:assume|toma posse|inicia funções)\s+(?:como|no cargo de)\s+(?:treinador|técnico)\s+(?:do|do cs|do clube sport)?\s+marítimo\s+([^,.]+)/i
        ];
        for (const pattern of patterns) {
            const match = text.match(pattern);
            if (match && match[1]) {
                const name = match[1].trim();
                // Validate that it's actually a name (not just a title or description)
                if (name.length > 3 && !this.STAFF_AND_MANAGEMENT.some(staff => name.toLowerCase().includes(staff))) {
                    return name;
                }
            }
        }
        return 'Novo elemento técnico';
    }
    // NOVOS MÉTODOS PARA TRABALHAR COM A BASE DE DADOS
    // Migrar rumores da memória para a base de dados (executar uma vez)
    migrateToDatabase() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (this.rumors.length > 0) {
                    yield transfer_rumor_model_1.TransferRumorModel.migrateFromMemory(this.rumors);
                }
            }
            catch (error) {
                console.error('Erro na migração para a base de dados:', error);
            }
        });
    }
    // Obter rumores da base de dados (método público para utilizadores)
    getRumorsFromDB() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const dbRumors = yield transfer_rumor_model_1.TransferRumorModel.getAllApproved();
                return this.convertDBRumorsToTransferRumors(dbRumors);
            }
            catch (error) {
                console.error('Erro ao obter rumores da base de dados:', error);
                // Fallback para rumores em memória
                return this.getRumors();
            }
        });
    }
    // Obter todos os rumores da base de dados (para admin)
    getAllRumorsFromDB() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const dbRumors = yield transfer_rumor_model_1.TransferRumorModel.getAllForAdmin();
                return this.convertDBRumorsToTransferRumors(dbRumors);
            }
            catch (error) {
                console.error('Erro ao obter todos os rumores da base de dados:', error);
                return [];
            }
        });
    }
    // Criar novo rumor na base de dados
    createRumorInDB(rumor, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const uniqueId = `manual_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                const newRumor = yield transfer_rumor_model_1.TransferRumorModel.create({
                    unique_id: uniqueId,
                    player_name: rumor.player_name,
                    type: rumor.type,
                    club: rumor.club,
                    value: rumor.value,
                    status: rumor.status,
                    date: new Date().toISOString().split('T')[0],
                    source: rumor.source || 'Manual',
                    reliability: rumor.reliability,
                    description: rumor.description,
                    is_main_team: rumor.isMainTeam !== false,
                    category: rumor.category || 'senior',
                    position: rumor.position,
                    is_approved: false,
                    created_by: userId
                });
                return this.convertDBRumorToTransferRumor(newRumor);
            }
            catch (error) {
                console.error('Erro ao criar rumor na base de dados:', error);
                throw error;
            }
        });
    }
    // Atualizar rumor na base de dados
    updateRumorInDB(id, updates) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const updatedRumor = yield transfer_rumor_model_1.TransferRumorModel.update(id, updates);
                if (updatedRumor) {
                    return this.convertDBRumorToTransferRumor(updatedRumor);
                }
                return null;
            }
            catch (error) {
                console.error('Erro ao atualizar rumor na base de dados:', error);
                throw error;
            }
        });
    }
    // Remover rumor da base de dados (soft delete)
    deleteRumorFromDB(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield transfer_rumor_model_1.TransferRumorModel.softDelete(id);
            }
            catch (error) {
                console.error('Erro ao remover rumor da base de dados:', error);
                throw error;
            }
        });
    }
    // Aprovar rumor
    approveRumor(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const approvedRumor = yield transfer_rumor_model_1.TransferRumorModel.approve(id);
                if (approvedRumor) {
                    return this.convertDBRumorToTransferRumor(approvedRumor);
                }
                return null;
            }
            catch (error) {
                console.error('Erro ao aprovar rumor:', error);
                throw error;
            }
        });
    }
    // Desaprovar rumor
    disapproveRumor(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const disapprovedRumor = yield transfer_rumor_model_1.TransferRumorModel.disapprove(id);
                if (disapprovedRumor) {
                    return this.convertDBRumorToTransferRumor(disapprovedRumor);
                }
                return null;
            }
            catch (error) {
                console.error('Erro ao desaprovar rumor:', error);
                throw error;
            }
        });
    }
    // Obter estatísticas da base de dados
    getStatsFromDB() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield transfer_rumor_model_1.TransferRumorModel.getStats();
            }
            catch (error) {
                console.error('Erro ao obter estatísticas da base de dados:', error);
                // Fallback para estatísticas em memória
                return this.getStats();
            }
        });
    }
    // Guardar novos rumores descobertos na base de dados
    saveNewRumorsToDB() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Buscar novos rumores
                const scrapedRumors = yield realNewsService_1.realNewsService.fetchRealTransferNews();
                if (scrapedRumors.length > 0) {
                    for (const rumor of scrapedRumors) {
                        try {
                            // Verificar se já existe na base de dados
                            const exists = yield transfer_rumor_model_1.TransferRumorModel.existsByUniqueId(rumor.id);
                            if (!exists) {
                                yield transfer_rumor_model_1.TransferRumorModel.create({
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
                                    is_approved: rumor.reliability >= 4 // Auto-aprovar rumores de alta confiabilidade
                                });
                            }
                        }
                        catch (error) {
                            console.error(`Erro ao guardar rumor ${rumor.id}:`, error);
                        }
                    }
                }
            }
            catch (error) {
                console.error('Erro ao guardar novos rumores na base de dados:', error);
            }
        });
    }
    // Converter rumor da base de dados para interface do frontend
    convertDBRumorToTransferRumor(dbRumor) {
        // Garantir que a data está no formato correto (YYYY-MM-DD)
        let formattedDate = dbRumor.date;
        if (dbRumor.date) {
            try {
                // Se a data vem como objeto Date, converter para string
                const dateObj = new Date(dbRumor.date);
                if (!isNaN(dateObj.getTime())) {
                    formattedDate = dateObj.toISOString().split('T')[0];
                }
            }
            catch (error) {
                formattedDate = dbRumor.date; // Manter original se houver erro
            }
        }
        return {
            id: dbRumor.unique_id,
            dbId: dbRumor.id,
            player_name: dbRumor.player_name,
            type: dbRumor.type,
            club: dbRumor.club,
            value: dbRumor.value,
            status: dbRumor.status,
            date: formattedDate,
            source: dbRumor.source,
            reliability: dbRumor.reliability,
            description: dbRumor.description,
            isMainTeam: dbRumor.is_main_team,
            category: dbRumor.category,
            position: dbRumor.position
        };
    }
    // Converter array de rumores da base de dados
    convertDBRumorsToTransferRumors(dbRumors) {
        return dbRumors.map(dbRumor => this.convertDBRumorToTransferRumor(dbRumor));
    }
}
exports.transferService = new TransferService();
