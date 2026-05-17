const prisma = require("../db/prisma");

const getUserAnalytics = async (req, res, next) => {
  return res.status(501).json({ message: "Not implemented yet" });
};

const getUsersWithStats = async (req, res, next) => {
  return res.status(501).json({ message: "Not implemented yet" });
};

const searchTasks = async (req, res, next) => {
  return res.status(501).json({ message: "Not implemented yet" });
};

module.exports = {
  getUserAnalytics,
  getUsersWithStats,
  searchTasks,
};
