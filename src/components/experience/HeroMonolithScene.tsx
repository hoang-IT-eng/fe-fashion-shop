import React, { useEffect, useRef } from 'react'
import { motionDisabled } from '../../lib/motion'

/**
 * Shared mutable hero state — the CTA coupling.
 * The interface layer (HomePage) sets `hoverTarget` to 1 while the
 * circular scroll button is hovered/focused; the render loop eases
 * `hover` toward it and uses it to (a) damp the camera drift to a stop
 * and (b) disperse the dust field outward into a loose cloud.
 */
export const heroState = {
  hover: 0,
  hoverTarget: 0,
}

interface HeroSceneProps {
  /** Fired once the canvas has rendered its first frames. */
  onReady?: () => void
  /** Fired when WebGL is unavailable or initialisation fails. */
  onFallback?: () => void
}

const PLANE_DEFS = [
  // Gallery composition: one hero plane centre, portraits flanking at
  // depth, two smaller frames further back — all floating in fog.
  { src: '/images/enigma/grail-sneaker-obsidian.jpg', w: 3.5, h: 2.6, pos: [0, 0.05, 0] as const, rotY: -0.05 },
  { src: '/images/enigma/grail-leather-bomber.jpg', w: 2.0, h: 2.5, pos: [-3.6, 0.75, -1.7] as const, rotY: 0.52 },
  { src: '/images/enigma/grail-trench-monolith.jpg', w: 2.0, h: 2.5, pos: [3.6, -0.45, -1.9] as const, rotY: -0.52 },
  { src: '/images/enigma/grail-chronograph-relic.jpg', w: 1.7, h: 1.7, pos: [-2.5, -1.6, -3.6] as const, rotY: 0.3 },
  { src: '/images/enigma/reborn-atelier.jpg', w: 2.3, h: 1.55, pos: [2.6, 1.5, -4.0] as const, rotY: -0.3 },
]

function makeDotTexture(THREE: any) {
  const size = 64
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  if (!ctx) return null
  const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  grad.addColorStop(0, 'rgba(255,255,255,1)')
  grad.addColorStop(0.4, 'rgba(255,255,255,0.5)')
  grad.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, size, size)
  return new THREE.CanvasTexture(canvas)
}

/**
 * The night-gallery hero scene (vanilla three.js, lazily imported):
 * fog-bound black stage, five photographic planes floating at depth,
 * a slow lerp-dolly camera, and a dust field of soft points that the
 * pointer physically pushes away (ray-distance repulsion) and that
 * disperses into a glowing cloud while the CTA button is hovered.
 *
 * Rendering pauses when the hero leaves the viewport
 * (IntersectionObserver) and pixel ratio is capped per device class.
 */
export function HeroScene({ onReady, onFallback }: HeroSceneProps) {
  const mountRef = useRef<HTMLDivElement | null>(null)
  const readyRef = useRef(onReady)
  const fallbackRef = useRef(onFallback)
  readyRef.current = onReady
  fallbackRef.current = onFallback

  useEffect(() => {
    const container = mountRef.current
    if (!container) return
    if (motionDisabled()) {
      fallbackRef.current?.()
      return
    }

    let disposed = false
    let cleanupFn: (() => void) | undefined

    void import('three')
      .then(THREE => {
        if (disposed || !mountRef.current) return
        try {
          const isCoarse =
            (typeof window.matchMedia === 'function' &&
              window.matchMedia('(pointer: coarse)').matches) ||
            window.innerWidth < 768

          const renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: false,
            powerPreference: 'high-performance',
          })
          renderer.setPixelRatio(
            Math.min(window.devicePixelRatio || 1, isCoarse ? 1.5 : 1.75)
          )
          renderer.setSize(container.clientWidth || 1, container.clientHeight || 1)
          renderer.setClearColor(0x0a0a0a, 1)
          container.appendChild(renderer.domElement)

          const scene = new THREE.Scene()
          scene.fog = new THREE.FogExp2(0x0a0a0a, 0.052)

          const camera = new THREE.PerspectiveCamera(
            40,
            (container.clientWidth || 1) / (container.clientHeight || 1),
            0.1,
            100
          )
          camera.position.set(0, 0, 7.4)

          /* ---------------- gallery planes ---------------- */
          const textureLoader = new THREE.TextureLoader()
          const planes: Array<{
            mesh: any
            baseY: number
            phase: number
            sway: number
          }> = []
          const disposables: Array<{ dispose: () => void }> = []

          PLANE_DEFS.forEach((def, i) => {
            const mat = new THREE.MeshBasicMaterial({
              color: 0x161616,
              fog: true,
            })
            const geo = new THREE.PlaneGeometry(def.w, def.h)
            const mesh = new THREE.Mesh(geo, mat)
            mesh.position.set(def.pos[0], def.pos[1], def.pos[2])
            mesh.rotation.y = def.rotY
            scene.add(mesh)
            planes.push({
              mesh,
              baseY: def.pos[1],
              phase: i * 1.37,
              sway: 0.012 + (i % 3) * 0.004,
            })
            disposables.push(geo, mat)

            textureLoader.load(
              def.src,
              (tex: any) => {
                tex.colorSpace = THREE.SRGBColorSpace
                mat.map = tex
                mat.color.set(0xffffff)
                mat.needsUpdate = true
                disposables.push(tex)
              },
              undefined,
              () => {
                /* keep the dark slab — a missing photo degrades to a
                   matte gallery frame rather than breaking the scene */
              }
            )
          })

          /* ---------------- dust field ---------------- */
          const COUNT = isCoarse ? 800 : 2400
          const basePos = new Float32Array(COUNT * 3)
          const dispPos = new Float32Array(COUNT * 3)
          const seeds = new Float32Array(COUNT)
          const positions = new Float32Array(COUNT * 3)

          for (let i = 0; i < COUNT; i++) {
            const x = (Math.random() - 0.5) * 17
            const y = (Math.random() - 0.5) * 8.6
            const z = -4 + Math.random() * 7.5
            basePos[i * 3] = x
            basePos[i * 3 + 1] = y
            basePos[i * 3 + 2] = z
            // Dispersed shell: pushed outward from the stage centre.
            const len = Math.sqrt(x * x + y * y + (z + 1) * (z + 1)) || 1
            const grow = 1.9 + Math.random() * 1.6
            dispPos[i * 3] = (x / len) * len * grow * 0.62 + x * 0.4
            dispPos[i * 3 + 1] = (y / len) * len * grow * 0.62 + y * 0.4
            dispPos[i * 3 + 2] = z - 0.6 - Math.random() * 1.4
            seeds[i] = Math.random()
          }

          const dustGeo = new THREE.BufferGeometry()
          dustGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
          const dotTex = makeDotTexture(THREE)
          const dustMat = new THREE.PointsMaterial({
            size: 0.05,
            map: dotTex || undefined,
            transparent: true,
            opacity: 0.5,
            color: 0xf9f9f9,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
            sizeAttenuation: true,
          })
          const dust = new THREE.Points(dustGeo, dustMat)
          scene.add(dust)
          disposables.push(dustGeo, dustMat)
          if (dotTex) disposables.push(dotTex)

          /* ---------------- pointer ---------------- */
          const pointer = { x: 0, y: 0, active: false }
          const onPointerMove = (e: PointerEvent) => {
            pointer.x = (e.clientX / window.innerWidth) * 2 - 1
            pointer.y = -((e.clientY / window.innerHeight) * 2 - 1)
            pointer.active = true
          }
          window.addEventListener('pointermove', onPointerMove, { passive: true })

          /* ---------------- resize ---------------- */
          const onResize = () => {
            if (!mountRef.current) return
            const w = mountRef.current.clientWidth || 1
            const h = mountRef.current.clientHeight || 1
            camera.aspect = w / h
            camera.updateProjectionMatrix()
            renderer.setSize(w, h)
          }
          window.addEventListener('resize', onResize)

          /* ---------------- visibility gating ---------------- */
          let running = true
          let frameId = 0
          const io = new IntersectionObserver(
            entries => {
              const visible = entries[0]?.isIntersecting ?? true
              if (visible && !running) {
                running = true
                frameId = window.requestAnimationFrame(animate)
              } else if (!visible) {
                running = false
                window.cancelAnimationFrame(frameId)
              }
            },
            { threshold: 0.02 }
          )
          io.observe(container)

          /* ---------------- animation ---------------- */
          const clock = new THREE.Clock()
          const rayOrigin = new THREE.Vector3()
          const rayDir = new THREE.Vector3()
          const tmpV = new THREE.Vector3()
          const op = new THREE.Vector3()
          const closest = new THREE.Vector3()
          const diff = new THREE.Vector3()
          let framesRendered = 0
          let readyFired = false
          let tiltX = 0
          let tiltY = 0

          const animate = () => {
            if (disposed) return
            frameId = window.requestAnimationFrame(animate)
            if (document.hidden) return
            const t = clock.getElapsedTime()

            /* CTA coupling: ease the shared hover value */
            heroState.hover += (heroState.hoverTarget - heroState.hover) * 0.045
            const hover = heroState.hover
            const driftAmp = 1 - hover

            /* Camera: slow baked-path dolly + pointer tilt */
            tiltX += (pointer.x * 0.55 - tiltX) * 0.03
            tiltY += (pointer.y * 0.38 - tiltY) * 0.03
            camera.position.x = Math.sin(t * 0.11) * 0.55 * driftAmp + tiltX * 0.35
            camera.position.y =
              Math.sin(t * 0.083 + 1.7) * 0.32 * driftAmp + tiltY * 0.3
            camera.position.z = 7.4 - Math.sin(t * 0.05) * 0.55 * driftAmp
            camera.lookAt(tiltX * 0.5, tiltY * 0.35, 0)

            /* Planes: gentle float + sway */
            for (const p of planes) {
              p.mesh.position.y =
                p.baseY + Math.sin(t * 0.4 + p.phase) * 0.055 * driftAmp
              p.mesh.rotation.z = Math.sin(t * 0.22 + p.phase) * p.sway * driftAmp
            }

            /* Dust: base <-> dispersed mix, sine drift, ray repulsion */
            tmpV.set(pointer.x, pointer.y, 0.5).unproject(camera)
            rayOrigin.copy(camera.position)
            rayDir.copy(tmpV).sub(rayOrigin).normalize()
            const REPULSE_R = 1.15
            const posAttr = dustGeo.getAttribute('position')

            for (let i = 0; i < COUNT; i++) {
              const ix = i * 3
              const seed = seeds[i]
              let x =
                basePos[ix] +
                (dispPos[ix] - basePos[ix]) * hover +
                Math.sin(t * 0.12 + seed * 6.283) * 0.35
              let y =
                basePos[ix + 1] +
                (dispPos[ix + 1] - basePos[ix + 1]) * hover +
                Math.cos(t * 0.09 + seed * 4.2) * 0.3
              let z =
                basePos[ix + 2] +
                (dispPos[ix + 2] - basePos[ix + 2]) * hover +
                Math.sin(t * 0.07 + seed * 5.1) * 0.22

              if (pointer.active) {
                op.set(x - rayOrigin.x, y - rayOrigin.y, z - rayOrigin.z)
                const along = op.dot(rayDir)
                if (along > 0) {
                  closest
                    .copy(rayDir)
                    .multiplyScalar(along)
                    .add(rayOrigin)
                  diff.set(x - closest.x, y - closest.y, z - closest.z)
                  const dist = diff.length()
                  if (dist > 0.0001 && dist < REPULSE_R) {
                    const push = ((REPULSE_R - dist) / REPULSE_R) * 0.85
                    diff.multiplyScalar(1 / dist)
                    x += diff.x * push
                    y += diff.y * push
                    z += diff.z * push
                  }
                }
              }

              positions[ix] = x
              positions[ix + 1] = y
              positions[ix + 2] = z
            }
            posAttr.needsUpdate = true

            /* Dispersed dust reads as a loose glowing cloud */
            dustMat.opacity = 0.5 + hover * 0.3
            dustMat.size = 0.05 + hover * 0.035

            renderer.render(scene, camera)

            framesRendered += 1
            if (!readyFired && framesRendered >= 8) {
              readyFired = true
              readyRef.current?.()
            }
          }
          frameId = window.requestAnimationFrame(animate)

          cleanupFn = () => {
            heroState.hoverTarget = 0
            heroState.hover = 0
            io.disconnect()
            window.removeEventListener('pointermove', onPointerMove)
            window.removeEventListener('resize', onResize)
            window.cancelAnimationFrame(frameId)
            disposables.forEach(d => d.dispose())
            renderer.dispose()
            if (renderer.domElement.parentElement === container) {
              container.removeChild(renderer.domElement)
            }
          }
        } catch {
          fallbackRef.current?.()
        }
      })
      .catch(() => fallbackRef.current?.())

    return () => {
      disposed = true
      if (cleanupFn) cleanupFn()
    }
  }, [])

  return <div ref={mountRef} className="absolute inset-0" aria-hidden="true" />
}

export default HeroScene
