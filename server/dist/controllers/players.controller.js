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
exports.createPlayer = exports.getPlayerById = exports.getAllPlayers = void 0;
const player_model_1 = require("../models/player.model");
const errorTypes_1 = require("../utils/errorTypes");
const getAllPlayers = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const players = yield player_model_1.PlayerModel.findAll();
        res.json(players);
    }
    catch (error) {
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
        const { name, position, image_url } = req.body;
        if (!name || !position) {
            throw new Error('Name and position are required');
        }
        const player = yield player_model_1.PlayerModel.create({ name, position, image_url });
        res.status(201).json(player);
    }
    catch (error) {
        next(error);
    }
});
exports.createPlayer = createPlayer;
