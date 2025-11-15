import { useState, useEffect } from "react";
import Head from "next/head";
import { MdAddPhotoAlternate, MdDelete, MdEdit } from 'react-icons/md';
import AdminLayout from "components/admin/AdminLayout";
import { useSession } from "next-auth/react";
import Link from "next/link";
import dynamic from "next/dynamic";
import React from "react";

// Importações do Rich Text Editor (assumindo que ele está no mesmo local)
const RichTextEditor = dynamic(
    () => import("components/RichTextEditor"),
    { ssr: false }
);

// Definições de tipo atualizadas para Blog
// Usamos o nome do modelo (BlogFoto)
interface BlogFoto {
    id?: string;
    detalhes: string; // Mantido
    img: string | File;
    // Omitidos: local, tipo (não existem no model BlogFoto)
}

// Usamos o nome do modelo (Blog)
interface BlogItem {
    id: string;
    title: string;
    subtitle: string | null;
    description: string | null;
    order: number;
    publico: boolean;
    items: BlogFoto[];
    slug: string | null;
}

interface FormState {
    id?: string;
    title: string;
    subtitle: string;
    description: string;
    order: number;
    publico: boolean;
    items: BlogFoto[];
    slug: string | null;
}

// Não há tipos específicos para um blog, então esta constante é removida
// const TIPOS_DE_PROJETO = [...]; 

export default function AdminBlog() {
    const { data: session, status } = useSession();
    const [posts, setPosts] = useState<BlogItem[]>([]); // 'projetos' renomeado para 'posts'
    const [form, setForm] = useState<FormState>({
        title: "",
        subtitle: "",
        description: "",
        order: 0,
        publico: false,
        items: [{
            detalhes: "",
            img: ""
        }],
        slug: null,
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [modalMessage, setModalMessage] = useState("");
    const [modalAction, setModalAction] = useState<(() => void) | null>(null);

    useEffect(() => {
        // Chamada para a nova API do Blog
        fetchPosts(); 
    }, []);

    const fetchPosts = async () => {
        setLoading(true);
        try {
            // Requisição GET do ADMIN: Passando o parâmetro 'admin=true' para buscar TODOS os posts
            // Assumindo que você implementou a lógica de filtro condicional no seu /api/crud/blog
            const res = await fetch("/api/crud/blog?admin=true", { method: "GET" });
            const data = await res.json();
            if (res.ok && data.success) {
                // Ordena os posts pelo campo 'order'
                const sortedPosts = data.posts.sort((a: BlogItem, b: BlogItem) => a.order - b.order);
                setPosts(sortedPosts);
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
            description: "",
            order: 0,
            publico: false,
            items: [{
                detalhes: "",
                img: ""
            }],
            slug: null,
        });
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;

        if (e.target.type === "checkbox") {
            setForm(prevForm => ({
                ...prevForm,
                [name]: (e.target as HTMLInputElement).checked
            }));
        } else if (name === "order") {
            setForm(prevForm => ({ ...prevForm, [name]: parseInt(value, 10) || 0 }));
        } else {
            setForm(prevForm => ({ ...prevForm, [name]: value }));
        }
    };

    // Função de alteração de item (BlogFoto)
    const handleItemChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>, index: number) => {
        const { name, value } = e.target;
        const newItems = [...form.items];

        // Verifica se o elemento é um input e se tem arquivos (para upload)
        if (name === "img" && e.target instanceof HTMLInputElement && e.target.files) {
            newItems[index] = { ...newItems[index], [name]: e.target.files[0] };
        } else {
            newItems[index] = { ...newItems[index], [name]: value };
        }

        setForm({ ...form, items: newItems });
    };

    const handleAddItem = () => {
        setForm({
            ...form,
            items: [...form.items, { detalhes: "", img: "" }],
        });
    };

    const handleRemoveItem = (index: number) => {
        const newItems = form.items.filter((_, i) => i !== index);
        setForm({ ...form, items: newItems });
    };

    const handleEdit = (post: BlogItem) => {
        setForm({
            id: post.id,
            title: post.title,
            subtitle: post.subtitle || "",
            description: post.description || "",
            order: post.order || 0,
            publico: post.publico,
            items: post.items.map(item => ({
                ...item,
                img: item.img as string,
                detalhes: item.detalhes || '',
            })),
            slug: null,
        });
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            // Processa upload de imagens antes de enviar o formulário
            const itemsWithUrls = await Promise.all(
                form.items.map(async (item) => {
                    if (item.img instanceof File) {
                        const formData = new FormData();
                        formData.append("file", item.img);
                        const uploadRes = await fetch("/api/upload", {
                            method: "POST",
                            body: formData,
                        });
                        const uploadData = await uploadRes.json();
                        if (!uploadRes.ok) {
                            throw new Error(uploadData.message || "Erro no upload da imagem via API.");
                        }
                        return { ...item, img: uploadData.url };
                    }
                    return item;
                })
            );

            const method = form.id ? "PUT" : "POST";
            const body = {
                ...form,
                publico: form.publico,
                items: itemsWithUrls
            };

            // Requisição para a API do Blog
            const res = await fetch("/api/crud/blog", {
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
            setError(e.message || "Erro ao conectar com a API ou no upload da imagem.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string, isItem = false) => {
        setModalMessage(`Tem certeza que deseja excluir ${isItem ? "esta imagem" : "este post"}?`);
        setModalAction(() => async () => {
            try {
                // Requisição para a API do Blog
                const res = await fetch("/api/crud/blog", {
                    method: "DELETE",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ id, isItem }),
                });
                if (res.ok) {
                    setModalMessage(`${isItem ? "Imagem" : "Post"} excluído com sucesso!`);
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
                <p className="text-red-500 text-center mt-8">Acesso negado. Apenas administradores podem gerenciar o blog.</p>
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
                    <h1 className="text-4xl font-extrabold mb-8 text-gray-800">Gerenciar Blog / Artigos</h1>

                    {/* Formulário de Criação/Edição */}
                    <section className="bg-white p-8 rounded-xl shadow-lg mb-10 border border-gray-200">
                        <h2 className="text-2xl font-bold mb-6 text-gray-700">{form.id ? "Editar Post" : "Adicionar Novo Post"}</h2>
                        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                            <input type="text" name="title" value={form.title} onChange={handleFormChange} placeholder="Título Principal do Post" required className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition duration-200 text-gray-900" />
                            <input type="text" name="subtitle" value={form.subtitle} onChange={handleFormChange} placeholder="Subtítulo/Resumo Curto (SEO)" className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition duration-200 text-gray-900" />
                            <RichTextEditor
                                value={form.description}
                                onChange={(value) =>
                                    setForm((prev) => ({ ...prev, description: value }))
                                }
                                placeholder="Conteúdo completo do Post"
                            />
                            <input type="number" name="order" value={form.order} onChange={handleFormChange} placeholder="Ordem de exibição" required className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition duration-200 text-gray-900" />

                            {/* Checkbox para Post Público */}
                            <div className="flex items-center mt-2">
                                <input
                                    type="checkbox"
                                    name="publico"
                                    id="publico"
                                    checked={form.publico}
                                    onChange={handleFormChange}
                                    className="h-5 w-5 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                                />
                                <label htmlFor="publico" className="ml-2 block text-base text-gray-900">
                                    Post Público (Visível no site)
                                </label>
                            </div>

                            <h3 className="text-xl font-bold mt-6 text-gray-700">Imagens do Post</h3>
                            {form.items.map((item, index) => (
                                <div key={index} className="flex flex-col md:flex-row gap-4 p-4 border border-dashed border-gray-300 rounded-lg relative">
                                    <button type="button" onClick={() => handleRemoveItem(index)} className="absolute top-2 right-2 text-red-500 hover:text-red-700 transition duration-200">
                                        <MdDelete size={24} />
                                    </button>
                                    
                                    {/* Campos de Detalhes (BlogFoto) */}
                                    <div className="flex-1 grid grid-cols-1 gap-4">
                                        {/* Removidos: local e tipo */}
                                        <textarea name="detalhes" value={item.detalhes} onChange={(e) => handleItemChange(e, index)} placeholder="Detalhes da imagem (descrição ou legenda)" className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition duration-200 text-gray-900 col-span-1" />
                                    </div>

                                    {/* Campo de Upload de Imagem */}
                                    <div className="flex-1 w-full flex flex-col items-center gap-2 border border-gray-300 rounded-lg p-3">
                                        {typeof item.img === 'string' && item.img && (
                                            <div className="w-full flex justify-center mb-2">
                                                <img src={item.img} alt="Visualização da foto" className="w-24 h-24 object-cover rounded-lg" />
                                            </div>
                                        )}
                                        <label htmlFor={`img-${index}`} className="w-full flex-1 text-gray-500 cursor-pointer flex items-center justify-center gap-2 font-semibold hover:bg-gray-100 transition duration-200 p-2 rounded-lg">
                                            <MdAddPhotoAlternate size={24} />
                                            {item.img instanceof File ? item.img.name : "Escolher arquivo..."}
                                        </label>
                                        <input
                                            type="file"
                                            name="img"
                                            id={`img-${index}`}
                                            onChange={(e) => handleItemChange(e, index)}
                                            // A imagem é obrigatória apenas se for a primeira vez ou se o usuário estiver substituindo
                                            required={!item.img || item.img instanceof File} 
                                            className="hidden"
                                        />
                                    </div>
                                </div>
                            ))}
                            <button type="button" onClick={handleAddItem} className="bg-gray-200 text-gray-800 p-3 rounded-lg mt-2 flex items-center justify-center gap-2 font-semibold hover:bg-gray-300 transition duration-200">
                                <MdAddPhotoAlternate size={24} /> Adicionar Nova Imagem
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
                            posts.map((post) => (
                                <div key={post.id} className="bg-gray-50 p-6 rounded-xl shadow-sm mb-4 border border-gray-200">
                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                                        <div className="flex-1">
                                            <h3 className="text-xl font-bold text-gray-800">{post.title}</h3>
                                            <p className="text-sm text-gray-500">{post.subtitle}</p>
                                            {post.publico ? (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-2">
                                                    Público
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 mt-2">
                                                    Rascunho
                                                </span>
                                            )}
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
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {post.items.map((item) => (
                                            <div key={item.id} className="flex gap-4 items-center bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                                                <img src={item.img as string} alt={item.detalhes || 'Imagem do Post'} className="w-20 h-20 object-cover rounded-lg" />
                                                <div className="flex-1">
                                                    <h4 className="font-semibold text-gray-800 line-clamp-2">{item.detalhes || 'Sem Detalhes'}</h4>
                                                </div>
                                                <button onClick={() => handleDelete(item.id as string, true)} className="bg-red-500 text-white p-2 rounded-lg text-sm hover:bg-red-600 transition duration-200">Excluir</button>
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