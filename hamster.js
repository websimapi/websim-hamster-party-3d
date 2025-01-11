import * as THREE from 'three';

export function createHamster(params = {}) {
  const {
    furColor = 0xB87A3D,
    furPattern = 'solid',
    earColor = 0xA06030,
    eyeColor = 0x000000,
    size = 1,
    earSize = 1,
    tailLength = 0.5,
    legLength = 0.5,
    hasGlasses = false,
    hasHat = false
  } = params;

  const hamsterGroup = new THREE.Group();
  
  // Body
  const bodyGeometry = new THREE.SphereGeometry(0.5 * size, 32, 32);
  const bodyMaterial = new THREE.MeshStandardMaterial({
    color: furColor,
    roughness: 0.7
  });

  // Apply fur pattern
  if (furPattern !== 'solid') {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 256;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#' + new THREE.Color(furColor).getHexString();
    ctx.fillRect(0, 0, 256, 256);
    
    const darkerColor = new THREE.Color(furColor).multiplyScalar(0.8);
    ctx.fillStyle = '#' + darkerColor.getHexString();

    if (furPattern === 'striped') {
      for (let i = 0; i < 5; i++) {
        ctx.fillRect(0, i * 50, 256, 25);
      }
    } else if (furPattern === 'spotted') {
      for (let i = 0; i < 50; i++) {
        ctx.beginPath();
        ctx.arc(Math.random() * 256, Math.random() * 256, 10 + Math.random() * 10, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    bodyMaterial.map = texture;
  }

  const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
  hamsterGroup.add(body);

  // Add collision sphere
  const collisionGeometry = new THREE.SphereGeometry(0.6 * size, 8, 8);
  const collisionMaterial = new THREE.MeshBasicMaterial({
    visible: false
  });
  const collisionSphere = new THREE.Mesh(collisionGeometry, collisionMaterial);
  hamsterGroup.add(collisionSphere);

  // Head
  const headGeometry = new THREE.SphereGeometry(0.3 * size, 32, 32);
  const head = new THREE.Mesh(headGeometry, bodyMaterial);
  head.position.set(0.4 * size, 0.2 * size, 0);
  hamsterGroup.add(head);

  // Ears
  const earMaterial = new THREE.MeshStandardMaterial({ 
    color: earColor,
    roughness: 0.7
  });
  const earGeometry = new THREE.CircleGeometry(0.15 * earSize, 32);
  
  const leftEar = new THREE.Mesh(earGeometry, earMaterial);
  leftEar.position.set(0.5 * size, 0.4 * size, 0.15 * size);
  leftEar.rotation.y = -Math.PI / 4;
  hamsterGroup.add(leftEar);

  const rightEar = new THREE.Mesh(earGeometry, earMaterial);
  rightEar.position.set(0.5 * size, 0.4 * size, -0.15 * size);
  rightEar.rotation.y = Math.PI / 4;
  hamsterGroup.add(rightEar);

  // Eyes
  const eyeGeometry = new THREE.SphereGeometry(0.05 * size, 16, 16);
  const eyeMaterial = new THREE.MeshStandardMaterial({ color: eyeColor });
  
  const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
  leftEye.position.set(0.5 * size, 0.3 * size, 0.15 * size);
  hamsterGroup.add(leftEye);

  const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
  rightEye.position.set(0.5 * size, 0.3 * size, -0.15 * size);
  hamsterGroup.add(rightEye);

  // Nose
  const noseGeometry = new THREE.SphereGeometry(0.05 * size, 16, 16);
  const noseMaterial = new THREE.MeshStandardMaterial({ color: 0xFF69B4 });
  const nose = new THREE.Mesh(noseGeometry, noseMaterial);
  nose.position.set(0.6 * size, 0.25 * size, 0);
  hamsterGroup.add(nose);

  // Whiskers
  const whiskerMaterial = new THREE.LineBasicMaterial({ color: 0xFFFFFF });
  for (let i = -1; i <= 1; i++) {
    const whiskerGeometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0.6 * size, 0.25 * size, 0.05 * i * size),
      new THREE.Vector3(0.8 * size, 0.25 * size + 0.05 * i, 0.1 * i * size)
    ]);
    const whisker = new THREE.Line(whiskerGeometry, whiskerMaterial);
    hamsterGroup.add(whisker);
  }

  // Tail
  const tailGeometry = new THREE.ConeGeometry(0.05 * size, tailLength * size, 16);
  const tailMaterial = new THREE.MeshStandardMaterial({ color: furColor });
  const tail = new THREE.Mesh(tailGeometry, tailMaterial);
  tail.position.set(-0.5 * size, -0.1 * size, 0);
  tail.rotation.z = Math.PI;
  hamsterGroup.add(tail);

  // Legs
  const legGeometry = new THREE.CylinderGeometry(0.05 * size, 0.05 * size, legLength * size, 16);
  const legMaterial = new THREE.MeshStandardMaterial({ color: furColor });

  const frontLeftLeg = new THREE.Mesh(legGeometry, legMaterial);
  frontLeftLeg.position.set(0.2 * size, -0.3 * size, 0.2 * size);
  hamsterGroup.add(frontLeftLeg);

  const frontRightLeg = new THREE.Mesh(legGeometry, legMaterial);
  frontRightLeg.position.set(0.2 * size, -0.3 * size, -0.2 * size);
  hamsterGroup.add(frontRightLeg);

  const backLeftLeg = new THREE.Mesh(legGeometry, legMaterial);
  backLeftLeg.position.set(-0.2 * size, -0.3 * size, 0.2 * size);
  hamsterGroup.add(backLeftLeg);

  const backRightLeg = new THREE.Mesh(legGeometry, legMaterial);
  backRightLeg.position.set(-0.2 * size, -0.3 * size, -0.2 * size);
  hamsterGroup.add(backRightLeg);

  // Accessories
  if (hasGlasses) {
    const glassMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const lensGeometry = new THREE.RingGeometry(0.06 * size, 0.08 * size, 16);
    const leftLens = new THREE.Mesh(lensGeometry, glassMaterial);
    leftLens.position.set(0.5 * size, 0.3 * size, 0.12 * size);
    leftLens.rotation.y = Math.PI / 2;
    hamsterGroup.add(leftLens);

    const rightLens = new THREE.Mesh(lensGeometry, glassMaterial);
    rightLens.position.set(0.5 * size, 0.3 * size, -0.12 * size);
    rightLens.rotation.y = Math.PI / 2;
    hamsterGroup.add(rightLens);

    const bridgeGeometry = new THREE.CylinderGeometry(0.01 * size, 0.01 * size, 0.05 * size, 8);
    const bridge = new THREE.Mesh(bridgeGeometry, glassMaterial);
    bridge.position.set(0.5 * size, 0.3 * size, 0);
    bridge.rotation.z = Math.PI / 2;
    hamsterGroup.add(bridge);
  }

  if (hasHat) {
    const hatMaterial = new THREE.MeshStandardMaterial({ color: 0x0000FF });
    const brimGeometry = new THREE.CylinderGeometry(0.25 * size, 0.25 * size, 0.02 * size, 32);
    const brim = new THREE.Mesh(brimGeometry, hatMaterial);
    brim.position.set(0.5 * size, 0.4 * size, 0);
    hamsterGroup.add(brim);

    const topGeometry = new THREE.CylinderGeometry(0.15 * size, 0.15 * size, 0.2 * size, 32);
    const top = new THREE.Mesh(topGeometry, hatMaterial);
    top.position.set(0.5 * size, 0.5 * size, 0);
    hamsterGroup.add(top);
  }

  // Random position
  hamsterGroup.position.set(
    (Math.random() - 0.5) * 10,
    0.5 * size,
    (Math.random() - 0.5) * 10
  );

  return {
    group: hamsterGroup,
    collisionSphere: collisionSphere,
    velocity: new THREE.Vector3(0, 0, 0),
    direction: Math.random() * Math.PI * 2
  };
}