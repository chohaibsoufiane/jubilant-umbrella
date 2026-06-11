document.addEventListener('DOMContentLoaded', () => {
    const container = document.querySelector('.presentation-container');
    const slides = document.querySelectorAll('.slide');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const counterTrack = document.getElementById('counterTrack');

    let currentSlide = 0;
    const totalSlides = slides.length;
    let isTransitioning = false;
    const transitionDuration = 1400; // Matches --t-long CSS duration

    // Check if we are in admin edit mode
    const isAdminMode = window.location.hash === '#admin' || window.location.search.includes('admin');

    function initCinematicSystem() {
        // Advanced Text Splitting Setup - ONLY run if NOT in admin mode
        if (!isAdminMode) {
            document.querySelectorAll('.huge-title, .slide-title, .subtitle').forEach(el => {
                const rawText = el.innerHTML;
                // Handle existing <br> tags gracefully by splitting around them
                // A more bulletproof way is to split text nodes
                const parts = rawText.split(/(<br>)/gi);
                el.innerHTML = '';

                let wordCount = 0;
                parts.forEach(part => {
                    if (part.toLowerCase() === '<br>') {
                        el.appendChild(document.createElement('br'));
                    } else {
                        const words = part.trim().split(/\s+/);
                        words.forEach((word) => {
                            if (!word) return;

                            const wrapper = document.createElement('span');
                            wrapper.className = 'word-wrapper';

                            const inner = document.createElement('span');
                            inner.className = 'word';
                            inner.style.setProperty('--word-idx', wordCount);
                            // inner.innerHTML allows formatting if any existed, but word split might break internal tags. Let's assume plain text titles.
                            inner.textContent = word;

                            wrapper.appendChild(inner);
                            el.appendChild(wrapper);
                            el.appendChild(document.createTextNode(' ')); // keep spaces
                            wordCount++;
                        });
                    }
                });
                el.classList.add('anim-title-container');
            });
        } // End !isAdminMode check

        // Layer delay staging
        slides.forEach(slide => {
            const groups = [
                slide.querySelectorAll('.presenter-tag'),
                slide.querySelectorAll('.anim-title-container'),
                slide.querySelectorAll('.bullet-list li, .list-item, .meta-block, .col-title, .comp-title'),
                slide.querySelectorAll('.slide-visual, .slide-focus-visual, .visual-cell-1, .visual-cell-2')
            ];

            let baseDelay = 0.2; // Offset to let scene movement breathe
            let sequenceTime = 0;

            groups.forEach((group, index) => {
                let itemOffset = 0;
                group.forEach(el => {
                    // Assign class behaviors for generic elements
                    if (index === 3) {
                        el.classList.add('anim-visual');
                    } else if (index === 2 || index === 0) {
                        el.classList.add('anim-fade-up');
                    }

                    // Assign CSS variables
                    el.style.setProperty('--base-delay', `${baseDelay + sequenceTime + itemOffset}s`);
                    itemOffset += 0.05; // rapid staccato
                });

                // Allow overlapping timings (don't wait for prev group to finish)
                sequenceTime += 0.15;
            });
        });

        // Initial paint setup
        container.setAttribute('data-direction', 'next');
        slides[currentSlide].classList.add('active');
        void container.offsetWidth; // Force reflow
        updateProgress();
    }

    initCinematicSystem();

    if (isAdminMode) {
        initAdminSystem();
    }

    function initAdminSystem() {
        // Define all elements that should be editable
        const editableTargets = '.press-title, .huge-title, .slide-title, .subtitle, .meta-label, .meta-value, .bullet-list li, .list-item p, .quad-item p, .visual-placeholder, .slider-text, .col-title';

        document.querySelectorAll(editableTargets).forEach(el => {
            el.setAttribute('contenteditable', 'true');
            // Give a visual hint that it's editable
            el.style.outline = '2px dashed rgba(227, 38, 25, 0.5)';
            el.style.outlineOffset = '4px';
            el.style.transition = 'outline 0.2s';

            el.addEventListener('focus', () => el.style.outline = '2px solid rgba(227, 38, 25, 1)');
            el.addEventListener('blur', () => el.style.outline = '2px dashed rgba(227, 38, 25, 0.5)');
        });

        // Sync the 4-layer Cover Title so the user only edits the top white one, and the color plates automatically mirror it
        const mainTitle = document.querySelector('.press-title.screen-white');
        const colorPlates = document.querySelectorAll('.press-title:not(.screen-white)');
        if (mainTitle) {
            colorPlates.forEach(plate => {
                plate.removeAttribute('contenteditable');
                plate.style.outline = 'none'; // hide outline on underlying plates
            });
            mainTitle.addEventListener('input', () => {
                colorPlates.forEach(plate => plate.innerHTML = mainTitle.innerHTML);
            });
        }

        // Inject floating Admin Toolbar
        const toolbar = document.createElement('div');
        toolbar.id = 'adminModeToolbar';
        toolbar.innerHTML = `
            <div style="position: fixed; top: 20px; right: 20px; background: var(--color-dark); color: white; padding: 15px 25px; border-radius: 8px; z-index: 99999; font-family: var(--font-main); box-shadow: 0 10px 40px rgba(0,0,0,0.8); display: flex; align-items: center; gap: 20px; border: 1px solid rgba(255,255,255,0.1);">
                <div style="display: flex; flex-direction: column;">
                    <span style="font-weight: 900; letter-spacing: 2px; color: var(--color-accent); font-size: 1.2rem;">MODE ADMIN ACTIF</span>
                    <input type="text" id="adminDocTitle" value="${document.title}" title="Titre de l'onglet" style="margin-top: 5px; background: rgba(255,255,255,0.1); color: white; border: 1px solid rgba(255,255,255,0.3); padding: 4px 8px; border-radius: 3px; font-size: 0.8rem; width: 100%;">
                </div>
                <button id="saveAdminChangesBtn" style="background: var(--color-accent); color: white; border: none; padding: 10px 20px; font-weight: 900; cursor: pointer; border-radius: 4px; text-transform: uppercase;">1. Écraser le fichier</button>
            </div>
        `;
        document.body.appendChild(toolbar);

        // Save logic
        document.getElementById('saveAdminChangesBtn').addEventListener('click', async () => {
            const htmlClone = document.documentElement.cloneNode(true);

            // Sync the document title
            const newTitle = document.getElementById('adminDocTitle').value;
            htmlClone.querySelector('title').textContent = newTitle;

            // Remove the admin toolbar from the clone so it doesn't get saved permanently
            const cloneToolbar = htmlClone.querySelector('#adminModeToolbar');
            if (cloneToolbar) cloneToolbar.remove();

            // Clear all structural editor traces
            htmlClone.querySelectorAll('[contenteditable]').forEach(el => {
                el.removeAttribute('contenteditable');
                el.style.outline = '';
                el.style.outlineOffset = '';
                el.style.transition = '';
                if (el.getAttribute('style') === '') el.removeAttribute('style');
            });
            // Clear plate overrides
            htmlClone.querySelectorAll('.press-title:not(.screen-white)').forEach(el => {
                el.style.outline = '';
                if (el.getAttribute('style') === '') el.removeAttribute('style');
            });

            // Prevent saving temporary animation classes that might lock elements
            htmlClone.querySelectorAll('.slide').forEach((s, idx) => {
                s.classList.remove('active', 'outgoing', 'incoming');
                if (idx === 0) s.classList.add('active'); // Reset slide 1 as default active
            });
            htmlClone.querySelector('.presentation-container').setAttribute('data-slide', '1');
            htmlClone.querySelector('.presentation-container').setAttribute('data-direction', 'next');
            const cloneCounter = htmlClone.querySelector('#counterTrack');
            if (cloneCounter) cloneCounter.style.transform = 'translateY(0)';

            // Build html string
            const htmlContent = '<!DOCTYPE html>\\n' + htmlClone.outerHTML;

            // Direct Save to File System API (Modern, overwrites directly)
            if (window.showSaveFilePicker) {
                try {
                    const handle = await window.showSaveFilePicker({
                        suggestedName: 'index.html',
                        types: [{ description: 'Fichier HTML', accept: { 'text/html': ['.html'] } }],
                    });
                    const writable = await handle.createWritable();
                    await writable.write(htmlContent);
                    await writable.close();
                    alert('✅ Modifications enregistrées DIRECTEMENT sur votre fichier principal !\\n\\nVous pouvez recharger la page sans #admin pour voir le résultat.');
                    return; // exit if success
                } catch (err) {
                    if (err.name !== 'AbortError') {
                        console.error('File System API Error:', err);
                    } else {
                        return; // User cancelled
                    }
                }
            }

            // Fallback: Trigger standard invisible file download
            const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'index.html';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            alert("✅ Fichier exporté virtuellement !\\n\\nLe navigateur ne permettant pas l'écrasement direct sous Safari/Ancien Chrome, veuillez remplacer votre ancien HTML avec le fichier qui vient d'être téléchargé.");
        });
    }

    function goToSlide(index, direction) {
        if (isTransitioning) return;
        if (index < 0 || index >= totalSlides) return;
        if (index === currentSlide) return;

        isTransitioning = true;

        container.setAttribute('data-direction', direction);
        void container.offsetWidth; // Flush CSS cache to commit direction BEFORE transitions trigger

        const current = slides[currentSlide];
        const next = slides[index];

        // Wipe phantom states
        slides.forEach(s => {
            if (s !== current && s !== next) {
                s.classList.remove('active', 'outgoing', 'incoming');
            }
        });

        // The cinematic transition sequence
        current.classList.remove('active');
        current.classList.add('outgoing');

        next.classList.remove('outgoing');
        next.classList.add('active');

        // Dynamically restart the animation video on the final slide
        const nextVideo = next.querySelector('video#finalAnimationVideo');
        if (nextVideo) {
            nextVideo.currentTime = 0;
            // Add a small delay so the browser registers the element is no longer visibility: hidden
            setTimeout(() => {
                nextVideo.play().catch(e => console.log('Autoplay prevented', e));
            }, 100);
        }

        currentSlide = index;
        updateProgress();

        // Release lock and clean classes
        setTimeout(() => {
            current.classList.remove('outgoing');
            isTransitioning = false;
        }, transitionDuration);
    }

    function updateProgress() {
        container.setAttribute('data-slide', currentSlide + 1);
        if (counterTrack) {
            // Translate track upward by 3.5rem per slide index
            counterTrack.style.transform = `translateY(-${currentSlide * 3.5}rem)`;
        }
    }

    function nextSlide() {
        if (currentSlide < totalSlides - 1) {
            goToSlide(currentSlide + 1, 'next');
        }
    }

    function prevSlide() {
        if (currentSlide > 0) {
            goToSlide(currentSlide - 1, 'prev');
        }
    }

    // Bindings
    nextBtn.addEventListener('click', nextSlide);
    prevBtn.addEventListener('click', prevSlide);

    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === ' ') {
            e.preventDefault();
            nextSlide();
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
            e.preventDefault();
            prevSlide();
        } else if (e.key === 'F11') {
            e.preventDefault();
            if (window.electronAPI) {
                window.electronAPI.toggleFullScreen();
            }
        }
    });

    let touchStartX = 0;
    let touchEndX = 0;
    document.addEventListener('touchstart', e => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    document.addEventListener('touchend', e => {
        touchEndX = e.changedTouches[0].screenX;
        if (touchEndX < touchStartX - 50) nextSlide();
        if (touchEndX > touchStartX + 50) prevSlide();
    }, { passive: true });

    // === CINEMATIC VIDEO SYSTEM ===
    const videoContainers = document.querySelectorAll('.video-container');
    const backdrop = document.getElementById('videoBackdrop');
    const closeBtn = document.getElementById('videoCloseBtn');
    let activeClone = null;
    let originalVideoNode = null;

    videoContainers.forEach(container => {
        container.addEventListener('click', () => {
            if (activeClone) return;

            // 1. Get exact position of the clicked container
            const rect = container.getBoundingClientRect();
            originalVideoNode = container;

            // hide original so it feels like it detached
            container.style.opacity = '0';

            // 2. Create the clone wrapper
            activeClone = document.createElement('div');
            activeClone.className = 'video-clone';

            // Clone the video tag specifically (excluding the play overlay)
            const vid = container.querySelector('video').cloneNode(true);
            vid.controls = true; // allow user controls in fullscreen
            // autoplay it if we want, or just wait for controls
            vid.play().catch(e => console.log('Autoplay prevented', e));
            activeClone.appendChild(vid);

            // 3. Set clone to original rect (FIRST)
            activeClone.style.top = `${rect.top}px`;
            activeClone.style.left = `${rect.left}px`;
            activeClone.style.width = `${rect.width}px`;
            activeClone.style.height = `${rect.height}px`;

            document.body.appendChild(activeClone);

            // 4. Force reflow to register the starting position
            void activeClone.offsetWidth;

            // 5. Expand to FULLSCREEN (LAST/PLAY)
            activeClone.style.top = '0px';
            activeClone.style.left = '0px';
            activeClone.style.width = '100vw';
            activeClone.style.height = '100vh';

            // 6. Show global backdrop & close button
            backdrop.classList.add('active');
            closeBtn.classList.add('active');
        });
    });

    closeBtn.addEventListener('click', closeVideo);
    backdrop.addEventListener('click', closeVideo);

    function closeVideo() {
        if (!activeClone || !originalVideoNode) return;

        // 1. Get the original container's current rect in case window resized
        const rect = originalVideoNode.getBoundingClientRect();

        // 2. Animate clone back to original position
        activeClone.style.top = `${rect.top}px`;
        activeClone.style.left = `${rect.left}px`;
        activeClone.style.width = `${rect.width}px`;
        activeClone.style.height = `${rect.height}px`;

        // Hide globals
        backdrop.classList.remove('active');
        closeBtn.classList.remove('active');

        // Stop the video
        const vid = activeClone.querySelector('video');
        if (vid) vid.pause();

        // 3. Wait for transition, then cleanup
        setTimeout(() => {
            if (activeClone && activeClone.parentNode) {
                activeClone.parentNode.removeChild(activeClone);
            }
            activeClone = null;
            originalVideoNode.style.opacity = ''; // restore original
            originalVideoNode = null;
        }, transitionDuration); // matches 1400ms --t-long
    }

    // === IDLE MOUSE NAVIGATION SYSTEM ===
    let mouseIdleTimeout;
    const navContainer = document.querySelector('.presentation-nav');

    function wakeUpNav() {
        if (!navContainer) return;
        navContainer.classList.add('nav-visible');

        clearTimeout(mouseIdleTimeout);
        mouseIdleTimeout = setTimeout(() => {
            navContainer.classList.remove('nav-visible');
        }, 2500); // 2.5 seconds of inactivity hides the UI
    }

    document.addEventListener('mousemove', wakeUpNav);
    document.addEventListener('touchstart', wakeUpNav, { passive: true });

    // Wake up on first load
    wakeUpNav();

    // === ELECTRON WINDOW CONTROL EVENTS ===
    const minBtn = document.getElementById('electron-min');
    const maxBtn = document.getElementById('electron-max');
    const closeBtnWin = document.getElementById('electron-close');

    if (window.electronAPI) {
        if (minBtn) minBtn.addEventListener('click', () => window.electronAPI.minimize());
        if (maxBtn) maxBtn.addEventListener('click', () => window.electronAPI.maximize());
        if (closeBtnWin) closeBtnWin.addEventListener('click', () => window.electronAPI.close());
    } else {
        const controls = document.querySelector('.electron-window-controls');
        if (controls) controls.style.display = 'none';
    }
});
