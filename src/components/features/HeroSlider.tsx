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
    return <div className="relative w-full h-screen overflow-hidden bg-black" />;
  }

  const currentSlide = slides[currentIndex];

  // Calculate next slides for the preview list
  const nextSlides = [1, 2, 3].map(offset => {
    const index = (currentIndex + offset) % slides.length;
    return { ...slides[index], index };
  });

  // Before mount, render a static version without animations
  if (!mounted) {
    return (
      <div className="relative w-full h-screen overflow-hidden bg-black">
        <div className="absolute inset-0 w-full h-full">
          <div className="absolute inset-0 bg-black/40 z-10" />
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
    <div className="relative w-full h-screen overflow-hidden bg-black">
      {/* Background Image Transition */}
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={currentIndex}
          custom={direction}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="absolute inset-0 w-full h-full"
        >
           {/* Dark Overlay */}
          <div className="absolute inset-0 bg-black/40 z-10" />
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
      <div className="absolute inset-0 z-20 flex flex-col justify-center px-8 md:px-16 lg:px-24 max-w-[1920px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full items-end lg:items-center h-full pb-24 lg:pb-0">
          
          {/* Left Content */}
          <div className="lg:col-span-5 text-white space-y-6 pt-24 lg:pt-0">
            <motion.div
              key={`text-${currentIndex}`}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="h-[2px] w-12 bg-yellow-400" />
                <span className="uppercase tracking-widest text-sm font-medium text-yellow-400">
                  {currentSlide.subtitle || 'Featured'}
                </span>
              </div>
              <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6 uppercase">
                {currentSlide.title}
              </h1>
              <p className="text-lg text-gray-200 max-w-md mb-8 leading-relaxed">
                {currentSlide.description}
              </p>
              
              {currentSlide.link && (
                <Link 
                  href={currentSlide.link}
                  className="inline-flex items-center gap-3 px-8 py-4 bg-yellow-400 text-black font-bold rounded-full hover:bg-white transition-colors group"
                >
                  Explore Collection
                  <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              )}
            </motion.div>
          </div>

          {/* Right Preview Carousel */}
          <div className="lg:col-span-7 hidden lg:flex gap-6 justify-end items-end h-[50vh]">
            {nextSlides.map((slide, i) => (
              <motion.div
                key={slide.id}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + (i * 0.1), duration: 0.5 }}
                onClick={() => goToSlide(slide.index)}
                className="relative w-48 h-72 rounded-2xl overflow-hidden cursor-pointer group shadow-2xl border border-white/10 hover:border-yellow-400/50 transition-colors"
              >
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors z-10" />
                {slide.imageUrl && (
                  <Image
                    src={slide.imageUrl}
                    alt={slide.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    sizes="192px"
                  />
                )}
                <div className="absolute bottom-0 left-0 w-full p-4 z-20 bg-gradient-to-t from-black/80 to-transparent">
                  <p className="text-xs text-yellow-400 uppercase tracking-wider mb-1">{slide.subtitle}</p>
                  <h3 className="text-white font-bold text-sm uppercase leading-tight">{slide.title}</h3>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Navigation & Progress */}
        <div className="absolute bottom-12 left-8 md:left-16 lg:left-24 right-8 md:right-16 lg:right-24 flex items-center justify-between">
            <div className="flex gap-4">
                <button onClick={prevSlide} className="w-12 h-12 rounded-full border border-white/30 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all">
                    <ArrowLeft size={20} />
                </button>
                <button onClick={nextSlide} className="w-12 h-12 rounded-full border border-white/30 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all">
                    <ArrowRight size={20} />
                </button>
            </div>

            <div className="flex items-center gap-4 text-white font-mono text-xl">
                <span>0{currentIndex + 1}</span>
                <div className="w-32 h-[2px] bg-white/20 relative overflow-hidden">
                    <motion.div 
                        key={currentIndex}
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 6, ease: "linear" }}
                        className="absolute top-0 left-0 h-full bg-yellow-400"
                    />
                </div>
                <span>0{slides.length}</span>
            </div>
        </div>
      </div>
    </div>
  );
}

