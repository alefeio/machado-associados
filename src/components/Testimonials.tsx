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
                const maxTranslateXMobile = totalContentWidth > viewportWidth
                    ? (viewportWidth / 2) - (itemWithGap / 2) - ((testimonials.length - 1) * itemWithGap)
                    : 0;

                if (newTranslateX > 0) newTranslateX = 0;
                if (newTranslateX < maxTranslateXMobile) {
                    newTranslateX = maxTranslateXMobile;
                }

            } else { // Desktop: Alinhar e permitir apenas 3 visíveis; o translate usa currentIndex (1 em 1)
                const itemWithGap = singleItemRenderedWidth + gapX;
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

    // === ALTERAÇÃO PRINCIPAL: avançar/recuar de 1 em 1 no desktop (itemsToShow > 1)
    const handleNext = useCallback(() => {
        setCurrentIndex((prevIndex) => {
            const itemsToShow = getItemsToShow();
            if (itemsToShow === 1) {
                const nextIndex = prevIndex + 1;
                return nextIndex >= testimonials.length ? 0 : nextIndex;
            } else {
                // desktop: avançar 1 por vez; quando atinge o último "start", volta pra 0
                const maxStart = Math.max(0, testimonials.length - itemsToShow);
                const next = prevIndex + 1;
                return next > maxStart ? 0 : next;
            }
        });
    }, [testimonials.length, getItemsToShow]);

    const handlePrev = useCallback(() => {
        setCurrentIndex((prevIndex) => {
            const itemsToShow = getItemsToShow();
            if (itemsToShow === 1) {
                const nextIndex = prevIndex - 1;
                return nextIndex < 0 ? testimonials.length - 1 : nextIndex;
            } else {
                // desktop: voltar 1 por vez; se for menor que 0, ir para o último start possível
                const maxStart = Math.max(0, testimonials.length - itemsToShow);
                const next = prevIndex - 1;
                return next < 0 ? maxStart : next;
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

    // Calcular o início visível (clamp para quando currentIndex estiver próximo do fim)
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
                    <div ref={carouselViewportRef} className="relative flex items-center">
                        <button
                            onClick={handlePrev}
                            disabled={(itemsToShow === 1 && currentIndex === 0) || (itemsToShow > 1 && pageCount <= 1)}
                            className="absolute z-10 p-2 rounded-full bg-white shadow-lg text-gray-700 hover:bg-gray-200 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            aria-label="Depoimento anterior"
                            style={leftButtonStyle}
                        >
                            <MdOutlineArrowBackIos size={24} />
                        </button>

                        <div
                            ref={carouselTrackRef}
                            className="flex gap-x-6 w-full px-2 md:px-0 transition-transform duration-500 ease-in-out items-stretch"
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
                            {testimonials.map((t, index) => {
                                const isCenter = index === centerIndex;

                                return (
                                    <article
                                        key={t.id}
                                        ref={index === 0 ? itemRef : null}
                                        aria-label={`Depoimento de ${t.name}`}
                                        className={`
                                            flex-shrink-0 bg-white rounded-xl shadow-lg relative flex flex-col items-center border border-gray-100
                                            transition-all duration-500 ease-in-out
                                            ${itemsToShow === 1 ? 'w-[90%] sm:w-[80%] mx-auto p-6' : 'md:w-[calc((100%-2*1.5rem)/3)] p-8'}
                                            ${isCenter ? 'md:scale-105 md:z-10' : 'md:scale-95 md:opacity-90'}
                                        `}
                                        style={{
                                            paddingTop: itemsToShow === 1 ? undefined : isCenter ?  '4.5rem' : undefined
                                        }}
                                    >
                                        {/* AVATAR DENTRO DO BOX (topo) */}
                                        {t.avatarUrl && (
                                            <div className={`w-20 h-20 rounded-full overflow-hidden border-4 border-white shadow-xl ring-2 ring-gray-200 mb-4 ${isCenter ? 'md:w-24 md:h-24' : ''}`}>
                                                <img src={t.avatarUrl} alt={`Foto de ${t.name}`} className="w-full h-full object-cover" />
                                            </div>
                                        )}

                                        <div className="text-gray-400 text-5xl leading-none mb-4 font-serif">
                                            “
                                        </div>

                                        <p className="text-gray-700 text-base italic leading-relaxed text-center mb-6 whitespace-pre-wrap">
                                            {t.content}
                                        </p>

                                        <div className="text-gray-400 text-5xl leading-none mt-4 font-serif rotate-180">
                                            “
                                        </div>

                                        <div className="w-12 h-0.5 bg-gray-200 my-4"></div>

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
                            disabled={(itemsToShow === 1 && currentIndex === testimonials.length - 1) || (itemsToShow > 1 && pageCount <= 1)}
                            className="absolute z-10 p-2 rounded-full bg-white shadow-lg text-gray-700 hover:bg-gray-200 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            aria-label="Próximo depoimento"
                            style={rightButtonStyle}
                        >
                            <MdOutlineArrowForwardIos size={24} />
                        </button>
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
