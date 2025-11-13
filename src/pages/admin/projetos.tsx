import { useState, useEffect, useMemo } from "react";
import Head from "next/head";
import { MdAddPhotoAlternate, MdDelete, MdEdit, MdVpnKey } from 'react-icons/md';
import AdminLayout from "components/admin/AdminLayout";
import { useSession } from "next-auth/react";
import Link from "next/link";
import dynamic from "next/dynamic";

// RichTextEditor é o 'description' renomeado para 'content'
const RichTextEditor = dynamic(
    () => import("components/RichTextEditor"),
    { ssr: false }
);

// --- 1. Novos Tipos de Dados ---

// TIPOS SIMPLIFICADOS para Tag e Categoria
interface Tag {
    id: string;
    name: string;
}

interface Categoria {
    id: string;
    name: string;
}

// Tipo adaptado de ProjetoFoto -> PostFile
interface PostFile {
    id?: string;
    local: string; // Ex: 'featured', 'gallery', 'download'
    tipo: string;  // Ex: 'image/jpeg', 'application/pdf'
    detalhes: string; // Legenda
    url: string | File; // Renomeado de 'img' para 'url'
}

// Tipo adaptado de Projeto -> Post
interface Post {
    id: string;
    title: string;
    subtitle: string | null;
    content: string | null; // Conteúdo principal (antigo description)
    slug: string; // NOVO: URL amigável
    publicado: boolean;
    categoriaId: string | null;
    categoria?: Categoria; // Opcional para inclusão
    files: PostFile[]; // Renomeado de 'items'
    tags: { tag: Tag }[]; // Relação N:N
}

// Tipo adaptado de FormState
interface FormState {
    id?: string;
    title: string;
    subtitle: string;
    content: string; // NOVO: Conteúdo principal
    slug: string; // NOVO: URL amigável
    publicado: boolean;
    categoriaId: string; // NOVO
    files: PostFile[]; // Renomeado de 'items'
    tags: string[]; // Usaremos apenas IDs das tags no formulário
}

// Mock de Categorias/Tags para o Select (em produção, viriam da API)
const CATEGORIAS_MOCK: Categoria[] = [
    { id: "cat1", name: "Desenvolvimento Web" },
    { id: "cat2", name: "Notícias da Tecnologia" },
    { id: "cat3", name: "Tutoriais e Guias" },
];

const TAGS_MOCK: Tag[] = [
    { id: "tag1", name: "React" },
    { id: "tag2", name: "Next.js" },
    { id: "tag3", name: "Prisma" },
    { id: "tag4", name: "TypeScript" },
];

// Tipos de arquivo permitidos para o PostFile (local no post)
const TIPOS_DE_ARQUIVO = [
    "Destaque",
    "Galeria",
    "Anexo (Download)",
];

export default function AdminPosts() {
    const { data: session, status } = useSession();
    const [posts, setPosts] = useState<Post[]>([]);
    const [form, setForm] = useState<FormState>({
        title: "",
        subtitle: "",
        content: "", // Renomeado
        slug: "", // NOVO
        publicado: false,
        categoriaId: CATEGORIAS_MOCK[0]?.id || "", // Define a primeira categoria como padrão
        files: [{
            local: TIPOS_DE_ARQUIVO[0],
            tipo: "image/jpeg", // Tipo Mime
            detalhes: "",
            url: "" // Renomeado
        }],
        tags: [], // IDs das tags selecionadas
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [modalMessage, setModalMessage] = useState("");
    const [modalAction, setModalAction] = useState<(() => void) | null>(null);

    // Efeito para preencher o slug automaticamente ao digitar o título
    useEffect(() => {
        if (!form.id && form.title) {
            const newSlug = form.title
                .toLowerCase()
                .trim()
                .replace(/[^a-z0-9\s-]/g, '') // Remove caracteres especiais
                .replace(/[\s-]+/g, '-'); // Substitui espaços e hífens múltiplos por um único hífen
            setForm(prevForm => ({ ...prevForm, slug: newSlug }));
        }
    }, [form.title, form.id]);


    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        setLoading(true);
        try {
            // ATENÇÃO: Mudança do endpoint
            const res = await fetch("/api/crud/posts", { method: "GET" });
            const data = await res.json();
            if (res.ok && data.success) {
                // Posts já virão ordenados por data da API (opcionalmente)
                setPosts(data.posts);
            } else {
                setError(data.message || "Erro ao carregar posts.");
            }
        } catch (e) {
            setError("Erro ao conectar com a API.");
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setForm({
            title: "",
            subtitle: "",
            content: "",
            slug: "",
            publicado: false,
            categoriaId: CATEGORIAS_MOCK[0]?.id || "",
            files: [{
                local: TIPOS_DE_ARQUIVO[0],
                tipo: "image/jpeg",
                detalhes: "",
                url: ""
            }],
            tags: [],
        });
    };

    // CORRIGIDO: Tipo de evento e nome do campo
    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        if (e.target.type === "checkbox") {
            setForm(prevForm => ({
                ...prevForm,
                [name]: (e.target as HTMLInputElement).checked
            }));
        } else {
            setForm(prevForm => ({ ...prevForm, [name]: value }));
        }
    };

    const handleItemChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>, index: number) => {
        const { name, value } = e.target;
        const newFiles = [...form.files];

        // Verifica se o elemento é um input de arquivo
        if (name === "url" && e.target instanceof HTMLInputElement && e.target.files) {
            newFiles[index] = { ...newFiles[index], [name]: e.target.files[0] };
        } else {
            newFiles[index] = { ...newFiles[index], [name]: value };
        }

        setForm({ ...form, files: newFiles });
    };

    const handleAddItem = () => {
        setForm({
            ...form,
            files: [...form.files, { local: TIPOS_DE_ARQUIVO[0], tipo: "image/jpeg", detalhes: "", url: "" }],
        });
    };

    const handleRemoveItem = (index: number) => {
        const newFiles = form.files.filter((_, i) => i !== index);
        setForm({ ...form, files: newFiles });
    };

    const handleTagChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedOptions = Array.from(e.target.selectedOptions, (option) => option.value);
        setForm(prevForm => ({ ...prevForm, tags: selectedOptions }));
    };

    const handleEdit = (post: Post) => {
        setForm({
            id: post.id,
            title: post.title,
            subtitle: post.subtitle || "",
            content: post.content || "", // NOVO: Mapeia content
            slug: post.slug, // NOVO: Mapeia slug
            publicado: post.publicado,
            categoriaId: post.categoriaId || CATEGORIAS_MOCK[0].id, // Mapeia Categoria
            files: post.files.map(file => ({ // Renomeado para files
                ...file,
                url: file.url as string, // Renomeado
                local: file.local || TIPOS_DE_ARQUIVO[0],
                tipo: file.tipo || 'image/jpeg',
                detalhes: file.detalhes || '',
            })),
            tags: post.tags.map(tagRel => tagRel.tag.id) // Mapeia apenas os IDs das tags
        });
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            // 1. Upload de Arquivos (PostFile)
            const filesWithUrls = await Promise.all(
                form.files.map(async (file) => {
                    if (file.url instanceof File) {
                        const formData = new FormData();
                        formData.append("file", file.url);
                        // ATENÇÃO: Ajuste este endpoint de upload se for diferente
                        const uploadRes = await fetch("/api/upload", {
                            method: "POST",
                            body: formData,
                        });
                        const uploadData = await uploadRes.json();
                        if (!uploadRes.ok) {
                            throw new Error(uploadData.message || "Erro no upload do arquivo via API.");
                        }
                        return { ...file, url: uploadData.url }; // Retorna com a URL do arquivo
                    }
                    return file;
                })
            );

            // 2. Preparação do Body e Chamada à API CRUD
            const method = form.id ? "PUT" : "POST";
            const body = {
                ...form,
                content: form.content || null, // Garante que o conteúdo seja enviado
                files: filesWithUrls,
                // O campo 'tags' no form já é um array de IDs, pronto para a API
            };

            // ATENÇÃO: Mudança do endpoint
            const res = await fetch("/api/crud/posts", {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

            const data = await res.json();
            if (res.ok && data.success) {
                setModalMessage(`Post ${form.id ? 'atualizado' : 'criado'} com sucesso!`);
                setShowModal(true);
                resetForm();
                fetchPosts();
            } else {
                setError(data.message || `Erro ao ${form.id ? 'atualizar' : 'criar'} post.`);
            }
        } catch (e: any) {
            setError(e.message || "Erro ao conectar com a API ou no upload do arquivo.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string, isFile = false) => {
        setModalMessage(`Tem certeza que deseja excluir ${isFile ? "este arquivo" : "este post"}?`);
        setModalAction(() => async () => {
            try {
                // ATENÇÃO: Mudança do endpoint
                const res = await fetch("/api/crud/posts", {
                    method: "DELETE",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ id, isFile }), // Renomeado 'isItem' para 'isFile'
                });
                if (res.ok) {
                    setModalMessage(`${isFile ? "Arquivo" : "Post"} excluído com sucesso!`);
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

    if (status === 'loading') return <AdminLayout><p>Verificando autenticação...</p></AdminLayout>;
    if ((status === 'authenticated' && (session?.user as any)?.role !== 'ADMIN')) {
        return (
            <AdminLayout>
                <p className="text-red-500 text-center mt-8">Acesso negado. Apenas administradores podem gerenciar posts.</p>
                <Link href="/api/auth/signin" className="text-center block mt-4 text-orange-500 font-bold">Fazer Login</Link>
            </AdminLayout>
        );
    }

    return (
        <>
            <Head>
                <title>Admin - Blog Posts</title>
            </Head>
            <AdminLayout>
                <main className="container mx-auto p-6 lg:p-12 mt-20">
                    <h1 className="text-4xl font-extrabold mb-8 text-gray-800">Gerenciar Posts do Blog</h1>

                    <section className="bg-white p-8 rounded-xl shadow-lg mb-10 border border-gray-200">
                        <h2 className="text-2xl font-bold mb-6 text-gray-700">{form.id ? "Editar Post" : "Adicionar Novo Post"}</h2>
                        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                            <input type="text" name="title" value={form.title} onChange={handleFormChange} placeholder="Título do Post" required className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition duration-200 text-gray-900" />
                            <input type="text" name="subtitle" value={form.subtitle} onChange={handleFormChange} placeholder="Subtítulo (Resumo Curto)" className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition duration-200 text-gray-900" />
                            
                            {/* NOVO: Campo SLUG (para a URL) */}
                            <div className="flex items-center gap-2 p-3 border border-gray-300 rounded-lg bg-gray-50">
                                <MdVpnKey size={20} className="text-gray-500" />
                                <input type="text" name="slug" value={form.slug} onChange={handleFormChange} placeholder="slug-do-post (URL amigável)" required className="flex-1 bg-gray-50 focus:outline-none text-gray-900" />
                            </div>

                            {/* NOVO: Seleção de Categoria */}
                            <select name="categoriaId" value={form.categoriaId} onChange={handleFormChange} required className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition duration-200 text-gray-900">
                                <option value="" disabled>Selecione a Categoria</option>
                                {CATEGORIAS_MOCK.map(cat => (
                                    <option key={cat.id} value={cat.id}>
                                        {cat.name}
                                    </option>
                                ))}
                            </select>

                            {/* NOVO: Seleção de Tags (Múltipla) */}
                            <select name="tags" value={form.tags} onChange={handleTagChange} multiple className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition duration-200 text-gray-900 h-28">
                                <option value="" disabled>Selecione as Tags (Ctrl/Cmd para múltiplos)</option>
                                {TAGS_MOCK.map(tag => (
                                    <option key={tag.id} value={tag.id}>
                                        {tag.name}
                                    </option>
                                ))}
                            </select>

                            {/* Campo Content (antigo description) */}
                            <RichTextEditor
                                value={form.content}
                                onChange={(value) =>
                                    setForm((prev) => ({ ...prev, content: value }))
                                }
                                placeholder="Conteúdo completo do Post"
                            />
                            
                            {/* Checkbox para Post Público */}
                            <div className="flex items-center mt-2">
                                <input
                                    type="checkbox"
                                    name="publicado"
                                    id="publicado"
                                    checked={form.publicado}
                                    onChange={handleFormChange}
                                    className="h-5 w-5 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                                />
                                <label htmlFor="publicado" className="ml-2 block text-base text-gray-900">
                                    Post Público
                                </label>
                            </div>

                            <h3 className="text-xl font-bold mt-6 text-gray-700">Arquivos do Post (Fotos/Downloads)</h3>
                            {/* Renomeado 'items' para 'files' */}
                            {form.files.map((file, index) => (
                                <div key={index} className="flex flex-col md:flex-row gap-4 p-4 border border-dashed border-gray-300 rounded-lg relative">
                                    <button type="button" onClick={() => handleRemoveItem(index)} className="absolute top-2 right-2 text-red-500 hover:text-red-700 transition duration-200">
                                        <MdDelete size={24} />
                                    </button>
                                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <select name="local" value={file.local} onChange={(e) => handleItemChange(e, index)} required className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition duration-200 text-gray-900">
                                            {TIPOS_DE_ARQUIVO.map(local => (
                                                <option key={local} value={local}>{local}</option>
                                            ))}
                                        </select>
                                        <input type="text" name="detalhes" value={file.detalhes} onChange={(e) => handleItemChange(e, index)} placeholder="Legenda/Descrição" className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition duration-200 text-gray-900" />
                                        <input type="text" name="tipo" value={file.tipo} onChange={(e) => handleItemChange(e, index)} placeholder="Mime Type (Ex: image/jpeg)" required className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition duration-200 text-gray-900 col-span-1 md:col-span-2" />
                                    </div>

                                    <div className="flex-1 w-full flex flex-col items-center gap-2 border border-gray-300 rounded-lg p-3">
                                        {typeof file.url === 'string' && file.url && (
                                            <div className="w-full flex justify-center mb-2">
                                                <img src={file.url} alt="Visualização do arquivo" className="w-24 h-24 object-cover rounded-lg" />
                                            </div>
                                        )}
                                        <label htmlFor={`url-${index}`} className="w-full flex-1 text-gray-500 cursor-pointer flex items-center justify-center gap-2 font-semibold hover:bg-gray-100 transition duration-200 p-2 rounded-lg">
                                            <MdAddPhotoAlternate size={24} />
                                            {file.url instanceof File ? file.url.name : "Escolher arquivo..."}
                                        </label>
                                        <input
                                            type="file"
                                            name="url" // Renomeado de 'img' para 'url'
                                            id={`url-${index}`}
                                            onChange={(e) => handleItemChange(e, index)}
                                            required={!file.url || file.url instanceof File}
                                            className="hidden"
                                        />
                                    </div>
                                </div>
                            ))}
                            <button type="button" onClick={handleAddItem} className="bg-gray-200 text-gray-800 p-3 rounded-lg mt-2 flex items-center justify-center gap-2 font-semibold hover:bg-gray-300 transition duration-200">
                                <MdAddPhotoAlternate size={24} /> Adicionar Novo Arquivo
                            </button>

                            <div className="flex flex-col sm:flex-row gap-4 mt-6">
                                <button type="submit" disabled={loading} className="bg-orange-500 text-white p-4 rounded-lg flex-1 font-bold shadow-md hover:bg-orange-600 transition duration-200 disabled:bg-gray-400">
                                    {loading ? (form.id ? "Atualizando..." : "Salvando...") : (form.id ? "Atualizar Post" : "Salvar Post")}
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
                        <h2 className="text-2xl font-bold mb-6 text-gray-700">Posts Existentes</h2>
                        {loading ? (
                            <p className="text-gray-600">Carregando...</p>
                        ) : posts.length === 0 ? (
                            <p className="text-gray-600">Nenhum post encontrado.</p>
                        ) : (
                            // Renomeado 'projeto' para 'post'
                            posts.map((post) => (
                                <div key={post.id} className="bg-gray-50 p-6 rounded-xl shadow-sm mb-4 border border-gray-200">
                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                                        <div className="flex-1">
                                            <h3 className="text-xl font-bold text-gray-800">{post.title}</h3>
                                            <p className="text-sm text-gray-500">{post.subtitle}</p>
                                            {/* Exibe categoria e tags */}
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                {post.categoria && (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                        {post.categoria.name}
                                                    </span>
                                                )}
                                                {post.tags.map(tagRel => (
                                                    <span key={tagRel.tag.id} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                                        {tagRel.tag.name}
                                                    </span>
                                                ))}
                                                {post.publicado && (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                        Público
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex gap-2 mt-4 md:mt-0">
                                            <button onClick={() => handleEdit(post)} className="bg-gray-200 text-gray-700 p-2 rounded-lg hover:bg-gray-300 transition duration-200">
                                                <MdEdit size={20} />
                                            </button>
                                            <button onClick={() => handleDelete(post.id)} className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition duration-200">
                                                <MdDelete size={20} />
                                            </button>
                                        </div>
                                    </div>
                                    {/* Renomeado 'items' para 'files' */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {post.files.map((file) => (
                                            <div key={file.id} className="flex gap-4 items-center bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                                                <img src={file.url as string} alt={file.detalhes} className="w-20 h-20 object-cover rounded-lg" />
                                                <div className="flex-1">
                                                    <h4 className="font-semibold text-gray-800">{file.local}</h4>
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        Tipo: {file.tipo}
                                                    </p>
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        {file.detalhes}
                                                    </p>
                                                </div>
                                                <button onClick={() => handleDelete(file.id as string, true)} className="bg-red-500 text-white p-2 rounded-lg text-sm hover:bg-red-600 transition duration-200">Excluir</button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))
                        )}
                    </section>
                </main>

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
            </AdminLayout>
        </>
    );
}