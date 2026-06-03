require("dotenv").config();
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;

const { EventEmitter } = require("events");
const waitForRouteHandlerCompletion = require("./waitForRouteHandlerCompletion");
const prisma = require("../db/prisma");
const httpMocks = require("node-mocks-http");
const { register, logoff, logon } = require("../controllers/userController");
const jwtMiddleware = require("../middleware/jwtMiddleware");
const jwt = require("jsonwebtoken");

let saveRes = null;
let saveData = null;

const cookie = require("cookie");

function MockResponseWithCookies() {
  const res = httpMocks.createResponse({
    eventEmitter: EventEmitter,
  });

  res.cookie = (name, value, options = {}) => {
    const serialized = cookie.serialize(name, String(value), options);
    let currentHeader = res.getHeader("Set-Cookie");

    if (currentHeader === undefined) {
      currentHeader = [];
    }

    currentHeader.push(serialized);
    res.setHeader("Set-Cookie", currentHeader);
  };

  return res;
}

beforeAll(async () => {
  await prisma.task.deleteMany();
  await prisma.user.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
});

let jwtCookie;

describe("testing logon, register, and logoff", () => {
  it("33. A user can be registered.", async () => {
    const req = httpMocks.createRequest({
      method: "POST",
      body: {
        name: "Bob",
        email: "bob@sample.com",
        password: "Pa$$word20",
      },
    });

    saveRes = MockResponseWithCookies();

    await waitForRouteHandlerCompletion(register, req, saveRes);

    expect(saveRes.statusCode).toBe(201);
  });

  it("34. The user can logon.", async () => {
    const req = httpMocks.createRequest({
      method: "POST",
      body: {
        email: "bob@sample.com",
        password: "Pa$$word20",
      },
    });

    saveRes = MockResponseWithCookies();

    await waitForRouteHandlerCompletion(logon, req, saveRes);

    expect(saveRes.statusCode).toBe(200);
  });
});