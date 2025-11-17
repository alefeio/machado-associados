// pages/index.tsx
import { PrismaClient } from '@prisma/client';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import WhatsAppButton from '../components/WhatsAppButton';
import { Menu as MenuComponent } from 'components/Menu';
import { Analytics } from "@vercel/analytics/next";
import {
    HomePageProps,
    ColecaoProps,
    MenuData,
    // Importa apenas LinkItem, não o tipo MenuProps da página
    LinkItem
} from '../types/index';
import { useState } from 'react';
import { AiOutlineClose } from 'react-icons/ai';
import Footer from 'components/Footer';
import Cases from 'components/Cases';
import HeroSliderAreas from 'components/HeroSliderAreas';
import Blog from 'components/Blog';
import Contato from 'components/Contato';
import FAQ from 'components/FAQ';
import { FaInstagram, FaMapMarkerAlt, FaWhatsapp } from 'react-icons/fa';
import { MdEmail } from 'react-icons/md';

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

export default function PageContato({ menu, faqs }: HomePageProps) {
    // Endereço exato fornecido na imagem
    const address = "Ed. Angra dos reis, Travessa São Pedro, 842, sala 301 Batista Campos - Belém - PA";
    
    // O link abaixo é um exemplo de embed HTML que você pode obter do Google Maps
    // A latitude/longitude está aproximada para o centro de Belém, PA
    const mapEmbedUrl = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3988.59968470487!2d-48.48705352528751!3d-1.4552427985449557!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x92a488e36783856d%3A0x8e8e7b7f193c727d!2sTravessa%20S%C3%A3o%20Pedro%2C%20842%20-%20Batista%20Campos%2C%20Bel%C3%A9m%20-%20PA!5e0!3m2!1spt-BR!2sbr!4v1700000000000!5m2!1spt-BR!2sbr";

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
                    <Contato />
                    <FAQ faqs={faqs} />
                    <div className="bg-[#1a3044] py-16 md:py-24 relative overflow-hidden text-white"
                        style={{
                            // Estilo para simular o fundo da imagem, ajuste conforme necessário
                            backgroundImage: 'url(/images/bg-redes.jpg)',
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                        }}
                    >
                        <div className="max-w-7xl mx-auto px-4 md:px-8">
                            {/* GRID PARA ALINHAR Contato e Redes Sociais */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-8 text-center md:text-left">

                                {/* Contato */}
                                <div className="flex flex-col items-center md:items-end md:border-r md:border-gray-600/50 pr-12">
                                    <h3 className="text-[#bc9e77] text-xl md:text-2xl mb-6 tracking-wide">
                                        Contato
                                    </h3>
                                    <div className="space-y-4">
                                        {/* Email */}
                                        <a
                                            href="mailto:escritório@machadoeassociados.adv.br"
                                            className="flex items-center justify-center md:justify-end text-white text-base md:text-lg hover:text-[#bc9e77] transition-colors"
                                            aria-label="Enviar email para escritório@machadoeassociados.adv.br"
                                        >
                                            <MdEmail size={20} className="text-[#bc9e77] mr-2 flex-shrink-0" />
                                            escritório@machadoeassociados.adv.br
                                        </a>

                                        {/* WhatsApp */}
                                        <a
                                            href="https://wa.me/5591980354730"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center justify-center md:justify-end text-white text-base md:text-lg hover:text-[#bc9e77] transition-colors"
                                            aria-label="Enviar mensagem WhatsApp para +55 91 98035-4730"
                                        >
                                            <FaWhatsapp size={20} className="text-[#bc9e77] mr-2 flex-shrink-0" />
                                            +55 91 98035-4730
                                        </a>
                                    </div>
                                </div>

                                {/* Redes Sociais */}
                                <div className="flex flex-col items-center md:items-start md:pl-4">
                                    <h3 className="text-[#bc9e77] text-xl md:text-2xl mb-6 tracking-wide">
                                        Redes Sociais
                                    </h3>
                                    <div className="space-y-4">
                                        {/* Instagram */}
                                        <a
                                            href="https://www.instagram.com/machadoadvassociados"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center justify-center md:justify-start text-white text-base md:text-lg hover:text-[#bc9e77] transition-colors"
                                            aria-label="Acessar Instagram @machadoadvassociados"
                                        >
                                            <FaInstagram size={20} className="text-[#bc9e77] mr-2 flex-shrink-0" />
                                            @machadoadvassociados
                                        </a>

                                        {/* Espaço reservado para outra rede social (se necessário) */}
                                        {/* <a className="flex items-center text-white text-base md:text-lg">
                                <FaLinkedin size={20} className="text-[#bc9e77] mr-2" />
                                /MachadoAdvogados
                            </a> */}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <section className="bg-white py-20 md:py-24">
                        <div className="max-w-7xl mx-auto px-4 md:px-8 text-center">

                            {/* Ícone de Localização */}
                            <div className="flex justify-center mb-4">
                                {/* FaMapMarkerAlt simula o pino de localização */}
                                <FaMapMarkerAlt size={32} className="text-[#333] mb-2" />
                            </div>

                            {/* Título Principal */}
                            <h2 className="text-gray-800 text-3xl md:text-4xl font-bold mb-4">
                                Nossa Localização
                            </h2>

                            {/* Endereço */}
                            <p className="text-gray-600 text-lg mb-10">
                                {address}
                            </p>

                            {/* Container do Mapa */}
                            <div className="relative w-full max-w-4xl mx-auto shadow-xl rounded-3xl overflow-hidden border border-gray-200">
                                <div className="w-full" style={{ paddingBottom: '56.25%' }}> {/* Proporção 16:9 para o mapa */}
                                    <iframe
                                        title="Localização do Escritório Machado Advogados Associados"
                                        src={mapEmbedUrl}
                                        width="100%"
                                        height="100%"
                                        style={{ border: 0, position: 'absolute', top: 0, left: 0 }}
                                        allowFullScreen
                                        loading="lazy"
                                        referrerPolicy="no-referrer-when-downgrade"
                                    ></iframe>
                                </div>
                                {/* Botão de maximizar/detalhes que aparece no embed */}
                                <div className="absolute bottom-4 right-4 bg-white p-2 rounded-full shadow-md cursor-pointer text-gray-700 hover:text-[#bc9e77] transition-colors">
                                    {/* Ícone ou botão "Ver mapa ampliado" pode ser simulado aqui se não for um iframe */}
                                </div>
                            </div>

                        </div>
                    </section>
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