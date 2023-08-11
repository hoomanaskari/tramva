import * as THREE from 'three';
import { FlakesTexture } from 'three/addons/textures/FlakesTexture.js';

export default class Sphere extends THREE.EventDispatcher {
  constructor(options = {}) {
    super();

    for (var prop in options) {
      this[prop] = options[prop];
    }

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
    this.geometry = new THREE.SphereGeometry(1, 50, 50);
  }

  _setupMaterial(material) {
    if (material) {
      this.material = material;

      return;
    }

    // const matCaps = [
    //   'https://bruno-simon.com/assets/images/968808cd6cb4ef6e53193f2a1f37eac6.png',
    //   'https://bruno-simon.com/prismic/matcaps/8.png',
    //   'https://bruno-simon.com/assets/images/a727f29229b4fe27c323320d33ae6ad4.png',
    //   'https://bruno-simon.com/assets/images/892ae8bf9538521c42dadd8d5795915c.png',
    //   'https://bruno-simon.com/assets/images/bb12f8e252e245ab083746e70287a641.png',
    //   'https://bruno-simon.com/assets/images/1c844a43ec882fc751607ced72f5611b.png'
    // ];
    // const textureLoader = new THREE.TextureLoader();

    this.texture = new THREE.CanvasTexture(new FlakesTexture());
    this.texture.wrapS = THREE.RepeatWrapping;
    this.texture.wrapT = THREE.RepeatWrapping;

    // repeat the wrapping 10 (x) and 6 (y) times
    this.texture.repeat.x = 10;
    this.texture.repeat.y = 6;

    const ballMaterial = {
      clearcoat: 0.01,
      cleacoatRoughness: 1.0,
      metalness: 1.0,
      roughness: 0.5,
      color: this.color || 0x8418ca,
      normalMap: this.texture,
      normalScale: new THREE.Vector2(0.15, 0.15),
      side: this.side || THREE.DoubleSide,
      // matcap: textureLoader.load(matCaps[3], this.tramva?.renderAll)
    };

    this.material = new THREE.MeshPhysicalMaterial(ballMaterial);
  }

  _setupMesh() {
    this.mesh = new THREE.Mesh(this.geometry, this.material);
  }
}
