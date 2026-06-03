require("dotenv").config();
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;

const { EventEmitter } = require("events");
const prisma = require("../db/prisma");
const httpMocks = require("node-mocks-http");
const waitForRouteHandlerCompletion = require("./waitForRouteHandlerCompletion");

const {
  index,
  show,
  create,
  update,
  deleteTask,
} = require("../controllers/taskController");

let user1 = null;
let user2 = null;
let saveRes = null;
let saveData = null;
let saveTaskId = null;

beforeAll(async () => {
  await prisma.task.deleteMany();
  await prisma.user.deleteMany();

  user1 = await prisma.user.create({
    data: {
      name: "Bob",
      email: "bob@sample.com",
      hashedPassword: "nonsense",
    },
  });

  user2 = await prisma.user.create({
    data: {
      name: "Alice",
      email: "alice@sample.com",
      hashedPassword: "nonsense",
    },
  });
});

afterAll(async () => {
  await prisma.$disconnect();
});
