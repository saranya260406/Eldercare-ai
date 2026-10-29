// Vercel Serverless Function Handler
// Routes all /api/* requests to the ElderCare AI backend engine

const handleRequest = require('../server.js');

module.exports = async (req, res) => {
  return handleRequest(req, res);
};
