"use client";
import { useEffect, useRef } from "react";

const Hero = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);

    const mouse = { x: -9999, y: -9999 };
    const colors = ["#facc15", "#fb923c", "#a855f7", "#ec4899", "#60a5fa"];

    const particles = Array.from({ length: 250 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      baseX: Math.random() * w,
      baseY: Math.random() * h,
      size: 1.5 + Math.random() * 2,
      color: colors[Math.floor(Math.random() * colors.length)],
    }));

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    const handleMouseLeave = () => {
      mouse.x = -9999;
      mouse.y = -9999;
    };

    const handleResize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("resize", handleResize);

    let animId: number;

    const animate = () => {
      ctx.clearRect(0, 0, w, h);

      particles.forEach((p) => {
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 150) {
          p.x += dx * 0.15;
          p.y += dy * 0.15;
        } else {
          p.x += (p.baseX - p.x) * 0.02;
          p.y += (p.baseY - p.y) * 0.02;
        }

        ctx.beginPath();
        ctx.fillStyle = p.color;
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); // ✅ fixed: was 2 not 0
        ctx.fill();
      });

      animId = requestAnimationFrame(animate);
    };

    animate();

    // ✅ Cleanup on unmount
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <section className="relative h-screen overflow-hidden">
      {/* BG IMAGE */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/hero4.png')" }}
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Particles */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 z-10 pointer-events-none"
      />

      {/* Content */}
      <div className="relative z-20 flex h-full items-center justify-center text-center">
        <div>
          <h1 className="text-6xl md:text-8xl font-bold text-white">
            Timeless Luxury
          </h1>
          <p className="mt-4 text-xl md:text-2xl text-white/90">
            Premium products crafted for elegance
          </p>
          <a
            href="/shop"
            className="inline-block mt-8 px-8 py-4 bg-yellow-500 hover:bg-yellow-600 text-black font-semibold rounded-xl shadow-xl"
          >
            Explore Collection
          </a>
        </div>
      </div>
    </section>
  );
};

export default Hero;