import { PrismaClient } from '@prisma/client';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import { Menu as MenuComponent } from 'components/Menu';
import Footer from 'components/Footer';
import WhatsAppButton from 'components/WhatsAppButton';
import { MenuData, LinkItem } from '../../types';
import { FaCalendarAlt, FaUserCircle } from 'react-icons/fa';
import { Analytics } from '@vercel/analytics/next';

const prisma = new PrismaClient();

/* -------------------------------------------------------------------------- */
/*                                   TIPOS                                    */
/* -------------------------------------------------------------------------- */

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
    subtitle: string | null;
    description: string | null;
    content: string;
    author: string;
    slug: string;
    publico: boolean;
    createdAt: string;
    updatedAt: string;
    items: BlogFoto[];
}

interface BlogPageProps {
    post: BlogPostProps | null;
    menu: MenuData | null;
}

/* -------------------------------------------------------------------------- */
/*                              FUNÇÕES AUXILIARES                             */
/* -------------------------------------------------------------------------- */

const formatDate = (dateString: string) => {
    try {
        return new Date(dateString).toLocaleDateString('pt-BR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
    } catch {
        return 'Data desconhecida';
    }
};

/* -------------------------------------------------------------------------- */
/*                             GET SERVER SIDE PROPS                           */
/* -------------------------------------------------------------------------- */

export const getServerSideProps: GetServerSideProps<BlogPageProps> = async (context) => {
    const { slug } = context.query;
    const postSlug = Array.isArray(slug) ? slug[0] : slug;

    if (!postSlug || typeof postSlug !== 'string') {
        return { notFound: true };
    }

    try {
        const post = await prisma.blog.findUnique({
            where: { slug: postSlug },
            include: { items: true },
        });

        if (!post || !post.publico) {
            return { notFound: true };
        }

        const menus = await prisma.menu.findMany();
        const rawMenu: any = menus.length ? menus[0] : null;

        let formattedMenu: MenuData | null = null;

        if (rawMenu?.links?.length) {
            const links: LinkItem[] = rawMenu.links.map((link: any) => ({
                id: link.id,
                text: link.text,
                url: link.url,
            }));

            formattedMenu = {
                logoUrl: rawMenu.logoUrl || '/images/logo.png',
                links,
            };
        }

        const formattedPost: BlogPostProps = {
            id: post.id,
            title: post.title,
            subtitle: post.subtitle,
            description: post.description,
            content: post.description || '',
            author: post.author,
            slug: post.slug!,
            publico: post.publico,
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
        console.error('[BLOG SSR ERROR]', error);
        return { notFound: true };
    } finally {
        await prisma.$disconnect();
    }
};

/* -------------------------------------------------------------------------- */
/*                                   PÁGINA                                   */
/* -------------------------------------------------------------------------- */

export default function BlogPage({ post, menu }: BlogPageProps) {
    if (!post) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <h1 className="text-2xl font-bold">404 - Artigo não encontrado</h1>
            </div>
        );
    }

    const baseUrl =
        process.env.NEXT_PUBLIC_BASE_URL ||
        'https://www.machadoeassociados.adv.br';

    const canonicalUrl = `${baseUrl}/blog/${post.slug}`;

    // 🔥 IMAGEM DINÂMICA PARA WHATSAPP (SSR)
    const ogImage = `${baseUrl}/api/og/blog-image?slug=${post.slug}`;

    const ogDescription =
        post.subtitle ||
        post.description ||
        post.title;

    /* ------------------------------ JSON-LD -------------------------------- */

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": canonicalUrl
        },
        "headline": post.title,
        "image": ogImage,
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
                "url": `${baseUrl}${menu?.logoUrl || '/images/logo.png'}`,
            }
        },
        "description": ogDescription
    };

    return (
        <>
            <Head>
                <title>{post.title} | Machado Advogados</title>
                <meta name="description" content={ogDescription} />
                <link rel="canonical" href={canonicalUrl} />

                {/* Open Graph (WhatsApp / Facebook) */}
                <meta property="og:title" content={post.title} />
                <meta property="og:description" content={ogDescription} />
                <meta property="og:image" content={ogImage} />
                <meta property="og:image:secure_url" content={ogImage} />
                <meta property="og:image:type" content="image/jpeg" />
                <meta property="og:image:width" content="1200" />
                <meta property="og:image:height" content="630" />
                <meta property="og:url" content={canonicalUrl} />
                <meta property="og:type" content="article" />

                {/* Twitter */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={post.title} />
                <meta name="twitter:description" content={ogDescription} />
                <meta name="twitter:image" content={ogImage} />

                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
                />
            </Head>

            <div className="min-h-screen bg-white">
                <Analytics />
                <MenuComponent menuData={menu} />

                {/* HEADER COM IMAGEM VISUAL (SITE) */}
                <div className="relative w-full h-[320px] md:h-[420px]">
                    <Image
                        src={post.items[0]?.img}
                        alt={post.title}
                        fill
                        priority
                        className="object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 flex items-end">
                        <div className="max-w-4xl mx-auto px-6 pb-10 text-white">
                            <h1 className="text-3xl md:text-5xl font-extrabold mb-3">
                                {post.title}
                            </h1>

                            {post.subtitle && (
                                <p className="text-lg md:text-xl text-gray-200 mb-4">
                                    {post.subtitle}
                                </p>
                            )}

                            <div className="flex items-center gap-6 text-sm">
                                <span className="flex items-center gap-2">
                                    <FaUserCircle className="text-[#bc9e77]" />
                                    {post.author}
                                </span>
                                <span className="flex items-center gap-2">
                                    <FaCalendarAlt className="text-[#bc9e77]" />
                                    {formatDate(post.createdAt)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* CONTEÚDO */}
                <article className="max-w-4xl mx-auto px-6 py-14">
                    <div
                        className="prose prose-lg max-w-none text-gray-700"
                        dangerouslySetInnerHTML={{ __html: post.content }}
                    />
                </article>

                <Footer menuData={menu} />
                <WhatsAppButton />
            </div>
        </>
    );
}
