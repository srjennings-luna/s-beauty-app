"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SplashPage() {
  const [currentPage, setCurrentPage] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const router = useRouter();

  // Fade in on mount
  useEffect(() => {
    setIsVisible(true);
  }, []);

  const goToHome = () => {
    localStorage.setItem("seeking-beauty-onboarded", "true");
    router.push("/");
  };

  const nextPage = () => {
    if (currentPage === 0) {
      setCurrentPage(1);
    } else {
      goToHome();
    }
  };

  return (
    <div className={`fixed inset-0 overflow-hidden transition-opacity duration-700 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      {/* Skip button - always visible */}
      <button
        onClick={goToHome}
        className="absolute top-6 right-6 z-50 text-white/50 text-sm tracking-wide hover:text-white transition-colors duration-200"
      >
        Skip
      </button>

      {/* Swipeable pages container */}
      <div
        className="flex h-full transition-transform duration-500 ease-out"
        style={{ transform: `translateX(-${currentPage * 100}%)` }}
      >
        {/* Page 1 - Promo image top 2/3, #203545 bottom 1/3 */}
        <div className="min-w-full h-full flex flex-col">
          {/* Top 2/3 - Full bleed promo image */}
          <div className="h-[66vh] relative">
            <img
              src="/images/promo-splash.jpeg"
              alt="Seeking Beauty with David Henrie"
              className="w-full h-full object-cover"
            />
            {/* Gradient fade to bottom color */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#203545] to-transparent" />
          </div>

          {/* Bottom 1/3 - Deep teal with quote */}
          <div className="flex-1 bg-[#203545] flex flex-col items-center justify-center px-8">
            <p className={`text-white/70 text-lg text-center leading-relaxed max-w-xs italic transition-all duration-700 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              &ldquo;Beauty will save the world&rdquo;
            </p>
            <p className={`text-white/40 text-sm mt-3 transition-all duration-700 delay-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
              — Fyodor Dostoevsky
            </p>
          </div>
        </div>

        {/* Page 2 - Purple to blue gradient */}
        <div
          className="min-w-full h-full flex flex-col items-center justify-center px-8"
          style={{
            background: "linear-gradient(135deg, #4C3759 0%, #203545 100%)"
          }}
        >
          {/* Icon */}
          <div className={`w-16 h-16 mb-8 rounded-full bg-white/5 flex items-center justify-center border border-white/10 transition-all duration-500 ${currentPage === 1 ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-white/60">
              <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
            </svg>
          </div>

          {/* Title */}
          <h2 className={`text-white/90 text-2xl mb-6 text-center font-light tracking-wide transition-all duration-500 delay-100 ${currentPage === 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            Your Companion for Contemplation
          </h2>

          {/* Description */}
          <p className={`text-white/50 text-center leading-relaxed max-w-sm mb-12 transition-all duration-500 delay-200 ${currentPage === 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            Seeking Beauty invites you on an unforgettable pilgrimage across Italy—where every landscape, masterpiece, and sacred space becomes a living encounter with the beauty of our Catholic faith.
          </p>

          {/* Begin button - prominent with animated glow */}
          <button
            onClick={goToHome}
            className={`px-10 py-4 bg-[#C19B5F] text-white text-base font-semibold tracking-wider rounded-sm
              active:scale-95
              transition-all duration-300
              shadow-[0_0_25px_rgba(193,155,95,0.5)]
              animate-pulse-subtle
              ${currentPage === 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
          >
            Let's explore
          </button>
        </div>
      </div>

      {/* Page indicators */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {[0, 1].map((index) => (
          <button
            key={index}
            onClick={() => setCurrentPage(index)}
            className={`h-2 rounded-full transition-all duration-300 ${
              currentPage === index
                ? "bg-white/80 w-6"
                : "bg-white/30 hover:bg-white/50 w-2"
            }`}
          />
        ))}
      </div>

      {/* Touch swipe area */}
      <div
        className="absolute inset-0 z-10"
        onClick={nextPage}
        onTouchStart={(e) => {
          const touch = e.touches[0];
          (e.currentTarget as HTMLElement).dataset.startX = touch.clientX.toString();
        }}
        onTouchEnd={(e) => {
          const startX = parseFloat((e.currentTarget as HTMLElement).dataset.startX || "0");
          const endX = e.changedTouches[0].clientX;
          const diff = startX - endX;

          if (diff > 50 && currentPage === 0) {
            setCurrentPage(1);
          } else if (diff < -50 && currentPage === 1) {
            setCurrentPage(0);
          }
        }}
      />
    </div>
  );
}
