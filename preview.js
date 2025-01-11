export class HamsterPreview {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, this.container.clientWidth / this.container.clientHeight, 0.1, 1000);
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.container.appendChild(this.renderer.domElement);

    this.camera.position.set(0, 1, 2);
    this.camera.lookAt(0, 0, 0);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(0, 10, 5);
    this.scene.add(directionalLight);

    this.hamsterPreview = null;
    this.rotationSpeed = 0;
    this.animate();

    document.getElementById('rotateLeft').addEventListener('click', () => {
      this.rotationSpeed = -0.02;
      setTimeout(() => this.rotationSpeed = 0, 1000);
    });

    document.getElementById('rotateRight').addEventListener('click', () => {
      this.rotationSpeed = 0.02;
      setTimeout(() => this.rotationSpeed = 0, 1000);
    });
  }

  updateHamster(params) {
    if (this.hamsterPreview) {
      this.scene.remove(this.hamsterPreview.group);
    }
    this.hamsterPreview = createHamster(params);
    this.scene.add(this.hamsterPreview.group);
  }

  animate = () => {
    requestAnimationFrame(this.animate);
    if (this.hamsterPreview) {
      this.hamsterPreview.group.rotation.y += this.rotationSpeed;
    }
    this.renderer.render(this.scene, this.camera);
  }
}