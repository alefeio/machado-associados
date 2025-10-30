import React, { useState, useRef, useCallback, useEffect } from 'react';
import { MdOutlineArrowBackIos, MdOutlineArrowForwardIos } from "react-icons/md";

interface Testimonial {
  id: string;
  name: string;
  content: string;
  type: string;
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
      const paddingX = 16; // px-4 = 16px (aplicado no track em mobile)

      // A largura renderizada do item (incluindo padding/border, mas sem margem)
      const singleItemRenderedWidth = itemRef.current.offsetWidth;

      let newTranslateX = 0;

      if (itemsToShow === 1) { // Mobile: Centralizar 1 item

        // Largura da área de recorte (Viewport)
        const viewportWidth = carouselViewportRef.current.offsetWidth;
        // Largura total do track (conteúdo + padding)
        const totalTrackWidth = carouselTrackRef.current.scrollWidth;

        // Posição de início do item atual no track (a partir da extremidade esquerda do track)
        const itemStartOnTrack = (currentIndex * (singleItemRenderedWidth + gapX)) + paddingX;

        // Cálculo para centralizar o item: (Centro da Viewport) - (Centro do Item)
        const translationNeeded = (viewportWidth / 2) - (itemStartOnTrack + (singleItemRenderedWidth / 2));

        newTranslateX = translationNeeded;

        // Garantir que o carrossel não se mova além dos limites
        const maxTranslateX = 0;
        const minTranslateX = viewportWidth - totalTrackWidth;
        newTranslateX = Math.max(minTranslateX, Math.min(maxTranslateX, newTranslateX));

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

  // ... (useEffect e Handlers de Navegação/Drag mantidos do código anterior)

  useEffect(() => {
    updateCarouselPosition();
    window.addEventListener('resize', updateCarouselPosition);
    return () => {
      window.removeEventListener('resize', updateCarouselPosition);
    };
  }, [updateCarouselPosition]);

  // Handle next testimonial navigation
  const handleNext = useCallback(() => {
    setCurrentIndex((prevIndex) => {
      const itemsToShow = getItemsToShow();
      const maxPossibleIndex = testimonials.length - itemsToShow;

      if (itemsToShow === 1) {
        const nextIndex = prevIndex + 1;
        return nextIndex >= testimonials.length ? 0 : nextIndex;
      } else {
        const nextIndex = prevIndex + itemsToShow;
        if (nextIndex > maxPossibleIndex) {
          return 0; // Looping
        }
        return nextIndex;
      }
    });
  }, [testimonials.length, getItemsToShow]);

  // Handle previous testimonial navigation
  const handlePrev = useCallback(() => {
    setCurrentIndex((prevIndex) => {
      const itemsToShow = getItemsToShow();
      const maxPossibleIndex = testimonials.length - itemsToShow;

      if (itemsToShow === 1) {
        const nextIndex = prevIndex - 1;
        return nextIndex < 0 ? testimonials.length - 1 : nextIndex;
      } else {
        const nextIndex = prevIndex - itemsToShow;
        if (nextIndex < 0) {
          return Math.max(0, maxPossibleIndex);
        }
        return nextIndex;
      }
    });
  }, [testimonials.length, getItemsToShow]);

  // --- Touch and Mouse Drag/Swipe Handlers (Mantidos) ---
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

  // Render nothing if no testimonials
  if (!testimonials || testimonials.length === 0) {
    return null;
  }

  const itemsToShow = getItemsToShow();
  const pageCount = getPageCount(itemsToShow);
  const currentGroupIndex = itemsToShow === 1 ? currentIndex : Math.floor(currentIndex / itemsToShow);


  return (
    <>
      <span id="depoimentos" className='my-16'></span>
      <section className="bg-white py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-800 leading-tight">
              Depoimentos
            </h2>
            <p className="text-gray-700 font-medium text-lg mt-4">O que nossos clientes dizem de nós</p>
          </div>

          {/* Carousel container with overflow hidden to clip testimonials */}
          <div ref={carouselViewportRef} className="relative flex items-center overflow-hidden">
            {/* Navigation button for previous testimonial */}
            <button
              onClick={handlePrev}
              disabled={testimonials.length <= itemsToShow && itemsToShow > 1 && currentIndex === 0}
              className="absolute left-2 z-10 p-2 rounded-full bg-[#ba9a71] shadow-md text-gray-700 hover:bg-gray-200 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-[#ba9a71] md:-left-12 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Depoimento anterior"
              style={{ top: '50%', transform: 'translateY(-50%)' }}
            >
              <MdOutlineArrowBackIos size={24} />
            </button>

            {/* Carousel track that holds all testimonials and slides */}
            <div
              ref={carouselTrackRef}
              // px-4 em mobile para centralização, md:px-0 para desktop (o container pai tem padding)
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
                  className={`flex-shrink-0 p-7 bg-[#0c1a25] rounded-xl shadow-lg transform transition-transform duration-500 ease-in-out
                  ${itemsToShow === 1 ? 'w-full' : 'md:w-[calc((100%-2*1.5rem)/3)]'}`}
                  aria-label={`Depoimento de ${t.name}`}
                >
                  <div className="flex items-start mb-4">
                    <span className="text-[#ba9a71] text-4xl leading-none mr-2">“</span>
                    <p className="text-white text-md md:text-lg italic leading-relaxed flex-1 w-fit">
                      {t.content}
                    </p>
                    <span className="text-[#ba9a71] text-4xl leading-none ml-2">”</span>
                  </div>
                  <div className="text-right mt-6">
                    <span className="block text-gray-400 text-sm md:text-md">
                      — {t.name}
                    </span>
                  </div>
                </article>
              ))}
            </div>

            {/* Navigation button for next testimonial */}
            <button
              onClick={handleNext}
              disabled={testimonials.length <= itemsToShow && itemsToShow > 1 && currentIndex >= testimonials.length - itemsToShow}
              className="absolute right-2 z-10 p-2 rounded-full bg-[#ba9a71] shadow-md text-gray-700 hover:bg-gray-200 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-[#ba9a71] md:-right-12 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Próximo depoimento"
              style={{ top: '50%', transform: 'translateY(-50%)' }}
            >
              <MdOutlineArrowForwardIos size={24} />
            </button>
          </div>

          {/* Page indicators */}
          <div className="flex justify-center mt-8 space-x-2">
            {Array.from({ length: pageCount }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index * itemsToShow)}
                className={`h-2 w-2 rounded-full ${index === currentGroupIndex ? 'bg-[#ba9a71]' : 'bg-gray-300 hover:bg-gray-400'
                  } transition-colors duration-300`}
                aria-label={`Ir para a página de depoimentos ${index + 1}`}
              />
            ))}
          </div>

          <style jsx>{`
            @keyframes fade-in {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
            }
          `}</style>
        </div>
      </section>
    </>
  );
}