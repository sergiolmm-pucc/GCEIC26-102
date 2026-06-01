// funcionando

const request = require("supertest");
const app = require("../../src/app");

describe("Teste para ver se a API está no ar (Health)", () => {
  test("Deve retornar 200 para a chamada", async () => {
    const res = await request(app).get("/ETEC11/health");
    expect(res.status).toBe(200);
  });
});
