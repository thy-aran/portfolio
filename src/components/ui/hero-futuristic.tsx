"use client";

import { Canvas, extend, useFrame, useThree } from "@react-three/fiber";
import { useAspect, useTexture } from "@react-three/drei";
import { useMemo, useRef, useState, useEffect, Suspense } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { Github, Linkedin } from "lucide-react";
import gsap from "gsap";
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

/** Paired color + depth maps required for parallax scan effect */
const TEXTUREMAP = { src: "https://i.postimg.cc/XYwvXN8D/img-4.png" };
const DEPTHMAP = { src: "https://i.postimg.cc/2SHKQh2q/raw-4.webp" };

/** Shared with 3D post-process: sin(t * 0.5) * 0.5 + 0.5 */
export const SCAN_SPEED = 0.5;

extend(THREE as never);

function getScanProgress(elapsed: number) {
  return Math.sin(elapsed * SCAN_SPEED) * 0.5 + 0.5;
}

/** Pushes scan progress to CSS so hero typography stays locked to the 3D beam */
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

const PostProcessing = ({
  strength = 1,
  threshold = 1,
  fullScreenEffect = true,
}: PostProcessingProps) => {
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
      fullScreenEffect ? smoothstep(0.9, 1.0, oneMinus(scanLine)) : 1.0
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
};

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

const Scene = () => {
  const [rawMap, depthMap] = useTexture([TEXTUREMAP.src, DEPTHMAP.src]);
  const meshRef = useRef<Mesh>(null);
  const [visible, setVisible] = useState(false);
  const scaleFactor = useResponsiveScale();

  useEffect(() => {
    if (rawMap && depthMap) setVisible(true);
  }, [rawMap, depthMap]);

  const { material, uniforms } = useMemo(() => {
    const uPointer = uniform(new THREE.Vector2(0));
    const uProgress = uniform(0);
    const strength = 0.01;
    const tDepthMap = texture(depthMap);

    const tMap = texture(
      rawMap,
      uv().add(tDepthMap.r.mul(uPointer).mul(strength))
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
};

function ScanText({
  children,
  className = "",
  as: Tag = "span",
  style,
}: {
  children: React.ReactNode;
  className?: string;
  as?: "span" | "p" | "div" | "h1";
  style?: React.CSSProperties;
}) {
  return (
    <Tag className={`hero-scan-text ${className}`} style={style}>
      <span className="hero-scan-text__base">{children}</span>
      <span className="hero-scan-text__glow" aria-hidden>
        {children}
      </span>
    </Tag>
  );
}

/** Word-by-word reveal shared by the name and the role so both keep identical effects */
function ScanTitle({
  words,
  visibleWords,
  delays,
}: {
  words: string[];
  visibleWords: number;
  delays: number[];
}) {
  return (
    <>
      {words.map((word, index) => (
        <span
          key={`${word}-${index}`}
          className={index < visibleWords ? "fade-in" : "opacity-0"}
          style={{ animationDelay: `${index * 0.13 + (delays[index] || 0)}s` }}
        >
          <ScanText
            className={
              index === words.length - 1
                ? "hero-scan-text--metallic"
                : "hero-scan-text--white"
            }
          >
            {word}
          </ScanText>
        </span>
      ))}
    </>
  );
}

export type HeroFuturisticProps = {
  title?: string;
  role?: string;
  subtitle?: string;
  onExplore?: () => void;
  /** Mount WebGPU only after the loading overlay is gone so the canvas gets real size */
  active?: boolean;
};

export function HeroFuturistic({
  title = "ARAN ADNAN",
  role = "Web Developer",
  active = true,
}: Pick<HeroFuturisticProps, "title" | "role" | "active">) {
  const titleWords = title.split(" ");
  const roleWords = role.split(" ");
  const [visibleWords, setVisibleWords] = useState(0);
  const [visibleRoleWords, setVisibleRoleWords] = useState(0);
  const [subtitleVisible, setSubtitleVisible] = useState(false);
  const [delays, setDelays] = useState<number[]>([]);
  const [roleDelays, setRoleDelays] = useState<number[]>([]);
  const resumeButtonRef = useRef<HTMLAnchorElement>(null);

  const handleResumePointerMove = (
    event: ReactPointerEvent<HTMLAnchorElement>
  ) => {
    const button = event.currentTarget;
    const rect = button.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const progress = gsap.utils.clamp(0, 1, x / rect.width);

    gsap.to(button, {
      "--pointer-x": `${x}px`,
      "--pointer-y": `${y}px`,
      duration: 0.6,
      ease: "power2.out",
      overwrite: "auto",
    });
    gsap.to(button, {
      "--button-glow": gsap.utils.interpolate("#c1121f", "#e8e8e8", progress),
      duration: 0.2,
      overwrite: "auto",
    });
  };

  useEffect(() => {
    setDelays(titleWords.map(() => Math.random() * 0.07));
  }, [titleWords.length]);

  useEffect(() => {
    setRoleDelays(roleWords.map(() => Math.random() * 0.07));
  }, [roleWords.length]);

  useEffect(() => {
    const button = resumeButtonRef.current;
    return () => {
      if (button) gsap.killTweensOf(button);
    };
  }, []);

  // Reveal chain: name words -> role words -> CTA cluster
  useEffect(() => {
    if (visibleWords < titleWords.length) {
      const timeout = setTimeout(() => setVisibleWords((v) => v + 1), 600);
      return () => clearTimeout(timeout);
    }
    if (visibleRoleWords < roleWords.length) {
      const timeout = setTimeout(() => setVisibleRoleWords((v) => v + 1), 400);
      return () => clearTimeout(timeout);
    }
    const timeout = setTimeout(() => setSubtitleVisible(true), 500);
    return () => clearTimeout(timeout);
  }, [visibleWords, titleWords.length, visibleRoleWords, roleWords.length]);

  return (
    <div className="hero-stage relative h-svh min-h-[100dvh] w-full overflow-hidden">
      {/* Stable depth plate for the 3D scene — fades out so the page still pans seamlessly */}
      <div className="hero-stage__plate" aria-hidden />

      {/* Background atmosphere — behind everything */}
      <div className="ambient-orb w-[520px] h-[520px] bg-blood-mid/20 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse-glow z-[1]" />
      <div className="ambient-orb w-[380px] h-[380px] bg-blood-glow/12 top-[40%] left-[55%] z-[1]" />
      <div
        className="absolute inset-0 opacity-15 z-[1] pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(rgba(192, 192, 192, 0.08) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      {/* 3D object — behind typography */}
      {active ? (
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
          dpr={[1, 1.75]}
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
            <Scene />
          </Suspense>
        </Canvas>
      ) : null}

      {/* Slight black scrim so typography reads as sitting on top of the 3D object */}
      <div className="hero-stage__scrim" aria-hidden />

      {/* Moving scan beam indicator (soft bloom bar) */}
      <div className="hero-scan-beam pointer-events-none z-[15]" aria-hidden />

      {/* Name top-left, role bottom-right — centered stack on phones */}
      <div className="hero-copy">
        <h1 className="hero-name font-display text-4xl sm:text-5xl xl:text-6xl font-extrabold uppercase tracking-tight leading-[0.95]">
          <span className="flex flex-col items-center sm:items-start gap-y-1 md:gap-y-2">
            <ScanTitle
              words={titleWords}
              visibleWords={visibleWords}
              delays={delays}
            />
          </span>
        </h1>

        <span className="hero-copy__rule" aria-hidden />

        <p className="hero-role font-display text-4xl sm:text-5xl xl:text-6xl font-extrabold uppercase tracking-tight leading-[0.95]">
          <span className="flex flex-col items-center sm:items-end gap-y-1 md:gap-y-2">
            <ScanTitle
              words={roleWords}
              visibleWords={visibleRoleWords}
              delays={roleDelays}
            />
          </span>
        </p>
      </div>

      {/* Primary links — bottom-left */}
      <div
        className={`hero-hud z-20 ${
          subtitleVisible ? "fade-in-subtitle" : "opacity-0"
        }`}
      >
        <div className="hero-actions" aria-label="Profile links">
          <a
            ref={resumeButtonRef}
            className="glow-button"
            href="/assets/docs/resume.pdf"
            target="_blank"
            rel="noopener noreferrer"
            onPointerMove={handleResumePointerMove}
          >
            <span>View My Resume</span>
            <div className="gradient" aria-hidden />
          </a>
          <a
            className="hero-social-link"
            href="https://github.com/thy-aran"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="View Aran's GitHub profile"
          >
            <Github aria-hidden />
          </a>
          <a
            className="hero-social-link"
            href="https://www.linkedin.com/in/aran-adnan-v711/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="View Aran's LinkedIn profile"
          >
            <Linkedin aria-hidden />
          </a>
        </div>
      </div>

      <div
        className="absolute bottom-0 left-0 right-0 h-36 z-10 pointer-events-none"
        style={{
          background:
            "linear-gradient(to top, rgba(5,5,5,0.28) 0%, rgba(5,5,5,0.08) 45%, transparent 100%)",
        }}
      />
    </div>
  );
}
