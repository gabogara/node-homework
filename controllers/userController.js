const { StatusCodes } = require("http-status-codes");
const { userSchema } = require("../validation/userSchema");
const { hashPassword, comparePassword } = require("../utils/passwordUtils");

const register = async (req, res) => {
  if (!req.body) req.body = {};

  const { error, value } = userSchema.validate(req.body, {
    abortEarly: false,
  });

  if (error) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      message: error.message,
    });
  }
  const hashedPassword = await hashPassword(value.password);

  const newUser = {
    name: value.name,
    email: value.email,
    hashedPassword,
  };
  global.users.push(newUser);
  global.user_id = newUser;

  return res.status(StatusCodes.CREATED).json({
    name: newUser.name,
    email: newUser.email,
  });
};

const logon = async (req, res) => {
  const { email, password } = req.body;

  const foundUser = global.users.find((user) => user.email === email);

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

  global.user_id = foundUser;

  return res.status(StatusCodes.OK).json({
    name: foundUser.name,
    email: foundUser.email,
  });
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
