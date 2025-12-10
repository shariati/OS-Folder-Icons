'use client';

import { useState, useEffect } from 'react';
import { HeroSlide } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, ChevronRight } from 'lucide-react';

export function HeroSlider({ slides }: { slides: HeroSlide[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  // Prevent hydration mismatch by waiting for mount
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const timer = setInterval(() => {
      nextSlide();
    }, 6000);
    return () => clearInterval(timer);
  }, [currentIndex, mounted]);

  const nextSlide = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index: number) => {
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  };

  // Always render the container to prevent hydration mismatch
  if (!slides || slides.length === 0) {
    return <div className="relative h-screen w-full overflow-hidden bg-black" />;
  }

  const currentSlide = slides[currentIndex];

  // Calculate next slides for the preview list
  const nextSlides = [1, 2, 3].map((offset) => {
    const index = (currentIndex + offset) % slides.length;
    return { ...slides[index], index };
  });

  // Before mount, render a static version without animations
  if (!mounted) {
    return (
      <div className="relative h-screen w-full overflow-hidden bg-black">
        <div className="absolute inset-0 h-full w-full">
          <div className="absolute inset-0 z-10 bg-black/40" />
          {currentSlide.imageUrl && (
            <Image
              src={currentSlide.imageUrl}
              alt={currentSlide.title}
              fill
              className="object-cover"
              priority
              sizes="100vw"
            />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-screen w-full overflow-hidden bg-black">
      {/* Background Image Transition */}
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={currentIndex}
          custom={direction}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
          className="absolute inset-0 h-full w-full"
        >
          {/* Dark Overlay */}
          <div className="absolute inset-0 z-10 bg-black/40" />
          {currentSlide.imageUrl && (
            <Image
              src={currentSlide.imageUrl}
              alt={currentSlide.title}
              fill
              className="object-cover"
              priority
              sizes="100vw"
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Content Container */}
      <div className="absolute inset-0 z-20 mx-auto flex max-w-[1920px] flex-col justify-center px-8 md:px-16 lg:px-24">
        <div className="grid h-full w-full grid-cols-1 items-end gap-8 pb-24 lg:grid-cols-12 lg:items-center lg:pb-0">
          {/* Left Content */}
          <div className="space-y-6 pt-24 text-white lg:col-span-5 lg:pt-0">
            <motion.div
              key={`text-${currentIndex}`}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              <div className="mb-4 flex items-center gap-4">
                <div className="h-[2px] w-12 bg-yellow-400" />
                <span className="text-sm font-medium uppercase tracking-widest text-yellow-400">
                  {currentSlide.subtitle || 'Featured'}
                </span>
              </div>
              <h1 className="mb-6 text-5xl font-bold uppercase leading-tight md:text-7xl">
                {currentSlide.title}
              </h1>
              <p className="mb-8 max-w-md text-lg leading-relaxed text-gray-200">
                {currentSlide.description}
              </p>

              {currentSlide.link && (
                <Link
                  href={currentSlide.link}
                  className="group inline-flex items-center gap-3 rounded-full bg-yellow-400 px-8 py-4 font-bold text-black transition-colors hover:bg-white"
                >
                  Explore Collection
                  <ChevronRight
                    size={20}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </Link>
              )}
            </motion.div>
          </div>

          {/* Right Preview Carousel */}
          <div className="hidden h-[50vh] items-end justify-end gap-6 lg:col-span-7 lg:flex">
            {nextSlides.map((slide, i) => (
              <motion.div
                key={slide.id}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.1, duration: 0.5 }}
                onClick={() => goToSlide(slide.index)}
                className="group relative h-72 w-48 cursor-pointer overflow-hidden rounded-2xl border border-white/10 shadow-2xl transition-colors hover:border-yellow-400/50"
              >
                <div className="absolute inset-0 z-10 bg-black/30 transition-colors group-hover:bg-black/10" />
                {slide.imageUrl && (
                  <Image
                    src={slide.imageUrl}
                    alt={slide.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    sizes="192px"
                  />
                )}
                <div className="absolute bottom-0 left-0 z-20 w-full bg-gradient-to-t from-black/80 to-transparent p-4">
                  <p className="mb-1 text-xs uppercase tracking-wider text-yellow-400">
                    {slide.subtitle}
                  </p>
                  <h3 className="text-sm font-bold uppercase leading-tight text-white">
                    {slide.title}
                  </h3>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Navigation & Progress */}
        <div className="absolute bottom-12 left-8 right-8 flex items-center justify-between md:left-16 md:right-16 lg:left-24 lg:right-24">
          <div className="flex gap-4">
            <button
              onClick={prevSlide}
              className="flex h-12 w-12 items-center justify-center rounded-full border border-white/30 text-white transition-all hover:bg-white hover:text-black"
            >
              <ArrowLeft size={20} />
            </button>
            <button
              onClick={nextSlide}
              className="flex h-12 w-12 items-center justify-center rounded-full border border-white/30 text-white transition-all hover:bg-white hover:text-black"
            >
              <ArrowRight size={20} />
            </button>
          </div>

          <div className="flex items-center gap-4 font-mono text-xl text-white">
            <span>0{currentIndex + 1}</span>
            <div className="relative h-[2px] w-32 overflow-hidden bg-white/20">
              <motion.div
                key={currentIndex}
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: 6, ease: 'linear' }}
                className="absolute left-0 top-0 h-full bg-yellow-400"
              />
            </div>
            <span>0{slides.length}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
