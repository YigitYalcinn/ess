import { useEffect, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import { Placeholder } from '@tiptap/extensions';
import { uploadImage, pickImage } from './image';

function Btn({ onClick, active, title, children, disabled }) {
  return (
    <button
      type="button"
      className={`a-tool ${active ? 'active' : ''}`}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      title={title}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

export default function RichEditor({ value, onChange, placeholder }) {
  const [uploading, setUploading] = useState(false);

  const editor = useEditor({
    shouldRerenderOnTransaction: true,
    immediatelyRender: true,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3, 4] },
        link: { openOnClick: false, autolink: true, defaultProtocol: 'https' },
      }),
      Image.configure({ inline: false }),
      Placeholder.configure({ placeholder: placeholder || '' }),
    ],
    content: value || '',
    editorProps: { attributes: { class: 'a-prose' } },
    onUpdate: ({ editor: ed }) => onChange(ed.isEmpty ? '' : ed.getHTML()),
  });

  // Dışarıdan gelen değer (ör. çeviri) değişirse editöre yansıt
  useEffect(() => {
    if (!editor) return;
    const current = editor.isEmpty ? '' : editor.getHTML();
    if ((value || '') !== current) editor.commands.setContent(value || '', { emitUpdate: false });
  }, [value, editor]);

  if (!editor) return null;

  const setLink = () => {
    const prev = editor.getAttributes('link').href || '';
    const url = window.prompt('Bağlantı adresi (boş bırakırsanız bağlantı kaldırılır):', prev);
    if (url === null) return;
    if (url.trim() === '') editor.chain().focus().extendMarkRange('link').unsetLink().run();
    else editor.chain().focus().extendMarkRange('link').setLink({ href: url.trim() }).run();
  };

  const addImage = async () => {
    const file = await pickImage();
    if (!file) return;
    const alt = window.prompt('Görsel açıklaması (alt metin — SEO için önemli):', '') || '';
    setUploading(true);
    try {
      const src = await uploadImage(file);
      editor.chain().focus().setImage({ src, alt }).run();
    } catch (err) {
      alert(`Görsel yüklenemedi: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  const c = () => editor.chain().focus();

  return (
    <div className="a-editor">
      <div className="a-toolbar">
        <Btn title="Ara başlık (H2)" active={editor.isActive('heading', { level: 2 })} onClick={() => c().toggleHeading({ level: 2 }).run()}>H2</Btn>
        <Btn title="Alt başlık (H3)" active={editor.isActive('heading', { level: 3 })} onClick={() => c().toggleHeading({ level: 3 }).run()}>H3</Btn>
        <Btn title="Küçük başlık (H4)" active={editor.isActive('heading', { level: 4 })} onClick={() => c().toggleHeading({ level: 4 }).run()}>H4</Btn>
        <span className="a-sep" />
        <Btn title="Kalın" active={editor.isActive('bold')} onClick={() => c().toggleBold().run()}><b>B</b></Btn>
        <Btn title="İtalik" active={editor.isActive('italic')} onClick={() => c().toggleItalic().run()}><i>I</i></Btn>
        <Btn title="Altı çizili" active={editor.isActive('underline')} onClick={() => c().toggleUnderline().run()}><u>U</u></Btn>
        <Btn title="Bağlantı" active={editor.isActive('link')} onClick={setLink}>🔗</Btn>
        <span className="a-sep" />
        <Btn title="Madde işaretli liste" active={editor.isActive('bulletList')} onClick={() => c().toggleBulletList().run()}>• Liste</Btn>
        <Btn title="Numaralı liste" active={editor.isActive('orderedList')} onClick={() => c().toggleOrderedList().run()}>1. Liste</Btn>
        <Btn title="Alıntı" active={editor.isActive('blockquote')} onClick={() => c().toggleBlockquote().run()}>❝</Btn>
        <Btn title="Ayırıcı çizgi" onClick={() => c().setHorizontalRule().run()}>―</Btn>
        <Btn title="Görsel ekle" onClick={addImage} disabled={uploading}>{uploading ? '…' : '🖼 Görsel'}</Btn>
        <span className="a-sep" />
        <Btn title="Geri al" onClick={() => c().undo().run()} disabled={!editor.can().undo()}>↶</Btn>
        <Btn title="Yinele" onClick={() => c().redo().run()} disabled={!editor.can().redo()}>↷</Btn>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
