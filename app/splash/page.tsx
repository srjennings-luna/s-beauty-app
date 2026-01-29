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
        {/* Page 1 - Deep blue/navy theme */}
        <div className="min-w-full h-full flex flex-col items-center justify-center px-8 bg-[#1a1f3c]">
          {/* Subtle glow effect */}
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl" />

          {/* Title - Script + Sans-serif style matching the show logo */}
          <div className={`mb-8 text-center transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <p className="text-white text-5xl" style={{ fontFamily: "Brush Script MT, Segoe Script, cursive", fontWeight: 400 }}>
              seeking
            </p>
            <p className="text-white text-2xl font-light tracking-[0.35em] uppercase -mt-1">
              BEAUTY
            </p>
          </div>

          {/* Madonna del Granduca image - no rounded corners */}
          <div className={`relative w-64 h-80 mb-10 overflow-hidden shadow-2xl shadow-black/50 transition-all duration-700 delay-400 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/Raffaello%2C_Madonna_del_Granduca.jpg/800px-Raffaello%2C_Madonna_del_Granduca.jpg"
              alt="Madonna del Granduca by Raphael"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 shadow-[inset_0_0_60px_rgba(0,0,0,0.3)]" />
          </div>

          {/* Quote */}
          <p className={`text-white/70 text-lg text-center leading-relaxed max-w-xs italic transition-all duration-700 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            &ldquo;Beauty is the radiance of the good and the splendor of truth&rdquo;
          </p>
        </div>

        {/* Page 2 - Earthy/warm purple theme */}
        <div className="min-w-full h-full flex flex-col items-center justify-center px-8 bg-[#2d2438]">
          {/* Subtle warm glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl" />

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

          {/* Begin button - style from earthy inspiration */}
          <button
            onClick={goToHome}
            className={`px-8 py-3 bg-white/10 text-white/90 text-sm tracking-wider border border-white/20 hover:bg-white/20 transition-all duration-300 ${currentPage === 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
          >
            See details
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
