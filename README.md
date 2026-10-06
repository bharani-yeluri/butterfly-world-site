# IMMERSIVE 3D BUTTERFLY WORLD — A Living Cinematic Journey

A premium, interactive, scroll-driven **3D WebGL Butterfly World** built with **Three.js**, **GSAP ScrollTrigger**, and modern Vanilla CSS. The visitor enters a living natural sanctuary, discovering the butterfly through cinematic camera journeys, anatomical explorations, microscopic wing scale zooms, realistic flight aerodynamics, metamorphosis, and real-time species diversity.

---

## 🦋 Core Concept & Creative Direction

The website is constructed as a **continuous visual journey** where the 3D butterfly is the main character:

```text
SCROLL 
  → CAMERA MOVEMENT 
  → 3D BUTTERFLY 
  → ANATOMY (Head, Thorax, Abdomen, Wings)
  → SENSORY CORE (Compound Eyes & Ommatidia)
  → PROBOSCIS UNCOILING
  → WING SCALE MICROSTRUCTURE
  → FLIGHT TAKEOFF & WING FLAP LOOP
  → METAMORPHOSIS (Egg → Larva → Chrysalis → Imago)
  → SPECIES DIVERSITY ATLAS (Monarch, Blue Morpho, Emerald Swallowtail, Glasswing, Peacock)
  → POLLINATION & SYMBIOSIS
  → FINAL ASCENT INTO SUNLIGHT CANOPY
```

---

## 🌿 Technical Architecture

1. **Photorealistic 3D Model (`assets/models/monarch_butterfly.glb`)**:
   - 131 detailed meshes generated with PBR physical properties.
   - Dual anatomical wing hinges with independent left/right rotation pivots along the dorsal seam.
   - Segmented body: Head, compound eyes, dual antennae, 6 jointed legs, thoracic chitin plates, segmented abdomen, and hydraulic proboscis.
   - Natural Perch Environment: Velvet orchid blossom petals, central flower stamen, curved monstera leaf, and translucent morning dew drops.
   - Floating golden pollen particle system with Brownian air current physics.

2. **Scroll-Driven 3D Choreography (`js/animations.js`)**:
   - **Chapter 01 // Awakening**: Camera approaches the resting butterfly; solar warming and subtle breathing flutter.
   - **Chapter 02 // Anatomy of Mastery**: Elevated 3D perspective; 4 interactive 3D anatomy hotspot markers projected onto the screen.
   - **Chapter 03 // Compound Eyes**: Extreme macro camera zoom into the hexagonal ommatidia and sensory antennae.
   - **Chapter 04 // Proboscis**: Camera focuses on mouthparts as the proboscis hydraulically uncoils toward the orchid stamen.
   - **Chapter 05 // Wing Scales**: Microscopic dive into overlapping chitin shingles showing pigmentation vs photonic structural color.
   - **Chapter 06 // Flight Aerodynamics**: Takeoff! Butterfly lifts off the perch with an energetic 24 Hz wing flap cycle (clap-and-fling vortex capture).
   - **Chapter 07 // Metamorphosis**: Graceful mid-air hover while cycling through the 4 transformative life stages.
   - **Chapter 08 // Global Species Atlas**: Butterfly assumes a showcase posture. Visitors switch between 5 species with real-time PBR material morphing.
   - **Chapter 09 // Pollination Symbiosis**: Gliding flight through golden pollen clouds.
   - **Final Departure**: Majestic ascent into the sunbeams and forest canopy.

3. **Interactive Features (`js/main.js` & `js/scene.js`)**:
   - **360° Free Orbit Inspection Mode**: Drag to rotate the butterfly freely from any angle.
   - **Species Selector**: Real-time material shader updates for Monarch, Blue Morpho, Emerald Swallowtail, Glasswing, and Peacock.
   - **Living Forest Soundscape**: Procedural Web Audio API synthesizer producing organic canopy breeze with gentle LFO swell and morning botanical chimes.
   - **Custom Natural Leaf Cursor**: Smooth lerp tracking with contextual hover states.

4. **Strict CSS Design System (`css/style.css`)**:
   - Exclusively `px`, `%`, `vw`, and `vh` units (0 `rem` or `em`).
   - Deep botanical palette: Night canopy `#060e0a`, warm sunlight `#fef08a`/`#d4a34b`, emerald `#10b981`.
   - Editorial typography: *Cormorant Garamond* (display headers), *Inter* (editorial body), and *Space Grotesk* (scientific telemetry).

5. **Site 1 Preservation**:
   - The original **NX-01 AURA Headphones** product site remains preserved at `site-1-nx-headphones/` and is accessible via the footer.

---

## 🚀 Running the Experience

The local server is running at:
```bash
http://localhost:8080/
```

To run manually:
```bash
npx serve -l 8080 .
```
