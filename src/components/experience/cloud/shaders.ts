/* GLSL for the NOCTURNE cloud world. Hand-written; no external shader code. */

const NOISE = /* glsl */ `
float hash(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float noise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}
float fbm(vec2 p){
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 4; i++) { v += a * noise(p); p = p * 2.03 + 17.1; a *= 0.5; }
  return v;
}
`

/** Full-screen quad in clip space (sky + veil). */
export const FULL_VERT = /* glsl */ `
varying vec2 vUv;
void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
`

/** Painted night sky: umber-to-ink gradient, ember glow, slow haze, canvas weave. */
export const SKY_FRAG = /* glsl */ `
precision highp float;
uniform vec2 uRes; uniform vec2 uLightPos; uniform float uLightAmt; uniform float uTime;
uniform vec3 uEmber; uniform float uDepth;
varying vec2 vUv;
${NOISE}
void main(){
  vec2 asp = vec2(uRes.x / uRes.y, 1.0);
  vec2 p = vUv;
  vec3 top = vec3(0.018, 0.015, 0.013);
  vec3 bot = mix(vec3(0.075, 0.045, 0.032), vec3(0.11, 0.06, 0.035), uDepth);
  vec3 col = mix(bot, top, smoothstep(0.0, 1.0, p.y));
  vec2 dl = (p - uLightPos) * asp;
  float d2 = dot(dl, dl);
  col += uEmber * (exp(-d2 * 7.0) * 0.42 + exp(-sqrt(d2) * 2.6) * 0.12) * uLightAmt;
  float h = fbm(p * asp * 2.2 + vec2(uTime * 0.008, uTime * 0.003));
  col += vec3(0.05, 0.035, 0.025) * (h - 0.35) * (0.5 + 0.5 * uLightAmt);
  float weave = sin(gl_FragCoord.x * 1.9) * sin(gl_FragCoord.y * 1.9);
  col *= 0.975 + 0.025 * weave;
  gl_FragColor = vec4(max(col, 0.0), 1.0);
}
`

/**
 * Screen-aligned billboard: the quad is expanded in view space so a cloud
 * always faces the camera without CPU work. vFade dissolves clouds as the
 * camera flies through them (no near-plane popping) and into the far fog.
 */
export const CLOUD_VERT = /* glsl */ `
uniform vec2 uSize; uniform float uNear; uniform float uFar;
varying vec2 vUv; varying float vFade; varying vec2 vScreen;
void main(){
  vUv = uv;
  vec4 mv = modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0);
  float d = -mv.z;
  mv.xy += position.xy * uSize;
  vec4 clip = projectionMatrix * mv;
  gl_Position = clip;
  vScreen = clip.xy / clip.w * 0.5 + 0.5;
  vFade = smoothstep(uNear, uNear + 3.0, d) * (1.0 - smoothstep(uFar * 0.55, uFar, d));
}
`

export const CLOUD_FRAG = /* glsl */ `
precision highp float;
uniform sampler2D uAtlas; uniform vec2 uCell; uniform float uSeed; uniform float uFlip;
uniform float uTime; uniform vec2 uRes; uniform float uAlpha;
uniform vec2 uMouse; uniform float uMouseAmt; uniform vec3 uClick;
uniform vec2 uLightPos; uniform float uLightAmt; uniform vec3 uEmber;
uniform vec3 uShield; uniform float uBright;
varying vec2 vUv; varying float vFade; varying vec2 vScreen;
${NOISE}
void main(){
  if (vFade < 0.003) discard;
  vec2 uv = vUv;
  if (uFlip > 0.5) uv.x = 1.0 - uv.x;
  vec2 asp = vec2(uRes.x / uRes.y, 1.0);
  float t = uTime * 0.035;

  // living domain warp — the paint slowly breathes
  vec2 w = vec2(fbm(uv * 2.6 + uSeed + t), fbm(uv * 2.6 + uSeed * 1.7 - t + 9.2)) - 0.5;

  // cursor parts the clouds; click sends a shock ring through them
  vec2 dm = (vScreen - uMouse) * asp;
  float part = uMouseAmt * smoothstep(0.30, 0.0, length(dm));
  vec2 dc = (vScreen - uClick.xy) * asp;
  float cd = length(dc);
  float ring = uClick.z > 0.0 ? exp(-pow((cd - uClick.z * 0.85) * 6.0, 2.0)) * exp(-uClick.z * 1.4) : 0.0;
  vec2 push = normalize(dm + 1e-5) * part * 0.10 + normalize(dc + 1e-5) * ring * 0.07;

  vec2 suv = clamp(uv + w * 0.07 - push, 0.004, 0.996);
  vec4 tex = texture2D(uAtlas, uCell + suv * 0.5);
  float n = fbm(uv * 5.5 + uSeed * 3.1 + t * 0.6);
  float a = pow(tex.a, 0.62);
  a = clamp(a * (0.78 + 0.5 * n) - part * 0.55 - ring * 0.3, 0.0, 1.0);

  // grade the paint into the NOCTURNE ramp: ink -> umber -> bone
  vec3 col = tex.rgb;
  float l = dot(col, vec3(0.299, 0.587, 0.114));
  vec3 ramp = mix(vec3(0.045, 0.032, 0.026), vec3(0.27, 0.16, 0.10), smoothstep(0.0, 0.38, l));
  ramp = mix(ramp, vec3(0.74, 0.66, 0.56), smoothstep(0.5, 1.0, l));
  col = mix(col * vec3(0.92, 0.86, 0.80), ramp, 0.55);

  // the single ember light: lifts and warms clouds near it, glows through thin edges
  vec2 dl = (vScreen - uLightPos) * asp;
  float lp = exp(-dot(dl, dl) * 2.8) * uLightAmt;
  col *= 0.42 + 0.75 * lp + 0.18 * uLightAmt;
  col += uEmber * lp * (1.0 - a) * a * 1.6;
  col += uEmber * (part * 0.22 + ring * 0.9);

  // brush direction grain
  float g = noise(vec2(uv.x * 85.0, uv.y * 20.0) + uSeed * 13.0);
  col *= (0.92 + 0.14 * g) * uBright;

  // headline shield: clouds behind the title are dimmed for legibility
  vec2 ds = (vScreen - uShield.xy) / vec2(0.42, 0.22);
  col *= 1.0 - uShield.z * 0.62 * smoothstep(1.0, 0.25, length(ds));

  gl_FragColor = vec4(col, a * uAlpha * vFade);
}
`

/**
 * Overlay veil: a full-screen painted cloud mass that rolls in (cover → 1)
 * and parts from the centre outward (cover → 0), with an ember rim on the
 * parting edge. Rendered over a transparent canvas, so parting reveals the
 * real page underneath.
 */
export const VEIL_FRAG = /* glsl */ `
precision highp float;
uniform vec2 uRes; uniform float uTime; uniform float uCover; uniform vec3 uEmber;
uniform vec2 uMouse; uniform float uMouseAmt; uniform sampler2D uAtlas;
varying vec2 vUv;
${NOISE}
void main(){
  vec2 asp = vec2(uRes.x / uRes.y, 1.0);
  vec2 q = (vUv - 0.5) * asp;
  float t = uTime;
  float n1 = fbm(q * 1.9 + vec2(0.0, t * 0.05));
  float n2 = fbm(q * 4.6 + n1 * 2.2 - t * 0.03);
  float field = n1 * 0.62 + n2 * 0.38;
  float r = length(q);
  float part = uMouseAmt * smoothstep(0.35, 0.0, length((vUv - uMouse) * asp));
  float f = field + r * 0.42 - part * 0.18;
  float th = mix(1.32, -0.25, uCover);
  float m = smoothstep(th - 0.09, th + 0.05, f);

  // painted body: umber shadows, bone crests, ember warmth low in the frame
  vec3 col = mix(vec3(0.05, 0.036, 0.029), vec3(0.24, 0.145, 0.095), smoothstep(0.3, 0.62, n2));
  col = mix(col, vec3(0.80, 0.74, 0.66), smoothstep(0.62, 0.85, n2) * 0.55);
  vec2 lp = (vUv - vec2(0.5, 0.18)) * asp;
  col += uEmber * exp(-dot(lp, lp) * 2.2) * 0.32;
  // painterly detail borrowed from the painted cloud atlas
  vec4 paint = texture2D(uAtlas, vec2(0.5, 0.5) + fract(vUv * vec2(0.9, 0.7) + n1 * 0.15) * 0.5);
  col = mix(col, col * 0.6 + paint.rgb * 0.55, paint.a * 0.35);
  // ember rim on the parting edge
  float rim = smoothstep(0.08, 0.0, abs(f - th)) * (1.0 - smoothstep(0.92, 1.0, uCover));
  col += uEmber * rim * 0.75;
  float g = noise(gl_FragCoord.xy * vec2(0.35, 1.2));
  col *= 0.94 + 0.1 * g;
  gl_FragColor = vec4(col, m);
}
`
