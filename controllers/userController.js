const { StatusCodes } = require("http-status-codes");
const { userSchema } = require("../validation/userSchema");
const { hashPassword, comparePassword } = require("../utils/passwordUtils");
const prisma = require("../db/prisma");

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

  try {
    const user = await prisma.user.create({
      data: {
        name: value.name,
        email: value.email,
        hashedPassword,
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    global.user_id = user.id;

    return res.status(StatusCodes.CREATED).json({
      name: user.name,
      email: user.email,
    });
  } catch (err) {
    if (err.name === "PrismaClientKnownRequestError" && err.code === "P2002") {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "Email already registered",
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
