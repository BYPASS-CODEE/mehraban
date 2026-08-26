// Smooth scrolling for nav links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
});

// Fade-in on scroll
const fadeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, { threshold: 0.15 });

document.querySelectorAll('.about-card').forEach((el, i) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = `opacity 0.6s ease-out ${i * 0.12}s, transform 0.6s ease-out ${i * 0.12}s`;
    fadeObserver.observe(el);
});

const panelObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0) scale(1)';
        }
    });
}, { threshold: 0.2 });

document.querySelectorAll('.glass-panel').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px) scale(0.98)';
    el.style.transition = 'opacity 0.7s ease-out, transform 0.7s ease-out';
    panelObserver.observe(el);
});

// Cursor glow follow (desktop only)
const cursorGlow = document.getElementById('cursorGlow');
if (window.matchMedia('(pointer: fine)').matches && cursorGlow) {
    document.addEventListener('mousemove', (e) => {
        cursorGlow.style.opacity = '1';
        cursorGlow.style.left = e.clientX + 'px';
        cursorGlow.style.top = e.clientY + 'px';
    });
    document.addEventListener('mouseleave', () => {
        cursorGlow.style.opacity = '0';
    });
}

// Subtle parallax on hero spheres
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    document.querySelectorAll('.gradient-sphere').forEach((el, i) => {
        const speed = 0.1 + i * 0.04;
        el.style.marginTop = `${scrolled * speed * 0.15}px`;
    });
});

console.log('%c✨ مهربان ✨', 'font-size: 22px; color: #8b5cf6; font-weight: bold;');
