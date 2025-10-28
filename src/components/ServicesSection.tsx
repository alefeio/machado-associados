import React from 'react';
import { HiOutlineScale } from 'react-icons/hi'; // balança da justiça
import { BsBriefcase, BsBuilding } from 'react-icons/bs'; // ícones para trabalhista e empresarial

const services = [
  {
    title: "Direito do Consumidor",
    description:
      "Oferecemos suporte especializado para proteger os direitos dos consumidores. Atuamos em casos de cobranças indevidas, cláusulas abusivas, cancelamentos e falhas na prestação de serviços, garantindo respeito e reparação nas relações de consumo.",
    subText:
      "Contratos; Reembolsos e Cancelamentos; Conflitos de Consumo; Responsabilidade Civil.",
    icon: <HiOutlineScale className="h-7 w-7 text-white" />,
  },
  {
    title: "Direito Trabalhista",
    description:
      "Nosso serviço abrange todas as nuances do direito trabalhista, desde a orientação sobre direitos e deveres até a resolução de disputas. Atuamos na defesa de empregados e empregadores, assegurando relações de trabalho justas e transparentes.",
    subText:
      "Reclamações Trabalhistas; Acordos e Negociações; Rescisões; Consultoria Preventiva.",
    icon: <BsBriefcase className="h-7 w-7 text-white" />,
  },
  {
    title: "Assessoria Jurídica Empresarial",
    description:
      "Prestamos assessoria jurídica completa para empresas e empreendedores. Nossa atuação preventiva e estratégica visa garantir segurança jurídica, conformidade e apoio contínuo em tomadas de decisão e gestão contratual.",
    subText:
      "Consultoria Estratégica; Compliance; Contratos; Planejamento Jurídico Empresarial.",
    icon: <BsBuilding className="h-7 w-7 text-white" />,
  },
];

const ServicesSection = () => {
  return (
    <section className="bg-gray-50 py-16 md:py-28">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        {/* Título da Seção */}
        <h2 className="text-4xl md:text-5xl font-extrabold text-center text-gray-800 mb-12 md:mb-16">
          Áreas de Atuação
        </h2>

        {/* Grade de Serviços */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-14">
          {services.map((service, index) => (
            <div
              key={index}
              className="bg-gray-800 flex flex-col items-center gap-6 p-8 rounded-lg shadow-lg overflow-hidden transform transition-transform hover:scale-105 hover:shadow-2xl duration-300"
            >
              <div className="flex-shrink-0 w-14 h-14 rounded-full bg-[#ba9a71] flex items-center justify-center">
                {service.icon}
              </div>
              <div className="flex-1 text-center">
                <h3 className="text-2xl font-bold text-[#ba9a71] mb-2">
                  {service.title}
                </h3>
                <p className="text-gray-200 mb-4">{service.description}</p>
                <div className="text-sm text-gray-400">
                  <p className="text-[#ba9a71] font-semibold">
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
  );
};

export default ServicesSection;
