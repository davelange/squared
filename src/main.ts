import * as THREE from "three";
import {
  EffectComposer,
  OrbitControls,
  RenderPass,
  ShaderPass,
} from "three/examples/jsm/Addons.js";
import Stats from "three/examples/jsm/libs/stats.module.js";
import GUI from "lil-gui";
import { SquarePass } from "./squarePass";

class MyScene {
  scene = new THREE.Scene();
  composer: EffectComposer;
  renderer = new THREE.WebGLRenderer();
  canvas = document.querySelector("canvas.webgl") as HTMLCanvasElement;
  camera = new THREE.OrthographicCamera();

  width = window.innerWidth;
  height = window.innerHeight;

  brushScene = new THREE.Scene();
  brushTexture = new THREE.WebGLRenderTarget();

  stats = new Stats();
  controls = new OrbitControls(this.camera, this.canvas);

  settings: Record<string, any> = {
    scale: 8.4,
    radius: 0.1,
    size: 0.32,
  };
  mouse = new THREE.Vector2(0, 0);
  prevMouse = new THREE.Vector2(0, 0);

  gui = new GUI();

  background: THREE.Mesh;

  constructor() {
    this.setupRenderer();
    this.setupCamera();
    this.setupResize();
    this.controls = new OrbitControls(this.camera, this.canvas);
    this.trackMouse();
    this.addObjects();
    this.initPost();
    this.initSettings();
  }

  shaderPass: ShaderPass;

  initSettings() {
    this.gui.add(this.settings, "scale", 0, 10, 0.01);
    this.gui.add(this.settings, "radius", 0, 1, 0.01);
    this.gui.add(this.settings, "size", 0, 1, 0.01);
  }

  updateUniformsFromSettings() {
    for (const key in this.settings) {
      this.shaderPass.uniforms[key].value = this.settings[key];
    }
  }

  initPost() {
    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(new RenderPass(this.scene, this.camera));

    this.shaderPass = new ShaderPass(SquarePass);

    this.updateUniformsFromSettings();
    this.shaderPass.uniforms.time.value = 0;
    this.shaderPass.uniforms.width.value = window.innerWidth;
    this.shaderPass.uniforms.height.value = window.innerHeight;

    this.composer.addPass(this.shaderPass);
  }

  setupRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true,
    });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    this.brushTexture = new THREE.WebGLRenderTarget(this.width, this.height, {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat,
    });
  }

  setupCamera() {
    let frustrum = this.height;
    let aspect = this.width / this.height;
    this.camera = new THREE.OrthographicCamera(
      (frustrum * aspect) / -2,
      (frustrum * aspect) / 2,
      frustrum / 2,
      frustrum / -2,
      -1000,
      1000
    );
    this.camera.position.set(0, 0, 2);
  }

  setupResize() {
    window.addEventListener("resize", () => {
      // Update sizes
      this.width = window.innerWidth;
      this.height = window.innerHeight;

      // Update camera
      this.camera.updateProjectionMatrix();

      // Update renderer
      this.renderer.setSize(this.width, this.height);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    });
  }

  trackMouse() {
    window.addEventListener("mousemove", (event) => {
      this.mouse.x = event.clientX - this.width / 2;
      this.mouse.y = this.height / 2 - event.clientY;
    });
  }

  addObjects() {
    // Create a red plane geometry and material
    const geometry = new THREE.PlaneGeometry(100, 100);
    const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });

    // Create the mesh and add it to the scene
    const plane = new THREE.Mesh(geometry, material);
    this.scene.add(plane);
  }

  clock = new THREE.Clock();

  render() {
    const elapsedTime = this.clock.getElapsedTime();

    this.controls.update();

    // Create brush comp texture
    this.renderer.setRenderTarget(this.brushTexture);
    this.renderer.render(this.brushScene, this.camera);

    // Set shader uniforms
    this.updateUniformsFromSettings();
    //this.shaderPass.uniforms.displacement.value = this.brushTexture.texture;
    this.shaderPass.uniforms.time.value = elapsedTime;

    // Render
    this.composer.render();
    //this.renderer.render(this.scene, this.camera);

    window.requestAnimationFrame(this.render.bind(this));
  }
}

let myScene = new MyScene();
myScene.render();
