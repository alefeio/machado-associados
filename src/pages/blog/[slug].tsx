// pages/blog/[slug].tsx

import { PrismaClient } from '@prisma/client';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import { Menu as MenuComponent } from 'components/Menu';
import Footer from 'components/Footer';
import WhatsAppButton from 'components/WhatsAppButton'; 
import { MenuData, LinkItem } from '../../types/index'; 
import { FaCalendarAlt, FaUserCircle } from 'react-icons/fa';
import { Analytics } from '@vercel/analytics/next';

const prisma = new PrismaClient();

// --- Interfaces Específicas para a Página do Post ---

interface BlogFoto {
    id: string;
    detalhes: string | null; 
    img: string;
    createdAt: string; 
    updatedAt: string;
}

interface BlogPostProps {
    id: string;
    title: string;
    // content mapeia para description do Prisma (o Rich Text Editor salva aqui)
    content: string; 
    author: string; 
    createdAt: string; 
    slug: string; 
    items: BlogFoto[];
    publico: boolean;
    subtitle: string | null; 
    description: string | null;
    updatedAt: string;
}

interface BlogPageProps {
    post: BlogPostProps | null;
    menu: MenuData | null;
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


// --- GET SERVER SIDE PROPS ---

export const getServerSideProps: GetServerSideProps<BlogPageProps> = async (context) => {
    // 🎯 CORREÇÃO: Usamos 'slug' pois o nome do arquivo agora é [slug].tsx
    const { slug } = context.query;
    const postSlug = Array.isArray(slug) ? slug[0] : slug;

    if (!postSlug || typeof postSlug !== 'string') {
        return { notFound: true };
    }

    try {
        // A busca no Prisma é feita pelo campo 'slug' com o valor da URL
        const post = await prisma.blog.findUnique({
            where: {
                slug: postSlug, 
            },
            include: {
                items: true,
            }
        });

        if (!post) {
            console.warn(`[DEBUG GSSP] Post com slug ${postSlug} não foi encontrado no banco de dados.`);
            return { notFound: true };
        }
        
        // Impede que rascunhos sejam acessados
        if (!post.publico) {
            console.warn(`[DEBUG GSSP] Post encontrado, mas 'publico' é ${post.publico}. Retornando 404.`);
            return { notFound: true };
        }

        // --- Lógica para buscar o Menu ---
        const menus = await prisma.menu.findMany();
        const rawMenu: any | null = menus.length > 0 ? menus[0] : null;
        let formattedMenu: MenuData | null = null;
        
        if (rawMenu && rawMenu.links && Array.isArray(rawMenu.links)) {
            const links: LinkItem[] = rawMenu.links.map((link: any) => ({
                id: link.id,
                text: link.text,
                url: link.url,
            }));

            formattedMenu = {
                logoUrl: rawMenu.logoUrl || '/images/logo.png',
                links: links,
            };
        }

        // Mapeia o post, garantindo que as datas sejam strings ISO
        const formattedPost: BlogPostProps = {
            id: post.id,
            title: post.title,
            // 'content' é o campo que o componente usa para exibir o HTML do RichTextEditor
            content: post.description || "Conteúdo indisponível.", 
            author: (post as any).author || "Machado Advogados", 
            slug: post.slug || post.id, 
            publico: post.publico,
            subtitle: post.subtitle,
            description: post.description,
            createdAt: post.createdAt.toISOString(),
            updatedAt: post.updatedAt.toISOString(),

            // Mapeamento dos itens
            items: post.items.map(item => ({
                id: item.id,
                detalhes: item.detalhes, 
                img: item.img,
                createdAt: item.createdAt.toISOString(),
                updatedAt: item.updatedAt.toISOString(),
            })),
        };

        return {
            props: {
                // Serialização de datas e objetos para passar entre o servidor e o cliente
                post: JSON.parse(JSON.stringify(formattedPost)),
                menu: JSON.parse(JSON.stringify(formattedMenu)),
            },
        };
    } catch (error) {
        console.error(`[DEBUG GSSP] ERRO FATAL ao buscar post (Slug: ${postSlug}):`, error);
        return {
            notFound: true,
        };
    } finally {
        await prisma.$disconnect();
    }
};

// --- COMPONENTE DA PÁGINA ---

export default function BlogPage({ post, menu }: BlogPageProps) {
    if (!post) {
        return <div className="min-h-screen flex items-center justify-center">
            <h1 className="text-2xl font-bold text-gray-800">404 - Artigo não encontrado</h1>
        </div>;
    }

    const canonicalUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/blog/${post.slug}`;
    const coverImage = post.items[0]?.img || '/images/blog-default-cover.jpg';
    
    // JSON-LD para SEO (Schema Markup)
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": canonicalUrl
        },
        "headline": post.title,
        "image": {
            "@type": "ImageObject",
            "url": coverImage,
        },
        "datePublished": post.createdAt,
        "dateModified": post.updatedAt,
        "author": {
            "@type": "Person", 
            "name": post.author,
        },
        "publisher": {
            "@type": "Organization",
            "name": "Machado Advogados Associados",
            "logo": {
                "@type": "ImageObject",
                "url": menu?.logoUrl || "/images/logo.png",
            }
        },
        // Usando o título como descrição padrão para SEO (pode ser melhorado com post.subtitle ou summary)
        "description": post.title, 
    };


    return (
        <>
            <Head>
                <title>{post.title} | Machado Advogados</title>
                <meta name="description" content={post.title} /> 
                <link rel="canonical" href={canonicalUrl} /> 
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
                />

                <meta property="og:title" content={post.title} />
                <meta property="og:description" content={post.title} /> 
                <meta property="og:image" content={coverImage} /> 
                <meta property="og:url" content={canonicalUrl} />
                <meta property="og:type" content="article" />
                
                {/* Fontes */}
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
                <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600;700&display=swap" rel="stylesheet" />

            </Head>

            <div className="min-h-screen bg-white">
                <Analytics />
                <MenuComponent menuData={menu} />
                
                <main className="max-w-full mx-auto pb-16">
                    {/* Imagem de Capa e Cabeçalho */}
                    <div className="relative w-full h-[300px] md:h-[400px] bg-gray-100 overflow-hidden">
                        <Image
                            src={coverImage}
                            alt={post.title}
                            layout="fill"
                            objectFit="cover"
                            priority
                            className="opacity-90"
                        />
                            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-end">
                                    <div className="max-w-4xl mx-auto px-4 md:px-8 py-8 w-full">
                                        <h1 className="text-3xl md:text-5xl font-extrabold text-white leading-tight font-display mb-3">
                                            {post.title}
                                        </h1>
                                        <div className="flex items-center space-x-4 text-sm text-gray-200">
                                            <span className="flex items-center">
                                                <FaUserCircle className="mr-2 text-[#bc9e77]" />
                                                {post.author}
                                            </span>
                                            <span className="flex items-center">
                                                <FaCalendarAlt className="mr-2 text-[#bc9e77]" />
                                                {formatDate(post.createdAt)}
                                            </span>
                                        </div>
                                    </div>
                            </div>
                    </div>
                    
                    {/* Conteúdo do Artigo */}
                    <article className="max-w-4xl mx-auto px-4 md:px-8 py-12">
                        <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
                            {/* Renderiza o HTML do Rich Text Editor */}
                            <div dangerouslySetInnerHTML={{ __html: post.content }} />
                        </div>
                    </article>

                </main>
                
                <Footer menuData={menu} />
                <WhatsAppButton />
            </div>
        </>
    );
}