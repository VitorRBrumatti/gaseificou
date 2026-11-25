# Gaseificou!

Landing page do **Gaseificou!**, sistema turnkey de biodigestão compacta para hotéis, pousadas e restaurantes. Converte resíduos orgânicos em gás térmico próprio para aquecimento de água e substituição do GLP, com logística urbana de escoamento de biofertilizante e telemetria IoT.

## Estrutura

- `index.html` — Página principal com as 7 seções, fluxograma SVG dos 4 módulos e maquete CAD isométrica.
- `styles/tokens.css` — Variáveis de cores, tipografia e curvas de animação.
- `styles/main.css` — Layout responsivo e componentes interativos.
- `js/hero-webgl.js` — Shader GLSL fluido de convecção bio-térmica em Three.js.
- `js/app.js` — Scroll suave (Lenis), animações (GSAP + ScrollTrigger), simulador de ROI calibrado e painel IoT.

## Como executar localmente

Abra `index.html` diretamente no navegador ou sirva a pasta com qualquer servidor estático (por exemplo `npx serve .` ou `python -m http.server`).
