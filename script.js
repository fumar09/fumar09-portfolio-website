
// ===== NAVIGATION FUNCTIONALITY =====
class NavigationManager {
    constructor() {
        this.navbar = document.querySelector('.cyber-nav');
        this.navLinks = document.querySelectorAll('.nav-link');
        this.sections = document.querySelectorAll('section[id]');
        
        this.init();
    }
    
    init() {
        this.handleScroll();
        this.addSmoothScrolling();
        window.addEventListener('scroll', () => this.handleScroll());
    }
    
    handleScroll() {
        const scrolled = window.scrollY > 50;
        
        if (scrolled) {
            this.navbar.style.background = 'rgba(10, 15, 10, 0.98)';
            this.navbar.style.backdropFilter = 'blur(20px)';
        } else {
            this.navbar.style.background = 'rgba(10, 15, 10, 0.95)';
            this.navbar.style.backdropFilter = 'blur(15px)';
        }
        
        // Update active nav link
        this.updateActiveNavLink();
    }
    
    updateActiveNavLink() {
        let current = '';
        
        this.sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            
            if (window.scrollY >= sectionTop - 200) {
                current = section.getAttribute('id');
            }
        });
        
        this.navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    }
    
    addSmoothScrolling() {
        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                
                if (href.startsWith('#')) {
                    e.preventDefault();
                    const target = document.querySelector(href);
                    
                    if (target) {
                        const offsetTop = target.offsetTop - 80;
                        
                        window.scrollTo({
                            top: offsetTop,
                            behavior: 'smooth'
                        });
                    }
                }
            });
        });
    }
}

// ===== ANIMATION MANAGER =====
class AnimationManager {
    constructor() {
        this.observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        this.init();
    }
    
    init() {
        this.setupIntersectionObserver();
        this.animateSkillBars();
        this.setupTypewriterEffect();
        this.setupParallaxEffect();
    }
    
    setupIntersectionObserver() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                    
                    // Trigger skill bar animations
                    if (entry.target.classList.contains('skill-card')) {
                        this.animateSkillBar(entry.target);
                    }
                }
            });
        }, this.observerOptions);
        
        // Observe elements for animation
        const animateElements = document.querySelectorAll('.project-card, .skill-card, .about-content, .contact-form-wrapper');
        animateElements.forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            el.style.transition = 'all 0.6s ease';
            observer.observe(el);
        });
        
        // Add CSS for animate-in class
        const style = document.createElement('style');
        style.textContent = `
            .animate-in {
                opacity: 1 !important;
                transform: translateY(0) !important;
            }
        `;
        document.head.appendChild(style);
    }
    
    animateSkillBars() {
        const skillBars = document.querySelectorAll('.skill-bar');
        
        skillBars.forEach(bar => {
            const level = bar.getAttribute('data-level');
            bar.style.width = '0%';
            
            setTimeout(() => {
                bar.style.width = `${level}%`;
            }, 500);
        });
    }
    
    animateSkillBar(skillCard) {
        const skillBar = skillCard.querySelector('.skill-bar');
        if (skillBar && !skillBar.classList.contains('animated')) {
            const level = skillBar.getAttribute('data-level');
            skillBar.style.width = `${level}%`;
            skillBar.classList.add('animated');
        }
    }
    
    setupTypewriterEffect() {
        const subtitle = document.querySelector('.hero-subtitle');
        if (subtitle) {
            const text = subtitle.textContent;
            subtitle.textContent = '';
            subtitle.style.borderRight = '2px solid var(--primary-green)';
            
            let i = 0;
            const typeWriter = () => {
                if (i < text.length) {
                    subtitle.textContent += text.charAt(i);
                    i++;
                    setTimeout(typeWriter, 100);
                } else {
                    // Remove cursor after typing
                    setTimeout(() => {
                        subtitle.style.borderRight = 'none';
                    }, 1000);
                }
            };
            
            // Start typing after a delay
            setTimeout(typeWriter, 1000);
        }
    }
    
    setupParallaxEffect() {
        const parallaxElements = document.querySelectorAll('.cyber-grid, .hero-image');
        
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const rate = scrolled * -0.5;
            
            parallaxElements.forEach(element => {
                if (element.classList.contains('cyber-grid')) {
                    element.style.transform = `translate(${rate * 0.1}px, ${rate * 0.1}px)`;
                } else if (element.classList.contains('hero-image')) {
                    element.style.transform = `translateY(${rate * 0.2}px)`;
                }
            });
        });
    }
}

// ===== FORM HANDLER =====
class FormHandler {
    constructor() {
        this.contactForm = document.querySelector('.contact-form');
        this.init();
    }
    
    init() {
        if (this.contactForm) {
            this.contactForm.addEventListener('submit', (e) => this.handleSubmit(e));
        }
    }
    
    handleSubmit(e) {
        e.preventDefault();
        
        // Get form data
        const formData = new FormData(this.contactForm);
        const data = Object.fromEntries(formData);
        
        // Show loading state
        const submitBtn = this.contactForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
        submitBtn.disabled = true;
        
        // Simulate form submission (replace with actual form handling)
        setTimeout(() => {
            // Show success message
            this.showNotification('Message sent successfully!', 'success');
            
            // Reset form
            this.contactForm.reset();
            
            // Reset button
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }, 2000);
    }
    
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;
        
        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: var(--bg-card);
            color: var(--primary-green);
            padding: 1rem 1.5rem;
            border: 1px solid var(--border-color);
            border-radius: 4px;
            box-shadow: 0 4px 20px var(--shadow-glow);
            z-index: 9999;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Remove after delay
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
}

// ===== CURSOR EFFECTS =====
class CursorEffects {
    constructor() {
        this.cursor = null;
        this.cursorFollower = null;
        this.init();
    }
    
    init() {
        this.createCursor();
        this.addCursorEvents();
    }
    
    createCursor() {
        // Create custom cursor
        this.cursor = document.createElement('div');
        this.cursor.className = 'custom-cursor';
        this.cursor.style.cssText = `
            position: fixed;
            width: 10px;
            height: 10px;
            background: var(--primary-green);
            border-radius: 50%;
            pointer-events: none;
            z-index: 9999;
            mix-blend-mode: difference;
            transition: transform 0.1s ease;
        `;
        
        this.cursorFollower = document.createElement('div');
        this.cursorFollower.className = 'cursor-follower';
        this.cursorFollower.style.cssText = `
            position: fixed;
            width: 40px;
            height: 40px;
            border: 1px solid var(--primary-green);
            border-radius: 50%;
            pointer-events: none;
            z-index: 9998;
            transition: transform 0.2s ease;
            opacity: 0.5;
        `;
        
        document.body.appendChild(this.cursor);
        document.body.appendChild(this.cursorFollower);
    }
    
    addCursorEvents() {
        document.addEventListener('mousemove', (e) => {
            this.cursor.style.left = e.clientX - 5 + 'px';
            this.cursor.style.top = e.clientY - 5 + 'px';
            
            this.cursorFollower.style.left = e.clientX - 20 + 'px';
            this.cursorFollower.style.top = e.clientY - 20 + 'px';
        });
        
        // Add hover effects
        const hoverElements = document.querySelectorAll('a, button, .project-card, .skill-card');
        
        hoverElements.forEach(element => {
            element.addEventListener('mouseenter', () => {
                this.cursor.style.transform = 'scale(1.5)';
                this.cursorFollower.style.transform = 'scale(1.5)';
            });
            
            element.addEventListener('mouseleave', () => {
                this.cursor.style.transform = 'scale(1)';
                this.cursorFollower.style.transform = 'scale(1)';
            });
        });
        
        // Hide cursor when leaving window
        document.addEventListener('mouseleave', () => {
            this.cursor.style.opacity = '0';
            this.cursorFollower.style.opacity = '0';
        });
        
        document.addEventListener('mouseenter', () => {
            this.cursor.style.opacity = '1';
            this.cursorFollower.style.opacity = '0.5';
        });
    }
}

// ===== PARTICLE SYSTEM =====
class ParticleSystem {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.particles = [];
        this.mouseX = 0;
        this.mouseY = 0;
        
        this.init();
    }
    
    init() {
        this.createCanvas();
        this.createParticles();
        this.addEventListeners();
        this.animate();
    }
    
    createCanvas() {
        this.canvas = document.createElement('canvas');
        this.canvas.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 1;
            opacity: 0.3;
        `;
        
        this.ctx = this.canvas.getContext('2d');
        document.body.appendChild(this.canvas);
        
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
    }
    
    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    
    createParticles() {
        const particleCount = 50;
        
        for (let i = 0; i < particleCount; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                size: Math.random() * 2 + 1,
                opacity: Math.random() * 0.5 + 0.2
            });
        }
    }
    
    addEventListeners() {
        document.addEventListener('mousemove', (e) => {
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
        });
    }
    
    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.particles.forEach(particle => {
            // Update position
            particle.x += particle.vx;
            particle.y += particle.vy;
            
            // Mouse interaction
            const dx = this.mouseX - particle.x;
            const dy = this.mouseY - particle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 100) {
                const force = (100 - distance) / 100;
                particle.vx += dx * force * 0.0001;
                particle.vy += dy * force * 0.0001;
            }
            
            // Wrap around edges
            if (particle.x < 0) particle.x = this.canvas.width;
            if (particle.x > this.canvas.width) particle.x = 0;
            if (particle.y < 0) particle.y = this.canvas.height;
            if (particle.y > this.canvas.height) particle.y = 0;
            
            // Draw particle
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(0, 255, 136, ${particle.opacity})`;
            this.ctx.fill();
            
            // Draw connections
            this.particles.forEach(otherParticle => {
                const dx = particle.x - otherParticle.x;
                const dy = particle.y - otherParticle.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 80) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(particle.x, particle.y);
                    this.ctx.lineTo(otherParticle.x, otherParticle.y);
                    this.ctx.strokeStyle = `rgba(0, 255, 136, ${0.2 * (80 - distance) / 80})`;
                    this.ctx.lineWidth = 0.5;
                    this.ctx.stroke();
                }
            });
        });
        
        requestAnimationFrame(() => this.animate());
    }
}

// ===== PERFORMANCE OPTIMIZATION =====
class PerformanceOptimizer {
    constructor() {
        this.init();
    }
    
    init() {
        this.lazyLoadImages();
        this.debounceScrollEvents();
        this.preloadCriticalResources();
    }
    
    lazyLoadImages() {
        const images = document.querySelectorAll('img[data-src]');
        
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    observer.unobserve(img);
                }
            });
        });
        
        images.forEach(img => imageObserver.observe(img));
    }
    
    debounceScrollEvents() {
        let ticking = false;
        
        const updateOnScroll = () => {
            // Scroll-dependent updates here
            ticking = false;
        };
        
        const requestTick = () => {
            if (!ticking) {
                requestAnimationFrame(updateOnScroll);
                ticking = true;
            }
        };
        
        window.addEventListener('scroll', requestTick);
    }
    
    preloadCriticalResources() {
        // Preload critical fonts
        const fontPreload = document.createElement('link');
        fontPreload.rel = 'preload';
        fontPreload.href = 'https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&display=swap';
        fontPreload.as = 'style';
        document.head.appendChild(fontPreload);
    }
}

// ===== ACCESSIBILITY ENHANCEMENTS =====
class AccessibilityEnhancer {
    constructor() {
        this.init();
    }
    
    init() {
        this.addKeyboardNavigation();
        this.addFocusIndicators();
        this.addSkipLinks();
        this.handleReducedMotion();
    }
    
    addKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                document.body.classList.add('keyboard-navigation');
            }
        });
        
        document.addEventListener('mousedown', () => {
            document.body.classList.remove('keyboard-navigation');
        });
    }
    
    addFocusIndicators() {
        const style = document.createElement('style');
        style.textContent = `
            .keyboard-navigation *:focus {
                outline: 2px solid var(--primary-green) !important;
                outline-offset: 2px !important;
            }
        `;
        document.head.appendChild(style);
    }
    
    addSkipLinks() {
        const skipLink = document.createElement('a');
        skipLink.href = '#main';
        skipLink.textContent = 'Skip to main content';
        skipLink.className = 'skip-link';
        skipLink.style.cssText = `
            position: absolute;
            top: -40px;
            left: 6px;
            background: var(--primary-green);
            color: var(--bg-primary);
            padding: 8px 16px;
            text-decoration: none;
            z-index: 10000;
            transition: top 0.3s ease;
        `;
        
        skipLink.addEventListener('focus', () => {
            skipLink.style.top = '6px';
        });
        
        skipLink.addEventListener('blur', () => {
            skipLink.style.top = '-40px';
        });
        
        document.body.insertBefore(skipLink, document.body.firstChild);
    }
    
    handleReducedMotion() {
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
        
        if (prefersReducedMotion.matches) {
            document.body.classList.add('reduced-motion');
            
            const style = document.createElement('style');
            style.textContent = `
                .reduced-motion * {
                    animation-duration: 0.01ms !important;
                    animation-iteration-count: 1 !important;
                    transition-duration: 0.01ms !important;
                }
            `;
            document.head.appendChild(style);
        }
    }
}

// ===== ENHANCED INTRO LOADER MANAGER =====
class IntroLoader {
    constructor() {
        this.loader = document.querySelector('.intro-loader');
        this.progressBar = document.getElementById('loadingProgress');
        this.progressPercent = document.getElementById('progressPercent');
        this.systemMessages = document.getElementById('systemMessages');
        this.duration = 4500; // 4.5 seconds for more realistic loading
        this.currentProgress = 0;
        this.currentMessageIndex = 0;
        
        this.messages = [
            '► Booting neural interface...',
            '► Loading quantum processors...',
            '► Establishing secure connection...',
            '► Initializing display...',
            '► Calibrating biometric sensors...',
            '► Activating AI assistance modules...',
            '► Synchronizing data streams...',
            '► Finalizing system startup...',
            '► Ready for deployment!'
        ];
        
        this.statusElements = {
            cpu: document.getElementById('cpuStatus'),
            memory: document.getElementById('memoryStatus'),
            graphics: document.getElementById('graphicsStatus'),
            network: document.getElementById('networkStatus')
        };
        
        this.init();
    }
    
    init() {
        this.startLoading();
    }
    
    startLoading() {
        // Start progress animation
        this.animateProgress();
        
        // Start system messages
        this.updateSystemMessages();
        
        // Update status indicators
        this.updateStatusIndicators();
        
        // Hide loader when complete
        setTimeout(() => {
            this.hideLoader();
        }, this.duration);
    }
    
    animateProgress() {
        const progressInterval = setInterval(() => {
            if (this.currentProgress < 100) {
                // Simulate realistic loading with varying speeds
                const increment = Math.random() * 8 + 2; // 2-10% increments
                this.currentProgress = Math.min(100, this.currentProgress + increment);
                
                this.progressBar.style.width = this.currentProgress + '%';
                this.progressPercent.textContent = Math.floor(this.currentProgress) + '%';
            } else {
                clearInterval(progressInterval);
            }
        }, 200); // Update every 200ms
    }
    
    updateSystemMessages() {
        const messageInterval = setInterval(() => {
            if (this.currentMessageIndex < this.messages.length) {
                // Fade out current message smoothly
                const currentMessage = this.systemMessages.querySelector('.system-message');
                if (currentMessage) {
                    currentMessage.classList.add('fade-out');
                    setTimeout(() => {
                        if (currentMessage.parentNode) {
                            currentMessage.remove();
                        }
                    }, 600);
                }
                
                // Add new message with enhanced fade-in
                setTimeout(() => {
                    const newMessage = document.createElement('div');
                    newMessage.className = 'system-message';
                    newMessage.textContent = this.messages[this.currentMessageIndex];
                    this.systemMessages.appendChild(newMessage);
                    
                    // Trigger smooth fade-in with slight delay for better effect
                    setTimeout(() => {
                        newMessage.classList.add('fade-in');
                    }, 50);
                    
                    this.currentMessageIndex++;
                }, 200);
            } else {
                clearInterval(messageInterval);
            }
        }, 600); // Slightly slower for smoother transitions
    }
    
    updateStatusIndicators() {
        // CPU Status
        setTimeout(() => {
            this.statusElements.cpu.textContent = 'ACTIVE';
            this.statusElements.cpu.classList.add('complete');
        }, 800);
        
        // Memory Status
        setTimeout(() => {
            this.statusElements.memory.textContent = 'READY';
            this.statusElements.memory.classList.add('complete');
        }, 1500);
        
        // Graphics Status
        setTimeout(() => {
            this.statusElements.graphics.textContent = 'ONLINE';
            this.statusElements.graphics.classList.add('complete');
        }, 2200);
        
        // Network Status
        setTimeout(() => {
            this.statusElements.network.textContent = 'SECURED';
            this.statusElements.network.classList.add('complete');
        }, 3000);
    }
    
    hideLoader() {
        this.loader.classList.add('fade-out');
        
        // Remove loader after animation
        setTimeout(() => {
            this.loader.remove();
            this.startPageAnimations();
        }, 1000);
    }
    
    startPageAnimations() {
        // Start hero section animations
        const heroContent = document.querySelector('.hero-content');
        const heroImage = document.querySelector('.hero-image');
        const fadeUpElements = document.querySelectorAll('.animate-fade-up');
        
        if (heroContent) {
            heroContent.classList.add('loaded');
        }
        
        if (heroImage) {
            setTimeout(() => {
                heroImage.classList.add('animate-in');
            }, 500);
        }
        
        // Animate fade-up elements with delays
        fadeUpElements.forEach((element, index) => {
            const delay = element.dataset.delay || (index * 200);
            setTimeout(() => {
                element.classList.add('loaded');
            }, parseInt(delay));
        });
    }
}

// ===== ENHANCED ANIMATION MANAGER =====
class EnhancedAnimationManager extends AnimationManager {
    constructor() {
        super();
        this.setupEnhancedScrollAnimations();
        this.setupCountUpAnimations();
        this.setupFloatingParticles();
    }
    
    setupEnhancedScrollAnimations() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const element = entry.target;
                    const delay = element.dataset.delay || 0;
                    
                    setTimeout(() => {
                        element.classList.add('animate-in');
                        
                        // Handle specific animations
                        this.handleSpecificAnimations(element);
                    }, parseInt(delay));
                    
                    observer.unobserve(element);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });
        
        // Observe all scroll-animate elements
        const scrollElements = document.querySelectorAll('.scroll-animate');
        scrollElements.forEach(el => observer.observe(el));
    }
    
    handleSpecificAnimations(element) {
        const animation = element.dataset.animation;
        
        switch(animation) {
            case 'countUp':
                this.animateCountUp(element);
                break;
            case 'fadeInUp':
            case 'fadeInLeft':
            case 'fadeInRight':
                this.addFloatingEffect(element);
                break;
        }
    }
    
    animateCountUp(element) {
        const numberElement = element.querySelector('.stat-number');
        if (numberElement) {
            const targetValue = parseInt(numberElement.dataset.count) || 0;
            let currentValue = 0;
            const increment = targetValue / 50; // 50 steps
            const duration = 2000; // 2 seconds
            const stepTime = duration / 50;
            
            const updateNumber = () => {
                currentValue += increment;
                if (currentValue >= targetValue) {
                    numberElement.textContent = targetValue + (targetValue > 10 ? '+' : '');
                } else {
                    numberElement.textContent = Math.floor(currentValue);
                    setTimeout(updateNumber, stepTime);
                }
            };
            
            updateNumber();
        }
    }
    
    addFloatingEffect(element) {
        // Add subtle floating animation to animated elements
        element.style.animation = 'float 6s ease-in-out infinite';
        element.style.animationDelay = Math.random() * 2 + 's';
    }
    
    setupFloatingParticles() {
        const heroSection = document.querySelector('.hero-section');
        if (heroSection) {
            for (let i = 0; i < 15; i++) {
                this.createFloatingParticle(heroSection);
            }
        }
    }
    
    createFloatingParticle(container) {
        const particle = document.createElement('div');
        particle.className = 'floating-particle';
        
        // Random positioning
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 6 + 's';
        particle.style.animationDuration = (Math.random() * 4 + 4) + 's';
        
        container.appendChild(particle);
        
        // Remove and recreate after animation
        setTimeout(() => {
            if (particle.parentNode) {
                particle.remove();
                this.createFloatingParticle(container);
            }
        }, 10000);
    }
}

// ===== PROFILE PICTURE ANIMATION =====
class ProfileAnimation {
    constructor() {
        this.profileContainer = document.querySelector('.animate-profile');
        this.profileImage = document.querySelector('.profile-image');
        this.init();
    }
    
    init() {
        if (this.profileContainer) {
            this.setupProfileAnimation();
            this.addHoverEffects();
        }
    }
    
    setupProfileAnimation() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        entry.target.classList.add('animate-in');
                    }, 800); // Delay for dramatic effect
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.3 });
        
        observer.observe(this.profileContainer);
    }
    
    addHoverEffects() {
        if (this.profileImage) {
            this.profileImage.addEventListener('mouseenter', () => {
                this.profileImage.style.transform = 'scale(1.1) rotate(5deg)';
                this.profileImage.style.filter = 'brightness(1.3) contrast(1.4)';
            });
            
            this.profileImage.addEventListener('mouseleave', () => {
                this.profileImage.style.transform = 'scale(1) rotate(0deg)';
                this.profileImage.style.filter = 'brightness(1.1) contrast(1.2)';
            });
        }
    }
}

// ===== ENHANCED LOOPING TYPEWRITER EFFECT =====
class TypewriterEffect {
    constructor() {
        this.element = null;
        this.text = '';
        this.isTyping = false;
        this.isErasing = false;
        this.currentIndex = 0;
        this.typeSpeed = 100;
        this.eraseSpeed = 50;
        this.pauseAfterType = 3000;
        this.pauseAfterErase = 1000;
        this.setupTypewriter();
    }
    
    setupTypewriter() {
        this.element = document.querySelector('.animate-typewriter');
        if (this.element) {
            this.text = this.element.textContent;
            this.element.textContent = '';
            
            setTimeout(() => {
                this.startTypewriterLoop();
            }, 2000); // Start after intro loader
        }
    }
    
    startTypewriterLoop() {
        this.typeText();
    }
    
    typeText() {
        if (this.isTyping) return;
        
        this.isTyping = true;
        this.isErasing = false;
        this.element.style.borderRight = '2px solid var(--primary-green)';
        
        const type = () => {
            if (this.currentIndex < this.text.length) {
                this.element.textContent += this.text.charAt(this.currentIndex);
                this.currentIndex++;
                setTimeout(type, this.typeSpeed);
            } else {
                this.isTyping = false;
                // Pause after typing complete, then start erasing
                setTimeout(() => {
                    this.eraseText();
                }, this.pauseAfterType);
            }
        };
        
        type();
    }
    
    eraseText() {
        if (this.isErasing) return;
        
        this.isErasing = true;
        this.isTyping = false;
        
        const erase = () => {
            if (this.currentIndex > 0) {
                this.element.textContent = this.text.substring(0, this.currentIndex - 1);
                this.currentIndex--;
                setTimeout(erase, this.eraseSpeed);
            } else {
                this.isErasing = false;
                // Pause after erasing complete, then start typing again
                setTimeout(() => {
                    this.typeText();
                }, this.pauseAfterErase);
            }
        };
        
        erase();
    }
}



// ===== INITIALIZE EVERYTHING =====
document.addEventListener('DOMContentLoaded', () => {
    // Initialize intro loader first
    new IntroLoader();
    
    // Initialize all managers
    new NavigationManager();
    new EnhancedAnimationManager(); // Use enhanced version
    new FormHandler();
    new AccessibilityEnhancer();
    new PerformanceOptimizer();
    new ProfileAnimation();
    new TypewriterEffect();

    
    // Initialize cursor effects and particles only on desktop
    if (window.innerWidth > 768) {
        new CursorEffects();
        new ParticleSystem();
    }
    
    // Add page loaded class for final animations (after intro loader completes)
    setTimeout(() => {
        document.body.classList.add('page-loaded');
    }, 5500); // Wait for intro loader (4.5s) + fade out (1s) to complete
});

// ===== UTILITY FUNCTIONS =====
const utils = {
    // Debounce function
    debounce: (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    
    // Throttle function
    throttle: (func, limit) => {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },
    
    // Check if element is in viewport
    isInViewport: (element) => {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }
};

// Export utils for global use
window.portfolioUtils = utils; 