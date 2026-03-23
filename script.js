//
// High-End Modern Portfolio - Vanilla JavaScript
//
document.addEventListener('DOMContentLoaded', () => {

    /**
     * Light / Dark Mode Toggle
     */
    const themeToggleCheckbox = document.getElementById('checkbox-theme');
    const mobileThemeToggleCheckbox = document.getElementById('checkbox-theme-mobile');

    // Functie om de thema status en de toggles te synchroniseren
    function setTheme(isLight) {
        if (isLight) {
            document.body.classList.add('light-mode');
            localStorage.setItem('theme', 'light');
        } else {
            document.body.classList.remove('light-mode');
            localStorage.setItem('theme', 'dark');
        }
        if (themeToggleCheckbox) themeToggleCheckbox.checked = isLight;
        if (mobileThemeToggleCheckbox) mobileThemeToggleCheckbox.checked = isLight;
    }

    // Pas het thema toe bij het laden van de pagina
    const savedTheme = localStorage.getItem('theme');
    setTheme(savedTheme === 'light');

    // Voeg listeners toe aan beide toggles
    if (themeToggleCheckbox) {
        themeToggleCheckbox.addEventListener('change', (e) => {
            setTheme(e.target.checked);
        });
    }
    if (mobileThemeToggleCheckbox) {
        mobileThemeToggleCheckbox.addEventListener('change', (e) => {
            setTheme(e.target.checked);
        });
    }

    /**
     * Mobile Menu Logic
     */
    const logoBtn = document.querySelector('.main-nav .logo');
    const mobileMenu = document.querySelector('.mobile-menu');
    const mobileMenuCloseBtn = document.querySelector('.mobile-menu-close');
    const mobileMenuLinks = document.querySelectorAll('.mobile-nav a');

    if (logoBtn && mobileMenu && mobileMenuCloseBtn) {
        logoBtn.addEventListener('click', (e) => {
            // Het logo fungeert alleen als menu-knop als we naar beneden zijn gescrolld
            if (document.body.classList.contains('scrolled')) {
                e.preventDefault(); // Voorkom dat de pagina naar #hero springt
                mobileMenu.classList.add('is-open');
            }
        });

        mobileMenuCloseBtn.addEventListener('click', () => mobileMenu.classList.remove('is-open'));
        mobileMenuLinks.forEach(link => link.addEventListener('click', () => mobileMenu.classList.remove('is-open')));
    }

    /**
     * Hero Scroll Animation (Slide right & Fade out)
     */
    const timeline = document.querySelector('.timeline');
    const scrollTimelineItems = document.querySelectorAll('.timeline-item');
    let isScrolling = false;
    window.addEventListener('scroll', () => {
        if (!isScrolling) {
            window.requestAnimationFrame(() => {
                
                // Toggle '.scrolled' class op de body afhankelijk van scroll-positie (voor de header swipe)
                if (window.scrollY > 50) {
                    document.body.classList.add('scrolled');
                } else {
                    document.body.classList.remove('scrolled');
                }
                
                // Toggle '.contact-visible' class op de body op de helft van het scherm (voor de contactknop)
                if (window.scrollY > window.innerHeight * 0.75) {
                    document.body.classList.add('contact-visible');
                } else {
                    document.body.classList.remove('contact-visible');
                }

                // Tijdlijn balk (verticale lijn) vullen met kleur o.b.v. scroll
                if (timeline) {
                    const rect = timeline.getBoundingClientRect();
                    const triggerPoint = window.innerHeight * 0.8; // Start met vullen als de tijdlijn op 80% van het scherm is
                    
                    // Bereken exacte start en hoogte van de visuele lijn (top: 5px, bottom: 75px in CSS)
                    const lineStart = rect.top + 5; 
                    const lineEnd = rect.bottom - 75;
                    const lineHeight = lineEnd - lineStart;
                    
                    let progress = 0;
                    if (triggerPoint > lineStart) {
                        const scrolledPastLine = triggerPoint - lineStart;
                        progress = Math.max(0, Math.min((scrolledPastLine / lineHeight) * 100, 100));
                    }
                    timeline.style.setProperty('--scroll-progress', `${progress}%`);

                    // Bolletjes (dots) blauw maken als de blauwe scroll-lijn ze passeert
                    scrollTimelineItems.forEach(item => {
                        const itemRect = item.getBoundingClientRect();
                        if (itemRect.top + 15 < triggerPoint) {
                            item.classList.add('active');
                        } else {
                            item.classList.remove('active');
                        }
                    });
                }
                isScrolling = false;
            });
            isScrolling = true;
        }
    });

    /**
     * Intersection Observer for Staggered Fade-in Animations
     * Voegt een 'visible' class toe met een kleine delay per element
     * als er meerdere elementen tegelijkertijd in beeld komen (bijv. Skills Grid).
     */
    const observer = new IntersectionObserver((entries, observer) => {
        let batchDelay = 0; // Delay voor elementen die exact tegelijkertijd in één frame verschijnen
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                
                if (batchDelay > 0) {
                    setTimeout(() => entry.target.classList.add('visible'), batchDelay);
                } else {
                    entry.target.classList.add('visible'); // Direct laden voor de soepelste ervaring
                }
                
                batchDelay += 150; // 150ms vertraging toevoegen voor het volgende element in dit frame

                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.05, // Verlaagd: Start animatie al als 5% zichtbaar is (beter voor lange timeline blokken)
        rootMargin: "0px 0px -50px 0px" // Trigger iets eerder voordat het scherm geraakt wordt
    });

    // Attach the observer to all elements that should fade in
    document.querySelectorAll('.fade-in').forEach(el => {
        observer.observe(el);
    });

    /**
     * Experience Grid Infinite Marquee (Programma's)
     * Kopieert de ervaring-kaarten zodat de CSS animatie naadloos kan loopen
     */
    const experienceGrid = document.querySelector('.experience-grid');
    if (experienceGrid) {
        const originalCards = Array.from(experienceGrid.children);
        
        if (originalCards.length > 0) {
            // 1. Verwijder fade-in zodat de balk direct visueel vol is (geen leeg startscherm)
            originalCards.forEach(card => {
                card.classList.remove('fade-in');
                card.style.opacity = '1';
                card.style.transform = 'none';
            });

            // 2. Vul de rij op totdat deze gegarandeerd elk beeldscherm vult (minimaal 2560px breed)
            const minWidthNeeded = Math.max(window.innerWidth, 2560);
            const currentWidth = originalCards.length * 224; // 200px breedte per kaart + 24px gap
            const extraCopiesNeeded = Math.ceil(minWidthNeeded / currentWidth) - 1;

            for (let i = 0; i < Math.max(0, extraCopiesNeeded); i++) {
                originalCards.forEach(card => experienceGrid.appendChild(card.cloneNode(true)));
            }

            // 3. Dupliceer nu de VOLLEDIGE opgevulde rij voor de naadloze CSS overgang (exact 50% verschuiven)
            const allCardsToLoop = Array.from(experienceGrid.children);
            allCardsToLoop.forEach(card => {
                const clone = card.cloneNode(true);
                clone.setAttribute('aria-hidden', 'true'); // Verbergt klonen voor schermlezers
                experienceGrid.appendChild(clone);
            });
            
            // 4. Start de animatie dynamisch zodra alle blokken correct zijn geladen
            // Dit voorkomt "springen" en zorgt voor een constante snelheid op elk scherm
            const pixelsPerSecond = 100; // Constante en rustige snelheid
            const distanceToTravel = allCardsToLoop.length * 224; // Exact de helft van de container breedte
            const animationDuration = distanceToTravel / pixelsPerSecond;
            
            experienceGrid.style.setProperty('--marquee-duration', `${animationDuration}s`);
            experienceGrid.classList.add('is-animated');

            // Voegt perfecte touch-ondersteuning toe voor telefoons
            document.addEventListener('touchstart', (e) => {
                // Pauzeert nu specifiek als je op een programma-blokje tikt
                if (e.target.closest('.experience-card')) {
                    experienceGrid.classList.add('paused-by-touch');
                } else {
                    // Laat weer draaien als je ergens anders op het scherm tikt
                    experienceGrid.classList.remove('paused-by-touch');
                }
            }, { passive: true });
        }
    }

    /**
     * Accessible Modal (Dialog) Logic
     * Handles the opening and closing of modals for the timeline items.
     * It uses the native <dialog> element for better semantics and accessibility.
     */
    const timelineItems = document.querySelectorAll('.timeline-item');
    timelineItems.forEach(item => {
        const modalId = item.dataset.modalId;
        const modal = document.getElementById(modalId);

        if (!modal) {
            console.warn(`Modal with ID "${modalId}" not found for a timeline item.`);
            return;
        }

        // Open modal on timeline item click
        item.addEventListener('click', () => {
            modal.showModal();
        });
        
        // Close modal when clicking on the backdrop
        modal.addEventListener('click', (event) => {
            if (event.target === modal) {
                modal.close();
            }
        });
    });
});
