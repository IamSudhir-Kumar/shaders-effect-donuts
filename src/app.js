import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';
import { init, gl, scene, camera, controls } from './init/init';
import { GUI } from './init/lil-gui.module.min';
import vertexShader from './shaders/vertex.js';
import fragmentShader from './shaders/fragment.js';

init();

const gui = new GUI();

let torusType = 'Torus';
let torusGeometry = new THREE.TorusGeometry(1, 0.3, 100, 100);

const torus = new THREE.Mesh(
  torusGeometry,
  new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    side: THREE.DoubleSide,
    uniforms: {
      uTime: { value: 0 },
      uResolution: { value: new THREE.Vector2() },
      uDisplace: { value: 2 },
      uSpread: { value: 1.2 },
      uNoise: { value: 16 },
    },
  })
);

torus.geometry.vertices.forEach((vertex) => {
  if (Math.random() < 0.3) {
    vertex.multiplyScalar(0.5);
  }
});

scene.add(torus);

const composer = new EffectComposer(gl);
composer.addPass(new RenderPass(scene, camera));

const torusController = gui.add({ type: torusType }, 'type', ['Torus', 'TorusKnot']).name('Shape');
torusController.onChange((value) => {
  torusType = value;
  updateTorusGeometry();
});

gui.add(torus.material.uniforms.uDisplace, 'value', 0, 2, 0.1).name('displacement');
gui.add(torus.material.uniforms.uSpread, 'value', 0, 2, 0.1).name('spread');
gui.add(torus.material.uniforms.uNoise, 'value', 10, 25, 0.1).name('noise');

const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  1.4,
  0.0001,
  0.01
);

composer.addPass(bloomPass);

const clock = new THREE.Clock();

const animate = () => {
  const elapsedTime = clock.getElapsedTime();
  torus.material.uniforms.uTime.value = elapsedTime;
  torus.rotation.z = Math.sin(elapsedTime) / 4 + elapsedTime / 20 + 5;
  composer.render();
  controls.update();
  requestAnimationFrame(animate);
};

animate();

function updateTorusGeometry() {
  scene.remove(torus);
  if (torusType === 'Torus') {
    torusGeometry = new THREE.TorusGeometry(1, 0.3, 100, 100);
  } else if (torusType === 'TorusKnot') {
    torusGeometry = new THREE.TorusKnotGeometry(1, 0.3, 100, 16);
  }
  torus.geometry.dispose();
  torus.geometry = torusGeometry;
  torus.geometry.vertices.forEach((vertex) => {
    if (Math.random() < 0.3) {
      vertex.multiplyScalar(0.5);
    }
  });
  scene.add(torus);
}
