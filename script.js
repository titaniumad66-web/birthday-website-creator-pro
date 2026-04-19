
// Aura UI Initialization
document.addEventListener('DOMContentLoaded', () => {
    console.log('Aura UI Libraries Initializing...');

    // 1. Register GSAP ScrollTrigger
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);
        console.log('GSAP ScrollTrigger Registered');

        // Basic GSAP animation test
        gsap.to('body', {
            opacity: 1,
            duration: 1,
            ease: 'power2.inOut',
            onComplete: () => console.log('GSAP Test Animation Complete')
        });

        // ScrollTrigger test
        gsap.to('#root', {
            scrollTrigger: {
                trigger: '#root',
                start: 'top top',
                end: 'bottom bottom',
                scrub: true,
                onUpdate: (self) => {
                    // console.log('Scroll progress:', self.progress);
                }
            }
        });
    }

    // 2. Initialize Lenis Smooth Scroll
    if (typeof Lenis !== 'undefined') {
        const lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            orientation: 'vertical',
            gestureOrientation: 'vertical',
            smoothWheel: true,
            wheelMultiplier: 1,
            smoothTouch: false,
            touchMultiplier: 2,
            infinite: false,
        });

        function raf(time) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }

        requestAnimationFrame(raf);
        console.log('Lenis Smooth Scroll Initialized');
        
        // Connect Lenis to ScrollTrigger
        lenis.on('scroll', ScrollTrigger.update);
        gsap.ticker.add((time) => {
            lenis.raf(time * 1000);
        });
        gsap.ticker.lagSmoothing(0);
    }

    // 3. Prepare Three.js Environment
    if (typeof THREE !== 'undefined') {
        console.log('Three.js Environment Preparing...');
        
        // Create a basic Three.js scene container if it doesn't exist
        if (!document.getElementById('aura-3d-container')) {
            const container = document.createElement('div');
            container.id = 'aura-3d-container';
            container.style.position = 'fixed';
            container.style.top = '0';
            container.style.left = '0';
            container.style.width = '100%';
            container.style.height = '100%';
            container.style.zIndex = '-1';
            container.style.pointerEvents = 'none';
            document.body.prepend(container);
            
            // Placeholder for Three.js scene
            const scene = new THREE.Scene();
            const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
            const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
            renderer.setSize(window.innerWidth, window.innerHeight);
            container.appendChild(renderer.domElement);
            
            console.log('Three.js Placeholder Scene Created');
            
            // Handle resize
            window.addEventListener('resize', () => {
                camera.aspect = window.innerWidth / window.innerHeight;
                camera.updateProjectionMatrix();
                renderer.setSize(window.innerWidth, window.innerHeight);
            });
        }
    }

    // 4. SplitType Initialization
    if (typeof SplitType !== 'undefined') {
        console.log('SplitType Ready for Text Animations');
        // Example usage: const text = new SplitType('#target-element', { types: 'lines,words,chars' });
    }
});
