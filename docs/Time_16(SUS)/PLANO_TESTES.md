# Plano de testes - Grupo 16 (SUS)

## 1. Testes unitários (API - Jest)

Arquivos:
- `api/tests/Time_16(SUS)/susFuncoes.test.js` - 22 testes nas funções puras
- `api/tests/Time_16(SUS)/susRoutes.test.js` - 8 testes nas rotas Express

### Como rodar

```bash
cd api
npm install
npx jest --testPathPatterns=Time_16
```

### Cobertura

#### `calcularEmissaoTransporte`
- [x] Cálculo correto pra carro a gasolina por 10km (esperado: 1.92 kg)
- [x] Bicicleta e a pé retornam 0
- [x] Aceita km = 0
- [x] Falha quando o transporte não está cadastrado
- [x] Falha com km negativo
- [x] Falha quando `dados` é null
- [x] Falha quando `transporte` não é string

#### `calcularPegadaMensal`
- [x] Caso completo: transporte + energia + dieta mista (soma correta)
- [x] Dieta vegana tem emissão menor que carnívora
- [x] Falha com dieta desconhecida
- [x] Falha com energia negativa
- [x] Falha com `pessoasCasa` = 0
- [x] Falha se um transporte do mapa não estiver cadastrado
- [x] Mês zerado em tudo ainda contabiliza alimentação

#### `calcularCompensacaoArvores`
- [x] 22 kg → 1 árvore
- [x] 44 kg → 2 árvores
- [x] 10 kg arredonda pra cima → 1 árvore
- [x] 0 kg → 0 árvores e custo 0
- [x] Custo mínimo sempre ≤ custo máximo
- [x] Falha com valor negativo
- [x] Falha com valor não numérico
- [x] Constante `CO2_POR_ARVORE_ANO` = 22

#### Rotas Express (supertest)
- [x] `GET /SUS/health` → 200 + `status:"ok"`
- [x] `GET /SUS/tabelas` → 200 + transportes e dietas
- [x] `POST /SUS/emissao-transporte` ok → 200
- [x] `POST /SUS/emissao-transporte` com transporte inválido → 400
- [x] `POST /SUS/pegada-mensal` ok → 200
- [x] `POST /SUS/pegada-mensal` com dieta errada → 400
- [x] `POST /SUS/compensacao-arvores` ok → 200 com `arvores_necessarias` certo
- [x] `POST /SUS/compensacao-arvores` com kg negativo → 400

## 2. Testes funcionais (Selenium - Chrome headless)

Arquivo: `e2e-tests/tests/sus/sus-all-screens.test.js`

### Como rodar

Antes: subir API (porta 3001) e App (porta 3000).

```bash
cd e2e-tests
npm install
node tests/sus/sus-all-screens.test.js
```

Os screenshots ficam salvos em `e2e-tests/screenshots/SUS-*.png`.

### Cenários cobertos

| # | Cenário | O que valida |
|---|---------|--------------|
| 1 | Splash | Carrega `/sus` e redireciona pra `/sus/login` |
| 2 | Login inválido | Mostra mensagem de erro com credenciais erradas |
| 3 | Login válido | `admin/admin` redireciona pro dashboard |
| 4 | Calc. transporte | Submete `km=20` e vê resultado em kg de CO₂ |
| 5 | Pegada mensal | Submete `energiaKwh=150` e mostra total |
| 6 | Árvores | `kg_co2=44` deve resultar em 2 árvores |
| 7 | Sobre + Help | Sobre lista integrantes; help abre sem erro |

## 3. Critérios de aceitação manual

Antes da apresentação:

- [ ] Foto da equipe no caminho `app/public/img/Time_16_SUS.jpg`
- [ ] API publicada e respondendo em `/SUS/health`
- [ ] App publicado e fluxo splash → login → dashboard funcionando
- [ ] Botão "Compensar com árvores" da tela de pegada leva pro cálculo de árvores com o kg preenchido
- [ ] Tela help abre em todos os navegadores (Chrome, Firefox, Edge)
- [ ] Logout volta pra tela de login
