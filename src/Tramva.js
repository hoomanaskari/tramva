import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { TransformControls } from 'three/addons/controls/TransformControls.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';

const defaultHDRTextureURL = new URL('./HDR/MR_INT-003_Kitchen_Pierre.hdr', import.meta.url);

export default class Tramva extends THREE.EventDispatcher {
  toneMappingExposure = 0.8;
  canDeselect = true;
  transformControlMode = 'translate';
  objects = [];

  constructor(options = {}) {
    super();

    for (var prop in options) {
      this[prop] = options[prop];
    }

    this._loadingManager = new THREE.LoadingManager();
    this._defaultHDRTextureURL = defaultHDRTextureURL;

    this.raycaster = new THREE.Raycaster();

    this._setup();
  }

  /**
   * Private
   */
  _setup() {
    this._setupScene();
    this._setUpCamera();
    this._setUpLights();
    this._setupRenderer();
    this._setUpControls();

    this._setupEvents();
  }

  /**
   * Private
   */
  _setupScene() {
    this.scene = new THREE.Scene();
  }

  /**
   * Private
   */
  _setUpCamera() {
    const wrapperBounds = this.wrapperEl?.getBoundingClientRect();
    this.camera = new THREE.PerspectiveCamera(
      10,
      wrapperBounds.width / wrapperBounds.height,
      0.1,
      1000
    );

    // this.camera = new THREE.OrthographicCamera(
    //   wrapperBounds.width / -2, // left
    //   wrapperBounds.width / 2, // right
    //   wrapperBounds.height / 2, // top
    //   wrapperBounds.height / -2, // bottom
    //   0.1, // near
    //   1000 // far
    // );

    this.setCameraPosition(0, 0, 100);
    this.setCameraAngle(-0.291, 0.376, 0.109);
  }

  /**
   * Private
   */
  _setUpLights() {
    this.setUpHDRLight();
  }

  setUpHDRLight(hdrTextureURL) {
    const url = hdrTextureURL || this.hdrTextureURL || this._defaultHDRTextureURL;
    if (!url) return;

    const loader = new RGBELoader(this._loadingManager);

    if (!this.hdrTextureURL) this.hdrTextureURL = url;

    loader.load(url, (texture) => {
      texture.mapping = THREE.EquirectangularReflectionMapping;
      // this.scene.background = texture;
      this.scene.environment = texture;

      this.renderAll();
    });
  }

  /**
   * Private
   */
  _setupRenderer() {
    const wrapperBounds = this.wrapperEl?.getBoundingClientRect();

    this.renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      preserveDrawingBuffer: true,
      canvas: this.canvasEl || document.createElement('canvas')
    });

    if (!this.canvasEl) {
      this.wrapperEl.appendChild(this.renderer.domElement);
      this.canvasEl = this.renderer.domElement;
    }

    // Set the clear color to transparent
    if (this.background) {
      this.renderer.setClearColor(this.background, 0);
    } else {
      this.renderer.setClearColor(0x000000, 0);
    }

    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = this.toneMappingExposure;

    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.renderer.setSize(wrapperBounds.width, wrapperBounds.height);
  }

  /**
   * Private
   */
  _setUpControls() {
    this._setUpOrbitControls();
  }

  /**
   * Private
   */
  _setUpOrbitControls() {
    const orbitControl = new OrbitControls(this.camera, this.renderer.domElement);
    orbitControl.addEventListener('change', this.renderAll);

    orbitControl.mouseButtons.MIDDLE = THREE.MOUSE.PAN;
    orbitControl.zoomSpeed = 4;
    orbitControl.zoomToCursor = true;
    orbitControl.panSpeed = 2;
    // orbitControl.enableRotate = false;

    orbitControl.update();

    this.orbitControl = orbitControl;
  }

  /**
   * Private
   */
  _setupEvents() {
    window.onresize = () => {
      const wrapperBounds = this.wrapperEl?.getBoundingClientRect();

      this.camera.aspect = wrapperBounds.width / wrapperBounds.height;
      this.renderer.setSize(wrapperBounds.width, wrapperBounds.height);

      this.renderAll();
    };

    // this._loadingManager.onProgress = (_, index, total) => {
    //   console.info('loading', index, 'of', total);
    // };

    // this._loadingManager.onLoad = () => {
    //   console.info('loaded all');
    //   this.renderAll();
    // };

    // this.wrapperEl.addEventListener('pointermove', this._onPointerMove);
    this.wrapperEl.addEventListener('pointerdown', this._onClick);
    window.addEventListener('keydown', (event) => {
      if (event.code === 'Escape') {
        this.discardActiveObject();
      } else if (event.code === 'Delete' || event.code === 'Backspace') {
        if (this.activeObject?.userData?.object) {
          this.removeChild(this.activeObject?.userData?.object);
        }
      }
    });
  }

  addChild(child) {
    this.scene.add(child.mesh);
    this.objects.push(child);
    this.renderAll();

    child.mesh.userData.object = child;

    child.set({
      scene: this.scene,
      renderer: this.renderer,
      camera: this.camera
    });

    return this;
  }

  removeChild(child) {
    this.discardActiveObject();
    this.scene.remove(child.mesh);
    this.objects = this.objects.filter((obj) => obj !== child);
    this.renderAll();

    return this;
  }

  _onPointerMove = (event) => {
    event.preventDefault();
    const wrapperBounds = this.wrapperEl?.getBoundingClientRect();

    const wrapperLeft = wrapperBounds.left;
    const wrapperTop = wrapperBounds.top;
    const X = ((event.clientX - wrapperLeft) / wrapperBounds.width) * 2 - 1;
    const Y = -((event.clientY - wrapperTop) / wrapperBounds.height) * 2 + 1;

    this.raycaster.setFromCamera(new THREE.Vector2(X, Y), this.camera);

    const intersects = this.raycaster.intersectObjects(
      this.objects.map((o) => o.mesh),
      true
    );
    const target = intersects[0];

    if (target?.object && this.renderer.domElement.style.cursor !== 'pointer') {
      this.renderer.domElement.style.cursor = 'pointer';

      this.renderAll();
    } else if (!target?.object && this.renderer.domElement.style.cursor !== 'default') {
      this.renderer.domElement.style.cursor = 'default';

      this.renderAll();
    }
  };

  _onClick = (event) => {
    if (event.button !== 0) return;

    event.preventDefault();
    const wrapperBounds = this.wrapperEl?.getBoundingClientRect();

    const wrapperLeft = wrapperBounds.left;
    const wrapperTop = wrapperBounds.top;
    const X = ((event.clientX - wrapperLeft) / wrapperBounds.width) * 2 - 1;
    const Y = -((event.clientY - wrapperTop) / wrapperBounds.height) * 2 + 1;

    this.raycaster.setFromCamera(new THREE.Vector2(X, Y), this.camera);

    const intersects = this.raycaster.intersectObjects(
      this.objects.map((o) => o.mesh),
      true
    );
    const target = intersects[0];

    if (target?.object) {
      this.setActiveObject(
        target.object,
        this.activeObject && this.activeObject !== target?.object
      );
    } else if (this.canDeselect) {
      this.discardActiveObject();
    }
  };

  discardActiveObject() {
    if (!this.activeObject) return;

    this.orbitControl.enabled = true;
    this.canDeselect = true;

    if (this.transformControl) {
      this.transformControl.dispose();
      this.scene.remove(this.transformControl);
    }

    this.activeObject = null;
    this.transformControl = null;

    this.renderAll();
  }

  setActiveObject(target, updateSelection) {
    if (this.activeObject && !updateSelection) return;

    if (updateSelection) {
      if (this.transformControl) {
        this.transformControl.dispose();
        this.scene.remove(this.transformControl);
      }
    }

    if (target.parent?.type === 'Object3D') {
      this.activeObject = target.parent;
    } else {
      this.activeObject = target;
    }

    this.transformControl = new TransformControls(this.camera, this.renderer.domElement);
    this.transformControl.setMode(this.transformControlMode || 'translate');

    this.transformControl.addEventListener('change', this.renderAll);
    this.transformControl.addEventListener('dragging-changed', (event) => {
      this.orbitControl.enabled = !event.value;
      this.canDeselect = !event.value;
    });

    this.transformControl.attach(this.activeObject);
    this.scene.add(this.transformControl);

    this.renderAll();
  }

  _loadFont(url = '') {
    const loader = new FontLoader();
    return new Promise((resolve, reject) => {
      loader.load(url, resolve, undefined, reject);
    });
  }

  setCameraPosition(x, y, z) {
    this.camera.position.set(x, y, z);
  }

  setCameraAngle(x, y, z) {
    this.camera.rotation.set(x, y, z);
  }

  renderAll = () => {
    this.camera?.updateProjectionMatrix();
    this.renderer?.render(this.scene, this.camera);
  };
}
