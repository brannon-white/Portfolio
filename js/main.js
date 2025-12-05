/* ══════════════════════════════════════
   Neural Network Canvas Animation
══════════════════════════════════════ */
class NeuralNetwork {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.nodes = [];
        this.numNodes = 70;
        this.threshold = 170;
        this.rafId = null;
        this.mouse = { x: -9999, y: -9999 };

        this.resize();
        this.buildNodes();

        window.addEventListener('resize', () => {
            this.resize();
            this.buildNodes();
        }, { passive: true });

        canvas.addEventListener('mousemove', e => {
            const r = canvas.getBoundingClientRect();
            this.mouse.x = e.clientX - r.left;
            this.mouse.y = e.clientY - r.top;
        });
        canvas.addEventListener('mouseleave', () => {
            this.mouse = { x: -9999, y: -9999 };
        });
    }

    resize() {
        this.canvas.width = this.canvas.offsetWidth;
        this.canvas.height = this.canvas.offsetHeight;
    }

    buildNodes() {
        this.nodes = Array.from({ length: this.numNodes }, () => ({
            x: Math.random() * this.canvas.width,
            y: Math.random() * this.canvas.height,
            vx: (Math.random() - 0.5) * 0.45,
            vy: (Math.random() - 0.5) * 0.45,
            r: Math.random() * 1.8 + 1.2,
            phase: Math.random() * Math.PI * 2,
            speed: 0.018 + Math.random() * 0.024,
        }));
    }

    update() {
        const { mouse, nodes } = this;
        nodes.forEach(n => {
            // Mouse attraction
            const dx = mouse.x - n.x;
            const dy = mouse.y - n.y;
            const d = Math.sqrt(dx * dx + dy * dy);
            if (d < 130 && d > 0) {
                const f = (130 - d) / 130 * 0.018;
                n.vx += (dx / d) * f;
                n.vy += (dy / d) * f;
                const spd = Math.sqrt(n.vx * n.vx + n.vy * n.vy);
                if (spd > 1.6) { n.vx /= spd / 1.6; n.vy /= spd / 1.6; }
            }

            n.x += n.vx;
            n.y += n.vy;
            n.phase += n.speed;

            if (n.x < 0 || n.x > this.canvas.width) { n.vx *= -1; n.x = Math.max(0, Math.min(this.canvas.width, n.x)); }
            if (n.y < 0 || n.y > this.canvas.height) { n.vy *= -1; n.y = Math.max(0, Math.min(this.canvas.height, n.y)); }
        });
    }

    draw() {
        const { ctx, nodes, threshold } = this;
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
                const dx = nodes[i].x - nodes[j].x;
                const dy = nodes[i].y - nodes[j].y;
                const d = Math.sqrt(dx * dx + dy * dy);
                if (d < threshold) {
                    const alpha = (1 - d / threshold) * 0.4;
                    ctx.beginPath();
                    ctx.moveTo(nodes[i].x, nodes[i].y);
                    ctx.lineTo(nodes[j].x, nodes[j].y);
                    ctx.strokeStyle = `rgba(0,212,255,${alpha})`;
                    ctx.lineWidth = 0.7;
                    ctx.stroke();
                }
            }
        }

        nodes.forEach(n => {
            const glow = 0.55 + Math.sin(n.phase) * 0.25;
            const r = n.r + Math.sin(n.phase) * 0.4;
            ctx.shadowBlur = 10;
            ctx.shadowColor = `rgba(0,212,255,${glow * 0.7})`;
            ctx.beginPath();
            ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(0,212,255,${glow})`;
            ctx.fill();
            ctx.shadowBlur = 0;
        });
    }

    tick() {
        this.update();
        this.draw();
        this.rafId = requestAnimationFrame(() => this.tick());
    }

    start() {
        if (this.rafId) return;
        this.tick();
    }

    stop() {
        cancelAnimationFrame(this.rafId);
        this.rafId = null;
    }
}

/* ══════════════════════════════════════
   Typewriter Effect
══════════════════════════════════════ */
function startTypewriter(el) {
    const titles = [
        'AI/ML Engineer',
        'Software Engineer II',
        'M.S. AI & ML Candidate',
        'Full-Stack Developer',
        'RAG Systems Builder',
    ];
    let ti = 0, ci = 0, deleting = false;

    function tick() {
        const word = titles[ti];
        el.textContent = word.slice(0, ci);

        if (!deleting) {
            if (ci < word.length) {
                ci++;
                setTimeout(tick, 100);
            } else {
                setTimeout(() => { deleting = true; tick(); }, 2400);
            }
        } else {
            if (ci > 0) {
                ci--;
                setTimeout(tick, 55);
            } else {
                deleting = false;
                ti = (ti + 1) % titles.length;
                setTimeout(tick, 400);
            }
        }
    }

    setTimeout(tick, 1400);
}

/* ══════════════════════════════════════
   Scroll Reveal (IntersectionObserver)
══════════════════════════════════════ */
function initReveal() {
    const targets = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window)) {
        targets.forEach(el => el.classList.add('visible'));
        return;
    }
    const io = new IntersectionObserver(
        entries => entries.forEach(e => {
            if (e.isIntersecting) {
                e.target.classList.add('visible');
                io.unobserve(e.target);
            }
        }),
        { threshold: 0.1, rootMargin: '0px 0px -48px 0px' }
    );
    targets.forEach((el, i) => {
        el.style.transitionDelay = `${(i % 4) * 0.08}s`;
        io.observe(el);
    });
}

/* ══════════════════════════════════════
   Navigation
══════════════════════════════════════ */
function initNav() {
    const nav = document.getElementById('nav');
    const toggle = document.getElementById('navToggle');
    const links = document.getElementById('navLinks');

    window.addEventListener('scroll', () => {
        nav.classList.toggle('scrolled', window.scrollY > 30);
    }, { passive: true });

    toggle.addEventListener('click', () => {
        const isOpen = links.classList.toggle('open');
        toggle.classList.toggle('open', isOpen);
        document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    document.querySelectorAll('.nav-link').forEach(a => {
        a.addEventListener('click', () => {
            links.classList.remove('open');
            toggle.classList.remove('open');
            document.body.style.overflow = '';
        });
    });

    // Highlight active section in nav
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;
        sections.forEach(sec => {
            const top = sec.offsetTop - 100;
            const link = document.querySelector(`.nav-link[href="#${sec.id}"]`);
            if (link) link.classList.toggle('active', scrollY >= top && scrollY < top + sec.offsetHeight);
        });
    }, { passive: true });
}

/* ══════════════════════════════════════
   Project Filtering
══════════════════════════════════════ */
function initFilters() {
    const btns = document.querySelectorAll('.filter-btn');
    const cards = document.querySelectorAll('.project-card');

    btns.forEach(btn => {
        btn.addEventListener('click', () => {
            btns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const filter = btn.dataset.filter;
            cards.forEach(card => {
                const show = filter === 'all' || card.dataset.category === filter;
                card.style.display = show ? '' : 'none';
            });
        });
    });
}

/* ══════════════════════════════════════
   Back to Top Button
══════════════════════════════════════ */
function initBackToTop() {
    const btn = document.getElementById('backToTop');
    if (!btn) return;
    window.addEventListener('scroll', () => {
        btn.classList.toggle('visible', window.scrollY > 500);
    }, { passive: true });
    btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

/* ══════════════════════════════════════
   Init
══════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('neural-canvas');
    if (canvas) {
        const nn = new NeuralNetwork(canvas);
        const heroEl = document.getElementById('hero');
        new IntersectionObserver(
            ([e]) => e.isIntersecting ? nn.start() : nn.stop(),
            { threshold: 0 }
        ).observe(heroEl);
    }

    const typeEl = document.getElementById('typewriter');
    if (typeEl) startTypewriter(typeEl);

    initReveal();
    initNav();
    initFilters();
    initBackToTop();
});
