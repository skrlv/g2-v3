"use client";

import { useEffect, useRef, useState } from "react";
import type { Material, Mesh, Texture } from "three";

type Status = "loading" | "ready" | "error";

/**
 * Loads a GLB/GLTF asset with three.js.
 * If `modelUrl` is empty — or the asset fails to load — the regular product
 * image is rendered in its place, so the page never shows an empty block.
 *
 * Всё, что создано (рендерер, окружение, геометрия, материалы, текстуры),
 * освобождается при размонтировании и при ошибке загрузки — иначе при быстрой
 * навигации накапливались WebGL-контексты, и браузер начинал их отбирать.
 */
export function ThreeDViewer({
  modelUrl,
  fallbackImage,
  alt,
  className = "",
  aspect = "aspect-4/5",
}: {
  modelUrl?: string | null;
  fallbackImage: string;
  alt: string;
  className?: string;
  aspect?: string;
}) {
  const mount = useRef<HTMLDivElement | null>(null);
  const [status, setStatus] = useState<Status>(modelUrl ? "loading" : "error");
  const hasModel = Boolean(modelUrl && modelUrl.trim());

  useEffect(() => {
    if (!hasModel) {
      setStatus("error");
      return;
    }
    const container = mount.current;
    if (!container) return;

    let disposed = false;
    let frame = 0;
    let cleanup = () => {};

    (async () => {
      try {
        const [THREE, { GLTFLoader }, { OrbitControls }, { RoomEnvironment }] =
          await Promise.all([
            import("three"),
            import("three/examples/jsm/loaders/GLTFLoader.js"),
            import("three/examples/jsm/controls/OrbitControls.js"),
            import("three/examples/jsm/environments/RoomEnvironment.js"),
          ]);
        if (disposed) return;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
        camera.position.set(0, 0.6, 6.2);

        const renderer = new THREE.WebGLRenderer({
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.05;
        renderer.domElement.style.width = "100%";
        renderer.domElement.style.height = "100%";
        renderer.domElement.style.display = "block";
        container.appendChild(renderer.domElement);

        const pmrem = new THREE.PMREMGenerator(renderer);
        const environment = pmrem.fromScene(new RoomEnvironment(), 0.05).texture;
        scene.environment = environment;

        const key = new THREE.DirectionalLight(0xffffff, 2.4);
        key.position.set(3.4, 5, 4.2);
        scene.add(key);
        const rim = new THREE.DirectionalLight(0xa9b4c0, 1.5);
        rim.position.set(-4, 1.2, -3.4);
        scene.add(rim);
        scene.add(new THREE.AmbientLight(0xffffff, 0.35));

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.055;
        controls.enablePan = false;
        controls.autoRotate = true;
        controls.autoRotateSpeed = 0.42;
        controls.minDistance = 3.4;
        controls.maxDistance = 11;
        controls.minPolarAngle = Math.PI * 0.18;
        controls.maxPolarAngle = Math.PI * 0.86;

        let observer: ResizeObserver | null = null;

        // Освобождение назначается сразу, до загрузки модели: если страницу
        // закрыли, пока модель грузится, контекст всё равно будет отдан.
        cleanup = () => {
          observer?.disconnect();
          window.cancelAnimationFrame(frame);
          controls.dispose();
          pmrem.dispose();
          environment.dispose();
          scene.traverse((object) => {
            const mesh = object as Mesh;
            if (!mesh.isMesh) return;
            mesh.geometry.dispose();
            const materials: Material[] = Array.isArray(mesh.material)
              ? mesh.material
              : [mesh.material];
            for (const entry of materials) {
              for (const value of Object.values(entry)) {
                if (value && typeof value === "object" && "isTexture" in value) {
                  (value as Texture).dispose();
                }
              }
              entry.dispose();
            }
          });
          renderer.dispose();
          renderer.forceContextLoss();
          renderer.domElement.remove();
        };

        const gltf = await new GLTFLoader().loadAsync(modelUrl as string);
        if (disposed) return;

        const model = gltf.scene;
        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());
        const scale = 2.6 / Math.max(size.x, size.y, size.z || 1);
        model.scale.setScalar(scale);
        model.position.set(
          -center.x * scale,
          -center.y * scale,
          -center.z * scale,
        );
        scene.add(model);

        const resize = () => {
          const { clientWidth, clientHeight } = container;
          if (!clientWidth || !clientHeight) return;
          renderer.setSize(clientWidth, clientHeight, false);
          camera.aspect = clientWidth / clientHeight;
          camera.updateProjectionMatrix();
        };
        resize();
        observer = new ResizeObserver(resize);
        observer.observe(container);

        const tick = () => {
          controls.update();
          renderer.render(scene, camera);
          frame = window.requestAnimationFrame(tick);
        };
        frame = window.requestAnimationFrame(tick);
        setStatus("ready");
      } catch (error) {
        if (!disposed) {
          console.error("Не удалось загрузить 3D-модель:", error);
          cleanup();
          cleanup = () => {};
          setStatus("error");
        }
      }
    })();

    return () => {
      disposed = true;
      cleanup();
    };
  }, [hasModel, modelUrl]);

  return (
    <div className={`relative overflow-hidden bg-graphite ${aspect} ${className}`}>
      {hasModel && status !== "error" ? (
        <div
          ref={mount}
          className={`h-full w-full transition-opacity duration-1000 ease-[var(--ease-premium)] ${
            status === "ready" ? "opacity-100" : "opacity-0"
          }`}
        />
      ) : null}

      {/* Фото товара: пока модель грузится и всегда, когда модели нет */}
      {status !== "ready" ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={fallbackImage}
          alt={alt}
          loading="lazy"
          decoding="async"
          className="pointer-events-none absolute inset-0 h-full w-full object-cover"
        />
      ) : null}

      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between p-3">
        <span className="meta text-bone/70">
          {hasModel && status !== "error" ? "3D / GLTF" : "3D / фото товара"}
        </span>
        <span className="meta text-bone/50">
          {hasModel && status !== "error" ? "Потяните, чтобы вращать" : "Модель не прикреплена"}
        </span>
      </div>
      {status === "loading" ? (
        <span className="meta absolute bottom-3 left-3 text-bone/60">Загрузка геометрии…</span>
      ) : null}
    </div>
  );
}
