"use client";

import { useEffect, useRef } from "react";
import { DroneMark } from "@/components/drone-mark";

/**
 * Габариты в px: 30 × 42 — те же пропорции 1 : 1,4, что у самого аппарата.
 * Нос выносится вперёд по курсу так, чтобы он целился в точку клика.
 */
const DRONE_LENGTH = 44;
const DRONE_WIDTH = 31;
/** Центр силуэта чуть впереди указателя, нос — примерно в 30 px от него. */
const AHEAD = DRONE_LENGTH / 2 - 6;

/** Разница углов в диапазоне [-180, 180] — для плавного доворота по курсу. */
function angleDelta(from: number, to: number) {
  let delta = (to - from) % 360;
  if (delta > 180) delta -= 360;
  if (delta < -180) delta += 360;
  return delta;
}

/**
 * Курсор-БПЛА: силуэт G2 летит за указателем с инерцией, нос всегда
 * смотрит точно в точку клика, на скорости аппарат доворачивается по курсу и
 * кренится. Включается только для мыши и без prefers-reduced-motion.
 */
export function Cursor() {
  const shell = useRef<HTMLDivElement | null>(null);
  const drone = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduced) return;

    const shellNode = shell.current;
    const droneNode = drone.current;
    if (!shellNode || !droneNode) return;

    document.documentElement.setAttribute("data-cursor", "custom");

    let frame = 0;
    let previous = performance.now();

    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let x = targetX;
    let y = targetY;

    // курс полёта (единичный вектор), сглаженная скорость, крен
    let dirX = 0;
    let dirY = -1;
    let speed = 0;
    let angle = 0;
    let bank = 0;
    let lastMove = 0;
    let visible = false;

    const onMove = (event: PointerEvent) => {
      const dx = event.clientX - targetX;
      const dy = event.clientY - targetY;
      targetX = event.clientX;
      targetY = event.clientY;

      const distance = Math.hypot(dx, dy);
      if (distance > 0.7) {
        dirX += (dx / distance - dirX) * 0.3;
        dirY += (dy / distance - dirY) * 0.3;
        speed = Math.min(46, speed + distance * 0.35);
        lastMove = performance.now();
      }

      if (!visible) {
        visible = true;
        shellNode.dataset.visible = "true";
      }
    };

    const render = (now: number) => {
      frame = window.requestAnimationFrame(render);
      const dt = Math.min(48, now - previous);
      previous = now;

      // инерция позиции: аппарат «долетает» до указателя
      x += (targetX - x) * 0.145;
      y += (targetY - y) * 0.145;

      speed *= Math.pow(0.9, dt / 16.7);

      const idle = now - lastMove > 420;
      const hovering = idle || speed < 1.2;
      const angleTarget = hovering
        ? 0 // в покое аппарат висит носом вверх
        : (Math.atan2(dirY, dirX) * 180) / Math.PI + 90;

      angle += angleDelta(angle, angleTarget) * (hovering ? 0.035 : 0.11);

      const bankTarget = hovering
        ? 0
        : Math.max(-15, Math.min(15, dirX * 26 * Math.min(1, speed / 16)));
      bank += (bankTarget - bank) * 0.08;

      shellNode.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0)`;
      // доворот по курсу + вынос вперёд, чтобы нос целился в точку клика
      droneNode.style.transform = `rotate(${angle.toFixed(2)}deg) translateY(${(
        -AHEAD -
        speed * 0.14
      ).toFixed(2)}px) skewX(${bank.toFixed(2)}deg)`;
    };
    frame = window.requestAnimationFrame(render);

    const onOver = (event: PointerEvent) => {
      const target = event.target as HTMLElement | null;
      const editing = Boolean(target?.closest("input, textarea, select"));
      const interactive = Boolean(
        target?.closest(
          "a, button, [role='button'], summary, label, [data-cursor='hover']",
        ),
      );
      shellNode.dataset.text = editing ? "true" : "false";
      shellNode.dataset.hover = !editing && interactive ? "true" : "false";
    };

    const onDown = () => {
      shellNode.dataset.down = "true";
    };
    const onUp = () => {
      shellNode.dataset.down = "false";
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerover", onOver, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });

    return () => {
      document.documentElement.removeAttribute("data-cursor");
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerover", onOver);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div ref={shell} className="cursor-shell" aria-hidden="true">
      <span
        ref={drone}
        className="cursor-drone"
        style={{ width: DRONE_WIDTH, height: DRONE_LENGTH }}
      >
        <DroneMark className="h-full w-full" />
      </span>
      <span className="cursor-hotspot" />
    </div>
  );
}
