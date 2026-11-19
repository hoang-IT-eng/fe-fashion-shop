/**
 * NOCTURNE cloud world — the WebGL engine (lazy chunk).
 *
 * A single renderer whose canvas is re-parented into the active host:
 *   hero    — the scroll "descent": camera sinks from above the cloud deck,
 *             through it, and out beneath it, toward the ember light.
 *   footer  — the "ascent": looking up into the underside of the deck.
 *   overlay — a full-screen painted veil over a transparent canvas, used by
 *             the first-visit loader, the menu and page transitions.
 *
 * Inputs: scroll (via `cloud`), pointer (clouds part around it), click
 * (shock ring + light flash). Pauses whenever no host is visible or the
 * tab is hidden; DPR capped at 1.5.
 */
import {
  Color,
  LinearSRGBColorSpace,
  LinearFilter,
  LinearMipmapLinearFilter,
  Mesh,
  NoColorSpace,
  PerspectiveCamera,
  PlaneGeometry,
  Scene,
  ShaderMaterial,
  Texture,
  TextureLoader,
  Vector2,
  Vector3,
  WebGLRenderer,
} from 'three'
import atlas from './atlas.json'
import { cloud, setModeLive, type CloudMode, type CloudWorldApi, type HostEntry } from './cloudState'
import { CLOUD_FRAG, CLOUD_VERT, FULL_VERT, SKY_FRAG, VEIL_FRAG } from './shaders'

function mulberry32(seed: number) {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t
const clamp01 = (v: number) => Math.min(1, Math.max(0, v))
const smooth = (t: number) => t * t * (3 - 2 * t)
const smoothRange = (a: number, b: number, v: number) => smooth(clamp01((v - a) / (b - a)))

function loadTexture(src: string): Promise<Texture> {
  return new Promise((resolve, reject) => {
    new TextureLoader().load(src, resolve, undefined, reject)
  })
}

interface CloudDef {
  x: number
  y: number
  z: number
  w: number
  cell: number
  alpha: number
  bright: number
}

function buildClouds(coarse: boolean): CloudDef[] {
  const rnd = mulberry32(1987)
  const r = (a: number, b: number) => lerp(a, b, rnd())
  const defs: CloudDef[] = []
  const deck = coarse ? 13 : 20
  for (let i = 0; i < deck; i++) {
    defs.push({
      x: r(-11, 11),
      y: r(-5.4, -1.1),
      z: r(-17, 0.5),
      w: r(5.5, 10.5),
      cell: (() => {
        const c = rnd()
        return c < 0.45 ? 2 : c < 0.75 ? 0 : c < 0.92 ? 1 : 3
      })(),
      alpha: r(0.75, 1),
      bright: r(0.85, 1.15),
    })
  }
  // close passers the camera sinks through
  const near = coarse ? 3 : 5
  for (let i = 0; i < near; i++) {
    const side = i % 2 === 0 ? -1 : 1
    defs.push({
      x: side * r(1.2, 4.5),
      y: lerp(-1.6, -5.8, i / Math.max(1, near - 1)),
      z: r(2.2, 4.6),
      w: r(6, 9.5),
      cell: i % 2 === 0 ? 2 : 0,
      alpha: 0.95,
      bright: 0.95,
    })
  }
  // lit underbelly near the horizon glow (seen once below the deck)
  for (let i = 0; i < (coarse ? 3 : 4); i++) {
    defs.push({
      x: r(-8, 8),
      y: r(-8.4, -7.0),
      z: r(-16, -9),
      w: r(4, 7),
      cell: i % 2 === 0 ? 0 : 2,
      alpha: 0.8,
      bright: 1.15,
    })
  }
  // upper layer: just below the opening frame, it closes over the camera as it sinks
  const upper = coarse ? 4 : 7
  for (let i = 0; i < upper; i++) {
    defs.push({
      x: lerp(-8, 8, i / Math.max(1, upper - 1)) + r(-1, 1),
      y: r(-1.0, 0.7),
      z: r(-1.5, 3.2),
      w: r(5.5, 9),
      cell: i % 2 === 0 ? 2 : 0,
      alpha: 0.85,
      bright: 1.05,
    })
  }
  // the dense band the camera sinks straight through (~40–60% of the descent)
  const band = coarse ? 4 : 6
  for (let i = 0; i < band; i++) {
    defs.push({
      x: lerp(-3.5, 3.5, i / Math.max(1, band - 1)) + r(-0.8, 0.8),
      y: r(-3.6, -1.4),
      z: r(2.6, 5.4),
      w: r(7, 10),
      cell: i % 3 === 1 ? 0 : 2,
      alpha: 0.62,
      bright: 1.0,
    })
  }
  return defs
}

export async function createCloudWorld(): Promise<CloudWorldApi> {
  const coarse =
    (typeof window.matchMedia === 'function' && window.matchMedia('(pointer: coarse)').matches) ||
    window.innerWidth < 768

  const tex = await loadTexture(atlas.src)
  tex.colorSpace = NoColorSpace
  tex.generateMipmaps = true
  tex.minFilter = LinearMipmapLinearFilter
  tex.magFilter = LinearFilter
  tex.flipY = true

  const renderer = new WebGLRenderer({
    antialias: false,
    alpha: true,
    premultipliedAlpha: true,
    stencil: false,
    powerPreference: 'high-performance',
  })
  renderer.outputColorSpace = LinearSRGBColorSpace
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, coarse ? 1.25 : 1.5))
  renderer.setClearColor(0x000000, 0)
  const canvas = renderer.domElement
  canvas.setAttribute('aria-hidden', 'true')
  canvas.setAttribute('data-cloud-canvas', '')
  canvas.style.cssText =
    'position:absolute;inset:0;width:100%;height:100%;display:block;pointer-events:none;opacity:0;transition:opacity .6s ease'

  const camera = new PerspectiveCamera(50, 1, 0.1, 60)
  const world = new Scene()
  const veilScene = new Scene()

  const U = {
    uTime: { value: 0 },
    uRes: { value: new Vector2(1, 1) },
    uMouse: { value: new Vector2(0.5, 0.5) },
    uMouseAmt: { value: 0 },
    uClick: { value: new Vector3(0.5, 0.5, -1) },
    uLightPos: { value: new Vector2(0.5, 0.28) },
    uLightAmt: { value: 1 },
    uEmber: { value: new Color(0.784, 0.525, 0.29) },
    uShield: { value: new Vector3(0.5, 0.52, 1) },
    uAtlas: { value: tex },
    uNear: { value: 0.35 },
    uFar: { value: 34 },
    uDepth: { value: 0 },
    uCover: { value: 0 },
  }

  const quad = new PlaneGeometry(2, 2)
  const sky = new Mesh(
    quad,
    new ShaderMaterial({
      uniforms: U,
      vertexShader: FULL_VERT,
      fragmentShader: SKY_FRAG,
      depthTest: false,
      depthWrite: false,
    })
  )
  sky.frustumCulled = false
  sky.renderOrder = -10
  world.add(sky)

  const unit = new PlaneGeometry(1, 1)
  const cloudMeshes: Mesh[] = []
  for (const [i, d] of buildClouds(coarse).entries()) {
    const cell = atlas.cells[d.cell]
    const h = d.w / cell.aspect
    const mat = new ShaderMaterial({
      uniforms: {
        ...U,
        uSize: { value: new Vector2(d.w, h * (cell.aspect > 1.5 ? 1 : 0.82)) },
        uCell: { value: new Vector2(cell.u, 0.5 - cell.v) },
        uSeed: { value: i * 1.37 + 0.5 },
        uFlip: { value: i % 2 },
        uAlpha: { value: d.alpha },
        uBright: { value: d.bright },
      },
      vertexShader: CLOUD_VERT,
      fragmentShader: CLOUD_FRAG,
      transparent: true,
      depthTest: false,
      depthWrite: false,
    })
    const m = new Mesh(unit, mat)
    m.position.set(d.x, d.y, d.z)
    m.frustumCulled = false
    world.add(m)
    cloudMeshes.push(m)
  }

  const veil = new Mesh(
    quad,
    new ShaderMaterial({
      uniforms: U,
      vertexShader: FULL_VERT,
      fragmentShader: VEIL_FRAG,
      transparent: true,
      depthTest: false,
      depthWrite: false,
    })
  )
  veil.frustumCulled = false
  veilScene.add(veil)

  // compile both programs up-front so the first visible frame never hitches
  renderer.setSize(2, 2, false)
  renderer.compile(world, camera)
  renderer.compile(veilScene, camera)

  /* ---------------- hosts & visibility ---------------- */
  let hostList: HostEntry[] = []
  const ratios = new Map<HTMLElement, number>()
  const io = new IntersectionObserver(
    entries => {
      for (const e of entries) ratios.set(e.target as HTMLElement, e.isIntersecting ? e.intersectionRatio : 0)
      wake()
    },
    { threshold: [0, 0.01, 0.1, 0.25, 0.5, 0.75, 1] }
  )
  let current: HostEntry | null = null
  let size = { w: 0, h: 0 }
  const ro = new ResizeObserver(() => resize())

  function resize() {
    if (!current) return
    const w = Math.max(1, current.el.clientWidth)
    const h = Math.max(1, current.el.clientHeight)
    if (w === size.w && h === size.h) return
    size = { w, h }
    renderer.setSize(w, h, false)
    camera.aspect = w / h
    // keep the deck framed on tall phones
    camera.fov = w / h < 0.8 ? 62 : 50
    camera.updateProjectionMatrix()
    U.uRes.value.set(w, h)
  }

  function attach(host: HostEntry | null) {
    if (current === host) return
    if (current) {
      ro.unobserve(current.el)
      setModeLive(current.mode, false)
      if (current.mode === 'overlay') current.el.style.visibility = 'hidden'
    }
    current = host
    canvas.style.transition = host && host.mode === 'overlay' ? 'none' : 'opacity .6s ease'
    canvas.style.opacity = '0'
    if (!host) {
      canvas.remove()
      return
    }
    host.el.appendChild(canvas)
    if (host.mode === 'overlay') host.el.style.visibility = 'visible'
    size = { w: 0, h: 0 }
    ro.observe(host.el)
    resize()
    snapCamera = true
    firstFrame = true
  }

  /* ---------------- input ---------------- */
  const mouse = { x: 0.5, y: 0.5, amt: 0, last: -10 }
  let clickAt = -10
  const onMove = (e: PointerEvent) => {
    if (!current) return
    const r = current.el.getBoundingClientRect()
    mouse.x = (e.clientX - r.left) / Math.max(1, r.width)
    mouse.y = 1 - (e.clientY - r.top) / Math.max(1, r.height)
    mouse.last = clock
  }
  const onDown = (e: PointerEvent) => {
    onMove(e)
    if (!current) return
    U.uClick.value.x = mouse.x
    U.uClick.value.y = mouse.y
    clickAt = clock
  }
  window.addEventListener('pointermove', onMove, { passive: true })
  window.addEventListener('pointerdown', onDown, { passive: true })

  /* ---------------- frame loop ---------------- */
  let raf = 0
  let running = false
  let last = performance.now()
  let clock = 0
  let veilV = 0
  let snapCamera = true
  let firstFrame = true
  const cam = { x: 0, y: 3, z: 8, pitch: -0.2, lx: 0.5, ly: 0.3, la: 1, shield: 1, depth: 0 }
  const par = { x: 0, y: 0 }
  const tmp = new Vector2()

  function pickHost(): HostEntry | null {
    const overlayHost = hostList.find(h => h.mode === 'overlay')
    if (overlayHost && (cloud.overlay || veilV > 0.002)) return overlayHost
    let best: HostEntry | null = null
    let bestRatio = 0
    for (const h of hostList) {
      if (h.mode === 'overlay') continue
      const ratio = ratios.get(h.el) || 0
      if (ratio > bestRatio) {
        best = h
        bestRatio = ratio
      }
    }
    return best
  }

  function targetPose(mode: CloudMode) {
    if (mode === 'footer') {
      const f = smooth(clamp01(cloud.footer))
      return {
        x: 0,
        y: lerp(-9.4, -6.6, f),
        z: 4.5,
        pitch: lerp(0.38, 0.22, f),
        lx: 0.5,
        ly: lerp(0.02, 0.12, f),
        la: lerp(0.9, 1.25, f),
        shield: 0,
        depth: 1,
      }
    }
    const p = clamp01(cloud.hero)
    const s = smooth(p)
    return {
      x: 0,
      y: lerp(4.4, -9.2, lerp(p, s, 0.35)),
      z: lerp(8.5, 3.0, p),
      pitch: lerp(-0.14, 0.04, smoothRange(0.0, 0.9, p)),
      lx: 0.5,
      ly: lerp(0.24, 0.48, smoothRange(0.35, 0.95, p)),
      la: lerp(0.85, 1.35, smoothRange(0.2, 1, p)),
      shield: 1 - smoothRange(0.12, 0.36, p),
      depth: smoothRange(0.5, 1, p),
    }
  }

  function frame(now: number) {
    raf = requestAnimationFrame(frame)
    const dt = Math.min(0.05, (now - last) / 1000)
    last = now
    clock += dt

    // veil eases linearly toward its target so loader/transition timing is exact
    const step = dt * cloud.coverSpeed
    veilV = cloud.cover > veilV ? Math.min(cloud.cover, veilV + step) : Math.max(cloud.cover, veilV - step)

    const host = pickHost()
    attach(host)
    if (!host) {
      stop()
      return
    }

    U.uTime.value = clock
    const idle = clock - mouse.last
    mouse.amt += ((idle < 1.6 ? 1 : 0) - mouse.amt) * Math.min(1, dt * 3)
    tmp.set(mouse.x, mouse.y)
    U.uMouse.value.lerp(tmp, Math.min(1, dt * 6))
    U.uMouseAmt.value = mouse.amt
    U.uClick.value.z = clock - clickAt < 3 ? clock - clickAt : -1

    if (host.mode === 'overlay') {
      U.uCover.value = smooth(veilV)
      renderer.render(veilScene, camera)
    } else {
      const t = targetPose(host.mode)
      const k = snapCamera ? 1 : 1 - Math.exp(-dt * 5)
      snapCamera = false
      ;(Object.keys(t) as Array<keyof typeof t>).forEach(key => {
        cam[key] = lerp(cam[key], t[key], k)
      })
      par.x = lerp(par.x, (mouse.x - 0.5) * mouse.amt, Math.min(1, dt * 2.5))
      par.y = lerp(par.y, (mouse.y - 0.5) * mouse.amt, Math.min(1, dt * 2.5))
      camera.position.set(cam.x + par.x * 0.5, cam.y + par.y * 0.3, cam.z)
      camera.rotation.set(cam.pitch + par.y * 0.03, -par.x * 0.04, 0)
      const flash = U.uClick.value.z > 0 ? Math.exp(-U.uClick.value.z * 2.5) * 0.35 : 0
      U.uLightPos.value.set(cam.lx, cam.ly)
      U.uLightAmt.value = cam.la + flash
      U.uShield.value.z = cam.shield
      U.uDepth.value = cam.depth
      renderer.render(world, camera)
    }
    if (firstFrame) {
      firstFrame = false
      canvas.style.opacity = '1'
      setModeLive(host.mode, true)
    }
  }

  function start() {
    if (running) return
    running = true
    last = performance.now()
    raf = requestAnimationFrame(frame)
  }
  function stop() {
    running = false
    cancelAnimationFrame(raf)
  }
  function wake() {
    if (pickHost()) start()
  }
  const onVis = () => (document.hidden ? stop() : wake())
  document.addEventListener('visibilitychange', onVis)
  // overlay requests come from plain state; poll cheaply while asleep
  const poll = window.setInterval(() => {
    if (!running && !document.hidden) wake()
  }, 120)

  return {
    setHosts(next) {
      for (const h of hostList) if (!next.includes(h)) io.unobserve(h.el)
      for (const h of next) if (!hostList.includes(h) && h.mode !== 'overlay') io.observe(h.el)
      hostList = next
      if (current && !next.includes(current)) attach(null)
      wake()
    },
    veil: () => veilV,
    dispose() {
      stop()
      window.clearInterval(poll)
      io.disconnect()
      ro.disconnect()
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerdown', onDown)
      document.removeEventListener('visibilitychange', onVis)
      canvas.remove()
      renderer.dispose()
      tex.dispose()
      cloudMeshes.forEach(m => (m.material as ShaderMaterial).dispose())
    },
  }
}
