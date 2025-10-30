import React from "react";
import {
  HiOutlineScale,
  HiOutlineDocumentText,
} from "react-icons/hi"; // ícones gerais
import {
  BsBuilding,
  BsClipboardCheck,
  BsPersonBadge,
  BsHouseDoor,
} from "react-icons/bs";

const services = [
  {
    title: "Direito Civil e Contratual",
    description:
      "Elaboração, análise e execução de contratos, além de soluções para litígios cíveis.",
    subText: "Contratos | Responsabilidade Civil | Obrigações e Danos Morais.",
    icon: <HiOutlineDocumentText className="h-7 w-7 text-white" />,
  },
  {
    title: "Direito do Consumidor",
    description:
      "Defesa de consumidores e empresas em demandas relacionadas a relações de consumo.",
    subText: "Ações contra empresas | Cláusulas abusivas | Reparações e garantias.",
    icon: <HiOutlineScale className="h-7 w-7 text-white" />,
  },
  {
    title: "Direito Imobiliário",
    description:
      "Regularização, compra, venda e assessoria em empreendimentos.",
    subText:
      "Usucapião | Compra e Venda | Contratos de Locação | Condomínios.",
    icon: <BsHouseDoor className="h-7 w-7 text-white" />,
  },
  {
    title: "Direito Empresarial",
    description:
      "Consultoria e contencioso voltados à proteção e ao crescimento de empresas.",
    subText:
      "Abertura de empresas | Contratos Sociais | Assessoria Preventiva.",
    icon: <BsBuilding className="h-7 w-7 text-white" />,
  },
  {
    title: "Direito dos Médicos Residentes",
    description:
      "Atuação pioneira em ações que asseguram direitos e benefícios previstos em lei.",
    subText:
      "Bolsa-auxílio | Direitos Trabalhistas | Proteção Jurídica do Residente.",
    icon: <BsPersonBadge className="h-7 w-7 text-white" />,
  },
  {
    title: "Direito Registral e Urbanístico",
    description:
      "Soluções jurídicas para regularização fundiária, registros e gestão de imóveis urbanos.",
    subText:
      "Regularização de imóveis | Cartórios | Planejamento e Licenciamento Urbano.",
    icon: <BsClipboardCheck className="h-7 w-7 text-white" />,
  },
];

const ServicesSection = () => {
  return (
    <>
      <span id="atuacao" className="my-16"></span>
      <section className="bg-white py-16 md:py-28">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          {/* Título da Seção */}
          <h2 className="text-4xl md:text-5xl font-extrabold text-center text-[#0c1a25] mb-12 md:mb-16">
            Áreas de Atuação
          </h2>

          {/* Grade de Serviços */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 md:gap-14">
            {services.map((service, index) => (
              <div
                key={index}
                className="bg-[#0c1a25] flex flex-col items-center gap-6 p-8 rounded-lg shadow-lg overflow-hidden transform transition-transform hover:scale-105 hover:shadow-2xl duration-300 border border-[#ba9a71]/20"
              >
                <div className="flex-shrink-0 w-14 h-14 rounded-full bg-[#ba9a71] flex items-center justify-center">
                  {service.icon}
                </div>
                <div className="flex-1 text-center">
                  <h3 className="text-2xl font-bold text-[#ba9a71] mb-2">
                    {service.title}
                  </h3>
                  <p className="text-gray-300 mb-4 leading-relaxed">
                    {service.description}
                  </p>
                  <div className="text-sm text-gray-400">
                    <p className="text-[#ba9a71] font-semibold mb-1">
                      Serviços associados:
                    </p>
                    <p className="text-gray-300">{service.subText}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default ServicesSection;
