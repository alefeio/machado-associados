import React, { useState, useRef, useCallback, useEffect } from 'react';
import { MdOutlineArrowBackIos, MdOutlineArrowForwardIos } from "react-icons/md";

interface Testimonial {
  id: string;
  name: string;
  content: string;
  type: string;
  avatarUrl?: string; // Adicionado para a imagem do perfil
}

interface TestimonialsPageProps {
  testimonials: Testimonial[];
}

export default function Testimonials({ testimonials }: TestimonialsPageProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [currentTranslate, setCurrentTranslate] = useState(0);
  const [prevTranslate, setPrevTranslate] = useState(0);
  const carouselTrackRef = useRef<HTMLDivElement>(null);
  const itemRef = useRef<HTMLDivElement>(null);
  const carouselViewportRef = useRef<HTMLDivElement>(null);

  const getItemsToShow = useCallback(() => {
    if (typeof window === 'undefined') return 1;
    const isDesktop = window.matchMedia('(min-width: 768px)').matches;
    return isDesktop ? 3 : 1;
  }, []);

  const getPageCount = useCallback((itemsToShow: number) => {
    return Math.ceil(testimonials.length / itemsToShow);
  }, [testimonials.length]);


  const updateCarouselPosition = useCallback(() => {
    if (carouselTrackRef.current && itemRef.current && carouselViewportRef.current) {
      const itemsToShow = getItemsToShow();
      const gapX = 24; // gap-x-6 = 24px

      const singleItemRenderedWidth = itemRef.current.offsetWidth;

      let newTranslateX = 0;

      if (itemsToShow === 1) { // Mobile: Centralizar 1 item
        const viewportWidth = carouselViewportRef.current.offsetWidth;
        const itemWithGap = singleItemRenderedWidth + gapX;
        const targetX = (viewportWidth / 2) - (itemWithGap / 2) - (currentIndex * itemWithGap);

        newTranslateX = targetX;

        const totalContentWidth = testimonials.length * itemWithGap - gapX;
        const maxScroll = Math.max(0, totalContentWidth - viewportWidth);

        if (newTranslateX > 0) newTranslateX = 0;
        if (newTranslateX < -maxScroll) newTranslateX = -maxScroll;
      } else { // Desktop: Alinhar 3 itens ao início
        newTranslateX = -currentIndex * (singleItemRenderedWidth + gapX);

        const maxPossibleIndex = testimonials.length - itemsToShow;
        if (currentIndex > maxPossibleIndex && maxPossibleIndex > 0) {
          newTranslateX = -maxPossibleIndex * (singleItemRenderedWidth + gapX);
        }
      }

      carouselTrackRef.current.style.transform = `translateX(${newTranslateX}px)`;
      carouselTrackRef.current.style.transition = 'transform 0.5s ease-in-out';
      setPrevTranslate(newTranslateX);
    }
  }, [currentIndex, getItemsToShow, testimonials.length]);


  useEffect(() => {
    updateCarouselPosition();
    window.addEventListener('resize', updateCarouselPosition);
    return () => {
      window.removeEventListener('resize', updateCarouselPosition);
    };
  }, [updateCarouselPosition]);

  const handleNext = useCallback(() => {
    setCurrentIndex((prevIndex) => {
      const itemsToShow = getItemsToShow();
      const maxAvailableIndex = testimonials.length - itemsToShow;

      if (itemsToShow === 1) {
        const nextIndex = prevIndex + 1;
        return nextIndex >= testimonials.length ? 0 : nextIndex;
      } else {
        const nextIndex = prevIndex + itemsToShow;
        if (nextIndex > maxAvailableIndex && maxAvailableIndex >= 0) {
          return 0;
        } else if (maxAvailableIndex < 0) {
          return 0;
        }
        return nextIndex;
      }
    });
  }, [testimonials.length, getItemsToShow]);

  const handlePrev = useCallback(() => {
    setCurrentIndex((prevIndex) => {
      const itemsToShow = getItemsToShow();
      const maxAvailableIndex = testimonials.length - itemsToShow;

      if (itemsToShow === 1) {
        const nextIndex = prevIndex - 1;
        return nextIndex < 0 ? testimonials.length - 1 : nextIndex;
      } else {
        const nextIndex = prevIndex - itemsToShow;
        if (nextIndex < 0) {
          return Math.max(0, maxAvailableIndex);
        }
        return nextIndex;
      }
    });
  }, [testimonials.length, getItemsToShow]);

  const startDrag = useCallback((clientX: number) => {
    setStartX(clientX);
    setIsDragging(true);
    if (carouselTrackRef.current) {
      carouselTrackRef.current.style.transition = 'none';
      const transformValue = carouselTrackRef.current.style.transform;
      const currentTranslateX = transformValue ? parseFloat(transformValue.replace('translateX(', '').replace('px)', '')) : 0;
      setPrevTranslate(currentTranslateX);
    }
  }, []);

  const moveDrag = useCallback((clientX: number) => {
    if (!isDragging) return;
    const dragAmount = clientX - startX;
    setCurrentTranslate(dragAmount);
    if (carouselTrackRef.current) {
      carouselTrackRef.current.style.transform = `translateX(${prevTranslate + dragAmount}px)`;
    }
  }, [isDragging, startX, prevTranslate]);

  const endDrag = useCallback(() => {
    setIsDragging(false);
    const movedBy = currentTranslate;
    const threshold = 70;

    if (movedBy < -threshold) {
      handleNext();
    } else if (movedBy > threshold) {
      handlePrev();
    } else {
      updateCarouselPosition();
    }
    setCurrentTranslate(0);
    if (carouselTrackRef.current) {
      carouselTrackRef.current.style.transition = 'transform 0.5s ease-in-out';
    }
  }, [currentTranslate, handleNext, handlePrev, updateCarouselPosition]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => startDrag(e.touches[0].clientX), [startDrag]);
  const handleTouchMove = useCallback((e: React.TouchEvent) => moveDrag(e.touches[0].clientX), [moveDrag]);
  const handleTouchEnd = useCallback(endDrag, [endDrag]);
  const handleMouseDown = useCallback((e: React.MouseEvent) => startDrag(e.clientX), [startDrag]);
  const handleMouseMove = useCallback((e: React.MouseEvent) => moveDrag(e.clientX), [moveDrag]);
  const handleMouseUp = useCallback(endDrag, [endDrag]);
  const handleMouseLeave = useCallback(() => {
    if (isDragging) {
      endDrag();
    }
  }, [isDragging, endDrag]);

  if (!testimonials || testimonials.length === 0) {
    return null;
  }

  const itemsToShow = getItemsToShow();
  const pageCount = getPageCount(itemsToShow);
  let currentGroupIndex = itemsToShow === 1 ? currentIndex : Math.floor(currentIndex / itemsToShow);
  if (currentGroupIndex >= pageCount) {
    currentGroupIndex = 0;
  }


  return (
    <>
      <span id="depoimentos" className='my-16'></span>
      <section className="bg-[#1a3044] py-24 md:py-32"> {/* Fundo branco puro como no print */}
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center mb-12 md:mb-16">
            <div className="flex items-center justify-center mb-12">
              <span className="h-0.5 w-12 bg-[#bc9e77] mr-4"></span> {/* Traço esquerdo */}
              <p className="text-gray-300 font-medium text-3xl tracking-wider">
                O que nossos clientes dizem de nós
              </p>
              <span className="h-0.5 w-12 bg-[#bc9e77] ml-4"></span> {/* Traço direito */}
            </div>
          </div>

          {/* Carousel container with overflow hidden to clip testimonials */}
          <div ref={carouselViewportRef} className="relative flex items-center overflow-hidden">
            {/* Navigation button for previous testimonial */}
            <button
              onClick={handlePrev}
              disabled={testimonials.length <= itemsToShow && itemsToShow > 1}
              className="absolute left-2 z-10 p-2 rounded-full bg-white shadow-md text-gray-700 hover:bg-gray-200 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-[#ba9a71] md:-left-12 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Depoimento anterior"
              style={{ top: '50%', transform: 'translateY(-50%)' }}
            >
              <MdOutlineArrowBackIos size={24} />
            </button>

            {/* Carousel track that holds all testimonials and slides */}
            <div
              ref={carouselTrackRef}
              className="flex gap-x-6 w-full px-4 md:px-0"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseLeave}
              style={{
                transform: `translateX(${prevTranslate + currentTranslate}px)`,
                cursor: isDragging ? 'grabbing' : 'grab',
              }}
            >
              {testimonials.map((t, index) => (
                <article
                  key={t.id}
                  ref={index === 0 ? itemRef : null}
                  className={`flex-shrink-0 p-8 pt-20 bg-white rounded-xl shadow-lg relative flex flex-col items-center
                  ${itemsToShow === 1 ? 'w-full' : 'md:w-[calc((100%-2*1.5rem)/3)]'}`}
                  aria-label={`Depoimento de ${t.name}`}
                >
                  {/* Imagem de perfil */}
                  {t.avatarUrl && (
                    <div className="absolute -top-10 left-1/2 transform -translate-x-1/2"> {/* Posiciona acima e centralizado */}
                      <img
                        src={t.avatarUrl}
                        alt={`Foto de ${t.name}`}
                        className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-md" // Borda branca e sombra
                      />
                    </div>
                  )}

                  {/* Aspas do topo (exatamente como no print, usando um elemento para SVG ou caractere) */}
                  <div className="text-gray-400 text-6xl leading-none mb-4 font-serif relative"> {/* Aspas maiores, cinza claro */}
                    “
                  </div>

                  <p className="text-gray-800 text-base italic leading-relaxed text-center mb-6 px-2"> {/* Texto principal, cinza escuro, menor */}
                    {t.content}
                  </p>

                  {/* Aspas de baixo */}
                  <div className="text-gray-400 text-6xl leading-none mt-4 font-serif rotate-180 relative"> {/* Aspas maiores, cinza claro, rotacionadas */}
                    “
                  </div>

                  {/* Linha divisória antes do nome */}
                  <div className="w-12 h-0.5 bg-gray-300 my-4"></div>

                  <div className="mt-2">
                    <span className="block text-gray-800 text-lg font-semibold">
                      {t.name}
                    </span>
                    {/* Aqui você pode adicionar o cargo/tipo se quiser, como no print para Rafaella */}
                    {t.type && <span className="block text-gray-500 text-sm">{t.type}</span>}
                  </div>
                </article>
              ))}
            </div>

            {/* Navigation button for next testimonial */}
            <button
              onClick={handleNext}
              disabled={testimonials.length <= itemsToShow && itemsToShow > 1}
              className="absolute right-2 z-10 p-2 rounded-full bg-white shadow-md text-gray-700 hover:bg-gray-200 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-[#ba9a71] md:-right-12 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Próximo depoimento"
              style={{ top: '50%', transform: 'translateY(-50%)' }}
            >
              <MdOutlineArrowForwardIos size={24} />
            </button>
          </div>

          {/* Page indicators */}
          <div className="flex justify-center mt-8 space-x-2">
            {testimonials.length > itemsToShow && Array.from({ length: pageCount }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(itemsToShow === 1 ? index : index * itemsToShow)}
                className={`h-2 w-2 rounded-full ${index === currentGroupIndex ? 'bg-[#ba9a71]' : 'bg-gray-300 hover:bg-gray-400'
                  } transition-colors duration-300`}
                aria-label={`Ir para a página de depoimentos ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}