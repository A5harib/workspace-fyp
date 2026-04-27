"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import dynamic from "next/dynamic";
const Editor = dynamic(() => import("@/components/Editor"), { ssr: false });
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Share2, Terminal } from "lucide-react";
import { useState } from "react";

export default function DocumentPage() {
  const params = useParams();
  const router = useRouter();
  const idStr = params.id as string;
  const documentId = idStr as Id<"documents">;
  
  const document = useQuery(api.documents.getDocument, { id: documentId });
  const updateDocument = useMutation(api.documents.updateDocument);
  const [copied, setCopied] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState("");

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const startEditingTitle = () => {
    if (document) {
      setTitleInput(document.title);
      setIsEditingTitle(true);
    }
  };

  const saveTitle = () => {
    if (titleInput.trim() !== "" && titleInput !== document?.title) {
      updateDocument({ id: documentId, title: titleInput });
    }
    setIsEditingTitle(false);
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') saveTitle();
    if (e.key === 'Escape') setIsEditingTitle(false);
  };

  if (document === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center selection:bg-[#fff] selection:text-[#000]">
        <div className="flex flex-col items-center gap-4">
          <Terminal className="w-8 h-8 text-[#555] animate-pulse" />
          <p className="text-[#888] font-mono text-[11px] uppercase tracking-widest">Compiling stream...</p>
        </div>
      </div>
    );
  }

  if (document === null) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8">
        <div className="border border-[#333] bg-[#0a0a0a] p-12 text-center w-full max-w-md">
          <Terminal className="w-8 h-8 text-[#555] mx-auto mb-6" />
          <h1 className="text-[14px] font-mono text-[#ededed] mb-2">[ ERR: INSTANCE NOT FOUND ]</h1>
          <button 
            onClick={() => router.push("/")}
            className="text-[12px] text-[#888] hover:text-[#ededed] underline mt-6 transition-colors"
          >
            Aboard & Return
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col selection:bg-[#fff] selection:text-[#000]">
      <header className="sticky top-0 z-50 bg-[#000] border-b border-[#333] px-4 md:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.push("/")}
            className="p-1 -ml-1 text-[#888] hover:text-[#ededed] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="h-4 w-px bg-[#333]"></div>
          {isEditingTitle ? (
            <input
              autoFocus
              className="text-[13px] font-mono text-[#ededed] bg-transparent border-b border-[#555] outline-none px-1 w-[200px]"
              value={titleInput}
              onChange={(e) => setTitleInput(e.target.value)}
              onBlur={saveTitle}
              onKeyDown={handleTitleKeyDown}
            />
          ) : (
            <h1 
              className="text-[13px] font-mono text-[#ededed] cursor-text hover:bg-[#111] px-1 rounded transition-colors"
              onClick={startEditingTitle}
              title="Click to edit"
            >
              {document.title}
            </h1>
          )}
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 mr-2">
             <div className="w-2 h-2 bg-[#fff] animate-pulse"></div>
             <span className="text-[10px] font-mono text-[#888] uppercase">Sync Active</span>
          </div>
          <div className="h-4 w-px bg-[#333] hidden md:block"></div>
          <button 
            onClick={handleShare}
            className="flex items-center gap-2 px-3 py-1.5 border border-[#333] text-[#ededed] hover:bg-[#111] text-[11px] font-mono uppercase tracking-wider transition-colors"
          >
            <Share2 className="w-3 h-3" />
            <span className="hidden sm:inline">{copied ? "COPIED." : "SHARE"}</span>
          </button>
        </div>
      </header>

      <main className="flex-1 w-full max-w-[800px] mx-auto p-4 md:p-[40px] mt-[40px]">
        <Editor documentId={document._id} initialContent={document.content} />
      </main>
    </div>
  );
}
