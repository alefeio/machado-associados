import React from "react";
import Image from "next/image";

const equipe = [
    {
        nome: "Daniel Machado",
        cargo: "SÓCIO-DIRETOR / ADVOGADO",
        descricao: `Atua na coordenação jurídica e estratégica de
            projetos de regularização fundiária.
            Especialista na relação Empresa-Consumidor`,
        imagem: "/images/equipe/adv1-daniel.jpg",
    },
    {
        nome: "Bruna Abdelnor",
        cargo: "ADVOGADA",
        descricao: `Especialista em Direito Imobiliário, com ampla
            experiência em regularização de imóveis e
            passagem por órgãos públicos como CODEM e
            SEMEC. Pós-graduada em Negócios Imobiliários`,
        imagem: "/images/equipe/adv2-bruna.jpg",
    },
    {
        nome: "Allan Pessoa",
        cargo: "ASSESSOR JURÍDICO",
        descricao: `Atua em Direito Imobiliário e Registral. Com
            mais de três anos de experiência no 3º Ofício
            de Registro de Imóveis de Belém-PA, dedica-se
            à solução de casos complexos na área.`,
        imagem: "/images/equipe/adv3-allan.jpg",
    },
    {
        nome: "Pedro Moura ",
        cargo: "ASSESSOR JURÍDICO",
        descricao: `Formado em Direito, com experiência nas
            áreas de Direito Civil e Direito do Consumidor.
            Seu conhecimento do funcionamento dos
            tribunais fortalece a atuação estratégica do
            escritório.`,
        imagem: "/images/equipe/adv4-pedro.jpg",
    },
    {
        nome: "Gabriel Henrique",
        cargo: "ADVOGADO JÚNIOR",
        descricao: `Atua em Direito do Consumidor, com
            destaque em ações contra planos de saúde e
            companhias aéreas. Cursa pós-graduação em
            Direito Processual na UNAMA.`,
        imagem: "/images/equipe/adv5-gabriel.jpg",
    },
    {
        nome: "Rita",
        cargo: "ASSISTENTE ADMINISTRATIVA",
        descricao: `Responsável pelo atendimento aos clientes
            e pela organização da rotina administrativa,
            sendo peça fundamental para o bom
            funcionamento e sucesso da equipe.`,
        imagem: "/images/equipe/adv6-rita.jpg",
    },
];

const Equipe: React.FC = () => {
    return (
        <>
            <span id="equipe" className='my-16'></span>
            <section className="bg-white py-20">
                <div className="container mx-auto px-6 lg:px-12">
                    {/* Título */}
                    <div className="text-left md:text-center mb-16">
                        <h1 className="text-4xl text-center md:text-5xl font-bold text-[#0c1a25] mb-4">
                            Nossa equipe
                        </h1>
                        <p className="text-lg max-w-7xl mx-auto">
                            Na <span className="font-bold">Machado – Advogados Associados</span>,
                            acreditamos que o maior patrimônio
                            de um escritório são as pessoas que
                            o constroem diariamente.
                        </p>
                        <p className="text-lg max-w-7xl mx-auto">
                            Cada integrante traz consigo não apenas
                            conhecimento jurídico de excelência,
                            mas também comprometimento com
                            resultados e com a construção de relações
                            de confiança.
                        </p>
                        <p className="text-lg max-w-7xl mx-auto">
                            A sinergia entre técnica, estratégia e
                            dedicação garante que nossos clientes
                            recebam sempre a melhor solução,
                            com clareza, segurança e eficiência.
                        </p>
                    </div>

                    {/* Grid da equipe */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-16 justify-items-center">
                        {equipe.map((membro, index) => (
                            <div
                                key={index}
                                className="flex flex-col items-center text-center max-w-sm"
                            >
                                <div className="relative w-60 h-60 mb-6">
                                    <Image
                                        src={membro.imagem}
                                        alt={membro.nome}
                                        fill
                                        className="rounded-full object-cover border-2 border-[#ba9a71] p-2"
                                    />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900">
                                    {membro.nome}
                                </h3>
                                <p className="text-gray-600 font-medium mb-3">{membro.cargo}</p>
                                <p className="text-sm leading-relaxed">
                                    {membro.descricao}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </>
    );
};

export default Equipe;
