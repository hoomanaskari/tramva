<script lang="js">
  import { onMount } from 'svelte';
  import * as THREE from 'three';
  // @ts-ignore
  import { DragControls } from 'three/addons/controls/DragControls.js';
  // @ts-ignore
  // import { TransformControls } from 'three/addons/controls/TransformControls.js';
  // @ts-ignore
  import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
  // @ts-ignore
  import { FontLoader } from 'three/addons/loaders/FontLoader.js';

  const matCaps = [
    'https://bruno-simon.com/assets/images/968808cd6cb4ef6e53193f2a1f37eac6.png',
    'https://bruno-simon.com/prismic/matcaps/8.png',
    'https://bruno-simon.com/assets/images/a727f29229b4fe27c323320d33ae6ad4.png',
    'https://bruno-simon.com/assets/images/892ae8bf9538521c42dadd8d5795915c.png',
    'https://bruno-simon.com/assets/images/bb12f8e252e245ab083746e70287a641.png',
    'https://bruno-simon.com/assets/images/1c844a43ec882fc751607ced72f5611b.png'
  ];

  const loader = new FontLoader();

  function loadFont(url = '') {
    return new Promise((resolve, reject) => {
      loader.load(url, resolve, undefined, reject);
    });
  }

  onMount(async () => {
    const textureLoader = new THREE.TextureLoader();
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      50,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 200;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      preserveDrawingBuffer: true
    });

    const light = new THREE.HemisphereLight(0xffffff, 0x444444, 3);
    light.position.set(-2, 2, 2);
    scene.add(light.clone());

    renderer.useLegacyLights = false;

    const renderAll = () => {
      renderer.render(scene, camera);
    };

    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    // @ts-ignore
    document.getElementById('tramva-app-container').appendChild(renderer.domElement);

    // const planeGeom = new THREE.PlaneGeometry(920 / 1280, 1280 / 1280);
    // const planeMat = new THREE.MeshBasicMaterial({ color: 0x000000, side: THREE.DoubleSide });
    // const plane = new THREE.Mesh(planeGeom, planeMat);
    // scene.add(plane);

    // const tControl = new TransformControls(camera, renderer.domElement);
    // tControl.setSize(0.5);
    // tControl.setMode('rotate');
    // tControl.addEventListener('change', renderAll);
    // tControl.space = 'local';

    function createMaterial(matCap = '') {
      const material = new THREE.MeshMatcapMaterial({
        matcap: textureLoader.load(matCap, renderAll)
      });

      return material;
    }

    const font = await loadFont(
      'https://raw.githubusercontent.com/components-ai/typefaces/main/packages/font-inter/data/typefaces/normal-900.json'
    );

    const textGeometry = new TextGeometry('TRAMVA', {
      font: font,
      size: 3.0,
      height: 0,
      curveSegments: 12,
      bevelEnabled: false,
      bevelThickness: 0.15,
      bevelSize: 0.3,
      bevelSegments: 5
    });

    const textMesh = new THREE.Mesh(textGeometry, createMaterial(matCaps[5]));
    textGeometry.computeBoundingBox();
    textGeometry.boundingBox.getCenter(textMesh.position).multiplyScalar(-1);

    const parent = new THREE.Object3D();
    parent.position.x = -7;
    parent.add(textMesh);
    scene.add(parent);

    const geometry1 = new THREE.SphereGeometry(7, 50, 50);

    const sphere = new THREE.Mesh(geometry1, createMaterial(matCaps[4]));
    sphere.position.x = -23;
    scene.add(sphere);
    // tControl.attach(sphere);
    // scene.add(tControl);

    const geometry2 = new THREE.TorusGeometry(5, 2, 100, 100);
    const torus = new THREE.Mesh(geometry2, createMaterial(matCaps[2]));
    torus.position.x = 9;
    scene.add(torus);
    // tControl.attach(torus);
    // scene.add(tControl);

    const dragControl = new DragControls(scene.children, camera, renderer.domElement);
    dragControl.addEventListener('drag', renderAll);

    window.onresize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);

      renderAll();
    };
  });
</script>

<div id="tramva-app-container" />

<style lang="scss">
  #tramva-app-container {
    background-color: #383838;
  }
</style>
