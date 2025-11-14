import Artigos from "./Artigos";
import Casos from "./Casos";

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
        id: 'static-blog',
        url: '/images/bg-blog.jpg',
        title: 'Blog',
    },
];

export default function Blog() {
    const slide = STATIC_SLIDES[0];

    return (
        <div className="relative w-full" id="inicio">
            {/* Imagem de Fundo */}
            <div className="absolute inset-0 opacity-100 z-10">
                <img
                    src={slide.url}
                    alt={slide.title || 'Banner Sobre'}
                    className="object-cover object-[center_70%] md:object-[center_top] w-full h-full"
                />
            </div>

            {/* Conteúdo */}
            <div className="relative z-20 flex flex-col justify-start pt-60 w-full">
                <div className="container flex flex-col items-center w-full max-w-4xl mx-auto">
                    <div className="flex-1 py-12">
                        {slide.title && (
                            <h2 className="font-sans text-3xl md:text-5xl lg:text-5xl font-extrabold text-[#ba9a71] drop-shadow-lg mb-4 leading-tight max-w-md">
                                {slide.title}
                            </h2>
                        )}
                    </div>
                </div>

                <Artigos />
            </div>
        </div>
    );
}
