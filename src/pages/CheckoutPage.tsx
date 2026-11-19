import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapPin, Truck, CreditCard, Tag, ShieldCheck, CheckCircle2 } from 'lucide-react'
import { api } from '../api/apiClient'
import { Order } from '../types/order'
import { useCartStore } from '../store/useCartStore'
import { useAuthStore } from '../store/useAuthStore'
import { useSoundStore } from '../store/useSoundStore'
import { formatVnd } from '../lib/format'
import Breadcrumb from '../components/Breadcrumb'
import EmptyState from '../components/EmptyState'
import { useToast } from '../components/Toast'

const SAVED_ADDRESSES = [
  {
    id: 'saigon',
    label: 'Saigon Residence · District 1',
    name: 'Kaelen Vinh',
    phone: '0909123456',
    address: '88 Đồng Khởi, Bến Nghé, Quận 1, TP. Hồ Chí Minh',
  },
  {
    id: 'hanoi',
    label: 'Hanoi Studio · Hoàn Kiếm',
    name: 'Kaelen Vinh',
    phone: '0912345678',
    address: '24 Tràng Tiền, Hoàn Kiếm, Hà Nội',
  },
]

export default function CheckoutPage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { playChime } = useSoundStore()
  const {
    items,
    clear,
    appliedVoucher,
    applyVoucherCode,
    removeVoucher,
    subtotal,
    discountAmount,
  } = useCartStore()
  const { toast } = useToast()

  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [selectedPreset, setSelectedPreset] = useState('saigon')
  const [shippingName, setShippingName] = useState(user?.name || SAVED_ADDRESSES[0].name)
  const [shippingPhone, setShippingPhone] = useState(SAVED_ADDRESSES[0].phone)
  const [shippingAddress, setShippingAddress] = useState(SAVED_ADDRESSES[0].address)
  const [note, setNote] = useState('')

  const [shippingMethod, setShippingMethod] = useState<'standard' | 'armored'>('standard')
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'vnpay' | 'card'>('vnpay')
  const [couponInput, setCouponInput] = useState('')
  const [placing, setPlacing] = useState(false)

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-ink text-bone py-14 max-w-5xl mx-auto px-4">
        <EmptyState
          title="No Active Allocation in Bag"
          description="Select archive pieces before initiating armored checkout."
          actionLabel="Return to Drops"
          onAction={() => navigate('/products')}
        />
      </div>
    )
  }

  const sub = subtotal()
  const disc = discountAmount()
  const shippingFee = shippingMethod === 'armored' ? 150000 : 0
  const grandTotal = Math.max(0, sub - disc + shippingFee)

  const selectAddressBook = (presetId: string) => {
    setSelectedPreset(presetId)
    const found = SAVED_ADDRESSES.find(a => a.id === presetId)
    if (found) {
      setShippingName(found.name)
      setShippingPhone(found.phone)
      setShippingAddress(found.address)
    }
  }

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!couponInput.trim()) return
    try {
      const res = await applyVoucherCode(couponInput)
      toast(res.message, 'success')
      setCouponInput('')
    } catch (err: any) {
      toast(err?.message || 'Invalid privilege code', 'error')
    }
  }

  const handlePlaceOrder = async () => {
    if (!shippingName.trim() || !shippingPhone.trim() || !shippingAddress.trim()) {
      toast('Please complete dispatch recipient details.', 'error')
      setStep(1)
      return
    }
    try {
      setPlacing(true)
      const res = await api.post<{ order?: Order; id?: number; paymentUrl?: string | null }>(
        '/orders',
        {
          items,
          shippingName,
          shippingPhone,
          shippingAddress,
          shippingFee,
          voucherCode: appliedVoucher?.code || undefined,
          paymentMethod,
          note,
        }
      )
      playChime()
      const orderId = res.order?.id || res.id || 1004
      clear()
      toast(`Provenance Order #${orderId} sealed & confirmed!`, 'success')
      navigate(`/orders/${orderId}`)
    } catch (err: any) {
      toast(err?.message || 'Checkout failed', 'error')
    } finally {
      setPlacing(false)
    }
  }

  return (
    <div className="min-h-screen bg-ink text-bone py-10 md:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Breadcrumb
          items={[
            { label: 'Archive', path: '/' },
            { label: 'Vault Bag', path: '/cart' },
            { label: 'Armored Checkout' },
          ]}
        />

        <h1 className="font-display text-4xl md:text-5xl text-bone mb-8">
          Armored Dispatch &amp; Settlement
        </h1>

        {/* Multi-Step Indicator */}
        <div className="grid grid-cols-3 gap-3 mb-10">
          {[
            { n: 1 as const, label: '01 · Address Book' },
            { n: 2 as const, label: '02 · Courier & Privilege' },
            { n: 3 as const, label: '03 · Payment Settlement' },
          ].map(st => (
            <button
              key={st.n}
              type="button"
              onClick={() => setStep(st.n)}
              className={`py-3 px-4 border font-mono text-xs uppercase tracking-[0.2em] text-left transition ${
                step === st.n
                  ? 'border-bone bg-bone/15 text-bone'
                  : step > st.n
                    ? 'border-bone/30 bg-ink-raised text-bone'
                    : 'border-bone/10 bg-ink-raised/50 text-bone-muted'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Multi-Step Panels */}
          <div className="lg:col-span-7 space-y-6">
            {step === 1 && (
              <section className="p-6 md:p-8 bg-ink-raised border border-bone/15 space-y-6">
                <div className="flex items-center gap-2.5">
                  <MapPin className="w-4 h-4 text-bone" />
                  <h2 className="font-display text-2xl">Collector Address Book</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {SAVED_ADDRESSES.map(addr => (
                    <button
                      key={addr.id}
                      type="button"
                      onClick={() => selectAddressBook(addr.id)}
                      className={`text-left p-4 border transition ${
                        selectedPreset === addr.id
                          ? 'border-bone bg-ink'
                          : 'border-bone/12 bg-ink/60 hover:border-bone/35'
                      }`}
                    >
                      <span className="block font-mono text-[10px] uppercase tracking-widest text-bone mb-1">
                        {addr.label}
                      </span>
                      <span className="block text-xs text-bone font-medium">{addr.name}</span>
                      <span className="block text-xs text-bone-muted mt-1 line-clamp-2">
                        {addr.address}
                      </span>
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block font-mono text-[10px] uppercase tracking-widest text-bone-muted mb-1.5">
                      Recipient Full Name
                    </label>
                    <input
                      type="text"
                      value={shippingName}
                      onChange={e => setShippingName(e.target.value)}
                      className="w-full bg-ink border border-bone/15 px-3.5 py-2.5 text-xs text-bone focus:outline-none focus:border-bone"
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-[10px] uppercase tracking-widest text-bone-muted mb-1.5">
                      Direct Phone
                    </label>
                    <input
                      type="tel"
                      value={shippingPhone}
                      onChange={e => setShippingPhone(e.target.value)}
                      className="w-full bg-ink border border-bone/15 px-3.5 py-2.5 font-mono text-xs text-bone focus:outline-none focus:border-bone"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-mono text-[10px] uppercase tracking-widest text-bone-muted mb-1.5">
                    Vault Delivery Street &amp; District
                  </label>
                  <input
                    type="text"
                    value={shippingAddress}
                    onChange={e => setShippingAddress(e.target.value)}
                    className="w-full bg-ink border border-bone/15 px-3.5 py-2.5 text-xs text-bone focus:outline-none focus:border-bone"
                  />
                </div>

                <div>
                  <label className="block font-mono text-[10px] uppercase tracking-widest text-bone-muted mb-1.5">
                    Courier Hand-off Instructions (Optional)
                  </label>
                  <input
                    type="text"
                    value={note}
                    onChange={e => setNote(e.target.value)}
                    placeholder="Private concierge desk / signature required..."
                    className="w-full bg-ink border border-bone/15 px-3.5 py-2.5 text-xs text-bone focus:outline-none focus:border-bone"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="w-full py-3.5 bg-bone text-ink font-mono text-xs font-semibold uppercase tracking-[0.24em]"
                >
                  Continue to Courier &amp; Privilege →
                </button>
              </section>
            )}

            {step === 2 && (
              <section className="p-6 md:p-8 bg-ink-raised border border-bone/15 space-y-6">
                <div className="flex items-center gap-2.5">
                  <Truck className="w-4 h-4 text-bone" />
                  <h2 className="font-display text-2xl">Armored Dispatch Method</h2>
                </div>

                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() => setShippingMethod('standard')}
                    className={`w-full p-4 border flex items-center justify-between text-left ${
                      shippingMethod === 'standard'
                        ? 'border-bone bg-ink'
                        : 'border-bone/15 bg-ink/60'
                    }`}
                  >
                    <div>
                      <p className="text-sm font-medium text-bone">
                        NOCTURNE Insured Vault Courier (2–4 Business Days)
                      </p>
                      <p className="text-xs text-bone-muted mt-0.5">
                        Tamper-evident seal + full declared-value insurance
                      </p>
                    </div>
                    <span className="font-mono text-xs text-bone">COMPLIMENTARY</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShippingMethod('armored')}
                    className={`w-full p-4 border flex items-center justify-between text-left ${
                      shippingMethod === 'armored'
                        ? 'border-bone bg-ink'
                        : 'border-bone/15 bg-ink/60'
                    }`}
                  >
                    <div>
                      <p className="text-sm font-medium text-bone">
                        Priority 24-Hour White-Glove Hand Delivery
                      </p>
                      <p className="text-xs text-bone-muted mt-0.5">
                        Dedicated courier with live NFC handoff verification
                      </p>
                    </div>
                    <span className="font-mono text-xs text-bone tabular-nums">+150.000₫</span>
                  </button>
                </div>

                <div className="pt-4 border-t border-bone/10 space-y-3">
                  <span className="block font-mono text-xs uppercase tracking-widest text-bone">
                    Night Order Privilege / Voucher Code
                  </span>
                  {appliedVoucher ? (
                    <div className="p-3.5 bg-ink border border-bone/60 flex items-center justify-between font-mono text-xs">
                      <span className="inline-flex items-center gap-2 text-bone">
                        <Tag className="w-4 h-4" /> {appliedVoucher.code} — {appliedVoucher.description}
                      </span>
                      <button
                        type="button"
                        onClick={removeVoucher}
                        className="text-bone-muted hover:text-bone uppercase text-[10px]"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleApplyCoupon} className="flex gap-2">
                      <input
                        id="checkout-coupon-input"
                        type="text"
                        value={couponInput}
                        onChange={e => setCouponInput(e.target.value)}
                        placeholder="Enter NOCTURNE15, CULT10, or VAULT500K"
                        className="flex-1 bg-ink border border-bone/15 px-3.5 py-2.5 font-mono text-xs text-bone uppercase focus:outline-none focus:border-bone"
                      />
                      <button
                        type="submit"
                        className="px-5 py-2.5 border border-bone text-bone font-mono text-xs uppercase tracking-widest hover:bg-bone hover:text-ink"
                      >
                        Validate
                      </button>
                    </form>
                  )}
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="px-6 py-3.5 border border-bone/20 font-mono text-xs uppercase tracking-widest"
                  >
                    ← Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="flex-1 py-3.5 bg-bone text-ink font-mono text-xs font-semibold uppercase tracking-[0.24em]"
                  >
                    Continue to Payment Settlement →
                  </button>
                </div>
              </section>
            )}

            {step === 3 && (
              <section className="p-6 md:p-8 bg-ink-raised border border-bone/15 space-y-6">
                <div className="flex items-center gap-2.5">
                  <CreditCard className="w-4 h-4 text-bone" />
                  <h2 className="font-display text-2xl">Settlement Protocol</h2>
                </div>

                <div className="space-y-3">
                  {[
                    {
                      id: 'vnpay' as const,
                      title: 'VNPay Instant QR / Bank Settlement',
                      desc: 'Immediate cryptographic settlement with instant Confirmed status.',
                    },
                    {
                      id: 'card' as const,
                      title: 'Saved Collector Card · Visa Infinite •••• 8842',
                      desc: '3D-Secure tokenized vault settlement.',
                    },
                    {
                      id: 'cod' as const,
                      title: 'Cash on Armored Inspection (COD)',
                      desc: 'Verify NFC provenance tag at your door before settling.',
                    },
                  ].map(pm => (
                    <button
                      key={pm.id}
                      type="button"
                      onClick={() => setPaymentMethod(pm.id)}
                      className={`w-full p-4 border text-left flex items-start justify-between gap-4 ${
                        paymentMethod === pm.id
                          ? 'border-bone bg-ink'
                          : 'border-bone/15 bg-ink/60'
                      }`}
                    >
                      <div>
                        <p className="text-sm font-medium text-bone">{pm.title}</p>
                        <p className="text-xs text-bone-muted mt-0.5">{pm.desc}</p>
                      </div>
                      <CheckCircle2
                        className={`w-4 h-4 mt-0.5 ${
                          paymentMethod === pm.id ? 'text-bone' : 'text-bone-muted/30'
                        }`}
                      />
                    </button>
                  ))}
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="px-6 py-4 border border-bone/20 font-mono text-xs uppercase tracking-widest"
                  >
                    ← Back
                  </button>
                  <button
                    id="place-order-submit-btn"
                    type="button"
                    disabled={placing}
                    onClick={() => void handlePlaceOrder()}
                    className="flex-1 py-4 bg-bone text-ink font-mono text-xs font-semibold uppercase tracking-[0.24em] hover:bg-bone-dim transition"
                  >
                    {placing
                      ? 'SEALING PROVENANCE ORDER...'
                      : `AUTHORIZE & SEAL ORDER · ${formatVnd(grandTotal)}`}
                  </button>
                </div>
              </section>
            )}
          </div>

          {/* Right Order Manifest */}
          <aside className="lg:col-span-5">
            <div className="bg-ink-raised border border-bone/15 p-6 space-y-5 sticky top-28">
              <h2 className="font-display text-2xl">Allocation Manifest</h2>

              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {items.map(item => (
                  <div key={item.id} className="flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={item.imageUrl || '/images/enigma/grail-sneaker-obsidian.jpg'}
                        alt={item.name}
                        className="w-12 h-14 object-cover bg-ink"
                      />
                      <div className="min-w-0">
                        <p className="text-bone truncate">{item.name}</p>
                        <p className="font-mono text-[10px] text-bone-muted">
                          Qty {item.quantity} {item.size ? `· ${item.size}` : ''}
                        </p>
                      </div>
                    </div>
                    <span className="font-mono text-bone tabular-nums">
                      {formatVnd(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="space-y-2 pt-4 border-t border-bone/10 font-mono text-xs">
                <div className="flex justify-between text-bone-muted">
                  <span>SUBTOTAL</span>
                  <span className="tabular-nums">{formatVnd(sub)}</span>
                </div>
                {disc > 0 && (
                  <div className="flex justify-between text-bone">
                    <span>PRIVILEGE ({appliedVoucher?.code})</span>
                    <span className="tabular-nums">-{formatVnd(disc)}</span>
                  </div>
                )}
                <div className="flex justify-between text-bone-muted">
                  <span>COURIER</span>
                  <span className="tabular-nums">
                    {shippingFee === 0 ? 'FREE' : formatVnd(shippingFee)}
                  </span>
                </div>
                <div className="flex justify-between text-base font-semibold text-bone pt-3 border-t border-bone/10">
                  <span>GRAND TOTAL</span>
                  <span className="text-bone tabular-nums">{formatVnd(grandTotal)}</span>
                </div>
              </div>

              <div className="p-3.5 bg-ink border border-bone/10 flex items-center gap-2.5 font-mono text-[10px] text-bone-muted uppercase">
                <ShieldCheck className="w-4 h-4 text-bone flex-shrink-0" />
                <span>Includes Engraved NFC Provenance Certificate</span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
