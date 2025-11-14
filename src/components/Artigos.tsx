import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router'; // Importação do roteador
import { richTextToHtml } from 'utils/richTextToHtml'; // Função de conversão de Rich Text
// Componentes de Modal/Slider removidos, pois não são mais necessários
// import { AiOutlineClose } from 'react-icons/ai'; 
// import { MdOutlineArrowBackIos, MdOutlineArrowForwardIos } from "react-icons/md";
// import ZoomableImage from './ZoomableImage'; 

// Definições de tipo adaptadas para Blog/BlogFoto
interface BlogFoto {
    id: string;
    detalhes: string; // Descrição ou legenda da imagem
    img: string; // URL da imagem
}

// Assumindo que o campo 'slug' será utilizado para URLs mais amigáveis
interface BlogItem {
    id: string;
    title: string;
    subtitle: string;
    description: string;
    order: number;
    publico: boolean;
    items: BlogFoto[]; // As imagens relacionadas ao post
    // Se o seu modelo Blog tiver slug, adicione aqui:
    // slug?: string; 
}

const Artigos: React.FC = () => {
    const [posts, setPosts] = useState<BlogItem[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter(); // Inicializa o roteador
    
    // --- FUNÇÕES DE MODAL REMOVIDAS ---
    // [showModal, setShowModal] = useState(false);
    // [selectedPost, setSelectedPost] = useState<BlogItem | null>(null);
    // [currentImageIndex, setCurrentImageIndex] = useState(0);
    // openModal, closeModal, handleNextImage, handlePrevImage REMOVIDAS

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
     * Usamos o ID do post, que é a rota dinâmica (/blog/[id]).
     */
    const navigateToPost = (postId: string) => {
        router.push(`/blog/${postId}`);
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
                                    // Ação de clique agora navega para a página
                                    onClick={() => navigateToPost(post.id)}
                                >
                                    <div className="relative h-60 w-full">
                                        {post.items.length > 0 ? (
                                            <Image
                                                src={post.items[0].img} // Mostra a primeira foto como capa
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
                                            // Previne que o clique no botão dispare a navegação duas vezes
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                navigateToPost(post.id);
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

            {/* O Modal do Post (Artigo Completo) FOI REMOVIDO */}
        </>
    );
};

export default Artigos;