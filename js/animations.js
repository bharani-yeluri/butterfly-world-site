/**
 * IMMERSIVE 3D BUTTERFLY WORLD — GSAP SCROLL STORYTELLING
 * Version: 3.0 (Controlled Macro & Smooth Scroll-Driven 3D Product Animation)
 * 
 * Choreography Principles:
 * - Scroll drives butterfly wings to slowly open and close in true 3D space
 * - Subtle product-style 3D rotations (pitch, yaw, roll within ±12°)
 * - Controlled camera framing: camera Z strictly between 5.35 and 4.65 (NO over-zoom!)
 * - Full butterfly remains visible as the undisputed hero at all times
 * - Smooth ease-in-out interpolation for all section transitions
 */

window.NXAnimations = (function () {
  'use strict';

  function init() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
      setTimeout(init, 150);
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    setupHeaderScroll();
    setupJourneyCounter();
    setupStoryTimeline();
    setupCardAnimations();
    setupLifecycleHighlights();
    setupAnatomyStepperInteractions();

    console.log('[NXAnimations] Smooth Scroll-Driven 3D Product Animation Initialized.');
  }

  /**
   * Header background blur on scroll
   */
  function setupHeaderScroll() {
    const header = document.getElementById('site-header');
    if (!header) return;

    ScrollTrigger.create({
      start: 'top -40',
      end: 99999,
      onUpdate: (self) => {
        if (self.direction === 1 && self.scroll() > 50) {
          header.classList.add('scrolled');
        } else if (self.scroll() <= 50) {
          header.classList.remove('scrolled');
        }
      }
    });
  }

  /**
   * Chapter Counter (01 / 07 ... 07 / 07)
   */
  function setupJourneyCounter() {
    const counter = document.getElementById('journey-counter');
    if (!counter) return;

    const chapters = [
      { id: 'hero', text: '01 / 07' },
      { id: 'awakening', text: '01 / 07' },
      { id: 'anatomy-journey', text: '02 / 07' },
      { id: 'flight', text: '03 / 07' },
      { id: 'lifecycle', text: '04 / 07' },
      { id: 'species', text: '05 / 07' },
      { id: 'ecosystem', text: '06 / 07' },
      { id: 'departure', text: '07 / 07' }
    ];

    chapters.forEach((ch) => {
      const el = document.getElementById(ch.id);
      if (!el) return;

      ScrollTrigger.create({
        trigger: el,
        start: 'top 50%',
        end: 'bottom 50%',
        onEnter: () => { counter.textContent = ch.text; },
        onEnterBack: () => { counter.textContent = ch.text; }
      });
    });
  }

  /**
   * Master 3D WebGL Storytelling Timeline with Controlled Macro Framing
   */
  function setupStoryTimeline() {
    if (!window.NXScene) return;

    const layout = NXScene.getResponsiveLayout ? NXScene.getResponsiveLayout() : { isDesktop: window.innerWidth >= 1200, baseScale: 1.0, heroX: 0.52, heroY: 0.0, cameraZ: 5.30 };
    const isDesktop = layout.isDesktop;
    const isTabletLandscape = window.innerWidth >= 821 && window.innerWidth < 1200;
    const getBaseScale = () => {
      return (window.NXScene && NXScene.getResponsiveLayout)
        ? NXScene.getResponsiveLayout().baseScale
        : 0.73;
    };
    const rightOffset = isDesktop ? 0.52 : (isTabletLandscape ? 0.44 : 0.0);
    const heroX = layout.heroX;
    const heroY = layout.heroY;
    const mobileY = isDesktop ? 0.0 : (isTabletLandscape ? 0.02 : 0.74);

    // -------------------------------------------------------------
    // STAGE 01: HERO — Front-Facing Beauty Shot
    // Wings naturally open (~7° dihedral), matching user reference photo exactly
    // -------------------------------------------------------------
    ScrollTrigger.create({
      trigger: '#hero',
      start: 'top top',
      end: 'bottom top',
      scrub: 1.4,
      onUpdate: (self) => {
        const p = self.progress;

        if (isDesktop) {
          // Controlled camera: Z moves gently from 5.30 to 5.15 (butterfly clearly in full view)
          NXScene.cameraTargetPos.set(
            0,
            gsap.utils.interpolate(0.05, 0.08, p),
            gsap.utils.interpolate(5.30, 5.15, p)
          );
          NXScene.cameraLookAt.set(
            gsap.utils.interpolate(0.0, rightOffset * 0.25, p),
            0.02,
            0
          );

          // Model maintains natural hero alignment and transitions smoothly to Chapter 1
          NXScene.modelPos.set(
            gsap.utils.interpolate(heroX, rightOffset * 1.05, p),
            gsap.utils.interpolate(0.0, 0.02, p) + mobileY,
            0
          );
        } else {
          // Responsive Hero: camera gently moves, butterfly transitions smoothly from hero center to stage 02 sky
          NXScene.cameraTargetPos.set(
            0,
            gsap.utils.interpolate(0.05, 0.08, p),
            gsap.utils.interpolate(layout.cameraZ, layout.cameraZ - 0.15, p)
          );
          NXScene.cameraLookAt.set(
            gsap.utils.interpolate(0.0, rightOffset * 0.25, p),
            0.02,
            0
          );

          NXScene.modelPos.set(
            gsap.utils.interpolate(heroX, rightOffset * 1.05, p),
            gsap.utils.interpolate(heroY, mobileY, p),
            0
          );
        }

        // Pure front-facing alignment with minimal natural tilt
        NXScene.modelRot.set(
          gsap.utils.interpolate(0.0, 0.03, p),
          gsap.utils.interpolate(0.0, 0.05, p),
          0
        );

        // Wings slowly begin to stir from natural open 0.12 -> 0.28
        NXScene.wingAngle = gsap.utils.interpolate(0.12, 0.28, p);
        NXScene.flightIntensity = 0.0;
        NXScene.setHotspotsVisible(false);
      }
    });

    // -------------------------------------------------------------
    // STAGE 02: AWAKENING — Wings slowly close and open as if stretching
    // -------------------------------------------------------------
    ScrollTrigger.create({
      trigger: '#awakening',
      start: 'top 80%',
      end: 'bottom 40%',
      scrub: 1.4,
      onUpdate: (self) => {
        const p = self.progress;

        // Camera stays wide and controlled
        NXScene.cameraTargetPos.set(
          gsap.utils.interpolate(0.0, -0.15, p),
          0.08,
          gsap.utils.interpolate(5.15, 5.05, p)
        );
        NXScene.cameraLookAt.set(rightOffset * 0.5, 0.02, 0);

        NXScene.modelPos.set(
          gsap.utils.interpolate(rightOffset * 0.6, rightOffset, p),
          0.02 + mobileY,
          0
        );

        // Slight product-style rotation: 3/4 beauty angle revealing wing thickness and gold rim light
        NXScene.modelRot.set(
          gsap.utils.interpolate(0.03, 0.05, p),
          gsap.utils.interpolate(0.05, 0.14, p),
          gsap.utils.interpolate(0.0, -0.02, p)
        );

        // Dynamic wing flex: slowly close up to 0.48 then smoothly open back to 0.22
        const flapCycle = Math.sin(p * Math.PI);
        NXScene.wingAngle = 0.22 + flapCycle * 0.28;
        NXScene.flightIntensity = 0.0;
        NXScene.setHotspotsVisible(false);
      }
    });

    // -------------------------------------------------------------
    // STAGE 03: THE 9-PART LIVING ANATOMY JOURNEY
    // Controlled macro framing: Z between 4.90 and 4.70.
    // FULL BUTTERFLY ALWAYS IN SIGHT! Wings held open so anatomy is visible.
    // -------------------------------------------------------------

    function activateAnatomyTab(key) {
      document.querySelectorAll('.anatomy-step-tab').forEach((tab) => {
        tab.classList.toggle('active', tab.getAttribute('data-part') === key);
      });
      document.querySelectorAll('.anatomy-narrative-card').forEach((card) => {
        card.classList.toggle('active', card.getAttribute('data-part') === key);
      });
    }

    // 1. HEAD
    ScrollTrigger.create({
      trigger: '#anatomy-head',
      start: 'top 75%',
      end: 'bottom 45%',
      scrub: 1.4,
      onEnter: () => { NXScene.setHotspotsVisible(true, 'head'); activateAnatomyTab('head'); },
      onEnterBack: () => { NXScene.setHotspotsVisible(true, 'head'); activateAnatomyTab('head'); },
      onUpdate: (self) => {
        const p = self.progress;
        NXScene.cameraTargetPos.set(
          gsap.utils.interpolate(-0.15, -0.22, p),
          gsap.utils.interpolate(0.08, 0.12, p),
          gsap.utils.interpolate(5.05, 4.80, p)
        );
        NXScene.cameraLookAt.set(rightOffset * 0.5, 0.08, 0);
        NXScene.modelPos.set(rightOffset * 0.9, 0.0 + mobileY, 0);
        // Slight forward tilt to present head clearly
        NXScene.modelRot.set(0.07, -0.04, 0);
        NXScene.wingAngle = 0.20;
        NXScene.flightIntensity = 0.0;
      }
    });

    // 2. ANTENNAE
    ScrollTrigger.create({
      trigger: '#anatomy-antennae',
      start: 'top 75%',
      end: 'bottom 45%',
      scrub: 1.4,
      onEnter: () => { NXScene.setHotspotsVisible(true, 'antennae'); activateAnatomyTab('antennae'); },
      onEnterBack: () => { NXScene.setHotspotsVisible(true, 'antennae'); activateAnatomyTab('antennae'); },
      onUpdate: (self) => {
        const p = self.progress;
        NXScene.cameraTargetPos.set(
          -0.22,
          gsap.utils.interpolate(0.12, 0.16, p),
          gsap.utils.interpolate(4.80, 4.78, p)
        );
        NXScene.cameraLookAt.set(rightOffset * 0.5, 0.12, 0);
        NXScene.modelPos.set(rightOffset * 0.9, -0.02 + mobileY, 0);
        NXScene.modelRot.set(0.05, 0.0, 0);
        NXScene.wingAngle = 0.20;
      }
    });

    // 3. COMPOUND EYES
    ScrollTrigger.create({
      trigger: '#anatomy-eyes',
      start: 'top 75%',
      end: 'bottom 45%',
      scrub: 1.4,
      onEnter: () => { NXScene.setHotspotsVisible(true, 'eyes'); activateAnatomyTab('eyes'); },
      onEnterBack: () => { NXScene.setHotspotsVisible(true, 'eyes'); activateAnatomyTab('eyes'); },
      onUpdate: (self) => {
        const p = self.progress;
        NXScene.cameraTargetPos.set(
          gsap.utils.interpolate(-0.22, -0.20, p),
          gsap.utils.interpolate(0.16, 0.10, p),
          gsap.utils.interpolate(4.78, 4.75, p)
        );
        NXScene.cameraLookAt.set(rightOffset * 0.5, 0.08, 0);
        NXScene.modelPos.set(rightOffset * 0.9, 0.0 + mobileY, 0);
        NXScene.modelRot.set(0.06, -0.06, 0);
        NXScene.wingAngle = 0.20;
      }
    });

    // 4. PROBOSCIS
    ScrollTrigger.create({
      trigger: '#anatomy-proboscis',
      start: 'top 75%',
      end: 'bottom 45%',
      scrub: 1.4,
      onEnter: () => { NXScene.setHotspotsVisible(true, 'proboscis'); activateAnatomyTab('proboscis'); },
      onEnterBack: () => { NXScene.setHotspotsVisible(true, 'proboscis'); activateAnatomyTab('proboscis'); },
      onUpdate: (self) => {
        const p = self.progress;
        NXScene.cameraTargetPos.set(
          -0.20,
          gsap.utils.interpolate(0.10, 0.04, p),
          4.75
        );
        NXScene.cameraLookAt.set(rightOffset * 0.5, 0.04, 0);
        NXScene.modelPos.set(rightOffset * 0.9, 0.02 + mobileY, 0);
        NXScene.modelRot.set(0.10, 0.0, 0);
        NXScene.wingAngle = 0.20;
      }
    });

    // 5. THORAX
    ScrollTrigger.create({
      trigger: '#anatomy-thorax',
      start: 'top 75%',
      end: 'bottom 45%',
      scrub: 1.4,
      onEnter: () => { NXScene.setHotspotsVisible(true, 'thorax'); activateAnatomyTab('thorax'); },
      onEnterBack: () => { NXScene.setHotspotsVisible(true, 'thorax'); activateAnatomyTab('thorax'); },
      onUpdate: (self) => {
        const p = self.progress;
        NXScene.cameraTargetPos.set(
          -0.18,
          gsap.utils.interpolate(0.04, 0.02, p),
          gsap.utils.interpolate(4.75, 4.72, p)
        );
        NXScene.cameraLookAt.set(rightOffset * 0.5, 0.0, 0);
        NXScene.modelPos.set(rightOffset * 0.88, 0.04 + mobileY, 0);
        NXScene.modelRot.set(0.05, 0.08, 0);
        NXScene.wingAngle = 0.18;
      }
    });

    // 6. WINGS
    ScrollTrigger.create({
      trigger: '#anatomy-wings',
      start: 'top 75%',
      end: 'bottom 45%',
      scrub: 1.4,
      onEnter: () => { NXScene.setHotspotsVisible(true, 'wings'); activateAnatomyTab('wings'); },
      onEnterBack: () => { NXScene.setHotspotsVisible(true, 'wings'); activateAnatomyTab('wings'); },
      onUpdate: (self) => {
        const p = self.progress;
        NXScene.cameraTargetPos.set(
          -0.15,
          0.02,
          gsap.utils.interpolate(4.72, 4.85, p)
        );
        NXScene.cameraLookAt.set(rightOffset * 0.45, 0.02, 0);
        NXScene.modelPos.set(rightOffset * 0.85, 0.04 + mobileY, 0);
        NXScene.modelRot.set(0.02, -0.10, 0);
        NXScene.wingAngle = 0.16;
      }
    });

    // 7. WING SCALES
    ScrollTrigger.create({
      trigger: '#anatomy-scales',
      start: 'top 75%',
      end: 'bottom 45%',
      scrub: 1.4,
      onEnter: () => { NXScene.setHotspotsVisible(true, 'scales'); activateAnatomyTab('scales'); },
      onEnterBack: () => { NXScene.setHotspotsVisible(true, 'scales'); activateAnatomyTab('scales'); },
      onUpdate: (self) => {
        const p = self.progress;
        NXScene.cameraTargetPos.set(
          -0.15,
          gsap.utils.interpolate(0.02, 0.05, p),
          gsap.utils.interpolate(4.85, 4.72, p)
        );
        NXScene.cameraLookAt.set(rightOffset * 0.5, 0.04, 0);
        NXScene.modelPos.set(rightOffset * 0.85, 0.04 + mobileY, 0);
        NXScene.modelRot.set(0.05, 0.14, 0);
        NXScene.wingAngle = 0.18;
      }
    });

    // 8. LEGS
    ScrollTrigger.create({
      trigger: '#anatomy-legs',
      start: 'top 75%',
      end: 'bottom 45%',
      scrub: 1.4,
      onEnter: () => { NXScene.setHotspotsVisible(true, 'legs'); activateAnatomyTab('legs'); },
      onEnterBack: () => { NXScene.setHotspotsVisible(true, 'legs'); activateAnatomyTab('legs'); },
      onUpdate: (self) => {
        const p = self.progress;
        NXScene.cameraTargetPos.set(
          -0.12,
          gsap.utils.interpolate(0.05, -0.08, p),
          gsap.utils.interpolate(4.72, 4.82, p)
        );
        NXScene.cameraLookAt.set(rightOffset * 0.5, -0.06, 0);
        NXScene.modelPos.set(rightOffset * 0.85, 0.06 + mobileY, 0);
        NXScene.modelRot.set(-0.06, -0.04, 0);
        NXScene.wingAngle = 0.22;
      }
    });

    // 9. ABDOMEN
    ScrollTrigger.create({
      trigger: '#anatomy-abdomen',
      start: 'top 75%',
      end: 'bottom 45%',
      scrub: 1.4,
      onEnter: () => { NXScene.setHotspotsVisible(true, 'abdomen'); activateAnatomyTab('abdomen'); },
      onEnterBack: () => { NXScene.setHotspotsVisible(true, 'abdomen'); activateAnatomyTab('abdomen'); },
      onUpdate: (self) => {
        const p = self.progress;
        NXScene.cameraTargetPos.set(
          -0.12,
          gsap.utils.interpolate(-0.08, -0.14, p),
          gsap.utils.interpolate(4.82, 4.85, p)
        );
        NXScene.cameraLookAt.set(rightOffset * 0.5, -0.12, 0);
        NXScene.modelPos.set(rightOffset * 0.85, 0.08 + mobileY, 0);
        NXScene.modelRot.set(-0.08, 0.0, 0);
        NXScene.wingAngle = 0.22;
      }
    });

    // 10. HARMONIC RETURN TO FULL VIEW
    ScrollTrigger.create({
      trigger: '#anatomy-return',
      start: 'top 80%',
      end: 'bottom 30%',
      scrub: 1.4,
      onEnter: () => { NXScene.setHotspotsVisible(false); activateAnatomyTab(null); },
      onEnterBack: () => { NXScene.setHotspotsVisible(false); activateAnatomyTab(null); },
      onUpdate: (self) => {
        const p = self.progress;
        NXScene.cameraTargetPos.set(
          gsap.utils.interpolate(-0.12, 0.0, p),
          gsap.utils.interpolate(-0.14, 0.04, p),
          gsap.utils.interpolate(4.85, 5.25, p) // Pulls camera back gracefully to full butterfly view
        );
        NXScene.cameraLookAt.set(0, 0.0, 0);
        NXScene.modelPos.set(0.0, 0.0 + mobileY, 0);
        NXScene.modelRot.set(0.0, 0.0, 0);
        NXScene.wingAngle = 0.18;
        NXScene.flightIntensity = 0.0;
      }
    });

    // -------------------------------------------------------------
    // STAGE 04: FLIGHT AERODYNAMICS — Slow majestic 3D flap cycle
    // -------------------------------------------------------------
    ScrollTrigger.create({
      trigger: '#flight',
      start: 'top 75%',
      end: 'bottom 45%',
      scrub: 1.4,
      onUpdate: (self) => {
        const p = self.progress;

        NXScene.cameraTargetPos.set(
          0.0,
          gsap.utils.interpolate(0.04, 0.08, p),
          gsap.utils.interpolate(5.25, 5.10, p)
        );
        NXScene.cameraLookAt.set(0, 0.04, 0);

        NXScene.modelPos.set(
          gsap.utils.interpolate(0.0, rightOffset * 0.75, p),
          gsap.utils.interpolate(0.0, 0.08, p) + mobileY,
          0
        );

        // Dynamic 3D flight banking: pitch and roll
        NXScene.modelRot.set(
          gsap.utils.interpolate(0.0, 0.08, p),
          gsap.utils.interpolate(0.0, 0.12, p),
          gsap.utils.interpolate(0.0, -0.04, p)
        );

        // Smooth scroll-driven wing opening and closing flight cycle
        // Flap wave: opens flat (0.05), closes up (0.55), opens down (15-20% increased speed: 3.0 -> 3.55)
        const flapCycle = Math.sin(p * Math.PI * 3.55);
        NXScene.wingAngle = 0.25 + flapCycle * 0.35;
        NXScene.flightIntensity = gsap.utils.interpolate(0.0, 0.85, p);
        NXScene.setHotspotsVisible(false);
      }
    });

    // -------------------------------------------------------------
    // STAGE 05: LIFE CYCLE & METAMORPHOSIS — Wings unfurl
    // -------------------------------------------------------------
    ScrollTrigger.create({
      trigger: '#lifecycle',
      start: 'top 75%',
      end: 'bottom 45%',
      scrub: 1.4,
      onUpdate: (self) => {
        const p = self.progress;

        if (isDesktop) {
          NXScene.cameraTargetPos.set(
            gsap.utils.interpolate(0.0, -0.25, p),
            0.06,
            gsap.utils.interpolate(5.10, 5.0, p)
          );
          NXScene.cameraLookAt.set(0.1, 0.02, 0);

          NXScene.modelPos.set(
            gsap.utils.interpolate(rightOffset * 0.75, rightOffset * 0.85, p),
            gsap.utils.interpolate(0.08, 0.02, p),
            0
          );
        } else if (isTabletLandscape) {
          NXScene.cameraTargetPos.set(0.0, 0.06, layout.cameraZ);
          NXScene.cameraLookAt.set(0.22, 0.02, 0);

          NXScene.modelPos.set(
            0.46,
            gsap.utils.interpolate(0.08, 0.02, p) + mobileY,
            0
          );
        } else {
          // Mobile & Tablet Portrait: perfectly centered in sky
          NXScene.cameraTargetPos.set(0.0, 0.06, layout.cameraZ);
          NXScene.cameraLookAt.set(0.0, 0.02, 0);

          NXScene.modelPos.set(
            0.0,
            gsap.utils.interpolate(0.08, 0.02, p) + mobileY,
            0
          );
        }

        NXScene.modelRot.set(0.02, gsap.utils.interpolate(0.12, -0.15, p), 0);
        NXScene.modelScale = getBaseScale();
        NXScene.wingAngle = gsap.utils.interpolate(0.50, 0.16, p);
        NXScene.flightIntensity = 0.0;
        NXScene.setHotspotsVisible(false);
      }
    });

    // -------------------------------------------------------------
    // STAGE 06: SPECIES DIVERSITY — 3/4 specimen beauty pose & 2D showcase
    // -------------------------------------------------------------
    ScrollTrigger.create({
      trigger: '#species',
      start: 'top 75%',
      end: 'bottom 45%',
      scrub: 1.4,
      onUpdate: (self) => {
        const p = self.progress;

        if (isDesktop) {
          NXScene.cameraTargetPos.set(-0.2, 0.04, gsap.utils.interpolate(5.0, 4.95, p));
          NXScene.cameraLookAt.set(rightOffset * 0.45, 0.02, 0);
          NXScene.modelPos.set(rightOffset * 0.85, 0.02, 0);
        } else if (isTabletLandscape) {
          NXScene.cameraTargetPos.set(0.0, 0.04, layout.cameraZ);
          NXScene.cameraLookAt.set(0.22, 0.02, 0);
          NXScene.modelPos.set(0.46, 0.02 + mobileY, 0);
        } else {
          // Mobile & Tablet Portrait: centered in sky
          NXScene.cameraTargetPos.set(0.0, 0.04, layout.cameraZ);
          NXScene.cameraLookAt.set(0.0, 0.02, 0);
          NXScene.modelPos.set(0.0, 0.02 + mobileY, 0);
        }

        // Smoothly fade 3D model during species diversity so the photorealistic 2D cutout specimen takes center stage
        let speciesScaleFactor = 1.0;
        if (p < 0.08) {
          speciesScaleFactor = 1.0 - (p / 0.08);
        } else if (p > 0.92) {
          speciesScaleFactor = (p - 0.92) / 0.08;
        } else {
          speciesScaleFactor = 0.0;
        }
        NXScene.modelScale = getBaseScale() * speciesScaleFactor;

        // Specimen angled to catch structural light
        NXScene.modelRot.set(0.04, gsap.utils.interpolate(-0.15, 0.06, p), 0);

        NXScene.wingAngle = 0.16; // Held naturally open
        NXScene.flightIntensity = 0.08;
        NXScene.setHotspotsVisible(false);
      }
    });

    // -------------------------------------------------------------
    // STAGE 07: POLLINATION & ECOSYSTEM — Floating among golden pollen
    // -------------------------------------------------------------
    ScrollTrigger.create({
      trigger: '#ecosystem',
      start: 'top 75%',
      end: 'bottom 45%',
      scrub: 1.4,
      onUpdate: (self) => {
        const p = self.progress;

        if (isDesktop) {
          NXScene.cameraTargetPos.set(0.0, 0.06, gsap.utils.interpolate(4.95, 5.20, p));
          NXScene.cameraLookAt.set(0, 0.04, 0);
          NXScene.modelPos.set(
            gsap.utils.interpolate(rightOffset * 0.85, -0.25, p),
            gsap.utils.interpolate(0.02, 0.10, p),
            0
          );
        } else if (isTabletLandscape) {
          NXScene.cameraTargetPos.set(0.0, 0.06, layout.cameraZ);
          NXScene.cameraLookAt.set(0.22, 0.04, 0);
          NXScene.modelPos.set(
            0.46,
            gsap.utils.interpolate(0.02, 0.10, p) + mobileY,
            0
          );
        } else {
          NXScene.cameraTargetPos.set(0.0, 0.06, layout.cameraZ);
          NXScene.cameraLookAt.set(0, 0.04, 0);
          NXScene.modelPos.set(
            0.0,
            gsap.utils.interpolate(0.02, 0.10, p) + mobileY,
            0
          );
        }

        NXScene.modelScale = getBaseScale();
        NXScene.modelRot.set(-0.04, gsap.utils.interpolate(0.06, 0.22, p), 0);
        NXScene.wingAngle = 0.22;
        NXScene.flightIntensity = 0.35;
        NXScene.setHotspotsVisible(false);
      }
    });

    // -------------------------------------------------------------
    // STAGE 08: DEPARTURE — Majestic ascent
    // -------------------------------------------------------------
    ScrollTrigger.create({
      trigger: '#departure',
      start: 'top 80%',
      end: 'bottom bottom',
      scrub: 1.4,
      onUpdate: (self) => {
        const p = self.progress;

        if (isDesktop) {
          NXScene.cameraTargetPos.set(0, gsap.utils.interpolate(0.06, 0.14, p), gsap.utils.interpolate(5.20, 5.50, p));
          NXScene.cameraLookAt.set(0, gsap.utils.interpolate(0.04, 0.60, p), -0.5);

          NXScene.modelPos.set(
            gsap.utils.interpolate(-0.25, 0.0, p),
            gsap.utils.interpolate(0.10, 1.6, p),
            gsap.utils.interpolate(0.0, -2.5, p)
          );

          NXScene.modelRot.set(-0.14, 0.04, 0);
          NXScene.modelScale = gsap.utils.interpolate(getBaseScale(), getBaseScale() * 0.78, p);
          NXScene.wingAngle = 0.25 + Math.sin(p * Math.PI * 4.75) * 0.30;
          NXScene.flightIntensity = gsap.utils.interpolate(0.35, 0.80, p);
          NXScene.setHotspotsVisible(false);
        } else {
          // Responsive Departure: Butterfly ascends high into the open sky above footer
          NXScene.cameraTargetPos.set(0, gsap.utils.interpolate(0.06, 0.10, p), gsap.utils.interpolate(layout.cameraZ, layout.cameraZ + 0.3, p));
          NXScene.cameraLookAt.set(0, gsap.utils.interpolate(0.04, -0.05, p), -0.5);

          NXScene.modelPos.set(
            0.0,
            gsap.utils.interpolate(mobileY, 3.8, p),
            gsap.utils.interpolate(0.0, -4.5, p)
          );

          NXScene.modelRot.set(-0.14, 0.0, 0);
          NXScene.modelScale = gsap.utils.interpolate(getBaseScale(), getBaseScale() * 0.40, p);
          NXScene.wingAngle = 0.25 + Math.sin(p * Math.PI * 4.75) * 0.30;
          NXScene.flightIntensity = gsap.utils.interpolate(0.35, 0.80, p);
          NXScene.setHotspotsVisible(false);
        }
      }
    });
  }

  function setupAnatomyStepperInteractions() {
    const tabs = document.querySelectorAll('.anatomy-step-tab');
    tabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        const part = tab.getAttribute('data-part');
        const targetSection = document.getElementById(`anatomy-${part}`);
        if (targetSection) {
          targetSection.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });
  }

  /**
   * Minimal Editorial Cards Reveal
   */
  function setupCardAnimations() {
    const cards = document.querySelectorAll(
      '.editorial-card, .anatomy-narrative-card, .species-dossier, .departure-statement'
    );

    cards.forEach((card) => {
      gsap.fromTo(
        card,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.85,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: card,
            start: 'top 86%',
            end: 'bottom 15%',
            toggleActions: 'play none none reverse'
          }
        }
      );
    });

    const heroItems = document.querySelectorAll('.hero-tag, .hero-title, .hero-subtext, .hero-scroll-prompt');
    if (heroItems.length) {
      gsap.fromTo(
        heroItems,
        { opacity: 0, y: 16 },
        {
          opacity: 1,
          y: 0,
          duration: 1.0,
          stagger: 0.12,
          ease: 'power2.out',
          delay: 0.25
        }
      );
    }
  }

  /**
   * Metamorphosis Stages Highlighting
   */
  function setupLifecycleHighlights() {
    const steps = document.querySelectorAll('.stage-step');
    if (!steps.length) return;

    steps.forEach((step) => {
      ScrollTrigger.create({
        trigger: step,
        start: 'top 70%',
        end: 'bottom 40%',
        onEnter: () => {
          steps.forEach(s => s.classList.remove('active'));
          step.classList.add('active');
        },
        onEnterBack: () => {
          steps.forEach(s => s.classList.remove('active'));
          step.classList.add('active');
        }
      });
    });
  }

  return {
    init: init
  };
})();
