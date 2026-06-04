require("dotenv").config();
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;

const request = require("supertest");
const prisma = require("../db/prisma");

const { app, server } = require("../app");

let agent;
let saveRes;

beforeAll(async () => {
  await prisma.task.deleteMany();
  await prisma.user.deleteMany();

  agent = request.agent(app);
});

afterAll(async () => {
  await prisma.$disconnect();
  server.close();
});

describe("testing actual network operations", () => {
  it("46. it creates the user entry", async () => {
    const newUser = {
      name: "John Deere",
      email: "jdeere@example.com",
      password: "Pa$$word20",
    };

    saveRes = await agent.post("/api/users/register").send(newUser);

    expect(saveRes.status).toBe(201);
  });
});

it("47. Registration returns an object with the expected name.", () => {
  expect(saveRes.body.user.name).toBe("John Deere");
});

it("48. Test that the returned object includes a csrfToken.", () => {
  expect(saveRes.body.csrfToken).toBeDefined();
});

