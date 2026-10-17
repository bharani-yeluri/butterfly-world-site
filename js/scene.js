/**
 * IMMERSIVE 3D BUTTERFLY WORLD — THREE.JS SCENE ENGINE
 * Version: 3.1 (Pristine Photorealistic Specimen with Zero Glare & Clean Edges)
 * 
 * Fixes:
 * - Completely eliminated background shadow / blue circle artifact
 * - Removed 3 vertical hinge crease specular lines via smoothstep continuous wing deformation
 * - Switched to natural velvety matte PBR material (roughness: 0.85, metalness: 0.0, zero plastic clearcoat)
 * - Balanced macro studio lighting (soft key daylight, gentle golden rim, zero glare wash-out)
 * - Controlled camera & smooth 3D product-style wing kinematics
 */

window.NXScene = (function () {
  'use strict';

  // Asset Paths
  const BUTTERFLY_PHOTO = 'assets/images/butterfly_front_isolated.png';

  // Core WebGL Elements
  let canvas, renderer, scene, camera;
  let butterflyRoot = null;
  let butterflyMesh = null;
  let basePositions = null;
  let focusSpotlight = null;
  let pollenParticles = null;
  let bokehParticles = null;
  let isModelLoaded = false;
  let onProgressCallback = null;
  let onLoadedCallback = null;
  let flyingButterflies = [];
  let lastFrameTime = 0;

  // Lighting References
  let sunLight, rimLightGold, rimLightCool, ambientLight;

  // Species Configurations
  const speciesData = {
    blue: {
      name: "Blue Morpho",
      latin: "Morpho peleides",
      image: "assets/images/species_blue_morpho.png",
      colorFilter: new THREE.Color(0.25, 0.85, 1.6),
      roughness: 0.55,
      metalness: 0.25,
      desc: "Dazzling Neotropical jewel whose wings contain no blue pigment; nanoscale chitin Christmas-tree ribs reflect only electric blue light.",
      habitat: "Central & South American Rainforest Canopies",
      adaptation: "Flash-and-Dazzle Predator Confusion",
      phenom: "Structural Photonic Interference"
    },
    orange: {
      name: "Monarch Butterfly",
      latin: "Danaus plexippus",
      image: "assets/images/species_orange_monarch.png",
      colorFilter: new THREE.Color(1.0, 1.0, 1.0),
      roughness: 0.85,
      metalness: 0.0,
      desc: "Legendary transcontinental navigators migrating over 4,000 km across North America using an internal magnetic & sun compass.",
      habitat: "North American Meadows & Milkweed Sanctuaries",
      adaptation: "Cardenolide Toxin Storage",
      phenom: "Aposematic Warning Color"
    },
    yellow: {
      name: "Golden Swallowtail",
      latin: "Papilio machaon",
      image: "assets/images/species_yellow_swallowtail.png",
      colorFilter: new THREE.Color(1.3, 1.15, 0.3),
      roughness: 0.65,
      metalness: 0.15,
      desc: "Luminous European & Arctic alpine glider sporting brilliant yellow scales infused with lutein pigment alongside deep black vein ribbing.",
      habitat: "Subalpine Meadows & Palearctic Steppes",
      adaptation: "Aerodynamic Forked Wing Tails",
      phenom: "Solar Thermal Absorption"
    },
    red: {
      name: "Scarlet Postman",
      latin: "Heliconius melpomene",
      image: "assets/images/species_red_postman.png",
      colorFilter: new THREE.Color(1.5, 0.25, 0.35),
      roughness: 0.70,
      metalness: 0.10,
      desc: "Vivid Amazonian passionflower specialist possessing cyanide glycoside immunity and co-evolved Müllerian mimicry rings.",
      habitat: "Amazonian Basin & Understory Vine Forests",
      adaptation: "Cyanogenic Glycoside Defenses",
      phenom: "Müllerian Warning Display"
    },
    green: {
      name: "Emerald Swallowtail",
      latin: "Papilio palinurus",
      image: "assets/images/species_green_swallowtail.png",
      colorFilter: new THREE.Color(0.3, 1.45, 0.8),
      roughness: 0.60,
      metalness: 0.20,
      desc: "One of the few butterflies with brilliant emerald coloration, produced by concave micro-cavities reflecting yellow and blue wavelengths simultaneously.",
      habitat: "Southeast Asian River Valleys & Lowland Forests",
      adaptation: "Scalloped Wing Tails & Aerodynamic Gliding",
      phenom: "Micro-Concave Retro-Reflection"
    },
    purple: {
      name: "Purple Emperor",
      latin: "Apatura iris",
      image: "assets/images/species_purple_emperor.png",
      colorFilter: new THREE.Color(1.1, 0.4, 1.6),
      roughness: 0.50,
      metalness: 0.30,
      desc: "Majestic European canopy dweller whose dorsal wings flash deep iridescent violet-purple when angled precisely to incoming sunlight.",
      habitat: "Ancient Oak & Sallow Deciduous Canopies",
      adaptation: "High-Canopy Territorial Dominance",
      phenom: "Angle-Dependent Violet Iridescence"
    }
  };

  // Aliases for compatibility
  speciesData.monarch = speciesData.orange;
  speciesData.morpho = speciesData.blue;
  speciesData.swallowtail = speciesData.green;

  let currentSpeciesKey = 'orange';

  // Responsive Viewport Configuration Matrix
  function getResponsiveLayout() {
    const w = typeof window !== 'undefined' ? window.innerWidth : 1440;
    const h = typeof window !== 'undefined' ? window.innerHeight : 900;

    // Desktop (>= 1200px) - Naturally proportional scaling where width and height scale together
    if (w >= 1200) {
      const proportionalRatio = Math.min(w / 1440, h / 900);
      const baseScale = Math.max(0.63, Math.min(0.79, 0.73 * proportionalRatio));
      return {
        isDesktop: true,
        baseScale: baseScale,
        heroX: 0.52,
        heroY: 0.0,
        cameraZ: 5.30,
        fov: 34
      };
    }

    // Tablet Landscape (1024px)
    if (w >= 821) {
      const proportionalRatio = Math.min(w / 1024, h / 768);
      const baseScale = Math.max(0.37, Math.min(0.45, 0.42 * proportionalRatio));
      return {
        isDesktop: false,
        isTabletLandscape: true,
        baseScale: baseScale,
        heroX: 0.44,
        heroY: 0.02,
        cameraZ: 5.40,
        fov: 34
      };
    }

    // Tablet Portrait (768px)
    if (w >= 601) {
      const proportionalRatio = Math.min(w / 768, h / 1024);
      const baseScale = Math.max(0.26, Math.min(0.32, 0.28 * proportionalRatio));
      return {
        isDesktop: false,
        baseScale: baseScale,
        heroX: 0.0,
        heroY: 0.38,
        cameraZ: 5.60,
        fov: 34
      };
    }

    // Phablet / Small Tablet (600px)
    if (w >= 481) {
      const proportionalRatio = Math.min(w / 540, h / 800);
      const baseScale = Math.max(0.22, Math.min(0.26, 0.23 * proportionalRatio));
      return {
        isDesktop: false,
        baseScale: baseScale,
        heroX: 0.0,
        heroY: 0.42,
        cameraZ: 5.70,
        fov: 34
      };
    }

    // Mobile (480px)
    if (w >= 391) {
      const proportionalRatio = Math.min(w / 414, h / 896);
      const baseScale = Math.max(0.19, Math.min(0.23, 0.20 * proportionalRatio));
      return {
        isDesktop: false,
        baseScale: baseScale,
        heroX: 0.0,
        heroY: 0.47,
        cameraZ: 5.80,
        fov: 34
      };
    }

    // Standard Mobile (390px, 360px)
    if (w >= 341) {
      const proportionalRatio = Math.min(w / 375, h / 812);
      const baseScale = Math.max(0.175, Math.min(0.21, 0.185 * proportionalRatio));
      return {
        isDesktop: false,
        baseScale: baseScale,
        heroX: 0.0,
        heroY: 0.49,
        cameraZ: 5.85,
        fov: 34
      };
    }

    // Smallest Mobile (320px)
    return {
      isDesktop: false,
      baseScale: 0.175,
      heroX: 0.0,
      heroY: 0.50,
      cameraZ: 5.85,
      fov: 34
    };
  }

  // Camera & Transform State
  const initLayout = getResponsiveLayout();
  const currentCameraPos = new THREE.Vector3(0, 0.05, initLayout.cameraZ);
  const targetCameraPos = new THREE.Vector3(0, 0.05, initLayout.cameraZ);

  const currentLookAt = new THREE.Vector3(0, 0, 0);
  const targetLookAt = new THREE.Vector3(0, 0, 0);

  // Front-facing orientation
  const currentModelRot = new THREE.Euler(0, 0, 0);
  const targetModelRot = new THREE.Euler(0, 0, 0);

  const currentModelPos = new THREE.Vector3(initLayout.heroX, initLayout.heroY, 0);
  const targetModelPos = new THREE.Vector3(initLayout.heroX, initLayout.heroY, 0);

  let currentModelScale = initLayout.baseScale;
  let targetModelScale = initLayout.baseScale;

  // 3D Wing Kinematics (Opening & Closing)
  // 0.12 = natural resting open dihedral matching reference shot; >0.55 = closed
  let currentWingAngle = 0.12;
  let targetWingAngle = 0.12;
  let flightIntensity = 0.0;
  let targetFlightIntensity = 0.0;

  // Active Anatomy Part Focal Tracking
  let activeAnatomyKey = null;

  // Interactive 360 Orbit State
  let isInteractiveMode = false;
  let isPointerDown = false;

  // Initial 3D Butterfly Assembly State
  let assemblyGroup = null;
  let leftWingPartGroup = null;
  let rightWingPartGroup = null;
  let bodyPartGroup = null;
  let isAssemblyComplete = false;
  let butterflyMaterials = [];
  let pointerStart = { x: 0, y: 0 };
  let interactiveRotation = { x: 0, y: 0 };
  let interactiveTargetRot = { x: 0, y: 0 };

  // Mouse Parallax
  let mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };

  // Exact 9 Anatomical 3D Anchors on the Front-Facing Specimen
  const hotspotAnchors = [
    { id: 'hotspot-head', pos: new THREE.Vector3(0.0, 0.46, 0.08), name: 'Head' },
    { id: 'hotspot-antennae', pos: new THREE.Vector3(-0.61, 1.16, 0.05), name: 'Antennae' },
    { id: 'hotspot-eyes', pos: new THREE.Vector3(0.10, 0.42, 0.09), name: 'Compound Eyes' },
    { id: 'hotspot-proboscis', pos: new THREE.Vector3(0.0, 0.32, 0.08), name: 'Proboscis' },
    { id: 'hotspot-thorax', pos: new THREE.Vector3(0.0, 0.05, 0.09), name: 'Thorax' },
    { id: 'hotspot-wings', pos: new THREE.Vector3(0.98, 0.56, 0.05), name: 'Wings' },
    { id: 'hotspot-scales', pos: new THREE.Vector3(1.30, 1.11, 0.05), name: 'Wing Scales' },
    { id: 'hotspot-legs', pos: new THREE.Vector3(-0.32, -0.18, 0.08), name: 'Legs' },
    { id: 'hotspot-abdomen', pos: new THREE.Vector3(0.0, -0.69, 0.08), name: 'Abdomen' }
  ];

  let hotspotsVisible = false;
  const clock = new THREE.Clock();

  /**
   * Initialize Three.js WebGL Scene
   */
  function init(containerId, canvasId) {
    canvas = document.getElementById(canvasId);
    const container = document.getElementById(containerId);
    if (!canvas || !container) {
      console.error('[NXScene] Canvas or container not found.');
      return;
    }

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(34, width / height, 0.1, 100);
    camera.position.copy(currentCameraPos);
    camera.lookAt(currentLookAt);

    // Clean alpha renderer for seamless integration with dark navy CSS gradient
    renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: true,
      powerPreference: 'high-performance',
      alpha: true
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.toneMapping = THREE.LinearToneMapping;
    renderer.toneMappingExposure = 1.0;
    renderer.outputEncoding = THREE.sRGBEncoding;

    setupLighting();
    setupPollenAtmosphere();
    setupInteractions(canvas);
    loadPhotorealisticButterfly();
    animate();

    console.log('[NXScene] Initialized with Zero-Glare Photorealistic Specimen.');
  }

  /**
   * Balanced Natural Wildlife Macro Lighting (Zero Glare Wash-Out)
   */
  function setupLighting() {
    // Soft deep canopy ambient
    ambientLight = new THREE.AmbientLight(0x18283c, 1.25);
    scene.add(ambientLight);

    // Soft warm key daylight (intensity 1.1, avoids blowing out highlights)
    sunLight = new THREE.DirectionalLight(0xfffaf0, 1.1);
    sunLight.position.set(2.5, 4.0, 4.5);
    scene.add(sunLight);

    // Warm golden rim light (grazes wing contours softly)
    rimLightGold = new THREE.DirectionalLight(0xf59e0b, 0.9);
    rimLightGold.position.set(-3.5, 2.5, -2.5);
    scene.add(rimLightGold);

    // Soft sky fill accent
    rimLightCool = new THREE.DirectionalLight(0x38bdf8, 0.35);
    rimLightCool.position.set(3.5, -1.5, 2.0);
    scene.add(rimLightCool);

    // Gentle 3D Focal Spotlight for Anatomy (warm, subtle amber glow without harsh glare)
    focusSpotlight = new THREE.PointLight(0xfef08a, 0.0, 3.5, 2.0);
    focusSpotlight.position.set(0, 0, 1.0);
    scene.add(focusSpotlight);
  }

  /**
   * Cinematic Golden Bokeh Orbs & Ambient Floating Pollen Dust
   * Mimics the out-of-focus camera bokeh discs seen in the reference specimen shot
   */
  function setupPollenAtmosphere() {
    // -----------------------------------------------------------
    // LAYER 1: Large Soft Out-Of-Focus Golden Bokeh Discs
    // -----------------------------------------------------------
    const bokehCount = 48;
    const bokehGeom = new THREE.BufferGeometry();
    const bokehPositions = new Float32Array(bokehCount * 3);
    const bokehSpeeds = new Float32Array(bokehCount * 3);

    // Initial clusters matching the reference composition
    const keyClusters = [
      { x: 3.4, y: 1.6, z: -1.2 },  // Upper-right prominent cluster
      { x: 3.8, y: 1.3, z: -1.8 },
      { x: 3.2, y: 1.9, z: -1.0 },
      { x: -2.4, y: -1.8, z: -0.8 }, // Lower-left under scroll motif
      { x: -2.8, y: -1.5, z: -1.4 },
      { x: 0.8, y: -2.3, z: -1.2 },  // Bottom center under abdomen
      { x: -0.6, y: -2.4, z: -1.6 },
      { x: 2.2, y: -2.2, z: -1.5 },
      { x: -3.2, y: 0.6, z: -1.4 },  // Mid-left behind title
      { x: -3.5, y: 1.2, z: -1.6 }
    ];

    for (let i = 0; i < bokehCount; i++) {
      if (i < keyClusters.length) {
        bokehPositions[i * 3 + 0] = keyClusters[i].x + (Math.random() - 0.5) * 0.7;
        bokehPositions[i * 3 + 1] = keyClusters[i].y + (Math.random() - 0.5) * 0.7;
        bokehPositions[i * 3 + 2] = keyClusters[i].z + (Math.random() - 0.5) * 0.6;
      } else {
        bokehPositions[i * 3 + 0] = (Math.random() - 0.5) * 11.0;
        bokehPositions[i * 3 + 1] = (Math.random() - 0.5) * 7.5;
        bokehPositions[i * 3 + 2] = -0.5 - Math.random() * 2.8;
      }

      bokehSpeeds[i * 3 + 0] = (Math.random() - 0.5) * 0.0006;
      bokehSpeeds[i * 3 + 1] = Math.random() * 0.0007 + 0.0003;
      bokehSpeeds[i * 3 + 2] = (Math.random() - 0.5) * 0.0005;
    }

    bokehGeom.setAttribute('position', new THREE.BufferAttribute(bokehPositions, 3));
    bokehGeom.userData = { speeds: bokehSpeeds };

    // High quality soft bokeh disc texture
    const bCanvas = document.createElement('canvas');
    bCanvas.width = 64;
    bCanvas.height = 64;
    const bCtx = bCanvas.getContext('2d');
    const bGrad = bCtx.createRadialGradient(32, 32, 0, 32, 32, 32);
    bGrad.addColorStop(0, 'rgba(255, 250, 215, 0.85)');
    bGrad.addColorStop(0.28, 'rgba(254, 215, 95, 0.60)');
    bGrad.addColorStop(0.60, 'rgba(217, 135, 30, 0.22)');
    bGrad.addColorStop(0.85, 'rgba(180, 90, 15, 0.08)');
    bGrad.addColorStop(1, 'rgba(180, 90, 15, 0)');
    bCtx.fillStyle = bGrad;
    bCtx.fillRect(0, 0, 64, 64);

    const bokehTexture = new THREE.CanvasTexture(bCanvas);

    const bokehMaterial = new THREE.PointsMaterial({
      color: 0xffe89e,
      size: 0.68,
      map: bokehTexture,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    bokehParticles = new THREE.Points(bokehGeom, bokehMaterial);
    scene.add(bokehParticles);

    // -----------------------------------------------------------
    // LAYER 2: Fine Floating Golden Micro-Pollen Specks
    // -----------------------------------------------------------
    const particleCount = 130;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const speeds = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3 + 0] = (Math.random() - 0.5) * 12;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 8.5;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 5;

      speeds[i * 3 + 0] = (Math.random() - 0.5) * 0.0015;
      speeds[i * 3 + 1] = Math.random() * 0.0016 + 0.0006;
      speeds[i * 3 + 2] = (Math.random() - 0.5) * 0.0015;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.userData = { speeds: speeds };

    const pCanvas = document.createElement('canvas');
    pCanvas.width = 32;
    pCanvas.height = 32;
    const ctx = pCanvas.getContext('2d');
    const grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    grad.addColorStop(0, 'rgba(255, 255, 230, 0.95)');
    grad.addColorStop(0.35, 'rgba(254, 230, 120, 0.55)');
    grad.addColorStop(1, 'rgba(212, 163, 75, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 32, 32);

    const texture = new THREE.CanvasTexture(pCanvas);

    const material = new THREE.PointsMaterial({
      color: 0xfff4a8,
      size: 0.075,
      map: texture,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    pollenParticles = new THREE.Points(geometry, material);
    scene.add(pollenParticles);
  }

  /**
   * Load & Build Photorealistic Butterfly 3D Object
   */
  function loadPhotorealisticButterfly() {
    if (typeof onProgressCallback === 'function') onProgressCallback(40);

    function onPhotoReady(photoTexture) {
      photoTexture.encoding = THREE.sRGBEncoding;
      photoTexture.generateMipmaps = true;
      photoTexture.minFilter = THREE.LinearMipmapLinearFilter;
      photoTexture.magFilter = THREE.LinearFilter;
      photoTexture.needsUpdate = true;

      if (renderer && renderer.capabilities) {
        photoTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();
      }

      if (typeof onProgressCallback === 'function') onProgressCallback(85);
      createButterflyGeometry(photoTexture);
    }

    // 1. Instant Global Base64 Texture
    if (window.REAL_BUTTERFLY_BASE64 && window.REAL_BUTTERFLY_BASE64.length > 500) {
      const img = new Image();
      img.onload = function () {
        const photoTexture = new THREE.Texture(img);
        photoTexture.needsUpdate = true;
        onPhotoReady(photoTexture);
      };
      img.onerror = function () {
        fallbackToTextureLoader();
      };
      img.src = window.REAL_BUTTERFLY_BASE64;
      return;
    }

    fallbackToTextureLoader();

    function fallbackToTextureLoader() {
      const textureLoader = new THREE.TextureLoader();
      textureLoader.load(
        BUTTERFLY_PHOTO,
        onPhotoReady,
        undefined,
        function () {
          createProceduralFallback();
        }
      );
    }
  }

  /**
   * Construct 3D Articulated Front-Facing Butterfly Mesh
   * Uses smooth continuous blending to eliminate any sharp hinge creases
   */
  function createButterflyGeometry(photoTexture) {
    butterflyRoot = new THREE.Group();
    butterflyRoot.name = 'ButterflyWorld_Root';

    const meshWidth = 4.0;
    const meshHeight = 4.0;

    // Subdivided 96x96 grid for fluid organic flex
    const geometry = new THREE.PlaneGeometry(meshWidth, meshHeight, 96, 96);
    const pos = geometry.attributes.position;
    const vertexCount = pos.count;

    basePositions = new Float32Array(vertexCount * 3);

    for (let i = 0; i < vertexCount; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);

      // Smooth, gentle biological body thickness (soft 0.05 height, no sharp ridge)
      const bodyArch = Math.exp(-Math.pow(x / 0.28, 2)) * 0.05;

      // Subtle aerofoil camber
      const distFromCenter = Math.abs(x);
      const wingCamber = Math.sin((distFromCenter / 2.0) * Math.PI) * 0.04;

      const baseZ = bodyArch + wingCamber;

      basePositions[i * 3 + 0] = x;
      basePositions[i * 3 + 1] = y;
      basePositions[i * 3 + 2] = baseZ;

      pos.setZ(i, baseZ);
    }

    geometry.computeVertexNormals();

    // Natural Matte Velvet Chitin Material (No shiny plastic clearcoat glare!)
    const material = new THREE.MeshStandardMaterial({
      map: photoTexture,
      transparent: true,
      alphaTest: 0.08,
      depthWrite: false,
      roughness: 0.85,
      metalness: 0.0,
      side: THREE.DoubleSide
    });

    butterflyMesh = new THREE.Mesh(geometry, material);
    butterflyMesh.name = 'Photorealistic_Front_Monarch';
    butterflyRoot.add(butterflyMesh);

    butterflyMaterials = [material];

    // Construct Separate Anatomical Parts for Initial Cinematic Assembly
    createAssemblyParts(photoTexture, material);

    // Attach 3D Anchor Objects for the 9 Anatomy Features
    hotspotAnchors.forEach((anchor) => {
      const anchorObj = new THREE.Object3D();
      anchorObj.name = `Anchor_${anchor.name.replace(/\s+/g, '_')}`;
      anchorObj.position.copy(anchor.pos);
      butterflyRoot.add(anchorObj);
      anchor.obj = anchorObj;
    });

    butterflyRoot.position.copy(currentModelPos);
    butterflyRoot.rotation.copy(currentModelRot);
    butterflyRoot.scale.set(currentModelScale, currentModelScale, currentModelScale);

    scene.add(butterflyRoot);
    isModelLoaded = true;

    // Natural ambient butterflies flying freely into the scene from the top
    setupFlyingButterflies(photoTexture);

    if (typeof onLoadedCallback === 'function') onLoadedCallback();
    console.log('[NXScene] 3D Butterfly Mesh constructed with smooth organic blending and initial assembly parts.');
  }

  /**
   * Construct 3 Separate Anatomical Parts for Initial Assembly:
   * 1. Left Wing Assembly (Forewing + Hindwing)
   * 2. Right Wing Assembly (Forewing + Hindwing)
   * 3. Central Body Axis (Head, Antennae, Thorax, Abdomen, Legs)
   * All parts map to the exact global UV space for 100% seamless convergence.
   */
  /**
   * Construct 3 Anatomical Parts for Initial Cinematic Assembly:
   * 1. Left Wing System (Forewing + Hindwing, cleanly masked from antennae & head)
   * 2. Right Wing System (Forewing + Hindwing, cleanly masked from antennae & head)
   * 3. Central Chitin Specimen Body (Head with full antennae, Thorax, Abdomen, Legs)
   *
   * All parts share the exact underlying 3D geometry and UV coordinates as the master
   * specimen, guaranteeing 100.0% millimeter-precise, seamless convergence into ONE butterfly.
   */
  function createAssemblyParts(photoTexture, material) {
    assemblyGroup = new THREE.Group();
    assemblyGroup.name = 'Initial_Assembly_Parts';

    const img = photoTexture.image;
    if (!img) {
      butterflyRoot.add(assemblyGroup);
      return;
    }

    const W = img.naturalWidth || img.width || 1024;
    const H = img.naturalHeight || img.height || 1024;

    // Exact landmark points for the antennae centerlines on 1024x1024 resolution
    const pts = [
      [210, 346], [215, 350], [220, 357], [240, 386], [260, 401],
      [280, 415], [300, 431], [320, 447], [340, 463],
      [360, 477], [380, 489], [400, 497], [420, 500], [435, 502]
    ];

    function getLeftAntennaX(yNorm) {
      if (yNorm < 205 || yNorm > 435) return null;
      if (yNorm <= pts[0][0]) return pts[0][1] * (W / 1024);
      for (let i = 0; i < pts.length - 1; i++) {
        if (yNorm >= pts[i][0] && yNorm <= pts[i + 1][0]) {
          const t = (yNorm - pts[i][0]) / (pts[i + 1][0] - pts[i][0]);
          return (pts[i][1] + t * (pts[i + 1][1] - pts[i][1])) * (W / 1024);
        }
      }
      return pts[pts.length - 1][1] * (W / 1024);
    }

    function createPartCanvas(type) {
      const c = document.createElement('canvas');
      c.width = W;
      c.height = H;
      const ctx = c.getContext('2d');
      ctx.drawImage(img, 0, 0, W, H);
      const imgData = ctx.getImageData(0, 0, W, H);
      const data = imgData.data;

      const centerX = W * 0.5;
      const scaleX = W / 1024;
      const scaleY = H / 1024;

      for (let y = 0; y < H; y++) {
        const yNorm = y / scaleY;
        const antX = getLeftAntennaX(yNorm);
        const rightAntX = antX !== null ? (W - antX) : null;

        for (let x = 0; x < W; x++) {
          const idx = (y * W + x) * 4;
          const origA = data[idx + 3];
          if (origA === 0) continue;

          const pad = ((yNorm < 235) ? 14 : 9) * scaleX;
          const isLeftAnt = antX !== null && Math.abs(x - antX) <= pad;
          const isRightAnt = rightAntX !== null && Math.abs(x - rightAntX) <= pad;
          const isAntenna = isLeftAnt || isRightAnt;
          const distFromCenter = Math.abs(x - centerX);

          let keepFactor = 0;

          if (type === 'body') {
            if (isAntenna) {
              keepFactor = 1.0;
            } else if (yNorm >= 400 && yNorm < 445) {
              // Head & Compound Eyes
              const headRadius = 36 * scaleX;
              if (distFromCenter <= headRadius) {
                keepFactor = 1.0;
              } else if (distFromCenter <= headRadius + 8 * scaleX) {
                keepFactor = 1.0 - (distFromCenter - headRadius) / (8 * scaleX);
              }
            } else if (yNorm >= 445 && yNorm < 600) {
              // Thorax & Legs
              const thoraxRadius = 46 * scaleX;
              if (distFromCenter <= thoraxRadius) {
                keepFactor = 1.0;
              } else if (distFromCenter <= thoraxRadius + 16 * scaleX) {
                keepFactor = 1.0 - (distFromCenter - thoraxRadius) / (16 * scaleX);
              }
            } else if (yNorm >= 600) {
              // Segmented Abdomen
              const abdomenRadius = 38 * scaleX;
              if (distFromCenter <= abdomenRadius) {
                keepFactor = 1.0;
              } else if (distFromCenter <= abdomenRadius + 12 * scaleX) {
                keepFactor = 1.0 - (distFromCenter - abdomenRadius) / (12 * scaleX);
              }
            }
          } else if (type === 'leftWing') {
            if (isAntenna || (antX !== null && Math.abs(x - antX) <= pad + 6 * scaleX) || (x >= (centerX - 36 * scaleX) && yNorm < 445)) {
              keepFactor = 0.0; // Completely exclude head & antennae from left wing
            } else if (x < centerX) {
              if (yNorm < 445) {
                keepFactor = 1.0; // Pure forewing leading margin
              } else {
                const distToCenter = centerX - x;
                const attachRadius = 42 * scaleX;
                if (distToCenter >= attachRadius + 16 * scaleX) {
                  keepFactor = 1.0;
                } else if (distToCenter >= attachRadius) {
                  keepFactor = (distToCenter - attachRadius) / (16 * scaleX);
                }
              }
            }
          } else if (type === 'rightWing') {
            if (isAntenna || (rightAntX !== null && Math.abs(x - rightAntX) <= pad + 6 * scaleX) || (x <= (centerX + 36 * scaleX) && yNorm < 445)) {
              keepFactor = 0.0; // Completely exclude head & antennae from right wing
            } else if (x > centerX) {
              if (yNorm < 445) {
                keepFactor = 1.0; // Pure forewing leading margin
              } else {
                const distToCenter = x - centerX;
                const attachRadius = 42 * scaleX;
                if (distToCenter >= attachRadius + 16 * scaleX) {
                  keepFactor = 1.0;
                } else if (distToCenter >= attachRadius) {
                  keepFactor = (distToCenter - attachRadius) / (16 * scaleX);
                }
              }
            }
          }

          data[idx + 3] = Math.round(origA * keepFactor);
        }
      }

      ctx.putImageData(imgData, 0, 0);
      return c;
    }

    const bodyCanvas = createPartCanvas('body');
    const lwCanvas = createPartCanvas('leftWing');
    const rwCanvas = createPartCanvas('rightWing');

    function createPartTexture(c) {
      const tex = new THREE.CanvasTexture(c);
      tex.encoding = THREE.sRGBEncoding;
      tex.generateMipmaps = true;
      tex.minFilter = THREE.LinearMipmapLinearFilter;
      tex.magFilter = THREE.LinearFilter;
      if (renderer && renderer.capabilities) {
        tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
      }
      tex.needsUpdate = true;
      return tex;
    }

    const bodyTex = createPartTexture(bodyCanvas);
    const lwTex = createPartTexture(lwCanvas);
    const rwTex = createPartTexture(rwCanvas);

    const bodyMat = material.clone();
    bodyMat.map = bodyTex;
    butterflyMaterials.push(bodyMat);

    const lwMat = material.clone();
    lwMat.map = lwTex;
    butterflyMaterials.push(lwMat);

    const rwMat = material.clone();
    rwMat.map = rwTex;
    butterflyMaterials.push(rwMat);

    // 1. LEFT WING PART (forewing + hindwing)
    leftWingPartGroup = new THREE.Group();
    leftWingPartGroup.name = 'Assembly_Left_Wing';
    const lwMesh = new THREE.Mesh(butterflyMesh.geometry.clone(), lwMat);
    lwMesh.name = 'Part_Left_Wing_Mesh';
    leftWingPartGroup.add(lwMesh);
    assemblyGroup.add(leftWingPartGroup);

    // 2. RIGHT WING PART (forewing + hindwing)
    rightWingPartGroup = new THREE.Group();
    rightWingPartGroup.name = 'Assembly_Right_Wing';
    const rwMesh = new THREE.Mesh(butterflyMesh.geometry.clone(), rwMat);
    rwMesh.name = 'Part_Right_Wing_Mesh';
    rightWingPartGroup.add(rwMesh);
    assemblyGroup.add(rightWingPartGroup);

    // 3. CENTRAL SPECIMEN BODY (head, intact curved antennae, thorax, legs, abdomen)
    bodyPartGroup = new THREE.Group();
    bodyPartGroup.name = 'Assembly_Central_Body';
    const bodyMesh = new THREE.Mesh(butterflyMesh.geometry.clone(), bodyMat);
    bodyMesh.name = 'Part_Central_Body_Mesh';
    bodyPartGroup.add(bodyMesh);
    assemblyGroup.add(bodyPartGroup);

    butterflyRoot.add(assemblyGroup);
    resetAssemblyToInitialState();
  }

  function resetAssemblyToInitialState() {
    isAssemblyComplete = false;
    if (butterflyMesh) butterflyMesh.visible = false;
    if (assemblyGroup) assemblyGroup.visible = true;

    // Start: separate butterfly parts floating distinctly and gracefully in 3D space
    if (leftWingPartGroup) {
      leftWingPartGroup.position.set(-0.85, 0.16, 0.40);
      leftWingPartGroup.rotation.set(0.08, 0.30, -0.16);
    }
    if (rightWingPartGroup) {
      rightWingPartGroup.position.set(0.85, 0.16, 0.40);
      rightWingPartGroup.rotation.set(0.08, -0.30, 0.16);
    }
    if (bodyPartGroup) {
      bodyPartGroup.position.set(0.0, -0.20, -0.32);
      bodyPartGroup.rotation.set(-0.12, 0.0, 0.0);
    }
  }

  function completeAssemblyImmediately() {
    isAssemblyComplete = true;
    if (leftWingPartGroup) {
      leftWingPartGroup.position.set(0, 0, 0);
      leftWingPartGroup.rotation.set(0, 0, 0);
    }
    if (rightWingPartGroup) {
      rightWingPartGroup.position.set(0, 0, 0);
      rightWingPartGroup.rotation.set(0, 0, 0);
    }
    if (bodyPartGroup) {
      bodyPartGroup.position.set(0, 0, 0);
      bodyPartGroup.rotation.set(0, 0, 0);
    }
    if (butterflyMesh) butterflyMesh.visible = true;
    if (assemblyGroup) assemblyGroup.visible = false;
  }

  function playInitialAssembly(onComplete) {
    if (isAssemblyComplete) return;

    if (window.scrollY > 40) {
      completeAssemblyImmediately();
      if (typeof onComplete === 'function') onComplete();
      return;
    }

    resetAssemblyToInitialState();

    const tl = gsap.timeline({
      onComplete: () => {
        completeAssemblyImmediately();
        // Gentle organic awakening flutter when parts lock into place
        gsap.to(NXScene, {
          wingAngle: 0.24,
          duration: 0.45,
          ease: 'power2.out',
          yoyo: true,
          repeat: 1,
          onComplete: () => {
            NXScene.wingAngle = 0.12;
            if (typeof onComplete === 'function') onComplete();
          }
        });
      }
    });

    // Smooth movement: separate parts glide and converge with silky cubic easing
    tl.to(leftWingPartGroup.position, {
      x: 0.0,
      y: 0.0,
      z: 0.0,
      duration: 1.85,
      ease: 'power3.out'
    }, 0);
    tl.to(leftWingPartGroup.rotation, {
      x: 0.0,
      y: 0.0,
      z: 0.0,
      duration: 1.85,
      ease: 'power3.out'
    }, 0);

    tl.to(rightWingPartGroup.position, {
      x: 0.0,
      y: 0.0,
      z: 0.0,
      duration: 1.85,
      ease: 'power3.out'
    }, 0);
    tl.to(rightWingPartGroup.rotation, {
      x: 0.0,
      y: 0.0,
      z: 0.0,
      duration: 1.85,
      ease: 'power3.out'
    }, 0);

    tl.to(bodyPartGroup.position, {
      x: 0.0,
      y: 0.0,
      z: 0.0,
      duration: 1.75,
      ease: 'power3.out'
    }, 0.06);
    tl.to(bodyPartGroup.rotation, {
      x: 0.0,
      y: 0.0,
      z: 0.0,
      duration: 1.75,
      ease: 'power3.out'
    }, 0.06);
  }

  function createProceduralFallback() {
    const canvas = document.createElement('canvas');
    canvas.width = 512; canvas.height = 512;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, 512, 512);
    const texture = new THREE.CanvasTexture(canvas);
    createButterflyGeometry(texture);
  }

  /**
   * Natural Ambient Flying Butterflies System
   * Butterflies enter naturally from the top of the viewport, flying freely
   * across the scene with rapid realistic wing-flapping, continuous organic
   * curves, small turns, and banking.
   */
  function setupFlyingButterflies(photoTexture) {
    if (!scene || flyingButterflies.length > 0) return;

    const butterflyConfigs = [
      { name: 'Monarch', color: new THREE.Color(1.0, 1.0, 1.0), scale: 0.28, baseSpeed: 1.25, flapFreq: 34.0, amp: 0.85 },
      { name: 'Blue Morpho', color: new THREE.Color(0.28, 0.90, 1.6), scale: 0.32, baseSpeed: 1.38, flapFreq: 31.0, amp: 0.90 },
      { name: 'Golden Swallowtail', color: new THREE.Color(1.35, 1.18, 0.35), scale: 0.26, baseSpeed: 1.30, flapFreq: 36.0, amp: 0.80 },
      { name: 'Emerald Swallowtail', color: new THREE.Color(0.35, 1.45, 0.75), scale: 0.30, baseSpeed: 1.35, flapFreq: 32.0, amp: 0.88 },
      { name: 'Monarch Amber', color: new THREE.Color(1.15, 0.85, 0.40), scale: 0.24, baseSpeed: 1.20, flapFreq: 38.0, amp: 0.82 },
      { name: 'Purple Emperor', color: new THREE.Color(1.15, 0.45, 1.6), scale: 0.27, baseSpeed: 1.32, flapFreq: 33.0, amp: 0.85 }
    ];

    // Shared wing geometries with centered dorsal hinge pivots
    const wingW = 0.96;
    const wingH = 0.96;

    // Left wing: pivot at right edge (x = 0)
    const leftGeom = new THREE.PlaneGeometry(wingW, wingH, 6, 6);
    leftGeom.translate(-wingW / 2, 0, 0);
    const leftUv = leftGeom.attributes.uv;
    for (let i = 0; i < leftUv.count; i++) {
      leftUv.setX(i, leftUv.getX(i) * 0.485);
    }
    leftUv.needsUpdate = true;

    // Right wing: pivot at left edge (x = 0)
    const rightGeom = new THREE.PlaneGeometry(wingW, wingH, 6, 6);
    rightGeom.translate(wingW / 2, 0, 0);
    const rightUv = rightGeom.attributes.uv;
    for (let i = 0; i < rightUv.count; i++) {
      rightUv.setX(i, 0.515 + rightUv.getX(i) * 0.485);
    }
    rightUv.needsUpdate = true;

    // Center body
    const bodyGeom = new THREE.PlaneGeometry(0.18, 0.92, 2, 4);
    const bodyUv = bodyGeom.attributes.uv;
    for (let i = 0; i < bodyUv.count; i++) {
      bodyUv.setX(i, 0.44 + bodyUv.getX(i) * 0.12);
    }
    bodyUv.needsUpdate = true;

    // Initial staggered entry positions: entering from the top canopy
    const initialOffsets = [
      { x: -1.4, y: 2.4, z: 0.1, vx: 0.45, vy: -1.05, vz: -0.05 },  // Entering top-left
      { x: 0.8, y: 2.7, z: -0.4, vx: -0.35, vy: -1.15, vz: 0.08 },  // Entering top-center/right
      { x: 1.8, y: 1.4, z: -0.8, vx: -0.75, vy: -0.45, vz: 0.10 },  // Upper canopy flight right
      { x: -1.6, y: 1.1, z: 0.3, vx: 0.65, vy: 0.25, vz: -0.08 },   // Upper canopy flight left ascending
      { x: 0.4, y: 0.85, z: -0.3, vx: 0.55, vy: 0.35, vz: 0.05 },   // Upper canopy swoop
      { x: -0.5, y: 2.9, z: -0.2, vx: 0.25, vy: -1.20, vz: -0.06 }   // High canopy entering top
    ];

    butterflyConfigs.forEach((cfg, idx) => {
      const root = new THREE.Group();
      root.name = `FlyingButterfly_${cfg.name.replace(/\s+/g, '_')}_${idx}`;

      const rollGroup = new THREE.Group();
      const modelGroup = new THREE.Group();
      // Orient butterfly model: head (was +Y) points forward along -Z; dorsal faces up along +Y
      modelGroup.rotation.x = -Math.PI / 2;

      // Realistic velvety material matching specimen lighting
      const mat = new THREE.MeshStandardMaterial({
        map: photoTexture,
        color: cfg.color,
        transparent: true,
        alphaTest: 0.08,
        depthWrite: false,
        roughness: 0.80,
        metalness: 0.0,
        side: THREE.DoubleSide
      });

      const leftPivot = new THREE.Group();
      const leftMesh = new THREE.Mesh(leftGeom, mat);
      leftMesh.renderOrder = 4;
      leftPivot.add(leftMesh);

      const rightPivot = new THREE.Group();
      const rightMesh = new THREE.Mesh(rightGeom, mat);
      rightMesh.renderOrder = 4;
      rightPivot.add(rightMesh);

      const bodyMesh = new THREE.Mesh(bodyGeom, mat);
      bodyMesh.renderOrder = 4;

      modelGroup.add(leftPivot);
      modelGroup.add(rightPivot);
      modelGroup.add(bodyMesh);

      rollGroup.add(modelGroup);
      root.add(rollGroup);

      root.scale.set(cfg.scale, cfg.scale, cfg.scale);

      const init = initialOffsets[idx % initialOffsets.length];
      const pos = new THREE.Vector3(init.x, init.y, init.z);
      const vel = new THREE.Vector3(init.vx, init.vy, init.vz).normalize().multiplyScalar(cfg.baseSpeed);

      root.position.copy(pos);
      scene.add(root);

      flyingButterflies.push({
        group: root,
        rollGroup: rollGroup,
        modelGroup: modelGroup,
        leftPivot: leftPivot,
        rightPivot: rightPivot,
        material: mat,
        pos: pos,
        vel: vel,
        baseSpeed: cfg.baseSpeed,
        scale: cfg.scale,
        flapFrequency: cfg.flapFreq,
        flapAmplitude: cfg.amp,
        wingPhase: Math.random() * Math.PI * 2,
        turnSeed: Math.random() * 200 + idx * 50,
        pitchSeed: Math.random() * 200 + idx * 40,
        currentBank: 0,
        glideTimer: 0,
        isGliding: false
      });
    });

    console.log(`[NXScene] Initialized ${flyingButterflies.length} natural flying butterflies entering from the top.`);
  }

  function resetFlyingButterfly(b, forceTop = true) {
    const isMobile = typeof window !== 'undefined' && window.innerWidth <= 820;
    // On mobile, entries are 100% from top edge of viewport to stay in upper canopy
    const fromTop = forceTop || isMobile || Math.random() < 0.85;

    if (fromTop) {
      b.pos.x = (Math.random() - 0.5) * (isMobile ? 3.6 : 4.4);
      b.pos.y = 2.2 + Math.random() * 0.9; // Above top edge of viewport
      b.pos.z = -1.2 + Math.random() * 1.5;

      // Descending smoothly into the viewport
      const angle = -Math.PI * 0.5 + (Math.random() - 0.5) * 0.85; // generally down, ±24 deg
      const speed = b.baseSpeed * (0.92 + Math.random() * 0.25);
      b.vel.set(
        Math.cos(angle) * speed,
        Math.sin(angle) * speed,
        (Math.random() - 0.5) * 0.18
      );
    } else {
      const leftSide = Math.random() < 0.5;
      b.pos.x = leftSide ? -3.2 : 3.2;
      b.pos.y = 1.3 + Math.random() * 1.3;
      b.pos.z = -1.0 + Math.random() * 1.4;

      const targetX = (Math.random() - 0.5) * 1.8;
      const targetY = 0.6 + Math.random() * 0.8;
      const dir = new THREE.Vector3(targetX - b.pos.x, targetY - b.pos.y, (Math.random() - 0.5) * 0.4).normalize();
      b.vel.copy(dir).multiplyScalar(b.baseSpeed);
    }

    b.turnSeed = Math.random() * 300;
    b.pitchSeed = Math.random() * 300;
    b.currentBank = 0;
    b.glideTimer = 0;
    b.isGliding = false;
    b.group.position.copy(b.pos);
  }

  /**
   * Update all flying butterflies:
   * Continuous organic flight paths, rapid wing flapping, gentle turns, banking,
   * natural variations in speed, and smooth entry/exit looping.
   */
  function updateFlyingButterflies(time, delta) {
    if (!flyingButterflies || flyingButterflies.length === 0) return;

    const lookTarget = new THREE.Vector3();

    for (let i = 0; i < flyingButterflies.length; i++) {
      const b = flyingButterflies[i];
      const isMobile = typeof window !== 'undefined' && window.innerWidth <= 820;
      // On mobile: constrain flight area strictly to upper canopy so butterflies never cross description text
      const minFlightY = isMobile ? 0.22 : -2.4;
      const bottomLiftTrigger = isMobile ? 0.50 : -0.4;

      // 1. Organic Steering Forces (Harmonic Noise Curves)
      const t = time * 1.15 + b.turnSeed;
      const steerX = Math.sin(t * 1.2) * 0.85 + Math.cos(t * 0.55) * 0.45;
      
      // Vertical lift / buoyancy: provides upward swoops when lower on screen
      let liftY = Math.sin(t * 1.6 + b.pitchSeed) * 0.35;
      if (b.pos.y < bottomLiftTrigger) {
        liftY += isMobile ? 2.4 : 0.95; // Strong gentle thermal rise above description
      } else if (b.pos.y > (isMobile ? 2.2 : 1.8) && b.vel.y > 0) {
        liftY -= 0.65; // Direct back downwards into the canopy
      }

      const steerZ = Math.cos(t * 0.85) * 0.30;

      // Apply acceleration
      b.vel.x += steerX * delta * 1.15;
      b.vel.y += (liftY - 0.12) * delta * 1.10;
      b.vel.z += steerZ * delta * 0.75;

      // Speed regulation with natural flutter bursts
      b.glideTimer += delta;
      if (b.glideTimer > 2.8 + (i % 3) * 0.6) {
        b.isGliding = !b.isGliding;
        b.glideTimer = 0;
      }

      const speedFactor = b.isGliding ? 0.88 : (1.05 + Math.sin(time * 6.0 + i) * 0.15);
      const targetSpeed = b.baseSpeed * speedFactor;
      b.vel.normalize().multiplyScalar(targetSpeed);

      // Move position
      b.pos.addScaledVector(b.vel, delta);
      b.group.position.copy(b.pos);

      // 2. Viewport Boundary Check -> Smooth Continuous Respawn from Top
      if (b.pos.y < minFlightY || b.pos.x < -3.9 || b.pos.x > 3.9 || b.pos.y > 3.6 || b.pos.z < -2.6 || b.pos.z > 1.6) {
        resetFlyingButterfly(b, true);
        continue;
      }

      // 3. Orient 3D Butterfly Along Flight Vector
      lookTarget.copy(b.pos).add(b.vel);
      b.group.lookAt(lookTarget);

      // 4. Realistic Aerodynamic Bank (Roll) into Curves
      const targetBank = -steerX * 0.42;
      b.currentBank += (targetBank - b.currentBank) * 0.08;
      b.rollGroup.rotation.z = b.currentBank;

      // 5. Rapid Biological Wing Flapping
      const flapRate = b.isGliding ? b.flapFrequency * 0.45 : b.flapFrequency;
      b.wingPhase += delta * flapRate;

      const flapSin = Math.sin(b.wingPhase);
      // Asymmetric wing stroke: snappy downstroke, graceful upstroke
      const flapCurve = flapSin >= 0 ? Math.pow(flapSin, 0.88) : -Math.pow(-flapSin, 1.12);
      const flapAmp = b.isGliding ? b.flapAmplitude * 0.35 : b.flapAmplitude;
      const flapAngle = 0.14 + flapCurve * flapAmp;

      b.leftPivot.rotation.y = flapAngle;
      b.rightPivot.rotation.y = -flapAngle;

      // Aerodynamic wing twist flex (angle of attack)
      const twist = Math.cos(b.wingPhase) * (b.isGliding ? 0.04 : 0.14);
      b.leftPivot.rotation.x = twist;
      b.rightPivot.rotation.x = twist;

      // Micro-bobbing of body in sync with wing stroke
      const bodyBob = -flapCurve * (b.isGliding ? 0.006 : 0.024);
      b.modelGroup.position.y = bodyBob;
      b.modelGroup.rotation.y = Math.cos(b.wingPhase * 0.5) * 0.04;
    }
  }

  /**
   * Switch Active Species Morphology & Structural Coloration
   */
  function setSpecies(speciesKey) {
    if (!speciesData[speciesKey]) return;
    currentSpeciesKey = speciesKey;
    const config = speciesData[speciesKey];

    butterflyMaterials.forEach((mat) => {
      gsap.to(mat.color, {
        r: config.colorFilter.r,
        g: config.colorFilter.g,
        b: config.colorFilter.b,
        duration: 0.8,
        ease: 'power2.out'
      });
      mat.roughness = config.roughness;
      mat.metalness = config.metalness;
      mat.needsUpdate = true;
    });
  }

  /**
   * Set Active Anatomy Feature for Focal Spotlight Glow
   */
  function setActiveAnatomyFocus(partKey) {
    activeAnatomyKey = partKey;
    if (!focusSpotlight) return;

    if (!partKey) {
      gsap.to(focusSpotlight, { intensity: 0.0, duration: 0.4, ease: 'power2.out' });
      return;
    }

    const anchor = hotspotAnchors.find(a => a.id === `hotspot-${partKey}`);
    if (anchor && butterflyRoot) {
      const worldPos = new THREE.Vector3();
      if (anchor.obj) {
        anchor.obj.getWorldPosition(worldPos);
      } else {
        worldPos.copy(anchor.pos).applyMatrix4(butterflyRoot.matrixWorld);
      }

      gsap.to(focusSpotlight.position, {
        x: worldPos.x,
        y: worldPos.y,
        z: worldPos.z + 0.8,
        duration: 0.6,
        ease: 'power2.out'
      });

      // Gentle, subtle amber focus highlight (0.75 intensity, no blinding wash-out)
      gsap.to(focusSpotlight, {
        intensity: 0.75,
        duration: 0.5,
        ease: 'power2.out'
      });
    }
  }

  /**
   * Interactive 360 Orbit Controls & Cursor Tracking
   */
  function setupInteractions(canvasEl) {
    window.addEventListener('mousemove', (e) => {
      mouse.targetX = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.targetY = -(e.clientY / window.innerHeight) * 2 + 1;

      if (isInteractiveMode && isPointerDown) {
        const deltaX = e.clientX - pointerStart.x;
        const deltaY = e.clientY - pointerStart.y;
        pointerStart.x = e.clientX;
        pointerStart.y = e.clientY;

        interactiveTargetRot.y += deltaX * 0.005;
        interactiveTargetRot.x += deltaY * 0.005;
        interactiveTargetRot.x = Math.max(-0.45, Math.min(0.55, interactiveTargetRot.x));
      }
    });

    canvasEl.addEventListener('mousedown', (e) => {
      if (isInteractiveMode) {
        isPointerDown = true;
        pointerStart.x = e.clientX;
        pointerStart.y = e.clientY;
      }
    });

    window.addEventListener('mouseup', () => { isPointerDown = false; });

    canvasEl.addEventListener('touchstart', (e) => {
      if (isInteractiveMode && e.touches.length > 0) {
        isPointerDown = true;
        pointerStart.x = e.touches[0].clientX;
        pointerStart.y = e.touches[0].clientY;
      }
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
      if (isInteractiveMode && isPointerDown && e.touches.length > 0) {
        const deltaX = e.touches[0].clientX - pointerStart.x;
        const deltaY = e.touches[0].clientY - pointerStart.y;
        pointerStart.x = e.touches[0].clientX;
        pointerStart.y = e.touches[0].clientY;

        interactiveTargetRot.y += deltaX * 0.007;
        interactiveTargetRot.x += deltaY * 0.007;
        interactiveTargetRot.x = Math.max(-0.45, Math.min(0.55, interactiveTargetRot.x));
      }
    }, { passive: true });

    window.addEventListener('touchend', () => { isPointerDown = false; });
  }

  function setInteractiveMode(enabled) {
    isInteractiveMode = enabled;
    const hint = document.getElementById('interactive-hint');
    if (hint) {
      hint.classList.toggle('visible', enabled);
    }
  }

  /**
   * Project 3D Hotspot Coordinates to 2D HTML Screen Coordinates
   */
  /**
   * Project 3D Hotspot Coordinates to 2D HTML Screen Coordinates
   */
  function updateHotspots() {
    if (!hotspotsVisible || !camera || !butterflyRoot) return;

    const width = window.innerWidth;
    const height = window.innerHeight;
    const tempVec = new THREE.Vector3();
    const isMobile = width < 821;

    hotspotAnchors.forEach((item) => {
      const el = document.getElementById(item.id);
      if (!el) return;

      if (item.obj) {
        item.obj.getWorldPosition(tempVec);
      } else {
        tempVec.copy(item.pos).applyMatrix4(butterflyRoot.matrixWorld);
      }

      tempVec.project(camera);
      const isBehind = tempVec.z > 1.0;

      if (isBehind) {
        el.classList.remove('active', 'focused');
        return;
      }

      const screenX = (tempVec.x * 0.5 + 0.5) * width;
      const screenY = (-(tempVec.y * 0.5) + 0.5) * height;

      el.style.left = `${screenX}px`;
      el.style.top = `${screenY}px`;

      // Smart edge positioning: flip tag to left if anchor is near the right edge
      if (screenX > width * 0.55) {
        el.classList.add('tag-left');
      } else {
        el.classList.remove('tag-left');
      }

      // Check active / focused state
      if (activeAnatomyKey) {
        const isTarget = item.id === `hotspot-${activeAnatomyKey}`;
        if (isTarget) {
          el.classList.add('active', 'focused');
        } else {
          if (isMobile) {
            el.classList.remove('active', 'focused');
          } else {
            el.classList.add('active');
            el.classList.remove('focused');
          }
        }
      } else {
        el.classList.add('active');
        el.classList.remove('focused');
      }
    });
  }

  function setHotspotsVisible(visible, activeKey = null) {
    hotspotsVisible = visible;
    setActiveAnatomyFocus(activeKey);
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 821;

    hotspotAnchors.forEach((item) => {
      const el = document.getElementById(item.id);
      if (!el) return;

      if (!visible) {
        el.classList.remove('active', 'focused');
      } else if (activeKey) {
        if (item.id === `hotspot-${activeKey}`) {
          el.classList.add('active', 'focused');
        } else {
          if (isMobile) {
            el.classList.remove('active', 'focused');
          } else {
            el.classList.add('active');
            el.classList.remove('focused');
          }
        }
      } else {
        el.classList.add('active');
        el.classList.remove('focused');
      }
    });
  }

  /**
   * Main Render Loop with Continuous Smooth C1 Wing Kinematics
   * (Zero Crease / Zero Vertical Specular Lines)
   */
  function animate() {
    requestAnimationFrame(animate);

    const time = clock.getElapsedTime();
    const delta = lastFrameTime > 0 ? Math.min(time - lastFrameTime, 0.05) : 0.016;
    lastFrameTime = time;

    // 1. Mouse Parallax Easing
    mouse.x += (mouse.targetX - mouse.x) * 0.04;
    mouse.y += (mouse.targetY - mouse.y) * 0.04;

    // 2. Camera Easing (Controlled Macro Zoom)
    currentCameraPos.lerp(targetCameraPos, 0.055);
    currentLookAt.lerp(targetLookAt, 0.055);

    camera.position.copy(currentCameraPos);
    camera.position.x += mouse.x * 0.05;
    camera.position.y += mouse.y * 0.03;
    camera.lookAt(currentLookAt);

    // 3. Butterfly World Position, Scale & Rotation
    if (butterflyRoot) {
      currentModelPos.lerp(targetModelPos, 0.055);
      currentModelScale += (targetModelScale - currentModelScale) * 0.055;

      butterflyRoot.position.copy(currentModelPos);
      butterflyRoot.scale.set(currentModelScale, currentModelScale, currentModelScale);

      if (isInteractiveMode) {
        interactiveRotation.x += (interactiveTargetRot.x - interactiveRotation.x) * 0.08;
        interactiveRotation.y += (interactiveTargetRot.y - interactiveRotation.y) * 0.08;
        butterflyRoot.rotation.set(interactiveRotation.x, interactiveRotation.y, 0);
      } else {
        currentModelRot.x += (targetModelRot.x - currentModelRot.x) * 0.055;
        currentModelRot.y += (targetModelRot.y - currentModelRot.y) * 0.055;
        currentModelRot.z += (targetModelRot.z - currentModelRot.z) * 0.055;
        butterflyRoot.rotation.copy(currentModelRot);
      }

      if (window.scrollY > 40 && !isAssemblyComplete) {
        completeAssemblyImmediately();
      }

      // 4. Smooth Continuous 3D Wing Kinematics (Zero Crease Artifacts)
      currentWingAngle += (targetWingAngle - currentWingAngle) * 0.065;
      flightIntensity += (targetFlightIntensity - flightIntensity) * 0.06;

      if (butterflyMesh && basePositions) {
        const posAttr = butterflyMesh.geometry.attributes.position;
        const count = posAttr.count;

        // Biological breathing with delicate vital micro-flutter
        const breathFlutter = Math.sin(time * 2.2) * 0.025 + Math.sin(time * 24.0) * 0.015;

        // Realistic fast flight flap wave (rapid flutter ~28 rad/s with lively harmonics)
        const flightFlap = Math.sin(time * 28.0) * 0.42 + Math.sin(time * 14.0) * 0.08;

        const effectiveAngle = currentWingAngle + (1.0 - flightIntensity) * breathFlutter + flightIntensity * flightFlap;

        // Continuous smoothstep hinge: smoothly transitions from body to wing between x=0.12 and x=0.32
        for (let i = 0; i < count; i++) {
          const bx = basePositions[i * 3 + 0];
          const by = basePositions[i * 3 + 1];
          const bz = basePositions[i * 3 + 2];

          const dist = Math.abs(bx);

          if (dist > 0.12) {
            const wingBlend = THREE.MathUtils.smoothstep(dist, 0.12, 0.32);
            const angle = effectiveAngle * wingBlend;
            const cosA = Math.cos(angle);
            const sinA = Math.sin(angle);
            const span = dist - 0.12;
            const tipWave = Math.sin(time * 2.95 + span * 1.5) * 0.012 * (span / 1.88);

            if (bx > 0) {
              const newX = 0.12 + span * cosA;
              const newZ = bz + span * sinA * wingBlend + tipWave;
              posAttr.setXYZ(i, newX, by, newZ);
            } else {
              const newX = -(0.12 + span * cosA);
              const newZ = bz + span * sinA * wingBlend + tipWave;
              posAttr.setXYZ(i, newX, by, newZ);
            }
          } else {
            const bodyBreath = Math.sin(time * 1.8) * 0.006;
            posAttr.setXYZ(i, bx, by, bz + bodyBreath);
          }
        }

        posAttr.needsUpdate = true;
        butterflyMesh.geometry.computeVertexNormals();
      }
    }

    // 5. Floating Bokeh Orbs & Micro-Pollen
    if (bokehParticles) {
      const bPos = bokehParticles.geometry.attributes.position;
      const bSpeeds = bokehParticles.geometry.userData.speeds;
      const bCount = bPos.count;

      for (let i = 0; i < bCount; i++) {
        let bx = bPos.getX(i);
        let by = bPos.getY(i);
        let bz = bPos.getZ(i);

        bx += bSpeeds[i * 3 + 0] + Math.sin(time * 0.4 + i) * 0.0004;
        by += bSpeeds[i * 3 + 1];
        bz += bSpeeds[i * 3 + 2] + Math.cos(time * 0.4 + i) * 0.0004;

        if (by > 4.5) by = -4.5;
        if (bx > 6.5) bx = -6.5;
        if (bx < -6.5) bx = 6.5;

        bPos.setXYZ(i, bx, by, bz);
      }
      bPos.needsUpdate = true;
    }

    if (pollenParticles) {
      const posAttr = pollenParticles.geometry.attributes.position;
      const speeds = pollenParticles.geometry.userData.speeds;
      const count = posAttr.count;

      for (let i = 0; i < count; i++) {
        let px = posAttr.getX(i);
        let py = posAttr.getY(i);
        let pz = posAttr.getZ(i);

        px += speeds[i * 3 + 0] + Math.sin(time * 0.5 + i) * 0.0008;
        py += speeds[i * 3 + 1];
        pz += speeds[i * 3 + 2] + Math.cos(time * 0.5 + i) * 0.0008;

        if (py > 5.0) py = -5.0;
        if (px > 7.0) px = -7.0;
        if (px < -7.0) px = 7.0;
        if (pz > 3.0) pz = -3.0;
        if (pz < -3.0) pz = 3.0;

        posAttr.setXYZ(i, px, py, pz);
      }
      posAttr.needsUpdate = true;
    }

    // 6. Natural Ambient Flying Butterflies (Smooth Organic Flight & Rapid Flapping)
    updateFlyingButterflies(time, delta);

    // 7. Project 3D Hotspots
    updateHotspots();

    // 8. Render
    renderer.render(scene, camera);
  }

  /**
   * Window Resize Handler
   */
  function handleResize() {
    if (!renderer || !camera || !canvas) return;
    const width = window.innerWidth;
    const height = window.innerHeight;

    camera.aspect = width / height;

    const layout = getResponsiveLayout();
    camera.fov = layout.fov;
    camera.updateProjectionMatrix();

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

    targetModelScale = layout.baseScale;
    if (!isInteractiveMode && window.scrollY === 0) {
      targetModelPos.x = layout.heroX;
      targetModelPos.y = layout.heroY;
      targetCameraPos.z = layout.cameraZ;
    }
  }

  return {
    init: init,
    handleResize: handleResize,
    getResponsiveLayout: getResponsiveLayout,
    setSpecies: setSpecies,
    setInteractiveMode: setInteractiveMode,
    setHotspotsVisible: setHotspotsVisible,
    setActiveAnatomyFocus: setActiveAnatomyFocus,
    playInitialAssembly: playInitialAssembly,
    resetAssembly: resetAssemblyToInitialState,
    completeAssemblyImmediately: completeAssemblyImmediately,
    get isAssemblyComplete() { return isAssemblyComplete; },

    cameraTargetPos: targetCameraPos,
    cameraLookAt: targetLookAt,
    modelRot: targetModelRot,
    modelPos: targetModelPos,
    get modelScale() { return targetModelScale; },
    set modelScale(val) { targetModelScale = val; },

    get wingAngle() { return targetWingAngle; },
    set wingAngle(val) { targetWingAngle = val; },

    get flightIntensity() { return targetFlightIntensity; },
    set flightIntensity(val) { targetFlightIntensity = val; },

    onProgress: function (cb) { onProgressCallback = cb; },
    onLoaded: function (cb) { onLoadedCallback = cb; },

    get isLoaded() { return isModelLoaded; },
    getSpeciesData: function (key) { return speciesData[key]; },
    getHotspotAnchors: function () { return hotspotAnchors; }
  };
})();
