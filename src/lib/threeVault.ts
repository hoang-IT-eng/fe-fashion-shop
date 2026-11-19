// Named re-exports so the Mystery Vault scene's lazy chunk tree-shakes three
// (a namespace `import('three')` would pull the whole library into the shared chunk).
export {
  AmbientLight,
  BoxGeometry,
  DirectionalLight,
  Group,
  Mesh,
  MeshStandardMaterial,
  OctahedronGeometry,
  PerspectiveCamera,
  PointLight,
  Scene,
  WebGLRenderer,
} from 'three'
