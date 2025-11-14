import React from "react";
import {
  HiOutlineScale,
  HiOutlineDocumentText,
} from "react-icons/hi";
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
    url: '/images/ico-areas-1.png',
  },
  {
    title: "Direito do Consumidor",
    description:
      "Defesa de consumidores e empresas em demandas relacionadas a relações de consumo.",
    url: '/images/ico-areas-2.png',
  },
  {
    title: "Direito Empresarial",
    description:
      "Consultoria e contencioso voltados à proteção e ao crescimento de empresas.",
    url: '/images/ico-areas-3.png',
  },
  {
    title: "Direito dos Médicos Residentes",
    description:
      "Atuação pioneira em ações que asseguram direitos e benefícios previstos em lei.",
    url: '/images/ico-areas-4.png',
  },
  {
    title: "Direito Imobiliário",
    description:
      "Regularização, compra, venda e assessoria em empreendimentos.",
    url: '/images/ico-areas-5.png',
  },
  {
    title: "Direito Registral e Urbanístico",
    description:
      "Soluções jurídicas para regularização fundiária, registros e gestão de imóveis urbanos.",
    url: '/images/ico-areas-6.png',
  },
];

export default function ServicesSection() {
  return (
    <section className="bg-[#0c1a26]/70 py-36 mt-20 relative z-20">
      <div className="max-w-6xl mx-auto px-6 md:px-10 grid grid-cols-1 md:grid-cols-2 gap-x-72 gap-y-14">
        {services.map((service, index) => (
          <div
            key={index}
            className="flex items-start gap-4 md:gap-5 text-left"
          >
            <div className="flex-shrink-0">
              <img
                src={service.url}
                alt={service.title || 'Banner Sobre'}
                className="object-cover object-[center] w-full h-20"
              />
            </div>
            <div>
              <h3 className="text-2xl md:text-3xl font-extrabold text-[#ba9a71] mb-1 leading-snug">
                {service.title}
              </h3>
              <p className="text-gray-200 text-base leading-relaxed">
                {service.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
