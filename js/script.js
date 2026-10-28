/* ==========================================================================
   Badal Singh — Portfolio interactions
   Vanilla JS · Typed.js · GSAP ScrollTrigger · FormSubmit delivery
   ========================================================================== */

(function () {
    'use strict';

    document.documentElement.classList.add('js-enabled');

    var CONTACT_EMAIL = 'baadalsinghh01@gmail.com';
    var WHATSAPP_NUMBER = '917258097358';
    var WHATSAPP_URL = 'https://wa.me/' + WHATSAPP_NUMBER;
    var FORM_ENDPOINT = 'https://formsubmit.co/ajax/' + CONTACT_EMAIL;
    var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ----------------------------------------------------------------------
       Helpers
       ---------------------------------------------------------------------- */
    function $(selector, scope) {
        return (scope || document).querySelector(selector);
    }

    function $$(selector, scope) {
        return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
    }

    function onReady(fn) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', fn);
        } else {
            fn();
        }
    }

    function escapeHtml(value) {
        return String(value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function pad2(number) {
        return String(number).padStart(2, '0');
    }

    /* ----------------------------------------------------------------------
       Typing headline
       ---------------------------------------------------------------------- */
    function initTyping() {
        var target = $('.typing');
        if (!target) {
            return;
        }

        var strings = [
            'scalable government platforms.',
            'secure enterprise systems.',
            'high-performance web apps.',
            'open-source compliance tools.'
        ];

        if (prefersReducedMotion || typeof window.Typed === 'undefined') {
            target.textContent = strings[0];
            return;
        }

        new window.Typed('.typing', {
            strings: strings,
            typeSpeed: 52,
            backSpeed: 26,
            backDelay: 1900,
            startDelay: 500,
            loop: true,
            smartBackspace: true,
            showCursor: true,
            cursorChar: '_'
        });
    }

    /* ----------------------------------------------------------------------
       Navigation, progress and scroll-to-top
       ---------------------------------------------------------------------- */
    function initNavbar() {
        var navbar = $('#navbar');
        if (!navbar) {
            return;
        }

        function updateNavbar() {
            navbar.classList.toggle('sticky', window.scrollY > 24);
        }

        updateNavbar();
        window.addEventListener('scroll', updateNavbar, { passive: true });
    }

    function initScrollProgress() {
        var bar = $('#scrollProgress');
        var topBtn = $('#scrollUpBtn');

        function update() {
            var doc = document.documentElement;
            var scrollable = doc.scrollHeight - window.innerHeight;
            var progress = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;

            if (bar) {
                bar.style.width = Math.min(100, Math.max(0, progress)) + '%';
            }

            if (topBtn) {
                topBtn.classList.toggle('show', window.scrollY > 560);
            }
        }

        update();
        window.addEventListener('scroll', update, { passive: true });
        window.addEventListener('resize', update);

        if (topBtn) {
            topBtn.addEventListener('click', function () {
                window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
            });
        }
    }

    function initScrollSpy() {
        var links = $$('.nav-link');
        if (!links.length) {
            return;
        }

        var sections = links
            .map(function (link) {
                var id = link.getAttribute('href');
                return id && id.charAt(0) === '#' ? document.querySelector(id) : null;
            })
            .filter(Boolean);

        if (!sections.length) {
            return;
        }

        var ticking = false;

        function update() {
            var marker = window.scrollY + (window.innerHeight * 0.28);
            var currentId = sections[0].id;

            sections.forEach(function (section) {
                if (section.offsetTop <= marker) {
                    currentId = section.id;
                }
            });

            if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 80) {
                currentId = sections[sections.length - 1].id;
            }

            links.forEach(function (link) {
                var isActive = link.getAttribute('href') === '#' + currentId;
                link.classList.toggle('active', isActive);
                if (isActive) {
                    link.setAttribute('aria-current', 'location');
                } else {
                    link.removeAttribute('aria-current');
                }
            });

            ticking = false;
        }

        function requestUpdate() {
            if (!ticking) {
                ticking = true;
                window.requestAnimationFrame(update);
            }
        }

        update();
        window.addEventListener('scroll', requestUpdate, { passive: true });
        window.addEventListener('resize', requestUpdate);
    }

    function initMobileNav() {
        var toggle = $('#mobileToggle');
        var menu = $('#navMenu');
        var overlay = $('#navOverlay');

        if (!toggle || !menu) {
            return;
        }

        function setOpen(open) {
            menu.classList.toggle('active', open);
            toggle.classList.toggle('active', open);
            toggle.setAttribute('aria-expanded', open ? 'true' : 'false');

            if (overlay) {
                overlay.classList.toggle('active', open);
            }

            document.body.style.overflow = open ? 'hidden' : '';

            if (open) {
                var firstLink = $('.nav-link', menu);
                if (firstLink) {
                    window.setTimeout(function () {
                        firstLink.focus({ preventScroll: true });
                    }, 250);
                }
            }
        }

        toggle.addEventListener('click', function () {
            setOpen(!menu.classList.contains('active'));
        });

        if (overlay) {
            overlay.addEventListener('click', function () {
                setOpen(false);
            });
        }

        $$('.nav-link', menu).forEach(function (link) {
            link.addEventListener('click', function () {
                setOpen(false);
            });
        });

        document.addEventListener('keydown', function (event) {
            if (event.key === 'Escape' && menu.classList.contains('active')) {
                setOpen(false);
                toggle.focus();
            }
        });

        window.addEventListener('resize', function () {
            if (window.innerWidth > 880 && menu.classList.contains('active')) {
                setOpen(false);
            }
        });
    }

    /* ----------------------------------------------------------------------
       Scroll reveal
       ---------------------------------------------------------------------- */
    function initScrollReveal() {
        var selectors = [
            '.section-header',
            '.about-text-column',
            '.about-stats-column',
            '.stats-card',
            '.skill-category-card',
            '.timeline-card',
            '.certifications-card',
            '.contact-card',
            '.contact-link-item',
            '.contact-form-wrapper'
        ];

        var targets = $$(selectors.join(',')).filter(function (element) {
            return element && !element.closest('.horizontal-scroll-section');
        });

        if (!targets.length) {
            return;
        }

        if (prefersReducedMotion || !('IntersectionObserver' in window)) {
            targets.forEach(function (element) {
                element.classList.add('reveal', 'is-visible');
            });
            return;
        }

        targets.forEach(function (element, index) {
            element.classList.add('reveal');
            element.classList.add('reveal-delay-' + (index % 3 === 0 ? 0 : index % 3));
        });

        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.12,
            rootMargin: '0px 0px -8% 0px'
        });

        targets.forEach(function (element) {
            element.classList.remove('reveal-delay-0');
            observer.observe(element);
        });
    }

    /* ----------------------------------------------------------------------
       Project filters
       ---------------------------------------------------------------------- */
    function initProjectFilters() {
        var buttons = $$('.filter-btn');
        var grid = $('#projectsGrid');

        if (!buttons.length || !grid) {
            return;
        }

        var cards = $$('.project-card', grid);
        var timer = null;

        buttons.forEach(function (button) {
            button.setAttribute('aria-pressed', button.classList.contains('active') ? 'true' : 'false');
        });

        function applyFilter(filter) {
            cards.forEach(function (card) {
                card.classList.add('is-filtering');
            });

            window.clearTimeout(timer);
            timer = window.setTimeout(function () {
                var visibleCount = 0;

                cards.forEach(function (card) {
                    var matches = filter === 'all' || card.dataset.category === filter;
                    card.classList.toggle('is-hidden', !matches);
                    card.classList.remove('is-filtering');

                    if (matches) {
                        visibleCount += 1;
                    }
                });

                grid.setAttribute('data-visible', String(visibleCount));
            }, prefersReducedMotion ? 0 : 160);
        }

        buttons.forEach(function (button) {
            button.addEventListener('click', function () {
                if (button.classList.contains('active')) {
                    return;
                }

                buttons.forEach(function (other) {
                    other.classList.remove('active');
                    other.setAttribute('aria-pressed', 'false');
                });

                button.classList.add('active');
                button.setAttribute('aria-pressed', 'true');

                applyFilter(button.dataset.filter || 'all');
            });

            button.addEventListener('keydown', function (event) {
                var index = buttons.indexOf(button);
                var nextIndex = null;

                if (event.key === 'ArrowRight') {
                    nextIndex = (index + 1) % buttons.length;
                } else if (event.key === 'ArrowLeft') {
                    nextIndex = (index - 1 + buttons.length) % buttons.length;
                }

                if (nextIndex !== null) {
                    event.preventDefault();
                    buttons[nextIndex].focus();
                }
            });
        });
    }

    /* ----------------------------------------------------------------------
       Gallery filters
       ---------------------------------------------------------------------- */
    function initGalleryFilters() {
        var buttons = $$('.gallery-filter');
        var grid = $('#galleryGrid');
        var emptyState = $('#galleryEmpty');
        var counter = $('#galleryShown');

        if (!buttons.length || !grid) {
            return;
        }

        var items = $$('.gallery-item', grid);

        buttons.forEach(function (button) {
            button.setAttribute('aria-pressed', button.classList.contains('active') ? 'true' : 'false');

            button.addEventListener('click', function () {
                buttons.forEach(function (other) {
                    other.classList.remove('active');
                    other.setAttribute('aria-pressed', 'false');
                });
                button.classList.add('active');
                button.setAttribute('aria-pressed', 'true');

                var filter = button.dataset.galleryFilter || 'all';
                var visible = 0;

                items.forEach(function (item) {
                    var matches = filter === 'all' || item.dataset.cat === filter;
                    item.classList.toggle('is-hidden', !matches);
                    if (matches) {
                        visible += 1;
                    }
                });

                if (counter) {
                    counter.textContent = pad2(visible);
                }

                if (emptyState) {
                    emptyState.hidden = visible !== 0;
                }

                document.dispatchEvent(new CustomEvent('gallery:filter', {
                    detail: { visible: visible, filter: filter }
                }));
            });
        });
    }

    /* ----------------------------------------------------------------------
       Gallery lightbox
       ---------------------------------------------------------------------- */
    function initGalleryLightbox() {
        var lightbox = $('#galleryLightbox');
        var grid = $('#galleryGrid');

        if (!lightbox || !grid) {
            return;
        }

        var art = $('#lightboxArt');
        var kicker = $('#lightboxKicker');
        var title = $('#lightboxTitle');
        var desc = $('#lightboxDesc');
        var tech = $('#lightboxTech');
        var indexLabel = $('#lightboxIndex');
        var totalLabel = $('#lightboxTotal');
        var closeBtn = $('#lightboxClose');
        var prevBtn = $('#lightboxPrev');
        var nextBtn = $('#lightboxNext');

        var current = 0;
        var lastFocused = null;

        function visibleItems() {
            return $$('.gallery-item', grid).filter(function (item) {
                return !item.classList.contains('is-hidden');
            });
        }

        function render(items, index) {
            var item = items[index];

            if (!item) {
                return;
            }

            var number = $('.gallery-num', item);
            var imageEl = $('.gallery-img', item);
            var image = item.dataset.image || (imageEl ? imageEl.getAttribute('src') : '');

            if (image) {
                art.className = 'lightbox-art has-image';
                art.innerHTML =
                    '<img class="lightbox-img" src="' + escapeHtml(image) + '" alt="' +
                    escapeHtml((item.dataset.title || 'Certificate') + ' — certificate image') + '" decoding="async">';
            } else {
                art.className = 'lightbox-art';
                art.innerHTML =
                    '<span class="lb-index">' +
                    escapeHtml(number ? number.textContent.trim() : pad2(index + 1)) +
                    '</span>';
            }

            kicker.textContent = (item.dataset.kicker || '') + (item.dataset.year ? ' · ' + item.dataset.year : '');
            title.textContent = item.dataset.title || '';
            desc.textContent = item.dataset.desc || '';

            tech.innerHTML = '';
            (item.dataset.tech || '').split('|').forEach(function (entry) {
                if (!entry.trim()) {
                    return;
                }
                var tag = document.createElement('span');
                tag.textContent = entry.trim();
                tech.appendChild(tag);
            });

            indexLabel.textContent = pad2(index + 1);
            totalLabel.textContent = pad2(items.length);

            current = index;
        }

        function open(items, index) {
            if (!items.length) {
                return;
            }

            lastFocused = document.activeElement;
            render(items, index);

            lightbox.classList.add('is-open');
            lightbox.removeAttribute('inert');
            lightbox.setAttribute('aria-hidden', 'false');
            document.body.classList.add('lightbox-open');

            window.setTimeout(function () {
                closeBtn.focus({ preventScroll: true });
            }, 60);
        }

        function close() {
            lightbox.classList.remove('is-open');
            lightbox.setAttribute('aria-hidden', 'true');
            lightbox.setAttribute('inert', '');
            document.body.classList.remove('lightbox-open');

            if (lastFocused && typeof lastFocused.focus === 'function') {
                lastFocused.focus({ preventScroll: true });
            }
        }

        function step(direction) {
            var items = visibleItems();
            if (!items.length) {
                return;
            }
            var nextIndex = (current + direction + items.length) % items.length;
            render(items, nextIndex);
        }

        function onCardActivate(item) {
            var items = visibleItems();
            var index = items.indexOf(item);
            open(items, index < 0 ? 0 : index);
        }

        $$('.gallery-item', grid).forEach(function (item) {
            item.setAttribute('aria-haspopup', 'dialog');

            item.addEventListener('click', function () {
                onCardActivate(item);
            });

            item.addEventListener('keydown', function (event) {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    onCardActivate(item);
                }
            });
        });

        closeBtn.addEventListener('click', close);
        prevBtn.addEventListener('click', function () {
            step(-1);
        });
        nextBtn.addEventListener('click', function () {
            step(1);
        });

        $$('[data-lightbox-close]', lightbox).forEach(function (element) {
            element.addEventListener('click', close);
        });

        document.addEventListener('keydown', function (event) {
            if (!lightbox.classList.contains('is-open')) {
                return;
            }

            if (event.key === 'Escape') {
                event.preventDefault();
                close();
                return;
            }

            if (event.key === 'ArrowRight') {
                event.preventDefault();
                step(1);
                return;
            }

            if (event.key === 'ArrowLeft') {
                event.preventDefault();
                step(-1);
                return;
            }

            if (event.key === 'Tab') {
                var focusable = $$('button, a[href]', lightbox).filter(function (element) {
                    return element.offsetParent !== null;
                });

                if (!focusable.length) {
                    return;
                }

                var first = focusable[0];
                var last = focusable[focusable.length - 1];

                if (event.shiftKey && document.activeElement === first) {
                    event.preventDefault();
                    last.focus();
                } else if (!event.shiftKey && document.activeElement === last) {
                    event.preventDefault();
                    first.focus();
                }
            }
        });
    }

    /* ----------------------------------------------------------------------
       Gallery rail — vertical flip showcase (swipe / scroll up & down)
       ---------------------------------------------------------------------- */
    function initGalleryRail() {
        var section = $('#gallery');
        var shell = $('.gallery-shell', section);
        var viewport = $('#galleryViewport');
        var rail = $('#galleryGrid');
        var bar = $('#galleryBar');
        var activeLabel = $('#galleryRailActive');
        var totalLabel = $('#galleryRailTotal');
        var prevBtn = $('#galleryPrev');
        var nextBtn = $('#galleryNext');
        var chapterNum = $('#galleryChapterNum');
        var chapterTotal = $('#galleryChapterTotal');
        var chapterTitle = $('#galleryChapterTitle');
        var chapterNav = $('#galleryChapters');

        if (!section || !shell || !viewport || !rail) {
            return;
        }

        var railTrigger = null;
        var triggerTween = null;
        var activeIndex = 0;
        var ticking = false;
        var resizeTimer = null;
        var desktopQuery = window.matchMedia('(min-width: 881px)');

        function visibleItems() {
            return $$('.gallery-item', rail).filter(function (item) {
                return !item.classList.contains('is-hidden');
            });
        }

        function setProgress(value) {
            if (bar) {
                bar.style.width = (Math.max(0, Math.min(1, value)) * 100).toFixed(2) + '%';
            }
        }

        function setActive(index) {
            var list = visibleItems();
            if (!list.length) {
                activeIndex = 0;
                if (activeLabel) {
                    activeLabel.textContent = '00';
                }
                if (totalLabel) {
                    totalLabel.textContent = '00';
                }
                if (chapterNum) {
                    chapterNum.textContent = '00';
                }
                if (chapterTotal) {
                    chapterTotal.textContent = '/ 00';
                }
                if (chapterTitle) {
                    chapterTitle.textContent = 'No certificates';
                }
                return;
            }

            activeIndex = Math.max(0, Math.min(index, list.length - 1));

            // Mark the focused card sharp; blur the rest (depth-of-field)
            list.forEach(function (item, i) {
                item.classList.toggle('is-active', i === activeIndex);
            });

            if (activeLabel) {
                activeLabel.textContent = pad2(activeIndex + 1);
            }
            if (totalLabel) {
                totalLabel.textContent = pad2(list.length);
            }

            // Chapter eyebrow — "Chapter 01 / 08 · title"
            if (chapterNum) {
                var nextNum = pad2(activeIndex + 1);

                if (chapterNum.textContent !== nextNum) {
                    chapterNum.textContent = nextNum;
                    // Restart the flip animation on every chapter change
                    chapterNum.classList.remove('is-flip');
                    void chapterNum.offsetWidth;
                    chapterNum.classList.add('is-flip');
                }
            }

            if (chapterTotal) {
                chapterTotal.textContent = '/ ' + pad2(list.length);
            }

            if (chapterTitle) {
                var title = list[activeIndex].dataset.title || '';

                if (chapterTitle.textContent !== title) {
                    chapterTitle.textContent = title;
                }
            }

            // Chapter index — highlight the active number
            if (chapterNav) {
                var dots = chapterNav.children;

                for (var i = 0; i < dots.length; i++) {
                    var isCurrent = i === activeIndex;

                    dots[i].classList.toggle('active', isCurrent);

                    if (isCurrent) {
                        dots[i].setAttribute('aria-current', 'true');
                    } else {
                        dots[i].removeAttribute('aria-current');
                    }
                }
            }
        }

        function buildChapterNav() {
            if (!chapterNav) {
                return;
            }

            var list = visibleItems();

            chapterNav.innerHTML = '';
            // One chapter needs no index — hide it
            chapterNav.hidden = list.length < 2;

            list.forEach(function (item, index) {
                var button = document.createElement('button');
                var title = item.dataset.title || ('Certificate ' + pad2(index + 1));

                button.type = 'button';
                button.className = 'gallery-chapter-dot';
                button.setAttribute('aria-label', 'Go to certificate ' + (index + 1) + ' of ' + list.length + ': ' + title);

                var num = document.createElement('span');
                num.textContent = pad2(index + 1);
                button.appendChild(num);

                button.addEventListener('click', function () {
                    goToChapter(index);
                });

                chapterNav.appendChild(button);
            });
        }

        function goToChapter(index) {
            var list = visibleItems();

            if (!list.length) {
                return;
            }

            var target = Math.max(0, Math.min(index, list.length - 1));

            // Pinned desktop: one chapter = one scroll boundary inside the pin
            if (railTrigger && desktopQuery.matches) {
                var ratio = list.length > 1 ? target / (list.length - 1) : 0;

                window.scrollTo({
                    top: railTrigger.start + (railTrigger.end - railTrigger.start) * ratio,
                    behavior: prefersReducedMotion ? 'auto' : 'smooth'
                });
                return;
            }

            // Native stage (mobile / reduced motion): scroll the card to the top
            var vpRect = viewport.getBoundingClientRect();
            var itemRect = list[target].getBoundingClientRect();

            viewport.scrollTo({
                top: viewport.scrollTop + (itemRect.top - vpRect.top),
                behavior: prefersReducedMotion ? 'auto' : 'smooth'
            });
        }

        function updateFromProgress(progress) {
            var list = visibleItems();
            setProgress(progress);
            setActive(Math.round(progress * Math.max(0, list.length - 1)));
        }

        function syncFromViewport() {
            var max = viewport.scrollHeight - viewport.clientHeight;
            var progress = max > 0 ? viewport.scrollTop / max : 0;
            updateFromProgress(progress);
        }

        function railDistance() {
            return Math.max(0, rail.scrollHeight - viewport.clientHeight);
        }

        function killDesktopRail() {
            if (triggerTween) {
                if (triggerTween.scrollTrigger) {
                    triggerTween.scrollTrigger.kill();
                }
                triggerTween.kill();
                triggerTween = null;
            }

            railTrigger = null;

            if (typeof window.gsap !== 'undefined') {
                window.gsap.set(rail, { clearProps: 'transform' });
            }

            viewport.classList.remove('is-pinned');
        }

        function createDesktopRail() {
            if (typeof window.gsap === 'undefined' || typeof window.ScrollTrigger === 'undefined') {
                return;
            }

            if (!desktopQuery.matches || prefersReducedMotion || railDistance() < 2) {
                return;
            }

            var gsap = window.gsap;
            gsap.registerPlugin(window.ScrollTrigger);
            viewport.classList.add('is-pinned');

            var chapters = visibleItems().length;

            var tween = gsap.to(rail, {
                y: function () {
                    return -railDistance();
                },
                ease: 'none',
                scrollTrigger: {
                    trigger: shell,
                    start: 'top 96px',
                    end: function () {
                        return '+=' + railDistance();
                    },
                    pin: true,
                    pinSpacing: true,
                    scrub: 0.5,
                    anticipatePin: 1,
                    invalidateOnRefresh: true,
                    // Chapter-based scrolling: whenever the user pauses, the page
                    // settles on the nearest chapter boundary — never between two
                    // chapters (same behaviour as the Rolex Oyster Story chapters).
                    // inertia:false disables GSAP's velocity projection so arrow /
                    // chapter-number jumps always land on their exact chapter.
                    snap: chapters > 1 ? {
                        snapTo: 1 / (chapters - 1),
                        duration: { min: 0.2, max: 0.55 },
                        delay: 0.06,
                        inertia: false,
                        ease: 'power1.inOut'
                    } : false,
                    onUpdate: function (self) {
                        updateFromProgress(self.progress);
                    }
                }
            });

            triggerTween = tween;
            railTrigger = tween.scrollTrigger;
        }

        function refreshRail() {
            var wasPinned = Boolean(railTrigger && window.scrollY >= railTrigger.start);
            var naturalTop = 0;

            viewport.scrollTop = 0;
            killDesktopRail();
            buildChapterNav();

            if (typeof window.ScrollTrigger !== 'undefined') {
                window.ScrollTrigger.refresh();
            }

            naturalTop = shell.getBoundingClientRect().top + window.scrollY;

            if (wasPinned) {
                var safeTop = Math.max(0, naturalTop - 96);
                try {
                    window.scrollTo({ top: safeTop, behavior: 'instant' });
                } catch (error) {
                    window.scrollTo(0, safeTop);
                }
            }

            createDesktopRail();
            updateFromProgress(0);

            if (typeof window.ScrollTrigger !== 'undefined') {
                window.ScrollTrigger.refresh();
            }

            if (wasPinned) {
                var targetTop = railTrigger ? railTrigger.start : Math.max(0, naturalTop - 96);
                try {
                    window.scrollTo({ top: targetTop, behavior: 'instant' });
                } catch (error) {
                    window.scrollTo(0, targetTop);
                }
                updateFromProgress(0);
            }
        }

        function step(direction) {
            goToChapter(activeIndex + direction);
        }

        viewport.addEventListener('scroll', function () {
            if (ticking) {
                return;
            }

            ticking = true;
            window.requestAnimationFrame(function () {
                syncFromViewport();
                ticking = false;
            });
        }, { passive: true });

        $$('.gallery-item', rail).forEach(function (item) {
            item.addEventListener('focus', function () {
                if (railTrigger && desktopQuery.matches) {
                    var list = visibleItems();
                    var index = list.indexOf(item);

                    if (index < 0) {
                        return;
                    }

                    var ratio = list.length > 1 ? index / (list.length - 1) : 0;

                    // The browser may try to reveal a focused card inside the
                    // pinned viewport. Keep the rail at scrollTop 0 and move
                    // the page instead so the GSAP transform stays in sync.
                    viewport.scrollTop = 0;

                    if (Math.abs(railTrigger.progress - ratio) > 0.015) {
                        window.scrollTo({
                            top: railTrigger.start + (railTrigger.end - railTrigger.start) * ratio,
                            behavior: prefersReducedMotion ? 'auto' : 'smooth'
                        });
                    }
                    return;
                }

                var rect = item.getBoundingClientRect();
                var stageRect = viewport.getBoundingClientRect();

                if (rect.top >= stageRect.top + 8 && rect.bottom <= stageRect.bottom - 8) {
                    return;
                }

                item.scrollIntoView({
                    block: 'center',
                    inline: 'nearest',
                    behavior: prefersReducedMotion ? 'auto' : 'smooth'
                });
            });
        });

        if (prevBtn) {
            prevBtn.addEventListener('click', function () {
                step(-1);
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', function () {
                step(1);
            });
        }

        document.addEventListener('gallery:filter', function () {
            window.requestAnimationFrame(function () {
                refreshRail();
            });
        });

        window.addEventListener('resize', function () {
            window.clearTimeout(resizeTimer);
            resizeTimer = window.setTimeout(function () {
                if (desktopQuery.matches && !prefersReducedMotion) {
                    refreshRail();
                } else {
                    killDesktopRail();
                    viewport.scrollTop = 0;
                    updateFromProgress(0);
                    syncFromViewport();
                }
            }, 180);
        });

        buildChapterNav();
        setActive(0);
        createDesktopRail();
    }

    /* ----------------------------------------------------------------------
       Horizontal scrollytelling (GSAP ScrollTrigger pin)
       ---------------------------------------------------------------------- */
    function initHorizontalScroll() {
        var section = $('#horizontal-scroll');

        if (!section) {
            return;
        }

        var track = $('.horizontal-scroll-track', section);
        var dots = $$('.scroll-dot', section);
        var progressFill = $('#hscrollBar');

        if (!track) {
            return;
        }

        if (typeof window.gsap === 'undefined' || typeof window.ScrollTrigger === 'undefined') {
            return;
        }

        var gsap = window.gsap;
        var ScrollTrigger = window.ScrollTrigger;
        gsap.registerPlugin(ScrollTrigger);

        var mm = gsap.matchMedia();

        mm.add('(min-width: 881px) and (prefers-reduced-motion: no-preference)', function () {
            function distance() {
                return Math.max(0, track.scrollWidth - window.innerWidth + 48);
            }

            var tween = gsap.to(track, {
                x: function () {
                    return -distance();
                },
                ease: 'none',
                scrollTrigger: {
                    trigger: section,
                    start: 'top top',
                    end: function () {
                        return '+=' + distance();
                    },
                    pin: true,
                    pinSpacing: true,
                    scrub: 0.7,
                    anticipatePin: 1,
                    invalidateOnRefresh: true,
                    onUpdate: function (self) {
                        if (progressFill) {
                            progressFill.style.width = (self.progress * 100).toFixed(2) + '%';
                        }

                        if (dots.length) {
                            var index = Math.round(self.progress * (dots.length - 1));
                            dots.forEach(function (dot, dotIndex) {
                                dot.classList.toggle('active', dotIndex === index);
                            });
                        }
                    }
                }
            });

            dots.forEach(function (dot, index) {
                function go() {
                    var trigger = tween.scrollTrigger;
                    if (!trigger) {
                        return;
                    }

                    var ratio = dots.length > 1 ? index / (dots.length - 1) : 0;
                    var target = trigger.start + (trigger.end - trigger.start) * ratio;

                    window.scrollTo({
                        top: target,
                        behavior: prefersReducedMotion ? 'auto' : 'smooth'
                    });
                }

                dot.addEventListener('click', go);
                dot.addEventListener('keydown', function (event) {
                    if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        go();
                    }
                });
            });

            return function () {
                if (progressFill) {
                    progressFill.style.width = '0%';
                }
            };
        });

        window.addEventListener('load', function () {
            // A global refresh while the gallery pin is active corrupts its
            // start/end values, so skip it in that case.
            if (typeof ScrollTrigger !== 'undefined' && !$('.gallery-viewport.is-pinned')) {
                ScrollTrigger.refresh();
            }
        });
    }

    /* ----------------------------------------------------------------------
       Contact form
       ---------------------------------------------------------------------- */
    function initContactForm() {
        var form = $('#portfolioContactForm');

        if (!form) {
            return;
        }

        var submitBtn = $('#formSubmitBtn');
        var feedback = $('#formFeedback');
        var fields = {
            name: {
                input: $('#contactName'),
                error: $('#nameError'),
                validate: function (value) {
                    return value.trim().length >= 2;
                }
            },
            email: {
                input: $('#contactEmail'),
                error: $('#emailError'),
                validate: function (value) {
                    return /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(value.trim());
                }
            },
            subject: {
                input: $('#contactSubject'),
                error: $('#subjectError'),
                validate: function (value) {
                    return value.trim().length >= 3;
                }
            },
            message: {
                input: $('#contactMessage'),
                error: $('#messageError'),
                validate: function (value) {
                    return value.trim().length >= 15;
                }
            }
        };

        var fieldList = Object.keys(fields).map(function (key) {
            return fields[key];
        });

        function setFieldState(field, valid) {
            field.input.classList.toggle('is-invalid', !valid);
            field.input.setAttribute('aria-invalid', valid ? 'false' : 'true');

            if (field.error) {
                field.error.classList.toggle('visible', !valid);
            }
        }

        function validateField(field) {
            var valid = field.validate(field.input.value);
            setFieldState(field, valid);
            return valid;
        }

        fieldList.forEach(function (field) {
            if (!field.input) {
                return;
            }

            field.input.addEventListener('blur', function () {
                validateField(field);
            });

            field.input.addEventListener('input', function () {
                if (field.input.classList.contains('is-invalid')) {
                    validateField(field);
                }
            });
        });

        function showFeedback(type, html) {
            if (!feedback) {
                return;
            }
            feedback.className = 'form-feedback ' + type;
            feedback.innerHTML = html;
        }

        function clearFeedback() {
            if (!feedback) {
                return;
            }
            feedback.className = 'form-feedback';
            feedback.innerHTML = '';
        }

        function setLoading(loading) {
            if (!submitBtn) {
                return;
            }

            submitBtn.disabled = loading;
            submitBtn.classList.toggle('is-loading', loading);

            var label = $('.btn-text', submitBtn);
            if (label) {
                label.textContent = loading ? 'Sending…' : 'Send Message';
            }
        }

        function buildMailto(data) {
            var subject = 'Portfolio enquiry — ' + data.subject;
            var body = [
                'Name: ' + data.name,
                'Email: ' + data.email,
                '',
                data.message
            ].join('\n');

            return 'mailto:' + CONTACT_EMAIL +
                '?subject=' + encodeURIComponent(subject) +
                '&body=' + encodeURIComponent(body);
        }

        function buildWhatsApp(data) {
            var lines = [];

            if (data && data.name) {
                lines.push('Hi Badal, I am ' + data.name + '.');
            } else {
                lines.push('Hi Badal, I found your portfolio and would like to connect.');
            }

            if (data && data.email) {
                lines.push('Email: ' + data.email);
            }

            if (data && data.subject) {
                lines.push('Subject: ' + data.subject);
            }

            if (data && data.message) {
                lines.push('', data.message);
            }

            return WHATSAPP_URL + '?text=' + encodeURIComponent(lines.join('\n'));
        }

        function collectData() {
            return {
                name: fields.name.input.value.trim(),
                email: fields.email.input.value.trim(),
                subject: fields.subject.input.value.trim(),
                message: fields.message.input.value.trim()
            };
        }

        function showFallback(data, reason) {
            var mailLink = buildMailto(data);
            var waLink = buildWhatsApp(data);

            showFeedback('error',
                escapeHtml(reason) + ' ' +
                'Send the same message directly instead:' +
                '<span class="form-feedback-actions">' +
                '<a class="btn btn-whatsapp btn-sm" href="' + escapeHtml(waLink) + '" target="_blank" rel="noopener noreferrer"><i class="fab fa-whatsapp"></i> WhatsApp</a>' +
                '<a class="btn btn-outline btn-sm" href="' + escapeHtml(mailLink) + '"><i class="fas fa-envelope"></i> Email</a>' +
                '</span>' +
                '<span class="form-feedback-note">WhatsApp opens a free chat with your message ready — press Send there to deliver it.</span>'
            );
        }

        form.addEventListener('submit', function (event) {
            event.preventDefault();
            clearFeedback();

            var valid = fieldList.map(validateField).every(Boolean);

            if (!valid) {
                var firstInvalid = fieldList.filter(function (field) {
                    return field.input && field.input.classList.contains('is-invalid');
                })[0];

                if (firstInvalid) {
                    firstInvalid.input.focus();
                }

                showFeedback('error', 'Please correct the highlighted fields before sending.');
                return;
            }

            var data = collectData();

            if (window.location.protocol === 'file:') {
                showFallback(data, 'This preview is opened as a local file, so the email relay cannot run from here.');
                return;
            }

            setLoading(true);

            var controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
            var timeout = window.setTimeout(function () {
                if (controller) {
                    controller.abort();
                }
            }, 15000);

            var payload = {
                name: data.name,
                email: data.email,
                subject: data.subject,
                message: data.message,
                _subject: 'Portfolio enquiry — ' + data.subject,
                _template: 'table',
                _captcha: 'false'
            };

            fetch(FORM_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json'
                },
                body: JSON.stringify(payload),
                signal: controller ? controller.signal : undefined
            })
                .then(function (response) {
                    return response.json().catch(function () {
                        return {};
                    }).then(function (body) {
                        return { ok: response.ok, body: body };
                    });
                })
                .then(function (result) {
                    var succeeded = result.ok && String(result.body.success) !== 'false';

                    if (!succeeded) {
                        var serviceMessage = result.body && result.body.message
                            ? ' — ' + result.body.message
                            : '';
                        window.console.warn('[contact] FormSubmit delivery failed' + serviceMessage);
                        throw new Error('Delivery was rejected by the mail service.');
                    }

                    showFeedback('success',
                        'Message sent — thank you, ' + escapeHtml(data.name.split(' ')[0]) + '. ' +
                        'I will reply to <strong>' + escapeHtml(data.email) + '</strong> shortly.'
                    );

                    form.reset();
                    fieldList.forEach(function (field) {
                        field.input.classList.remove('is-invalid');
                        field.input.setAttribute('aria-invalid', 'false');
                        if (field.error) {
                            field.error.classList.remove('visible');
                        }
                    });
                })
                .catch(function (error) {
                    var reason = error && error.name === 'AbortError'
                        ? 'The message took too long to send.'
                        : 'The free email relay is unavailable right now.';

                    showFallback(data, reason);
                })
                .finally(function () {
                    window.clearTimeout(timeout);
                    setLoading(false);
                });
        });

        var whatsappBtn = $('#whatsappSendBtn');

        if (whatsappBtn) {
            whatsappBtn.addEventListener('click', function () {
                var data = collectData();
                var url = buildWhatsApp(data);
                var popup = window.open(url, '_blank');

                if (popup) {
                    popup.opener = null;
                } else {
                    window.location.href = url;
                    return;
                }

                showFeedback('success',
                    'WhatsApp opened in a new tab with your message ready. Press Send there to deliver it — free, with no form service involved.'
                );
            });
        }
    }

    /* ----------------------------------------------------------------------
       Footer year
       ---------------------------------------------------------------------- */
    function initFooterYear() {
        $$('.footer-bottom p').forEach(function (element) {
            element.innerHTML = element.innerHTML.replace(/\d{4}(?= Badal Singh)/, String(new Date().getFullYear()));
        });
    }

    /* ----------------------------------------------------------------------
       Boot
       ---------------------------------------------------------------------- */
    onReady(function () {
        initTyping();
        initNavbar();
        initScrollProgress();
        initScrollSpy();
        initMobileNav();
        initScrollReveal();
        initProjectFilters();
        initGalleryFilters();
        initGalleryLightbox();
        initGalleryRail();
        initHorizontalScroll();
        initContactForm();
        initFooterYear();
    });
})();
