import * as THREE from 'three';
import { createHamster } from './hamster.js';
import { HamsterPreview } from './preview.js';

let scene, camera, renderer, hamsters = [];
let preview;
let bgMusic = new Audio('Pixelated Echoes of the Past - Track 2 - Sonauto.wav');
bgMusic.loop = true;

function init() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(0, 10, 5);
  scene.add(directionalLight);

  const floorGeometry = new THREE.PlaneGeometry(20, 20);
  const floorMaterial = new THREE.MeshStandardMaterial({
    color: 0x90EE90,
    roughness: 0.8
  });
  const floor = new THREE.Mesh(floorGeometry, floorMaterial);
  floor.rotation.x = -Math.PI / 2;
  scene.add(floor);

  camera.position.set(0, 5, 10);
  camera.lookAt(0, 0, 0);

  preview = new HamsterPreview('preview3D');
  animate();
}

function checkCollisions() {
  for (let i = 0; i < hamsters.length; i++) {
    for (let j = i + 1; j < hamsters.length; j++) {
      const hamster1 = hamsters[i];
      const hamster2 = hamsters[j];
      
      const distance = hamster1.group.position.distanceTo(hamster2.group.position);
      const combinedRadius = hamster1.collisionSphere.geometry.parameters.radius + 
                           hamster2.collisionSphere.geometry.parameters.radius;
      
      if (distance < combinedRadius) {
        // Collision response
        const angle = Math.atan2(
          hamster2.group.position.z - hamster1.group.position.z,
          hamster2.group.position.x - hamster1.group.position.x
        );
        
        hamster1.direction = angle + Math.PI;
        hamster2.direction = angle;
        
        // Push hamsters apart
        const overlap = combinedRadius - distance;
        const pushX = Math.cos(angle) * overlap / 2;
        const pushZ = Math.sin(angle) * overlap / 2;
        
        hamster1.group.position.x -= pushX;
        hamster1.group.position.z -= pushZ;
        hamster2.group.position.x += pushX;
        hamster2.group.position.z += pushZ;
      }
    }
  }
}

function animate() {
  requestAnimationFrame(animate);

  hamsters.forEach(hamster => {
    hamster.direction += (Math.random() - 0.5) * 0.1;
    hamster.group.rotation.y = hamster.direction;
    
    const speed = 0.03;
    const newX = hamster.group.position.x + Math.cos(hamster.direction) * speed;
    const newZ = hamster.group.position.z + Math.sin(hamster.direction) * speed;

    // Boundary checking
    if (Math.abs(newX) < 9) hamster.group.position.x = newX;
    else hamster.direction = Math.PI - hamster.direction;
    
    if (Math.abs(newZ) < 9) hamster.group.position.z = newZ;
    else hamster.direction = -hamster.direction;
  });

  checkCollisions();
  renderer.render(scene, camera);
}

// Event Listeners
document.getElementById('startButton').addEventListener('click', () => {
  document.getElementById('startScreen').style.display = 'none';
  document.getElementById('customizePanel').style.display = 'block';
  bgMusic.play();
  init();
  
  for (let i = 0; i < 3; i++) {
    const hamster = createHamster();
    hamsters.push(hamster);
    scene.add(hamster.group);
  }
});

// Update preview on any customization change
const updatePreview = () => {
  const params = {
    furColor: new THREE.Color(document.getElementById('furColor').value),
    furPattern: document.getElementById('furPattern').value,
    earColor: new THREE.Color(document.getElementById('earColor').value),
    eyeColor: new THREE.Color(document.getElementById('eyeColor').value),
    size: parseFloat(document.getElementById('hamsterSize').value),
    earSize: parseFloat(document.getElementById('earSize').value),
    tailLength: parseFloat(document.getElementById('tailLength').value),
    legLength: parseFloat(document.getElementById('legLength').value),
    hasGlasses: document.getElementById('hasGlasses').checked,
    hasHat: document.getElementById('hasHat').checked
  };
  preview.updateHamster(params);
};

// Add change listeners to all inputs
document.querySelectorAll('#customizePanel input, #customizePanel select').forEach(input => {
  input.addEventListener('change', updatePreview);
  input.addEventListener('input', updatePreview);
});

document.getElementById('spawnHamster').addEventListener('click', () => {
  const params = {
    furColor: new THREE.Color(document.getElementById('furColor').value),
    furPattern: document.getElementById('furPattern').value,
    earColor: new THREE.Color(document.getElementById('earColor').value),
    eyeColor: new THREE.Color(document.getElementById('eyeColor').value),
    size: parseFloat(document.getElementById('hamsterSize').value),
    earSize: parseFloat(document.getElementById('earSize').value),
    tailLength: parseFloat(document.getElementById('tailLength').value),
    legLength: parseFloat(document.getElementById('legLength').value),
    hasGlasses: document.getElementById('hasGlasses').checked,
    hasHat: document.getElementById('hasHat').checked
  };
  
  const hamster = createHamster(params);
  hamsters.push(hamster);
  scene.add(hamster.group);
});

window.addEventListener('resize', () => {
  if (camera && renderer) {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }
});