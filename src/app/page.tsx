"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { Plus, FileText, ArrowRight, Terminal } from "lucide-react";

export default function Home() {
  const documents = useQuery(api.documents.getDocuments) || [];
  const createDocument = useMutation(api.documents.createDocument);
  const router = useRouter();

  const handleCreate = async () => {
    const title = "Untitled Document";
    const id = await createDocument({ title });
    router.push(`/document/${id}`);
  };

  return (
    <main className="min-h-screen p-8 md:p-24 selection:bg-[#fff] selection:text-[#000]">
      <div className="max-w-5xl mx-auto">
        <header className="mb-20 flex flex-col items-start border-b border-[#333] pb-10">
          <div className="flex items-center gap-3 mb-6">
            <Terminal className="w-6 h-6 text-[#ededed]" />
            <span className="font-mono text-xs text-[#888] uppercase tracking-widest">System / Workspace</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-medium tracking-[0.02em] text-[#ededed] mb-4">
            Engine.
          </h1>
          <p className="text-[#888] text-[15px] max-w-2xl font-light">
            High-performance, purely functional collaborative text environment. No distractions.
          </p>
        </header>

        <div className="flex justify-between items-end mb-8 border-b border-[#333] pb-4">
          <h2 className="text-sm font-mono text-[#888] uppercase tracking-widest">Active Instances</h2>
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 px-4 py-2 bg-[#ededed] text-[#000] text-[13px] font-medium hover:bg-[#fff] transition-colors"
          >
            <Plus className="w-4 h-4" />
            Initialize
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0 border border-[#333] bg-[#000]">
          {documents.map((doc) => (
            <div
              key={doc._id}
              onClick={() => router.push(`/document/${doc._id}`)}
              className="group cursor-pointer p-6 border-b border-r border-[#333] hover:bg-[#0a0a0a] transition-colors flex flex-col justify-between min-h-[160px]"
            >
              <div>
                <div className="flex justify-between items-start mb-4">
                  <FileText className="w-5 h-5 text-[#555] group-hover:text-[#ededed] transition-colors" />
                  <ArrowRight className="w-4 h-4 text-transparent group-hover:text-[#888] transition-colors" />
                </div>
                <h3 className="text-[15px] font-medium text-[#ededed] line-clamp-1 mb-1">
                  {doc.title}
                </h3>
                <p className="text-[13px] font-mono text-[#555]">
                  ID: {doc._id.slice(0, 8)}...
                </p>
              </div>
              <p className="text-[11px] font-mono text-[#555] uppercase mt-4">
                UPD: {new Date(doc.updatedAt).toLocaleDateString(undefined, { month: 'short', day: '2-digit', year: 'numeric' })}
              </p>
            </div>
          ))}
          {documents.length === 0 && (
            <div className="col-span-1 md:col-span-2 lg:col-span-3 p-12 text-center text-[#555] font-mono text-sm">
              [ NO INSTANCES FOUND ]
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
