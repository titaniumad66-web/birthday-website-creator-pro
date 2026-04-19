import React, { useEffect, useRef } from "react";
import { Link } from "wouter";
import { ArrowRight, PlayCircle } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import SmoothButton from "./ui/SmoothButton";
import previewPlaceholder from "@/assets/images/story/image 1.jpg";

declare global {
  interface Window {
    THREE: any;
    gsap: any;
    ScrollTrigger: any;
    SplitType: any;
  }
}

interface HeroSectionProps {
  onPrimaryHref: string;
  onSecondaryHref: string;
}

const HeroSection: React.FC<HeroSectionProps> = ({
  onPrimaryHref,
  onSecondaryHref,
}) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const headlineLine1Ref = useRef<HTMLSpanElement>(null);
  const headlineSerifRef = useRef<HTMLSpanElement>(null);
  const headlineWrapRef = useRef<HTMLDivElement>(null);
  const subtextRef = useRef<HTMLParagraphElement>(null);
  const buttonsRef = useRef<HTMLDivElement>(null);
  const visualColRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (!canvasRef.current || !sectionRef.current) return;

    const THREE = window.THREE;
    const gsap = window.gsap;
    const ScrollTrigger = window.ScrollTrigger;
    const SplitType = window.SplitType;

    if (!THREE || !gsap || !ScrollTrigger || !SplitType) {
      console.error("UI Libraries not found on window object");
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    const isNarrow = window.matchMedia("(max-width: 768px)").matches;
    const particlesCount = isNarrow ? 90 : 200;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000,
    );
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: !isNarrow,
      alpha: true,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isNarrow ? 1.5 : 2));

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.35);
    scene.add(ambientLight);

    const pinkLight = new THREE.PointLight(0xff8fb3, 1.2, 12);
    pinkLight.position.set(2, 2, 2);
    scene.add(pinkLight);

    const roseLight = new THREE.PointLight(0xffb6c9, 1, 12);
    roseLight.position.set(-2, -2, 2);
    scene.add(roseLight);

    const particlesGeometry = new THREE.BufferGeometry();
    const posArray = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 12;
    }

    particlesGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(posArray, 3),
    );

    const particlesMaterial = new THREE.PointsMaterial({
      size: isNarrow ? 0.028 : 0.04,
      color: 0xffc8d8,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending,
    });

    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);

    if (headlineLine1Ref.current) {
      const splitHeadline = new SplitType(headlineLine1Ref.current, {
        types: "chars",
      });
      gsap.from(splitHeadline.chars, {
        opacity: 0,
        y: 18,
        duration: 0.75,
        stagger: 0.018,
        ease: "power3.out",
        delay: 0.15,
      });
    }

    if (headlineSerifRef.current) {
      gsap.from(headlineSerifRef.current, {
        opacity: 0,
        y: 22,
        duration: 0.85,
        ease: "power3.out",
        delay: 0.42,
      });
    }

    gsap.from([subtextRef.current, buttonsRef.current, visualColRef.current], {
      opacity: 0,
      y: 20,
      duration: 0.9,
      stagger: 0.12,
      ease: "power3.out",
      delay: 0.55,
    });

    const scrollTl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top top",
        end: "bottom top",
        scrub: true,
      },
    });

    scrollTl.to(
      [
        headlineWrapRef.current,
        subtextRef.current,
        buttonsRef.current,
        visualColRef.current,
      ],
      {
        y: -80,
        opacity: 0,
        ease: "none",
      },
    );

    scrollTl.to(
      particlesMaterial,
      {
        opacity: 0,
        ease: "none",
      },
      0,
    );

    let mouseX = 0;
    let mouseY = 0;
    const handleMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 0.35;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 0.35;
    };
    if (!isNarrow) {
      window.addEventListener("mousemove", handleMouseMove);
    }

    let frameId: number;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      particlesMesh.rotation.y += 0.0007;
      particlesMesh.rotation.x += 0.00035;
      if (!isNarrow) {
        camera.position.x += (mouseX - camera.position.x) * 0.05;
        camera.position.y += (-mouseY - camera.position.y) * 0.05;
        camera.lookAt(0, 0, 0);
      }
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(frameId);
      ScrollTrigger.getAll().forEach((t: any) => t.kill());
    };
  }, []);

  const laptopMotion = reduceMotion
    ? {}
    : {
        animate: { y: [0, -6, 0] },
        transition: {
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut" as const,
        },
      };

  return (
    <section
      ref={sectionRef}
      className="relative flex min-h-[80dvh] w-full items-start overflow-hidden bg-transparent lg:min-h-[85dvh]"
    >
      {/* Soft radial glow (behind WebGL) */}
      <div className="pointer-events-none absolute inset-0 z-[1]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_95%_75%_at_50%_15%,rgba(255,214,231,0.55),transparent_58%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_65%_50%_at_85%_75%,rgba(255,182,210,0.2),transparent_52%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_55%_45%_at_12%_72%,rgba(255,107,157,0.08),transparent_48%)]" />
        {!reduceMotion && (
          <motion.div
            className="absolute left-1/2 top-[18%] h-[min(55vw,420px)] w-[min(95vw,900px)] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(255,255,255,0.65),transparent_100%)] blur-2xl"
            animate={{ opacity: [0.35, 0.55, 0.35], scale: [1, 1.03, 1] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          />
        )}
      </div>

      <canvas ref={canvasRef} className="absolute inset-0 z-[2] h-full w-full" />

      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col items-stretch gap-10 px-6 pb-24 pt-4 sm:gap-12 sm:px-8 sm:pb-28 sm:pt-5 md:gap-14 md:px-10 md:pb-28 md:pt-6 lg:flex-row lg:items-start lg:justify-between lg:gap-16 lg:px-12 lg:pt-5 xl:gap-20 xl:px-16">
        {/* Left: copy + CTAs */}
        <div className="flex w-full flex-1 flex-col items-center text-center lg:max-w-xl lg:items-start lg:text-left xl:max-w-[28rem]">
          <p className="mb-5 inline-flex items-center rounded-full border border-[#FFD6E7]/90 bg-white/50 px-4 py-1.5 font-sans text-[10px] font-medium uppercase tracking-[0.35em] text-muted-foreground shadow-[0_4px_24px_-8px_rgba(255,107,157,0.15)] backdrop-blur-sm sm:mb-6 sm:text-[11px] sm:tracking-[0.35em]">
            Aura · Birthday experiences
          </p>

          <div ref={headlineWrapRef} className="w-full">
            <h1 className="text-balance font-serif text-[clamp(2.35rem,6vw,4.25rem)] font-bold leading-[1.06] tracking-tight text-foreground xl:text-[clamp(2.5rem,5vw,4.5rem)]">
              <span
                ref={headlineLine1Ref}
                className="block font-sans text-[0.92em] font-medium text-foreground/85"
              >
                Turn birthdays into
              </span>
              <span
                ref={headlineSerifRef}
                className="mt-3 block bg-gradient-to-b from-[#FF6B9D] via-[#FF6B9D] to-[#FF6B9D]/75 bg-clip-text text-transparent drop-shadow-[0_2px_40px_rgba(255,107,157,0.2)]"
              >
                unforgettable digital surprises
              </span>
            </h1>
          </div>

          <p
            ref={subtextRef}
            className="mx-auto mt-8 max-w-xl font-sans text-base font-normal leading-relaxed text-muted-foreground sm:mt-10 sm:text-lg sm:leading-relaxed md:text-xl md:leading-relaxed lg:mx-0 lg:max-w-[26rem]"
          >
            Create refined birthday sites filled with memories, messages, and
            moments — shared in one beautiful link.
          </p>

          <div
            ref={buttonsRef}
            className="mt-10 flex w-full max-w-md flex-col items-stretch justify-center gap-3 sm:mt-12 sm:flex-row sm:items-center sm:justify-center sm:gap-4 lg:max-w-none lg:justify-start"
          >
            <Link href={onPrimaryHref} className="w-full sm:w-auto">
              <SmoothButton variant="primary" className="w-full min-h-[48px] sm:w-auto">
                Create your surprise
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </SmoothButton>
            </Link>

            {onSecondaryHref.startsWith("#") ? (
              <a
                href={onSecondaryHref}
                className="w-full sm:w-auto"
                onClick={(e) => {
                  if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
                  e.preventDefault();
                  const id = onSecondaryHref.slice(1);
                  document.getElementById(id)?.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                  });
                }}
              >
                <SmoothButton variant="secondary" className="w-full min-h-[48px] sm:w-auto">
                  <PlayCircle className="h-4 w-4" />
                  Watch demo
                </SmoothButton>
              </a>
            ) : (
              <Link href={onSecondaryHref} className="w-full sm:w-auto">
                <SmoothButton variant="secondary" className="w-full min-h-[48px] sm:w-auto">
                  <PlayCircle className="h-4 w-4" />
                  Watch demo
                </SmoothButton>
              </Link>
            )}
          </div>
        </div>

        {/* Right: laptop mockup + preview */}
        <div
          ref={visualColRef}
          className="flex w-full flex-1 items-center justify-center lg:items-start lg:justify-end"
          style={{ perspective: "1400px" }}
        >
          <motion.div
            className="relative w-full max-w-[min(100%,420px)] sm:max-w-[min(100%,480px)] lg:max-w-[min(100%,520px)]"
            {...laptopMotion}
            whileHover={
              reduceMotion
                ? undefined
                : {
                    rotateY: -5,
                    rotateX: 4,
                    scale: 1.02,
                    transition: { type: "spring", stiffness: 260, damping: 22 },
                  }
            }
            style={{ transformStyle: "preserve-3d" }}
          >
            <div className="rounded-[1.35rem] border border-[#FFD6E7]/90 bg-gradient-to-b from-white via-[#FFF7FA] to-[#FFE8F0]/90 p-[10px] shadow-[0_32px_64px_-24px_rgba(255,107,157,0.35),0_12px_40px_-16px_rgba(255,182,201,0.45)] sm:rounded-[1.5rem] sm:p-3 md:p-[14px]">
              {/* Screen bezel */}
              <div className="overflow-hidden rounded-xl border border-[#FFD6E7]/60 bg-[#FFF0F5] shadow-inner sm:rounded-[0.9rem]">
                {/* Browser chrome */}
                <div className="flex items-center gap-2 border-b border-[#FFD6E7]/70 bg-white/90 px-3 py-2 sm:px-3.5 sm:py-2.5">
                  <div className="flex gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#FF9EB5]/90" />
                    <span className="h-2.5 w-2.5 rounded-full bg-[#FFD6A8]/90" />
                    <span className="h-2.5 w-2.5 rounded-full bg-[#B8E7C4]/90" />
                  </div>
                  <div className="ml-2 min-w-0 flex-1 truncate rounded-md border border-[#FFE4EC] bg-[#FFF7FA] px-2 py-1 text-center font-mono text-[10px] text-muted-foreground/80 sm:text-[11px]">
                    aura.app/surprise
                  </div>
                </div>
                <div className="relative aspect-[16/10] w-full bg-gradient-to-br from-[#FFF7FA] via-[#FFE4EC]/50 to-[#FFD6E7]/40">
                  <img
                    src={previewPlaceholder}
                    alt="Preview of an Aura birthday surprise page"
                    className="h-full w-full object-cover object-center"
                    loading="eager"
                    decoding="async"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#FFF7FA]/90 via-transparent to-white/20" />
                </div>
              </div>
              {/* Laptop base */}
              <div className="mx-1 mt-2 h-2 rounded-b-md rounded-t-sm bg-gradient-to-b from-[#FFE4EC] to-[#FFD6E7]/80 shadow-[0_6px_16px_-4px_rgba(255,107,157,0.2)] sm:mx-2 sm:mt-2.5 sm:h-2.5" />
            </div>
          </motion.div>
        </div>
      </div>

      <motion.div
        className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2 text-muted-foreground/70 sm:bottom-10"
        initial={reduceMotion ? undefined : { opacity: 0, y: 8 }}
        animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.6 }}
      >
        <span className="text-[10px] font-medium uppercase tracking-[0.3em]">
          Scroll
        </span>
        <motion.div
          className="h-12 w-px bg-gradient-to-b from-[#FF6B9D]/40 to-transparent"
          animate={reduceMotion ? undefined : { scaleY: [1, 0.65, 1] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>
    </section>
  );
};

export default HeroSection;
