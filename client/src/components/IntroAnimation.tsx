import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { FontLoader } from "three/addons/loaders/FontLoader.js";
import { TextGeometry } from "three/addons/geometries/TextGeometry.js";
import gsap from "gsap";

const AURA_COLORS = {
  primary: "#FF6B9D",
  mid: "#FFB6C9",
  soft: "#FFD6E7",
  light: "#FFF7FA",
  gold: "#D4A574",
  goldSoft: "#E8C9A8",
};

interface IntroAnimationProps {
  onComplete: () => void;
}

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

function easeInOutQuart(t: number) {
  return t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2;
}

function easeOutQuart(t: number) {
  return 1 - Math.pow(1 - t, 4);
}

export default function IntroAnimation({ onComplete }: IntroAnimationProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const taglineRef = useRef<HTMLParagraphElement>(null);
  const sweepRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const autoSkipRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const skip = () => {
    if (autoSkipRef.current) {
      clearTimeout(autoSkipRef.current);
      autoSkipRef.current = null;
    }
    timelineRef.current?.kill();
    gsap.to(containerRef.current, {
      opacity: 0,
      duration: 0.75,
      ease: "power2.inOut",
      onComplete,
    });
  };

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const isMobile = window.matchMedia("(max-width: 768px)").matches;
    const ambientCount = isMobile ? 42 : 78;
    const logoCount = isMobile ? 200 : 300;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      58,
      window.innerWidth / window.innerHeight,
      0.1,
      100,
    );
    camera.position.set(0, 0, 8.2);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: !isMobile,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.25 : 2));

    const ambientGeo = new THREE.BufferGeometry();
    const ambientPos = new Float32Array(ambientCount * 3);
    const ambientColors = new Float32Array(ambientCount * 3);
    const pinkAmbient = new THREE.Color(AURA_COLORS.soft);
    const goldAmbient = new THREE.Color(AURA_COLORS.goldSoft);
    for (let i = 0; i < ambientCount; i++) {
      const i3 = i * 3;
      ambientPos[i3] = (Math.random() - 0.5) * 5.5;
      ambientPos[i3 + 1] = (Math.random() - 0.5) * 3.8;
      ambientPos[i3 + 2] = (Math.random() - 0.5) * 3.2;
      const mix = Math.random();
      const c = new THREE.Color().lerpColors(pinkAmbient, goldAmbient, mix * 0.35);
      ambientColors[i3] = c.r;
      ambientColors[i3 + 1] = c.g;
      ambientColors[i3 + 2] = c.b;
    }
    ambientGeo.setAttribute("position", new THREE.BufferAttribute(ambientPos, 3));
    ambientGeo.setAttribute("color", new THREE.BufferAttribute(ambientColors, 3));

    const ambientMat = new THREE.PointsMaterial({
      size: isMobile ? 0.038 : 0.048,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      vertexColors: true,
      sizeAttenuation: true,
    });
    const ambientMesh = new THREE.Points(ambientGeo, ambientMat);
    scene.add(ambientMesh);

    let logoParticles: THREE.Points | null = null;
    let logoPositions: Float32Array | null = null;
    let logoGeo: THREE.BufferGeometry | null = null;
    let logoMat: THREE.PointsMaterial | null = null;
    let logoStartPositions: { x: number; y: number; z: number }[] = [];
    let targets: { x: number; y: number; z: number }[] = [];
    let collapsed: { x: number; y: number; z: number }[] = [];
    let exploded: { x: number; y: number; z: number }[] = [];

    const loader = new FontLoader();
    const fontUrl =
      "https://unpkg.com/three@0.160.0/examples/fonts/helvetiker_bold.typeface.json";

    loader.load(
      fontUrl,
      (font) => {
        const textGeo = new TextGeometry("AURA", {
          font,
          size: 1.75,
          depth: 0.1,
          curveSegments: 6,
          bevelEnabled: false,
        });
        textGeo.center();
        const positions = textGeo.attributes.position;
        const vertCount = positions.count;
        const sampleStep = Math.max(1, Math.floor(vertCount / logoCount));
        targets = [];
        for (let i = 0; i < vertCount; i += sampleStep) {
          if (targets.length >= logoCount) break;
          targets.push({
            x: positions.getX(i),
            y: positions.getY(i),
            z: positions.getZ(i),
          });
        }
        while (targets.length < logoCount) {
          const i = Math.floor(Math.random() * vertCount);
          targets.push({
            x: positions.getX(i),
            y: positions.getY(i),
            z: positions.getZ(i),
          });
        }

        logoGeo = new THREE.BufferGeometry();
        logoPositions = new Float32Array(logoCount * 3);
        const logoColors = new Float32Array(logoCount * 3);
        const cPink = new THREE.Color(AURA_COLORS.primary);
        const cGold = new THREE.Color(AURA_COLORS.gold);
        logoStartPositions = [];
        collapsed = [];
        exploded = [];

        for (let i = 0; i < logoCount; i++) {
          const i3 = i * 3;
          const sx = (Math.random() - 0.5) * 4.8;
          const sy = (Math.random() - 0.5) * 3.2;
          const sz = (Math.random() - 0.5) * 3.4;
          logoStartPositions.push({ x: sx, y: sy, z: sz });
          logoPositions[i3] = sx;
          logoPositions[i3 + 1] = sy;
          logoPositions[i3 + 2] = sz;

          const mix = Math.pow(Math.random(), 0.85);
          const c = new THREE.Color().lerpColors(cPink, cGold, mix);
          logoColors[i3] = c.r;
          logoColors[i3 + 1] = c.g;
          logoColors[i3 + 2] = c.b;

          const jx = (Math.random() - 0.5) * 0.32;
          const jy = (Math.random() - 0.5) * 0.32;
          const jz = (Math.random() - 0.5) * 0.28;
          collapsed.push({ x: jx, y: jy, z: jz });

          const dir = new THREE.Vector3(sx, sy, sz);
          if (dir.lengthSq() < 1e-6) {
            dir.set(
              (Math.random() - 0.5) * 2,
              (Math.random() - 0.5) * 2,
              (Math.random() - 0.5) * 2,
            );
          }
          dir.normalize().multiplyScalar(0.85 + Math.random() * 1.15);
          exploded.push({
            x: jx + dir.x,
            y: jy + dir.y,
            z: jz + dir.z,
          });
        }
        logoGeo.setAttribute("position", new THREE.BufferAttribute(logoPositions, 3));
        logoGeo.setAttribute("color", new THREE.BufferAttribute(logoColors, 3));

        logoMat = new THREE.PointsMaterial({
          size: isMobile ? 0.085 : 0.095,
          transparent: true,
          opacity: 0,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          vertexColors: true,
          sizeAttenuation: true,
        });
        logoParticles = new THREE.Points(logoGeo, logoMat);
        scene.add(logoParticles);

        let finished = false;
        const markDone = () => {
          if (finished) return;
          finished = true;
          if (autoSkipRef.current) {
            clearTimeout(autoSkipRef.current);
            autoSkipRef.current = null;
          }
          timelineRef.current?.kill();
          onComplete();
        };

        const finishEarly = () => {
          if (finished) return;
          finished = true;
          if (autoSkipRef.current) {
            clearTimeout(autoSkipRef.current);
            autoSkipRef.current = null;
          }
          timelineRef.current?.kill();
          gsap.to(containerRef.current, {
            opacity: 0,
            duration: 0.85,
            ease: "power2.inOut",
            onComplete,
          });
        };

        const master = { t: 0 };
        const updateLogoFromMaster = () => {
          if (!logoPositions || !logoGeo || !targets.length) return;
          const T = master.t;

          const collapse0 = 0.11;
          const collapse1 = 0.36;
          const explode0 = 0.36;
          const explode1 = 0.44;
          const settle0 = 0.44;
          const settle1 = 0.9;

          let collapseP = 0;
          let explodeP = 0;
          let settleP = 0;

          if (T >= collapse0 && T < collapse1) {
            collapseP = easeInOutQuart((T - collapse0) / (collapse1 - collapse0));
          } else if (T >= collapse1) {
            collapseP = 1;
          }

          if (T >= explode0 && T < explode1) {
            explodeP = easeOutCubic((T - explode0) / (explode1 - explode0));
          } else if (T >= explode1) {
            explodeP = 1;
          }

          if (T >= settle0 && T < settle1) {
            settleP = easeOutQuart((T - settle0) / (settle1 - settle0));
          } else if (T >= settle1) {
            settleP = 1;
          }

          for (let i = 0; i < targets.length; i++) {
            const s = logoStartPositions[i];
            const c = collapsed[i];
            const e = exploded[i];
            const tgt = targets[i];
            if (!s || !c || !e || !tgt) continue;

            const i3 = i * 3;
            let x: number;
            let y: number;
            let z: number;

            if (settleP > 0) {
              if (settleP >= 1) {
                x = tgt.x;
                y = tgt.y;
                z = tgt.z;
              } else {
                x = e.x + (tgt.x - e.x) * settleP;
                y = e.y + (tgt.y - e.y) * settleP;
                z = e.z + (tgt.z - e.z) * settleP;
              }
            } else if (explodeP > 0) {
              x = c.x + (e.x - c.x) * explodeP;
              y = c.y + (e.y - c.y) * explodeP;
              z = c.z + (e.z - c.z) * explodeP;
            } else {
              x = s.x + (c.x - s.x) * collapseP;
              y = s.y + (c.y - s.y) * collapseP;
              z = s.z + (c.z - s.z) * collapseP;
            }

            logoPositions[i3] = x;
            logoPositions[i3 + 1] = y;
            logoPositions[i3 + 2] = z;
          }
          logoGeo.attributes.position.needsUpdate = true;
        };

        const tl = gsap.timeline();
        timelineRef.current = tl;

        autoSkipRef.current = setTimeout(finishEarly, 11000);

        const ambientOpacityPeak = isMobile ? 0.32 : 0.38;

        tl.to(
          master,
          {
            t: 1,
            duration: 7.35,
            ease: "none",
            onUpdate: updateLogoFromMaster,
          },
          0,
        );

        tl.to(
          ambientMat,
          {
            opacity: ambientOpacityPeak,
            duration: 1.15,
            ease: "power2.out",
          },
          0,
        );

        tl.to(
          logoMat,
          {
            opacity: isMobile ? 0.42 : 0.48,
            duration: 1.05,
            ease: "power2.out",
          },
          0,
        );

        tl.to(
          logoMat,
          {
            opacity: isMobile ? 0.78 : 0.82,
            duration: 2.4,
            ease: "power1.inOut",
          },
          2.2,
        );

        tl.to(
          logoMat,
          {
            size: isMobile ? 0.04 : 0.046,
            duration: 3.2,
            ease: "power3.out",
          },
          3.2,
        );

        tl.to(
          camera.position,
          { z: 5.65, duration: 2.6, ease: "power3.inOut" },
          3.8,
        );

        if (sweepRef.current) {
          tl.fromTo(
            sweepRef.current,
            { opacity: 0, x: "-120%" },
            {
              opacity: 0.42,
              x: "-20%",
              duration: 1.1,
              ease: "power2.out",
            },
            4.1,
          );
          tl.to(
            sweepRef.current,
            {
              x: "120%",
              opacity: 0,
              duration: 1.35,
              ease: "power2.inOut",
            },
            5.0,
          );
        }

        if (taglineRef.current) {
          tl.fromTo(
            taglineRef.current,
            { opacity: 0, y: 14, filter: "blur(8px)" },
            {
              opacity: 1,
              y: 0,
              filter: "blur(0px)",
              duration: 1.25,
              ease: "power3.out",
            },
            5.35,
          );
        }

        tl.to(ambientMat, { opacity: 0, duration: 1.15, ease: "power1.inOut" }, 6.15);
        tl.to(logoMat, { opacity: 0, duration: 1.05, ease: "power1.inOut" }, 6.35);

        tl.to(
          containerRef.current,
          {
            opacity: 0,
            duration: 0.95,
            ease: "power2.inOut",
            onComplete: markDone,
          },
          7.25,
        );

        setReady(true);
      },
      undefined,
      () => {
        onComplete();
      },
    );

    const clock = new THREE.Clock();
    let frameId: number;

    const ambientBase: Float32Array = new Float32Array(
      (ambientGeo.attributes.position.array as Float32Array).slice(),
    );

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();
      const pos = ambientGeo.attributes.position.array as Float32Array;
      const sway = isMobile ? 0.09 : 0.11;
      const slow = 0.45;
      for (let i = 0; i < ambientCount; i++) {
        const i3 = i * 3;
        const bx = ambientBase[i3];
        const by = ambientBase[i3 + 1];
        const bz = ambientBase[i3 + 2];
        pos[i3] = bx + Math.sin(t * slow + i * 0.08) * sway;
        pos[i3 + 1] = by + Math.cos(t * slow * 0.85 + i * 0.11) * sway * 0.85;
        pos[i3 + 2] = bz + Math.sin(t * 0.35 + i * 0.06) * sway * 0.35;
      }
      ambientGeo.attributes.position.needsUpdate = true;
      if (logoParticles) {
        logoParticles.rotation.y = Math.sin(t * 0.12) * 0.022;
        logoParticles.rotation.x = Math.sin(t * 0.09) * 0.012;
      }
      renderer.render(scene, camera);
    };
    animate();

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(frameId);
      if (autoSkipRef.current) clearTimeout(autoSkipRef.current);
      timelineRef.current?.kill();
    };
  }, [onComplete]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-40 flex flex-col items-center justify-center overflow-hidden"
      style={{
        background: `linear-gradient(145deg, ${AURA_COLORS.light} 0%, ${AURA_COLORS.soft} 38%, ${AURA_COLORS.mid} 72%, ${AURA_COLORS.primary} 115%)`,
      }}
    >
      {/* Soft radial + vignette (subtle, cinematic) */}
      <div
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{
          background: `
            radial-gradient(ellipse 72% 58% at 50% 38%, rgba(255,255,255,0.22) 0%, transparent 55%),
            radial-gradient(ellipse 100% 100% at 50% 50%, transparent 35%, rgba(90, 40, 65, 0.08) 100%)
          `,
        }}
      />
      <canvas
        ref={canvasRef}
        className="absolute inset-0 z-[2] h-full w-full"
        style={{ background: "transparent" }}
      />
      <div
        ref={sweepRef}
        className="pointer-events-none absolute inset-y-0 z-[3] w-[55%]"
        style={{
          background: `linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.22) 42%, rgba(255,232,200,0.18) 50%, rgba(255,255,255,0.18) 58%, transparent 100%)`,
          transform: "translateX(-120%)",
          opacity: 0,
        }}
      />
      <div className="relative z-10 flex flex-col items-center justify-center px-8 text-center">
        <p
          ref={taglineRef}
          className="mt-7 max-w-md text-[15px] font-medium leading-relaxed text-[#1A1A1A]/78 opacity-0 md:mt-8 md:text-lg"
          style={{ textShadow: "0 1px 20px rgba(255,255,255,0.75)" }}
        >
          Web Experiences That Feel Alive
        </p>
      </div>

      <button
        type="button"
        onClick={skip}
        className="absolute right-6 top-6 z-20 rounded-full border border-white/45 bg-white/18 px-5 py-2 text-sm font-medium text-white/95 backdrop-blur-md transition-all hover:bg-white/28"
      >
        Skip Intro
      </button>

      {ready && (
        <span className="absolute bottom-6 left-1/2 z-20 -translate-x-1/2 text-[11px] text-white/70">
          Continues automatically
        </span>
      )}
    </div>
  );
}
