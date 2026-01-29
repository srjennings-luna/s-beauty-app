"use client";

import { Reflection } from "@/lib/types";
import FavoriteButton from "./ui/FavoriteButton";

interface ReflectionCardProps {
  reflection: Reflection;
  showFavorite?: boolean;
}

export default function ReflectionCard({
  reflection,
  showFavorite = true,
}: ReflectionCardProps) {
  const useLabels = {
    family: "Family Discussion",
    individual: "Personal Reflection",
    group: "Group Study",
  };

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-accent-gold">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {reflection.suggestedUse && (
            <span
              className="inline-block text-xs text-accent-gold font-semibold mb-2 uppercase tracking-wide"
              style={{ fontFamily: "Montserrat, sans-serif" }}
            >
              {useLabels[reflection.suggestedUse]}
            </span>
          )}
          <p className="text-gray-800 leading-relaxed">{reflection.question}</p>
        </div>
        {showFavorite && (
          <FavoriteButton
            itemId={reflection.id}
            type="reflection"
            size="sm"
            className="ml-3 flex-shrink-0"
          />
        )}
      </div>
    </div>
  );
}

// Simple version for artwork detail view
export function ReflectionQuestion({ question }: { question: string }) {
  return (
    <div className="flex items-start py-3 border-b border-gray-100 last:border-0">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
        className="w-5 h-5 text-accent-gold flex-shrink-0 mt-0.5 mr-3"
      >
        <path
          fillRule="evenodd"
          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z"
          clipRule="evenodd"
        />
      </svg>
      <p className="text-gray-700">{question}</p>
    </div>
  );
}
