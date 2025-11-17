// pages/index.tsx
import { PrismaClient } from '@prisma/client';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import WhatsAppButton from '../../components/WhatsAppButton';
import { Menu as MenuComponent } from 'components/Menu';
import { Analytics } from "@vercel/analytics/next";
import {
    HomePageProps,
    ColecaoProps,
    MenuData,
    // Importa apenas LinkItem, não o tipo MenuProps da página
    LinkItem
} from '../../types/index';
import { useState } from 'react';
import { AiOutlineClose } from 'react-icons/ai';
import Footer from 'components/Footer';
import Cases from 'components/Cases';
import HeroSliderAreas from 'components/HeroSliderAreas';
import Blog from 'components/Blog';

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

const prisma = new PrismaClient();

export const getServerSideProps: GetServerSideProps<HomePageProps> = async () => {
    try {
        const [banners, menus, testimonials, faqs, colecoes] = await Promise.all([
            prisma.banner.findMany(),
            prisma.menu.findMany(),
            prisma.testimonial.findMany({ orderBy: { createdAt: 'desc' } }),
            prisma.fAQ.findMany({ orderBy: { pergunta: 'asc' } }),
            prisma.colecao.findMany({
                orderBy: {
                    order: 'asc',
                },
                include: {
                    items: {
                        orderBy: [
                            { view: 'desc' },
                            { like: 'desc' },
                        ],
                    },
                },
            }),
        ]);

        // 1. Mapeamento para remover 'null' e usar 'undefined'
        const mappedTestimonials = testimonials.map((t: any) => ({
            ...t,
            // Se t.avatarUrl for null, usamos undefined. Se for string, usamos a string.
            avatarUrl: t.avatarUrl ?? undefined, 
        }));
        
        const colecoesComSlugs: ColecaoProps[] = colecoes.map((colecao: any) => ({
            ...colecao,
            slug: slugify(colecao.title),
            items: colecao.items.map((item: any) => ({
                ...item,
                slug: slugify(`${item.productMark}-${item.productModel}-${item.cor}`),
            }))
        }));

        const rawMenu: any | null = menus.length > 0 ? menus[0] : null;

        // O tipo do formattedMenu agora corresponde à estrutura esperada
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

        return {
            props: {
                banners: JSON.parse(JSON.stringify(banners)),
                // Passa o objeto formatado diretamente para a prop 'menu'
                menu: JSON.parse(JSON.stringify(formattedMenu)),
                // 2. Passa os testimonials mapeados e serializados
                testimonials: JSON.parse(JSON.stringify(mappedTestimonials)),
                faqs: JSON.parse(JSON.stringify(faqs)),
                colecoes: JSON.parse(JSON.stringify(colecoesComSlugs)),
            },
        };
    } catch (error) {
        console.error("Erro ao buscar dados do banco de dados:", error);
        return {
            props: {
                banners: [],
                menu: null,
                testimonials: [],
                faqs: [],
                colecoes: [],
            },
        };
    } finally {
        await prisma.$disconnect();
    }
};

export default function PageBlog({ menu }: HomePageProps) {
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "LegalService", // Alterado de LocalBusiness para LegalService (ou Lawyer)
        "name": "Machado Advogados Associados",
        "image": "https://res.cloudinary.com/dpnexaukz/image/upload/v1761676888/dresses/zkpnvv4q8mmmoknbvhhc.png", // Manter ou alterar a URL da imagem se precisar
        "address": {
            "@type": "PostalAddress",
            "streetAddress": "Ed. Angra - Travessa São Pedro, 842, sala 301 - Batista Campos", // Endereço atualizado
            "addressLocality": "Belém",
            "addressRegion": "PA",
            "postalCode": "66030-465", // CEP de referência. Confirme o CEP correto para 2564.
            "addressCountry": "BR"
        },
        "url": "https://machadoeassociados.vercel.app/",
        "telephone": "+5591980354730", // Telefone atualizado
        "areaServed": [
            { "@type": "City", "name": "Belém" },
            { "@type": "State", "name": "Pará" }
        ],
        "priceRange": "$$", // Exemplo: indicando uma faixa de preço
        "sameAs": [
            "https://www.instagram.com/machadoadvassociados/", // Sugestão baseada em busca, verificar a URL exata
            // "https://www.linkedin.com/company/machadoadvogadosassociados"
        ],
        "description": "Escritório de advocacia em Belém, PA. Especializado em Direito do Consumidor, Direito Trabalhista e Assessoria Jurídica Empresarial."
    };

    const [showExitModal, setShowExitModal] = useState(false);

    return (
        <>
            <Head>
                {/* Título Otimizado para SEO de Advocacia */}
                <title>Machado Advogados | Direito do Consumidor, Trabalhista e Empresarial em Belém-PA</title>

                {/* Descrição Otimizada para SEO de Advocacia */}
                <meta name="description" content="Machado Advogados Associados: Soluções jurídicas completas e personalizadas para proteger seus direitos. Especialistas em Direito do Consumidor, Trabalhista e Assessoria Empresarial. Atendimento em Belém/PA e online." />

                {/* Keywords Otimizadas para Advocacia */}
                <meta name="keywords" content="Machado Advogados, escritório de advocacia Belém, advogado em Belém PA, direito do consumidor, advogado trabalhista, assessoria jurídica empresarial, cobranças indevidas, rescisão de contrato, proteção de direitos" />

                {/* Metas para Redes Sociais (Open Graph) */}
                <meta property="og:title" content="Machado Advogados Associados | Compromisso com Seus Direitos" />
                <meta property="og:description" content="Da escuta ao resultado, oferecemos soluções jurídicas completas e personalizadas. Transparência, experiência e relacionamento próximo para sua segurança jurídica." />
                <meta property="og:image" content="https://res.cloudinary.com/dpnexaukz/image/upload/v1761676888/dresses/zkpnvv4q8mmmoknbvhhc.png" /> {/* Use o logo ou uma imagem institucional relevante */}
                <meta property="og:url" content="https://machadoeassociados.vercel.app/" />
                <meta property="og:type" content="website" />

                {/* Metas para Twitter */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content="Machado Advogados Associados" />
                <meta name="twitter:description" content="Especialistas em Direito do Consumidor, Trabalhista e Empresarial. Atendimento humanizado e focado em resultados." />
                <meta name="twitter:image" content="https://res.cloudinary.com/dpnexaukz/image/upload/v1761676888/dresses/zkpnvv4q8mmmoknbvhhc.png" /> {/* Use o logo ou uma imagem institucional relevante */}

                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
                <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600;700&display=swap" rel="stylesheet" />
            </Head>

            <div className="min-h-screen">
                <Analytics />
                {/* O componente espera menuData={...}, e a prop 'menu' já tem essa estrutura */}
                <MenuComponent menuData={menu} />
                <main className="max-w-full mx-auto">
                    <Blog />
                    <Footer menuData={menu} />
                </main>
                <WhatsAppButton />
            </div>

            {/* Modal de Saída */}
            {showExitModal && (
                <div
                    className="fixed inset-0 z-[110] flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) {
                            setShowExitModal(false);
                        }
                    }}
                >
                    <div
                        className="bg-primary-dark relative rounded-lg shadow-xl p-6 m-4 max-w-lg w-full transform transition-all duration-300 scale-100"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Botão de fechar */}
                        <button
                            onClick={() => setShowExitModal(false)}
                            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition-colors"
                            aria-label="Fechar"
                        >
                            <AiOutlineClose size={24} />
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}