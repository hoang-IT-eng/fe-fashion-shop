import { useEffect, useRef, useState } from 'react'

interface MysteryVaultSceneProps {
  unsealed?: boolean
  tierSlug?: string
}

/**
 * The sealed chest, in the Nocturne grade: warm umber lacquer body, brushed brass
 * bands, hemisphere + chiaroscuro key/rim lighting, and an ember core inside.
 * Always keeps the painted chest backdrop visible until the first WebGL frame
 * renders (and restores it on context loss or unsupported GPUs) so the chest
 * never disappears in production deploys.
 */
export default function MysteryVaultScene({ unsealed = false, tierSlug = 'inner-circle-chest' }: MysteryVaultSceneProps) {
  const mountRef = useRef<HTMLDivElement | null>(null)
  const unsealedRef = useRef(unsealed)
  unsealedRef.current = unsealed
  const [canvasReady, setCanvasReady] = useState(false)

  useEffect(() => {
    const container = mountRef.current
    if (!container) return
    setCanvasReady(false)

    if (import.meta.env.MODE === 'test' || (typeof navigator !== 'undefined' && navigator.webdriver)) {
      return
    }

    let disposed = false
    let frameId = 0
    let cleanupFn: (() => void) | undefined

    void import('../../lib/threeVault')
      .then(THREE => {
        if (disposed || !mountRef.current) return
        try {
          const size = () => [Math.max(container.clientWidth, 300), Math.max(container.clientHeight, 260)] as const
          let [width, height] = size()

          const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'default' })
          renderer.outputColorSpace = THREE.SRGBColorSpace
          renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5))
          renderer.setSize(width, height)
          renderer.domElement.style.width = '100%'
          renderer.domElement.style.height = '100%'
          renderer.domElement.style.display = 'block'

          container.innerHTML = ''
          container.appendChild(renderer.domElement)

          const onContextLost = (ev: Event) => {
            ev.preventDefault()
            setCanvasReady(false)
          }
          renderer.domElement.addEventListener('webglcontextlost', onContextLost, false)

          const scene = new THREE.Scene()
          const camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 50)
          camera.position.set(0, 1.5, 5.2)
          camera.lookAt(0, 0.05, 0)

          // Warm museum chiaroscuro lighting so walnut lacquer & brushed brass read clearly without an HDR envmap
          scene.add(new THREE.HemisphereLight(0xffe8c8, 0x2a180e, 1.55))
          scene.add(new THREE.AmbientLight(0xa37856, 0.85))
          const key = new THREE.DirectionalLight(0xffe1b5, 3.1)
          key.position.set(-3.2, 4.8, 3.8)
          scene.add(key)
          const fill = new THREE.DirectionalLight(0xf3cfa0, 1.35)
          fill.position.set(3.2, 2.2, 3.2)
          scene.add(fill)
          const rim = new THREE.DirectionalLight(0xe5974e, 2.2)
          rim.position.set(3.5, 2.5, -3.2)
          scene.add(rim)
          const ember = new THREE.PointLight(0xe89a52, 1.6, 8, 1.4)
          ember.position.set(0, 0.18, 0.2)
          scene.add(ember)

          const brassHex = tierSlug === 'grail-vault' ? 0xe5b976 : tierSlug === 'initiate-box' ? 0xb59c7c : 0xd29d5e
          const bodyMat = new THREE.MeshStandardMaterial({
            color: 0x6b442b,
            metalness: 0.18,
            roughness: 0.44,
            emissive: 0x1e1008,
            emissiveIntensity: 0.28,
          })
          const brassMat = new THREE.MeshStandardMaterial({
            color: brassHex,
            metalness: 0.52,
            roughness: 0.28,
            emissive: 0x3b210b,
            emissiveIntensity: 0.36,
          })
          const glowMat = new THREE.MeshBasicMaterial({ color: 0xf0b26e, transparent: true, opacity: 0.18 })

          const chest = new THREE.Group()
          scene.add(chest)
          const geos: { dispose: () => void }[] = []
          const add = <G extends { dispose: () => void }>(g: G) => (geos.push(g), g)

          const base = new THREE.Mesh(add(new THREE.BoxGeometry(2.34, 1.12, 1.52)), bodyMat)
          base.position.y = -0.38
          chest.add(base)

          // Brass vertical straps & horizontal trim band
          for (const x of [-0.82, 0.82]) {
            const strap = new THREE.Mesh(add(new THREE.BoxGeometry(0.14, 1.16, 1.57)), brassMat)
            strap.position.set(x, -0.38, 0)
            chest.add(strap)
          }
          const band = new THREE.Mesh(add(new THREE.BoxGeometry(2.4, 0.09, 1.6)), brassMat)
          band.position.y = 0.18
          chest.add(band)

          // Glowing ember interior
          const inner = new THREE.Mesh(add(new THREE.PlaneGeometry(2.14, 1.32)), glowMat)
          inner.rotation.x = -Math.PI / 2
          inner.position.y = 0.17
          chest.add(inner)

          const lidPivot = new THREE.Group()
          lidPivot.position.set(0, 0.21, -0.76)
          chest.add(lidPivot)
          const lid = new THREE.Mesh(add(new THREE.BoxGeometry(2.36, 0.42, 1.54)), bodyMat)
          lid.position.set(0, 0.21, 0.76)
          lidPivot.add(lid)
          const lidCap = new THREE.Mesh(add(new THREE.BoxGeometry(2.22, 0.14, 1.36)), bodyMat)
          lidCap.position.set(0, 0.48, 0.76)
          lidPivot.add(lidCap)
          for (const x of [-0.82, 0.82]) {
            const s = new THREE.Mesh(add(new THREE.BoxGeometry(0.14, 0.56, 1.59)), brassMat)
            s.position.set(x, 0.26, 0.76)
            lidPivot.add(s)
          }

          const seal = new THREE.Mesh(add(new THREE.OctahedronGeometry(0.19, 0)), brassMat)
          seal.position.set(0, 0.18, 0.84)
          chest.add(seal)

          // Ambient & unseal ember sparks
          const N = 120
          const pos = new Float32Array(N * 3)
          const speed = new Float32Array(N)
          const reset = (i: number, y = Math.random() * 2.5) => {
            pos[i * 3] = (Math.random() - 0.5) * 1.8
            pos[i * 3 + 1] = 0.1 + y
            pos[i * 3 + 2] = (Math.random() - 0.5) * 1.0
            speed[i] = 0.004 + Math.random() * 0.009
          }
          for (let i = 0; i < N; i++) reset(i)
          const sparkGeo = add(new THREE.BufferGeometry())
          sparkGeo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
          const sparkMat = new THREE.PointsMaterial({
            color: 0xf0b26e,
            size: 0.055,
            transparent: true,
            opacity: 0.28,
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
          const io = new IntersectionObserver(
            ([e]) => {
              visible = e.isIntersecting
              if (visible && !frameId) frameId = requestAnimationFrame(animate)
            },
            { threshold: 0.01 }
          )
          io.observe(container)

          let t = 0
          let markedReady = false
          const animate = () => {
            frameId = 0
            if (disposed || !visible || document.hidden) return
            t += 0.016
            const open = unsealedRef.current
            chest.rotation.y += (Math.sin(t * 0.35) * 0.35 + pointerX * 0.5 - chest.rotation.y) * 0.04
            chest.position.y = Math.sin(t * 0.9) * 0.04
            lidPivot.rotation.x += ((open ? -1.05 : 0) - lidPivot.rotation.x) * 0.06
            ember.intensity += ((open ? 5.8 : 1.6) - ember.intensity) * 0.06
            glowMat.opacity += ((open ? 0.9 : 0.16) - glowMat.opacity) * 0.06
            sparkMat.opacity += ((open ? 0.92 : 0.28) - sparkMat.opacity) * 0.04
            seal.rotation.y += 0.02
            seal.position.y += ((open ? 0.95 : 0.18) - seal.position.y) * 0.05
            for (let i = 0; i < N; i++) {
              pos[i * 3 + 1] += speed[i]
              pos[i * 3] += Math.sin(t * 2 + i) * 0.0015
              if (pos[i * 3 + 1] > 2.8) reset(i, 0)
            }
            sparkGeo.attributes.position.needsUpdate = true

            renderer.render(scene, camera)
            if (!markedReady) {
              markedReady = true
              setCanvasReady(true)
            }
            frameId = requestAnimationFrame(animate)
          }

          const onVis = () => {
            if (!document.hidden && visible && !frameId) frameId = requestAnimationFrame(animate)
          }
          document.addEventListener('visibilitychange', onVis)
          animate()

          cleanupFn = () => {
            renderer.domElement.removeEventListener('webglcontextlost', onContextLost)
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
          setCanvasReady(false)
        }
      })
      .catch(() => setCanvasReady(false))

    return () => {
      disposed = true
      cancelAnimationFrame(frameId)
      cleanupFn?.()
    }
  }, [tierSlug])

  return (
    <div className="relative h-[300px] w-full overflow-hidden rounded bg-[radial-gradient(ellipse_75%_65%_at_50%_58%,rgba(224,158,92,0.28),rgba(11,9,8,0.95)_75%)] md:h-[360px]">
      {/* Fallback painted chest stays visible until WebGL renders its first frame or on context loss */}
      <img
        src="/images/enigma/mystery-chest.jpg"
        alt="The sealed Nocturne chest"
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
          canvasReady ? 'pointer-events-none opacity-0' : 'opacity-100'
        }`}
      />
      <div ref={mountRef} className="absolute inset-0 h-full w-full" aria-hidden="true" />
    </div>
  )
}
