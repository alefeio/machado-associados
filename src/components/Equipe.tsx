import React from "react";
import Image from "next/image";

const equipe = [
  {
    nome: "Daniel Machado",
    cargo: "CEO e Fundador",
    descricao:
      "Tem uma capacidade singular de liderança e visão de mercado. Combina uma profunda compreensão das leis com uma habilidade natural para gerenciar casos complexos, sempre com foco nos melhores interesses de seus clientes. Sua determinação e comprometimento fazem dele uma peça essencial para o sucesso do escritório.",
    imagem: "/images/equipe/adv-daniel.png",
  },
  {
    nome: "Fernanda Amorim",
    cargo: "Advogada",
    descricao:
      "Uma advogada dedicada e detalhista, com uma habilidade incrível para resolver problemas complexos. Ela é conhecida por seu compromisso incansável com seus clientes e pela busca constante de soluções jurídicas inovadoras. Sua abordagem focada e empática garante que cada cliente se sinta ouvido e bem assessorado.",
    imagem: "/images/equipe/adv-fernanda.png",
  },
  {
    nome: "Gabriel Cordovil",
    cargo: "Advogado",
    descricao:
      "Especialista em direito empresarial, com um profundo conhecimento dos desafios enfrentados por empresas modernas. Sua abordagem consultiva e analítica permite que ele ofereça soluções jurídicas personalizadas que atendem tanto às necessidades imediatas quanto aos objetivos de longo prazo de seus clientes corporativos.",
    imagem: "/images/equipe/adv-gabriel.png",
  },
  {
    nome: "Gabriel Henrique",
    cargo: "Advogado",
    descricao:
      "Tem vasta experiência em negociações e uma visão estratégica apurada. Ele é conhecido por sua capacidade de simplificar situações jurídicas complicadas e encontrar o melhor caminho para seus clientes. Seu estilo pragmático e direto ao ponto inspira confiança e garante resultados sólidos.",
    imagem: "/images/equipe/adv-gabriel-henrique.png",
  },
  {
    nome: "Manoella Maués",
    cargo: "Sócia / Advogada",
    descricao:
      "Uma advogada apaixonada pela justiça e conhecida por sua ética impecável. Além de anos de experiência na área, busca uma abordagem humanizada, dedicando tempo para entender a fundo cada caso e sempre buscando a solução mais justa.",
    imagem: "/images/equipe/adv-manoella.png",
  },
];

const Equipe: React.FC = () => {
  return (
    <section className="bg-white py-20">
      <div className="container mx-auto px-6 lg:px-12">
        {/* Título */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Conheça nossa equipe
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Profissionais dedicados que unem conhecimento, experiência e
            compromisso com a justiça.
          </p>
        </div>

        {/* Grid da equipe */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-16 justify-items-center">
          {equipe.map((membro, index) => (
            <div
              key={index}
              className="flex flex-col items-center text-center max-w-sm"
            >
              <div className="relative w-40 h-40 mb-6">
                <Image
                  src={membro.imagem}
                  alt={membro.nome}
                  fill
                  className="rounded-full object-cover"
                />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">
                {membro.nome}
              </h3>
              <p className="text-gray-600 font-medium mb-3">{membro.cargo}</p>
              <p className="text-gray-700 text-sm leading-relaxed">
                {membro.descricao}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Equipe;
