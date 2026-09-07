// Point d'entrée Vercel Serverless Function pour l'API TERANGA FOOD
const app = require('../backend/dist/server.js');

module.exports = app.default || app;
