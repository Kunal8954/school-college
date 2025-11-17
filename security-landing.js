// Security Landing Page - Advanced AI Animations

// ===== LANDING NAVBAR FUNCTIONALITY =====
document.addEventListener('DOMContentLoaded', function() {
    const navbar = document.querySelector('.landing-navbar');
    const mobileMenuBtn = document.querySelector('.landing-mobile-menu-btn');
    const navLinks = document.querySelector('.landing-nav-links');
    const mobileOverlay = document.querySelector('.landing-mobile-overlay');
    const allNavLinks = document.querySelectorAll('.landing-nav-link');

    // Navbar scroll effect
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Mobile menu toggle
    if (mobileMenuBtn && navLinks) {
        mobileMenuBtn.addEventListener('click', function() {
            mobileMenuBtn.classList.toggle('active');
            navLinks.classList.toggle('active');
            mobileOverlay.classList.toggle('active');
            document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : '';
        });
    }

    // Close menu when clicking overlay
    if (mobileOverlay) {
        mobileOverlay.addEventListener('click', function() {
            mobileMenuBtn.classList.remove('active');
            navLinks.classList.remove('active');
            mobileOverlay.classList.remove('active');
            document.body.style.overflow = '';
        });
    }

    // Close menu when clicking a nav link
    allNavLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            if (link.getAttribute('href').startsWith('#')) {
                e.preventDefault();
                const target = document.querySelector(link.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }
            
            if (window.innerWidth <= 968) {
                mobileMenuBtn.classList.remove('active');
                navLinks.classList.remove('active');
                mobileOverlay.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    });
});

// ===== PARTICLE CANVAS ANIMATION =====
class ParticleSystem {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.particles = [];
        this.connections = [];
        this.mouse = { x: null, y: null, radius: 150 };
        
        this.resize();
        this.init();
        this.animate();
        
        window.addEventListener('resize', () => this.resize());
        window.addEventListener('mousemove', (e) => this.handleMouseMove(e));
    }
    
    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    
    init() {
        const particleCount = Math.floor((this.canvas.width * this.canvas.height) / 15000);
        this.particles = [];
        
        for (let i = 0; i < particleCount; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                size: Math.random() * 2 + 1,
                color: this.getRandomColor()
            });
        }
    }
    
    getRandomColor() {
        const colors = [
            'rgba(59, 130, 246, 0.6)',   // Blue
            'rgba(139, 92, 246, 0.6)',   // Purple
            'rgba(16, 185, 129, 0.6)',   // Green
            'rgba(6, 182, 212, 0.6)'     // Cyan
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }
    
    handleMouseMove(e) {
        this.mouse.x = e.clientX;
        this.mouse.y = e.clientY;
    }
    
    update() {
        this.particles.forEach(particle => {
            // Update position
            particle.x += particle.vx;
            particle.y += particle.vy;
            
            // Bounce off edges
            if (particle.x < 0 || particle.x > this.canvas.width) {
                particle.vx *= -1;
            }
            if (particle.y < 0 || particle.y > this.canvas.height) {
                particle.vy *= -1;
            }
            
            // Mouse interaction
            if (this.mouse.x !== null && this.mouse.y !== null) {
                const dx = this.mouse.x - particle.x;
                const dy = this.mouse.y - particle.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < this.mouse.radius) {
                    const force = (this.mouse.radius - distance) / this.mouse.radius;
                    particle.vx -= (dx / distance) * force * 0.2;
                    particle.vy -= (dy / distance) * force * 0.2;
                }
            }
            
            // Velocity damping
            particle.vx *= 0.99;
            particle.vy *= 0.99;
        });
    }
    
    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw connections
        this.particles.forEach((p1, i) => {
            this.particles.slice(i + 1).forEach(p2 => {
                const dx = p1.x - p2.x;
                const dy = p1.y - p2.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 150) {
                    this.ctx.beginPath();
                    this.ctx.strokeStyle = `rgba(59, 130, 246, ${0.2 * (1 - distance / 150)})`;
                    this.ctx.lineWidth = 1;
                    this.ctx.moveTo(p1.x, p1.y);
                    this.ctx.lineTo(p2.x, p2.y);
                    this.ctx.stroke();
                }
            });
        });
        
        // Draw particles
        this.particles.forEach(particle => {
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fillStyle = particle.color;
            this.ctx.fill();
            
            // Glow effect
            this.ctx.shadowBlur = 10;
            this.ctx.shadowColor = particle.color;
            this.ctx.fill();
            this.ctx.shadowBlur = 0;
        });
    }
    
    animate() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.animate());
    }
}

// ===== SCROLL ANIMATIONS =====
class ScrollAnimations {
    constructor() {
        this.observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        this.observer = new IntersectionObserver(
            (entries) => this.handleIntersection(entries),
            this.observerOptions
        );
        
        this.init();
    }
    
    init() {
        // Observe feature cards
        document.querySelectorAll('.feature-card').forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(30px)';
            card.style.transition = `all 0.6s ease ${index * 0.1}s`;
            this.observer.observe(card);
        });
        
        // Observe other animated elements
        const animatedElements = [
            '.guarantee-item',
            '.pricing-feature',
            '.step-card',
            '.trust-badge'
        ];
        
        animatedElements.forEach(selector => {
            document.querySelectorAll(selector).forEach((el, index) => {
                el.style.opacity = '0';
                el.style.transform = 'translateY(20px)';
                el.style.transition = `all 0.5s ease ${index * 0.08}s`;
                this.observer.observe(el);
            });
        });
    }
    
    handleIntersection(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }
}

// ===== AI SECURITY SCANNER =====
class SecurityScanner {
    constructor() {
        this.scannerElement = document.querySelector('.security-scan-line');
        this.lockElement = document.querySelector('.shield-lock');
        this.isScanning = false;
        
        this.startScan();
    }
    
    startScan() {
        setInterval(() => {
            if (!this.isScanning) {
                this.runScan();
            }
        }, 5000);
    }
    
    runScan() {
        this.isScanning = true;
        
        // Pulse the lock
        if (this.lockElement) {
            this.lockElement.style.animation = 'none';
            setTimeout(() => {
                this.lockElement.style.animation = 'lock-float 4s ease-in-out infinite, lock-pulse 0.5s ease-out';
            }, 10);
        }
        
        setTimeout(() => {
            this.isScanning = false;
        }, 3000);
    }
}

// ===== MOBILE MENU =====
class MobileMenu {
    constructor() {
        this.menuBtn = document.getElementById('mobileMenuBtn');
        this.navLinks = document.querySelector('.nav-links');
        this.isOpen = false;
        
        if (this.menuBtn) {
            this.menuBtn.addEventListener('click', () => this.toggle());
        }
    }
    
    toggle() {
        this.isOpen = !this.isOpen;
        
        if (this.isOpen) {
            this.open();
        } else {
            this.close();
        }
    }
    
    open() {
        this.navLinks.style.display = 'flex';
        this.navLinks.style.flexDirection = 'column';
        this.navLinks.style.position = 'absolute';
        this.navLinks.style.top = '70px';
        this.navLinks.style.right = '0';
        this.navLinks.style.background = 'white';
        this.navLinks.style.padding = '1rem';
        this.navLinks.style.borderRadius = '8px';
        this.navLinks.style.boxShadow = '0 10px 30px rgba(0,0,0,0.2)';
        this.navLinks.style.zIndex = '999';
        
        // Animate menu button
        const spans = this.menuBtn.querySelectorAll('span');
        spans[0].style.transform = 'rotate(45deg) translateY(8px)';
        spans[1].style.opacity = '0';
        spans[2].style.transform = 'rotate(-45deg) translateY(-8px)';
    }
    
    close() {
        this.navLinks.style.display = '';
        
        // Reset menu button
        const spans = this.menuBtn.querySelectorAll('span');
        spans[0].style.transform = '';
        spans[1].style.opacity = '';
        spans[2].style.transform = '';
    }
}

// ===== COUNTER ANIMATION =====
class CounterAnimation {
    constructor(element, targetNumber, duration = 2000) {
        this.element = element;
        this.targetNumber = targetNumber;
        this.duration = duration;
        this.startTime = null;
        
        this.observe();
    }
    
    observe() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animate();
                    observer.unobserve(this.element);
                }
            });
        }, { threshold: 0.5 });
        
        observer.observe(this.element);
    }
    
    animate() {
        const animate = (currentTime) => {
            if (!this.startTime) this.startTime = currentTime;
            const progress = (currentTime - this.startTime) / this.duration;
            
            if (progress < 1) {
                const current = Math.floor(this.targetNumber * this.easeOutQuad(progress));
                this.element.textContent = this.formatNumber(current);
                requestAnimationFrame(animate);
            } else {
                this.element.textContent = this.formatNumber(this.targetNumber);
            }
        };
        
        requestAnimationFrame(animate);
    }
    
    easeOutQuad(t) {
        return t * (2 - t);
    }
    
    formatNumber(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(0) + 'K';
        }
        return num.toString();
    }
}

// ===== FLOATING BADGES ANIMATION =====
class FloatingBadges {
    constructor() {
        this.badges = document.querySelectorAll('.floating-badge');
        this.init();
    }
    
    init() {
        this.badges.forEach((badge, index) => {
            // Random float animation
            const floatDuration = 3 + Math.random() * 2;
            const floatDelay = index * 0.5;
            badge.style.animation = `badge-float ${floatDuration}s ease-in-out ${floatDelay}s infinite`;
            
            // Hover interaction
            badge.addEventListener('mouseenter', () => {
                badge.style.transform = 'translateY(-10px) scale(1.1)';
                badge.style.transition = 'transform 0.3s ease';
            });
            
            badge.addEventListener('mouseleave', () => {
                badge.style.transform = '';
            });
        });
    }
}

// ===== SMOOTH SCROLL =====
class SmoothScroll {
    constructor() {
        this.init();
    }
    
    init() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                const href = anchor.getAttribute('href');
                if (href === '#' || !href) return;
                
                const target = document.querySelector(href);
                if (target) {
                    e.preventDefault();
                    const offsetTop = target.offsetTop - 80;
                    
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }
}

// ===== NAVBAR SCROLL EFFECT =====
class NavbarScroll {
    constructor() {
        this.navbar = document.querySelector('.navbar');
        this.lastScroll = 0;
        
        this.init();
    }
    
    init() {
        window.addEventListener('scroll', () => {
            const currentScroll = window.pageYOffset;
            
            if (currentScroll > 100) {
                this.navbar.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)';
                this.navbar.style.background = 'rgba(255, 255, 255, 0.98)';
            } else {
                this.navbar.style.boxShadow = '';
                this.navbar.style.background = 'rgba(255, 255, 255, 0.95)';
            }
            
            this.lastScroll = currentScroll;
        });
    }
}

// ===== TYPING ANIMATION =====
class TypingAnimation {
    constructor(element, texts, speed = 100) {
        this.element = element;
        this.texts = texts;
        this.speed = speed;
        this.textIndex = 0;
        this.charIndex = 0;
        this.isDeleting = false;
        
        if (this.element) {
            this.type();
        }
    }
    
    type() {
        const currentText = this.texts[this.textIndex];
        
        if (this.isDeleting) {
            this.element.textContent = currentText.substring(0, this.charIndex - 1);
            this.charIndex--;
        } else {
            this.element.textContent = currentText.substring(0, this.charIndex + 1);
            this.charIndex++;
        }
        
        let typeSpeed = this.speed;
        
        if (this.isDeleting) {
            typeSpeed /= 2;
        }
        
        if (!this.isDeleting && this.charIndex === currentText.length) {
            typeSpeed = 2000;
            this.isDeleting = true;
        } else if (this.isDeleting && this.charIndex === 0) {
            this.isDeleting = false;
            this.textIndex = (this.textIndex + 1) % this.texts.length;
            typeSpeed = 500;
        }
        
        setTimeout(() => this.type(), typeSpeed);
    }
}

// ===== CURSOR TRAIL EFFECT =====
class CursorTrail {
    constructor() {
        this.particles = [];
        this.mouse = { x: null, y: null };
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        
        this.setupCanvas();
        this.init();
    }
    
    setupCanvas() {
        this.canvas.style.position = 'fixed';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.pointerEvents = 'none';
        this.canvas.style.zIndex = '9999';
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        document.body.appendChild(this.canvas);
        
        window.addEventListener('resize', () => {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        });
    }
    
    init() {
        window.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
            
            // Create new particle
            if (Math.random() < 0.3) {
                this.particles.push({
                    x: this.mouse.x,
                    y: this.mouse.y,
                    size: Math.random() * 3 + 1,
                    speedX: (Math.random() - 0.5) * 2,
                    speedY: (Math.random() - 0.5) * 2,
                    life: 1
                });
            }
        });
        
        this.animate();
    }
    
    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Update and draw particles
        this.particles = this.particles.filter(particle => {
            particle.x += particle.speedX;
            particle.y += particle.speedY;
            particle.life -= 0.02;
            
            if (particle.life > 0) {
                this.ctx.beginPath();
                this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                this.ctx.fillStyle = `rgba(59, 130, 246, ${particle.life * 0.5})`;
                this.ctx.fill();
                return true;
            }
            return false;
        });
        
        requestAnimationFrame(() => this.animate());
    }
}

// ===== PARALLAX EFFECT =====
class ParallaxEffect {
    constructor() {
        this.elements = document.querySelectorAll('.gradient-orb');
        this.init();
    }
    
    init() {
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            
            this.elements.forEach((el, index) => {
                const speed = 0.1 + (index * 0.05);
                const yPos = -(scrolled * speed);
                el.style.transform = `translateY(${yPos}px)`;
            });
        });
    }
}

// ===== INITIALIZE EVERYTHING =====
document.addEventListener('DOMContentLoaded', () => {
    // Initialize particle system
    const canvas = document.getElementById('particleCanvas');
    if (canvas) {
        new ParticleSystem(canvas);
    }
    
    // Initialize scroll animations
    new ScrollAnimations();
    
    // Initialize security scanner
    new SecurityScanner();
    
    // Initialize mobile menu
    new MobileMenu();
    
    // Initialize floating badges
    new FloatingBadges();
    
    // Initialize smooth scroll
    new SmoothScroll();
    
    // Initialize navbar scroll effect
    new NavbarScroll();
    
    // Initialize cursor trail (optional, can be disabled for performance)
    // new CursorTrail();
    
    // Initialize parallax effect
    new ParallaxEffect();
    
    // Initialize counters (example: for user count)
    const userCountElement = document.querySelector('.trust-badge-top span');
    if (userCountElement) {
        const text = userCountElement.textContent;
        const match = text.match(/(\d+)/);
        if (match) {
            const targetNumber = parseInt(match[1]) * 1000; // 500,000
            // Note: This would replace the text, so commenting out
            // new CounterAnimation(userCountElement, targetNumber);
        }
    }
    
    // Add pulse animation to CTA buttons on hover
    document.querySelectorAll('.cta-primary, .cta-btn-primary').forEach(btn => {
        btn.addEventListener('mouseenter', function() {
            this.style.animation = 'pulse-scale 0.6s ease';
        });
        
        btn.addEventListener('animationend', function() {
            this.style.animation = '';
        });
    });
    
    // Add ripple effect to buttons
    document.querySelectorAll('a[class*="cta"], a[class*="btn"]').forEach(button => {
        button.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.className = 'ripple-effect';
            
            this.appendChild(ripple);
            
            setTimeout(() => ripple.remove(), 600);
        });
    });
    
    // Console welcome message
    console.log('%c🎓 College Finder - AI Matching System Active', 'color: #3b82f6; font-size: 20px; font-weight: bold;');
    console.log('%cDiscover your perfect college match with advanced AI.', 'color: #10b981; font-size: 14px;');
});

// Add dynamic CSS for ripple effect
const style = document.createElement('style');
style.textContent = `
    @keyframes pulse-scale {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.05); }
    }
    
    .ripple-effect {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.6);
        transform: scale(0);
        animation: ripple-animation 0.6s ease-out;
        pointer-events: none;
    }
    
    @keyframes ripple-animation {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
    
    @keyframes lock-pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.1); }
    }
`;
document.head.appendChild(style);

// ===== PERFORMANCE MONITORING =====
if ('PerformanceObserver' in window) {
    const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
            if (entry.entryType === 'paint') {
                console.log(`${entry.name}: ${entry.startTime.toFixed(2)}ms`);
            }
        }
    });
    
    observer.observe({ entryTypes: ['paint'] });
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        ParticleSystem,
        ScrollAnimations,
        SecurityScanner,
        MobileMenu,
        SmoothScroll
    };
}
