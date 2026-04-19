import React, { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    THREE: any;
    gsap: any;
  }
}

interface Intro3DProps {
  onComplete: () => void;
}

const Intro3D: React.FC<Intro3DProps> = ({ onComplete }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const THREE = (window as any).THREE;
    const gsap = (window as any).gsap;

    if (!THREE || !gsap) {
      console.error('Three.js or GSAP not found on window object');
      onComplete();
      return;
    }

    // --- Scene Setup ---
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: true,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // --- Lighting ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xff7eb3, 2, 10);
    pointLight.position.set(2, 3, 4);
    scene.add(pointLight);

    const pointLight2 = new THREE.PointLight(0x8e44ad, 2, 10);
    pointLight2.position.set(-2, -3, 4);
    scene.add(pointLight2);

    // --- Particles ---
    const particlesCount = 300;
    const particlesGeometry = new THREE.BufferGeometry();
    const posArray = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount * 3; i++) {
      // Create depth: z from -20 to 5
      if (i % 3 === 2) {
        posArray[i] = Math.random() * 25 - 20;
      } else {
        posArray[i] = (Math.random() - 0.5) * 15;
      }
    }

    particlesGeometry.setAttribute(
      'position',
      new THREE.BufferAttribute(posArray, 3)
    );

    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.06,
      color: 0xffffff,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
    });

    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);

    // --- Birthday Objects ---
    const group = new THREE.Group();
    scene.add(group);

    // Balloon
    const balloonGeometry = new THREE.SphereGeometry(0.4, 32, 32);
    const balloonMaterial = new THREE.MeshPhongMaterial({ 
      color: 0xff4d4d,
      shininess: 80,
      specular: 0x444444 
    });
    const balloon = new THREE.Mesh(balloonGeometry, balloonMaterial);
    balloon.position.set(-1.8, 0.2, -2);
    group.add(balloon);

    const stringGeometry = new THREE.CylinderGeometry(0.005, 0.005, 1.2, 8);
    const stringMaterial = new THREE.MeshBasicMaterial({ color: 0xcccccc });
    const string = new THREE.Mesh(stringGeometry, stringMaterial);
    string.position.set(-1.8, -0.6, -2);
    group.add(string);

    // Gift Box
    const giftGeometry = new THREE.BoxGeometry(0.6, 0.6, 0.6);
    const giftMaterial = new THREE.MeshPhongMaterial({ color: 0xffbf00 });
    const gift = new THREE.Mesh(giftGeometry, giftMaterial);
    gift.position.set(1.8, -0.5, -1);
    gift.rotation.y = Math.PI / 4;
    group.add(gift);

    // Simple Cake Placeholder
    const cakeBottomGeometry = new THREE.CylinderGeometry(0.5, 0.5, 0.3, 32);
    const cakeMaterial = new THREE.MeshPhongMaterial({ color: 0xffc0cb });
    const cakeBottom = new THREE.Mesh(cakeBottomGeometry, cakeMaterial);
    cakeBottom.position.set(0, -1.5, -3);
    group.add(cakeBottom);

    const cakeTopGeometry = new THREE.CylinderGeometry(0.35, 0.35, 0.25, 32);
    const cakeTop = new THREE.Mesh(cakeTopGeometry, cakeMaterial);
    cakeTop.position.set(0, -1.22, -3);
    group.add(cakeTop);

    // --- Animations ---
    camera.position.z = 7;

    gsap.to(particlesMaterial, {
      opacity: 0.8,
      duration: 3,
      ease: 'power2.inOut',
    });

    // Cinematic Camera Zoom
    gsap.to(camera.position, {
      z: 4,
      duration: 6,
      ease: 'sine.inOut',
    });

    // Balloon floating motion
    gsap.to(balloon.position, {
      y: 0.6,
      x: -1.7,
      duration: 3.5,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    });
    gsap.to(balloon.rotation, {
      z: 0.1,
      duration: 2,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    });

    // Gift Box subtle rotation
    gsap.to(gift.rotation, {
      y: Math.PI * 2 + gift.rotation.y,
      duration: 10,
      repeat: -1,
      ease: 'none',
    });

    // Parallax effect variables
    let mouseX = 0;
    let mouseY = 0;
    const handleMouseMove = (event: MouseEvent) => {
      mouseX = (event.clientX / window.innerWidth - 0.5) * 0.5;
      mouseY = (event.clientY / window.innerHeight - 0.5) * 0.5;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Text Animation
    if (textRef.current) {
      gsap.fromTo(
        textRef.current,
        { opacity: 0, y: 30, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 2, delay: 0.8, ease: 'power3.out' }
      );
    }

    // Final Transition Timeline
    const tl = gsap.timeline({
      delay: 4.5,
      onComplete: () => {
        setIsVisible(false);
        onComplete();
      },
    });

    tl.to(textRef.current, {
      opacity: 0,
      y: -20,
      duration: 1,
      ease: 'power2.in',
    }, 0);

    tl.to(camera.position, {
      z: 1,
      duration: 1.5,
      ease: 'power2.in',
    }, 0.5);

    tl.to(particlesMaterial, {
      opacity: 0,
      duration: 1.2,
      ease: 'power2.inOut',
    }, 0.5);

    tl.to(containerRef.current, {
      opacity: 0,
      duration: 1.2,
      ease: 'power2.inOut',
    }, 0.8);

    // --- Render Loop ---
    let frameId: number;
    const positions = particlesGeometry.attributes.position.array as Float32Array;
    
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      
      // Animate particles towards camera
      for (let i = 0; i < particlesCount; i++) {
        const i3 = i * 3;
        positions[i3 + 2] += 0.02; // Move forward
        
        // Reset particles that passed camera
        if (positions[i3 + 2] > 5) {
          positions[i3 + 2] = -20;
        }
      }
      particlesGeometry.attributes.position.needsUpdate = true;
      
      particlesMesh.rotation.y += 0.0005;

      // Subtle Parallax
      camera.position.x += (mouseX - camera.position.x) * 0.05;
      camera.position.y += (-mouseY - camera.position.y) * 0.05;
      camera.lookAt(0, 0, 0);
      
      renderer.render(scene, camera);
    };
    animate();

    // --- Resize Handler ---
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    // --- Cleanup ---
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(frameId);
    };
  }, [onComplete]);

  if (!isVisible) return null;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#FFF7FA]"
      style={{ pointerEvents: 'all' }}
    >
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      <div
        ref={textRef}
        className="relative z-10 text-center px-6 pointer-events-none"
      >
        <h1 className="text-4xl md:text-6xl font-serif text-white tracking-tight drop-shadow-2xl">
          Every birthday holds a story
        </h1>
        <div className="mt-4 h-[1px] w-24 bg-rose-400 mx-auto" />
      </div>
    </div>
  );
};

export default Intro3D;
