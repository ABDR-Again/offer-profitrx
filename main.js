document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. SETUP & UTILS ---
    // Initialize Smooth Scrolling (Lenis)
    // Register GSAP Plugin (do this first)
gsap.registerPlugin(ScrollTrigger);

// Lenis
const lenis = new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -7 * t)),
  smooth: true,
});

// Tell ScrollTrigger to update on Lenis scroll
lenis.on("scroll", ScrollTrigger.update);

// Use GSAP ticker to drive Lenis (time is in seconds -> convert to ms)
gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});

// Prevent GSAP ticker lag smoothing (keeps scroll-linked animation tight)
gsap.ticker.lagSmoothing(0);

    // --- 2. TEXT SPLIT REVEAL ---
    // Manual implementation to keep it lightweight (avoids SplitText paid plugin)
    document.querySelectorAll('.split-reveal').forEach(el => {
        const text = el.innerHTML;
        // Wrap content in a mask-container/mask-text structure for animation
        el.innerHTML = `<span class="mask-container"><span class="mask-text">${text}</span></span>`;
        
        gsap.to(el.querySelector('.mask-text'), {
            scrollTrigger: { 
                trigger: el, 
                start: "top 85%" 
            },
            y: 0,
            opacity: 1,
            duration: 1,
            ease: "power3.out"
        });
    });

    // --- 3. SMART NAVBAR ---
    let lastScroll = 0;
    const nav = document.getElementById('main-nav');
    
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        if (currentScroll > lastScroll && currentScroll > 100) {
            nav.classList.add('nav-hidden'); // Hide on scroll down
        } else {
            nav.classList.remove('nav-hidden'); // Show on scroll up
        }
        lastScroll = currentScroll;
    });

    // --- 4. HERO ANIMATIONS ---
    const tlHero = gsap.timeline({ delay: 0.5 });
    
    // Animate bullets
    tlHero.to('.hero-bullets li', { 
        opacity: 1, 
        x: 0, 
        stagger: 0.1, 
        duration: 0.8, 
        ease: "power2.out" 
    })
    // Animate trust line
    .to('.trust-line', { 
        opacity: 1, 
        duration: 1 
    }, "-=0.5")
    // Animate card
    .to('.hero-card', { 
        opacity: 1, 
        x: 0, 
        duration: 1, 
        ease: "power2.out" 
    }, "-=0.8");

    // --- 5. FOCUS MODE (SECTION 2) ---
    const patterns = document.querySelectorAll('.pattern-item');
    patterns.forEach(item => {
        ScrollTrigger.create({
            trigger: item,
            start: "top 60%", // When item hits center-ish viewport
            end: "bottom 40%",
            onEnter: () => item.classList.add('in-focus'),
            onLeave: () => item.classList.remove('in-focus'),
            onEnterBack: () => item.classList.add('in-focus'),
            onLeaveBack: () => item.classList.remove('in-focus')
        });
    });

    // --- 6. CHECKLIST DRAWING ---
    document.querySelectorAll('.checklist-item').forEach(item => {
        ScrollTrigger.create({
            trigger: item,
            start: "top 80%",
            onEnter: () => item.classList.add('draw-active')
        });
    });

    // --- 7. BENTO TILT (3D) ---
    const cards = document.querySelectorAll('.bento-card');
    
    // Reveal animation
    gsap.to(cards, {
        scrollTrigger: { 
            trigger: '#deliverables', 
            start: "top 70%" 
        },
        opacity: 1,
        y: 0,
        stagger: 0.1,
        duration: 0.8,
        ease: "power2.out"
    });

    // Tilt Interaction
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = ((y - centerY) / centerY) * -5; // Max 5deg tilt
            const rotateY = ((x - centerX) / centerX) * 5;

            gsap.to(card, { 
                transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`, 
                duration: 0.2 
            });
        });
        card.addEventListener('mouseleave', () => {
            gsap.to(card, { 
                transform: `perspective(1000px) rotateX(0) rotateY(0)`, 
                duration: 0.5 
            });
        });
    });

    // --- 8. TIMELINE SCRUB ---
    gsap.to('.process-line-fill', {
        scrollTrigger: { 
            trigger: '.process-steps', 
            start: "top 60%", 
            end: "bottom 60%", 
            scrub: true 
        },
        width: "100%"
    });

    // --- 9. MAGNETIC BUTTON ---
    const magBtn = document.querySelector('.magnetic-btn');
    const magWrap = document.querySelector('.magnetic-wrap');
    
    if(magBtn && magWrap) {
        magWrap.addEventListener('mousemove', (e) => {
            const rect = magWrap.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width/2;
            const y = e.clientY - rect.top - rect.height/2;
            gsap.to(magBtn, { x: x * 0.3, y: y * 0.3, duration: 0.3 });
        });
        magWrap.addEventListener('mouseleave', () => {
            gsap.to(magBtn, { x: 0, y: 0, duration: 0.5, ease: "elastic.out(1, 0.5)" });
        });
    }

    // --- 10. FORM LOGIC ---
    let currentFirm = "";
    let mathAns = 0;

    // Initialize Captcha
    function initCaptcha() {
        const n1 = Math.floor(Math.random()*9)+1;
        const n2 = Math.floor(Math.random()*9)+1;
        mathAns = n1 + n2;
        const mathQ = document.getElementById('math-q');
        if(mathQ) mathQ.innerText = `${n1} + ${n2}`;
    }
    initCaptcha();

    // Hero Section selection logic
    const radioOptions = document.querySelectorAll('.radio-option');
    radioOptions.forEach(option => {
        option.addEventListener('click', function(e) {
            // Remove active from all
            radioOptions.forEach(r => r.classList.remove('active'));
            // Add active to clicked
            this.classList.add('active');
            
            // Animation class
            this.classList.add('click-bounce');
            setTimeout(() => this.classList.remove('click-bounce'), 300);
            
            // Get value from input inside label
            const input = this.querySelector('input');
            if(input) {
                currentFirm = input.value;
                input.checked = true;
                localStorage.setItem('firmType', currentFirm);
            }
        });
    });

    // Hero Button Click
    const startAppBtn = document.getElementById('start-app-btn');
    if(startAppBtn) {
        startAppBtn.addEventListener('click', () => {
            if(!currentFirm) return alert("Please select a firm type.");
            lenis.scrollTo('#application');
            const mainSelect = document.getElementById('mainServiceSelect');
            if(mainSelect) mainSelect.value = currentFirm;
        });
    }

    // Form Navigation
    function changeStep(stepNum) {
        // Hide all steps
        document.querySelectorAll('.form-step').forEach(s => s.classList.remove('active'));
        // Show target step
        document.getElementById('step'+stepNum).classList.add('active');
        
        // Update Progress Bar
        const prog = document.getElementById('progressBar');
        if(prog) {
            const width = stepNum === 1 ? '33%' : (stepNum === 2 ? '66%' : '100%');
            prog.style.width = width;
            prog.setAttribute('aria-valuenow', width.replace('%',''));
        }
    }

    // Handle "Next" Buttons
    document.querySelectorAll('[data-next]').forEach(btn => {
        btn.addEventListener('click', function() {
            const nextStepNum = this.getAttribute('data-next');
            const currentStepEl = this.closest('.form-step');
            
            // Validate inputs in current step
            const inputs = currentStepEl.querySelectorAll('input[required], textarea[required], select[required]');
            let valid = true;
            
            inputs.forEach(i => {
                if(!i.value) {
                    valid = false;
                    i.classList.add('shake-input'); // Shake on error
                    setTimeout(() => i.classList.remove('shake-input'), 500);
                }
            });
            
            if(valid) {
                changeStep(nextStepNum);
            }
        });
    });

    // Handle "Back" Buttons
    document.querySelectorAll('[data-prev]').forEach(btn => {
        btn.addEventListener('click', function() {
            changeStep(this.getAttribute('data-prev'));
        });
    });

    // --- 11. FORM SUBMISSION & MODALS ---
    const auditForm = document.getElementById('auditForm');
    const privacyModal = document.getElementById('privacy-modal');
    const thankYouModal = document.getElementById('thank-you-modal');
    const confirmSubmitBtn = document.getElementById('confirm-submit');
    const cancelModalBtn = document.getElementById('cancel-modal');

    if(auditForm) {
        auditForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Check Captcha
            const userMath = parseInt(document.getElementById('math-a').value);
            if(userMath !== mathAns) {
                alert("Incorrect math answer. Please try again.");
                return;
            }

            // Check Duplicates via LocalStorage
            const email = document.getElementById('emailInput').value;
            if(localStorage.getItem('subEmail') === email) {
                alert("Email already registered.");
                return;
            }

            // Show Privacy Modal
            privacyModal.style.display = 'flex';
        });
    }

    if(cancelModalBtn) {
        cancelModalBtn.addEventListener('click', () => {
            privacyModal.style.display = 'none';
        });
    }

    if(confirmSubmitBtn) {
        confirmSubmitBtn.addEventListener('click', async () => {
            const formData = new FormData(auditForm);
            
            // FORMSPREE ENDPOINT
            const ENDPOINT = "https://formspree.io/f/xzdzvvqq"; 

            try {
                // Change button text to indicate loading
                const originalText = confirmSubmitBtn.innerText;
                confirmSubmitBtn.innerText = "Sending...";
                confirmSubmitBtn.disabled = true;

                const res = await fetch(ENDPOINT, { 
                    method: 'POST', 
                    body: formData, 
                    headers: {'Accept': 'application/json'} 
                });
                
                if(res.ok) {
                    // Success Logic
                    localStorage.setItem('subEmail', document.getElementById('emailInput').value);
                    privacyModal.style.display = 'none';
                    auditForm.reset();
                    thankYouModal.style.display = 'flex';
                } else {
                    alert("There was an error submitting the form. Please try again.");
                }
            } catch(e) { 
                alert("Network error. Please try again."); 
            } finally {
                confirmSubmitBtn.innerText = "I Agree & Submit";
                confirmSubmitBtn.disabled = false;
            }
        });
    }

    // Load saved firm type if exists
    const savedFirm = localStorage.getItem('firmType');
    if(savedFirm) {
        const mainSelect = document.getElementById('mainServiceSelect');
        if(mainSelect) mainSelect.value = savedFirm;
    }
});