"use client";

import { Canvas, extend, useFrame, useThree } from "@react-three/fiber";
import { useAspect, useTexture } from "@react-three/drei";
import { useMemo, useRef, useState, useEffect, Suspense } from "react";
import * as THREE from "three/webgpu";
import { bloom } from "three/examples/jsm/tsl/display/BloomNode.js";
import { Mesh } from "three";
import {
  abs,
  blendScreen,
  float,
  mod,
  mx_cell_noise_float,
  oneMinus,
  smoothstep,
  texture,
  uniform,
  uv,
  vec2,
  vec3,
  pass,
  mix,
  add,
} from "three/tsl";
import { SCAN_SPEED } from "@/components/ui/hero-scan";

const TEXTUREMAP = { src: "https://i.postimg.cc/XYwvXN8D/img-4.png" };
const DEPTHMAP = { src: "https://i.postimg.cc/2SHKQh2q/raw-4.webp" };

extend(THREE as never);

function getScanProgress(elapsed: number) {
  return Math.sin(elapsed * SCAN_SPEED) * 0.5 + 0.5;
}

function ScanProgressSync() {
  useFrame(({ clock }) => {
    const v = getScanProgress(clock.getElapsedTime());
    document.documentElement.style.setProperty("--hero-scan", v.toFixed(4));
  });
  return null;
}

type PostProcessingProps = {
  strength?: number;
  threshold?: number;
  fullScreenEffect?: boolean;
};

function PostProcessing({
  strength = 1,
  threshold = 1,
  fullScreenEffect = true,
}: PostProcessingProps) {
  const { gl, scene, camera } = useThree();
  const progressRef = useRef({ value: 0 });

  const render = useMemo(() => {
    gl.setClearColor(0x000000, 0);
    scene.background = null;

    const postProcessing = new THREE.PostProcessing(gl as never);
    const scenePass = pass(scene, camera);
    const scenePassColor = scenePass.getTextureNode("output");
    const bloomPass = bloom(scenePassColor, strength, 0.5, threshold);

    const uScanProgress = uniform(0);
    progressRef.current = uScanProgress;

    const scanPos = float(uScanProgress.value);
    const uvY = uv().y;
    const scanWidth = float(0.05);
    const scanLine = smoothstep(0, scanWidth, abs(uvY.sub(scanPos)));
    const redOverlay = vec3(0.757, 0.071, 0.122).mul(oneMinus(scanLine)).mul(0.45);

    const withScanEffect = mix(
      scenePassColor,
      add(scenePassColor, redOverlay),
      fullScreenEffect ? smoothstep(0.9, 1.0, oneMinus(scanLine)) : 1.0,
    );

    const final = withScanEffect.add(bloomPass);
    postProcessing.outputNode = final;

    return postProcessing;
  }, [camera, gl, scene, strength, threshold, fullScreenEffect]);

  useFrame(({ clock }) => {
    progressRef.current.value = getScanProgress(clock.getElapsedTime());
    render.renderAsync();
  }, 1);

  return null;
}

const WIDTH = 300;
const HEIGHT = 300;

function useResponsiveScale() {
  const [scale, setScale] = useState(0.48);

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      if (w < 640) setScale(0.62);
      else if (w < 1024) setScale(0.52);
      else setScale(0.46);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return scale;
}

function Scene({ onReady }: { onReady?: () => void }) {
  const [rawMap, depthMap] = useTexture([TEXTUREMAP.src, DEPTHMAP.src]);
  const meshRef = useRef<Mesh>(null);
  const [visible, setVisible] = useState(false);
  const scaleFactor = useResponsiveScale();
  const readySent = useRef(false);

  useEffect(() => {
    if (!rawMap || !depthMap) return;
    setVisible(true);
    const timer = window.setTimeout(() => {
      if (readySent.current) return;
      readySent.current = true;
      onReady?.();
    }, 420);
    return () => window.clearTimeout(timer);
  }, [rawMap, depthMap, onReady]);

  const { material, uniforms } = useMemo(() => {
    const uPointer = uniform(new THREE.Vector2(0));
    const uProgress = uniform(0);
    const strength = 0.01;
    const tDepthMap = texture(depthMap);

    const tMap = texture(
      rawMap,
      uv().add(tDepthMap.r.mul(uPointer).mul(strength)),
    );

    const aspect = float(WIDTH).div(HEIGHT);
    const tUv = vec2(uv().x.mul(aspect), uv().y);
    const tiling = vec2(120.0);
    const tiledUv = mod(tUv.mul(tiling), 2.0).sub(1.0);
    const brightness = mx_cell_noise_float(tUv.mul(tiling).div(2));
    const dist = float(tiledUv.length());
    const dot = float(smoothstep(0.5, 0.49, dist)).mul(brightness);
    const depth = tDepthMap;
    const flow = oneMinus(smoothstep(0, 0.02, abs(depth.sub(uProgress))));
    const mask = dot.mul(flow).mul(vec3(8.5, 0.05, 0.08));
    const final = blendScreen(tMap, mask);

    const material = new THREE.MeshBasicNodeMaterial({
      colorNode: final,
      transparent: true,
      opacity: 0,
    });

    return {
      material,
      uniforms: { uPointer, uProgress },
    };
  }, [rawMap, depthMap]);

  const [w, h] = useAspect(WIDTH, HEIGHT);

  useFrame(({ clock }) => {
    uniforms.uProgress.value = getScanProgress(clock.getElapsedTime());
    if (meshRef.current?.material) {
      const mat = meshRef.current.material as THREE.MeshBasicNodeMaterial & {
        opacity: number;
      };
      if ("opacity" in mat) {
        mat.opacity = THREE.MathUtils.lerp(mat.opacity, visible ? 1 : 0, 0.07);
      }
    }
  });

  useFrame(({ pointer }) => {
    uniforms.uPointer.value = pointer;
  });

  return (
    <mesh
      ref={meshRef}
      scale={[w * scaleFactor, h * scaleFactor, 1]}
      material={material}
      position={[0, 0.02, 0]}
    >
      <planeGeometry />
    </mesh>
  );
}

function useHeroDpr(): [number, number] {
  const [dpr, setDpr] = useState<[number, number]>([1, 1.5]);

  useEffect(() => {
    const update = () => {
      const mobile = window.matchMedia("(max-width: 767px)").matches;
      const saveData =
        "connection" in navigator &&
        Boolean((navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData);
      // Cap pixel ratio on phones / data-saver — same look, less GPU memory
      setDpr(mobile || saveData ? [1, 1] : [1, 1.5]);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return dpr;
}

type HeroWebGPUCanvasProps = {
  onReady?: () => void;
};

export default function HeroWebGPUCanvas({ onReady }: HeroWebGPUCanvasProps) {
  const dpr = useHeroDpr();

  return (
    <Canvas
      key="hero-webgpu"
      className="hero-stage__canvas"
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        background: "transparent",
        zIndex: 5,
      }}
      flat
      dpr={dpr}
      onCreated={({ gl, scene, size }) => {
        scene.background = null;
        gl.setClearColor(0x000000, 0);
        gl.domElement.style.background = "transparent";
        if (size.width > 0 && size.height > 0) {
          gl.setSize(size.width, size.height, false);
        }
      }}
      gl={async (props) => {
        const renderer = new THREE.WebGPURenderer({
          ...(props as ConstructorParameters<typeof THREE.WebGPURenderer>[0]),
          alpha: true,
          antialias: true,
        });
        await renderer.init();
        renderer.setClearColor(0x000000, 0);
        return renderer;
      }}
    >
      <Suspense fallback={null}>
        <ScanProgressSync />
        <PostProcessing fullScreenEffect strength={0.85} threshold={0.85} />
        <Scene onReady={onReady} />
      </Suspense>
    </Canvas>
  );
}
