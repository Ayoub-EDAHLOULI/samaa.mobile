import React, { useRef, useMemo, useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { Canvas, useFrame } from "@react-three/fiber/native";
import * as THREE from "three";

interface ParticleSphereProps {
  isAnimating: boolean;
  intensity?: number;
}

function ParticleBlob({ isAnimating, intensity = 1 }: ParticleSphereProps) {
  const meshRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const { geometry } = useMemo(() => {
    const particleCount = 5000; // Increased density for a solid look
    const positions = new Float32Array(particleCount * 3);
    const originalPos = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);

    // Deepened the colors to match the screenshot
    const color1 = new THREE.Color("#1ABCFE"); // Bright cyan-blue
    const color2 = new THREE.Color("#0A2A88"); // Deep void blue

    for (let i = 0; i < particleCount; i++) {
      const phi = Math.acos(-1 + (2 * i) / particleCount);
      const theta = Math.sqrt(particleCount * Math.PI) * phi;

      // Made the radius smaller (1.1) and the shell tighter (0.1)
      const r = 1.1 + Math.random() * Math.random() * 0.1;
      const x = r * Math.cos(theta) * Math.sin(phi);
      const y = r * Math.sin(theta) * Math.sin(phi);
      const z = r * Math.cos(phi);

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      originalPos[i * 3] = x;
      originalPos[i * 3 + 1] = y;
      originalPos[i * 3 + 2] = z;

      const mixRatio = Math.random();
      const color = color1.clone().lerp(color2, mixRatio);
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;

      // Varied sizes slightly for depth
      sizes[i] = Math.random() * 1.5 + 0.5;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    geo.setAttribute("size", new THREE.BufferAttribute(sizes, 1));
    geo.setAttribute(
      "originalPosition",
      new THREE.BufferAttribute(originalPos, 3),
    );

    return { geometry: geo };
  }, []);

  const shaderMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uIntensity: { value: intensity },
        uIsAnimating: { value: isAnimating ? 1.0 : 0.0 },
      },
      vertexShader: `
        uniform float uTime;
        uniform float uIntensity;
        uniform float uIsAnimating;
        attribute vec3 originalPosition;
        attribute float size;
        attribute vec3 color;
        varying vec3 vColor;
        varying float vAlpha;
        
        vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
        vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
        
        float snoise(vec3 v) {
          const vec2 C = vec2(1.0/6.0, 1.0/3.0);
          const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
          vec3 i = floor(v + dot(v, C.yyy));
          vec3 x0 = v - i + dot(i, C.xxx);
          vec3 g = step(x0.yzx, x0.xyz);
          vec3 l = 1.0 - g;
          vec3 i1 = min(g.xyz, l.zxy);
          vec3 i2 = max(g.xyz, l.zxy);
          vec3 x1 = x0 - i1 + C.xxx;
          vec3 x2 = x0 - i2 + C.yyy;
          vec3 x3 = x0 - D.yyy;
          i = mod289(i);
          vec4 p = permute(permute(permute(i.z + vec4(0.0, i1.z, i2.z, 1.0)) + i.y + vec4(0.0, i1.y, i2.y, 1.0)) + i.x + vec4(0.0, i1.x, i2.x, 1.0));
          float n_ = 0.142857142857;
          vec3 ns = n_ * D.wyz - D.xzx;
          vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
          vec4 x_ = floor(j * ns.z);
          vec4 y_ = floor(j - 7.0 * x_);
          vec4 x = x_ *ns.x + ns.yyyy;
          vec4 y = y_ *ns.x + ns.yyyy;
          vec4 h = 1.0 - abs(x) - abs(y);
          vec4 b0 = vec4(x.xy, y.xy);
          vec4 b1 = vec4(x.zw, y.zw);
          vec4 s0 = floor(b0)*2.0 + 1.0;
          vec4 s1 = floor(b1)*2.0 + 1.0;
          vec4 sh = -step(h, vec4(0.0));
          vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
          vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
          vec3 p0 = vec3(a0.xy, h.x);
          vec3 p1 = vec3(a0.zw, h.y);
          vec3 p2 = vec3(a1.xy, h.z);
          vec3 p3 = vec3(a1.zw, h.w);
          vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
          p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
          vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
          m = m * m;
          return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
        }
        
        void main() {
          vColor = color;
          vec3 pos = originalPosition;
          
          // ALWAYS have a gentle wave (0.15), but get wild when animating (0.5)
          float waveIntensity = mix(0.15, 0.5, uIsAnimating) * uIntensity;
          float timeSpeed = mix(0.1, 0.35, uIsAnimating);
          
          float noise1 = snoise(pos * 1.5 + uTime * timeSpeed);
          float noise2 = snoise(pos * 2.0 - uTime * (timeSpeed * 0.8));
          float noise3 = snoise(pos * 0.8 + uTime * (timeSpeed * 0.6));
          
          vec3 displacement = vec3(noise1, noise2, noise3) * waveIntensity;
          pos += displacement;
          
          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          gl_Position = projectionMatrix * mvPosition;
          float dist = length(mvPosition.xyz);
          gl_PointSize = size * (300.0 / dist);
          vAlpha = 1.0 - smoothstep(2.0, 6.0, dist);
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        varying float vAlpha;
        void main() {
          vec2 center = gl_PointCoord - vec2(0.5);
          float dist = length(center);
          if (dist > 0.5) discard;
          float glow = 1.0 - smoothstep(0.0, 0.5, dist);
          glow = pow(glow, 1.5);
          float core = 1.0 - smoothstep(0.0, 0.15, dist);
          vec3 finalColor = vColor * (glow * 0.8 + core * 0.5);
          float finalAlpha = (glow * 0.7 + core * 0.3) * vAlpha;
          gl_FragColor = vec4(finalColor, finalAlpha);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
  }, [intensity, isAnimating]);

  useEffect(() => {
    if (materialRef.current) {
      // Smoothly transition the uniform value for the shader
      materialRef.current.uniforms.uIsAnimating.value = isAnimating ? 1.0 : 0.0;
    }
  }, [isAnimating]);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.08;
      meshRef.current.rotation.z = state.clock.elapsedTime * 0.03;

      // Base scale smaller (0.85), grows to 1.15 when recording
      const targetScale = isAnimating ? 1.15 : 0.85;
      meshRef.current.scale.lerp(
        new THREE.Vector3(targetScale, targetScale, targetScale),
        0.06,
      );
    }
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  return <points ref={meshRef} geometry={geometry} material={shaderMaterial} />;
}

export default function ParticleSphere({
  isAnimating = false,
  intensity = 1,
}: ParticleSphereProps) {
  return (
    // Moved the camera back from 5 to 6 to make the sphere naturally smaller on screen
    <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
      <Canvas camera={{ position: [0, 0, 6], fov: 50 }} gl={{ alpha: true }}>
        <ambientLight intensity={0.5} />
        <ParticleBlob isAnimating={isAnimating} intensity={intensity} />
      </Canvas>
    </View>
  );
}
