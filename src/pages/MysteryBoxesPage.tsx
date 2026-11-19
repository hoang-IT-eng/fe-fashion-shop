import React, { Suspense, lazy, useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { Compass, LockOpen, ShoppingBag, RotateCcw, Check } from 'lucide-react'
import { api } from '../api/apiClient'
import { MysteryBoxTier, QuizStep, TasteCodexResult } from '../types/enigma'
import { DEMO_QUIZ_STEPS } from '../api/enigmaDemoData'
import { formatVnd } from '../lib/format'
import { useCartStore } from '../store/useCartStore'
import { useSoundStore } from '../store/useSoundStore'
import Breadcrumb from '../components/Breadcrumb'
import { useToast } from '../components/Toast'

const MysteryVaultScene = lazy(
  () => import('../components/experience/MysteryVaultScene')
)

export default function MysteryBoxesPage() {
  const addItem = useCartStore(s => s.addItem)
  const { playChime } = useSoundStore()
  const { toast } = useToast()

  const [boxes, setBoxes] = useState<MysteryBoxTier[]>([])
  const [steps, setSteps] = useState<QuizStep[]>(DEMO_QUIZ_STEPS)
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [decoding, setDecoding] = useState(false)
  const [codex, setCodex] = useState<TasteCodexResult | null>(null)
  const [unsealed, setUnsealed] = useState(false)
  const [selectedBoxSize, setSelectedBoxSize] = useState('L / EU 42')

  const revealCardRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    void Promise.all([
      api.get<MysteryBoxTier[]>('/mystery-boxes'),
      api.get<QuizStep[] | { steps?: QuizStep[] }>('/mystery-boxes/quiz-questions').catch(() => DEMO_QUIZ_STEPS),
    ]).then(([boxRes, stepRes]) => {
      setBoxes(Array.isArray(boxRes) ? boxRes : [])
      const live = Array.isArray(stepRes) ? stepRes : stepRes?.steps
      if (Array.isArray(live) && live.length > 0) setSteps(live)
    })
  }, [])

  // GSAP zip-open / unseal Mystery Box reveal sequence
  useEffect(() => {
    if (!codex || !revealCardRef.current) return
    if (import.meta.env.MODE === 'test') return
    gsap.fromTo(
      revealCardRef.current,
      { opacity: 0, y: 26, clipPath: 'inset(0 0 100% 0)' },
      {
        opacity: 1,
        y: 0,
        clipPath: 'inset(0 0 0% 0)',
        duration: 0.75,
        ease: 'power3.out',
      }
    )
  }, [codex])

  const activeQuizStep = steps[currentStep]

  const handleSelectOption = async (field: string, value: string) => {
    const nextAnswers = { ...answers, [field]: value }
    setAnswers(nextAnswers)

    if (currentStep < steps.length - 1) {
      setCurrentStep(s => s + 1)
      return
    }

    // Completed all 8 steps -> Decode Taste Codex & unseal 3D Vault
    try {
      setDecoding(true)
      const res = await api.post<TasteCodexResult>('/mystery-boxes/decode-style', nextAnswers)
      setCodex(res)
      setUnsealed(true)
      playChime()
      toast(`Taste Codex Revealed: ${res.archetype}. Vault Unsealed!`, 'success')
    } catch (err: any) {
      toast(err?.message || 'Failed to decode Taste Codex', 'error')
    } finally {
      setDecoding(false)
    }
  }

  const handleResetQuiz = () => {
    setAnswers({})
    setCurrentStep(0)
    setCodex(null)
    setUnsealed(false)
  }

  const handleReserveBox = async (box: MysteryBoxTier) => {
    await addItem({
      productId: 900 + box.id,
      name: `NOCTURNE ${box.name} (${codex?.archetype || 'Curated Allocation'})`,
      price: box.price,
      quantity: 1,
      size: selectedBoxSize,
      color: codex?.archetype || 'Sealed Vault',
      imageUrl: box.imageUrl || '/images/enigma/mystery-chest.jpg',
    })
    toast(`Added "${box.name}" (${selectedBoxSize}) to Vault Bag.`, 'success')
  }

  return (
    <div className="min-h-screen bg-ink text-bone py-10 md:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Breadcrumb
          items={[{ label: 'Archive', path: '/' }, { label: 'Mystery Vault & Style Quiz' }]}
        />

        {/* Top 3D Vault + Interactive 8-Step Reading */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center pb-20 border-b border-bone/10">
          {/* 3D Interactive Vault Visual */}
          <div className="lg:col-span-5 bg-ink-raised border border-bone/12 p-6 space-y-4">
            <div className="flex items-center justify-between font-sans text-[10px] font-medium tracking-[0.16em] uppercase">
              <span className="text-bone">
                {unsealed ? 'VAULT SEAL: UNLOCKED' : 'ANODIZED VAULT CHEST'}
              </span>
              <button
                type="button"
                onClick={() => setUnsealed(v => !v)}
                className="inline-flex items-center gap-1 text-bone-muted hover:text-bone"
              >
                <LockOpen className="w-3.5 h-3.5 text-bone" />
                {unsealed ? 'Seal Lid' : 'Preview Unseal'}
              </button>
            </div>

            <Suspense
              fallback={
                <div className="h-[320px] flex items-center justify-center font-sans text-xs text-bone-muted">
                  LOADING 3D VAULT...
                </div>
              }
            >
              <MysteryVaultScene
                unsealed={unsealed}
                tierSlug={codex?.matchedTierSlug || 'inner-circle-chest'}
              />
            </Suspense>

            <div className="pt-3 border-t border-bone/10 flex items-center justify-between font-sans text-[11px] text-bone-muted">
              <span>GUARANTEED VALUE FLOOR</span>
              <span className="text-bone tabular-nums">UP TO 24,500,000₫</span>
            </div>
          </div>

          {/* 8-Step Style Quiz OR Revealed Taste Codex Reveal */}
          <div className="lg:col-span-7">
            {!codex ? (
              <div className="bg-ink-raised border border-bone/15 p-6 md:p-10 space-y-7">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-2 font-sans text-[11px] font-medium uppercase tracking-[0.18em] text-bone">
                    <Compass className="w-4 h-4" />
                    READ YOUR SILHOUETTE · STEP 0{currentStep + 1} / 0{steps.length}
                  </span>
                  {currentStep > 0 && (
                    <button
                      type="button"
                      onClick={() => setCurrentStep(s => Math.max(0, s - 1))}
                      className="font-sans text-[11px] font-medium uppercase tracking-[0.16em] text-bone-muted hover:text-bone"
                    >
                      ← Back
                    </button>
                  )}
                </div>

                {/* Progress Bar */}
                <div className="w-full h-1 bg-ink">
                  <div
                    className="h-full bg-bone transition-all duration-300"
                    style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                  />
                </div>

                <div>
                  <h1 className="font-display text-3xl md:text-4xl text-bone leading-snug mb-2">
                    {activeQuizStep?.question}
                  </h1>
                  <p className="text-xs text-bone-muted">
                    Each response calibrates your chromatic, textile, and silhouette archetype.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {activeQuizStep?.options.map(opt => {
                    const chosen = answers[activeQuizStep.field] === opt.value
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        disabled={decoding}
                        onClick={() => void handleSelectOption(activeQuizStep.field, opt.value)}
                        className={`text-left p-4 border transition flex flex-col justify-between gap-2 ${
                          chosen
                            ? 'border-bone bg-bone/15 text-bone'
                            : 'border-bone/15 bg-ink hover:border-bone/60 text-bone'
                        }`}
                      >
                        <span className="font-sans text-[10px] font-medium tracking-[0.16em] uppercase text-bone">
                          {opt.archetype.replace('_', ' ')}
                        </span>
                        <span className="text-sm font-medium leading-snug">{opt.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            ) : (
              <div
                ref={revealCardRef}
                id="taste-codex-result-card"
                className="bg-ink-raised border border-bone/60 p-6 md:p-10 space-y-6"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-sans text-[11px] font-medium tracking-[0.18em] uppercase text-bone-muted">
                      TASTE CODEX REVEALED · ARCHETYPE SEAL
                    </p>
                    <h1 className="font-display text-4xl md:text-5xl text-bone mt-1">
                      {codex.archetype}
                    </h1>
                    <p className="font-display italic text-lg text-bone mt-1">
                      “{codex.motto}”
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleResetQuiz}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-bone/20 font-sans text-[10px] font-medium uppercase tracking-[0.16em] text-bone-muted hover:text-bone"
                  >
                    <RotateCcw className="w-3 h-3" /> Recalibrate
                  </button>
                </div>

                <p className="text-sm text-bone-muted leading-relaxed">{codex.description}</p>

                {/* DNA Affinity Breakdown */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  {codex.dnaBreakdown.map(dna => (
                    <div
                      key={dna.code}
                      className="p-3 bg-ink border border-bone/10 space-y-1.5"
                    >
                      <span className="block font-sans text-lg font-semibold text-bone tabular-nums">
                        {dna.affinityPercent}%
                      </span>
                      <span className="block font-sans text-[10px] font-medium text-bone-muted uppercase leading-tight">
                        {dna.archetype}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Matched Box Allocation CTA */}
                {codex.recommendedBox && (
                  <div className="p-5 bg-ink border border-bone/45 space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <span className="block font-sans text-[10px] font-medium uppercase tracking-[0.16em] text-bone">
                          MATCHED ALLOCATION TIER
                        </span>
                        <h2 className="font-display text-2xl text-bone">
                          {codex.recommendedBox.name} — {formatVnd(codex.recommendedBox.price)}
                        </h2>
                      </div>
                      <span className="font-sans text-xs text-bone-muted tabular-nums">
                        Min Floor: {formatVnd(codex.recommendedBox.guaranteedMinValue)}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <select
                        value={selectedBoxSize}
                        onChange={e => setSelectedBoxSize(e.target.value)}
                        className="bg-ink-raised border border-bone/20 px-3.5 py-3 font-sans text-xs text-bone"
                      >
                        <option value="S / EU 40">Size Profile: S / EU 40</option>
                        <option value="M / EU 41">Size Profile: M / EU 41</option>
                        <option value="L / EU 42">Size Profile: L / EU 42</option>
                        <option value="XL / EU 43-44">Size Profile: XL / EU 43-44</option>
                      </select>

                      <button
                        id="add-matched-mystery-box-btn"
                        type="button"
                        onClick={() => void handleReserveBox(codex.recommendedBox!)}
                        className="flex-1 py-3 bg-bone text-ink font-sans text-xs font-semibold uppercase tracking-[0.14em] hover:bg-bone-dim transition inline-flex items-center justify-center gap-2"
                      >
                        <ShoppingBag className="w-4 h-4" />
                        Add Matched Chest to Vault Bag
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* All 3 Mystery Box Tiers Comparison */}
        <section className="pt-16">
          <div className="mb-10">
            <p className="font-sans text-[11px] font-medium tracking-[0.18em] uppercase text-bone-muted mb-2">
              SEALED TIER SPECIFICATIONS
            </p>
            <h2 className="font-display text-3xl md:text-4xl text-bone">
              Mystery Vault Allocations
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {boxes.map(box => {
              const isMatched = codex?.matchedTierSlug === box.tierSlug
              return (
                <article
                  key={box.id}
                  className={`p-6 border flex flex-col justify-between gap-6 ${
                    isMatched ? 'border-bone' : 'border-bone/12'
                  }`}
                >
                  <div className="space-y-4">
                    {isMatched && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-bone text-ink font-sans text-[10px] font-semibold uppercase tracking-[0.14em]">
                        <Check className="w-3 h-3" /> Matched to Your Codex
                      </span>
                    )}
                    <h3 className="font-display text-3xl text-bone">{box.name}</h3>
                    <p className="text-xs text-bone-muted leading-relaxed">{box.description}</p>

                    <div className="space-y-2 pt-3 border-t border-bone/10">
                      <span className="block font-sans text-[10px] font-medium uppercase tracking-[0.16em] text-bone">
                        Documented Drop Odds
                      </span>
                      {(box.possibleDrops || []).map((dr, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between text-xs font-sans text-bone/85"
                        >
                          <span className="truncate pr-2">{dr.title}</span>
                          <span className="text-bone tabular-nums">{dr.odds}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-bone/10 space-y-3">
                    <div className="flex justify-between items-baseline font-sans">
                      <span className="text-xl font-semibold text-bone tabular-nums">
                        {formatVnd(box.price)}
                      </span>
                      <span className="text-xs text-bone-muted tabular-nums">
                        Floor: {formatVnd(box.guaranteedMinValue)}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => void handleReserveBox(box)}
                      className="w-full py-3 bg-bone text-ink font-sans text-xs font-semibold uppercase tracking-[0.14em] hover:bg-bone-dim transition"
                    >
                      Acquire {box.name}
                    </button>
                  </div>
                </article>
              )
            })}
          </div>
        </section>
      </div>
    </div>
  )
}
