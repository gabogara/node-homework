const prisma = require("../db/prisma");

const {
  userIdSchema,
  paginationSchema,
  searchSchema,
} = require("../validation/analyticsSchema");

const getUserAnalytics = async (req, res, next) => {
  const { error, value } = userIdSchema.validate(req.params);

  if (error) {
    return res.status(400).json({
      error: error.message,
    });
  }

  const userId = value.id;

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
  const { error, value } = paginationSchema.validate(req.query);

  if (error) {
    return res.status(400).json({
      error: error.message,
    });
  }

  const { page, limit } = value;

  const skip = (page - 1) * limit;

  try {
    const usersRaw = await prisma.user.findMany({
      include: {
        Task: {
          where: { isCompleted: false },
          select: { id: true },
          take: 5,
        },
        _count: {
          select: {
            Task: true,
          },
        },
      },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    });

    const users = usersRaw.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
      _count: user._count,
      Task: user.Task,
    }));

    const totalUsers = await prisma.user.count();

    const pagination = {
      page,
      limit,
      total: totalUsers,
      pages: Math.ceil(totalUsers / limit),
      hasNext: page * limit < totalUsers,
      hasPrev: page > 1,
    };

    return res.status(200).json({
      users,
      pagination,
    });
  } catch (err) {
    if (next) return next(err);
    throw err;
  }
};

const searchTasks = async (req, res, next) => {
  const { error, value } = searchSchema.validate(req.query);

  if (error) {
    return res.status(400).json({
      error: error.message,
    });
  }

  const { q: searchQuery, limit } = value;

  const searchPattern = `%${searchQuery}%`;
  const exactMatch = searchQuery;
  const startsWith = `${searchQuery}%`;

  try {
    const searchResults = await prisma.$queryRaw`
      SELECT 
        t.id,
        t.title,
        t.is_completed as "isCompleted",
        t.priority,
        t.created_at as "createdAt",
        t.user_id as "userId",
        u.name as "user_name"
      FROM tasks t
      JOIN users u ON t.user_id = u.id
      WHERE t.user_id = ${req.user.id}
  AND (
    t.title ILIKE ${searchPattern}
    OR u.name ILIKE ${searchPattern}
  )
      ORDER BY 
        CASE 
          WHEN t.title ILIKE ${exactMatch} THEN 1
          WHEN t.title ILIKE ${startsWith} THEN 2
          WHEN t.title ILIKE ${searchPattern} THEN 3
          ELSE 4
        END,
        t.created_at DESC
      LIMIT ${limit}
    `;

    return res.status(200).json({
      results: searchResults,
      query: searchQuery,
      count: searchResults.length,
    });
  } catch (err) {
    if (next) return next(err);
    throw err;
  }
};

module.exports = {
  getUserAnalytics,
  getUsersWithStats,
  searchTasks,
};
