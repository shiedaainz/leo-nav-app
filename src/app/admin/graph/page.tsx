"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Check, Copy, MapPinned, RotateCcw, Search } from "lucide-react";
import { campusNodes, type CampusNode } from "@/data/campusGraph";

function cloneNodes() {
  return campusNodes.map((node) => ({ ...node }));
}

export default function GraphAdminPage() {
  const [nodes, setNodes] = useState<CampusNode[]>(cloneNodes);
  const [query, setQuery] = useState("");
  const [copied, setCopied] = useState(false);

  const filteredNodes = useMemo(() => {
    const normalizedQuery = normalizeText(query);

    if (!normalizedQuery) {
      return nodes;
    }

    return nodes.filter((node) =>
      normalizeText(`${node.id} ${node.name}`).includes(normalizedQuery),
    );
  }, [nodes, query]);

  const namedNodes = useMemo(
    () => nodes.filter((node) => !isGenericNodeName(node.name)),
    [nodes],
  );

  const changedNodes = useMemo(
    () =>
      nodes.filter((node) => {
        const originalNode = campusNodes.find((candidate) => candidate.id === node.id);
        return originalNode && originalNode.name !== node.name;
      }),
    [nodes],
  );

  const exportCode = useMemo(() => createCampusNodesCode(nodes), [nodes]);

  const updateNodeName = (nodeId: string, name: string) => {
    setNodes((currentNodes) =>
      currentNodes.map((node) =>
        node.id === nodeId
          ? {
              ...node,
              name,
            }
          : node,
      ),
    );
    setCopied(false);
  };

  const resetNodes = () => {
    setNodes(cloneNodes());
    setCopied(false);
  };

  const copyExport = async () => {
    await navigator.clipboard.writeText(exportCode);
    setCopied(true);
  };

  return (
    <main className="min-h-screen bg-[var(--up-blue-dark)] px-4 py-6 text-white sm:px-5 sm:py-8">
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-[var(--up-gray)]/80">Administracion</p>
            <h1 className="text-2xl font-bold sm:text-3xl">Nombres del grafo</h1>
            <p className="mt-2 max-w-2xl text-sm text-[var(--up-gray)]/80">
              Cambia nombres de nodos importantes para que las instrucciones de ruta
              sean mas naturales.
            </p>
          </div>

          <Link
            href="/home"
            className="flex min-h-11 items-center justify-center rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-semibold transition hover:bg-white/20"
          >
            Volver al mapa
          </Link>
        </header>

        <section className="grid gap-4 sm:grid-cols-3">
          <article className="rounded-2xl border border-white/10 bg-[var(--up-blue)]/80 p-5 shadow-2xl">
            <p className="text-sm text-[var(--up-gray)]/80">Nodos totales</p>
            <p className="mt-2 text-3xl font-bold">{nodes.length}</p>
          </article>
          <article className="rounded-2xl border border-white/10 bg-[var(--up-blue)]/80 p-5 shadow-2xl">
            <p className="text-sm text-[var(--up-gray)]/80">Nodos con nombre</p>
            <p className="mt-2 text-3xl font-bold">{namedNodes.length}</p>
          </article>
          <article className="rounded-2xl border border-white/10 bg-[var(--up-blue)]/80 p-5 shadow-2xl">
            <p className="text-sm text-[var(--up-gray)]/80">Cambios sin aplicar</p>
            <p className="mt-2 text-3xl font-bold">{changedNodes.length}</p>
          </article>
        </section>

        <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px]">
          <div className="rounded-2xl border border-white/10 bg-[var(--up-blue)]/90 p-5 shadow-2xl">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-bold">Editar nodos</h2>
                <p className="text-sm text-[var(--up-gray)]/80">
                  Usa nombres claros, por ejemplo Cruce Biblioteca o Acceso Plaza central.
                </p>
              </div>

              <button
                type="button"
                onClick={resetNodes}
                className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold transition hover:bg-white/20"
              >
                <RotateCcw size={18} />
                Reiniciar
              </button>
            </div>

            <div className="mb-4 flex min-h-12 items-center gap-3 rounded-xl border border-white/10 bg-white/10 px-4">
              <Search size={18} className="text-[var(--up-gray)]/80" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar por nodo, acceso, cruce..."
                className="w-full bg-transparent text-sm outline-none placeholder:text-[var(--up-gray-dark)]"
              />
            </div>

            <div className="max-h-[620px] space-y-3 overflow-y-auto pr-1">
              {filteredNodes.map((node) => {
                const hasHumanName = !isGenericNodeName(node.name);

                return (
                  <article
                    key={node.id}
                    className="rounded-xl border border-white/10 bg-white/10 p-4"
                  >
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold">{node.id}</p>
                        <p className="text-xs text-[var(--up-gray)]/70">
                          {node.lat.toFixed(6)}, {node.lng.toFixed(6)}
                        </p>
                      </div>
                      {hasHumanName && (
                        <span className="rounded-full bg-[var(--up-red)] px-3 py-1 text-xs font-semibold">
                          Importante
                        </span>
                      )}
                    </div>

                    <label className="block text-sm text-[var(--up-gray)]">
                      Nombre visible
                      <input
                        value={node.name}
                        onChange={(event) => updateNodeName(node.id, event.target.value)}
                        className="mt-2 w-full rounded-xl border border-white/15 bg-[var(--up-blue-dark)]/60 px-4 py-3 text-white outline-none transition focus:border-[var(--up-red)]"
                      />
                    </label>
                  </article>
                );
              })}
            </div>
          </div>

          <aside className="flex flex-col gap-6">
            <section className="rounded-2xl border border-white/10 bg-[var(--up-blue)]/80 p-5 shadow-2xl">
              <div className="mb-4 flex items-center gap-3">
                <div className="rounded-xl bg-[var(--up-red)] p-3">
                  <MapPinned size={20} />
                </div>
                <div>
                  <h2 className="font-bold">Nodos importantes</h2>
                  <p className="text-sm text-[var(--up-gray)]/80">
                    Estos aparecen mejor en las instrucciones.
                  </p>
                </div>
              </div>

              <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
                {namedNodes.map((node) => (
                  <div
                    key={node.id}
                    className="rounded-xl border border-white/10 bg-white/10 px-3 py-2"
                  >
                    <p className="text-sm font-semibold">{node.name}</p>
                    <p className="text-xs text-[var(--up-gray)]/70">{node.id}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-white/10 bg-[var(--up-blue)]/80 p-5 shadow-2xl">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h2 className="font-bold">Exportar cambios</h2>
                  <p className="text-sm text-[var(--up-gray)]/80">
                    Copia este bloque y reemplaza campusNodes.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => void copyExport()}
                  className="flex min-h-10 items-center justify-center gap-2 rounded-xl bg-[var(--up-red)] px-3 py-2 text-sm font-semibold transition hover:bg-[var(--up-red-dark)]"
                >
                  {copied ? <Check size={17} /> : <Copy size={17} />}
                  {copied ? "Copiado" : "Copiar"}
                </button>
              </div>

              <textarea
                readOnly
                value={exportCode}
                className="h-80 w-full resize-none rounded-xl border border-white/10 bg-[var(--up-blue-dark)]/70 p-3 font-mono text-[11px] text-[var(--up-gray)] outline-none"
              />
            </section>
          </aside>
        </section>
      </section>
    </main>
  );
}

function createCampusNodesCode(nodes: CampusNode[]) {
  const nodeCode = nodes
    .map(
      (node) => `  {
    id: "${node.id}",
    name: "${escapeString(node.name)}",
    lat: ${node.lat.toFixed(6)},
    lng: ${node.lng.toFixed(6)},
  },`,
    )
    .join("\n");

  return `export const campusNodes: CampusNode[] = [
${nodeCode}
];`;
}

function escapeString(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function isGenericNodeName(name: string) {
  return /^Nodo \d+$/i.test(name.trim());
}

function normalizeText(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}
