export type ModuleId = 1 | 2 | 3 | 4

export interface TurnkeyModule {
  id: ModuleId
  tab: string
  detailTag: string
  detailText: string
  detailMetric: string
  badge: string
  badgeClass: string
  meta: string
  metaColor?: string
  title: string
  description: string
  specs: string[]
}

export const TURNKEY_MODULES: TurnkeyModule[] = [
  {
    id: 1,
    tab: '01 · Core anaeróbico',
    detailTag: 'MÓDULO 01 · CORE ANAERÓBICO',
    detailText:
      'Reator de 3.000 L dimensionado para ~35 kg/dia de comida, com tempo de retenção de 30 dias, gasômetro de 4 a 5 m³ e funil de carga com mistura.',
    detailMetric: 'Retenção: 30 dias · 3.000 L',
    badge: 'MÓDULO 01 · CORE ANAERÓBICO',
    badgeClass: 'module-badge',
    meta: '3.000 L · 30 dias',
    title: 'Módulo de biodigestão compacta',
    description:
      'Reator compacto dimensionado para a carga diária do hotel (3.000 L para ~35 kg/dia, com 30 dias de retenção), gasômetro de 4 a 5 m³ e funil de carga com mistura.',
    specs: [
      'Triagem simples na própria cozinha, sem trituradores complexos.',
      'Ficam de fora plásticos, ossos grandes, cloro e excesso de gordura acima de 10–15%.',
      'Sistema fechado que cabe em áreas técnicas, quintais ou fundos de serviço.',
    ],
  },
  {
    id: 2,
    tab: '02 · Gás e segurança',
    detailTag: 'MÓDULO 02 · GÁS E SEGURANÇA TÉRMICA',
    detailText:
      'Filtragem obrigatória de H₂S, dreno de umidade contra corrosão, válvulas, corta-chamas, manômetro, booster de baixa pressão e adaptação dos queimadores do fogão.',
    detailMetric: 'Eficiência térmica: 70%–85%',
    badge: 'MÓDULO 02 · FOCO TÉRMICO',
    badgeClass: 'module-badge module-badge--amber',
    meta: '70% – 85% efic.',
    metaColor: 'var(--flame-amber)',
    title: 'Módulo de gás e segurança',
    description:
      'Linha completa de purificação e proteção para levar gás limpo e constante direto ao fogão industrial e aos aquecedores.',
    specs: [
      'Filtro obrigatório de gás sulfídrico (H₂S) e dreno de umidade contra corrosão.',
      'Válvulas de bloqueio, corta-chamas, manômetro e booster de baixa pressão.',
      'Adaptação dos queimadores do fogão industrial para uso térmico direto.',
    ],
  },
  {
    id: 3,
    tab: '03 · Escoamento',
    detailTag: 'MÓDULO 03 · ESCOAMENTO URBANO',
    detailText:
      'Gera ~2,5 L de digestato por kg (~87,5 L/dia ou ~612 L/semana em 35 kg/dia). Tanque pulmão vedado de 1.000 L, bomba, engate camlock e retirada semanal gratuita por parceiros locais.',
    detailMetric: 'Economiza > R$ 3.300 em filtros',
    badge: 'MÓDULO 03 · ESCOAMENTO URBANO',
    badgeClass: 'module-badge',
    meta: '~2,5 L / kg',
    metaColor: 'var(--bio-teal)',
    title: 'Escoamento físico com destino garantido',
    description:
      'Cada 1 kg de alimento diluído gera cerca de 2,5 L de digestato líquido (~87,5 L/dia ou ~612 L/semana em 35 kg/dia). Escolha o perfil do local:',
    specs: [],
  },
  {
    id: 4,
    tab: '04 · IoT e ESG',
    detailTag: 'MÓDULO 04 · TELEMETRIA IOT E QR ESG',
    detailText:
      'Sensores de pressão do gás, temperatura interna e nível do tanque pulmão conectados ao painel remoto, além de QR Code na recepção e no restaurante.',
    detailMetric: 'Assinatura: R$ 99–199/mês',
    badge: 'MÓDULO 04 · CAMADA DIGITAL',
    badgeClass: 'module-badge',
    meta: 'IoT + QR ESG',
    metaColor: 'var(--bio-emerald)',
    title: 'Telemetria IoT e experiência ESG',
    description:
      'Monitoramento remoto dos parâmetros críticos do reator e painel público para os clientes do hotel acompanharem os dados reais.',
    specs: [
      'Sensores de pressão do gás, temperatura interna do reator e nível do tanque pulmão.',
      'Alertas enviados antes de a biologia desregular ou de o tanque pulmão lotar.',
      'QR Code na recepção e no restaurante com a quantidade de lixo convertida em gás.',
    ],
  },
]

export type SpaceProfileId = 'urban' | 'green'

export interface SpaceProfile {
  id: SpaceProfileId
  tabLabel: string
  formLabel: string
  formValue: string
  specs: string[]
  pill: string
}

export const SPACE_PROFILES: SpaceProfile[] = [
  {
    id: 'urban',
    tabLabel: 'Hotel urbano sem jardim',
    formLabel: 'Urbano sem jardim',
    formValue: 'Urbano sem jardim (tanque pulmão + camlock)',
    specs: [
      'Tanque pulmão vedado de 1.000 L, bomba de transferência e engate rápido limpo (camlock).',
      'Entregue com parceria local engatilhada (chácaras, viveiros ou paisagistas) para retirada semanal gratuita.',
    ],
    pill: 'Evita filtros de esgoto: economiza mais de R$ 3.300 no custo direto',
  },
  {
    id: 'green',
    tabLabel: 'Pousada com área verde',
    formLabel: 'Com área verde / horta',
    formValue: 'Com jardim / área verde (aplicação direta)',
    specs: [
      'Aplicação direta diluída nos jardins, gramados e hortas da pousada ou hotel.',
      'Compostagem eventual do lodo de fundo, retirado a cada 6 a 24 meses.',
    ],
    pill: 'Ciclo fechado no próprio terreno com biofertilizante gratuito',
  },
]

export type HotspotId = 'reator' | 'gas' | 'pulmao' | 'iot'

export interface CadHotspot {
  id: HotspotId
  pin: string
  ariaLabel: string
  top: string
  left: string
  title: string
  description: string
  spec1Label: string
  spec1Value: string
  spec2Label: string
  spec2Value: string
}

export const CAD_HOTSPOTS: CadHotspot[] = [
  {
    id: 'reator',
    pin: '01',
    ariaLabel: 'Inspecionar Reator Anaeróbico',
    top: '46%',
    left: '33%',
    title: '01 · Reator anaeróbico 3.000 L + gasômetro',
    description:
      'Reator fechado para áreas urbanas sem cheiro. Recebe ~35 kg/dia de restos orgânicos diluídos pelo funil misturador, com 30 dias de retenção e gasômetro de 4 a 5 m³.',
    spec1Label: 'Volume reator',
    spec1Value: '3.000 L (30d)',
    spec2Label: 'Gasômetro',
    spec2Value: '4 – 5 m³',
  },
  {
    id: 'gas',
    pin: '02',
    ariaLabel: 'Inspecionar Filtro H2S e Linha de Gás',
    top: '44%',
    left: '55%',
    title: '02 · Skid de filtragem H₂S e segurança térmica',
    description:
      'Filtro dessulfurizador obrigatório contra corrosão, dreno de umidade, válvulas, corta-chamas, manômetro e booster de baixa pressão para os queimadores adaptados do fogão.',
    spec1Label: 'Eficiência térmica',
    spec1Value: '70% – 85%',
    spec2Label: 'Proteção',
    spec2Value: 'H₂S + corta-chamas',
  },
  {
    id: 'pulmao',
    pin: '03',
    ariaLabel: 'Inspecionar Tanque Pulmão e Camlock',
    top: '59%',
    left: '79%',
    title: '03 · Tanque pulmão 1.000 L + engate camlock',
    description:
      'Armazena cerca de 612 L/semana de biofertilizante líquido em tanque vedado. Tem bomba de transferência e engate rápido camlock para retirada semanal gratuita por chácaras, viveiros ou paisagistas.',
    spec1Label: 'Armazenamento',
    spec1Value: '1.000 L vedado',
    spec2Label: 'Economia CAPEX',
    spec2Value: '> R$ 3.300 vs filtro',
  },
  {
    id: 'iot',
    pin: '04',
    ariaLabel: 'Inspecionar Controlador IoT',
    top: '39%',
    left: '66%',
    title: '04 · Central IoT e painel QR ESG',
    description:
      'Lê pressão do gás, temperatura interna e nível do tanque pulmão. Dispara alertas preventivos antes de a biologia desregular e atualiza o painel do QR Code da recepção.',
    spec1Label: 'Sensores',
    spec1Value: 'Pressão · Temp · Nível',
    spec2Label: 'Assinatura SaaS',
    spec2Value: 'R$ 99–199 / mês',
  },
]
