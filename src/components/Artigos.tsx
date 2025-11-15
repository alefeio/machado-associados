// components/Artigos.tsx
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router'; 
import { richTextToHtml } from 'utils/richTextToHtml'; 

// Definições de tipo adaptadas para Blog/BlogFoto
interface BlogFoto {
    id: string;
    detalhes: string; // Descrição ou legenda da imagem
    img: string; // URL da imagem
}

// 🎯 MUDANÇA 1: Adicionar 'slug' à interface BlogItem
interface BlogItem {
    id: string;
    title: string;
    subtitle: string;
    description: string;
    order: number;
    publico: boolean;
    items: BlogFoto[]; 
    slug: string; // <-- O slug AGORA é necessário para a navegação
}

// O componente Artigos NÃO receberá props (posts)
const Artigos: React.FC = () => {
    const [posts, setPosts] = useState<BlogItem[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter(); 
    
    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        setLoading(true);
        try {
            // Chamada para o endpoint público do blog
            const res = await fetch("/api/crud/blog", { method: "GET" });
            const data = await res.json();
            if (res.ok && data.success) {
                // Filtra posts públicos e assume que eles já vêm com o slug da API
                const publicPosts = data.posts.filter((p: BlogItem) => p.publico);
                setPosts(publicPosts.sort((a: BlogItem, b: BlogItem) => a.order - b.order));
            } else {
                console.error("Erro ao carregar posts:", data.message);
            }
        } catch (e) {
            console.error("Erro ao conectar com a API do blog.", e);
        } finally {
            setLoading(false);
        }
    };

    /**
     * Função para navegar para a página de post dedicada.
     * 🎯 MUDANÇA 2: Usamos o slug do post, que é a nova rota dinâmica (/blog/[slug]).
     */
    const navigateToPost = (postSlug: string) => { // Aceita o slug
        router.push(`/blog/${postSlug}`); // Navega usando o slug
    };

    // --- Renderização ---

    return (
        <>
            <div className="pt-12 pb-48"> 
                <div className="container mx-auto px-4 md:px-8">

                    {loading ? (
                        <p className="text-center text-gray-600 text-xl py-10">Carregando posts...</p>
                    ) : (posts.length === 0 ? (
                        <p className="text-center text-gray-600 text-xl py-10">Nenhum post publicado no momento.</p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {posts.map((post) => (
                                <div
                                    key={post.id}
                                    className="bg-[#0c1a25] rounded-xl shadow-lg overflow-hidden transform transition-transform hover:scale-[1.02] hover:shadow-xl duration-300 cursor-pointer" 
                                    // 🎯 MUDANÇA 3: Ação de clique usa o post.slug
                                    onClick={() => navigateToPost(post.slug)} 
                                >
                                    <div className="relative h-60 w-full">
                                        {post.items.length > 0 ? (
                                            <Image
                                                src={post.items[0].img} 
                                                alt={post.title}
                                                fill
                                                sizes="(max-width: 768px) 100vw, 33vw"
                                                style={{ objectFit: "cover" }}
                                                className="rounded-t-xl transition-transform duration-500 hover:scale-110"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500 rounded-t-xl">
                                                [Imagem de Post]
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-6">
                                        <h3 className="text-xl md:text-2xl font-bold mb-2 text-[#ba9a71] line-clamp-2"> 
                                            {post.title}
                                        </h3>
                                        <p className="text-white text-base leading-relaxed mb-4 line-clamp-3"> 
                                            {post.subtitle}
                                        </p>
                                        <button
                                            className="inline-flex items-center px-4 py-2 bg-[#203354] text-white font-semibold rounded-full shadow-md hover:bg-[#2f3f5b] transition-colors duration-300"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                // 🎯 MUDANÇA 4: Clique no botão usa post.slug
                                                navigateToPost(post.slug); 
                                            }}
                                        >
                                            Ler artigo <span className="ml-2" aria-hidden="true">&rarr;</span>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
};

export default Artigos;