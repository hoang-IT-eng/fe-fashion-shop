import React, { useEffect, useRef, useState } from 'react'

export default function HeroMonolithScene() {
  const mountRef = useRef<HTMLDivElement | null>(null)
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

    void import('three')
      .then((THREE) => {
        if (disposed || !mountRef.current) return
        try {
          const width = container.clientWidth || 640
          const height = container.clientHeight || 520

          const renderer = new THREE.WebGLRenderer({
            alpha: true,
            antialias: true,
            powerPreference: 'high-performance',
          })
          renderer.setSize(width, height)
          renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
          container.innerHTML = ''
          container.appendChild(renderer.domElement)

          const scene = new THREE.Scene()
          scene.fog = new THREE.FogExp2(0x0a0a0a, 0.14)

          const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100)
          camera.position.set(0, 0.2, 6.2)

          // Studio chiaroscuro lighting (warm bone key + antique gold rim)
          const ambient = new THREE.AmbientLight(0xf9f9f9, 0.35)
          scene.add(ambient)

          const keyLight = new THREE.DirectionalLight(0xf9f9f9, 1.9)
          keyLight.position.set(3.5, 4.5, 4)
          scene.add(keyLight)

          const goldRim = new THREE.PointLight(0xf9f9f9, 2.8, 14)
          goldRim.position.set(-3.2, -1.6, 2.5)
          scene.add(goldRim)

          // Central Monolith Group
          const monolithGroup = new THREE.Group()
          scene.add(monolithGroup)

          const obsidianMat = new THREE.MeshStandardMaterial({
            color: 0x0d0e13,
            metalness: 0.88,
            roughness: 0.22,
          })
          const goldWireMat = new THREE.MeshStandardMaterial({
            color: 0xf9f9f9,
            metalness: 0.95,
            roughness: 0.18,
            wireframe: true,
          })

          // Octagonal sculpted obelisk
          const coreGeo = new THREE.OctahedronGeometry(1.45, 0)
          coreGeo.scale(0.78, 1.48, 0.78)
          const coreMesh = new THREE.Mesh(coreGeo, obsidianMat)
          monolithGroup.add(coreMesh)

          const cageGeo = new THREE.OctahedronGeometry(1.62, 0)
          cageGeo.scale(0.84, 1.56, 0.84)
          const cageMesh = new THREE.Mesh(cageGeo, goldWireMat)
          monolithGroup.add(cageMesh)

          // Orbiting precision brass halo ring
          const torusGeo = new THREE.TorusGeometry(2.25, 0.016, 16, 120)
          const haloMat = new THREE.MeshBasicMaterial({
            color: 0xf9f9f9,
            transparent: true,
            opacity: 0.55,
          })
          const haloRing = new THREE.Mesh(torusGeo, haloMat)
          haloRing.rotation.x = Math.PI * 0.38
          haloRing.rotation.y = Math.PI * 0.12
          scene.add(haloRing)

          // Volumetric cloud dust ring
          const particleCount = 420
          const positions = new Float32Array(particleCount * 3)
          for (let i = 0; i < particleCount; i++) {
            const angle = (i / particleCount) * Math.PI * 2 + Math.random() * 0.4
            const radius = 2.0 + Math.random() * 2.4
            positions[i * 3] = Math.cos(angle) * radius
            positions[i * 3 + 1] = (Math.random() - 0.5) * 1.6
            positions[i * 3 + 2] = Math.sin(angle) * radius
          }
          const cloudGeo = new THREE.BufferGeometry()
          cloudGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
          const cloudMat = new THREE.PointsMaterial({
            color: 0xf9f9f9,
            size: 0.032,
            transparent: true,
            opacity: 0.38,
          })
          const cloudRing = new THREE.Points(cloudGeo, cloudMat)
          scene.add(cloudRing)

          let targetX = 0
          let targetY = 0
          const onPointerMove = (e: PointerEvent) => {
            targetX = (e.clientX / window.innerWidth - 0.5) * 0.7
            targetY = (e.clientY / window.innerHeight - 0.5) * 0.45
          }
          window.addEventListener('pointermove', onPointerMove, { passive: true })

          const onResize = () => {
            if (!mountRef.current) return
            const w = mountRef.current.clientWidth || 640
            const h = mountRef.current.clientHeight || 520
            camera.aspect = w / h
            camera.updateProjectionMatrix()
            renderer.setSize(w, h)
          }
          window.addEventListener('resize', onResize)

          const animate = () => {
            if (disposed) return
            monolithGroup.rotation.y += 0.0045
            monolithGroup.rotation.x += (targetY * 0.45 - monolithGroup.rotation.x) * 0.05
            monolithGroup.position.x += (targetX * 0.55 - monolithGroup.position.x) * 0.05
            haloRing.rotation.z -= 0.0025
            cloudRing.rotation.y += 0.0014
            renderer.render(scene, camera)
            frameId = window.requestAnimationFrame(animate)
          }
          animate()

          cleanupFn = () => {
            window.removeEventListener('pointermove', onPointerMove)
            window.removeEventListener('resize', onResize)
            window.cancelAnimationFrame(frameId)
            coreGeo.dispose()
            cageGeo.dispose()
            torusGeo.dispose()
            cloudGeo.dispose()
            obsidianMat.dispose()
            goldWireMat.dispose()
            haloMat.dispose()
            cloudMat.dispose()
            renderer.dispose()
          }
        } catch {
          setWebglReady(false)
        }
      })
      .catch(() => setWebglReady(false))

    return () => {
      disposed = true
      window.cancelAnimationFrame(frameId)
      if (cleanupFn) cleanupFn()
    }
  }, [])

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <div
        ref={mountRef}
        className="w-full h-full min-h-[340px] flex items-center justify-center"
        aria-hidden="true"
      />
      {!webglReady && (
        <div
          aria-hidden="true"
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
        >
          <div className="relative w-64 h-64 md:w-80 md:h-80 rounded-full border border-[#f9f9f9]/35 flex items-center justify-center bg-[#111111]/70">
            <div className="w-44 h-44 rotate-45 border border-[#f9f9f9]/25 bg-[#0a0a0a] flex items-center justify-center shadow-2xl">
              <div className="w-20 h-20 border border-[#f9f9f9]/70" />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
