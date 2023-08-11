import * as THREE from 'three';
// import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { FlakesTexture } from 'three/addons/textures/FlakesTexture.js';

export default class Textbox extends THREE.EventDispatcher {
  constructor(options = {}) {
    super();

    for (var prop in options) {
      this[prop] = options[prop];
    }

    if (!this.font) return;

    this._setup();
  }

  set(options = {}) {
    for (var prop in options) {
      this[prop] = options[prop];
    }
  }

  _setup() {
    this._setupGeometry();
    this._setupMaterial();
    this._setupMesh();
  }

  _setupGeometry() {
    // this.geometry = new TextGeometry(this.text || 'Your Text\nGoes Here', {
    //   font: this.font,
    //   size: this.size,
    //   height: this.height,
    //   curveSegments: this.curveSegments,
    //   bevelEnabled: this.bevelEnabled,
    //   bevelThickness: this.bevelThickness,
    //   bevelSize: this.bevelSize,
    //   bevelSegments: this.bevelSegments,
    // });

    const shapes = this.font.generateShapes(this.text || 'Your Text\nGoes Here', this.size || 100);
    this.geometry = new THREE.ExtrudeGeometry(shapes, {
      steps: 1,
      depth: this.height,
      curveSegments: this.curveSegments,
      bevelEnabled: this.bevelEnabled,
      bevelThickness: this.bevelThickness,
      bevelSize: this.bevelSize,
      bevelSegments: this.bevelSegments
    });

    this.geometry.computeBoundingBox();
    const xMid = -0.5 * (this.geometry.boundingBox.max.x - this.geometry.boundingBox.min.x);
    this.geometry.translate(xMid, 0, 0);
  }

  _setupMaterial(material) {
    if (material) {
      this.material = material;

      return;
    }

    this.texture = new THREE.CanvasTexture(new FlakesTexture());
    this.texture.wrapS = THREE.RepeatWrapping;
    this.texture.wrapT = THREE.RepeatWrapping;

    // repeat the wrapping 10 (x) and 6 (y) times
    this.texture.repeat.x = 10;
    this.texture.repeat.y = 6;

    const ballMaterial = {
      clearcoat: 1.0,
      cleacoatRoughness: 0.1,
      metalness: 0.9,
      roughness: 0.5,
      color: this.color || 0x8418ca,
      normalMap: this.texture,
      normalScale: new THREE.Vector2(0.15, 0.15),
      side: this.side || THREE.DoubleSide
    };

    this.material = new THREE.MeshPhysicalMaterial(ballMaterial);
  }

  _setupMesh() {
    const textMesh = new THREE.Mesh(this.geometry, this.material);
    textMesh.castShadow = true;
    textMesh.receiveShadow = true;

    this.geometry.computeBoundingBox();
    this.geometry.boundingBox.getCenter(textMesh.position).multiplyScalar(-1);

    this.mesh = new THREE.Object3D();
    this.mesh.add(textMesh);

    this.mesh.position.y += 0.6;
  }
}
