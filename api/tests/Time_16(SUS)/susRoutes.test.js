const request = require("supertest");
const app = require("../../src/app");

describe("Rotas /SUS", () => {

  test("GET /SUS/health responde 200", async () => {
    const res = await request(app).get("/SUS/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
  });

  test("GET /SUS/tabelas devolve fatores e dietas", async () => {
    const res = await request(app).get("/SUS/tabelas");
    expect(res.status).toBe(200);
    expect(res.body.transportes).toBeDefined();
    expect(res.body.dietas).toBeDefined();
  });

  test("POST /SUS/emissao-transporte - sucesso", async () => {
    const res = await request(app)
      .post("/SUS/emissao-transporte")
      .send({ transporte: "carro_etanol", km: 20 });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.emissao_kg_co2).toBeGreaterThan(0);
  });

  test("POST /SUS/emissao-transporte - erro 400 com transporte invalido", async () => {
    const res = await request(app)
      .post("/SUS/emissao-transporte")
      .send({ transporte: "barco-foguete", km: 10 });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test("POST /SUS/pegada-mensal - sucesso", async () => {
    const res = await request(app)
      .post("/SUS/pegada-mensal")
      .send({
        kmPorTransporte: { onibus: 200 },
        energiaKwh: 150,
        dieta: "vegetariana",
        pessoasCasa: 3
      });
    expect(res.status).toBe(200);
    expect(res.body.data.total_kg_co2).toBeGreaterThan(0);
  });

  test("POST /SUS/pegada-mensal - 400 com dieta errada", async () => {
    const res = await request(app)
      .post("/SUS/pegada-mensal")
      .send({ kmPorTransporte:{}, energiaKwh: 0, dieta: "frugivora" });
    expect(res.status).toBe(400);
  });

  test("POST /SUS/compensacao-arvores - sucesso", async () => {
    const res = await request(app)
      .post("/SUS/compensacao-arvores")
      .send({ kg_co2: 100 });
    expect(res.status).toBe(200);
    expect(res.body.data.arvores_necessarias).toBe(5);
  });

  test("POST /SUS/compensacao-arvores - 400 com kg negativo", async () => {
    const res = await request(app)
      .post("/SUS/compensacao-arvores")
      .send({ kg_co2: -10 });
    expect(res.status).toBe(400);
  });
});
