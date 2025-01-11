import * as THREE from 'three';
import { createHamster } from './hamster.js';
import { HamsterPreview } from './preview.js';

let scene, camera, renderer;
let preview;
let room;
let bgMusic = new Audio('Pixelated Echoes of the Past - Track 2 - Sonauto.wav');
bgMusic.loop = true;

let raycaster = new THREE.Raycaster();
let mouse = new THREE.Vector2();
let selectedHamster = null;
let handCursor = document.getElementById('handCursor');
let myHamsterId = null;
let hamsterMeshes = new Map(); // Map of hamster meshes by ID

function init() {
  // Initialize WebsimSocket
  room = new WebsimSocket();
  
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x87CEEB);
  document.body.appendChild(renderer.domElement);

  // Enhanced lighting setup
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);
  
  const mainLight = new THREE.DirectionalLight(0xffffff, 1);
  mainLight.position.set(5, 10, 5);
  mainLight.castShadow = true;
  scene.add(mainLight);

  const fillLight = new THREE.DirectionalLight(0xffffff, 0.4);
  fillLight.position.set(-5, 8, -5);
  scene.add(fillLight);

  const backLight = new THREE.DirectionalLight(0xffffff, 0.3);
  backLight.position.set(0, 5, -10);
  scene.add(backLight);

  // Ground plane
  const floorGeometry = new THREE.PlaneGeometry(20, 20, 50, 50);
  const floorMaterial = new THREE.MeshStandardMaterial({
    color: 0x90EE90,
    roughness: 0.8,
    metalness: 0.2
  });
  const floor = new THREE.Mesh(floorGeometry, floorMaterial);
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  floor.name = 'floor';
  scene.add(floor);

  addEnvironmentElements();

  camera.position.set(0, 8, 12);
  camera.lookAt(0, 0, 0);

  preview = new HamsterPreview('preview3D');
  preview.updateHamster({});

  setupEventHandlers();
  loadExistingHamsters();
  animate();
}

async function loadExistingHamsters() {
  const hamsters = await room.collection('hamster').getList();
  hamsters.forEach(createHamsterFromData);
}

function createHamsterFromData(data) {
  if (hamsterMeshes.has(data.id)) return;
  
  const hamster = createHamster(data.params);
  hamster.group.position.set(data.position.x, data.position.y, data.position.z);
  hamster.direction = data.direction;
  scene.add(hamster.group);
  hamsterMeshes.set(data.id, hamster);
  
  if (data.username === room.party.client.username) {
    myHamsterId = data.id;
  }
}

function setupEventHandlers() {
  renderer.domElement.addEventListener('mousemove', onMouseMove);
  renderer.domElement.addEventListener('mousedown', onMouseDown);
  renderer.domElement.addEventListener('mouseup', onMouseUp);
  
  room.collection('hamster').subscribe((hamsters) => {
    hamsters.forEach(createHamsterFromData);
  });
  
  room.onmessage = (event) => {
    const data = event.data;
    if (data.type === 'hamsterMove') {
      const hamster = hamsterMeshes.get(data.id);
      if (hamster && data.clientId !== room.party.client.id) {
        hamster.group.position.set(data.position.x, data.position.y, data.position.z);
        hamster.direction = data.direction;
      }
    }
  };
}

function onMouseMove(event) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  
  handCursor.style.left = event.clientX + 'px';
  handCursor.style.top = event.clientY + 'px';
  
  if (selectedHamster) {
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObject(scene.getObjectByName('floor'));
    if (intersects.length > 0) {
      selectedHamster.group.position.copy(intersects[0].point);
      selectedHamster.group.position.y = 0.5;
    }
  }
}

function onMouseDown(event) {
  raycaster.setFromCamera(mouse, camera);
  const intersects = [];
  hamsterMeshes.forEach(hamster => {
    intersects.push(...raycaster.intersectObject(hamster.collisionSphere));
  });

  if (intersects.length > 0) {
    const clickedHamster = intersects[0].object.parent;
    const hamsterId = Array.from(hamsterMeshes.entries())
      .find(([_, hamster]) => hamster.group === clickedHamster)[0];
    
    if (hamsterId === myHamsterId) {
      selectedHamster = hamsterMeshes.get(hamsterId);
      document.body.classList.add('is-grabbing');
      handCursor.style.display = 'block';
      
      // Show customization panel with current parameters
      document.getElementById('customizePanel').style.display = 'block';
      document.getElementById('spawnHamster').style.display = 'none';
      document.getElementById('updateHamster').style.display = 'block';
    }
  }
}

async function onMouseUp(event) {
  if (selectedHamster) {
    document.body.classList.remove('is-grabbing');
    handCursor.style.display = 'none';
    
    // Update position in database
    await room.collection('hamster').update(myHamsterId, {
      position: {
        x: selectedHamster.group.position.x,
        y: selectedHamster.group.position.y,
        z: selectedHamster.group.position.z
      },
      direction: selectedHamster.direction
    });
    
    // Broadcast position update
    room.send({
      type: 'hamsterMove',
      id: myHamsterId,
      position: selectedHamster.group.position,
      direction: selectedHamster.direction
    });
    
    selectedHamster = null;
  }
}

function addEnvironmentElements() {
  // Add some decorative grass patches
  for (let i = 0; i < 50; i++) {
    const grassGeometry = new THREE.ConeGeometry(0.1, 0.3, 4);
    const grassMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0x228B22).multiplyScalar(0.8 + Math.random() * 0.4)
    });
    const grass = new THREE.Mesh(grassGeometry, grassMaterial);
    grass.position.set(
      (Math.random() - 0.5) * 18,
      0.15,
      (Math.random() - 0.5) * 18
    );
    grass.rotation.y = Math.random() * Math.PI;
    scene.add(grass);
  }
}

function getCurrentHamsterParams() {
  return {
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
}

document.getElementById('startButton').addEventListener('click', () => {
  document.getElementById('startScreen').style.display = 'none';
  document.getElementById('customizePanel').style.display = 'block';
  bgMusic.play();
  init();
});

document.getElementById('spawnHamster').addEventListener('click', async () => {
  if (myHamsterId) return; // Only one hamster per user
  
  const params = getCurrentHamsterParams();
  const position = {
    x: (Math.random() - 0.5) * 10,
    y: 0.5,
    z: (Math.random() - 0.5) * 10
  };
  
  const hamsterData = await room.collection('hamster').create({
    params,
    position,
    direction: Math.random() * Math.PI * 2,
    username: room.party.client.username
  });
  
  myHamsterId = hamsterData.id;
  document.getElementById('customizePanel').style.display = 'none';
});

document.getElementById('updateHamster').addEventListener('click', async () => {
  if (!myHamsterId) return;
  
  const params = getCurrentHamsterParams();
  await room.collection('hamster').update(myHamsterId, {
    params
  });
  
  // Update local hamster
  const hamster = hamsterMeshes.get(myHamsterId);
  scene.remove(hamster.group);
  const newHamster = createHamster(params);
  newHamster.group.position.copy(hamster.group.position);
  newHamster.direction = hamster.direction;
  scene.add(newHamster.group);
  hamsterMeshes.set(myHamsterId, newHamster);
  
  document.getElementById('customizePanel').style.display = 'none';
});

// Update preview on any customization change
document.querySelectorAll('#customizePanel input, #customizePanel select').forEach(input => {
  input.addEventListener('change', () => preview.updateHamster(getCurrentHamsterParams()));
  input.addEventListener('input', () => preview.updateHamster(getCurrentHamsterParams()));
});

function animate() {
  requestAnimationFrame(animate);
  
  hamsterMeshes.forEach(hamster => {
    if (hamster !== selectedHamster) {
      hamster.direction += (Math.random() - 0.5) * 0.1;
      hamster.group.rotation.y = hamster.direction;
      
      const speed = 0.03;
      const newX = hamster.group.position.x + Math.cos(hamster.direction) * speed;
      const newZ = hamster.group.position.z + Math.sin(hamster.direction) * speed;

      if (Math.abs(newX) < 9) hamster.group.position.x = newX;
      else hamster.direction = Math.PI - hamster.direction;
      
      if (Math.abs(newZ) < 9) hamster.group.position.z = newZ;
      else hamster.direction = -hamster.direction;
    }
  });

  checkCollisions();
  renderer.render(scene, camera);
}

function checkCollisions() {
  const hamsters = Array.from(hamsterMeshes.values());
  for (let i = 0; i < hamsters.length; i++) {
    for (let j = i + 1; j < hamsters.length; j++) {
      const hamster1 = hamsters[i];
      const hamster2 = hamsters[j];
      
      if (hamster1 === selectedHamster || hamster2 === selectedHamster) continue;
      
      const distance = hamster1.group.position.distanceTo(hamster2.group.position);
      const combinedRadius = hamster1.collisionSphere.geometry.parameters.radius + 
                           hamster2.collisionSphere.geometry.parameters.radius;
      
      if (distance < combinedRadius) {
        const angle = Math.atan2(
          hamster2.group.position.z - hamster1.group.position.z,
          hamster2.group.position.x - hamster1.group.position.x
        );
        
        hamster1.direction = angle + Math.PI;
        hamster2.direction = angle;
        
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

window.addEventListener('resize', () => {
  if (camera && renderer) {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }
});