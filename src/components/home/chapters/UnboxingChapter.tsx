import { Suspense, lazy, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight, RotateCcw } from 'lucide-react'
import { api } from '../../../api/apiClient'
import type { MysteryBoxTier, QuizStep, TasteCodexResult } from '../../../types/enigma'
import { formatVnd } from '../../../lib/format'
import { motionDisabled } from '../../../lib/motion'
import { ResponsiveImage } from '../../media/ResponsiveImage'
import { useSoundStore } from '../../../store/useSoundStore'

const MysteryVaultScene = lazy(() => import('../../experience/MysteryVaultScene'))

/** Mount children only once the block is near the viewport (keeps three.js off the boot path). */
function useNear<T extends Element>(margin = '300px') {
  const ref = useRef<T | null>(null)
  const [near, setNear] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (typeof IntersectionObserver === 'undefined') {
      setNear(true)
      return
    }
    const io = new IntersectionObserver(
      entries => {
        if (entries.some(e => e.isIntersecting)) {
          setNear(true)
          io.disconnect()
        }
      },
      { rootMargin: margin }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [margin])
  return [ref, near] as const
}

/**
 * Chapter IV — the unboxing. The sealed chest (the existing three.js vault
 * scene) sits beside the backend's 8-question Taste Codex quiz
 * (GET /mystery-boxes/quiz-questions → POST /mystery-boxes/decode-style).
 * Decoding the codex unseals the chest and names the matching tier.
 */
export function UnboxingChapter() {
  const { playTick, playChime } = useSoundStore()
  const [stageRef, near] = useNear<HTMLDivElement>()
  const [steps, setSteps] = useState<QuizStep[]>([])
  const [boxes, setBoxes] = useState<MysteryBoxTier[]>([])
  const [started, setStarted] = useState(false)
  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [decoding, setDecoding] = useState(false)
  const [codex, setCodex] = useState<TasteCodexResult | null>(null)
  const [error, setError] = useState('')
  const live3d = !motionDisabled()

  useEffect(() => {
    if (!near) return
    let alive = true
    void Promise.all([
      api.get<QuizStep[] | { steps?: QuizStep[] }>('/mystery-boxes/quiz-questions').catch(() => []),
      api.get<MysteryBoxTier[]>('/mystery-boxes').catch(() => []),
    ]).then(([q, b]) => {
      if (!alive) return
      setSteps(Array.isArray(q) ? q : Array.isArray(q?.steps) ? q.steps : [])
      setBoxes(Array.isArray(b) ? b : [])
    })
    return () => {
      alive = false
    }
  }, [near])

  const step = steps[current]
  const choose = async (value: string) => {
    if (!step) return
    playTick()
    const next = { ...answers, [step.field]: value }
    setAnswers(next)
    if (current < steps.length - 1) {
      setCurrent(c => c + 1)
      return
    }
    try {
      setDecoding(true)
      setError('')
      const res = await api.post<TasteCodexResult>('/mystery-boxes/decode-style', next)
      setCodex(res)
      playChime()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Could not decode your codex')
    } finally {
      setDecoding(false)
    }
  }

  const reset = () => {
    setCodex(null)
    setAnswers({})
    setCurrent(0)
    setStarted(false)
  }

  const floor = boxes.length ? Math.max(...boxes.map(b => Number(b.guaranteedMinValue) || 0)) : 0
  const tier = codex?.recommendedBox

  return (
    <section aria-labelledby="unboxing-title" className="relative overflow-hidden border-b border-bone/10 py-20 md:py-28">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[60%] bg-[radial-gradient(ellipse_60%_50%_at_30%_40%,rgba(200,134,74,0.14),transparent_70%)]" />
      <div className="relative mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 sm:px-6 lg:grid-cols-12 lg:gap-14 lg:px-8">
        <div className="lg:col-span-5" ref={stageRef}>
          <p className="mb-3 font-sans text-[11px] font-medium uppercase tracking-[0.3em] text-ember-soft">
            Chapter IV — The unboxing
          </p>
          <h2 id="unboxing-title" className="font-display text-4xl leading-[1.02] text-bone md:text-6xl">
            A sealed chest, <em>matched to you</em>.
          </h2>
          <div className="relative mt-8 aspect-[4/3.4] overflow-hidden border border-bone/10 bg-ink-deep bg-[radial-gradient(ellipse_70%_55%_at_50%_62%,rgba(200,134,74,0.22),transparent_70%)]">
            {near && live3d ? (
              <Suspense
                fallback={
                  <ResponsiveImage
                    src="/images/enigma/mystery-chest.jpg"
                    alt="Carved chest, lid ajar with an ember glow"
                    sizes="(min-width: 1024px) 40vw, 100vw"
                    className="film-grade h-full w-full object-cover"
                  />
                }
              >
                <div className="absolute inset-0 [&>div]:h-full">
                  <MysteryVaultScene unsealed={Boolean(codex)} tierSlug={codex?.matchedTierSlug || 'inner-circle-chest'} />
                </div>
              </Suspense>
            ) : (
              <ResponsiveImage
                src="/images/enigma/mystery-chest.jpg"
                alt="Carved chest, lid ajar with an ember glow"
                sizes="(min-width: 1024px) 40vw, 100vw"
                className="film-grade h-full w-full object-cover"
              />
            )}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-ink to-transparent px-4 pb-3 pt-10 font-sans text-[10px] uppercase tracking-[0.16em] text-bone-muted">
              <span>{codex ? 'Unsealed' : 'Sealed'}</span>
              {floor > 0 && <span className="tabular-nums text-bone">Value floor up to {formatVnd(floor)}</span>}
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-end lg:col-span-7">
          <div className="border border-bone/15 bg-ink-raised/80 p-6 backdrop-blur-sm md:p-10" aria-live="polite">
            {!started && !codex && (
              <div className="space-y-6">
                <p className="font-display text-2xl leading-snug text-bone md:text-3xl">
                  Eight questions — silhouette, palette, era, fabric, occasion — decode your Taste Codex and pick the chest
                  tier that fits it.
                </p>
                <p className="text-sm leading-relaxed text-bone-muted">
                  Each tier lists its piece count and a guaranteed minimum value. Sign in first and the codex is saved to
                  your profile.
                </p>
                <button
                  type="button"
                  disabled={!steps.length}
                  onClick={() => setStarted(true)}
                  className="inline-flex items-center gap-2 bg-bone px-7 py-4 font-sans text-xs font-semibold uppercase tracking-[0.14em] text-ink transition hover:bg-bone-dim disabled:opacity-50"
                >
                  {steps.length ? 'Begin the quiz' : 'Loading the quiz…'} <ArrowRight aria-hidden="true" className="h-4 w-4" />
                </button>
              </div>
            )}

            {started && !codex && step && (
              <div className="space-y-6">
                <div className="flex items-center justify-between font-sans text-[11px] font-medium uppercase tracking-[0.18em] text-bone-muted">
                  <span>
                    Question {current + 1} / {steps.length}
                  </span>
                  {current > 0 && (
                    <button
                      type="button"
                      onClick={() => setCurrent(c => Math.max(0, c - 1))}
                      className="inline-flex items-center gap-1 hover:text-bone"
                    >
                      <ArrowLeft aria-hidden="true" className="h-3.5 w-3.5" /> Back
                    </button>
                  )}
                </div>
                <div className="h-px w-full bg-bone/10">
                  <div className="h-full bg-ember transition-all duration-500" style={{ width: `${((current + 1) / steps.length) * 100}%` }} />
                </div>
                <fieldset>
                  <legend className="mb-5 font-display text-2xl leading-snug text-bone md:text-3xl">{step.question}</legend>
                  <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                    {step.options.map(o => (
                      <button
                        key={o.value}
                        type="button"
                        disabled={decoding}
                        aria-pressed={answers[step.field] === o.value}
                        onClick={() => void choose(o.value)}
                        className="border border-bone/15 px-4 py-3.5 text-left text-sm text-bone transition hover:border-ember hover:bg-ember/10 aria-pressed:border-ember"
                      >
                        {o.label}
                      </button>
                    ))}
                  </div>
                </fieldset>
                {decoding && <p className="font-sans text-xs uppercase tracking-[0.16em] text-ember-soft">Decoding your codex…</p>}
                {error && <p className="text-sm text-bone">{error}</p>}
              </div>
            )}

            {codex && (
              <div className="space-y-5">
                <p className="font-sans text-[11px] font-medium uppercase tracking-[0.18em] text-ember-soft">
                  Your codex · {codex.archetypeCode}
                </p>
                <p className="font-display text-4xl leading-tight text-bone">{codex.archetype}</p>
                <p className="font-display text-lg italic text-bone-muted">“{codex.motto}”</p>
                <p className="text-sm leading-relaxed text-bone/85">{codex.description}</p>
                {tier && (
                  <div className="flex flex-wrap items-baseline justify-between gap-3 border-t border-bone/10 pt-4">
                    <span className="font-display text-2xl text-bone">{tier.name}</span>
                    <span className="font-sans text-xs tabular-nums text-bone-muted">
                      {formatVnd(tier.price)} · {tier.itemCount} pieces · floor {formatVnd(tier.guaranteedMinValue)}
                    </span>
                  </div>
                )}
                <div className="flex flex-wrap gap-3 pt-2">
                  <Link
                    to="/mystery-boxes"
                    className="inline-flex items-center gap-2 bg-bone px-6 py-3.5 font-sans text-xs font-semibold uppercase tracking-[0.14em] text-ink hover:bg-bone-dim"
                  >
                    Claim this chest <ArrowRight aria-hidden="true" className="h-4 w-4" />
                  </Link>
                  <button
                    type="button"
                    onClick={reset}
                    className="inline-flex items-center gap-2 border border-bone/25 px-5 py-3.5 font-sans text-[11px] font-medium uppercase tracking-[0.16em] text-bone hover:border-bone"
                  >
                    <RotateCcw aria-hidden="true" className="h-3.5 w-3.5" /> Retake
                  </button>
                </div>
              </div>
            )}
          </div>

          {boxes.length > 0 && (
            <ul className="mt-6 grid grid-cols-1 gap-px bg-bone/10 sm:grid-cols-3" aria-label="Chest tiers">
              {boxes.slice(0, 3).map(b => (
                <li
                  key={b.id}
                  className={`bg-ink p-4 transition ${tier?.tierSlug === b.tierSlug ? 'outline outline-1 outline-ember' : ''}`}
                >
                  <p className="font-display text-lg leading-tight text-bone">{b.name}</p>
                  <p className="mt-1 font-sans text-[11px] tabular-nums text-bone-muted">
                    {formatVnd(b.price)} · {b.itemCount} pieces
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  )
}
