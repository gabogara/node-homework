const { StatusCodes } = require("http-status-codes");
const { userSchema } = require("../validation/userSchema");

const register = (req, res) => {
  if (!req.body) req.body = {};

  const { error, value } = userSchema.validate(req.body, {
    abortEarly: false,
  });

  if (error) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      message: error.message,
    });
  }

  const newUser = { ...value };
  global.users.push(newUser);
  global.user_id = newUser;

  const userResponse = { ...value };
  delete userResponse.password;

  return res.status(StatusCodes.CREATED).json(userResponse);
};

const logon = (req, res) => {
  const { email, password } = req.body;

  const foundUser = global.users.find((user) => user.email === email);

  if (!foundUser || foundUser.password !== password) {
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
