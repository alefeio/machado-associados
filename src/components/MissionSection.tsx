import React, { useState } from "react";
// Importando FaPlus/FaMinus para o botão de sanfona, se necessário, mas vou usar apenas o clique no título.

const services = [
    {
        title: "Missão",
        description:
            "Garantir soluções jurídicas de alto nível, protegendo os interesses de nossos clientes com responsabilidade, estratégia e inovação.",
        url: '/images/ico-mission-1.png', // Foguete
    },
    {
        title: "Visão",
        description:
            "Ser referência nacional em advocacia consultiva e contenciosa, reconhecida pela excelência, solidez e resultados consistentes.",
        url: '/images/ico-mission-2.png', // Olho
    },
    {
        title: "Valores",
        valueList: [
            "Ética e transparência em todas as relações.",
            "Compromisso absoluto com os clientes.",
            "Excelência técnica e atualização constante.",
            "Inovação e uso estratégico da tecnologia.",
            "Respeito às pessoas e à sociedade.",
        ],
        description: '', 
        url: '/images/ico-mission-3.png', // Mãos/Coração
    },
];

export default function MissionSection() {
    // 1. Estado para controlar qual item está aberto. Inicialmente, null (nenhum aberto).
    // Usaremos o índice (0, 1, 2) como identificador.
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    // 2. Função para alternar o estado
    const toggleContent = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <section className="bg-[#0c1a26] py-16 relative z-20">
            <div className="max-w-7xl mx-auto px-6 md:px-10 grid grid-cols-1 md:grid-cols-3 gap-x-12 gap-y-16">
                {services.map((service, index) => {
                    const isOpen = openIndex === index; // Verifica se este item está aberto

                    return (
                        <div
                            key={index}
                            className="flex flex-col items-center px-4"
                        >
                            {/* Cabeçalho do Item (Clicável) */}
                            <div 
                                className="flex flex-col items-center w-full cursor-pointer group"
                                onClick={() => toggleContent(index)} // 2. Adiciona a função de clique
                            >
                                {/* Imagem (Ícone) */}
                                <div className="flex-shrink-0 mb-4">
                                    <img
                                        src={service.url}
                                        alt={service.title}
                                        className="h-10 object-cover object-[center] mx-auto filter brightness-90 group-hover:opacity-80 transition-opacity"
                                    />
                                </div>

                                {/* Título */}
                                <h3 className="text-3xl font-extrabold text-[#ba9a71] mb-4 leading-snug group-hover:text-white transition-colors">
                                    {service.title}
                                </h3>
                            </div>
                            
                            {/* Área de Conteúdo (Sanfona) */}
                            <div
                                className={`transition-all duration-500 ease-in-out overflow-hidden ${isOpen ? 'text-center' : 'text-center'}`}
                                // 3. Usa o maxHeight para animar a abertura/fechamento
                                style={{ maxHeight: isOpen ? '500px' : '0' }}
                            >
                                {service.title === "Valores" ? (
                                    // Renderiza a lista <ul> para o bloco de Valores (A lista deve ser text-left para manter a legibilidade)
                                    <ul className="text-gray-200 text-base leading-relaxed text-left list-none space-y-2 pt-2">
                                        {(service as any).valueList.map((value: string, i: number) => (
                                            <li 
                                                key={i} 
                                                className="flex items-start before:content-['\2022'] before:text-[#ba9a71] before:mr-2 before:text-lg"
                                            >
                                                {value}
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    // Renderiza o parágrafo normal para Missão e Visão
                                    <p className="text-gray-200 text-base leading-relaxed pt-2">
                                        {service.description}
                                    </p>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}