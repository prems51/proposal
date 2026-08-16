
(function () {
    "use strict";

    /* =========================================================
       PERSONALIZATION CONFIG — edit these to customize
       ========================================================= */
    const CONFIG = {
        recipientName: "Sakshi",
        senderName: "Prem",
        // Your Instagram handle (no @), e.g. "prem.codes"
        instagramUsername: "yrr_premmm",

        // ---- Silent "she answered" alerts (no backend needed) ----
        // Uses ntfy.sh, a free public push service: this page silently POSTs
        // a short message to a "topic" (like a chat room name), and you get a
        // push notification by subscribing to that same topic on your phone.
        // 1) Install the "ntfy" app (iOS/Android) or open https://ntfy.sh/<topic> in a browser.
        // 2) Pick a hard-to-guess topic name below (anyone who knows it can read your alerts,
        //    since the service is public) and subscribe to that exact name in the app.
        // 3) Set notifyEnabled to true.
        notifyEnabled: true,
        notifyTopic: "prem-panda-site-8f2k1"
    };

    function sanitizeNotificationTitle(title) {
        return String(title)
            .replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, '')
            .replace(/[^\x00-\x7F]/g, '')
            .trim();
    }

    function sendNotification(title, message) {
        if (!CONFIG.notifyEnabled) return;
        try {
            const safeTitle = sanitizeNotificationTitle(title) || 'New message';
            fetch(`https://ntfy.sh/${encodeURIComponent(CONFIG.notifyTopic)}`, {
                method: 'POST',
                body: message,
                headers: { 'Title': safeTitle, 'Priority': 'default' }
            }).catch(() => { });
        } catch (e) { /* fail silently, never block the UI */ }
    }

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;


    /* fill personalization placeholders */
    document.querySelectorAll('[data-fill="recipientName"]').forEach(el => el.textContent = CONFIG.recipientName);
    document.querySelectorAll('[data-fill="senderName"]').forEach(el => el.textContent = CONFIG.senderName);

    /* =========================================================
       SCREEN NAVIGATION
       ========================================================= */
    const screens = Array.from(document.querySelectorAll('.screen'));
    const dotsWrap = document.getElementById('progressDots');
    screens.forEach((s, i) => {
        const d = document.createElement('div');
        d.className = 'dot' + (i === 0 ? ' active' : '');
        d.dataset.for = s.id;
        dotsWrap.appendChild(d);
    });

    function updateDots(activeId) {
        dotsWrap.querySelectorAll('.dot').forEach(d => {
            d.classList.toggle('active', d.dataset.for === activeId);
        });
    }

    function goTo(id) {
        const current = document.querySelector('.screen.active');
        const next = document.getElementById(id);
        if (!next || next === current) return;

        if (current) {
            current.classList.add('leaving');
            current.classList.remove('active');
            setTimeout(() => current.classList.remove('leaving'), 550);
        }
        // slight delay so the leave transition can begin
        requestAnimationFrame(() => {
            next.classList.add('active');
        });
        updateDots(id);
    }

    document.querySelectorAll('[data-next]').forEach(btn => {
        btn.addEventListener('click', () => goTo(btn.getAttribute('data-next')));
    });

    /* =========================================================
       QUESTION SCREEN — choice + yes/maybe
       ========================================================= */
    const choices = document.querySelectorAll('.choice');
    const choiceEcho = document.getElementById('choiceEcho');
    const confirmRow = document.getElementById('confirmRow');

    function selectChoice(el) {
        choices.forEach(c => { c.classList.remove('selected'); c.setAttribute('aria-pressed', 'false'); });
        el.classList.add('selected');
        el.setAttribute('aria-pressed', 'true');
        choiceEcho.textContent = 'Good choice. 👀';
        confirmRow.classList.add('show');
        sendNotification('She picked an activity 👀', `Choice: ${el.getAttribute('data-choice')}`);
    }

    choices.forEach(el => {
        el.addEventListener('click', () => selectChoice(el));
        el.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selectChoice(el); }
        });
    });

    document.getElementById('btnYes').addEventListener('click', () => {
        goTo('screen-yes');
        if (!prefersReducedMotion) launchConfetti();
        sendNotification('SHE SAID YES 🎉', 'Go check the site — she said yes!');
    });

    document.getElementById('btnMaybe').addEventListener('click', () => {
        goTo('screen-maybe');
        sendNotification('She answered', 'She picked "No".');
    });

    /* Instagram deep link: try opening the app, fall back to the web profile */
    const igBtn = document.getElementById('instagramBtn');
    igBtn.addEventListener('click', () => {
        const username = CONFIG.instagramUsername;
        const appUrl = `instagram://user?username=${encodeURIComponent(username)}`;
        const webUrl = `https://instagram.com/${encodeURIComponent(username)}`;

        const fallbackTimer = setTimeout(() => {
            window.open(webUrl, '_blank', 'noopener');
        }, 900);

        window.addEventListener('blur', function onBlur() {
            clearTimeout(fallbackTimer);
            window.removeEventListener('blur', onBlur);
        });

        window.location.href = appUrl;
    });

    /* =========================================================
       AMBIENT PARTICLES (subtle floating hearts/stars)
       ========================================================= */
    const particleField = document.getElementById('particleField');
    const particleGlyphs = ['🤍', '✨', '🩷'];

    if (!prefersReducedMotion) {
        for (let i = 0; i < 14; i++) {
            const p = document.createElement('span');
            p.className = 'particle';
            p.textContent = particleGlyphs[Math.floor(Math.random() * particleGlyphs.length)];
            p.style.left = Math.random() * 100 + '%';
            p.style.setProperty('--drift', (Math.random() * 60 - 30) + 'px');
            p.style.animationDuration = (10 + Math.random() * 8) + 's';
            p.style.animationDelay = (Math.random() * 12) + 's';
            p.style.fontSize = (0.8 + Math.random() * 0.7) + 'rem';
            particleField.appendChild(p);
        }
    }

    /* =========================================================
       CONFETTI (only on YES)
       ========================================================= */
    function launchConfetti() {
        const colors = ['#F7B8C4', '#C9B7E8', '#A9DFC8', '#EE9AAA'];
        const count = 46;
        for (let i = 0; i < count; i++) {
            const piece = document.createElement('div');
            piece.className = 'confetti-piece';
            piece.style.left = Math.random() * 100 + 'vw';
            piece.style.background = colors[Math.floor(Math.random() * colors.length)];
            piece.style.animationDuration = (2.2 + Math.random() * 1.6) + 's';
            piece.style.animationDelay = (Math.random() * 0.4) + 's';
            piece.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
            document.body.appendChild(piece);
            setTimeout(() => piece.remove(), 4200);
        }
    }
})();
