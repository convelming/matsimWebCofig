import * as THREE from 'three';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
 
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
 
const labelGroup = new THREE.Group();
scene.add(labelGroup);
 
const fontLoader = new FontLoader();
fontLoader.load('path/to/font.json', function (font) {
    const textMaterial = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true });
 
    for (let i = 0; i < 1000; i++) {
        const textGeometry = new THREE.TextGeometry('Label ' + i, {
            font: font,
            size: 0.2,
            height: 0.01
        });
        const textMesh = new THREE.Mesh(textGeometry, textMaterial);
        textMesh.position.set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize().multiplyScalar(5);
        labelGroup.add(textMesh);
    }
 
    animate();
});
 
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}
 
animate();