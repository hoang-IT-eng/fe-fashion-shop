import React, { useEffect, useRef, useState } from 'react'

interface MysteryVaultSceneProps {
  unsealed?: boolean
  tierSlug?: string
}

export default function MysteryVaultScene({
  unsealed = false,
  tierSlug = 'inner-circle-chest',
}: MysteryVaultSceneProps) {
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
      .then((THREE) => {
        if (disposed || !mountRef.current) return
        try {
          const width = container.clientWidth || 440
          const height = container.clientHeight || 360

          const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
          renderer.setSize(width, height)
          renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5))
          container.innerHTML = ''
          container.appendChild(renderer.domElement)

          const scene = new THREE.Scene()
          const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 50)
          camera.position.set(0, 1.4, 5.2)
          camera.lookAt(0, 0.1, 0)

          const ambient = new THREE.AmbientLight(0xf9f9f9, 0.45)
          scene.add(ambient)

          const spot = new THREE.DirectionalLight(0xf9f9f9, 1.8)
          spot.position.set(3, 5, 4)
          scene.add(spot)

          const innerGlow = new THREE.PointLight(0xf9f9f9, 1.2, 6)
          innerGlow.position.set(0, 0.35, 0)
          scene.add(innerGlow)

          const chestGroup = new THREE.Group()
          scene.add(chestGroup)

          const accentHex =
            tierSlug === 'grail-vault'
              ? 0xf9f9f9
              : tierSlug === 'inner-circle-chest'
                ? 0xf9f9f9
                : 0x9a948a

          const bodyMat = new THREE.MeshStandardMaterial({
            color: 0x101116,
            metalness: 0.85,
            roughness: 0.26,
          })
          const trimMat = new THREE.MeshStandardMaterial({
            color: accentHex,
            metalness: 0.92,
            roughness: 0.2,
          })

          // Base chest body
          const baseGeo = new THREE.BoxGeometry(2.3, 1.15, 1.55)
          const baseMesh = new THREE.Mesh(baseGeo, bodyMat)
          baseMesh.position.y = -0.35
          chestGroup.add(baseMesh)

          // Seam band
          const bandGeo = new THREE.BoxGeometry(2.36, 0.08, 1.61)
          const bandMesh = new THREE.Mesh(bandGeo, trimMat)
          bandMesh.position.y = 0.22
          chestGroup.add(bandMesh)

          // Hinged vault lid
          const lidPivot = new THREE.Group()
          lidPivot.position.set(0, 0.24, -0.77)
          chestGroup.add(lidPivot)

          const lidGeo = new THREE.BoxGeometry(2.32, 0.42, 1.56)
          const lidMesh = new THREE.Mesh(lidGeo, bodyMat)
          lidMesh.position.set(0, 0.21, 0.77)
          lidPivot.add(lidMesh)

          const sealGeo = new THREE.OctahedronGeometry(0.24, 0)
          const sealMesh = new THREE.Mesh(sealGeo, trimMat)
          sealMesh.position.set(0, 0.22, 0.82)
          chestGroup.add(sealMesh)

          let pointerX = 0
          const onMove = (e: PointerEvent) => {
            pointerX = (e.clientX / window.innerWidth - 0.5) * 0.9
          }
          window.addEventListener('pointermove', onMove, { passive: true })

          const animate = () => {
            if (disposed) return
            chestGroup.rotation.y += 0.005 + (pointerX * 0.4 - chestGroup.rotation.y) * 0.03
            const targetLidAngle = unsealedRef.current ? -0.92 : 0
            lidPivot.rotation.x += (targetLidAngle - lidPivot.rotation.x) * 0.07
            innerGlow.intensity += ((unsealedRef.current ? 4.2 : 0.9) - innerGlow.intensity) * 0.08
            sealMesh.rotation.y += 0.02
            sealMesh.position.y = unsealedRef.current ? 0.72 : 0.22
            renderer.render(scene, camera)
            frameId = window.requestAnimationFrame(animate)
          }
          animate()

          cleanupFn = () => {
            window.removeEventListener('pointermove', onMove)
            window.cancelAnimationFrame(frameId)
            baseGeo.dispose()
            bandGeo.dispose()
            lidGeo.dispose()
            sealGeo.dispose()
            bodyMat.dispose()
            trimMat.dispose()
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
  }, [tierSlug])

  return (
    <div className="relative w-full h-[300px] md:h-[360px] flex items-center justify-center">
      <div ref={mountRef} className="w-full h-full" aria-hidden="true" />
      {!webglReady && (
        <img
          src="/images/enigma/mystery-chest.jpg"
          alt="NOCTURNE Anodized Mystery Vault Chest"
          className="w-full h-full object-cover rounded border border-bone/15"
        />
      )}
    </div>
  )
}
