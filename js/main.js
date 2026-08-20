document.addEventListener('DOMContentLoaded', () => {

    /* ==========================================================================
       Quantum Particle Canvas Background
       ========================================================================== */
    const canvas = document.getElementById('quantum-bg');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let width, height;
        let particles = [];
        
        function resizeCanvas() {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;
        }
        
        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();
        
        class Particle {
            constructor() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.vx = (Math.random() - 0.5) * 1.0;
                this.vy = (Math.random() - 0.5) * 1.0;
                this.radius = Math.random() * 2 + 0.5;
            }
            update() {
                this.x += this.vx;
                this.y += this.vy;
                
                if (this.x < 0 || this.x > width) this.vx = -this.vx;
                if (this.y < 0 || this.y > height) this.vy = -this.vy;
            }
            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(241, 194, 27, 0.6)'; // Qiskit Yellow
                ctx.fill();
            }
        }
        
        // Number of particles depends on screen size (reduced for performance)
        const numParticles = Math.floor((width * height) / 25000);
        for (let i = 0; i < numParticles; i++) {
            particles.push(new Particle());
        }
        
        let mouse = { x: null, y: null };
        window.addEventListener('mousemove', (e) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
        });
        window.addEventListener('mouseleave', () => {
            mouse.x = null;
            mouse.y = null;
        });
        
        function animate() {
            ctx.clearRect(0, 0, width, height);
            
            for (let i = 0; i < particles.length; i++) {
                particles[i].update();
                particles[i].draw();
                
                // Draw lines between particles
                for (let j = i; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance < 120) {
                        ctx.beginPath();
                        ctx.strokeStyle = `rgba(136, 146, 176, ${0.4 - distance/300})`; // Gray lines
                        ctx.lineWidth = 1;
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                    }
                }
                
                // Connect particles to mouse
                if (mouse.x != null) {
                    const dx = particles[i].x - mouse.x;
                    const dy = particles[i].y - mouse.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    if (distance < 150) {
                        ctx.beginPath();
                        ctx.strokeStyle = `rgba(241, 194, 27, ${0.8 - distance/180})`; // Yellow line to mouse
                        ctx.lineWidth = 1.2;
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(mouse.x, mouse.y);
                        ctx.stroke();
                    }
                }
            }
            requestAnimationFrame(animate);
        }
        animate();
    }

    /* ==========================================================================
       Navigation Logic (Smooth Scroll)
       ========================================================================== */
    const navLinksContainer = document.querySelector('.nav-links');
    const hamburger = document.getElementById('hamburger');

    // Smooth scroll for all anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if(targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                // Close mobile menu if open
                if (navLinksContainer.classList.contains('active')) {
                    navLinksContainer.classList.remove('active');
                    hamburger.classList.remove('active');
                }

                // Smooth scroll to target, accounting for fixed navbar
                const navHeight = document.querySelector('.navbar').offsetHeight;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - navHeight;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
                
                // Update URL hash without jumping
                history.pushState(null, null, targetId);
            }
        });
    });

    // Mobile Hamburger Toggle
    hamburger.addEventListener('click', () => {
        navLinksContainer.classList.toggle('active');
        hamburger.classList.toggle('active');
    });

    /* ==========================================================================
       Hero Scattering Scales Effect
       ========================================================================== */
    const heroSection = document.querySelector('.hero');
    const tilesContainer = document.getElementById('hero-tiles-container');
    
    if (heroSection && tilesContainer) {
        let tiles = [];
        // Larger tiles on mobile to drastically reduce DOM nodes and eliminate lag
        const isMobile = window.innerWidth < 768;
        const tileSize = isMobile ? 120 : 50;
        let cols = 0;
        let rows = 0;
        
        function initGrid() {
            // Clear existing
            tilesContainer.innerHTML = '';
            tiles = [];
            
            const width = heroSection.offsetWidth;
            const height = heroSection.offsetHeight;
            
            cols = Math.ceil(width / tileSize);
            rows = Math.ceil(height / tileSize);
            
            // Calculate object-fit: cover equivalent dimensions for the background image
            // Assuming the base image (bgimagehome) is a standard 16:9 ratio
            const imgAspect = 1920 / 1080; 
            const containerAspect = width / height;
            
            let bgWidth, bgHeight, bgOffsetX, bgOffsetY;
            
            if (containerAspect > imgAspect) {
                // Container is wider than image (crop top/bottom)
                bgWidth = width;
                bgHeight = width / imgAspect;
                bgOffsetX = 0;
                bgOffsetY = (height - bgHeight) / 2;
            } else {
                // Container is taller than image (crop sides)
                bgHeight = height;
                bgWidth = height * imgAspect;
                bgOffsetX = (width - bgWidth) / 2;
                bgOffsetY = 0;
            }
            
            for (let y = 0; y < rows; y++) {
                for (let x = 0; x < cols; x++) {
                    const tile = document.createElement('div');
                    tile.classList.add('hero-tile');
                    
                    // Position
                    tile.style.width = `${tileSize}px`;
                    tile.style.height = `${tileSize}px`;
                    tile.style.left = `${x * tileSize}px`;
                    tile.style.top = `${y * tileSize}px`;
                    
                    // Background mapping to perfectly mimic background-size: cover
                    tile.style.backgroundSize = `${bgWidth}px ${bgHeight}px`;
                    
                    // The tile's top-left corner is at (x*tileSize, y*tileSize)
                    // We subtract this from the global offset to align the background perfectly
                    const bgPosX = bgOffsetX - (x * tileSize);
                    const bgPosY = bgOffsetY - (y * tileSize);
                    tile.style.backgroundPosition = `${bgPosX}px ${bgPosY}px`;
                    
                    // Store center coords for distance math
                    const centerX = (x * tileSize) + (tileSize / 2);
                    const centerY = (y * tileSize) + (tileSize / 2);
                    
                    tilesContainer.appendChild(tile);
                    
                    tiles.push({
                        element: tile,
                        x: centerX,
                        y: centerY
                    });
                }
            }
        }
        
        initGrid();
        
        // Debounce resize
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(initGrid, 200);
        });
        
        // Interaction Logic
        const interactionRadius = 250;
        const maxPush = 120;
        
        function handleInteraction(mouseX, mouseY) {
            tiles.forEach(tile => {
                const dx = tile.x - mouseX;
                const dy = tile.y - mouseY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < interactionRadius) {
                    // Calculate intensity (0 to 1, where 1 is at the cursor)
                    const intensity = 1 - (distance / interactionRadius);
                    
                    // Push direction vector
                    // Add small offset to prevent division by zero if cursor is exactly center
                    const safeDist = distance === 0 ? 0.1 : distance;
                    const pushX = (dx / safeDist) * (intensity * maxPush);
                    const pushY = (dy / safeDist) * (intensity * maxPush);
                    
                    // Rotate based on push direction (left/right tilt)
                    const rotate = (dx / safeDist) * intensity * 60; 
                    
                    // Opacity drops when close to cursor to fully reveal underneath
                    const opacity = Math.max(0, 1 - (intensity * 1.8));
                    const scale = 1 - (intensity * 0.3);
                    
                    tile.element.style.transform = `translate3d(${pushX}px, ${pushY}px, 0) rotate(${rotate}deg) scale(${scale})`;
                    tile.element.style.opacity = opacity;
                } else {
                    // Reset tiles outside radius
                    tile.element.style.transform = 'translate3d(0, 0, 0) rotate(0deg) scale(1)';
                    tile.element.style.opacity = 1;
                }
            });
        }
        
        let afRequest = null;
        heroSection.addEventListener('mousemove', (e) => {
            const rect = heroSection.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            
            if (afRequest) cancelAnimationFrame(afRequest);
            afRequest = requestAnimationFrame(() => handleInteraction(mouseX, mouseY));
        });
        
        heroSection.addEventListener('mouseleave', () => {
            if (afRequest) cancelAnimationFrame(afRequest);
            tiles.forEach(tile => {
                tile.element.style.transform = 'translate3d(0, 0, 0) rotate(0deg) scale(1)';
                tile.element.style.opacity = 1;
            });
        });
        
        heroSection.addEventListener('touchmove', (e) => {
            if(e.touches.length > 0) {
                const rect = heroSection.getBoundingClientRect();
                const mouseX = e.touches[0].clientX - rect.left;
                const mouseY = e.touches[0].clientY - rect.top;
                if (afRequest) cancelAnimationFrame(afRequest);
                afRequest = requestAnimationFrame(() => handleInteraction(mouseX, mouseY));
            }
        }, {passive: true});
        
        heroSection.addEventListener('touchend', () => {
            if (afRequest) cancelAnimationFrame(afRequest);
            tiles.forEach(tile => {
                tile.element.style.transform = 'translate3d(0, 0, 0) rotate(0deg) scale(1)';
                tile.element.style.opacity = 1;
            });
        });
    }

    /* ==========================================================================
       Scroll Reveal & Roadmap Animations
       ========================================================================== */
    
    // 1. General Reveal Elements
    const revealElements = document.querySelectorAll('.reveal-on-scroll');

    // 2. Timeline Cards & Split Text
    const slideInElements = document.querySelectorAll('.slide-in-left, .slide-in-right');
    const splitTextElements = document.querySelectorAll('.split-text-animate');
    
    // Process Split Text Elements
    splitTextElements.forEach(el => {
        const text = el.innerText;
        el.innerHTML = '';
        const words = text.split(' ');
        
        words.forEach((word, index) => {
            const span = document.createElement('span');
            span.classList.add('word-span');
            span.innerText = word + (index < words.length - 1 ? ' ' : '');
            // Stagger the transition delay based on word index
            span.style.transitionDelay = `${index * 0.1}s`;
            el.appendChild(span);
        });
    });
    
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15 
    };

    const scrollObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
            }
        });
    }, observerOptions);

    // Start observing elements
    revealElements.forEach(el => scrollObserver.observe(el));
    slideInElements.forEach(el => scrollObserver.observe(el));
    splitTextElements.forEach(el => scrollObserver.observe(el));
});
