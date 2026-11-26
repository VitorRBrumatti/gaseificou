# Gaseificou!

Landing do **Gaseificou!**, sistema turnkey de biodigestão compacta para hotéis, pousadas e restaurantes. Esta versão é o esqueleto do MVP em Vite, React, TypeScript e Firebase (Firestore), com o mesmo visual, as mesmas animações e as fórmulas calibradas do simulador.

## Como rodar

```bash
npm install
npm run dev
```

O app sobe em `http://localhost:5173`. Sem um `.env`, o pré-diagnóstico fica no `localStorage` e o painel IoT usa a simulação local.

## Firebase

O projeto ligado é `gaseificou`. O arquivo `.env` local (não vai para o git) tem as chaves do app Web.

1. Copie `.env.example` para `.env` se ele ainda não existir.
2. Preencha `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID` e `VITE_FIREBASE_APP_ID`.
3. Reinicie o `npm run dev` depois de mudar o `.env`.

O botão **Entrar** no topo abre o login com Google (`signInWithPopup`). Sem essas chaves, o restante do site continua no ar e o pré-diagnóstico cai no `localStorage`.

`firestore.rules` é um protótipo: `create` público e validado em `diagnostics`, `read` público em `telemetry_units`, resto negado. O domínio `localhost` já está autorizado para o login.

Documento de demonstração esperado pelo painel: `telemetry_units/KIT-URB-35`, com `pressureMbar`, `temperatureC`, `bufferLevelPct`, `flowM3PerDay`, `filterOk`, `monthlyOrganicKg`, `monthlyBiofertL`, `collectionLabel` e `status` (`nominal` ou `alert`).

## Estrutura

- `src/lib/firebase.ts` — inicialização com fallback se as chaves não existirem
- `src/data/roi.ts` — GLP, digestato, OPEX, CAPEX e payback
- `src/data/modules.ts` — 4 módulos, hotspots da maquete e cenários urbano / área verde
- `src/services/diagnosticService.ts` — leads em `diagnostics`, ou `localStorage`
- `src/services/telemetryService.ts` — `onSnapshot` de `KIT-URB-35`, com simulação local
- `src/components/` — Hero, Problem, Architecture, RoiSimulator, IotEsg, Pricing e DiagnosticSection
