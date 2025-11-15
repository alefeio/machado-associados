import React, { useState, useRef, useCallback, useEffect } from 'react';
import { MdOutlineArrowBackIos, MdOutlineArrowForwardIos } from "react-icons/md";

interface Testimonial {
    id: string;
    name: string;
    content: string;
    type: string;
    avatarUrl?: string;
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
        // Desktop: 3 cards. Mobile: 1 card.
        return isDesktop ? 3 : 1;
    }, []);

    const getPageCount = useCallback((itemsToShow: number) => {
        // Para mobile (1 item/página), cada item é uma página.
        if (itemsToShow === 1) return testimonials.length;
        // Para desktop (3 itens/página), o cálculo é por grupo de 3.
        return Math.ceil(testimonials.length / itemsToShow);
    }, [testimonials.length]);

    const updateCarouselPosition = useCallback(() => {
        if (carouselTrackRef.current && itemRef.current && carouselViewportRef.current) {
            const itemsToShow = getItemsToShow();
            const gapX = 8; // A classe 'gap-x-2' define 8px de gap (Tailwind default)
            
            // Largura do item (calculada na DOM)
            const singleItemRenderedWidth = itemRef.current.offsetWidth;
            const viewportWidth = carouselViewportRef.current.offsetWidth;
            
            let newTranslateX = 0;

            if (itemsToShow === 1) { // Mobile: Centralizar 1 item
                
                // O padding horizontal (px-2) no trackRef é 8px no total (4px de cada lado).
                const trackPaddingLeft = 4; 
                
                // Largura total de um item, incluindo o gap que o segue
                const itemWithGap = singleItemRenderedWidth + gapX;

                // 1. Calculamos o ponto onde a borda esquerda do item [currentIndex] estaria (sem translação)
                // O primeiro item (index 0) começa em trackPaddingLeft
                const targetStartOffset = (currentIndex * itemWithGap) + trackPaddingLeft;

                // 2. Calculamos o ponto de centralização no viewport
                const centerOffset = (viewportWidth / 2) - (singleItemRenderedWidth / 2);

                // 3. A nova translação é o valor que move a borda esquerda do item para o ponto central
                newTranslateX = centerOffset - targetStartOffset;

                // CLAMPING (Limites de Rolagem)

                // MaxTranslateX: Deslocamento máximo negativo (quando o último item está centralizado)
                const lastItemIndex = testimonials.length - 1;
                const lastItemStartOffset = (lastItemIndex * itemWithGap) + trackPaddingLeft;
                const maxTranslateX = centerOffset - lastItemStartOffset;
                
                // MinTranslateX: Deslocamento mínimo (quando o primeiro item está centralizado)
                const minTranslateX = centerOffset - trackPaddingLeft; // Ou newTranslateX quando currentIndex é 0

                // Garante que não role antes do primeiro item (limite superior)
                if (newTranslateX > minTranslateX) {
                    newTranslateX = minTranslateX;
                }

                // Garante que não role depois do último item (limite inferior)
                if (newTranslateX < maxTranslateX) {
                    newTranslateX = maxTranslateX;
                }

            } else { // Desktop: 3 itens visíveis, alinhamento à esquerda
                const desktopGapX = 24; // gap-x-6 (3 * 8px = 24px)
                const itemWithGap = singleItemRenderedWidth + desktopGapX;
                
                // clamp currentIndex para não ultrapassar o último início possível
                const maxStartIndex = Math.max(0, testimonials.length - itemsToShow);
                const clampedIndex = Math.min(currentIndex, maxStartIndex);
                newTranslateX = -clampedIndex * itemWithGap;
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

    // === Lógica de Navegação (MANTIDA) ===
    const handleNext = useCallback(() => {
        setCurrentIndex((prevIndex) => {
            const itemsToShow = getItemsToShow();
            if (itemsToShow === 1) {
                const nextIndex = prevIndex + 1;
                // Volta para 0 se for o último no mobile
                return nextIndex >= testimonials.length ? 0 : nextIndex;
            } else {
                const maxStart = Math.max(0, testimonials.length - itemsToShow);
                const next = prevIndex + 1;
                // Volta para 0 se for o último início no desktop
                return next > maxStart ? 0 : next;
            }
        });
    }, [testimonials.length, getItemsToShow]);

    const handlePrev = useCallback(() => {
        setCurrentIndex((prevIndex) => {
            const itemsToShow = getItemsToShow();
            if (itemsToShow === 1) {
                const nextIndex = prevIndex - 1;
                // Volta para o último se for o primeiro no mobile
                return nextIndex < 0 ? testimonials.length - 1 : nextIndex;
            } else {
                const maxStart = Math.max(0, testimonials.length - itemsToShow);
                const next = prevIndex - 1;
                // Volta para o último início se for o primeiro no desktop
                return next < 0 ? maxStart : next;
            }
        });
    }, [testimonials.length, getItemsToShow]);

    // === Lógica de Drag/Swipe (MANTIDA) ===
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

    // Calcular o índice visível para aplicação de estilos
    const visibleStartIndex = (() => {
        if (itemsToShow === 1) return currentIndex;
        const maxStart = Math.max(0, testimonials.length - itemsToShow);
        return Math.min(currentIndex, maxStart);
    })();

    const centerIndex = visibleStartIndex + Math.floor(itemsToShow / 2);

    let currentGroupIndex = itemsToShow === 1 ? currentIndex : Math.floor(visibleStartIndex / itemsToShow);
    if (currentGroupIndex >= pageCount) {
        currentGroupIndex = 0;
    }

    // Estilos dos botões de navegação
    const leftButtonStyle: React.CSSProperties = {
        top: '50%',
        transform: 'translateY(-50%)',
        left: itemsToShow === 1 ? '0.5rem' : '-3rem',
    };
    const rightButtonStyle: React.CSSProperties = {
        top: '50%',
        transform: 'translateY(-50%)',
        right: itemsToShow === 1 ? '0.5rem' : '-3rem',
    };

    return (
        <>
            <span id="depoimentos" className='my-16'></span>
            <section className="bg-[#1a3044] py-24 md:py-32">
                <div className="max-w-7xl mx-auto px-4 md:px-8">
                    <div className="text-center mb-12 md:mb-16">
                        <div className="flex items-center justify-center mb-12">
                            <span className="h-0.5 w-12 bg-[#bc9e77] mr-4"></span>
                            <p className="text-white font-medium text-3xl tracking-wider">
                                O que nossos clientes dizem de nós
                            </p>
                            <span className="h-0.5 w-12 bg-[#bc9e77] ml-4"></span>
                        </div>
                    </div>

                    {/* IMPORTANTE: overflow-hidden para garantir que apenas os items visíveis apareçam */}
                    <div ref={carouselViewportRef} className="relative overflow-hidden">

                        <div className="relative flex items-center">
                            <button
                                onClick={handlePrev}
                                // Corrigido: Desabilita se for o primeiro índice (evita o loop automático no disable)
                                disabled={itemsToShow === 1 && currentIndex === 0}
                                className="absolute z-10 p-2 rounded-full bg-white shadow-lg text-gray-700 hover:bg-gray-200 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                aria-label="Depoimento anterior"
                                style={leftButtonStyle}
                            >
                                <MdOutlineArrowBackIos size={24} />
                            </button>

                            <div
                                ref={carouselTrackRef}
                                className="flex gap-x-2 w-full px-2 md:px-0 transition-transform duration-500 ease-in-out items-stretch"
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
                                {testimonials.map((t: Testimonial, index: number) => {
                                    const isCenter = index === centerIndex;

                                    return (
                                        <article
                                            key={t.id}
                                            ref={index === 0 ? itemRef : null}
                                            aria-label={`Depoimento de ${t.name}`}
                                            className={`
                                                flex-shrink-0 bg-white rounded-3xl shadow-lg relative flex flex-col items-center border border-gray-100
                                                transition-all duration-500 ease-in-out
                                                ${itemsToShow === 1 ? 'w-full p-6' : 'md:w-[calc((100%-2*1.5rem)/3)] p-8'}
                                                ${isCenter ? 'md:scale-100 md:z-10' : 'md:scale-90 md:opacity-90'}
                                            `}
                                        >
                                            {/* AVATAR DENTRO DO BOX (topo) */}
                                            {t.avatarUrl && (
                                                <div className={`w-20 h-20 rounded-full overflow-hidden ring-2 ring-gray-200 mb-4 ${isCenter ? 'md:w-24 md:h-24' : ''}`}>
                                                    <img src={t.avatarUrl} alt={`Foto de ${t.name}`} className="w-full h-full object-cover" />
                                                </div>
                                            )}

                                            <div className="text-gray-800 text-5xl leading-none font-serif">
                                                “
                                            </div>

                                            <p className="text-gray-700 text-base italic leading-relaxed text-center mb-6 whitespace-pre-wrap">
                                                {t.content}
                                            </p>

                                            <div className="text-gray-800 text-5xl leading-none font-serif rotate-180">
                                                “
                                            </div>

                                            <div className="mt-2 text-center">
                                                <span className="block text-gray-800 text-lg font-bold">
                                                    {t.name}
                                                </span>
                                                {t.type && <span className="block text-gray-500 text-sm">{t.type}</span>}
                                            </div>
                                        </article>
                                    );
                                })}
                            </div>

                            <button
                                onClick={handleNext}
                                // Corrigido: Desabilita se for o último índice (evita o loop automático no disable)
                                disabled={itemsToShow === 1 && currentIndex === testimonials.length - 1}
                                className="absolute z-10 p-2 rounded-full bg-white shadow-lg text-gray-700 hover:bg-gray-200 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                aria-label="Próximo depoimento"
                                style={rightButtonStyle}
                            >
                                <MdOutlineArrowForwardIos size={24} />
                            </button>
                        </div>
                    </div>

                    <div className="flex justify-center mt-8 space-x-2">
                        {testimonials.length > itemsToShow && Array.from({ length: pageCount }).map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentIndex(itemsToShow === 1 ? index : index * itemsToShow)}
                                className={`h-2 w-2 rounded-full ${index === currentGroupIndex ? 'bg-[#ba9a71]' : 'bg-gray-300 hover:bg-gray-400'} transition-colors duration-300`}
                                aria-label={`Ir para a página de depoimentos ${index + 1}`}
                            />
                        ))}
                    </div>
                </div>
            </section>
        </>
    );
}