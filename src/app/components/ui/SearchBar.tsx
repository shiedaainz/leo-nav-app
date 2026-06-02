"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight, Search, Star, X } from "lucide-react";
import type { CampusLocation } from "@/data/campusLocations";

interface SearchBarProps {
  favoriteLocationIds: string[];
  locations: CampusLocation[];
  query: string;
  selectedLocation: CampusLocation | null;
  onQueryChange: (query: string) => void;
  onSelectLocation: (location: CampusLocation) => void;
}

export default function SearchBar({
  favoriteLocationIds,
  locations,
  query,
  selectedLocation,
  onQueryChange,
  onSelectLocation,
}: SearchBarProps) {
  const quickListRef = useRef<HTMLDivElement>(null);
  const normalizedQuery = normalizeText(query);
  const results = normalizedQuery
    ? locations.filter((location) =>
        normalizeText(`${location.name} ${location.description} ${location.type}`).includes(
          normalizedQuery,
        ),
      )
    : [];
  const quickLocations = locations.filter(
    (location) =>
      location.showAsQuickAccess !== false ||
      favoriteLocationIds.includes(location.id) ||
      location.id === selectedLocation?.id,
  );
  const scrollQuickLocations = (direction: "left" | "right") => {
    quickListRef.current?.scrollBy({
      left: direction === "left" ? -220 : 220,
      behavior: "smooth",
    });
  };

  return (
    <section className="relative z-[1100] mt-4 px-4 sm:mt-6 sm:px-6">
      <div className="flex min-h-12 items-center gap-3 rounded-xl border border-white/10 bg-[var(--up-blue)] px-4 py-3 shadow-2xl shadow-black/20 sm:min-h-14 sm:py-4">
        <Search className="text-[var(--up-gray)]/80" size={20} />

        <input
          type="text"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="A donde quieres ir?"
          className="w-full bg-transparent text-sm outline-none placeholder:text-[var(--up-gray-dark)]"
        />

        {query && (
          <button
            type="button"
            onClick={() => onQueryChange("")}
            className="rounded-lg bg-white/10 p-1.5 text-[var(--up-gray)] transition hover:bg-white/20 hover:text-white"
            aria-label="Limpiar busqueda"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {results.length > 0 && (
        <div className="absolute left-4 right-4 top-full mt-2 max-h-64 overflow-y-auto rounded-xl border border-white/10 bg-[var(--up-blue)] shadow-2xl sm:left-6 sm:right-6">
          {results.map((location) => {
            const isFavorite = favoriteLocationIds.includes(location.id);

            return (
              <button
                key={location.id}
                type="button"
                onClick={() => onSelectLocation(location)}
                className="flex w-full items-start gap-3 px-4 py-3 text-left transition hover:bg-white/10 focus:bg-white/10 focus:outline-none"
              >
                <span
                  className="mt-1 h-3 w-3 shrink-0 rounded-full"
                  style={{ backgroundColor: location.color }}
                />
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2 text-sm font-semibold text-white">
                    {isFavorite && (
                      <Star
                        size={14}
                        className="shrink-0 fill-yellow-300 text-yellow-300"
                      />
                    )}
                    {location.name}
                  </span>
                  <span className="block text-xs text-[var(--up-gray)]/80">
                    {location.description}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      )}

      {normalizedQuery && results.length === 0 && (
        <div className="absolute left-4 right-4 top-full mt-2 rounded-xl border border-white/10 bg-[var(--up-blue)] px-4 py-3 text-sm text-[var(--up-gray)]/80 shadow-2xl sm:left-6 sm:right-6">
          No encontre ese destino.
        </div>
      )}

      {selectedLocation && !query && (
        <p className="mt-2 px-1 text-xs text-[var(--up-gray)]/80">
          Destino seleccionado: {selectedLocation.name}
        </p>
      )}

      {!query && (
        <div className="relative mt-3">
          <button
            type="button"
            onClick={() => scrollQuickLocations("left")}
            className="absolute left-0 top-1/2 z-10 hidden h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-[var(--up-blue)]/95 text-white shadow-xl transition hover:bg-[var(--up-blue-dark)] sm:flex"
            aria-label="Ver destinos anteriores"
          >
            <ChevronLeft size={17} />
          </button>

          <div className="pointer-events-none absolute bottom-0 left-0 top-0 z-[1] w-8 bg-gradient-to-r from-[var(--up-blue-dark)] to-transparent" />
          <div className="pointer-events-none absolute bottom-0 right-0 top-0 z-[1] w-8 bg-gradient-to-l from-[var(--up-blue-dark)] to-transparent" />

          <div
            ref={quickListRef}
            className="flex snap-x gap-2 overflow-x-auto px-1 pb-1 sm:px-10 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {quickLocations.map((location) => {
              const isSelected = location.id === selectedLocation?.id;

              return (
                <button
                  key={location.id}
                  type="button"
                  onClick={() => onSelectLocation(location)}
                  className={`shrink-0 snap-start rounded-full border px-4 py-2 text-xs font-semibold transition ${
                    isSelected
                      ? "border-[var(--up-red)] bg-[var(--up-red)] text-white"
                      : "border-white/15 bg-white/10 text-[var(--up-gray)] hover:bg-white/20"
                  }`}
                >
                  {favoriteLocationIds.includes(location.id) && (
                    <Star
                      size={12}
                      className="mr-1 inline fill-yellow-300 text-yellow-300"
                    />
                  )}
                  {location.name}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => scrollQuickLocations("right")}
            className="absolute right-0 top-1/2 z-10 hidden h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-[var(--up-blue)]/95 text-white shadow-xl transition hover:bg-[var(--up-blue-dark)] sm:flex"
            aria-label="Ver mas destinos"
          >
            <ChevronRight size={17} />
          </button>
        </div>
      )}
    </section>
  );
}

function normalizeText(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

