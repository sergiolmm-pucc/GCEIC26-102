# Relatório de Atividade - Grupo 16

**Disciplina:** GCEIC - Turma 102
**Tema:** Calculadora de Sustentabilidade
**Branch:** `Time_16(SUS)`

## Integrantes

| Nome | RA |
|------|----|
| Felipe Andretta | 23007744 |
| Gabriel Lopes  | 24005520 |

## Descrição do projeto

A Calculadora de Sustentabilidade ajuda o usuário a entender e diminuir
o impacto que suas atividades diárias têm no meio ambiente. O projeto
foi dividido em três calculadoras:

1. **Emissão de CO₂ por transporte** - escolhe o modal (carro a gasolina,
   etanol, diesel, moto, ônibus, metrô, bicicleta, a pé, avião) e a
   distância em km, e a API devolve quanto CO₂ aquela viagem gerou.
2. **Pegada de carbono mensal** - soma transporte + energia elétrica
   (rateada pelo número de moradores) + alimentação (dieta carnívora,
   mista, vegetariana ou vegana). Resultado em kg de CO₂ no mês.
3. **Compensação por árvores** - dada uma quantidade de CO₂, devolve
   quantas árvores adultas seriam necessárias para absorver isso em 1
   ano (referência: 22 kg CO₂/ano por árvore) e dá um custo estimado
   de plantio em R$.

## Divisão do trabalho

Como o grupo tem 2 alunos (o enunciado pede pelo menos 1 API por aluno),
a divisão ficou:

- **Felipe Andretta** - APIs `POST /SUS/emissao-transporte` e
  `POST /SUS/pegada-mensal` + telas do front correspondentes + CSS.
- **Gabriel Lopes** - API `POST /SUS/compensacao-arvores` + tela do
  front + integração com a tela de pegada mensal (botão "compensar
  com árvores") + foto da equipe + relatório.

Os dois trabalharam juntos nos testes funcionais e na apresentação.

## Stack utilizada

| Camada | Tecnologia |
|--------|------------|
| API    | Node.js + Express + Helmet + CORS |
| Front  | Express + EJS + CSS puro (segue o padrão dos outros grupos do repo) |
| Testes unitários | Jest + Supertest |
| Testes funcionais | Selenium WebDriver (Chrome headless) |
| CI/CD  | GitHub Actions (já configurado no repositório do professor) + deploy em Render/Vercel |

> **Observação sobre React:** o enunciado pede uma "app em React".
> Olhamos o `main` do repositório e todos os outros grupos estão usando
> EJS (Express + templates server-side), então mantivemos o mesmo padrão
> para que o app fique integrado ao mesmo servidor que serve todas as
> calculadoras dos outros times.

## Endpoints da API

Base: `https://gceic26-102.onrender.com/SUS` (ou local em `http://localhost:3001/SUS`)

| Método | Rota | Descrição |
|--------|------|-----------|
| GET    | `/health` | Healthcheck do módulo |
| GET    | `/tabelas` | Fatores de emissão e dietas usados |
| POST   | `/emissao-transporte` | `{ transporte, km }` → kg CO₂ |
| POST   | `/pegada-mensal` | `{ kmPorTransporte, energiaKwh, pessoasCasa, dieta }` → resumo mensal |
| POST   | `/compensacao-arvores` | `{ kg_co2 }` → nº de árvores + custo |

### Exemplos de uso

```bash
# emissao de 50km de carro a gasolina
curl -X POST https://gceic26-102.onrender.com/SUS/emissao-transporte \
  -H "Content-Type: application/json" \
  -d '{"transporte":"carro_gasolina","km":50}'

# quantas arvores compensam 100kg de CO2
curl -X POST https://gceic26-102.onrender.com/SUS/compensacao-arvores \
  -H "Content-Type: application/json" \
  -d '{"kg_co2":100}'
```

## Telas do app

| Rota | Descrição |
|------|-----------|
| `/sus` | Splash (redireciona pro login após ~1.8s) |
| `/sus/login` | Login (usuário `admin` / senha `admin`) |
| `/sus/dashboard` | Menu inicial com os 3 cards |
| `/sus/transporte` | Calculadora 1 |
| `/sus/pegada` | Calculadora 2 |
| `/sus/arvores` | Calculadora 3 |
| `/sus/sobre` | Foto e descrição da equipe |
| `/sus/help` | Manual rápido de uso |
| `/sus/logout` | Encerra sessão |

## Fontes / referências

- Fatores de emissão de CO₂ por transporte: MCTIC / IPCC (médias adotadas
  na maioria das calculadoras de carbono brasileiras).
- Absorção de CO₂ por árvore adulta: ~22 kg/ano, referência usada por
  iniciativas como SOS Mata Atlântica e Iniciativa Verde.
- Fator de emissão da matriz elétrica brasileira: 0,0817 kg CO₂/kWh
  (referência média anual do SIN).

## Resultados de teste

- **Testes unitários (Jest):** 30/30 passando (16 nas funções + 8 nas
  rotas + 6 do restante do projeto não foram alterados).
- **Testes funcionais (Selenium):** 7 cenários cobertos (splash, login
  errado, login certo, transporte, pegada, árvores, sobre/help). Cada
  cenário gera um screenshot em `e2e-tests/screenshots/SUS-*.png`.

## Deploy

A API e o app já são publicados pelo workflow `.github/workflows/deploy.yml`
do professor (push pra `main` ou `dev`). Para deploy independente,
ficamos com Vercel configurada como plano B (arquivos `vercel.json`
ficam dentro de `api/` e `app/`).
