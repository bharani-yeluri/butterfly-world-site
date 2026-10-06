/**
 * IMMERSIVE 3D BUTTERFLY WORLD — MAIN APPLICATION CONTROLLER
 * Features:
 * - Preloader tracking 3D model & asset loading (0% -> 100%)
 * - Custom natural leaf cursor with contextual hover interactions
 * - 360° Free orbit inspection mode toggle with drag hint
 * - Ambient forest soundscape synthesizer (Web Audio API organic breeze & canopy chimes)
 * - Real-time species diversity switcher (Monarch, Blue Morpho, Emerald Swallowtail, Glasswing, Peacock)
 * - Interactive 3D anatomy cards and hotspot integration
 * - Smooth anchor navigation and journey restart flow
 */

(function () {
  'use strict';

  // State Management
  let isAudioPlaying = false;
  let audioCtx = null;
  let masterGain = null;
  let windFilter = null;
  let windNoise = null;
  let chimerTimer = null;
  let isInspectActive = false;

  // DOM Elements
  const preloader = document.getElementById('preloader');
  const preloaderBar = document.getElementById('preloader-bar');
  const preloaderCount = document.getElementById('preloader-count');
  const cursorDot = document.getElementById('cursor-dot');
  const cursorRing = document.getElementById('cursor-ring');
  const cursorText = document.getElementById('cursor-text');
  const audioBtn = document.getElementById('audio-btn');
  const inspectBtn = document.getElementById('inspect-btn');
  const interactiveHint = document.getElementById('interactive-hint');
  const restartBtn = document.getElementById('restart-journey-btn');

  // Species Elements
  const speciesBtns = document.querySelectorAll('.species-btn');
  const specLatin = document.getElementById('spec-latin');
  const specCommon = document.getElementById('spec-common');
  const specDesc = document.getElementById('spec-desc');
  const specHabitat = document.getElementById('spec-habitat');
  const specAdaptation = document.getElementById('spec-adaptation');
  const specPhenom = document.getElementById('spec-phenom');

  /**
   * Application Bootstrapping
   */
  document.addEventListener('DOMContentLoaded', () => {
    initPreloader();
    initCustomCursor();
    init360Inspect();
    initSpeciesSwitcher();
    initAnatomyCardInteractions();
    initHotspotInteractions();
    initForestAudio();
    initSmoothNavigation();

    // Initialize WebGL Scene
    if (window.NXScene) {
      NXScene.init('canvas-container', 'webgl-canvas');
    }

    // Responsive listeners
    window.addEventListener('resize', () => {
      if (window.NXScene) NXScene.handleResize();
      if (window.ScrollTrigger) ScrollTrigger.refresh();
    });
  });

  /**
   * Preloader Sequence
   */
  function initPreloader() {
    let currentProgress = 0;
    let targetProgress = 10;

    if (window.NXScene) {
      NXScene.onProgress((percent) => {
        targetProgress = Math.max(targetProgress, Math.floor(percent));
      });

      NXScene.onLoaded(() => {
        targetProgress = 100;
      });
    }

    // Simulated progress increment while parsing GLB meshes
    const simInterval = setInterval(() => {
      if (targetProgress < 92) {
        targetProgress += Math.floor(Math.random() * 8) + 4;
      }
    }, 120);

    const updateInterval = setInterval(() => {
      currentProgress += (targetProgress - currentProgress) * 0.14;
      const displayVal = Math.min(100, Math.floor(currentProgress));

      if (preloaderBar) preloaderBar.style.width = `${displayVal}%`;
      if (preloaderCount) preloaderCount.textContent = `${displayVal < 10 ? '0' : ''}${displayVal}%`;

      if (displayVal >= 99 && (targetProgress >= 100 || (window.NXScene && NXScene.isLoaded))) {
        clearInterval(updateInterval);
        clearInterval(simInterval);

        if (preloaderBar) preloaderBar.style.width = '100%';
        if (preloaderCount) preloaderCount.textContent = '100%';

        setTimeout(() => {
          if (preloader) preloader.classList.add('fade-out');
          document.body.classList.remove('loading-active');

          if (window.NXAnimations) {
            NXAnimations.init();
          }

          // Trigger initial butterfly parts assembly into complete specimen
          if (window.NXScene && NXScene.playInitialAssembly) {
            NXScene.playInitialAssembly();
          }
        }, 400);
      }
    }, 30);
  }

  /**
   * Custom Natural Leaf Cursor
   */
  function initCustomCursor() {
    if (!cursorDot || !cursorRing) return;

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let ringX = mouseX;
    let ringY = mouseY;

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      cursorDot.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
    });

    function renderRing() {
      ringX += (mouseX - ringX) * 0.16;
      ringY += (mouseY - ringY) * 0.16;
      cursorRing.style.transform = `translate(${ringX}px, ${ringY}px)`;
      requestAnimationFrame(renderRing);
    }
    requestAnimationFrame(renderRing);

    // Interactive Hover States
    const interactiveElements = document.querySelectorAll(
      'a, button, [data-cursor], .anatomy-card, .stage-step, .species-btn'
    );

    interactiveElements.forEach((el) => {
      el.addEventListener('mouseenter', () => {
        const text = el.getAttribute('data-cursor') || 'VIEW';
        cursorRing.classList.add('active');
        if (cursorText) cursorText.textContent = text;
      });

      el.addEventListener('mouseleave', () => {
        cursorRing.classList.remove('active');
        if (cursorText) cursorText.textContent = '';
      });
    });
  }

  /**
   * 360° Orbit Inspection Toggle
   */
  function init360Inspect() {
    if (!inspectBtn) return;

    inspectBtn.addEventListener('click', () => {
      isInspectActive = !isInspectActive;
      inspectBtn.classList.toggle('active', isInspectActive);

      if (interactiveHint) {
        interactiveHint.classList.toggle('active', isInspectActive);
      }

      if (window.NXScene) {
        NXScene.setInteractiveMode(isInspectActive);
      }
    });
  }

  /**
   * Species Diversity Switcher & Dynamic Dossier Update
   */
  function initSpeciesSwitcher() {
    const btns = document.querySelectorAll('.species-btn');
    const butterflyImg = document.getElementById('species-butterfly-img');
    const dossier = document.getElementById('species-dossier');

    // Species realistic cutout image map
    const speciesImages = {
      blue: 'assets/images/species_blue_morpho.png',
      orange: 'assets/images/species_orange_monarch.png',
      yellow: 'assets/images/species_yellow_swallowtail.png',
      red: 'assets/images/species_red_postman.png',
      green: 'assets/images/species_green_swallowtail.png',
      purple: 'assets/images/species_purple_emperor.png'
    };

    // Preload all 6 images immediately for instant smooth switching
    Object.values(speciesImages).forEach((src) => {
      const img = new Image();
      img.src = src;
    });

    if (!btns.length) return;

    btns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const speciesKey = btn.getAttribute('data-species');
        if (!speciesKey) return;

        btns.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');

        // Update 3D Model Materials in real-time
        if (window.NXScene && NXScene.setSpecies) {
          NXScene.setSpecies(speciesKey);
        }

        const data = window.NXScene ? NXScene.getSpeciesData(speciesKey) : null;
        const targetImgSrc = (data && data.image) || speciesImages[speciesKey];

        // Smooth crossfade to realistic butterfly image (no layout jumping)
        if (butterflyImg && targetImgSrc) {
          butterflyImg.classList.add('fading');
          setTimeout(() => {
            butterflyImg.src = targetImgSrc;
            if (data && data.name) {
              butterflyImg.alt = `${data.name} Butterfly Specimen`;
            }
            setTimeout(() => {
              butterflyImg.classList.remove('fading');
            }, 30);
          }, 180);
        }

        // Update Dossier with smooth crossfade
        if (data && specLatin && specCommon && specDesc) {
          if (dossier) dossier.style.opacity = '0.3';

          setTimeout(() => {
            specLatin.textContent = data.latin;
            specCommon.textContent = data.name;
            specDesc.textContent = data.desc;
            if (specHabitat) specHabitat.textContent = data.habitat;
            if (specAdaptation) specAdaptation.textContent = data.adaptation;
            if (specPhenom) specPhenom.textContent = data.phenom;

            if (dossier) dossier.style.opacity = '1.0';
          }, 180);
        }
      });
    });
  }

  /**
   * Anatomy Cards Interactive Hover Focus
   */
  function initAnatomyCardInteractions() {
    const cards = document.querySelectorAll('.anatomy-card, .anatomy-narrative-card');
    cards.forEach((card) => {
      const part = card.getAttribute('data-part');
      if (!part || part === 'full') return;

      card.addEventListener('mouseenter', () => {
        const marker = document.getElementById(`hotspot-${part}`);
        if (marker) {
          marker.classList.add('focused');
        }
        if (window.NXScene && NXScene.setActiveAnatomyFocus) {
          NXScene.setActiveAnatomyFocus(part);
        }
      });

      card.addEventListener('mouseleave', () => {
        // Keep active feature clean, no sudden disappearance
      });
    });
  }

  /**
   * Hotspots Direct Click / Tap Navigation
   */
  function initHotspotInteractions() {
    const nodes = document.querySelectorAll('.hotspot-node');
    nodes.forEach((node) => {
      node.addEventListener('click', (e) => {
        e.stopPropagation();
        const part = node.id.replace('hotspot-', '');
        const target = document.getElementById(`anatomy-${part}`);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });
  }

  /**
   * Ambient Living Forest Soundscape (Web Audio API)
   * Generates organic forest breeze with gentle LFO swell & morning canopy chimes
   */
  function initForestAudio() {
    if (!audioBtn) return;

    audioBtn.addEventListener('click', () => {
      if (!isAudioPlaying) {
        startForestAmbiance();
      } else {
        stopForestAmbiance();
      }
    });
  }

  function startForestAmbiance() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!audioCtx) audioCtx = new AudioCtx();
      if (audioCtx.state === 'suspended') audioCtx.resume();

      masterGain = audioCtx.createGain();
      masterGain.gain.setValueAtTime(0.001, audioCtx.currentTime);
      masterGain.gain.linearRampToValueAtTime(0.18, audioCtx.currentTime + 3.0);
      masterGain.connect(audioCtx.destination);

      // 1. Organic Canopy Wind (Filtered Pink Noise)
      const bufferSize = audioCtx.sampleRate * 3;
      const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.04;
        b6 = white * 0.115926;
      }

      windNoise = audioCtx.createBufferSource();
      windNoise.buffer = noiseBuffer;
      windNoise.loop = true;

      windFilter = audioCtx.createBiquadFilter();
      windFilter.type = 'lowpass';
      windFilter.frequency.setValueAtTime(320, audioCtx.currentTime);

      // Low Frequency Oscillator for swaying canopy wind swell
      const lfo = audioCtx.createOscillator();
      const lfoGain = audioCtx.createGain();
      lfo.frequency.setValueAtTime(0.15, audioCtx.currentTime); // 6.6-second wind swell
      lfoGain.gain.setValueAtTime(140, audioCtx.currentTime);
      lfo.connect(windFilter.frequency);
      lfo.start();

      windNoise.connect(windFilter);
      windFilter.connect(masterGain);
      windNoise.start();

      // 2. Soft Morning Botanical Chime Accents
      triggerFloralChimes();

      isAudioPlaying = true;
      audioBtn.classList.add('active');
    } catch (e) {
      console.warn('[ForestAudio] Initialization failed:', e);
    }
  }

  function triggerFloralChimes() {
    if (!isAudioPlaying || !audioCtx || !masterGain) return;

    // Pentatonic frequencies reminiscent of morning sunlight on dew drops
    const notes = [587.33, 659.25, 880.00, 987.77, 1174.66, 1318.51];
    const freq = notes[Math.floor(Math.random() * notes.length)];

    const chimeOsc = audioCtx.createOscillator();
    const chimeGain = audioCtx.createGain();

    chimeOsc.type = 'sine';
    chimeOsc.frequency.setValueAtTime(freq, audioCtx.currentTime);

    chimeGain.gain.setValueAtTime(0.001, audioCtx.currentTime);
    chimeGain.gain.linearRampToValueAtTime(0.025, audioCtx.currentTime + 0.08);
    chimeGain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 2.8);

    chimeOsc.connect(chimeGain);
    chimeGain.connect(masterGain);

    chimeOsc.start();
    chimeOsc.stop(audioCtx.currentTime + 2.9);

    const nextDelay = Math.random() * 3500 + 2000;
    chimerTimer = setTimeout(triggerFloralChimes, nextDelay);
  }

  function stopForestAmbiance() {
    if (chimerTimer) clearTimeout(chimerTimer);

    if (masterGain && audioCtx) {
      masterGain.gain.linearRampToValueAtTime(0.001, audioCtx.currentTime + 1.0);
      setTimeout(() => {
        if (windNoise) {
          try { windNoise.stop(); } catch (e) {}
        }
        if (audioCtx) audioCtx.suspend();
        isAudioPlaying = false;
        audioBtn.classList.remove('active');
      }, 1000);
    }
  }

  /**
   * High-Performance Eased Smooth Scroll Engine
   * Independent of external plugins; works flawlessly across all browsers
   */
  function smoothScrollTo(targetY, duration = 1400, onComplete) {
    const startY = window.pageYOffset || document.documentElement.scrollTop || 0;
    const distance = targetY - startY;

    if (Math.abs(distance) < 2) {
      if (onComplete) onComplete();
      return;
    }

    const startTime = performance.now();

    function animateScroll(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1.0);

      // Smooth easeInOutCubic curve
      const ease = progress < 0.5
        ? 4 * progress * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 3) / 2;

      window.scrollTo(0, startY + distance * ease);

      if (progress < 1.0) {
        requestAnimationFrame(animateScroll);
      } else {
        window.scrollTo(0, targetY);
        if (window.ScrollTrigger) {
          ScrollTrigger.refresh();
        }
        if (onComplete) onComplete();
      }
    }

    requestAnimationFrame(animateScroll);
  }

  /**
   * Smooth Anchor Navigation & Restart Flow
   */
  function initSmoothNavigation() {
    // 1. All Anchor Links (Navigation & In-Page Jumps)
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener('click', (e) => {
        const targetId = anchor.getAttribute('href');
        if (!targetId || targetId === '#') return;

        e.preventDefault();
        e.stopPropagation();

        if (targetId === '#hero' || anchor.id === 'restart-journey-btn') {
          smoothScrollTo(0, 1500, () => {
            if (window.history.replaceState) {
              window.history.replaceState(null, null, window.location.pathname);
            }
          });
          return;
        }

        const targetEl = document.querySelector(targetId);
        if (!targetEl) return;

        const headerHeight = 70;
        const targetRect = targetEl.getBoundingClientRect();
        const targetY = Math.max(0, targetRect.top + window.pageYOffset - headerHeight);
        smoothScrollTo(targetY, 1300);
      });
    });

    // 2. Direct Explicit Handler on Explore Again Button
    if (restartBtn) {
      restartBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        smoothScrollTo(0, 1500, () => {
          if (window.history.replaceState) {
            window.history.replaceState(null, null, window.location.pathname);
          }
          if (window.NXScene && NXScene.resetAssembly) {
            NXScene.resetAssembly();
            setTimeout(() => {
              if (window.NXScene && NXScene.playInitialAssembly) {
                NXScene.playInitialAssembly();
              }
            }, 300);
          }
        });
      });
    }
  }

})();
