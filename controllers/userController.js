const { StatusCodes } = require("http-status-codes");
const { userSchema } = require("../validation/userSchema");
const { hashPassword, comparePassword } = require("../utils/passwordUtils");
const pool = require("../db/pg-pool");

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
  value.hashed_password = await hashPassword(value.password);

  try {
    const user = await pool.query(
      `INSERT INTO users (email, name, hashed_password)
       VALUES ($1, $2, $3)
       RETURNING id, email, name`,
      [value.email, value.name, value.hashed_password]
    );

    global.user_id = user.rows[0].id;

    return res.status(StatusCodes.CREATED).json({
      name: user.rows[0].name,
      email: user.rows[0].email,
    });
  } catch (e) {
    if (e.code === "23505") {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "Email already registered",
      });
    }

    return next(e);
  }
};

const logon = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    if (result.rows.length === 0) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        message: "Authentication Failed",
      });
    }

    const foundUser = result.rows[0];

    const passwordMatches = await comparePassword(
      password,
      foundUser.hashed_password
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
  } catch (e) {
    return next(e);
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
