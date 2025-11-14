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
    detalhes: string;
    img: string;
    createdAt: string; 
    updatedAt: string;
}

interface BlogPostProps {
    id: string;
    title: string;
    // content não existe no model, usamos para o HTML final
    content: string; 
    // author não existe no model, é um campo 'fake'
    author: string; 
    createdAt: string; 
    // ATENÇÃO: Slug é gerado a partir do título, não vem do DB
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

// FUNÇÃO SLUGIFY 
function slugify(text: string): string {
    return text.toString().toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]+/g, '')
        .replace(/--+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');
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


// --- GET SERVER SIDE PROPS CORRIGIDO ---

export const getServerSideProps: GetServerSideProps<BlogPageProps> = async (context) => {
    const { id } = context.query;
    const postId = Array.isArray(id) ? id[0] : id;

    if (!postId || typeof postId !== 'string') {
        return { notFound: true };
    }

    try {
        const post = await prisma.blog.findUnique({
            where: {
                id: postId,
            },
            include: {
                items: true,
            }
        });

        if (!post) {
            console.warn(`[DEBUG GSSP] Post com ID ${postId} não foi encontrado no banco de dados.`);
            return { notFound: true };
        }
        
        console.log(`[DEBUG GSSP] Post encontrado! Título: "${post.title}". Valor de 'publico' retornado: ${post.publico}`);
        
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

        // Mapeia o post, convertendo datas e removendo o acesso a 'post.slug'
        const formattedPost: BlogPostProps = {
            id: post.id,
            title: post.title,
            content: (post as any).content || post.description || "Conteúdo indisponível.", 
            author: (post as any).author || "Machado Advogados", 
            // CORREÇÃO: Gera o slug apenas a partir do título.
            slug: slugify(post.title), 
            
            publico: post.publico,
            subtitle: post.subtitle,
            description: post.description,
            // Conversão explícita de Date para string (Tipo esperado: string)
            createdAt: post.createdAt.toISOString(),
            updatedAt: post.updatedAt.toISOString(),

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
                post: JSON.parse(JSON.stringify(formattedPost)),
                menu: JSON.parse(JSON.stringify(formattedMenu)),
            },
        };
    } catch (error) {
        console.error(`[DEBUG GSSP] ERRO FATAL ao buscar post (ID: ${postId}):`, error);
        return {
            props: {
                post: null,
                menu: null,
            },
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

    // A URL canônica agora usa o slug gerado na prop: /blog/slug-do-post
    // Isso é melhor para SEO do que usar o ID direto, mesmo que a rota use o ID
    const canonicalUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/blog/${post.slug}`;
    const coverImage = post.items[0]?.img || '/images/blog-default-cover.jpg';
    
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
        "description": post.title, 
    };


    return (
        <>
            <Head>
                <title>{post.title} | Machado Advogados</title>
                <meta name="description" content={post.title} /> 
                {/* ATENÇÃO: Ajustamos a canonical URL para usar o slug */}
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
                
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
                <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600;700&display=swap" rel="stylesheet" />

            </Head>

            <div className="min-h-screen bg-white">
                <Analytics />
                <MenuComponent menuData={menu} />
                
                <main className="max-w-full mx-auto pb-16">
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
                    
                    <article className="max-w-4xl mx-auto px-4 md:px-8 py-12">
                        <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
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