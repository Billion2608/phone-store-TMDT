"use client";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
export type HeroSlide = {
  id: string;
  title: string;
  subtitle: string | null;
  image: string | null;
  href: string;
  buttonText: string;
  cover?: boolean;
};
export function HomeHero({ slides }: { slides: HeroSlide[] }) {
  const [active, setActive] = useState(0);
  const total = slides.length || 1;
  useEffect(() => {
    if (slides.length < 2) return;
    const timer = window.setInterval(
      () => setActive((value) => (value + 1) % slides.length),
      5000,
    );
    return () => window.clearInterval(timer);
  }, [slides.length]);
  const slide = slides[active];
  const move = (direction: number) =>
    setActive((value) => (value + direction + total) % total);
  if (!slide) return null;
  return (
    <section className="mx-auto max-w-[1280px] px-3 pt-4 sm:px-4">
      <div className="group relative min-h-[330px] overflow-hidden rounded-xl border border-[#dfd1c4] bg-[#8c6d53] text-white shadow-sm sm:min-h-[410px]">
        {slide.image && slide.cover ? (
          <Image
            alt={slide.title}
            className="object-cover"
            fill
            priority
            sizes="(max-width: 1280px) 100vw, 1280px"
            src={slide.image}
          />
        ) : null}
        <div
          className={`absolute inset-0 ${slide.cover ? "bg-gradient-to-r from-[#4b3425]/90 via-[#6f523e]/55 to-transparent" : "bg-[linear-gradient(110deg,#6f523e_0%,#8c6d53_60%,#b99575_100%)]"}`}
        />
        <div className="relative z-10 max-w-[60%] p-7 sm:p-12 lg:p-16">
          <span className="inline-flex rounded-md bg-white/15 px-3 py-1.5 text-xs font-bold uppercase tracking-wider">
            Ưu đãi nổi bật
          </span>
          <h1 className="mt-5 text-3xl font-black leading-tight sm:text-5xl">
            {slide.title}
          </h1>
          {slide.subtitle ? (
            <p className="mt-4 max-w-xl text-sm leading-6 text-white/85 sm:text-base">
              {slide.subtitle}
            </p>
          ) : null}
          <Link
            className="mt-6 inline-flex items-center gap-2 rounded-md bg-[#fdfbf7] px-6 py-3 text-sm font-bold text-[#8c6d53] hover:bg-white"
            href={slide.href}
          >
            {slide.buttonText} <ArrowRight size={16} />
          </Link>
        </div>
        {slide.image && !slide.cover ? (
          <div className="absolute inset-y-0 right-0 w-[48%] bg-[#fffdf9]">
            <Image
              alt={slide.title}
              className="object-contain p-6"
              fill
              sizes="50vw"
              src={slide.image}
            />
          </div>
        ) : null}
        <button
          aria-label="Banner trước"
          className="absolute left-3 top-1/2 z-20 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-white/85 text-[#6f523e] opacity-0 shadow transition-opacity group-hover:opacity-100"
          onClick={() => move(-1)}
        >
          <ArrowLeft size={18} />
        </button>
        <button
          aria-label="Banner tiếp theo"
          className="absolute right-3 top-1/2 z-20 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-white/85 text-[#6f523e] opacity-0 shadow transition-opacity group-hover:opacity-100"
          onClick={() => move(1)}
        >
          <ArrowRight size={18} />
        </button>
      </div>
      <div className="mt-3 flex items-center justify-center gap-2">
        {slides.map((item, index) => (
          <button
            aria-label={`Xem banner ${index + 1}`}
            className={`h-1.5 rounded-full transition-all ${index === active ? "w-7 bg-[#d97706]" : "w-2 bg-[#d9cabc]"}`}
            key={item.id}
            onClick={() => setActive(index)}
          />
        ))}
      </div>
    </section>
  );
}
