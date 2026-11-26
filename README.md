# Gaseificou!

Landing page do **Gaseificou!**, sistema turnkey de biodigestão compacta para estabelecimentos geradores de resíduos orgânicos. Converte matéria orgânica em gás térmico próprio para aquecimento de água e substituição do GLP, com logística urbana de escoamento de biofertilizante e telemetria IoT.

## Estrutura

- `index.html` — Página principal com corte técnico CAD interativo, fluxo de massa em 4 módulos e calculadora de viabilidade.
- `styles/tokens.css` — Variáveis de cores sólidas, tipografia e linhas estruturais.
- `styles/main.css` — Layout minimalista em grid arquitetônico (sem gradientes) e navbar flutuante.
- `js/app.js` — Scroll suave (Lenis), animação cinética no scroll (GSAP + ScrollTrigger), inspetor CAD, calculadora de viabilidade e painel IoT.

## Como executar localmente

Abra `index.html` diretamente no navegador ou sirva a pasta com qualquer servidor estático (por exemplo `npx serve .` ou `python -m http.server`).
