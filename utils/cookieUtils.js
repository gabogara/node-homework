const { randomUUID } = require("crypto");
const jwt = require("jsonwebtoken");

const cookieFlags = () => {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
    path: "/",
  };
};

const setJwtCookie = (res, user) => {
  const payload = {
    id: user.id,
    csrfToken: randomUUID(),
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });

  res.cookie("jwt", token, {
    ...cookieFlags(),
    maxAge: 3600000,
  });

  return payload.csrfToken;
};

module.exports = {
  cookieFlags,
  setJwtCookie,
};
