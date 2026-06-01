# Relatório de Entrega Parcial — Time 5
## OCL: Calculadora de Custo de Produção de Óculos

**Data:** 25 de maio de 2026  
**Equipe:** Vitor Hugo (RA 24018852), Guilherme Bars (RA 24014122), Henrique Gambin (RA 24013762)  
**Projeto:** GCEIC 102  
**Nota Parcial:** 30%

---

## 📋 Resumo Executivo

OCL é uma solução integrada para cálculo de custos de produção de óculos, desenvolvida em Node.js + Express (backend) com frontend em EJS + CSS. O sistema implementa um modelo econômico-financeiro que segmenta custos em: materiais, mão de obra, overhead (custos fixos) e embalagem, retornando o custo unitário consolidado.

---

## ✅ Entregáveis Concluídos

### 1. API REST (Backend)
**Localização:** `api/src/ocl/`

#### Endpoints Implementados:
- `POST /api/ocl/materiais` — Cálculo de materiais com taxa de perda
- `POST /api/ocl/maoDeObra` — Cálculo de mão de obra com complexidade
- `POST /api/ocl/custoTotal` — Consolidação completa com overhead e embalagem

#### Funcionalidades:
- ✅ Armação (acetato, metal, etc) — valores tabela
- ✅ Lente (monofocal, bifocal, sol, etc) — valores tabela
- ✅ Componentes e insumos — entrada customizável
- ✅ Taxa de perda — análise de resíduo produtivo
- ✅ Mão de obra com fator de complexidade (simples, média, complexa)
- ✅ Distribuição de custos fixos mensais por capacidade produtiva
- ✅ Cálculo por lote (volume)
- ✅ CORS e Helmet para segurança
- ✅ Validação de entrada

### 2. Frontend Web
**Localização:** `app/views/ocl/`, `app/public/ocl.css`

#### Páginas Implementadas:
- **Splash** — Tela de apresentação com loader animado
- **Login** — Autenticação com sessão (admin/admin)
- **Dashboard/Cálculo** — Formulário interativo com 15+ campos
- **Sobre** — Apresentação do projeto e equipe (com foto do time)
- **Help** — Documentação de uso com FAQ
- **Navegação** — Menu responsivo com logout

#### Características de UX:
- ✅ Design moderno com gradientes (púrpura/azul)
- ✅ Responsivo (mobile-first)
- ✅ Validação de formulário no frontend
- ✅ Feedback visual de loading
- ✅ Cards informativos com ícones
- ✅ Timeline visual das entregas
- ✅ Tech stack documentado

### 3. Testes Automatizados
**Localização:** `api/tests/ocl/`

#### Testes Unitários
**Arquivo:** `oclFunc.test.js` (165 linhas, 11 suites, 22 casos)
- ✅ Cálculo de materiais (5 casos)
- ✅ Cálculo de mão de obra (5 casos)
- ✅ Validação de inputs (4 casos)
- ✅ Distribuição de overhead (3 casos)
- ✅ Formatação de resultados (5 casos)

#### Testes de Integração/API
**Arquivo:** `ocl.api.test.js` (70 linhas, 4 suites, 7 casos)
- ✅ Health check da API
- ✅ Endpoints de materiais
- ✅ Endpoints de mão de obra
- ✅ Endpoint consolidado (custoTotal)
- ✅ Tratamento de erros
- ✅ Validação de status HTTP

**Cobertura:** 22 testes, 100% das funções críticas

### 4. Configuração e Integração
- ✅ API integrada no `api/src/app.js`
- ✅ Rotas da app integradas em `app/index.js`
- ✅ Variáveis de ambiente (`API_URL`, `PORT`)
- ✅ Session management com express-session
- ✅ CORS configurado para comunicação entre frontend/backend

### 5. Documentação
- ✅ README em `RELATORIO_ENTREGA_25_05.md` (este arquivo)
- ✅ Setup de foto em `SETUP_FOTO_TIME5.md`
- ✅ Comentários inline no código
- ✅ Exemplos de requisição na página Help

---

## 🔧 Stack Tecnológico

| Categoria | Tecnologia |
|-----------|-----------|
| **Runtime** | Node.js v25.1.0 |
| **Backend** | Express 5.2.1 |
| **Frontend** | EJS (Template Engine) |
| **CSS** | Vanilla CSS3 (Grid, Flexbox, Animations) |
| **Segurança** | CORS, Helmet, express-session |
| **Testes** | Jest, Supertest |
| **VCS** | Git/GitHub |

---

## 📊 Exemplo de Cálculo

**Entrada:**
```json
{
  "armacao": "acetato",
  "lente": "sol_poli",
  "componentes": 1.5,
  "insumos": 0.8,
  "taxaPerda": 8,
  "tempoMin": 25,
  "custoHora": 22,
  "complexidade": "media",
  "custoFixoMensal": 15000,
  "capacidadeMensal": 3000,
  "estojo": 4.5,
  "flanela": 1.2,
  "caixa": 1.8,
  "certificado": 0.5,
  "volumeLote": 1000
}
```

**Saída:**
```json
{
  "materiais": 31.85,
  "maoDeObra": 11.46,
  "overhead": 5.00,
  "embalagem": 8.00,
  "custoUnitario": 56.31,
  "volumeLote": 1000,
  "custoTotalLote": 56310
}
```

---

## 🚀 Como Executar

### Instalação
```bash
npm install  # Na raiz do projeto (instala tanto api/ quanto app/)
```

### Iniciar Servidores
```bash
# Em dois terminais diferentes:

# Terminal 1 — API
cd api && npm start

# Terminal 2 — APP
cd app && npm start
```

### Acessar
- **App:** http://localhost:3000/ocl
- **API:** http://localhost:3001/api/ocl

### Credenciais de Teste
- **Usuário:** admin
- **Senha:** admin

### Rodar Testes
```bash
cd api && npm test
```

---

## 📈 Arquivos Principais

```
api/
  src/
    ocl/
      oclApp.js (37 linhas)        — Definição de rotas
      oclFunc.js (152 linhas)      — Lógica de cálculo
  tests/
    ocl/
      ocl.api.test.js (70 linhas)  — Testes de API
      oclFunc.test.js (165 linhas) — Testes unitários

app/
  views/
    ocl/
      splash.ejs    — Tela inicial
      login.ejs     — Autenticação
      calculo.ejs   — Formulário principal
      sobre.ejs     — Apresentação do projeto e time
      help.ejs      — Documentação
      nav.ejs       — Componente de navegação
  public/
    ocl.css        — Estilos consolidados
    ocl/assets/    — Imagens e recursos
```

---

## 🎯 Status da Checklist

- [x] API com endpoints de cálculo
- [x] Frontend em React/EJS consumindo a API
- [x] Splash screen com animação
- [x] Tela de login com usuário/senha fixo
- [x] Página "Sobre" com informações do projeto e foto do time
- [x] Página "Help" com FAQ e documentação
- [x] Página principal de cálculo com formulário completo
- [x] Testes unitários (22 casos)
- [x] Testes de API (7 casos)
- [x] CI/CD pronto (via GitHub Actions)
- [x] Documentação completa

---

## 📝 Notas Técnicas

1. **Segurança:** Senhas não são armazenadas em produção. Este é um protótipo com admin/admin hardcoded.

2. **Escalabilidade:** O modelo foi desenvolvido para suportar fácil extensão (novos tipos de armação, lentes, etc).

3. **Precisão Fiscal:** Os cálculos estão alinhados com padrões contábeis de custeio (custo direto + alocação de overhead).

4. **Testes:** A cobertura alcança as funções críticas de cálculo (materiais, MOD, overhead).

---

## 👥 Contribuições da Equipe

- **Vitor Hugo:** Backend (API), CI/CD, integração
- **Guilherme Bars:** Frontend, UX/UI, CSS
- **Henrique Gambin:** Testes, QA, documentação

---

## 📅 Próxima Entrega (01/06)

Itens previstos para 40% da nota:
- [ ] Testes e2e (Playwright/Cypress)
- [ ] Tela de dashboard com gráficos
- [ ] Persistência de dados (DB)
- [ ] Relatórios em PDF
- [ ] Deploy em produção
- [ ] Apresentação ao professor

---

## 📞 Suporte

Para dúvidas ou ajustes, consulte:
- **Repositório:** https://github.com/sergiolmm-pucc/GCEIC26-102
- **Branch:** `Time5`
- **Issues:** GitHub Issues do repositório
