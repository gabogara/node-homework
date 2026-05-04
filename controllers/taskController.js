const { StatusCodes } = require("http-status-codes");
const { taskSchema, patchTaskSchema } = require("../validation/taskSchema");
const pool = require("../db/pg-pool");

const create = async(req, res, next) => {
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
    const result = await pool.query(
      `INSERT INTO tasks (title, is_completed, user_id)
       VALUES ($1, $2, $3)
       RETURNING id, title, is_completed`,
      [value.title, value.isCompleted, global.user_id]
    );

    return res.status(StatusCodes.CREATED).json(result.rows[0]);
  } catch (e) {
    if (next) return next(e);
    throw e;
  }
};

const index = async(req, res, next) => {
   try {
    const result = await pool.query(
      `SELECT id, title, is_completed
       FROM tasks
       WHERE user_id = $1`,
      [global.user_id]
    );

    if (result.rows.length === 0) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: "That task was not found",
      });
    }

    return res.status(StatusCodes.OK).json(result.rows);
  } catch (e) {
    if (next) return next(e);
    throw e;
  }
};

const show = async(req, res, next ) => {
  const taskId = parseInt(req.params?.id, 10);

  if (!taskId) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      message: "The task ID passed is not valid.",
    });
  }

  try {
    const result = await pool.query(
      `SELECT id, title, is_completed
       FROM tasks
       WHERE id = $1 AND user_id = $2`,
      [taskId, global.user_id]
    );

    if (result.rows.length === 0) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: "That task was not found",
      });
    }

    return res.status(StatusCodes.OK).json(result.rows[0]);
  } catch (e) {
    if (next) return next(e);
    throw e;
  }
};

const update = async(req, res, next) => {
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
    const result = await pool.query(
      `UPDATE tasks
       SET title = COALESCE($1, title),
           is_completed = COALESCE($2, is_completed)
       WHERE id = $3 AND user_id = $4
       RETURNING id, title, is_completed`,
      [value.title, value.isCompleted, taskId, global.user_id]
    );

    if (result.rows.length === 0) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: "That task was not found",
      });
    }

    return res.status(StatusCodes.OK).json(result.rows[0]);
  } catch (e) {
    if (next) return next(e);
    throw e;
  }
};

const deleteTask = async(req, res, next) => {
  const taskId = parseInt(req.params?.id, 10);

  if (!taskId) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      message: "The task ID passed is not valid.",
    });
  }

  try {
    const result = await pool.query(
      `DELETE FROM tasks
       WHERE id = $1 AND user_id = $2
       RETURNING id, title, is_completed`,
      [taskId, global.user_id]
    );

    if (result.rows.length === 0) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: "That task was not found",
      });
    }

    return res.status(StatusCodes.OK).json(result.rows[0]);
  } catch (e) {
    if (next) return next(e);
    throw e;
  }
};

module.exports = {
  create,
  index,
  show,
  update,
  deleteTask,
};
