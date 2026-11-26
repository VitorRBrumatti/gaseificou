import { useState, type FormEvent } from 'react'
import { DIAGNOSTIC_VOLUME_OPTIONS, estimateMonthlyGlpBrl, estimateWeeklyDigestateL, formatBrl, formatInt } from '../data/roi'
import { SPACE_PROFILES } from '../data/modules'
import { saveDiagnostic, type SaveDiagnosticResult } from '../services/diagnosticService'

interface DiagnosticSummary extends SaveDiagnosticResult {
  hotelName: string
  cityUf: string
  spaceProfile: string
  estimatedMonthlyGlpBrl: number
  estimatedWeeklyBiofertL: number
}

export function DiagnosticSection() {
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [error, setError] = useState('')
  const [summary, setSummary] = useState<DiagnosticSummary | null>(null)

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (status === 'submitting') return

    const form = new FormData(event.currentTarget)
    const hotelName = String(form.get('hotel') ?? '').trim()
    const cityUf = String(form.get('cidade') ?? '').trim()
    const contactInfo = String(form.get('contato') ?? '').trim()
    const spaceProfile = String(form.get('ambiente') ?? '')
    const volumeKgDay = Number(form.get('volume'))

    if (!hotelName || !cityUf || !contactInfo || !spaceProfile || !Number.isFinite(volumeKgDay)) {
      setStatus('error')
      setError('Preencha hotel, cidade e contato para gerar o pré-diagnóstico.')
      return
    }

    const estimatedMonthlyGlpBrl = estimateMonthlyGlpBrl(volumeKgDay)
    const estimatedWeeklyBiofertL = estimateWeeklyDigestateL(volumeKgDay)

    setStatus('submitting')
    setError('')

    try {
      const saved = await saveDiagnostic({
        hotelName,
        volumeKgDay,
        spaceProfile,
        cityUf,
        contactInfo,
        estimatedMonthlyGlpBrl,
        estimatedWeeklyBiofertL,
      })
      setSummary({
        ...saved,
        hotelName,
        cityUf,
        spaceProfile,
        estimatedMonthlyGlpBrl,
        estimatedWeeklyBiofertL,
      })
      setStatus('success')
    } catch (cause) {
      console.warn('[Gaseificou] Falha ao salvar o pré-diagnóstico.', cause)
      setStatus('error')
      setError('Não conseguimos enviar o pré-diagnóstico agora. Verifique a conexão e tente de novo.')
    }
  }

  function reset() {
    setStatus('idle')
    setError('')
    setSummary(null)
  }

  return (
    <section className="section-dark" id="contato">
      <div className="container">
        <div className="cta-shell reveal-up">
          <div style={{ display: 'grid', gap: '1.35rem' }}>
            <span className="eyebrow">Pré-dimensionamento gratuito</span>
            <h2 className="section-title">
              Receba o cálculo técnico para a <span className="text-gradient">sua cozinha.</span>
            </h2>
            <p className="section-lead">
              Informe o volume estimado de restos orgânicos e a cidade. Montamos o dimensionamento do reator, o retorno previsto em GLP e a opção de retirada semanal do biofertilizante na sua região.
            </p>
            <ul className="spec-list">
              <li><span className="spec-check">✓</span><span>Tamanho do reator e economia bruta/líquida mensal em GLP</span></li>
              <li><span className="spec-check">✓</span><span>Plano de escoamento urbano (camlock) ou uso em jardim</span></li>
              <li><span className="spec-check">✓</span><span>Condições à vista ou por financiamento verde bancário</span></li>
            </ul>
          </div>

          <form className="diag-form" onSubmit={onSubmit}>
            {status !== 'success' && (
              <>
                <div className="field">
                  <label htmlFor="fHotel">Hotel, pousada ou restaurante</label>
                  <input id="fHotel" name="hotel" type="text" placeholder="Ex.: Pousada Solar da Serra" required disabled={status === 'submitting'} />
                </div>

                <div className="form-row-2">
                  <div className="field">
                    <label htmlFor="fVolume">Resíduos orgânicos / dia</label>
                    <select id="fVolume" name="volume" defaultValue="50" disabled={status === 'submitting'}>
                      {DIAGNOSTIC_VOLUME_OPTIONS.map((option) => (
                        <option key={option.kg} value={option.kg}>{option.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="field">
                    <label htmlFor="fAmbiente">Perfil de espaço</label>
                    <select id="fAmbiente" name="ambiente" defaultValue={SPACE_PROFILES[0].formValue} disabled={status === 'submitting'}>
                      {SPACE_PROFILES.map((profile) => (
                        <option key={profile.id} value={profile.formValue}>{profile.formLabel}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-row-2">
                  <div className="field">
                    <label htmlFor="fCidade">Cidade / UF</label>
                    <input id="fCidade" name="cidade" type="text" placeholder="Ex.: Gramado / RS" required disabled={status === 'submitting'} />
                  </div>
                  <div className="field">
                    <label htmlFor="fContato">WhatsApp ou e-mail</label>
                    <input id="fContato" name="contato" type="text" placeholder="(11) 99999-9999" required disabled={status === 'submitting'} />
                  </div>
                </div>

                {status === 'error' && (
                  <p className="form-error" role="alert">{error}</p>
                )}

                <button type="submit" className="btn btn--primary magnetic" style={{ width: '100%', marginTop: '0.35rem' }} disabled={status === 'submitting'}>
                  {status === 'submitting' ? 'Enviando...' : 'Gerar pré-diagnóstico gratuito'}
                  {status !== 'submitting' && <span className="btn__arrow">→</span>}
                </button>
              </>
            )}

            {status === 'success' && summary && (
              <div className="form-success" role="status">
                <strong style={{ color: 'var(--bio-emerald)', fontFamily: 'var(--font-display)', fontSize: '1.15rem' }}>
                  Pré-diagnóstico gerado
                </strong>
                <p style={{ fontSize: '0.9rem', color: '#d6e4dc' }}>
                  Para <strong>{summary.hotelName}</strong> ({summary.cityUf}), a estimativa base é de <strong>{formatBrl(summary.estimatedMonthlyGlpBrl)}/mês</strong> de economia bruta em GLP e cerca de <strong>{formatInt(summary.estimatedWeeklyBiofertL)} L/semana</strong> de biofertilizante no formato <em>{summary.spaceProfile}</em>.
                </p>
                {summary.storage === 'local' && (
                  <p style={{ fontSize: '0.82rem', color: 'var(--ink-secondary)' }}>
                    O Firebase ainda não está configurado. O registro ficou salvo neste navegador.
                  </p>
                )}
                <button type="button" className="btn btn--ghost btn--sm" style={{ width: 'fit-content' }} onClick={reset}>
                  Fazer nova simulação
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </section>
  )
}
