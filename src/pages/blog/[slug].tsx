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

/* ============================
   Interfaces
============================ */

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
    content: string;
    author: string;
    createdAt: string;
    updatedAt: string;
    slug: string;
    items: BlogFoto[];
    publico: boolean;
    subtitle: string | null;
    description: string | null;
}

interface BlogPageProps {
    post: BlogPostProps | null;
    menu: MenuData | null;
}

/* ============================
   Helpers
============================ */

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

/* ============================
   GSSP
============================ */

export const getServerSideProps: GetServerSideProps<BlogPageProps> = async (context) => {
    const { slug } = context.query;
    const postSlug = Array.isArray(slug) ? slug[0] : slug;

    if (!postSlug) return { notFound: true };

    try {
        const post = await prisma.blog.findUnique({
            where: { slug: postSlug },
            include: { items: true },
        });

        if (!post || !post.publico) return { notFound: true };

        const menus = await prisma.menu.findMany();
        const rawMenu: any = menus[0] || null;

        const formattedMenu: MenuData | null = rawMenu
            ? {
                  logoUrl: rawMenu.logoUrl || '/images/logo.png',
                  links: rawMenu.links?.map((link: any) => ({
                      id: link.id,
                      text: link.text,
                      url: link.url,
                  })),
              }
            : null;

        const formattedPost: BlogPostProps = {
            id: post.id,
            title: post.title,
            content: post.description || '',
            author: (post as any).author || 'Machado Advogados',
            slug: post.slug || post.id,
            publico: post.publico,
            subtitle: post.subtitle,
            description: post.description,
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
        console.error(error);
        return { notFound: true };
    } finally {
        await prisma.$disconnect();
    }
};

/* ============================
   Página
============================ */

export default function BlogPage({ post, menu }: BlogPageProps) {
    if (!post) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <h1 className="text-2xl font-bold">404 - Artigo não encontrado</h1>
            </div>
        );
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const canonicalUrl = `${baseUrl}/blog/${post.slug}`;

    const coverImage = post.items[0]?.img || '/images/blog-default-cover.jpg';
    const ogImage = coverImage.startsWith('http')
        ? coverImage
        : `${baseUrl}${coverImage}`;

    const ogDescription =
        post.subtitle ||
        post.description ||
        post.title;

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': canonicalUrl,
        },
        headline: post.title,
        image: ogImage,
        datePublished: post.createdAt,
        dateModified: post.updatedAt,
        author: {
            '@type': 'Person',
            name: post.author,
        },
        publisher: {
            '@type': 'Organization',
            name: 'Machado Advogados Associados',
            logo: {
                '@type': 'ImageObject',
                url: menu?.logoUrl || `${baseUrl}/images/logo.png`,
            },
        },
        description: ogDescription,
    };

    return (
        <>
            <Head>
                <title>{post.title} | Machado Advogados</title>

                {/* SEO */}
                <meta name="description" content={ogDescription} />
                <link rel="canonical" href={canonicalUrl} />

                {/* Open Graph */}
                <meta property="og:title" content={post.title} />
                <meta property="og:description" content={ogDescription} />
                <meta property="og:image" content={ogImage} />
                <meta property="og:url" content={canonicalUrl} />
                <meta property="og:type" content="article" />

                {/* Twitter */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={post.title} />
                <meta name="twitter:description" content={ogDescription} />
                <meta name="twitter:image" content={ogImage} />

                {/* Schema */}
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
                />

                {/* Fonts */}
                <link
                    href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
                    rel="stylesheet"
                />
                <link
                    href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600;700&display=swap"
                    rel="stylesheet"
                />
            </Head>

            <div className="min-h-screen bg-white">
                <Analytics />
                <MenuComponent menuData={menu} />

                <main>
                    {/* Capa */}
                    <div className="relative w-full h-[300px] md:h-[400px]">
                        <Image
                            src={ogImage}
                            alt={post.title}
                            fill
                            priority
                            className="object-cover"
                        />
                        <div className="absolute inset-0 bg-black/60 flex items-end">
                            <div className="max-w-4xl mx-auto px-6 pb-10 w-full">
                                <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 font-display">
                                    {post.title}
                                </h1>

                                {post.subtitle && (
                                    <p className="text-lg text-gray-200 mb-4">
                                        {post.subtitle}
                                    </p>
                                )}

                                <div className="flex gap-6 text-sm text-gray-300">
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

                    {/* Conteúdo */}
                    <article className="max-w-4xl mx-auto px-6 py-12">
                        <div
                            className="prose prose-lg max-w-none"
                            dangerouslySetInnerHTML={{ __html: post.content }}
                        />
                    </article>
                </main>

                <Footer menuData={menu} />
                <WhatsAppButton />
            </div>
        </>
    );
}
