"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SplashPage() {
  const [currentPage, setCurrentPage] = useState(0);
  const router = useRouter();

  const goToHome = () => {
    // Set flag that user has seen onboarding
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
    <div className="fixed inset-0 bg-[#0a1628] overflow-hidden">
      {/* Skip button - always visible */}
      <button
        onClick={goToHome}
        className="absolute top-6 right-6 z-50 text-white/60 text-sm font-medium hover:text-white transition-colors"
      >
        Skip
      </button>

      {/* Swipeable pages container */}
      <div
        className="flex h-full transition-transform duration-500 ease-out"
        style={{ transform: `translateX(-${currentPage * 100}%)` }}
      >
        {/* Page 1 - Main splash */}
        <div className="min-w-full h-full flex flex-col items-center justify-center px-8">
          {/* Subtle glow effect behind image */}
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl" />

          {/* Title */}
          <h1 className="font-serif-elegant text-4xl text-white mb-8 tracking-wide">
            Seeking Beauty
          </h1>

          {/* Madonna del Granduca image */}
          <div className="relative w-64 h-80 mb-10 rounded-lg overflow-hidden shadow-2xl shadow-black/50">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/Raffaello%2C_Madonna_del_Granduca.jpg/800px-Raffaello%2C_Madonna_del_Granduca.jpg"
              alt="Madonna del Granduca by Raphael"
              className="w-full h-full object-cover"
            />
            {/* Subtle vignette */}
            <div className="absolute inset-0 shadow-[inset_0_0_60px_rgba(0,0,0,0.4)]" />
          </div>

          {/* Quote */}
          <p className="font-serif-elegant-italic text-xl text-white/90 text-center leading-relaxed max-w-xs">
            &ldquo;Beauty is the radiance of the good and the splendor of truth&rdquo;
          </p>
        </div>

        {/* Page 2 - Description */}
        <div className="min-w-full h-full flex flex-col items-center justify-center px-8">
          {/* Subtle glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />

          {/* Icon or decorative element */}
          <div className="w-16 h-16 mb-8 rounded-full bg-white/10 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-amber-400/80">
              <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
            </svg>
          </div>

          {/* Title */}
          <h2 className="font-serif-elegant text-3xl text-white mb-6 text-center">
            Your Companion for Contemplation
          </h2>

          {/* Description */}
          <p className="text-white/70 text-center leading-relaxed max-w-sm mb-12 text-lg">
            Seeking Beauty invites you on an unforgettable pilgrimage across Italy—where every landscape, masterpiece, and sacred space becomes a living encounter with the beauty of our Catholic faith.
          </p>

          {/* Begin button */}
          <button
            onClick={goToHome}
            className="px-10 py-4 bg-gradient-to-r from-amber-600 to-amber-500 text-white font-semibold rounded-full shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 transition-all"
          >
            Begin Your Journey
          </button>
        </div>
      </div>

      {/* Page indicators */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-2">
        {[0, 1].map((index) => (
          <button
            key={index}
            onClick={() => setCurrentPage(index)}
            className={`w-2 h-2 rounded-full transition-all ${
              currentPage === index
                ? "bg-white w-6"
                : "bg-white/30 hover:bg-white/50"
            }`}
          />
        ))}
      </div>

      {/* Tap to continue hint (page 1 only) */}
      {currentPage === 0 && (
        <button
          onClick={nextPage}
          className="absolute bottom-24 left-1/2 -translate-x-1/2 text-white/40 text-sm animate-pulse"
        >
          Tap to continue
        </button>
      )}

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
