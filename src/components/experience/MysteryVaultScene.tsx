import { useEffect, useRef, useState } from 'react'

interface MysteryVaultSceneProps {
  unsealed?: boolean
  tierSlug?: string
}

/**
 * The sealed chest, in the Nocturne grade: umber lacquer body, brass bands,
 * one ember light inside. Unsealing lifts the lid, floods the interior with
 * ember light and releases a slow column of sparks. Pauses offscreen; DPR
 * capped at 1.5; falls back to the painted chest without WebGL.
 */
export default function MysteryVaultScene({ unsealed = false, tierSlug = 'inner-circle-chest' }: MysteryVaultSceneProps) {
  const mountRef = useRef<HTMLDivElement | null>(null)
  const unsealedRef = useRef(unsealed)
  unsealedRef.current = unsealed
  const [webglReady, setWebglReady] = useState(true)

  useEffect(() => {
    const container = mountRef.current
    if (!container) return
    if (import.meta.env.MODE === 'test' || (typeof navigator !== 'undefined' && navigator.webdriver)) {
      setWebglReady(false)
      return
    }

    let disposed = false
    let frameId = 0
    let cleanupFn: (() => void) | undefined

    void import('../../lib/threeVault')
      .then(THREE => {
        if (disposed || !mountRef.current) return
        try {
          const size = () => [container.clientWidth || 440, container.clientHeight || 360] as const
          let [width, height] = size()

          const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' })
          renderer.outputColorSpace = THREE.SRGBColorSpace
          renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5))
          renderer.setSize(width, height)
          container.innerHTML = ''
          container.appendChild(renderer.domElement)

          const scene = new THREE.Scene()
          scene.fog = new THREE.Fog(0x0b0908, 6, 13)
          const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 50)
          camera.position.set(0, 1.55, 5.6)
          camera.lookAt(0, 0.05, 0)

          scene.add(new THREE.AmbientLight(0x8a6446, 1.1))
          const key = new THREE.DirectionalLight(0xe0a874, 2.4)
          key.position.set(-3.5, 4.5, 3)
          scene.add(key)
          const rim = new THREE.DirectionalLight(0xc8864a, 0.9)
          rim.position.set(3.5, 2, -3)
          scene.add(rim)
          const ember = new THREE.PointLight(0xc8864a, 0.8, 7, 1.6)
          ember.position.set(0, 0.1, 0)
          scene.add(ember)

          const brassHex = tierSlug === 'grail-vault' ? 0xd2a46a : tierSlug === 'initiate-box' ? 0x8f7a62 : 0xb8894f
          const bodyMat = new THREE.MeshStandardMaterial({ color: 0x4a3122, metalness: 0.3, roughness: 0.5 })
          const brassMat = new THREE.MeshStandardMaterial({ color: brassHex, metalness: 0.9, roughness: 0.32 })
          const glowMat = new THREE.MeshBasicMaterial({ color: 0xe0a874, transparent: true, opacity: 0.0 })

          const chest = new THREE.Group()
          scene.add(chest)
          const geos: { dispose: () => void }[] = []
          const add = <G extends { dispose: () => void }>(g: G) => (geos.push(g), g)

          const base = new THREE.Mesh(add(new THREE.BoxGeometry(2.3, 1.1, 1.5)), bodyMat)
          base.position.y = -0.38
          chest.add(base)
          // brass straps + corner posts
          for (const x of [-0.8, 0.8]) {
            const strap = new THREE.Mesh(add(new THREE.BoxGeometry(0.12, 1.14, 1.54)), brassMat)
            strap.position.set(x, -0.38, 0)
            chest.add(strap)
          }
          const band = new THREE.Mesh(add(new THREE.BoxGeometry(2.36, 0.07, 1.56)), brassMat)
          band.position.y = 0.17
          chest.add(band)
          // glowing interior (visible when the lid lifts)
          const inner = new THREE.Mesh(add(new THREE.PlaneGeometry(2.1, 1.3)), glowMat)
          inner.rotation.x = -Math.PI / 2
          inner.position.y = 0.16
          chest.add(inner)

          const lidPivot = new THREE.Group()
          lidPivot.position.set(0, 0.2, -0.75)
          chest.add(lidPivot)
          const lid = new THREE.Mesh(add(new THREE.BoxGeometry(2.32, 0.4, 1.52)), bodyMat)
          lid.position.set(0, 0.2, 0.75)
          lidPivot.add(lid)
          const lidCap = new THREE.Mesh(add(new THREE.BoxGeometry(2.2, 0.12, 1.36)), bodyMat)
          lidCap.position.set(0, 0.46, 0.75)
          lidPivot.add(lidCap)
          for (const x of [-0.8, 0.8]) {
            const s = new THREE.Mesh(add(new THREE.BoxGeometry(0.12, 0.54, 1.56)), brassMat)
            s.position.set(x, 0.25, 0.75)
            lidPivot.add(s)
          }
          const seal = new THREE.Mesh(add(new THREE.OctahedronGeometry(0.17, 0)), brassMat)
          seal.position.set(0, 0.17, 0.8)
          chest.add(seal)

          // sparks
          const N = 140
          const pos = new Float32Array(N * 3)
          const speed = new Float32Array(N)
          const reset = (i: number, y = Math.random() * 2.6) => {
            pos[i * 3] = (Math.random() - 0.5) * 1.6
            pos[i * 3 + 1] = 0.15 + y
            pos[i * 3 + 2] = (Math.random() - 0.5) * 0.9
            speed[i] = 0.004 + Math.random() * 0.01
          }
          for (let i = 0; i < N; i++) reset(i)
          const sparkGeo = add(new THREE.BufferGeometry())
          sparkGeo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
          const sparkMat = new THREE.PointsMaterial({
            color: 0xe0a874,
            size: 0.05,
            transparent: true,
            opacity: 0,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
          })
          const sparks = new THREE.Points(sparkGeo, sparkMat)
          chest.add(sparks)

          let pointerX = 0
          const onMove = (e: PointerEvent) => {
            pointerX = (e.clientX / window.innerWidth - 0.5) * 0.9
          }
          window.addEventListener('pointermove', onMove, { passive: true })

          const onResize = () => {
            ;[width, height] = size()
            renderer.setSize(width, height)
            camera.aspect = width / height
            camera.updateProjectionMatrix()
          }
          const ro = new ResizeObserver(onResize)
          ro.observe(container)

          let visible = true
          const io = new IntersectionObserver(([e]) => {
            visible = e.isIntersecting
            if (visible && !frameId) frameId = requestAnimationFrame(animate)
          })
          io.observe(container)

          let t = 0
          const animate = () => {
            frameId = 0
            if (disposed || !visible || document.hidden) return
            t += 0.016
            const open = unsealedRef.current
            chest.rotation.y += (Math.sin(t * 0.35) * 0.35 + pointerX * 0.5 - chest.rotation.y) * 0.03
            chest.position.y = Math.sin(t * 0.9) * 0.03
            lidPivot.rotation.x += ((open ? -1.05 : 0) - lidPivot.rotation.x) * 0.06
            ember.intensity += ((open ? 5.5 : 0.8) - ember.intensity) * 0.06
            glowMat.opacity += ((open ? 0.85 : 0) - glowMat.opacity) * 0.06
            sparkMat.opacity += ((open ? 0.9 : 0) - sparkMat.opacity) * 0.04
            seal.rotation.y += 0.02
            seal.position.y += ((open ? 0.95 : 0.17) - seal.position.y) * 0.05
            if (sparkMat.opacity > 0.01) {
              for (let i = 0; i < N; i++) {
                pos[i * 3 + 1] += speed[i]
                pos[i * 3] += Math.sin(t * 2 + i) * 0.0015
                if (pos[i * 3 + 1] > 2.8) reset(i, 0)
              }
              sparkGeo.attributes.position.needsUpdate = true
            }
            renderer.render(scene, camera)
            frameId = requestAnimationFrame(animate)
          }
          const onVis = () => {
            if (!document.hidden && visible && !frameId) frameId = requestAnimationFrame(animate)
          }
          document.addEventListener('visibilitychange', onVis)
          animate()

          cleanupFn = () => {
            window.removeEventListener('pointermove', onMove)
            document.removeEventListener('visibilitychange', onVis)
            ro.disconnect()
            io.disconnect()
            cancelAnimationFrame(frameId)
            geos.forEach(g => g.dispose())
            bodyMat.dispose()
            brassMat.dispose()
            glowMat.dispose()
            sparkMat.dispose()
            renderer.dispose()
          }
        } catch {
          setWebglReady(false)
        }
      })
      .catch(() => setWebglReady(false))

    return () => {
      disposed = true
      cancelAnimationFrame(frameId)
      cleanupFn?.()
    }
  }, [tierSlug])

  return (
    <div className="relative flex h-[300px] w-full items-center justify-center md:h-[360px]">
      <div ref={mountRef} className="h-full w-full" aria-hidden="true" />
      {!webglReady && (
        <img
          src="/images/enigma/mystery-chest.jpg"
          alt="The sealed Nocturne chest"
          className="h-full w-full rounded border border-bone/15 object-cover"
        />
      )}
    </div>
  )
}
