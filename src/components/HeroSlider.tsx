import { useState, useEffect } from "react";
import Link from 'next/link';
import { useRouter } from 'next/router';
import { MdPlayArrow, MdPause } from 'react-icons/md'; // Importa os ícones de play/pause

// Interface atualizada para corresponder ao BannerForm.tsx
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

interface HeroSliderProps {
  banners: {
    banners: BannerItem[];
  }[];
}

// O slogan fixo que você quer exibir
const FIXED_SLOGAN = "Na Machado - Advogados Associados, transformamos desafios em conquistas jurídicas com seriedade, dedicação e inovação.";

export default function HeroSlider({ banners }: HeroSliderProps) {
  const [current, setCurrent] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [startX, setStartX] = useState<number | null>(null);
  const slides = banners[0]?.banners || [];
  const router = useRouter();

  // Variável para verificar se há mais de um banner
  const hasMultipleSlides = slides.length > 1;

  useEffect(() => {
    // A execução do timer só ocorre se houver mais de um slide
    if (!playing || !hasMultipleSlides) return;

    const timer = setTimeout(() => setCurrent((c) => (c + 1) % slides.length), 8000); // Tempo de transição ajustado
    return () => clearTimeout(timer);
  }, [current, playing, slides.length, hasMultipleSlides]); // Adicionado hasMultipleSlides como dependência

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    // Só pausa no clique/arrasto se houver mais de um slide
    if (!hasMultipleSlides) return;
    setPlaying(false);
    setStartX(e.clientX);
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLDivElement>) => {
    if (startX === null || !hasMultipleSlides) return;
    const deltaX = e.clientX - startX;

    if (Math.abs(deltaX) > 50) {
      setCurrent((prev) => (deltaX > 0 ? (prev - 1 + slides.length) % slides.length : (prev + 1) % slides.length));
    }

    setStartX(null);
    setPlaying(true);
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!hasMultipleSlides) return;
    setPlaying(false);
    setStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (startX === null || !hasMultipleSlides) return;
    const endX = e.changedTouches[0].clientX;
    const deltaX = endX - startX;

    if (Math.abs(deltaX) > 50) {
      setCurrent((prev) => (deltaX > 0 ? (prev - 1 + slides.length) % slides.length : (prev + 1) % slides.length));
    }

    setStartX(null);
    setPlaying(true);
  };

  // Se não houver slides, retorna null. Se houver apenas 1, renderiza-o.
  if (slides.length === 0) {
    return null;
  }

  // Define o comportamento de mouse enter/leave condicionalmente
  const mouseEnterHandler = hasMultipleSlides ? () => setPlaying(false) : undefined;
  const mouseLeaveHandler = hasMultipleSlides ? () => setPlaying(true) : undefined;


  return (
    <div
      className="relative w-full h-[100vh] overflow-hidden shadow-2xl" // Sombra mais forte
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseEnter={mouseEnterHandler} // Adicionado handler condicional
      onMouseLeave={mouseLeaveHandler} // Adicionado handler condicional
      id="inicio"
    >
      {slides.map((slide, idx) => (
        <div
          key={slide.id}
          // Z-index para garantir que apenas o banner ativo ou o banner único esteja no topo.
          className={`absolute inset-0 transition-opacity duration-700 ${idx === current ? "opacity-100 z-10" : "opacity-0 z-0"}`}
        >
          <img
            src={slide.url}
            alt={slide.title || `Banner ${idx + 1}`}
            className="object-cover object-[center_60%] w-full h-full"
          />
        </div>
      ))}

      {/* Renderiza o conteúdo do banner ativo separadamente */}
      {slides[current] && (slides[current].title || slides[current].subtitle || slides[current].buttonText) && (
        // MUDANÇA CHAVE 1: Usa justify-end para alinhar o conteúdo no final (rodapé)
        <div className="absolute inset-0 flex flex-col justify-between px-8 pt-60 pb-16 md:py-60 md:pb-12 z-20">
          {/* MUDANÇA CHAVE 2: Usa container e mx-auto para centralizar e aplica mb-10 para espaçar o slogan */}
          <div className="container flex flex-col items-start w-full max-w-4xl mx-auto mb-10">
            {/* Título e Subtítulo - RESTAURADO para o mais próximo da sua versão original */}
            <div className="flex-1 mb-6 md:mb-24">
              {slides[current].title && (
                <h2 className="font-sans text-3xl md:text-5xl lg:text-5xl font-extrabold text-[#ba9a71] drop-shadow-lg mb-4 leading-tight max-w-md"> {/* Título maior e mais impactante */}
                  {slides[current].title}
                </h2>
              )}
              {slides[current].subtitle && (
                <>
                  <p className="text-lg md:text-xl lg:text-2xl font-thin text-gray-100 drop-shadow mb-8 max-w-md"> {/* Subtítulo mais destacado */}
                    {slides[current].subtitle}
                  </p>
                </>
              )}
              {/* {slides[current].buttonText && slides[current].link && (
                <div className="mt-4">
                  <Link href={slides[current].link} passHref>
                    <button
                      className={`inline-block py-3 px-8 rounded-full font-bold transition-all duration-300 transform hover:-translate-y-1 shadow-xl hover:shadow-2xl ${slides[current].buttonColor || "bg-orange-500 hover:bg-orange-600"} text-white`}
                    >
                      {slides[current].buttonText}
                    </button>
                  </Link>
                </div>
              )} */}
            </div>
          </div>
          
          {/* MUDANÇA CHAVE 3: Slogan Fixo - Posicionado fora do container principal de títulos para ficar na parte inferior da tela, mas com padding e cor corretos */}
          {/* O estilo de cor e tamanho está sendo herdado pelo contexto do container z-20, mas o posicionamento é o que importa */}
          <div className="w-full bg-transparent p-6 md:p-10 pt-0 max-w-3xl mx-auto"> {/* Usei um div para replicar o efeito de uma seção com padding */}
            <div className="container mx-auto max-w-4xl">
              <p className="text-lg text-center md:text-xl font-thin text-[#0f1f30] drop-shadow max-w-full">
                {/* Aqui está o texto fixo com o mesmo estilo da imagem (sempre em branco/claro no rodapé) */}
                {FIXED_SLOGAN}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* --- INÍCIO: Controles Condicionais (só aparecem se houver mais de 1 slide) --- */}
      {hasMultipleSlides && (
        <>
          {/* Navegação/Bullets */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex gap-3">
            {slides.map((_, idx) => (
              <button
                key={idx}
                className={`w-4 h-4 rounded-full transition-colors duration-300 ${idx === current ? "bg-orange-500" : "bg-gray-400 hover:bg-gray-200"}`} // Cores e tamanho ajustados
                onClick={() => setCurrent(idx)}
                aria-label={`Ir para slide ${idx + 1}`}
              />
            ))}
          </div>

          {/* Botão Play/Pause */}
          <button
            className="absolute bottom-6 right-6 bg-white/90 rounded-full p-2 shadow-lg hover:bg-white z-30 transition-colors duration-300" // Cor de fundo e hover ajustados
            onClick={() => setPlaying((p) => !p)}
            aria-label={playing ? "Pausar" : "Reproduzir"}
          >
            {playing ? (
              <MdPause className="w-5 h-5 text-gray-700" /> // Usando ícone de react-icons/md
            ) : (
              <MdPlayArrow className="w-5 h-5 text-gray-700" /> // Usando ícone de react-icons/md
            )}
          </button>
        </>
      )}
      {/* --- FIM: Controles Condicionais --- */}
    </div>
  );
}