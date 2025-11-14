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
        url: '/images/bg-sobre1.jpg',
        title: 'Sobre a Machado',
        subtitle:
            '- Advogados Associados',
    },
];

export default function HeroSliderSobre() {
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

                <SobreSection />
                <MissionSection />
            </div>
        </div>
    );
}
