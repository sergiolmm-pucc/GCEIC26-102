# Deploy no Vercel (plano B)

O repositório do professor já publica em Render via o workflow
`.github/workflows/deploy.yml`. Caso a equipe queira ter o seu próprio
ambiente publicado no Vercel (pra demo na apresentação, por exemplo),
abaixo está o passo a passo.

## API

> Antes do primeiro deploy, copie o `vercel-api.json` desta pasta pra
> `api/vercel.json`:
>
> ```bash
> cp docs/Time_16\(SUS\)/vercel-api.json api/vercel.json
> ```

```bash
cd api
npx vercel deploy --prod
```

No primeiro deploy, o Vercel pergunta:
- **Set up and deploy?** → Yes
- **Which scope?** → seu usuário/time
- **Link to existing project?** → No
- **Project name?** → `sus-api-time16`
- **In which directory is your code located?** → `./`
- **Framework Preset** → Other
- **Build Command** → (em branco)
- **Output Directory** → (em branco)
- **Development Command** → (em branco)

A API sobe em algo tipo `https://sus-api-time16.vercel.app`.
Health check: `https://sus-api-time16.vercel.app/SUS/health`.

## App

Antes copia também:

```bash
cp docs/Time_16\(SUS\)/vercel-app.json app/vercel.json
```

Repete o mesmo passo dentro de `app/`:

```bash
cd app
npx vercel deploy --prod --env API_URL=https://sus-api-time16.vercel.app
```

> Importante: passar `API_URL` apontando pra URL da API publicada.

## Variáveis de ambiente

| Var | Onde | Default | Pra que serve |
|-----|------|---------|---------------|
| `PORT` | api, app | 3001 / 3000 | Porta de escuta (Vercel/Render setam automaticamente) |
| `API_URL` | app | `https://gceic26-102.onrender.com` | URL base da API |
| `SESSION_SECRET` | app | string interna | Cookie de sessão |
