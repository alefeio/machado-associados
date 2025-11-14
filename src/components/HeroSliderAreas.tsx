import { MdPlayArrow, MdPause } from 'react-icons/md';
import ServicesSection from './ServicesSection';

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
        url: '/images/bg-areas1.jpg',
        title: 'Áreas de Atuação',
        subtitle:
            'Atuamos de forma ampla e integrada, oferecendo assessoria completa nas seguintes áreas do Direito:',
    },
];

export default function HeroSliderAreas() {
    const slide = STATIC_SLIDES[0];

    return (
        <div className="relative w-full" id="inicio">
            {/* Imagem de Fundo */}
            <div className="absolute inset-0 opacity-100 z-10">
                <img
                    src={slide.url}
                    alt={slide.title || 'Banner Sobre'}
                    className="object-cover object-[center_bottom] w-full h-full"
                />
                <div className="absolute inset-0 bg-black/50"></div>
            </div>

            {/* Conteúdo */}
            <div className="relative z-20 flex flex-col justify-start pt-72">
                <div className="container flex flex-col items-start w-full max-w-4xl mx-auto">
                    <div className="flex-1">
                        {slide.title && (
                            <h2 className="font-sans text-3xl md:text-5xl lg:text-5xl font-extrabold text-[#ba9a71] drop-shadow-lg mb-4 leading-tight max-w-md">
                                {slide.title}
                            </h2>
                        )}
                        {slide.subtitle && (
                            <p className="text-lg md:text-xl lg:text-2xl font-thin text-gray-100 drop-shadow mb-8 max-w-md">
                                {slide.subtitle}
                            </p>
                        )}
                    </div>
                </div>

                <ServicesSection />
            </div>
        </div>
    );
}
