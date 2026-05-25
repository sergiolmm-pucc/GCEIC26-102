# Dev PJ Tax - Grupo 12

Projeto da Atividade 2 de Gerencia de Configuracao, Entrega e Integracao Continua.

## Tema

Calculo de impostos para desenvolvedores que trabalham como PJ.

## Tecnologias

- Backend: Node.js, Express e testes com `node:test`.
- Frontend: React, Vite e lucide-react.
- CI/CD: GitHub Actions em `.github/workflows/grupo-12-ci.yml`.

## Credenciais fixas

- Usuario: `grupo12`
- Senha: `grupo12`

## Como rodar o backend

```bash
cd grupos/grupo-12/backend
npm install
npm start
```

API local: `http://localhost:3012`

## Como rodar o frontend

```bash
cd grupos/grupo-12/frontend
npm install
npm run dev
```

Frontend local: `http://localhost:51712`

Se necessario, configure outra URL de API com `VITE_GRUPO12_API_URL`.

## Endpoints

Todos os endpoints usam prefixo exclusivo do Grupo 12.

| Metodo | Endpoint | Descricao |
| --- | --- | --- |
| GET | `/api/grupo12/health` | Status da API. |
| POST | `/api/grupo12/faturamento-mensal` | Calcula receita por valor hora e horas trabalhadas, ou usa receita mensal informada. |
| POST | `/api/grupo12/impostos-pj` | Simula imposto do Simples Nacional com aliquota nominal, deducao e aliquota efetiva. |
| POST | `/api/grupo12/pro-labore-inss` | Calcula INSS estimado e pro-labore liquido. |
| POST | `/api/grupo12/reservas` | Calcula reservas de impostos, ferias e emergencia. |
| POST | `/api/grupo12/simulador` | Gera simulacao completa com imposto, INSS, reserva e liquido estimado. |

## Exemplos de payload

### Impostos PJ

```json
{
  "receitaMensal": 10000,
  "receitaAnualEstimativa": 120000,
  "aliquota": 6,
  "deducao": 0
}
```

### Simulador completo

```json
{
  "receitaMensal": 10000,
  "proLabore": 3000,
  "percentualImposto": 6,
  "percentualINSS": 11,
  "percentualReserva": 10
}
```

## Como rodar os testes

Backend:

```bash
cd grupos/grupo-12/backend
npm test
```

Frontend:

```bash
cd grupos/grupo-12/frontend
npm test
```

## Explicacao dos calculos

- Faturamento mensal: usa `receitaMensal` quando informada, ou calcula `valorHora * horasTrabalhadas`.
- Simples Nacional: calcula aliquota efetiva aproximada por `(receitaAnualEstimativa * aliquota - deducao) / receitaAnualEstimativa`.
- Pro-labore e INSS: calcula `proLabore * percentualINSS`.
- Reservas: separa percentuais para impostos, ferias e emergencia.
- Simulador completo: desconta imposto estimado, INSS sobre pro-labore e reserva configuravel da receita mensal.

## Aviso

Os valores sao estimativas educacionais e nao substituem consultoria contabil oficial. Consulte um contador antes de tomar decisoes fiscais.

## Cronograma de implantacao

| Etapa | Entrega |
| --- | --- |
| 1 | Estrutura do projeto, branch e organizacao. |
| 2 | Criacao das APIs Node. |
| 3 | Criacao das telas React. |
| 4 | Integracao frontend/backend. |
| 5 | Testes unitarios. |
| 6 | Testes funcionais. |
| 7 | CI/CD. |
| 8 | Revisao final e apresentacao. |
