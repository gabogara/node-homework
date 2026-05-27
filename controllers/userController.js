const { StatusCodes } = require("http-status-codes");
const { userSchema } = require("../validation/userSchema");
const { hashPassword, comparePassword } = require("../utils/passwordUtils");
const prisma = require("../db/prisma");
const { randomUUID } = require("crypto");
const jwt = require("jsonwebtoken");

const cookieFlags = (req) => {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
  };
};

const setJwtCookie = (req, res, user) => {
  const payload = {
    id: user.id,
    csrfToken: randomUUID(),
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });

  res.cookie("jwt", token, {
    ...cookieFlags(req),
    maxAge: 3600000,
  });

  return payload.csrfToken;
};

const register = async (req, res, next) => {
  if (!req.body) req.body = {};

  const { error, value } = userSchema.validate(req.body, {
    abortEarly: false,
  });

  if (error) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      message: "Validation failed",
      details: error.details,
    });
  }
  const hashedPassword = await hashPassword(value.password);

  const { name, email } = value;

  try {
    const result = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: { email, name, hashedPassword },
        select: { id: true, email: true, name: true },
      });

      const welcomeTaskData = [
        {
          title: "Complete your profile",
          userId: newUser.id,
          priority: "medium",
        },
        { title: "Add your first task", userId: newUser.id, priority: "high" },
        { title: "Explore the app", userId: newUser.id, priority: "low" },
      ];

      await tx.task.createMany({ data: welcomeTaskData });

      const welcomeTasks = await tx.task.findMany({
        where: {
          userId: newUser.id,
          title: { in: welcomeTaskData.map((task) => task.title) },
        },
        select: {
          id: true,
          title: true,
          isCompleted: true,
          userId: true,
          priority: true,
        },
      });

      return { user: newUser, welcomeTasks };
    });

    const csrfToken = setJwtCookie(req, res, result.user);

    res.status(StatusCodes.CREATED);
    res.json({
      user: result.user,
      welcomeTasks: result.welcomeTasks,
      transactionStatus: "success",
      csrfToken,
    });
    return;
  } catch (err) {
    if (err.code === "P2002") {
      return res.status(StatusCodes.BAD_REQUEST).json({
        error: "Email already registered",
      });
    }

    if (next) return next(err);
    throw err;
  }
};

const logon = async (req, res, next) => {
  let { email, password } = req.body;
  email = email.toLowerCase();

  try {
    const foundUser = await prisma.user.findUnique({
      where: { email },
    });

    if (!foundUser) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        message: "Authentication Failed",
      });
    }

    const passwordMatches = await comparePassword(
      password,
      foundUser.hashedPassword
    );
    if (!passwordMatches) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        message: "Authentication Failed",
      });
    }

    global.user_id = foundUser.id;

    return res.status(StatusCodes.OK).json({
      name: foundUser.name,
      email: foundUser.email,
    });
  } catch (err) {
    if (next) return next(err);
    throw err;
  }
};

const logoff = (req, res) => {
  global.user_id = null;
  return res.sendStatus(StatusCodes.OK);
};

module.exports = {
  register,
  logon,
  logoff,
};
