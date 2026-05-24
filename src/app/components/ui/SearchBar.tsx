"use client";

import { Search } from "lucide-react";
import type { CampusLocation } from "@/data/campusLocations";

interface SearchBarProps {
  locations: CampusLocation[];
  query: string;
  selectedLocation: CampusLocation | null;
  onQueryChange: (query: string) => void;
  onSelectLocation: (location: CampusLocation) => void;
}

export default function SearchBar({
  locations,
  query,
  selectedLocation,
  onQueryChange,
  onSelectLocation,
}: SearchBarProps) {
  const normalizedQuery = normalizeText(query);
  const results = normalizedQuery
    ? locations.filter((location) =>
        normalizeText(`${location.name} ${location.description} ${location.type}`).includes(
          normalizedQuery,
        ),
      )
    : [];

  return (
    <section className="relative z-30 mt-5 px-4 sm:mt-6 sm:px-6">
      <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[var(--up-blue)] px-4 py-3.5 sm:py-4">
        <Search className="text-[var(--up-gray)]/80" size={20} />

        <input
          type="text"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="A donde quieres ir?"
          className="w-full bg-transparent text-sm outline-none placeholder:text-[var(--up-gray-dark)]"
        />
      </div>

      {results.length > 0 && (
        <div className="absolute left-4 right-4 top-full mt-2 max-h-64 overflow-y-auto rounded-2xl border border-white/10 bg-[var(--up-blue)] shadow-2xl sm:left-6 sm:right-6">
          {results.map((location) => (
            <button
              key={location.id}
              type="button"
              onClick={() => onSelectLocation(location)}
              className="flex w-full items-start gap-3 px-4 py-3 text-left transition hover:bg-white/10"
            >
              <span
                className="mt-1 h-3 w-3 shrink-0 rounded-full"
                style={{ backgroundColor: location.color }}
              />
              <span>
                <span className="block text-sm font-semibold text-white">
                  {location.name}
                </span>
                <span className="block text-xs text-[var(--up-gray)]/80">
                  {location.description}
                </span>
              </span>
            </button>
          ))}
        </div>
      )}

      {normalizedQuery && results.length === 0 && (
        <div className="absolute left-4 right-4 top-full mt-2 rounded-2xl border border-white/10 bg-[var(--up-blue)] px-4 py-3 text-sm text-[var(--up-gray)]/80 shadow-2xl sm:left-6 sm:right-6">
          No encontre ese destino.
        </div>
      )}

      {selectedLocation && !query && (
        <p className="mt-2 px-1 text-xs text-[var(--up-gray)]/80">
          Destino seleccionado: {selectedLocation.name}
        </p>
      )}

      {!query && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {locations.map((location) => {
            const isSelected = location.id === selectedLocation?.id;

            return (
              <button
                key={location.id}
                type="button"
                onClick={() => onSelectLocation(location)}
                className={`shrink-0 rounded-full border px-4 py-2 text-xs font-semibold transition ${
                  isSelected
                    ? "border-[var(--up-red)] bg-[var(--up-red)] text-white"
                    : "border-white/15 bg-white/10 text-[var(--up-gray)] hover:bg-white/20"
                }`}
              >
                {location.name}
              </button>
            );
          })}
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

