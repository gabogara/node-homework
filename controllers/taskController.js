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
  try {
    const tasks = await prisma.task.findMany({
      where: {
        userId: global.user_id,
      },
      select: {
        id: true,
        title: true,
        isCompleted: true,
      },
    });

    if (tasks.length === 0) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: "That task was not found",
      });
    }

    return res.status(StatusCodes.OK).json(tasks);
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

module.exports = {
  create,
  index,
  show,
  update,
  deleteTask,
};
