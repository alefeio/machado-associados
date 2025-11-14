import { MdPlayArrow, MdPause } from 'react-icons/md';
import ServicesSection from './ServicesSection';
import SobreSection from './SobreSection';
import MissionSection from './MissionSection';

interface BannerItem {
    id: string;
    url: string;
    title?: string;
    subtitle?: string;
    link?: string;
    target?: string;
    buttonText?: string;
    buttonColor?: string;
}

const FIXED_SLOGAN =
    'Na Machado - Advogados Associados, transformamos desafios em conquistas jurídicas com seriedade, dedicação e inovação.';

const STATIC_SLIDES: BannerItem[] = [
    {
        id: 'static-sobre-1',
        url: '/images/bg-structure.jpg',
        title: 'Estrutura do Escritório',
    },
];

export default function StructureSection() {
    const slide = STATIC_SLIDES[0];

    return (
        <div className="relative w-full" id="inicio">
            {/* Imagem de Fundo */}
            <div className="absolute inset-0 opacity-100 z-10">
                <img
                    src={slide.url}
                    alt={slide.title || 'Banner Sobre'}
                    className="object-cover object-[center] w-full h-full"
                />
            </div>

            {/* Conteúdo */}
            <div className="relative z-20 flex flex-col justify-start pt-72">
                <div className="container flex flex-col items-start w-full max-w-4xl mx-auto mb-20">
                    <div className="flex-1">
                        {slide.title && (
                            <h2 className="font-sans text-3xl md:text-5xl lg:text-5xl font-extrabold text-[#ba9a71] drop-shadow-lg mb-4 leading-tight max-w-md">
                                {slide.title}
                            </h2>
                        )}
                    </div>
                </div>

                <section className="bg-[#0c1a26]/70 py-20 relative z-20 mb-20"> {/* Ajustei o padding vertical */}
                    <div className="max-w-7xl mx-auto px-6">

                        <div className="text-white text-xl leading-relaxed space-y-8 mb-10">
                            <p>
                                A <span className="font-extrabold">Machado - Advogados Associados</span>, entendemos que
                                confiança também se constrói por meio da solidez de nossa estrutura.
                            </p>
                            <p>
                                Nosso escritório conta com infraestrutura moderna, ambiente
                                corporativo sofisticado e recursos tecnológicos que permitem
                                agilidade no atendimento e segurança no gerenciamento de informações.
                            </p>
                            <p>
                                Estamos preparados para atuar em demandas complexas, com equipe
                                multidisciplinar e suporte técnico de alto padrão.
                            </p>
                        </div>

                    </div>
                </section>
            </div>
        </div>
    );
}
