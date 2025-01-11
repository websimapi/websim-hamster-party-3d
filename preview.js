import * as THREE from 'three';

export class HamsterPreview {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, this.container.clientWidth / this.container.clientHeight, 0.1, 1000);
    this.renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true 
    });
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.setClearColor(0xf0f0f0, 1);
    this.container.appendChild(this.renderer.domElement);

    // Improved camera positioning for better view
    this.camera.position.set(1.5, 1.2, 1.5);
    this.camera.lookAt(0, 0, 0);

    // Enhanced lighting setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);
    
    const mainLight = new THREE.DirectionalLight(0xffffff, 0.8);
    mainLight.position.set(5, 5, 5);
    this.scene.add(mainLight);

    const fillLight = new THREE.DirectionalLight(0xffffff, 0.4);
    fillLight.position.set(-5, 3, -5);
    this.scene.add(fillLight);

    const backLight = new THREE.DirectionalLight(0xffffff, 0.3);
    backLight.position.set(0, 3, -5);
    this.scene.add(backLight);

    // Add a subtle ground plane for better perspective
    const groundGeometry = new THREE.PlaneGeometry(4, 4);
    const groundMaterial = new THREE.MeshStandardMaterial({
      color: 0xeeeeee,
      roughness: 0.8,
      metalness: 0.2
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.5;
    this.scene.add(ground);

    this.hamsterPreview = null;
    this.rotationSpeed = 0;
    this.targetRotation = 0;
    this.animate();

    // Improved rotation controls
    document.getElementById('rotateLeft').addEventListener('click', () => {
      this.targetRotation -= Math.PI / 2;
    });

    document.getElementById('rotateRight').addEventListener('click', () => {
      this.targetRotation += Math.PI / 2;
    });

    // Handle resize
    window.addEventListener('resize', this.handleResize.bind(this));
  }

  handleResize() {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  updateHamster(params) {
    if (this.hamsterPreview) {
      this.scene.remove(this.hamsterPreview.group);
    }
    this.hamsterPreview = createHamster(params);
    // Center the hamster in the preview
    this.hamsterPreview.group.position.set(0, 0, 0);
    this.scene.add(this.hamsterPreview.group);
  }

  animate = () => {
    requestAnimationFrame(this.animate);
    
    if (this.hamsterPreview) {
      // Smooth rotation
      const currentRotation = this.hamsterPreview.group.rotation.y;
      const rotationDiff = this.targetRotation - currentRotation;
      
      if (Math.abs(rotationDiff) > 0.01) {
        this.hamsterPreview.group.rotation.y += rotationDiff * 0.1;
      }
    }
    
    this.renderer.render(this.scene, this.camera);
  }
}