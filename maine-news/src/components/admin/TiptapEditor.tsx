'use client';

import { useEditor, EditorContent, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Underline from '@tiptap/extension-underline';
import {
    Bold, Italic, Underline as UnderlineIcon,
    List, ListOrdered, Quote, Heading1, Heading2,
    Link as LinkIcon, Image as ImageIcon,
    Undo, Redo
} from 'lucide-react';

interface TiptapEditorProps {
    content: string;
    onChange: (content: string) => void;
}

const MenuBar = ({ editor }: { editor: Editor | null }) => {
    if (!editor) return null;

    const addImage = () => {
        const url = window.prompt('Enter image URL');
        if (url) {
            editor.chain().focus().setImage({ src: url }).run();
        }
    };

    const setLink = () => {
        const previousUrl = editor.getAttributes('link').href;
        const url = window.prompt('URL', previousUrl);
        if (url === null) return;
        if (url === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run();
            return;
        }
        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    };

    return (
        <div className="flex flex-wrap gap-1 p-2 border-b bg-card sticky top-0 z-10">
            <MenuButton
                onClick={() => editor.chain().focus().toggleBold().run()}
                active={editor.isActive('bold')}
                icon={<Bold size={18} />}
            />
            <MenuButton
                onClick={() => editor.chain().focus().toggleItalic().run()}
                active={editor.isActive('italic')}
                icon={<Italic size={18} />}
            />
            <MenuButton
                onClick={() => editor.chain().focus().toggleUnderline().run()}
                active={editor.isActive('underline')}
                icon={<UnderlineIcon size={18} />}
            />
            <div className="w-px h-6 bg-dim mx-1 self-center" />
            <MenuButton
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                active={editor.isActive('heading', { level: 1 })}
                icon={<Heading1 size={18} />}
            />
            <MenuButton
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                active={editor.isActive('heading', { level: 2 })}
                icon={<Heading2 size={18} />}
            />
            <div className="w-px h-6 bg-dim mx-1 self-center" />
            <MenuButton
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                active={editor.isActive('bulletList')}
                icon={<List size={18} />}
            />
            <MenuButton
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                active={editor.isActive('orderedList')}
                icon={<ListOrdered size={18} />}
            />
            <MenuButton
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                active={editor.isActive('blockquote')}
                icon={<Quote size={18} />}
            />
            <div className="w-px h-6 bg-dim mx-1 self-center" />
            <MenuButton onClick={setLink} active={editor.isActive('link')} icon={<LinkIcon size={18} />} title="Add Link" />
            <MenuButton onClick={addImage} icon={<ImageIcon size={18} />} title="Add Image" />
            <div className="w-px h-6 bg-dim mx-1 self-center" />
            <MenuButton onClick={() => editor.chain().focus().undo().run()} icon={<Undo size={18} />} title="Undo" />
            <MenuButton onClick={() => editor.chain().focus().redo().run()} icon={<Redo size={18} />} title="Redo" />
        </div>
    );
};

const MenuButton = ({ onClick, active, icon, title }: { onClick: () => void, active?: boolean, icon: React.ReactNode, title?: string }) => (
    <button
        type="button"
        onClick={onClick}
        title={title}
        className={`tiptap-menu-btn ${active ? 'active' : ''}`}
    >
        {icon}
    </button>
);

export default function TiptapEditor({ content, onChange }: TiptapEditorProps) {
    const editor = useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit,
            Underline,
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: 'editor-link',
                },
            }),
            Image.configure({
                HTMLAttributes: {
                    class: 'editor-image',
                },
            }),
        ],
        content,
        editorProps: {
            attributes: {
                class: 'prose prose-invert max-w-none focus:outline-none min-h-[600px] p-8 text-lg leading-relaxed',
            },
        },
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
    });

    return (
        <div className="tiptap-editor-container">
            <MenuBar editor={editor} />
            <EditorContent editor={editor} />

            <style jsx global>{`
        .ProseMirror {
          color: #e0e0e0;
          font-family: var(--font-body);
        }
        
        .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #444;
          pointer-events: none;
          height: 0;
        }
        
        .ProseMirror blockquote {
          border-left: 4px solid var(--accent);
          padding: 1.5rem 2rem;
          margin: 2rem 0;
          font-style: italic;
          color: var(--accent);
          background: rgba(191, 155, 48, 0.05);
          border-radius: 0 1rem 1rem 0;
        }

        .ProseMirror h1 { 
          font-family: var(--font-heading);
          font-size: 3rem; 
          font-weight: 700; 
          margin-bottom: 2rem; 
          color: white; 
          text-transform: uppercase;
          line-height: 1.1;
        }
        
        .ProseMirror h2 { 
          font-family: var(--font-heading);
          font-size: 2rem; 
          font-weight: 700; 
          margin-top: 3rem; 
          margin-bottom: 1.5rem; 
          color: white; 
          text-transform: uppercase;
        }

        .ProseMirror p { margin-bottom: 1.5rem; }
        .ProseMirror ul { list-style-type: disc; padding-left: 2rem; margin-bottom: 2rem; }
        .ProseMirror ol { list-style-type: decimal; padding-left: 2rem; margin-bottom: 2rem; }
        
        .editor-link { color: var(--accent); text-decoration: underline; }
        .editor-image { border-radius: 1rem; border: 1px solid var(--border-color); margin: 2rem 0; max-width: 100%; height: auto; }
      `}</style>
        </div>
    );
}
