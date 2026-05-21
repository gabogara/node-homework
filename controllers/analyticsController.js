const prisma = require("../db/prisma");

const getUserAnalytics = async (req, res, next) => {
  const userId = parseInt(req.params.id, 10);

  if (isNaN(userId)) {
    return res.status(400).json({
      error: "Invalid user ID",
    });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const taskStats = await prisma.task.groupBy({
      by: ["isCompleted"],
      where: { userId },
      _count: {
        id: true,
      },
    });

    const recentTasks = await prisma.task.findMany({
      where: { userId },
      select: {
        id: true,
        title: true,
        isCompleted: true,
        priority: true,
        createdAt: true,
        userId: true,
        User: {
          select: {
            name: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const weeklyProgress = await prisma.task.groupBy({
      by: ["createdAt"],
      where: {
        userId,
        createdAt: {
          gte: oneWeekAgo,
        },
      },
      _count: {
        id: true,
      },
    });

    return res.status(200).json({
      taskStats,
      recentTasks,
      weeklyProgress,
    });
  } catch (err) {
    if (next) return next(err);
    throw err;
  }
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
