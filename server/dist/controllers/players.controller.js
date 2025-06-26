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
exports.getPlayerImage = exports.deletePlayer = exports.updatePlayer = exports.createPlayer = exports.getPlayerById = exports.getAllPlayers = void 0;
const player_model_1 = require("../models/player.model");
const errorTypes_1 = require("../utils/errorTypes");
const { syncImages } = require('../../sync-images');
const getAllPlayers = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log('=== GET ALL PLAYERS DEBUG ===');
        const result = yield player_model_1.PlayerModel.findAll();
        console.log('Players returned from database:');
        result.players.forEach(player => {
            console.log(`- ${player.name}: image_url = "${player.image_url}"`);
        });
        res.json(result);
    }
    catch (error) {
        console.error('Error in getAllPlayers:', error);
        next(error);
    }
});
exports.getAllPlayers = getAllPlayers;
const getPlayerById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = parseInt(req.params.id);
        const player = yield player_model_1.PlayerModel.findById(id);
        if (!player) {
            throw new errorTypes_1.NotFoundError('Player not found');
        }
        res.json(player);
    }
    catch (error) {
        next(error);
    }
});
exports.getPlayerById = getPlayerById;
const createPlayer = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log('=== CREATE PLAYER REQUEST ===');
        console.log('Request body:', req.body);
        console.log('Request file:', req.file);
        const { name, position } = req.body;
        if (!name || !position) {
            console.log('Missing required fields:', { name, position });
            throw new Error('Name and position are required');
        }
        // Handle image upload
        let image_url = '';
        if (req.file) {
            // Store just the filename, not the full path
            image_url = req.file.filename;
            console.log('Uploaded file details:');
            console.log('- Filename:', req.file.filename);
            console.log('- Original name:', req.file.originalname);
            console.log('- Path:', req.file.path);
            console.log('- Size:', req.file.size);
            console.log('- Saving image_url as:', image_url);
        }
        else {
            console.log('No file uploaded!');
            throw new Error('Player image is required');
        }
        console.log('Creating player with data:', { name, position, image_url });
        const player = yield player_model_1.PlayerModel.create({ name, position, image_url });
        console.log('Player created successfully:', player);
        // AUTOMATIC IMAGE SYNC - Copy new image to client
        console.log('🔄 Syncing images to client...');
        try {
            syncImages();
            console.log('✅ Images synced successfully!');
        }
        catch (syncError) {
            console.error('❌ Failed to sync images:', syncError);
            // Don't fail the request if sync fails
        }
        res.status(201).json(player);
    }
    catch (error) {
        console.error('Error creating player:', error);
        next(error);
    }
});
exports.createPlayer = createPlayer;
const updatePlayer = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = parseInt(req.params.id);
        const { name, position } = req.body;
        // Prepare update data
        const updateData = {};
        if (name)
            updateData.name = name;
        if (position)
            updateData.position = position;
        // Handle image upload if provided
        if (req.file) {
            updateData.image_url = req.file.filename;
            console.log('Updated with new image:', req.file.filename);
        }
        const player = yield player_model_1.PlayerModel.update(id, updateData);
        if (!player) {
            throw new errorTypes_1.NotFoundError('Player not found');
        }
        res.json(player);
    }
    catch (error) {
        next(error);
    }
});
exports.updatePlayer = updatePlayer;
const deletePlayer = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = parseInt(req.params.id);
        const result = yield player_model_1.PlayerModel.delete(id);
        if (!result) {
            throw new errorTypes_1.NotFoundError('Player not found');
        }
        res.json({ message: 'Player deleted successfully' });
    }
    catch (error) {
        next(error);
    }
});
exports.deletePlayer = deletePlayer;
const getPlayerImage = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.time('getPlayerImage');
        const id = parseInt(req.params.id);
        console.log(`🖼️ GET_PLAYER_IMAGE: Request for player ID ${id}`);
        console.log(`🖼️ Request origin: ${req.headers.origin}`);
        console.log(`🖼️ Request referer: ${req.headers.referer}`);
        // Set CORS headers early
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'GET');
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
        if (isNaN(id)) {
            console.log(`❌ Invalid player ID: ${req.params.id}`);
            return res.status(400).json({ message: 'Invalid player ID' });
        }
        const player = yield player_model_1.PlayerModel.findById(id);
        console.log(`🖼️ Player ${id} found:`, {
            exists: !!player,
            hasImageData: !!(player === null || player === void 0 ? void 0 : player.image_data),
            imageMime: player === null || player === void 0 ? void 0 : player.image_mime,
            imageDataSize: (player === null || player === void 0 ? void 0 : player.image_data) ? player.image_data.length : 0
        });
        if (!player || !player.image_data) {
            console.log(`❌ No image found for player ${id}`);
            console.timeEnd('getPlayerImage');
            return res.status(404).send('Image not found');
        }
        // Set appropriate headers for image serving
        res.setHeader('Content-Type', player.image_mime || 'image/jpeg');
        res.setHeader('Cache-Control', 'public, max-age=86400'); // 24 hours cache
        res.setHeader('Content-Length', player.image_data.length);
        console.log(`✅ Serving image for player ${id} (${player.image_mime}, ${player.image_data.length} bytes)`);
        console.timeEnd('getPlayerImage');
        return res.send(player.image_data);
    }
    catch (error) {
        console.error('❌ Error serving player image:', error);
        console.timeEnd('getPlayerImage');
        next(error);
    }
});
exports.getPlayerImage = getPlayerImage;
