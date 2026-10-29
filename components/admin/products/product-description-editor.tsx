"use client";

import { useEffect, useRef } from "react";
import {
  Bold,
  Heading2,
  Italic,
  Link2,
  List,
  ListOrdered,
  RemoveFormatting,
  Underline,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { descriptionToEditorHtml } from "@/lib/utils/product-description";

type ProductDescriptionEditorProps = {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
};

const toolbarButtonClass =
  "h-8 w-8 p-0 text-slate-700 hover:bg-slate-100";

export default function ProductDescriptionEditor({
  value,
  onChange,
  disabled = false,
}: ProductDescriptionEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;

    const nextHtml = descriptionToEditorHtml(value);
    if (editor.innerHTML !== nextHtml) {
      editor.innerHTML = nextHtml;
    }
  }, [value]);

  function runCommand(command: string, commandValue?: string) {
    if (disabled || !editorRef.current) return;
    editorRef.current.focus();
    document.execCommand(command, false, commandValue);
    onChange(editorRef.current.innerHTML);
  }

  function addLink() {
    if (disabled || !editorRef.current) return;
    const url = window.prompt("Enter the link URL (https://...)");
    if (!url) return;

    try {
      const parsed = new URL(url);
      if (!["https:", "http:", "mailto:"].includes(parsed.protocol)) {
        window.alert("Please enter a valid http, https, or email link.");
        return;
      }
    } catch {
      window.alert("Please enter a valid link URL.");
      return;
    }

    runCommand("createLink", url);
  }

  return (
    <div className="overflow-hidden rounded-lg border border-slate-300 bg-white focus-within:border-[#c9a227] focus-within:ring-2 focus-within:ring-[#c9a227]/20">
      <div
        aria-label="Product description formatting"
        className="flex flex-wrap items-center gap-1 border-b bg-slate-50 p-2"
      >
        <Button type="button" variant="ghost" size="sm" className={toolbarButtonClass} disabled={disabled} aria-label="Bold" title="Bold" onClick={() => runCommand("bold")}>
          <Bold className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" className={toolbarButtonClass} disabled={disabled} aria-label="Italic" title="Italic" onClick={() => runCommand("italic")}>
          <Italic className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" className={toolbarButtonClass} disabled={disabled} aria-label="Underline" title="Underline" onClick={() => runCommand("underline")}>
          <Underline className="h-4 w-4" />
        </Button>
        <span className="mx-1 h-5 w-px bg-slate-200" aria-hidden="true" />
        <Button type="button" variant="ghost" size="sm" className={toolbarButtonClass} disabled={disabled} aria-label="Heading" title="Heading" onClick={() => runCommand("formatBlock", "h3")}>
          <Heading2 className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" className={toolbarButtonClass} disabled={disabled} aria-label="Bulleted list" title="Bulleted list" onClick={() => runCommand("insertUnorderedList")}>
          <List className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" className={toolbarButtonClass} disabled={disabled} aria-label="Numbered list" title="Numbered list" onClick={() => runCommand("insertOrderedList")}>
          <ListOrdered className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" className={toolbarButtonClass} disabled={disabled} aria-label="Add link" title="Add link" onClick={addLink}>
          <Link2 className="h-4 w-4" />
        </Button>
        <span className="mx-1 h-5 w-px bg-slate-200" aria-hidden="true" />
        <Button type="button" variant="ghost" size="sm" className={toolbarButtonClass} disabled={disabled} aria-label="Clear formatting" title="Clear formatting" onClick={() => runCommand("removeFormat")}>
          <RemoveFormatting className="h-4 w-4" />
        </Button>
      </div>

      <div
        ref={editorRef}
        contentEditable={!disabled}
        suppressContentEditableWarning
        role="textbox"
        aria-label="Full product description"
        aria-multiline="true"
        data-placeholder="Write the full product description. Add paragraphs, bullet points, features, materials, size details, care instructions, and other information..."
        onInput={(event) => onChange(event.currentTarget.innerHTML)}
        onBlur={(event) => onChange(event.currentTarget.innerHTML)}
        className="product-description-editor min-h-52 max-h-[420px] overflow-y-auto px-3 py-3 text-sm leading-6 text-slate-800 outline-none"
      />

      <div className="border-t bg-slate-50 px-3 py-2 text-xs text-slate-500">
        Format text, create bullet or numbered lists, add headings and links. The full description appears on the product detail page.
      </div>

      <style jsx>{`
        .product-description-editor:empty::before {
          content: attr(data-placeholder);
          color: #94a3b8;
          pointer-events: none;
        }
        .product-description-editor :global(p) {
          margin: 0.4rem 0;
        }
        .product-description-editor :global(h3) {
          margin: 0.75rem 0 0.35rem;
          font-weight: 700;
          font-size: 1rem;
        }
        .product-description-editor :global(ul) {
          list-style: disc;
          padding-left: 1.5rem;
          margin: 0.5rem 0;
        }
        .product-description-editor :global(ol) {
          list-style: decimal;
          padding-left: 1.5rem;
          margin: 0.5rem 0;
        }
        .product-description-editor :global(li) {
          margin: 0.2rem 0;
        }
        .product-description-editor :global(a) {
          color: #1d4ed8;
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
}
