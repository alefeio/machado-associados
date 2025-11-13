// src/pages/admin/blog/index.tsx
import { useState, useEffect } from "react";
import Head from "next/head";
import { MdAddPhotoAlternate, MdDelete, MdEdit } from 'react-icons/md';
import AdminLayout from "components/admin/AdminLayout";
import { useSession } from "next-auth/react";
import Link from "next/link";
import dynamic from "next/dynamic";

const RichTextEditor = dynamic(
  () => import("components/RichTextEditor"),
  { ssr: false }
);

// ---------- Tipos ----------
interface BlogImageForm {
  id?: string;
  url?: string; // url string when already uploaded
  caption?: string;
  file?: File; // file when user selected local file
}

interface BlogPostForm {
  id?: string;
  title: string;
  subtitle?: string;
  summary?: string;
  content?: string;
  coverImage?: string | File | null;
  published: boolean;
  categories: { id?: string; name: string }[]; // allow creating new category by name
  tags: { id?: string; name: string }[];
  images: BlogImageForm[];
}

interface BlogPost {
  id: string;
  title: string;
  subtitle?: string | null;
  summary?: string | null;
  content?: string | null;
  coverImage?: string | null;
  published: boolean;
  categories: { id: string; name: string }[];
  tags: { id: string; name: string }[];
  images: { id: string; url: string; caption?: string | null }[];
  createdAt: string;
  updatedAt: string;
}

// ---------- Helpers ----------
const generateSlug = (title = "") =>
  title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

// ---------- Componente ----------
export default function AdminBlog() {
  const { data: session, status } = useSession();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalAction, setModalAction] = useState<(() => void) | null>(null);

  const [form, setForm] = useState<BlogPostForm>({
    title: "",
    subtitle: "",
    summary: "",
    content: "",
    coverImage: null,
    published: false,
    categories: [],
    tags: [],
    images: [{ url: undefined, caption: undefined }],
  });

  // categorias e tags locais (para multiselect simples)
  const [allCategories, setAllCategories] = useState<{ id?: string; name: string }[]>([]);
  const [allTags, setAllTags] = useState<{ id?: string; name: string }[]>([]);

  useEffect(() => {
    fetchPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/crud/blog", { method: "GET" });
      const data = await res.json();
      if (res.ok && data.success) {
        // data.posts expected to be array of posts
        setPosts(data.posts || []);
        // build category/tag lists from posts (simple dedupe)
        const cats: Record<string, string> = {};
        const tags: Record<string, string> = {};
        (data.posts || []).forEach((p: any) => {
          (p.categories || []).forEach((c: any) => (cats[c.name] = c.name));
          (p.tags || []).forEach((t: any) => (tags[t.name] = t.name));
        });
        setAllCategories(Object.keys(cats).map((n) => ({ name: n })));
        setAllTags(Object.keys(tags).map((n) => ({ name: n })));
      } else {
        setError(data.message || "Erro ao carregar posts.");
      }
    } catch (e: any) {
      setError("Erro ao conectar com a API.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      title: "",
      subtitle: "",
      summary: "",
      content: "",
      coverImage: null,
      published: false,
      categories: [],
      tags: [],
      images: [{ url: undefined, caption: undefined }],
    });
  };

  // preencher form para edição
  const handleEdit = (post: BlogPost) => {
    setForm({
      id: post.id,
      title: post.title,
      subtitle: post.subtitle || "",
      summary: post.summary || "",
      content: post.content || "",
      coverImage: post.coverImage || null,
      published: post.published,
      categories: (post.categories || []).map((c) => ({ id: c.id, name: c.name })),
      tags: (post.tags || []).map((t) => ({ id: t.id, name: t.name })),
      images: (post.images || []).map((img) => ({ id: img.id, url: img.url, caption: img.caption || undefined })),
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // handle form field changes (inputs and checkbox)
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if ((e.target as HTMLInputElement).type === "checkbox") {
      setForm((prev) => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
      return;
    }
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // handle content (richtext)
  const handleContentChange = (val: string) => {
    setForm((prev) => ({ ...prev, content: val }));
  };

  // Cover image change
  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setForm((prev) => ({ ...prev, coverImage: e.target.files![0] }));
    }
  };

  // images gallery change
  const handleImageChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const newImages = [...form.images];
    if (e.target.files && e.target.files[0]) {
      newImages[index] = { ...newImages[index], file: e.target.files[0], url: undefined };
    }
    setForm((prev) => ({ ...prev, images: newImages }));
  };

  const addImageField = () => {
    setForm((prev) => ({ ...prev, images: [...prev.images, { url: undefined, caption: undefined }] }));
  };

  const removeImageField = (index: number) => {
    const newImages = form.images.filter((_, i) => i !== index);
    setForm((prev) => ({ ...prev, images: newImages }));
  };

  const handleImageCaptionChange = (index: number, caption: string) => {
    const newImages = [...form.images];
    newImages[index] = { ...newImages[index], caption };
    setForm((prev) => ({ ...prev, images: newImages }));
  };

  // categories / tags: add by name (simple multiselect)
  const toggleCategory = (name: string) => {
    const exists = form.categories.find((c) => c.name === name);
    if (exists) {
      setForm((prev) => ({ ...prev, categories: prev.categories.filter((c) => c.name !== name) }));
    } else {
      setForm((prev) => ({ ...prev, categories: [...prev.categories, { name }] }));
      if (!allCategories.find((c) => c.name === name)) setAllCategories((prev) => [...prev, { name }]);
    }
  };

  const toggleTag = (name: string) => {
    const exists = form.tags.find((t) => t.name === name);
    if (exists) {
      setForm((prev) => ({ ...prev, tags: prev.tags.filter((t) => t.name !== name) }));
    } else {
      setForm((prev) => ({ ...prev, tags: [...prev.tags, { name }] }));
      if (!allTags.find((t) => t.name === name)) setAllTags((prev) => [...prev, { name }]);
    }
  };

  const handleAddCategory = (name: string) => {
    if (!name) return;
    if (!allCategories.find((c) => c.name === name)) setAllCategories((prev) => [...prev, { name }]);
    toggleCategory(name);
  };

  const handleAddTag = (name: string) => {
    if (!name) return;
    if (!allTags.find((t) => t.name === name)) setAllTags((prev) => [...prev, { name }]);
    toggleTag(name);
  };

  // upload helper for Cloudinary via /api/cloudinary
  const uploadFileToCloudinary = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    // optional: append folder or other params
    const res = await fetch("/api/cloudinary", {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.message || "Erro no upload para Cloudinary");
    return data.url; // expects { url: 'https://...' }
  };

  // handle submit (create or update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setError("");
    try {
      // 1) upload cover if needed
      let coverUrl = typeof form.coverImage === "string" ? form.coverImage : null;
      if (form.coverImage && form.coverImage instanceof File) {
        coverUrl = await uploadFileToCloudinary(form.coverImage);
      }

      // 2) upload images (gallery)
      const imagesPayload = await Promise.all(
        form.images.map(async (img) => {
          if (img.file instanceof File) {
            const url = await uploadFileToCloudinary(img.file);
            return { url, caption: img.caption || "" };
          }
          if (img.url) {
            return { url: img.url, caption: img.caption || "" };
          }
          return null;
        })
      );

      const imagesFinal = imagesPayload.filter(Boolean);

      // 3) prepare body
      const body: any = {
        title: form.title,
        subtitle: form.subtitle,
        summary: form.summary,
        content: form.content,
        coverImage: coverUrl,
        published: form.published,
        categories: form.categories.map((c) => (c.id ? { id: c.id } : { name: c.name })), // backend should handle creating categories by name
        tags: form.tags.map((t) => (t.id ? { id: t.id } : { name: t.name })),
        images: imagesFinal.map((i: any) => ({ url: i.url, caption: i.caption })),
      };

      const method = form.id ? "PUT" : "POST";
      if (form.id) body.id = form.id;

      const res = await fetch("/api/crud/blog", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setModalMessage(`Post ${form.id ? "atualizado" : "criado"} com sucesso!`);
        setShowModal(true);
        resetForm();
        fetchPosts();
      } else {
        setError(data?.message || `Erro ao ${form.id ? "atualizar" : "criar"} post.`);
      }
    } catch (err: any) {
      setError(err.message || "Erro ao salvar post.");
    } finally {
      setFormLoading(false);
    }
  };

  // delete post or image
  const handleDelete = async (id: string, isImage = false) => {
    setModalMessage(`Tem certeza que deseja excluir ${isImage ? "esta imagem" : "este post"}?`);
    setModalAction(() => async () => {
      try {
        const res = await fetch("/api/crud/blog", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, isImage }),
        });
        if (res.ok) {
          setModalMessage(`${isImage ? "Imagem" : "Post"} excluído com sucesso!`);
          setShowModal(true);
          fetchPosts();
        } else {
          const data = await res.json();
          setError(data.message || "Erro ao excluir.");
        }
      } catch (e) {
        setError("Erro ao conectar com a API.");
      } finally {
        setShowModal(false);
      }
    });
    setShowModal(true);
  };

  if (status === "loading") return <AdminLayout><p>Verificando autenticação...</p></AdminLayout>;
  if ((status === "authenticated" && (session?.user as any)?.role !== "ADMIN")) {
    return (
      <AdminLayout>
        <p className="text-red-500 text-center mt-8">Acesso negado. Apenas administradores podem visualizar o blog.</p>
        <Link href="/api/auth/signin" className="text-center block mt-4 text-orange-500 font-bold">Fazer Login</Link>
      </AdminLayout>
    );
  }

  return (
    <>
      <Head>
        <title>Admin - Blog</title>
      </Head>
      <AdminLayout>
        <main className="container mx-auto p-6 lg:p-12 mt-20">
          <h1 className="text-4xl font-extrabold mb-8 text-gray-800">Gerenciar Blog</h1>

          {/* Formulário de Criação/Edição */}
          <section className="bg-white p-8 rounded-xl shadow-lg mb-10 border border-gray-200">
            <h2 className="text-2xl font-bold mb-6 text-gray-700">{form.id ? "Editar Artigo" : "Adicionar Novo Artigo"}</h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <input type="text" name="title" value={form.title} onChange={handleFormChange} placeholder="Título do Artigo" required className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition duration-200 text-gray-900" />
              <input type="text" name="subtitle" value={form.subtitle} onChange={handleFormChange} placeholder="Subtítulo do Artigo" className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition duration-200 text-gray-900" />
              <textarea name="summary" value={form.summary} onChange={handleFormChange} placeholder="Resumo curto para listagens / SEO" className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition duration-200 text-gray-900" />

              <div>
                <label className="block mb-2 font-medium text-gray-700">Conteúdo</label>
                <RichTextEditor value={form.content || ""} onChange={handleContentChange} placeholder="Escreva o conteúdo do post..." />
              </div>

              <div className="flex gap-4 items-center">
                <div className="flex-1">
                  <label className="block mb-2 font-medium text-gray-700">Capa</label>
                  {form.coverImage && typeof form.coverImage === "string" && (
                    <div className="mb-2">
                      <img src={form.coverImage} alt="Capa atual" className="w-48 h-28 object-cover rounded-md" />
                    </div>
                  )}
                  <input type="file" accept="image/*" onChange={handleCoverChange} />
                </div>

                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" name="published" checked={form.published} onChange={handleFormChange} className="h-5 w-5 text-orange-600 border-gray-300 rounded focus:ring-orange-500" />
                    <span className="ml-2 text-gray-900">Publicado</span>
                  </label>
                </div>
              </div>

              {/* Categories */}
              <div>
                <label className="block mb-2 font-medium text-gray-700">Categorias</label>
                <div className="flex gap-2 flex-wrap mb-2">
                  {allCategories.map((c) => {
                    const active = !!form.categories.find((fc) => fc.name === c.name);
                    return (
                      <button
                        key={c.name}
                        type="button"
                        onClick={() => toggleCategory(c.name)}
                        className={`px-3 py-1 rounded-full border ${active ? "bg-orange-500 text-white border-orange-500" : "bg-white text-gray-700 border-gray-300"}`}
                      >
                        {c.name}
                      </button>
                    );
                  })}
                </div>
                <div className="flex gap-2">
                  <input id="new-cat" name="new-cat" placeholder="Adicionar categoria..." className="p-2 border border-gray-300 rounded-md flex-1" />
                  <button type="button" onClick={() => {
                    const input = document.getElementById("new-cat") as HTMLInputElement | null;
                    if (input) {
                      handleAddCategory(input.value.trim());
                      input.value = "";
                    }
                  }} className="px-4 py-2 bg-gray-200 rounded-md">Adicionar</button>
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block mb-2 font-medium text-gray-700">Tags</label>
                <div className="flex gap-2 flex-wrap mb-2">
                  {allTags.map((t) => {
                    const active = !!form.tags.find((ft) => ft.name === t.name);
                    return (
                      <button
                        key={t.name}
                        type="button"
                        onClick={() => toggleTag(t.name)}
                        className={`px-3 py-1 rounded-full border ${active ? "bg-sky-500 text-white border-sky-500" : "bg-white text-gray-700 border-gray-300"}`}
                      >
                        {t.name}
                      </button>
                    );
                  })}
                </div>
                <div className="flex gap-2">
                  <input id="new-tag" name="new-tag" placeholder="Adicionar tag..." className="p-2 border border-gray-300 rounded-md flex-1" />
                  <button type="button" onClick={() => {
                    const input = document.getElementById("new-tag") as HTMLInputElement | null;
                    if (input) {
                      handleAddTag(input.value.trim());
                      input.value = "";
                    }
                  }} className="px-4 py-2 bg-gray-200 rounded-md">Adicionar</button>
                </div>
              </div>

              {/* Galeria de imagens */}
              <div>
                <h3 className="text-xl font-bold mt-6 text-gray-700">Fotos (Galeria)</h3>
                {form.images.map((item, index) => (
                  <div key={index} className="flex flex-col md:flex-row gap-4 p-4 border border-dashed border-gray-300 rounded-lg relative">
                    <button type="button" onClick={() => removeImageField(index)} className="absolute top-2 right-2 text-red-500 hover:text-red-700 transition duration-200">
                      <MdDelete size={24} />
                    </button>

                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input type="text" value={item.caption || ""} onChange={(e) => handleImageCaptionChange(index, e.target.value)} placeholder="Legenda da foto" className="p-3 border border-gray-300 rounded-lg" />
                    </div>

                    <div className="flex-1 w-full flex flex-col items-center gap-2 border border-gray-300 rounded-lg p-3">
                      {item.url && typeof item.url === "string" && (
                        <div className="w-full flex justify-center mb-2">
                          <img src={item.url} alt={item.caption || "Imagem"} className="w-24 h-24 object-cover rounded-lg" />
                        </div>
                      )}
                      <label htmlFor={`img-${index}`} className="w-full flex-1 text-gray-500 cursor-pointer flex items-center justify-center gap-2 font-semibold hover:bg-gray-100 transition duration-200 p-2 rounded-lg">
                        <MdAddPhotoAlternate size={24} />
                        {item.file instanceof File ? item.file.name : "Escolher arquivo..."}
                      </label>
                      <input
                        type="file"
                        name={`img-${index}`}
                        id={`img-${index}`}
                        accept="image/*"
                        onChange={(e) => handleImageChange(index, e)}
                        className="hidden"
                      />
                    </div>
                  </div>
                ))}
                <button type="button" onClick={addImageField} className="bg-gray-200 text-gray-800 p-3 rounded-lg mt-2 flex items-center justify-center gap-2 font-semibold hover:bg-gray-300 transition duration-200">
                  <MdAddPhotoAlternate size={24} /> Adicionar Nova Foto
                </button>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 mt-6">
                <button type="submit" disabled={formLoading} className="bg-orange-500 text-white p-4 rounded-lg flex-1 font-bold shadow-md hover:bg-orange-600 transition duration-200 disabled:bg-gray-400">
                  {formLoading ? (form.id ? "Atualizando..." : "Salvando...") : (form.id ? "Atualizar Artigo" : "Salvar Artigo")}
                </button>
                {form.id && (
                  <button type="button" onClick={resetForm} className="bg-gray-300 text-gray-800 p-4 rounded-lg flex-1 font-bold shadow-md hover:bg-gray-400 transition duration-200">
                    Cancelar Edição
                  </button>
                )}
              </div>
            </form>
            {error && <p className="text-red-500 mt-4 font-medium">{error}</p>}
          </section>

          {/* Lista de Posts */}
          <section className="bg-white p-8 rounded-xl shadow-lg border border-gray-200">
            <h2 className="text-2xl font-bold mb-6 text-gray-700">Artigos Existentes</h2>
            {loading ? (
              <p className="text-gray-600">Carregando...</p>
            ) : posts.length === 0 ? (
              <p className="text-gray-600">Nenhum artigo encontrado.</p>
            ) : (
              posts.map((post) => (
                <div key={post.id} className="bg-gray-50 p-6 rounded-xl shadow-sm mb-4 border border-gray-200">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-800">{post.title}</h3>
                      <p className="text-sm text-gray-500">{post.subtitle}</p>
                      <div className="flex gap-2 mt-2 flex-wrap">
                        {post.published ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Publicado</span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Rascunho</span>
                        )}
                        <span className="text-xs text-gray-500">Criado em: {new Date(post.createdAt).toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4 md:mt-0">
                      <button onClick={() => handleEdit(post as any)} className="bg-gray-200 text-gray-700 p-2 rounded-lg hover:bg-gray-300 transition duration-200">
                        <MdEdit size={20} />
                      </button>
                      <button onClick={() => handleDelete(post.id)} className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition duration-200">
                        <MdDelete size={20} />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {(post.images || []).map((img) => (
                      <div key={img.id} className="flex gap-4 items-center bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                        <img src={img.url} alt={img.caption || "Imagem"} className="w-20 h-20 object-cover rounded-lg" />
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-800">{img.caption}</h4>
                        </div>
                        <button onClick={() => handleDelete(img.id, true)} className="bg-red-500 text-white p-2 rounded-lg text-sm hover:bg-red-600 transition duration-200">Excluir</button>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </section>
        </main>
      </AdminLayout>

      {/* Modal de Confirmação/Alerta */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl max-w-sm mx-auto">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Atenção</h3>
            <p className="text-gray-700 mb-6">{modalMessage}</p>
            <div className="flex justify-end space-x-4">
              {modalAction && (
                <button
                  onClick={() => {
                    if (modalAction) modalAction();
                    setShowModal(false);
                    setModalAction(null);
                  }}
                  className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition duration-200"
                >
                  Confirmar
                </button>
              )}
              <button
                onClick={() => {
                  setShowModal(false);
                  setModalAction(null);
                }}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition duration-200"
              >
                {modalAction ? "Cancelar" : "Ok"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
