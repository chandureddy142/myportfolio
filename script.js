// ==========================================
// 1. DYNAMIC PRANEETH-STYLE MORPHING CANVAS ENGINE
// ==========================================
const canvas = document.getElementById('bg-canvas');
const ctx = canvas ? canvas.getContext('2d') : null;

let width, height;
let mouse = { x: -1000, y: -1000 };

function resizeCanvas() {
    if (!canvas) return;
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
});

function drawPraneethCanvas() {
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);

    const scrollY = window.pageYOffset;
    const stageHeight = window.innerHeight;

    const introElem = document.getElementById('intro');
    const skillsElem = document.getElementById('skills');
    const contactElem = document.getElementById('contact');

    const inIntro = introElem && scrollY >= (introElem.offsetTop - 300) && scrollY < (introElem.offsetTop + introElem.offsetHeight - 100);
    const inWhiteSection = inIntro || (skillsElem && scrollY >= (skillsElem.offsetTop - 300) && scrollY < (document.getElementById('projects').offsetTop + document.getElementById('projects').offsetHeight - 100));
    const inContact = contactElem && scrollY >= (contactElem.offsetTop - 200);
    const inStage = scrollY < (stageHeight * 0.75);

    if (inStage || inContact) {
        requestAnimationFrame(drawPraneethCanvas);
        return;
    }

    const gridSize = inWhiteSection ? 38 : 45;
    const dotColor = inWhiteSection ? 'rgba(15, 23, 42, 0.08)' : 'rgba(0, 229, 255, 0.12)';
    const lineColor = inWhiteSection ? 'rgba(15, 23, 42, 0.03)' : 'rgba(0, 229, 255, 0.03)';

    const scrollOffset = (scrollY * 0.25) % gridSize;

    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = 0; x < width; x += gridSize) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
    }
    for (let y = -gridSize + scrollOffset; y < height; y += gridSize) {
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
    }
    ctx.stroke();

    for (let x = 0; x < width; x += gridSize) {
        for (let y = -gridSize + scrollOffset; y < height; y += gridSize) {
            const dx = mouse.x - x;
            const dy = mouse.y - y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            ctx.fillStyle = dotColor;
            let radius = 1.2;

            if (dist < 120) {
                radius = 1.2 + (1 - dist / 120) * 2.2;
                ctx.fillStyle = inWhiteSection ? 'rgba(2, 132, 199, 0.5)' : 'rgba(0, 229, 255, 0.5)';
            }

            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    requestAnimationFrame(drawPraneethCanvas);
}
requestAnimationFrame(drawPraneethCanvas);

// ==========================================
// 2. MAC-OS DOCK MAGNIFICATION EFFECT
// ==========================================
const dock = document.getElementById('dock');
const dockItems = document.querySelectorAll('.dock-item');

if (dock) {
    dock.addEventListener('mousemove', (e) => {
        const mouseX = e.clientX;

        dockItems.forEach((item) => {
            const rect = item.getBoundingClientRect();
            const itemCenter = rect.left + rect.width / 2;
            const distance = Math.abs(mouseX - itemCenter);
            const maxDistance = 130;

            if (distance < maxDistance) {
                const scale = 1 + 0.45 * Math.cos((distance / maxDistance) * (Math.PI / 2));
                const translateY = -12 * Math.cos((distance / maxDistance) * (Math.PI / 2));
                item.style.transform = `scale(${scale}) translateY(${translateY}px)`;
            } else {
                item.style.transform = 'scale(1) translateY(0px)';
            }
        });
    });

    dock.addEventListener('mouseleave', () => {
        dockItems.forEach((item) => {
            item.style.transform = 'scale(1) translateY(0px)';
        });
    });
}

// ==========================================
// 3. SMOOTH SCROLL FOR ALL ANCHORS
// ==========================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const targetId = this.getAttribute('href');
        if (targetId && targetId.startsWith('#') && targetId.length > 1) {
            e.preventDefault();
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const topOffset = targetId === '#stage' ? 0 : 40;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - topOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        }
    });
});

const scrollBtn = document.getElementById('scrollToIntro');
if (scrollBtn) {
    scrollBtn.addEventListener('click', () => {
        const intro = document.getElementById('intro');
        if (intro) {
            intro.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
}

// ==========================================
// 4. SCROLL OBSERVER: DOCK VISIBILITY + ACTIVE LINK
// ==========================================
const sections = document.querySelectorAll('section[id]');
const dockContainer = document.getElementById('dockContainer');

function updateScrollUI() {
    const scrollY = window.pageYOffset;
    const windowHeight = window.innerHeight;
    const docHeight = document.documentElement.scrollHeight;
    const introElem = document.getElementById('intro');

    if (introElem) {
        const introThreshold = introElem.offsetTop - 280;
        if (scrollY >= introThreshold) {
            dockContainer.classList.add('dock-visible');
        } else {
            dockContainer.classList.remove('dock-visible');
        }
    }

    if (scrollY + windowHeight >= docHeight - 80) {
        dockItems.forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('href') === '#contact') {
                item.classList.add('active');
            }
        });
        return;
    }

    sections.forEach((current) => {
        const sectionHeight = current.offsetHeight;
        const sectionTop = current.offsetTop - 200;
        const sectionId = current.getAttribute('id');

        if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
            dockItems.forEach((item) => {
                item.classList.remove('active');
                if (item.getAttribute('href') === `#${sectionId}`) {
                    item.classList.add('active');
                }
            });
        }
    });
}

window.addEventListener('scroll', updateScrollUI);
window.addEventListener('load', updateScrollUI);

// Parallax tilt on avatar
const stageSection = document.getElementById('stage');
const stageAvatar = document.getElementById('stageAvatar');

if (stageSection && stageAvatar) {
    stageSection.addEventListener('mousemove', (e) => {
        const rect = stageSection.getBoundingClientRect();
        const relX = (e.clientX - rect.left) / rect.width - 0.5;
        const relY = (e.clientY - rect.top) / rect.height - 0.5;

        stageAvatar.style.transform = `translateX(${relX * 16}px) rotateX(${-relY * 8}deg) rotateY(${relX * 8}deg)`;
    });

    stageSection.addEventListener('mouseleave', () => {
        stageAvatar.style.transform = '';
    });
}

// ==========================================
// 5. LIVE CLOCK
// ==========================================
function updateClock() {
    const timeElem = document.getElementById('live-time-text');
    if (!timeElem) return;
    const now = new Date();
    timeElem.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}
updateClock();
setInterval(updateClock, 1000);

// ==========================================
// 6. FLUID CURSOR
// ==========================================
const cursor = document.querySelector('.cursor');
const cursorDot = document.querySelector('.cursor-dot');
let mouseX = 0, mouseY = 0;
let posX = 0, posY = 0;

document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    if (cursorDot) {
        cursorDot.style.left = `${mouseX}px`;
        cursorDot.style.top = `${mouseY}px`;
    }
});

function renderCursor() {
    posX += (mouseX - posX) * 0.2;
    posY += (mouseY - posY) * 0.2;
    if (cursor) {
        cursor.style.left = `${posX}px`;
        cursor.style.top = `${posY}px`;
    }
    requestAnimationFrame(renderCursor);
}
renderCursor();

const hoverables = document.querySelectorAll('a, button, .iso-tool-card, .terminal-window, .skill-card, .cert-badge');
hoverables.forEach(elem => {
    elem.addEventListener('mouseenter', () => cursor && cursor.classList.add('expand'));
    elem.addEventListener('mouseleave', () => cursor && cursor.classList.remove('expand'));
});

// ==========================================
// 7. INTERACTIVE TERMINAL SIMULATOR
// ==========================================
const termWindow = document.getElementById('interactive-term');
const termBody = document.getElementById('term-body');
const termHistory = document.getElementById('term-history');
const currentCmd = document.getElementById('current-cmd');
const promptPrefix = document.getElementById('prompt-prefix');

const commands = [
    { cmd: "whoami", out: "Gunje Chandra Mohan Reddy" },
    { cmd: "ls", out: "tools.txt    certs.txt" },
    { cmd: "cat certs.txt", out: "1. Linux Administration (L&T)<br>2. Network Security (L&T)<br>3. Google Professional Cybersecurity" },
    { cmd: "cat tools.txt", out: "Kali Linux &bull; Nmap &bull; Wireshark &bull; Burp Suite &bull; OWASP ZAP" },
    { cmd: "clear", out: "", reset: true }
];

let cmdIndex = 0;
let isTyping = false;

function typeCommand() {
    if (!currentCmd) return;
    const item = commands[cmdIndex];
    let charI = 0;
    currentCmd.innerHTML = "";
    isTyping = true;

    const interval = setInterval(() => {
        currentCmd.innerHTML += item.cmd.charAt(charI);
        charI++;
        if (charI >= item.cmd.length) {
            clearInterval(interval);
            isTyping = false;
        }
    }, 55);
}

if (termWindow) {
    termWindow.addEventListener('click', () => {
        if (isTyping) return;
        const item = commands[cmdIndex];

        if (item.reset) {
            termHistory.innerHTML = "";
        } else {
            termHistory.innerHTML += `
                <div class="term-line"><span class="term-user">${promptPrefix.innerHTML}</span> ${item.cmd}</div>
                <div class="term-output">${item.out}</div>
            `;
        }

        currentCmd.innerHTML = "";
        cmdIndex = (cmdIndex + 1) % commands.length;
        termBody.scrollTop = termBody.scrollHeight;
        setTimeout(typeCommand, 600);
    });
}
setTimeout(typeCommand, 1200);

// ==========================================
// 8. SCROLL FADE-IN OBSERVER
// ==========================================
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, { threshold: 0.15 });

document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));


// ==========================================
// 9. INTERACTIVE GRID DOODLE CANVAS ENGINE
// ==========================================
const dCanvas = document.getElementById('doodle-canvas');
const dSheet = document.querySelector('.doodle-paper-sheet');
const dHint = document.getElementById('doodle-hint');

if (dCanvas && dSheet) {
    const dCtx = dCanvas.getContext('2d');
    let isDrawing = false;
    let currentTool = 'pen'; // 'pen', 'marker', 'eraser'
    let currentColor = '#0f172a';

    function resizeDoodleCanvas() {
        const rect = dSheet.getBoundingClientRect();
        // Preserve drawing on resize
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = dCanvas.width;
        tempCanvas.height = dCanvas.height;
        const tempCtx = tempCanvas.getContext('2d');
        tempCtx.drawImage(dCanvas, 0, 0);

        dCanvas.width = rect.width;
        dCanvas.height = rect.height;
        dCtx.drawImage(tempCanvas, 0, 0);
    }
    window.addEventListener('resize', resizeDoodleCanvas);
    resizeDoodleCanvas();

    function getCoords(e) {
        const rect = dCanvas.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        return {
            x: clientX - rect.left,
            y: clientY - rect.top
        };
    }

    function startDraw(e) {
        isDrawing = true;
        if (dHint) dHint.style.opacity = '0';
        const { x, y } = getCoords(e);
        dCtx.beginPath();
        dCtx.moveTo(x, y);
    }

    function draw(e) {
        if (!isDrawing) return;
        e.preventDefault();
        const { x, y } = getCoords(e);

        if (currentTool === 'eraser') {
            dCtx.globalCompositeOperation = 'destination-out';
            dCtx.lineWidth = 26;
            dCtx.lineCap = 'round';
            dCtx.lineJoin = 'round';
        } else if (currentTool === 'marker') {
            dCtx.globalCompositeOperation = 'source-over';
            dCtx.strokeStyle = currentColor;
            dCtx.lineWidth = 14;
            dCtx.lineCap = 'square';
            dCtx.lineJoin = 'miter';
            dCtx.globalAlpha = 0.45;
        } else {
            // Pen
            dCtx.globalCompositeOperation = 'source-over';
            dCtx.strokeStyle = currentColor;
            dCtx.lineWidth = 2.5;
            dCtx.lineCap = 'round';
            dCtx.lineJoin = 'round';
            dCtx.globalAlpha = 1.0;
        }

        dCtx.lineTo(x, y);
        dCtx.stroke();
    }

    function stopDraw() {
        if (!isDrawing) return;
        isDrawing = false;
        dCtx.closePath();
    }

    dCanvas.addEventListener('mousedown', startDraw);
    dCanvas.addEventListener('mousemove', draw);
    window.addEventListener('mouseup', stopDraw);

    dCanvas.addEventListener('touchstart', startDraw, { passive: false });
    dCanvas.addEventListener('touchmove', draw, { passive: false });
    window.addEventListener('touchend', stopDraw);

    // Tool switching
    const penBtn = document.getElementById('tool-pen');
    const markerBtn = document.getElementById('tool-marker');
    const eraserBtn = document.getElementById('tool-eraser');
    const toolBtns = [penBtn, markerBtn, eraserBtn];

    toolBtns.forEach(btn => {
        if (!btn) return;
        btn.addEventListener('click', () => {
            toolBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            if (btn === penBtn) currentTool = 'pen';
            if (btn === markerBtn) currentTool = 'marker';
            if (btn === eraserBtn) currentTool = 'eraser';
        });
    });

    // Preset color dots
    const colorDots = document.querySelectorAll('.color-dot');
    colorDots.forEach(dot => {
        dot.addEventListener('click', () => {
            colorDots.forEach(d => d.classList.remove('active'));
            dot.classList.add('active');
            currentColor = dot.dataset.color;
            if (currentTool === 'eraser') {
                penBtn.click();
            }
        });
    });

    // Custom Color Input
    const colorInput = document.getElementById('doodle-color-input');
    if (colorInput) {
        colorInput.addEventListener('input', (e) => {
            currentColor = e.target.value;
            colorDots.forEach(d => d.classList.remove('active'));
            if (currentTool === 'eraser') {
                penBtn.click();
            }
        });
    }

    // Clear Button
    const clearBtn = document.getElementById('doodle-clear-btn');
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            dCtx.clearRect(0, 0, dCanvas.width, dCanvas.height);
            if (dHint) dHint.style.opacity = '1';
        });
    }
}
// ==========================================
// 9. TOUCH-FRIENDLY TAP INTERACTIONS (MOBILE)
// On touch devices, :hover never fires, so certificate zoom and
// timeline tooltips (which rely on :hover on desktop) get a tap
// equivalent here instead.
// ==========================================
const isTouchDevice = window.matchMedia('(hover: none), (pointer: coarse)').matches;

if (isTouchDevice) {
    // Tap a certificate to zoom it full-screen; tap again (or tap
    // elsewhere) to close it.
    document.querySelectorAll('.cert-badge').forEach(badge => {
        badge.addEventListener('click', (e) => {
            const wasOpen = badge.classList.contains('touch-active');
            document.querySelectorAll('.cert-badge.touch-active').forEach(b => b.classList.remove('touch-active'));
            if (!wasOpen) {
                badge.classList.add('touch-active');
            }
            e.stopPropagation();
        });
    });

    // Tap an education timeline step to reveal its detail tooltip;
    // tap again (or tap elsewhere) to close it.
    document.querySelectorAll('.timeline-step').forEach(step => {
        step.addEventListener('click', (e) => {
            const wasOpen = step.classList.contains('touch-active');
            document.querySelectorAll('.timeline-step.touch-active').forEach(s => s.classList.remove('touch-active'));
            if (!wasOpen) {
                step.classList.add('touch-active');
            }
            e.stopPropagation();
        });
    });

    // Tapping anywhere else on the page closes any open cert
    // preview or timeline tooltip.
    document.addEventListener('click', () => {
        document.querySelectorAll('.cert-badge.touch-active, .timeline-step.touch-active')
            .forEach(el => el.classList.remove('touch-active'));
    });
}

// ==========================================
// 10. DYNAMIC SCROLL COLOR MORPH FOR LIGHT SECTIONS
// Transitions from amber/sand to cyber-mint as you scroll
// ==========================================
function updateLightSectionsGradient() {
    const lightSections = document.querySelectorAll('.pattern-white-grid');
    if (!lightSections.length) return;

    const scrollY = window.pageYOffset || window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = Math.min(Math.max(scrollY / (docHeight || 1), 0), 1);

    // Morphs hue from warm amber (38°) toward cyber-emerald/mint (155°)
    const currentHue = Math.round(38 + (155 - 38) * scrollPercent);
    const ambientColor = `hsla(${currentHue}, 70%, 50%, 0.12)`;

    lightSections.forEach(section => {
        section.style.backgroundImage = `
            radial-gradient(ellipse 65% 55% at 50% 40%, ${ambientColor} 0%, transparent 65%),
            linear-gradient(180deg, #fdfbf7 0%, #f7f9f8 50%, #f0fdf4 100%)
        `;
    });
}

window.addEventListener('scroll', updateLightSectionsGradient, { passive: true });
window.addEventListener('DOMContentLoaded', updateLightSectionsGradient);