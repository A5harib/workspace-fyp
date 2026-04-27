"use client";

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Collaboration from '@tiptap/extension-collaboration';
import { CollaborationCaret } from '@tiptap/extension-collaboration-caret';
import * as Y from 'yjs';
import { WebrtcProvider } from 'y-webrtc';
import { useEffect, useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import randomColor from 'randomcolor';
import { Id } from '@/convex/_generated/dataModel';
import { Bold, Italic, Heading1, Heading2, List } from 'lucide-react';

interface EditorProps {
  documentId: Id<"documents">;
  initialContent: string;
}

export default function Editor({ documentId, initialContent }: EditorProps) {
  const [ySetup, setYSetup] = useState<{ ydoc: Y.Doc; provider: WebrtcProvider } | null>(null);

  useEffect(() => {
    const ydoc = new Y.Doc();
    const provider = new WebrtcProvider(`workspace-doc-${documentId}`, ydoc, {
      signaling: ['wss://signaling.yjs.dev', 'wss://y-webrtc-signaling-eu.herokuapp.com']
    });
    
    setYSetup({ ydoc, provider });

    return () => {
      provider.disconnect();
      provider.destroy();
      ydoc.destroy();
    };
  }, [documentId]);

  if (!ySetup) {
    return <div className="text-[#555] font-mono text-[11px] uppercase tracking-widest min-h-[500px]">Connecting to mesh...</div>;
  }

  return <TiptapEditor documentId={documentId} initialContent={initialContent} ydoc={ySetup.ydoc} provider={ySetup.provider} />;
}

function TiptapEditor({ documentId, initialContent, ydoc, provider }: EditorProps & { ydoc: Y.Doc, provider: WebrtcProvider }) {
  const updateContent = useMutation(api.documents.updateDocument);
  const [status, setStatus] = useState("Connecting...");

  useEffect(() => {
    // Generate distinct greys/whites for developer cursors, no neon colors!
    const colors = ["#ffffff", "#cccccc", "#999999", "#aaaaaa", "#dddddd"];
    const cursorColor = colors[Math.floor(Math.random() * colors.length)];
    const username = `U-${Math.floor(Math.random() * 9999).toString().padStart(4, '0')}`;
    
    provider.awareness.setLocalStateField('user', {
      name: username,
      color: cursorColor,
    });

    const handleSynced = (state: { synced: boolean }) => {
      setStatus(state.synced ? 'SYNCED' : 'AWAIT_SYNC');
    };

    provider.on('synced', handleSynced);
    
    // We rely on the event listener above to set the status


    return () => {
      provider.off('synced', handleSynced);
    };
  }, [provider]);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        // history is no longer part of StarterKit in v3
      }),
      Collaboration.configure({
        document: ydoc,
      }),
      CollaborationCaret.configure({
        provider: provider,
        user: {
          name: 'Anonymous',
          color: randomColor(),
        },
      }),
    ],
    editorProps: {
      attributes: {
        class: 'prose prose-invert max-w-none focus:outline-none min-h-[500px] py-[24px]',
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      // Debounce saving to convex
      const timeoutId = setTimeout(() => {
        updateContent({ id: documentId, content: html }).catch(console.error);
      }, 1000);
      return () => clearTimeout(timeoutId);
    },
  });

  useEffect(() => {
    if (editor && initialContent && editor.getText() === "") {
      editor.commands.setContent(initialContent);
    }
  }, [editor, initialContent]);

  if (!editor) {
    return <div className="text-[#555] font-mono text-[11px] uppercase tracking-widest min-h-[500px]">Initialising Editor...</div>;
  }

  return (
    <div className="flex flex-col w-full">
      <div className="flex items-center justify-between border-b border-[#333] pb-4 mb-4">
        
        {/* Editor Toolbar */}
        <div className="flex items-center gap-2">
          <button 
            onClick={() => editor.chain().focus().toggleBold().run()} 
            className={`w-8 h-8 flex items-center justify-center border transition-colors ${editor.isActive('bold') ? 'bg-[#ededed] border-[#ededed] text-[#000]' : 'border-transparent text-[#888] hover:border-[#333] hover:text-[#ededed]'}`}
          >
            <Bold className="w-4 h-4" />
          </button>
          <button 
            onClick={() => editor.chain().focus().toggleItalic().run()} 
            className={`w-8 h-8 flex items-center justify-center border transition-colors ${editor.isActive('italic') ? 'bg-[#ededed] border-[#ededed] text-[#000]' : 'border-transparent text-[#888] hover:border-[#333] hover:text-[#ededed]'}`}
          >
            <Italic className="w-4 h-4" />
          </button>
          <div className="w-px h-4 bg-[#333] mx-1"></div>
          <button 
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} 
            className={`w-8 h-8 flex items-center justify-center border transition-colors ${editor.isActive('heading', { level: 1 }) ? 'bg-[#ededed] border-[#ededed] text-[#000]' : 'border-transparent text-[#888] hover:border-[#333] hover:text-[#ededed]'}`}
          >
            <Heading1 className="w-4 h-4" />
          </button>
          <button 
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} 
            className={`w-8 h-8 flex items-center justify-center border transition-colors ${editor.isActive('heading', { level: 2 }) ? 'bg-[#ededed] border-[#ededed] text-[#000]' : 'border-transparent text-[#888] hover:border-[#333] hover:text-[#ededed]'}`}
          >
            <Heading2 className="w-4 h-4" />
          </button>
          <div className="w-px h-4 bg-[#333] mx-1"></div>
          <button 
            onClick={() => editor.chain().focus().toggleBulletList().run()} 
            className={`w-8 h-8 flex items-center justify-center border transition-colors ${editor.isActive('bulletList') ? 'bg-[#ededed] border-[#ededed] text-[#000]' : 'border-transparent text-[#888] hover:border-[#333] hover:text-[#ededed]'}`}
          >
             <List className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-[#555] uppercase tracking-wider">{status}</span>
        </div>

      </div>
      <EditorContent editor={editor} className="bg-transparent" />
    </div>
  );
}
