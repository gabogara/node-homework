const { StatusCodes } = require("http-status-codes");
const { taskSchema, patchTaskSchema } = require("../validation/taskSchema");

const taskCounter = (() => {
  let lastTaskNumber = 0;
  return () => {
    lastTaskNumber += 1;
    return lastTaskNumber;
  };
})();

const sanitizeTask = (task) => {
  const { userId, ...sanitizedTask } = task;
  return sanitizedTask;
};

const getTaskId = (req) => {
  const taskId = parseInt(req.params?.id);

  if (!taskId) {
    return null;
  }

  return taskId;
};

const create = (req, res) => {
  if (!req.body) req.body = {};

  const { error, value } = taskSchema.validate(req.body, {
    abortEarly: false,
  });

  if (error) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      message: error.message,
    });
  }

  const newTask = {
    ...value,
    id: taskCounter(),
    userId: global.user_id.email,
  };

  global.tasks.push(newTask);

  return res.status(StatusCodes.CREATED).json(sanitizeTask(newTask));
};

const index = (req, res) => {
  const userTasks = global.tasks.filter(
    (task) => task.userId === global.user_id.email
  );
  if (userTasks.length === 0) {
    return res.status(StatusCodes.NOT_FOUND).json({
      message: "That task was not found",
    });
  }
  const sanitizedTasks = userTasks.map(sanitizeTask);

  return res.status(StatusCodes.OK).json(sanitizedTasks);
};

const show = (req, res) => {
  const taskId = getTaskId(req);

  if (!taskId) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      message: "The task ID passed is not valid.",
    });
  }

  const task = global.tasks.find(
    (task) => task.id === taskId && task.userId === global.user_id.email
  );

  if (!task) {
    return res.status(StatusCodes.NOT_FOUND).json({
      message: "That task was not found",
    });
  }

  return res.status(StatusCodes.OK).json(sanitizeTask(task));
};

const update = (req, res) => {
  const taskId = getTaskId(req);

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

  const currentTask = global.tasks.find(
    (task) => task.id === taskId && task.userId === global.user_id.email
  );

  if (!currentTask) {
    return res.status(StatusCodes.NOT_FOUND).json({
      message: "That task was not found",
    });
  }

  Object.assign(currentTask, value);

  return res.status(StatusCodes.OK).json(sanitizeTask(currentTask));
};

const deleteTask = (req, res) => {
  const taskId = getTaskId(req);

  if (!taskId) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      message: "The task ID passed is not valid.",
    });
  }

  const taskIndex = global.tasks.findIndex(
    (task) => task.id === taskId && task.userId === global.user_id.email
  );

  if (taskIndex === -1) {
    return res.status(StatusCodes.NOT_FOUND).json({
      message: "That task was not found",
    });
  }

  const deletedTask = sanitizeTask(global.tasks[taskIndex]);
  global.tasks.splice(taskIndex, 1);

  return res.status(StatusCodes.OK).json(deletedTask);
};

module.exports = {
  create,
  index,
  show,
  update,
  deleteTask,
};
