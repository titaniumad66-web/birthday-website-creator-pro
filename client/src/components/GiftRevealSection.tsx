import React, { useEffect, useRef } from "react";

declare global {
  interface Window {
    THREE: any;
    gsap: any;
    ScrollTrigger: any;
  }
}

const GiftRevealSection: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const THREE = window.THREE;
    const gsap = window.gsap;
    const ScrollTrigger = window.ScrollTrigger;

    if (!THREE || !gsap || !ScrollTrigger) {
      console.error("Three.js, GSAP, or ScrollTrigger not found on window object");
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

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
      antialias: true,
      alpha: true,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xf0abfc, 1.8, 12);
    pointLight.position.set(2, 3, 4);
    scene.add(pointLight);

    const giftGroup = new THREE.Group();
    scene.add(giftGroup);

    const bodyGeometry = new THREE.BoxGeometry(2, 1.5, 2);
    const bodyMaterial = new THREE.MeshPhongMaterial({ color: 0xe879f9 });
    const boxBody = new THREE.Mesh(bodyGeometry, bodyMaterial);
    giftGroup.add(boxBody);

    const lidGeometry = new THREE.BoxGeometry(2.2, 0.4, 2.2);
    const lidMaterial = new THREE.MeshPhongMaterial({ color: 0xf5d0fe });
    const boxLid = new THREE.Mesh(lidGeometry, lidMaterial);
    boxLid.position.y = 0.95;
    giftGroup.add(boxLid);

    const particlesCount = 150;
    const particlesGeometry = new THREE.BufferGeometry();
    const posArray = new Float32Array(particlesCount * 3);
    const velocities = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 1;
      velocities[i] = (Math.random() - 0.5) * 0.02;
    }

    particlesGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(posArray, 3),
    );
    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.05,
      color: 0xfde68a,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
    });

    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top top",
        end: "+=200%",
        scrub: 1,
        pin: true,
        anticipatePin: 1,
      },
    });

    tl.fromTo(
      giftGroup.scale,
      { x: 0, y: 0, z: 0 },
      { x: 1, y: 1, z: 1, duration: 1, ease: "back.out(1.7)" },
    );

    tl.to(
      giftGroup.rotation,
      {
        y: Math.PI * 2,
        duration: 2,
        ease: "none",
      },
      "+=0.5",
    );

    tl.to(
      boxLid.position,
      {
        y: 2.5,
        duration: 1,
        ease: "power2.out",
      },
      "+=0.2",
    );
    tl.to(
      boxLid.rotation,
      {
        x: -Math.PI / 4,
        duration: 1,
        ease: "power2.out",
      },
      "<",
    );

    tl.to(
      particlesMaterial,
      {
        opacity: 1,
        duration: 1,
      },
      "<",
    );

    tl.fromTo(
      textRef.current,
      { opacity: 0, y: 40 },
      { opacity: 1, y: 0, duration: 1, ease: "power3.out" },
    );

    let frameId: number;
    const animate = () => {
      frameId = requestAnimationFrame(animate);

      if (particlesMaterial.opacity > 0) {
        const positions = particlesGeometry.attributes.position.array as Float32Array;
        for (let i = 0; i < particlesCount; i++) {
          const i3 = i * 3;
          positions[i3] += velocities[i3];
          positions[i3 + 1] += velocities[i3 + 1] + 0.005;
          positions[i3 + 2] += velocities[i3 + 2];

          if (positions[i3 + 1] > 3) {
            positions[i3] = (Math.random() - 0.5) * 0.5;
            positions[i3 + 1] = 0;
            positions[i3 + 2] = (Math.random() - 0.5) * 0.5;
          }
        }
        particlesGeometry.attributes.position.needsUpdate = true;
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
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(frameId);
      if (tl.scrollTrigger) tl.scrollTrigger.kill();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-[#FFF7FA]"
    >
      <div className="pointer-events-none absolute inset-0 z-[1]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_30%,rgba(255,214,231,0.65),transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_20%_80%,rgba(255,107,157,0.08),transparent_50%)]" />
      </div>

      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0 z-[2] h-full w-full"
      />

      <div
        ref={textRef}
        className="relative z-10 mx-auto max-w-3xl px-5 text-center sm:px-8 mt-[min(22rem,38vh)] sm:mt-[min(24rem,40vh)] md:mt-[25rem]"
      >
        <p className="mb-3 font-sans text-[11px] font-semibold uppercase tracking-[0.28em] text-muted-foreground">
          The reveal
        </p>
        <h2 className="font-serif text-3xl font-bold leading-tight tracking-tight text-foreground drop-shadow-sm sm:text-4xl md:text-5xl">
          Surprises deserve a beautiful stage.
        </h2>
        <div className="mx-auto mt-8 h-px w-16 bg-gradient-to-r from-transparent via-[#FF6B9D]/40 to-transparent" />
      </div>
    </div>
  );
};

export default GiftRevealSection;
