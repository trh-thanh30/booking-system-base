"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  mergeAttributes,
  Node,
  type Editor,
  type JSONContent,
} from "@tiptap/core";
import CharacterCount from "@tiptap/extension-character-count";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  ChevronDown,
  Code,
  FileUp,
  ImageIcon,
  Italic,
  Link2,
  List,
  ListOrdered,
  LoaderCircle,
  Quote,
  Redo2,
  RemoveFormatting,
  Strikethrough,
  Type,
  UnderlineIcon,
  Undo2,
  Unlink,
  VideoIcon,
} from "lucide-react";
import { Button } from "./button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./dropdown-menu";
import { Input } from "./input";
import { cn } from "./lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./tooltip";

export type RichTextAssetKind = "document" | "image" | "video";

export type RichTextUploadedAsset = {
  id?: string;
  kind: RichTextAssetKind;
  mimeType?: string;
  name: string;
  url: string;
};

export type RichTextUploadContext = {
  kind: RichTextAssetKind;
  onProgress: (progress: number) => void;
};

export type RichTextEditorLabels = {
  alignCenter: string;
  alignLeft: string;
  alignRight: string;
  blockquote: string;
  bold: string;
  bulletList: string;
  clearFormatting: string;
  codeBlock: string;
  document: string;
  editor: string;
  heading2: string;
  heading3: string;
  image: string;
  invalidLink: string;
  italic: string;
  link: string;
  linkPlaceholder: string;
  orderedList: string;
  paragraph: string;
  redo: string;
  strike: string;
  unlink: string;
  underline: string;
  undo: string;
  uploadFailed: string;
  uploading: string;
  video: string;
};

export type RichTextEditorProps = {
  "aria-describedby"?: string;
  "aria-invalid"?: boolean;
  "aria-label"?: string;
  "aria-required"?: boolean;
  ariaDescribedBy?: string;
  ariaLabel?: string;
  className?: string;
  contentClassName?: string;
  disabled?: boolean;
  id?: string;
  invalid?: boolean;
  labels?: Partial<RichTextEditorLabels>;
  maxLength?: number;
  onAssetsUploaded?: (assets: RichTextUploadedAsset[]) => void;
  onBlur?: () => void;
  onChange: (html: string) => void;
  onUpload?: (
    file: File,
    context: RichTextUploadContext,
  ) => Promise<
    Omit<RichTextUploadedAsset, "kind"> & { kind?: RichTextAssetKind }
  >;
  onUploadError?: (error: unknown, file: File) => void;
  placeholder?: string;
  value: string;
};

const DEFAULT_LABELS: RichTextEditorLabels = {
  alignCenter: "Align center",
  alignLeft: "Align left",
  alignRight: "Align right",
  blockquote: "Quote",
  bold: "Bold",
  bulletList: "Bullet list",
  clearFormatting: "Clear formatting",
  codeBlock: "Code block",
  document: "Upload document",
  editor: "Rich text editor",
  heading2: "Heading 2",
  heading3: "Heading 3",
  image: "Upload image",
  invalidLink: "Enter a valid web, email, phone, anchor, or relative URL.",
  italic: "Italic",
  link: "Add or edit link",
  linkPlaceholder: "https://example.com",
  orderedList: "Numbered list",
  paragraph: "Paragraph",
  redo: "Redo",
  strike: "Strikethrough",
  underline: "Underline",
  undo: "Undo",
  unlink: "Remove link",
  uploadFailed: "Could not upload {name}. Try again.",
  uploading: "Uploading {name}",
  video: "Upload video",
};

const ACCEPTED_FILES: Record<RichTextAssetKind, string> = {
  document:
    ".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  image: "image/*",
  video: "video/*",
};

const Video = Node.create({
  name: "video",
  group: "block",
  atom: true,

  addAttributes() {
    return {
      controls: { default: true },
      src: { default: null },
    };
  },

  parseHTML() {
    return [{ tag: "video[src]" }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "video",
      mergeAttributes({ controls: true, preload: "metadata" }, HTMLAttributes),
    ];
  },
});

type UploadState = {
  fileName: string;
  progress: number;
} | null;

type SelectionRange = {
  from: number;
  to: number;
};

function formatLabel(template: string, name: string) {
  return template.replace("{name}", name);
}

function normalizeLinkUrl(value: string): string | null {
  const url = value.trim();
  if (!url) return "";
  if (/^(?:https?:|mailto:|tel:)/i.test(url)) return url;
  if (/^(?:\/|#|\.\/|\.\.\/)/.test(url)) return url;
  if (/^[a-z][a-z\d+.-]*:/i.test(url)) return null;
  return `https://${url}`;
}

function restoreSelection(editor: Editor, selection: SelectionRange | null) {
  if (!selection) return editor.chain().focus();
  const docSize = editor.state.doc.content.size;
  return editor
    .chain()
    .focus()
    .setTextSelection({
      from: Math.min(selection.from, docSize),
      to: Math.min(selection.to, docSize),
    });
}

function createAssetContent(asset: RichTextUploadedAsset): JSONContent[] {
  if (asset.kind === "image") {
    return [
      {
        attrs: { alt: asset.name, src: asset.url, title: asset.name },
        type: "image",
      },
      { type: "paragraph" },
    ];
  }

  if (asset.kind === "video") {
    return [
      { attrs: { src: asset.url }, type: "video" },
      { type: "paragraph" },
    ];
  }

  return [
    {
      content: [
        {
          marks: [
            {
              attrs: {
                href: asset.url,
                rel: "noopener noreferrer",
                target: "_blank",
              },
              type: "link",
            },
          ],
          text: asset.name,
          type: "text",
        },
      ],
      type: "paragraph",
    },
  ];
}

export function RichTextEditor({
  "aria-describedby": ariaDescribedByProp,
  "aria-invalid": ariaInvalidProp,
  "aria-label": ariaLabelProp,
  "aria-required": ariaRequired,
  ariaDescribedBy,
  ariaLabel,
  className,
  contentClassName,
  disabled = false,
  id,
  invalid = false,
  labels: labelsProp,
  maxLength,
  onAssetsUploaded,
  onBlur,
  onChange,
  onUpload,
  onUploadError,
  placeholder = "",
  value,
}: RichTextEditorProps) {
  const labels = useMemo(
    () => ({ ...DEFAULT_LABELS, ...labelsProp }),
    [labelsProp],
  );
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const videoInputRef = useRef<HTMLInputElement | null>(null);
  const documentInputRef = useRef<HTMLInputElement | null>(null);
  const uploadSelectionRef = useRef<SelectionRange | null>(null);
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkValue, setLinkValue] = useState("");
  const [linkError, setLinkError] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [uploadState, setUploadState] = useState<UploadState>(null);
  const isUploading = uploadState !== null;
  const resolvedAriaDescribedBy = ariaDescribedByProp ?? ariaDescribedBy;
  const resolvedAriaLabel = ariaLabelProp ?? ariaLabel ?? labels.editor;
  const resolvedInvalid = ariaInvalidProp ?? invalid;

  const editor = useEditor({
    content: value,
    editable: !disabled,
    editorProps: {
      attributes: {
        ...(resolvedAriaDescribedBy
          ? { "aria-describedby": resolvedAriaDescribedBy }
          : {}),
        "aria-invalid": String(resolvedInvalid),
        "aria-label": resolvedAriaLabel,
        "aria-multiline": "true",
        ...(ariaRequired ? { "aria-required": "true" } : {}),
        ...(id ? { id } : {}),
        class: cn(
          "min-h-48 px-4 py-3 text-sm leading-7 text-foreground outline-none",
          "[&_a]:cursor-pointer [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2",
          "[&_blockquote]:my-3 [&_blockquote]:border-l-4 [&_blockquote]:border-border [&_blockquote]:pl-4 [&_blockquote]:text-muted-foreground",
          "[&_code]:rounded-sm [&_code]:bg-muted [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.875em]",
          "[&_h2]:mb-2 [&_h2]:mt-4 [&_h2]:text-xl [&_h2]:font-semibold",
          "[&_h3]:mb-2 [&_h3]:mt-3 [&_h3]:text-lg [&_h3]:font-semibold",
          "[&_img]:my-4 [&_img]:h-auto [&_img]:max-w-full [&_img]:rounded-md [&_img]:border [&_img]:border-border",
          "[&_ol]:my-3 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:my-2",
          "[&_pre]:my-4 [&_pre]:overflow-x-auto [&_pre]:rounded-md [&_pre]:bg-muted [&_pre]:p-4",
          "[&_pre_code]:bg-transparent [&_pre_code]:p-0",
          "[&_ul]:my-3 [&_ul]:list-disc [&_ul]:pl-6",
          "[&_video]:my-4 [&_video]:aspect-video [&_video]:w-full [&_video]:rounded-md [&_video]:bg-muted",
        ),
        role: "textbox",
      },
    },
    extensions: [
      StarterKit.configure({ link: false, underline: false }),
      Underline,
      Link.configure({
        HTMLAttributes: {
          rel: "noopener noreferrer",
          target: "_blank",
        },
        defaultProtocol: "https",
        openOnClick: false,
      }),
      Image.configure({ allowBase64: false }),
      Video,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Placeholder.configure({
        emptyEditorClass: "is-editor-empty",
        placeholder,
      }),
      CharacterCount.configure(maxLength ? { limit: maxLength } : {}),
    ],
    immediatelyRender: false,
    onBlur: () => onBlur?.(),
    onUpdate: ({ editor: currentEditor }) => onChange(currentEditor.getHTML()),
  });

  useEffect(() => {
    if (!editor || editor.getHTML() === value) return;
    editor.commands.setContent(value, { emitUpdate: false });
  }, [editor, value]);

  useEffect(() => {
    editor?.setEditable(!disabled && !isUploading);
  }, [disabled, editor, isUploading]);

  useEffect(() => {
    if (!editor) return;

    const element = editor.view.dom;
    element.setAttribute("aria-invalid", String(resolvedInvalid));
    element.setAttribute("aria-label", resolvedAriaLabel);

    if (resolvedAriaDescribedBy) {
      element.setAttribute("aria-describedby", resolvedAriaDescribedBy);
    } else {
      element.removeAttribute("aria-describedby");
    }

    if (ariaRequired) {
      element.setAttribute("aria-required", "true");
    } else {
      element.removeAttribute("aria-required");
    }
  }, [
    ariaRequired,
    editor,
    resolvedAriaDescribedBy,
    resolvedAriaLabel,
    resolvedInvalid,
  ]);

  const rememberSelection = useCallback(() => {
    if (!editor) return;
    const { from, to } = editor.state.selection;
    uploadSelectionRef.current = { from, to };
  }, [editor]);

  const uploadFiles = useCallback(
    async (kind: RichTextAssetKind, files: File[]) => {
      if (!editor || !onUpload || !files.length) return;

      const uploaded: RichTextUploadedAsset[] = [];
      let currentFile: File | undefined;
      setUploadError("");

      try {
        for (const file of files) {
          currentFile = file;
          setUploadState({ fileName: file.name, progress: 0 });
          const asset = await onUpload(file, {
            kind,
            onProgress: (progress) =>
              setUploadState({
                fileName: file.name,
                progress: Math.min(100, Math.max(0, Math.round(progress))),
              }),
          });
          uploaded.push({ ...asset, kind: asset.kind ?? kind });
        }
      } catch (error) {
        const failedFile = currentFile ?? files[0];
        setUploadError(
          formatLabel(labels.uploadFailed, failedFile?.name ?? "file"),
        );
        if (failedFile) onUploadError?.(error, failedFile);
      } finally {
        if (uploaded.length) {
          const content = uploaded.flatMap(createAssetContent);
          restoreSelection(editor, uploadSelectionRef.current)
            .insertContent(content)
            .run();
        }
        uploadSelectionRef.current = null;
        setUploadState(null);
        if (uploaded.length) onAssetsUploaded?.(uploaded);
      }
    },
    [editor, labels.uploadFailed, onAssetsUploaded, onUpload, onUploadError],
  );

  const applyLink = useCallback(() => {
    if (!editor) return;
    const href = normalizeLinkUrl(linkValue);
    if (href === null) {
      setLinkError(labels.invalidLink);
      return;
    }
    if (!href) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
    } else {
      editor.chain().focus().extendMarkRange("link").setLink({ href }).run();
    }
    setLinkError("");
    setLinkOpen(false);
  }, [editor, labels.invalidLink, linkValue]);

  if (!editor) {
    return (
      <div
        aria-hidden="true"
        className={cn(
          "min-h-48 animate-pulse rounded-md border border-border bg-muted",
          className,
        )}
      />
    );
  }

  const characterCount = editor.storage.characterCount.characters() as number;
  const currentBlockLabel = editor.isActive("heading", { level: 2 })
    ? labels.heading2
    : editor.isActive("heading", { level: 3 })
      ? labels.heading3
      : labels.paragraph;

  return (
    <div
      aria-busy={isUploading}
      aria-disabled={disabled}
      className={cn(
        "overflow-hidden rounded-md border border-input bg-card text-card-foreground transition-colors",
        "focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/20",
        resolvedInvalid &&
          "border-destructive focus-within:border-destructive focus-within:ring-destructive/20",
        disabled && "bg-disabled text-disabled-foreground",
        className,
      )}
    >
      <TooltipProvider delayDuration={200}>
        <div
          aria-label={`${labels.editor} toolbar`}
          className="flex flex-nowrap items-center gap-0.5 overflow-x-auto overscroll-x-contain border-b border-border bg-muted/50 p-1.5 [scrollbar-width:thin]"
          role="toolbar"
        >
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                aria-label={currentBlockLabel}
                className="h-9 w-32 shrink-0 justify-between gap-1.5 px-2.5"
                disabled={disabled || isUploading}
                type="button"
                variant="ghost"
              >
                <span className="flex min-w-0 items-center gap-1.5">
                  <Type aria-hidden="true" className="size-4 shrink-0" />
                  <span className="truncate">{currentBlockLabel}</span>
                </span>
                <ChevronDown aria-hidden="true" className="size-3.5 shrink-0" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="min-w-44">
              <DropdownMenuItem
                onSelect={() => editor.chain().focus().setParagraph().run()}
              >
                {labels.paragraph}
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() =>
                  editor.chain().focus().toggleHeading({ level: 2 }).run()
                }
              >
                {labels.heading2}
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() =>
                  editor.chain().focus().toggleHeading({ level: 3 }).run()
                }
              >
                {labels.heading3}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <ToolbarButton
            active={editor.isActive("bold")}
            disabled={disabled || isUploading}
            label={labels.bold}
            onClick={() => editor.chain().focus().toggleBold().run()}
          >
            <Bold aria-hidden="true" className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            active={editor.isActive("italic")}
            disabled={disabled || isUploading}
            label={labels.italic}
            onClick={() => editor.chain().focus().toggleItalic().run()}
          >
            <Italic aria-hidden="true" className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            active={editor.isActive("underline")}
            disabled={disabled || isUploading}
            label={labels.underline}
            onClick={() => editor.chain().focus().toggleUnderline().run()}
          >
            <UnderlineIcon aria-hidden="true" className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            active={editor.isActive("strike")}
            disabled={disabled || isUploading}
            label={labels.strike}
            onClick={() => editor.chain().focus().toggleStrike().run()}
          >
            <Strikethrough aria-hidden="true" className="size-4" />
          </ToolbarButton>
          <ToolbarDivider />
          <ToolbarButton
            active={editor.isActive("bulletList")}
            disabled={disabled || isUploading}
            label={labels.bulletList}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
          >
            <List aria-hidden="true" className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            active={editor.isActive("orderedList")}
            disabled={disabled || isUploading}
            label={labels.orderedList}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
          >
            <ListOrdered aria-hidden="true" className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            active={editor.isActive("blockquote")}
            disabled={disabled || isUploading}
            label={labels.blockquote}
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
          >
            <Quote aria-hidden="true" className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            active={editor.isActive("codeBlock")}
            disabled={disabled || isUploading}
            label={labels.codeBlock}
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          >
            <Code aria-hidden="true" className="size-4" />
          </ToolbarButton>
          <ToolbarDivider />
          <ToolbarButton
            active={editor.isActive({ textAlign: "left" })}
            disabled={disabled || isUploading}
            label={labels.alignLeft}
            onClick={() => editor.chain().focus().setTextAlign("left").run()}
          >
            <AlignLeft aria-hidden="true" className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            active={editor.isActive({ textAlign: "center" })}
            disabled={disabled || isUploading}
            label={labels.alignCenter}
            onClick={() => editor.chain().focus().setTextAlign("center").run()}
          >
            <AlignCenter aria-hidden="true" className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            active={editor.isActive({ textAlign: "right" })}
            disabled={disabled || isUploading}
            label={labels.alignRight}
            onClick={() => editor.chain().focus().setTextAlign("right").run()}
          >
            <AlignRight aria-hidden="true" className="size-4" />
          </ToolbarButton>
          <ToolbarDivider />

          <Popover
            open={linkOpen}
            onOpenChange={(open) => {
              setLinkOpen(open);
              setLinkError("");
              if (open)
                setLinkValue(
                  (editor.getAttributes("link").href as string | undefined) ??
                    "",
                );
            }}
          >
            <Tooltip>
              <TooltipTrigger asChild>
                <PopoverTrigger asChild>
                  <Button
                    aria-label={labels.link}
                    aria-pressed={editor.isActive("link")}
                    className={cn(
                      "size-9 shrink-0 p-0",
                      editor.isActive("link") &&
                        "bg-accent text-accent-foreground",
                    )}
                    disabled={disabled || isUploading}
                    type="button"
                    variant="ghost"
                  >
                    <Link2 aria-hidden="true" className="size-4" />
                  </Button>
                </PopoverTrigger>
              </TooltipTrigger>
              <TooltipContent>{labels.link}</TooltipContent>
            </Tooltip>
            <PopoverContent className="space-y-2 p-3">
              <div className="flex gap-2">
                <Input
                  aria-invalid={Boolean(linkError)}
                  autoFocus
                  onChange={(event) => setLinkValue(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      applyLink();
                    }
                  }}
                  placeholder={labels.linkPlaceholder}
                  value={linkValue}
                />
                <Button onClick={applyLink} type="button">
                  {labels.link}
                </Button>
              </div>
              {linkError ? (
                <p className="text-xs text-destructive" role="alert">
                  {linkError}
                </p>
              ) : null}
            </PopoverContent>
          </Popover>
          <ToolbarButton
            disabled={disabled || isUploading || !editor.isActive("link")}
            label={labels.unlink}
            onClick={() => editor.chain().focus().unsetLink().run()}
          >
            <Unlink aria-hidden="true" className="size-4" />
          </ToolbarButton>

          {onUpload ? (
            <>
              <ToolbarDivider />
              <ToolbarButton
                disabled={disabled || isUploading}
                label={labels.image}
                onClick={() => {
                  rememberSelection();
                  imageInputRef.current?.click();
                }}
              >
                <ImageIcon aria-hidden="true" className="size-4" />
              </ToolbarButton>
              <ToolbarButton
                disabled={disabled || isUploading}
                label={labels.video}
                onClick={() => {
                  rememberSelection();
                  videoInputRef.current?.click();
                }}
              >
                <VideoIcon aria-hidden="true" className="size-4" />
              </ToolbarButton>
              <ToolbarButton
                disabled={disabled || isUploading}
                label={labels.document}
                onClick={() => {
                  rememberSelection();
                  documentInputRef.current?.click();
                }}
              >
                <FileUp aria-hidden="true" className="size-4" />
              </ToolbarButton>
            </>
          ) : null}

          <ToolbarDivider />
          <ToolbarButton
            disabled={disabled || isUploading}
            label={labels.clearFormatting}
            onClick={() =>
              editor.chain().focus().clearNodes().unsetAllMarks().run()
            }
          >
            <RemoveFormatting aria-hidden="true" className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            disabled={disabled || isUploading || !editor.can().undo()}
            label={labels.undo}
            onClick={() => editor.chain().focus().undo().run()}
          >
            <Undo2 aria-hidden="true" className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            disabled={disabled || isUploading || !editor.can().redo()}
            label={labels.redo}
            onClick={() => editor.chain().focus().redo().run()}
          >
            <Redo2 aria-hidden="true" className="size-4" />
          </ToolbarButton>
        </div>
      </TooltipProvider>

      <EditorContent
        className={cn(
          "[&_.is-editor-empty:first-child::before]:pointer-events-none [&_.is-editor-empty:first-child::before]:float-left [&_.is-editor-empty:first-child::before]:h-0 [&_.is-editor-empty:first-child::before]:text-muted-foreground [&_.is-editor-empty:first-child::before]:content-[attr(data-placeholder)]",
          contentClassName,
        )}
        editor={editor}
      />

      {onUpload ? (
        <>
          <input
            accept={ACCEPTED_FILES.image}
            disabled={disabled || isUploading}
            hidden
            multiple
            onChange={(event) => {
              const input = event.currentTarget;
              void uploadFiles("image", Array.from(input.files ?? [])).finally(
                () => {
                  input.value = "";
                },
              );
            }}
            ref={imageInputRef}
            tabIndex={-1}
            type="file"
          />
          <input
            accept={ACCEPTED_FILES.video}
            disabled={disabled || isUploading}
            hidden
            onChange={(event) => {
              const input = event.currentTarget;
              void uploadFiles("video", Array.from(input.files ?? [])).finally(
                () => {
                  input.value = "";
                },
              );
            }}
            ref={videoInputRef}
            tabIndex={-1}
            type="file"
          />
          <input
            accept={ACCEPTED_FILES.document}
            disabled={disabled || isUploading}
            hidden
            onChange={(event) => {
              const input = event.currentTarget;
              void uploadFiles(
                "document",
                Array.from(input.files ?? []),
              ).finally(() => {
                input.value = "";
              });
            }}
            ref={documentInputRef}
            tabIndex={-1}
            type="file"
          />
        </>
      ) : null}

      {uploadState || uploadError || maxLength ? (
        <div className="flex min-h-9 items-center justify-between gap-3 border-t border-border px-3 py-2 text-xs text-muted-foreground">
          <div aria-live="polite" className="min-w-0 flex-1" role="status">
            {uploadState ? (
              <span className="flex items-center gap-2">
                <LoaderCircle
                  aria-hidden="true"
                  className="size-3.5 shrink-0 animate-spin"
                />
                <span className="truncate">
                  {formatLabel(labels.uploading, uploadState.fileName)} ·{" "}
                  {uploadState.progress}%
                </span>
              </span>
            ) : uploadError ? (
              <span className="text-destructive">{uploadError}</span>
            ) : null}
          </div>
          {maxLength ? (
            <span
              className={cn(
                "shrink-0 tabular-nums",
                characterCount >= maxLength && "text-destructive",
              )}
            >
              {characterCount}/{maxLength}
            </span>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function ToolbarDivider() {
  return (
    <span aria-hidden="true" className="mx-0.5 h-6 w-px shrink-0 bg-border" />
  );
}

function ToolbarButton({
  active,
  children,
  disabled,
  label,
  onClick,
}: {
  active?: boolean;
  children: React.ReactNode;
  disabled?: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          aria-label={label}
          aria-pressed={active === undefined ? undefined : active}
          className={cn(
            "size-9 shrink-0 p-0",
            active && "bg-accent text-accent-foreground",
          )}
          disabled={disabled}
          onClick={onClick}
          onMouseDown={(event) => event.preventDefault()}
          type="button"
          variant="ghost"
        >
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}
