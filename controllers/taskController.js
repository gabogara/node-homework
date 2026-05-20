const { StatusCodes } = require("http-status-codes");
const { taskSchema, patchTaskSchema } = require("../validation/taskSchema");
const prisma = require("../db/prisma");

const create = async (req, res, next) => {
  if (!req.body) req.body = {};

  const { error, value } = taskSchema.validate(req.body, {
    abortEarly: false,
  });

  if (error) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      message: error.message,
    });
  }

  try {
    const task = await prisma.task.create({
      data: {
        title: value.title,
        isCompleted: value.isCompleted,
        priority: value.priority,
        userId: global.user_id,
      },
      select: {
        id: true,
        title: true,
        isCompleted: true,
        priority: true,
      },
    });

    return res.status(StatusCodes.CREATED).json(task);
  } catch (err) {
    if (next) return next(err);
    throw err;
  }
};

const index = async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  const whereClause = {
    userId: global.user_id,
  };

  if (req.query.find) {
    whereClause.title = {
      contains: req.query.find,
      mode: "insensitive",
    };
  }

  try {
    const tasks = await prisma.task.findMany({
      where: whereClause,
      select: {
        id: true,
        title: true,
        isCompleted: true,
        priority: true,
        createdAt: true,
        User: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
    });

    const total = await prisma.task.count({
      where: whereClause,
    });

    const pagination = {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1,
    };

    return res.status(StatusCodes.OK).json({
      tasks,
      pagination,
    });
  } catch (err) {
    if (next) return next(err);
    throw err;
  }
};

const show = async (req, res, next) => {
  const taskId = parseInt(req.params?.id, 10);

  if (!taskId) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      message: "The task ID passed is not valid.",
    });
  }

  try {
    const task = await prisma.task.findUnique({
      where: {
        id_userId: {
          id: taskId,
          userId: global.user_id,
        },
      },
      select: {
        id: true,
        title: true,
        isCompleted: true,
        priority: true,
        createdAt: true,
        User: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    if (!task) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: "That task was not found",
      });
    }

    return res.status(StatusCodes.OK).json(task);
  } catch (err) {
    if (next) return next(err);
    throw err;
  }
};

const update = async (req, res, next) => {
  const taskId = parseInt(req.params?.id, 10);
  if (!taskId) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      message: "The task ID passed is not valid.",
    });
  }
  if (!req.body) req.body = {};

  const { error, value } = patchTaskSchema.validate(req.body, {
    abortEarly: false,
  });

  if (error) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      message: error.message,
    });
  }

  try {
    const task = await prisma.task.update({
      data: value,
      where: {
        id_userId: {
          id: taskId,
          userId: global.user_id,
        },
      },
      select: {
        id: true,
        title: true,
        isCompleted: true,
        priority: true,
        createdAt: true,
      },
    });

    return res.status(StatusCodes.OK).json(task);
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: "That task was not found",
      });
    }

    if (next) return next(err);
    throw err;
  }
};

const deleteTask = async (req, res, next) => {
  const taskId = parseInt(req.params?.id, 10);

  if (!taskId) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      message: "The task ID passed is not valid.",
    });
  }

  try {
    const task = await prisma.task.delete({
      where: {
        id_userId: {
          id: taskId,
          userId: global.user_id,
        },
      },
      select: {
        id: true,
        title: true,
        isCompleted: true,
        priority: true,
        createdAt: true,
      },
    });

    return res.status(StatusCodes.OK).json(task);
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: "That task was not found",
      });
    }
    if (next) return next(err);
    throw err;
  }
};

const bulkCreate = async (req, res, next) => {
  const { tasks } = req.body;

  if (!tasks || !Array.isArray(tasks) || tasks.length === 0) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      error: "Invalid request data. Expected an array of tasks.",
    });
  }

  const validTasks = [];

  for (const task of tasks) {
    const { error, value } = taskSchema.validate(task);

    if (error) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        error: "Validation failed",
        details: error.details,
      });
    }

    validTasks.push({
      title: value.title,
      isCompleted: value.isCompleted,
      priority: value.priority,
      userId: global.user_id,
    });
  }

  try {
    const result = await prisma.task.createMany({
      data: validTasks,
      skipDuplicates: false,
    });

    return res.status(StatusCodes.CREATED).json({
      message: "Bulk task creation successful",
      tasksCreated: result.count,
      totalRequested: validTasks.length,
    });
  } catch (err) {
    if (next) return next(err);
    throw err;
  }
};

module.exports = {
  create,
  index,
  show,
  update,
  deleteTask,
  bulkCreate,
};
