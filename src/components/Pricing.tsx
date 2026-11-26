import { useState } from 'react'

export function Pricing() {
  const [open, setOpen] = useState(false)

  return (
    <section className="section-dark section-dark--elevated" id="modelo">
      <div className="container">
        <div className="section-header-split">
          <div>
            <span className="eyebrow">05 · Modelo híbrido</span>
            <h2 className="section-title" style={{ marginTop: '1rem' }}>
              Venda direta do sistema + <span className="text-gradient">assinatura leve de IoT.</span>
            </h2>
          </div>
          <p className="section-lead">
            A venda do equipamento fica separada da assinatura de telemetria. O hotel adquire o ativo no Dia 1 (à vista ou via linha de financiamento verde) e paga uma mensalidade baixa pelo monitoramento.
          </p>
        </div>

        <div className="pricing-grid reveal-up">
          <article className="pricing-card pricing-card--featured">
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                <span className="module-badge">RECEITA 01 · SISTEMA INSTALADO (CAPEX)</span>
                <span className="mono" style={{ fontSize: '0.78rem', color: 'var(--ink-secondary)' }}>Kit Urbano 35 kg/dia</span>
              </div>
              <div style={{ marginTop: '1.5rem' }}>
                <div className="price-tag">
                  R$ 22.029 <small>instalado</small>
                </div>
                <p style={{ color: 'var(--ink-secondary)', marginTop: '0.75rem' }}>
                  Compra à vista ou financiada por linha verde bancária. O ativo e o prazo de amortização ficam com o cliente, sem imobilizar capital da operação em locação.
                </p>
              </div>
              <ul className="spec-list" style={{ marginTop: '1.5rem' }}>
                <li><span className="spec-check">✓</span><span>Reator anaeróbico 3.000 L, gasômetro 4–5 m³ e funil misturador</span></li>
                <li><span className="spec-check">✓</span><span>Linha de gás com filtro H₂S, dreno, corta-chamas, booster e adaptação do fogão</span></li>
                <li><span className="spec-check">✓</span><span>Tanque pulmão 1.000 L, bomba, engate camlock e parceria local de retirada</span></li>
                <li><span className="spec-check">✓</span><span>Kit de sensores IoT, frete e instalação completa no local</span></li>
              </ul>
            </div>
            <a href="#contato" className="btn btn--primary magnetic" style={{ width: '100%' }}>
              Solicitar proposta e financiamento verde
              <span className="btn__arrow">→</span>
            </a>
          </article>

          <article className="pricing-card">
            <div>
              <span className="module-badge module-badge--amber">RECEITA 02 · RECORRÊNCIA LEVE (SAAS + IOT)</span>
              <div style={{ marginTop: '1.5rem' }}>
                <div className="price-tag">
                  R$ 99–199 <small>/mês</small>
                </div>
                <p style={{ color: 'var(--ink-secondary)', marginTop: '0.75rem' }}>
                  Mensalidade acessível porque não precisa amortizar o equipamento. Cobre monitoramento remoto, relatórios e suporte técnico.
                </p>
              </div>
              <ul className="spec-list" style={{ marginTop: '1.5rem' }}>
                <li><span className="spec-check">✓</span><span>Telemetria preventiva com alertas antes de a biologia desregular</span></li>
                <li><span className="spec-check">✓</span><span>Relatórios mensais de economia em GLP e dados ESG</span></li>
                <li><span className="spec-check">✓</span><span>Painel público ao vivo via QR Code na recepção e no restaurante</span></li>
                <li><span className="spec-check">✓</span><span>Suporte técnico remoto (visitas corretivas cobradas à parte)</span></li>
              </ul>
            </div>
            <a href="#iot-esg" className="btn btn--ghost magnetic" style={{ width: '100%' }}>
              Ver painel IoT e QR Code
            </a>
          </article>
        </div>

        <div className={open ? 'xray-box reveal-up is-open' : 'xray-box reveal-up'} id="xrayBox">
          <button
            className="xray-trigger"
            type="button"
            aria-expanded={open}
            onClick={() => setOpen((current) => !current)}
          >
            <div>
              <span className="mono" style={{ fontSize: '0.72rem', color: 'var(--bio-emerald)', textTransform: 'uppercase' }}>
                Estrutura financeira base
              </span>
              <h3>Raio-X do Kit Urbano 35 kg/dia (montagem própria padronizada)</h3>
              <p>Custo direto (COGS) de R$ 15.200, Simples Nacional de 6%, margem líquida de 25% e retorno operacional do hotel.</p>
            </div>
            <span className="xray-icon" aria-hidden="true">+</span>
          </button>

          <div className="xray-content" id="xrayContent">
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: '0.76rem', marginBottom: '0.5rem' }}>
                <span>COMPOSIÇÃO DO PREÇO DE VENDA (R$ 22.029)</span>
                <span>COGS 69% · SIMPLES 6% · MARGEM LÍQ. 25%</span>
              </div>
              <div className="stacked-bar" aria-label="Composição financeira do kit">
                <span style={{ width: '69%', background: 'var(--bio-emerald)' }} title="COGS: R$ 15.200" />
                <span style={{ width: '6%', background: 'var(--flame-amber)' }} title="Simples Nacional: R$ 1.322" />
                <span style={{ width: '25%', background: 'var(--bio-teal)' }} title="Margem Líquida: R$ 5.507" />
              </div>
            </div>

            <div className="xray-grid">
              <div className="xray-col">
                <h4>Custo direto (COGS · R$ 15.200)</h4>
                <div className="xray-row"><span>Reator + gasômetro + misturador</span><strong>R$ 7.000</strong></div>
                <div className="xray-row"><span>Linha de gás + filtro H₂S + segurança</span><strong>R$ 3.200</strong></div>
                <div className="xray-row"><span>Tanque pulmão 1.000 L + camlock</span><strong>R$ 2.200</strong></div>
                <div className="xray-row"><span>Instalação + frete</span><strong>R$ 2.200</strong></div>
                <div className="xray-row"><span>Kit IoT</span><strong>R$ 600</strong></div>
              </div>

              <div className="xray-col">
                <h4>Preço de venda (R$ 22.029)</h4>
                <div className="xray-row"><span>Custo direto (COGS)</span><strong>R$ 15.200</strong></div>
                <div className="xray-row"><span>Simples Nacional (6%)</span><strong>R$ 1.322</strong></div>
                <div className="xray-row"><span>Margem líquida (25%)</span><strong style={{ color: 'var(--bio-emerald)' }}>R$ 5.507</strong></div>
                <div className="xray-row"><span>Recorrência SaaS + IoT</span><strong>R$ 99–199/mês</strong></div>
              </div>

              <div className="xray-col">
                <h4>Retorno para o hotel (35 kg/dia)</h4>
                <div className="xray-row"><span>Economia bruta no GLP</span><strong>~R$ 502/mês</strong></div>
                <div className="xray-row"><span>OPEX estimado</span><strong>~R$ 200/mês</strong></div>
                <div className="xray-row"><span>Saldo líquido mensal</span><strong style={{ color: 'var(--bio-emerald)' }}>~R$ 302/mês</strong></div>
                <div className="xray-row"><span>Payback: 35 / 50 / 100 kg·dia</span><strong>6,1 / 3,6 / 1,5 anos</strong></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
