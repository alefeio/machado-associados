import React from "react";

const services = [
    {
        title: "Missão",
        description:
            "Garantir soluções jurídicas de alto nível, protegendo os interesses de nossos clientes com responsabilidade, estratégia e inovação.",
        url: '/images/ico-mission-1.png',
    },
    {
        title: "Visão",
        description:
            "Ser referência nacional em advocacia consultiva e contenciosa, reconhecida pela excelência, solidez e resultados consistentes.",
        url: '/images/ico-mission-2.png',
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
        url: '/images/ico-mission-3.png',
    },
];

export default function MissionSection() {
    return (
        <section className="bg-[#0c1a26] py-16 relative z-20">
            <div className="max-w-7xl mx-auto px-6 md:px-10 grid grid-cols-1 md:grid-cols-3 gap-x-12 gap-y-16">
                
                {services.map((service, index) => (
                    <div
                        key={index}
                        className="flex flex-col items-center px-4"
                    >

                        {/* Cabeçalho */}
                        <div className="flex flex-col items-center w-full group">
                            <div className="flex-shrink-0 mb-4">
                                <img
                                    src={service.url}
                                    alt={service.title}
                                    className="h-10 object-cover mx-auto filter brightness-90"
                                />
                            </div>

                            <h3 className="text-3xl font-extrabold text-[#ba9a71] mb-4 leading-snug">
                                {service.title}
                            </h3>
                        </div>

                        {/* Conteúdo sempre aberto */}
                        <div className="text-center">
                            {service.title === "Valores" ? (
                                <ul className="text-gray-200 text-base leading-relaxed text-left list-none pt-2">
                                    {service.valueList!.map((value: string, i: number) => (
                                        <li
                                            key={i}
                                            className="flex text-sm items-start before:content-['\2022'] before:text-[#ba9a71] before:mr-2 before:text-lg"
                                        >
                                            {value}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-gray-200 text-base leading-relaxed pt-2">
                                    {service.description}
                                </p>
                            )}
                        </div>

                    </div>
                ))}

            </div>
        </section>
    );
}
