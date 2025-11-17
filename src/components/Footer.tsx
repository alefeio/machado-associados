import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { FaWhatsapp, FaInstagram, FaMapMarkerAlt, FaCalendarAlt } from "react-icons/fa";
// Importamos MdEmail (do seu código anterior) para o ícone de e-mail
import { MdEmail } from "react-icons/md";

interface LinkItem {
    id: string;
    text: string;
    url: string;
    target?: string;
}

interface MenuProps {
    menuData: {
        logoUrl: string;
        links: LinkItem[];
    } | null;
}

// --- Interfaces e Tipos ---

interface LinkItem {
    id: string;
    text: string;
    url: string;
    target?: string;
}

interface BlogFoto {
    id: string;
    detalhes: string;
    img: string;
}

// Interface adaptada para os dados que o Footer precisa (Adicionei 'slug' para o link)
interface BlogPost {
    id: string;
    title: string;
    slug: string; // Adicionado para o link
    order: number;
    publico: boolean;
    createdAt: string;
    items: BlogFoto[];
}

interface MenuProps {
    menuData: {
        logoUrl: string;
        links: LinkItem[];
    } | null;
}

// FUNÇÃO HELPER: Formata a data para o formato brasileiro
const formatDate = (dateString: string) => {
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    } catch (e) {
        return "Data Desconhecida";
    }
};

// Dados de Fallback (para caso não haja posts ou a API falhe)
const fallbackPosts: BlogPost[] = [
    {
        id: "fb1",
        title: "Problemas com voo? Saiba como a justiça pode te ajudar",
        slug: "#",
        order: 1,
        publico: true,
        createdAt: new Date().toISOString(),
        items: [{ id: "i1", detalhes: "Post de Voo", img: "/images/blog-default-1.jpg" }]
    },
];

const Footer = ({ menuData }: MenuProps) => {
    // Garantir que menuData não é nulo antes de desestruturar
    const logoUrl = menuData?.logoUrl;
    // Embora os links de navegação não apareçam na imagem, mantemos a prop.
    // const links = menuData?.links || []; 

    // ESTADOS PARA BUSCA DE DADOS
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);

    // LÓGICA DE BUSCA DE DADOS
    useEffect(() => {
        const fetchPosts = async () => {
            setLoading(true);
            try {
                const res = await fetch("/api/crud/blog", { method: "GET" });
                const data = await res.json();
                if (res.ok && data.success) {
                    const publicPosts = data.posts.filter((p: BlogPost) => p.publico);
                    // Ordena por 'order' e pega os 3 primeiros
                    const sortedPosts = publicPosts
                        .sort((a: BlogPost, b: BlogPost) => a.order - b.order)
                        .slice(0, 3);
                    setPosts(sortedPosts);
                } else {
                    console.error("Erro ao carregar posts:", data.message);
                    // Em caso de erro, usa um post de fallback
                    setPosts(fallbackPosts);
                }
            } catch (e) {
                console.error("Erro ao conectar com a API do blog. Usando fallback.", e);
                setPosts(fallbackPosts);
            } finally {
                setLoading(false);
            }
        };
        fetchPosts();
    }, []);

    return (
        // Fundo escuro conforme a imagem: #0c1a25
        <footer className="bg-[#0c1a25] text-gray-300 py-12 md:py-24">
            <div className="max-w-7xl mx-auto px-4 md:px-8">

                {/* GRID PRINCIPAL (4 COLUNAS NO DESKTOP) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 md:gap-8">

                    {/* COLUNA 1: LOGO E DESCRIÇÃO */}
                    <div className="flex flex-col items-start space-y-4">
                        <div className="mb-2">
                            {/* O componente Image do Next.js precisa da URL do logo. 
                                Você deve garantir que 'logoUrl' seja a imagem do logo MACHADO em branco/dourado. */}
                            <Image
                                src={logoUrl || "/images/machado-advogados-logo.png"} // Substitua pelo caminho do logo correto
                                alt="Machado Advogados Associados"
                                width={180}
                                height={35}
                                className="h-auto"
                            />
                        </div>

                        {/* Texto descritivo (Slogan da Home) */}
                        <p className="text-sm text-gray-400 max-w-xs">
                            Ajudamos pessoas a identificarem e resolverem seus problemas, fazendo com que sua experiência seja cada vez mais segura através de uma abordagem eficiente e próxima.
                        </p>

                        {/* Direitos Autorais na Coluna 1 (como na imagem) */}
                        <p className="text-xs text-gray-500 mt-4 pt-4">
                            © 2024 Todos os direitos reservados.
                        </p>
                    </div>

                    {/* COLUNA 2: CONTATO E ÍCONES */}
                    <div className="flex flex-col items-start">
                        <h4 className="text-[#bc9e77] text-lg font-bold mb-4">
                            Contato
                        </h4>

                        {/* Subtítulo */}
                        <p className="text-sm text-gray-400 mb-4">
                            Entre em contato conosco através de um dos meios abaixo:
                        </p>

                        <div className="space-y-3">
                            {/* Instagram */}
                            <a
                                href="https://www.instagram.com/machadoadvassociados"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center text-white hover:text-[#bc9e77] transition-colors text-sm"
                            >
                                <FaInstagram size={16} className="text-[#bc9e77] mr-3 flex-shrink-0" />
                                @machadoadvassociados
                            </a>

                            {/* WhatsApp */}
                            <a
                                href="https://wa.me/5591980354730"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center text-white hover:text-[#bc9e77] transition-colors text-sm"
                            >
                                <FaWhatsapp size={16} className="text-[#bc9e77] mr-3 flex-shrink-0" />
                                +55 91 98035 4730
                            </a>

                            {/* Email */}
                            <a
                                href="mailto:escritório@machadoeassociados.adv.br"
                                className="flex items-center text-white hover:text-[#bc9e77] transition-colors text-sm"
                            >
                                <MdEmail size={16} className="text-[#bc9e77] mr-3 flex-shrink-0" />
                                escritório@machadoeassociados.adv.br
                            </a>
                        </div>
                    </div>

                    {/* COLUNA 3: ÚLTIMOS POSTS (AGORA DINÂMICO) */}
                    <div className="flex flex-col items-start">
                        <h4 className="text-[#bc9e77] text-lg font-bold mb-4">
                            Últimos Posts
                        </h4>

                        {/* Renderização dinâmica dos posts */}
                        {loading ? (
                            <p className="text-sm text-gray-500">Carregando posts...</p>
                        ) : (
                            <div className="space-y-6">
                                {posts.map((post) => (
                                    <Link
                                        key={post.id}
                                        // O link deve apontar para o slug do post
                                        href={`/blog/${post.slug || post.id}`}
                                        className="flex items-start space-x-3 group"
                                    >
                                        {/* Imagem do Post: Pegando a primeira imagem ou um fallback */}
                                        <div className="relative w-[50px] h-[50px] flex-shrink-0 rounded overflow-hidden">
                                            <Image
                                                src={post.items[0]?.img || "/images/blog-default-thumb.jpg"}
                                                alt={`Miniatura: ${post.title}`}
                                                width={50}
                                                height={50}
                                                className="object-cover"
                                            />
                                        </div>

                                        <div className="flex flex-col">
                                            <span className="text-white text-sm group-hover:text-[#bc9e77] transition-colors leading-tight line-clamp-2">
                                                {post.title}
                                            </span>
                                            <span className="text-gray-500 text-xs mt-1 flex items-center">
                                                <FaCalendarAlt size={10} className="mr-1 opacity-70" />
                                                {formatDate(post.createdAt)}
                                            </span>
                                        </div>
                                    </Link>
                                ))}
                                {/* Mensagem se não houver posts */}
                                {posts.length === 0 && <p className="text-sm text-gray-500">Nenhum post encontrado.</p>}
                            </div>
                        )}
                    </div>

                    {/* COLUNA 4: ENDEREÇO */}
                    <div className="flex flex-col items-start">
                        <h4 className="text-[#bc9e77] text-lg font-bold mb-4">
                            Endereço
                        </h4>

                        <div className="flex items-start mb-4">
                            <FaMapMarkerAlt size={20} className="text-[#bc9e77] mr-3 mt-1 flex-shrink-0" />
                            <p className="text-white text-sm">
                                Ed. Angra dos reis<br />
                                Tv. São Pedro, 842, sala 301<br />
                                Batista Campos - Belém/PA
                            </p>
                        </div>

                        {/* Linha Divisória abaixo do endereço (como na imagem) */}
                        <div className="w-20 border-t border-[#bc9e77] mt-2"></div>
                    </div>
                </div>
            </div>
            {/* O PromotionsForm foi mantido como comentário no código original */}
            {/* <PromotionsForm /> */}
        </footer>
    );
};

export default Footer;