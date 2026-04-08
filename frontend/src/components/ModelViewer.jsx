import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

export default function ModelViewer({ url = '/videos/result.glb', className = '' }) {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // ── Cena ─────────────────────────────────────────────────
    const scene = new THREE.Scene();

    const width  = mount.clientWidth;
    const height = mount.clientHeight;

    // ── Câmera ───────────────────────────────────────────────
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 4);

    // ── Renderer ─────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mount.appendChild(renderer.domElement);

    // ── Luzes ────────────────────────────────────────────────
    scene.add(new THREE.AmbientLight(0xffffff, 0.6));

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(5, 5, 5);
    scene.add(dirLight);

    const fillLight = new THREE.DirectionalLight(0x5eead4, 0.4);
    fillLight.position.set(-3, 2, -3);
    scene.add(fillLight);

    const pointLight = new THREE.PointLight(0x31B0A9, 0.8, 20);
    pointLight.position.set(0, 3, 2);
    scene.add(pointLight);

    // ── Carrega GLB ──────────────────────────────────────────
    let model = null;
    const loader = new GLTFLoader();
    loader.load(url, (gltf) => {
      model = gltf.scene;

      // Centraliza o modelo
      const box = new THREE.Box3().setFromObject(model);
      const center = box.getCenter(new THREE.Vector3());
      model.position.sub(center);

      // Normaliza escala para caber na tela
      const size = box.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);
      model.scale.setScalar(1.8 / maxDim);
      model.position.y -= 0.2;

      scene.add(model);
    });

    // ── Mouse ────────────────────────────────────────────────
    const mouse  = { x: 0, y: 0 };
    const target = { x: 0, y: 0 };

    const onMouseMove = (e) => {
      mouse.x =  (e.clientX / window.innerWidth)  * 2 - 1;
      mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', onMouseMove);

    // ── Resize ───────────────────────────────────────────────
    const onResize = () => {
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    // ── Loop de animação ─────────────────────────────────────
    let animId;
    const animate = () => {
      animId = requestAnimationFrame(animate);

      // Lerp suave
      target.x += (mouse.x - target.x) * 0.05;
      target.y += (mouse.y - target.y) * 0.05;

      if (model) {
        model.rotation.y =  target.x * 0.45;
        model.rotation.x = -target.y * 0.2;
      }

      renderer.render(scene, camera);
    };
    animate();

    // ── Cleanup ──────────────────────────────────────────────
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, [url]);

  return <div ref={mountRef} className={`w-full h-full ${className}`} />;
}
