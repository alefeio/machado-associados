import { useState } from "react"
import { FaPlus, FaMinus } from "react-icons/fa" // Importa os ícones de mais e menos

// Dados para a seção de serviços
const servicesList = [
  {
    title: "Nosso Propósito",
    description: "Ajudar as pessoas a identificarem e resolverem seus problemas, fazendo com que sua experiência seja cada vez mais segura através de uma abordagem eficiente e próxima.",
  },
  {
    title: "Atendimento Personalizado",
    description: "Entendemos que o diferencial está no relacionamento, por isso nossos clientes se sentem mais seguros e tranquilos",
  },
  {
    title: "Transparência e Ética",
    description: "Agimos com clareza e responsabilidade em todas as etapas do processo jurídico. Mantemos nossos clientes sempre informados, com uma comunicação aberta e decisões baseadas na verdade e no respeito aos princípios éticos da advocacia.",
  },
  {
    title: "Especialização Profissional",
    description: "Nossa equipe é formada por profissionais experientes, com sólida formação jurídica e atuação em diversas áreas do direito. Combinamos conhecimento técnico, visão estratégica e sensibilidade humana para oferecer soluções eficazes e personalizadas.",
  },
  // {
  //   title: "Construção de Alto Padrão",
  //   description: "Residências e obras públicas com excelência, durabilidade e design exclusivo. Comprometimento com a segurança e a satisfação do cliente em cada construção.",
  // },
]

// Dados para os números de destaque
const stats = [
  { value: "100%", label: "Qualidade" },
  { value: "+15 anos", label: "de história" },
  { value: "+2k", label: "Projetos" },
]

export default function Header() {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <section className="py-16 md:py-28 bg-gray-800"> {/* Aumenta o padding vertical */}
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-start">
          {/* Coluna da esquerda: Conteúdo de texto e números */}
          <div className="flex flex-col gap-5">
            <h2 className="w-full text-4xl md:text-6xl font-extrabold text-[#ba9a71] leading-tight max-w-2xl mx-auto md:mx-0 text-center md:text-left"> {/* Ajusta largura e alinhamento */}
              Compromisso<br /><small className="text-gray-300 font-medium">com seus direitos</small> {/* Ajusta cor e peso da fonte */}
            </h2>
            <p className="text-white text-lg leading-relaxed max-w-xl mx-auto md:mx-0 text-center md:text-left"> {/* Ajusta largura e alinhamento */}
              Da escuta ao resultado, a Machado e Associados oferece soluções jurídicas completas e personalizadas para proteger seus direitos e garantir segurança em cada decisão.
            </p>
            <p className="text-white text-lg leading-relaxed max-w-xl mx-auto md:mx-0 text-center md:text-left"> {/* Ajusta largura e alinhamento */}
              Combinamos transparência, experiência e relacionamento próximo para que cada cliente se sinta acolhido e confiante durante toda a jornada jurídica.
            </p>

            {/* Números de destaque */}
            {/* <div className="flex flex-col sm:flex-row justify-center sm:justify-start gap-8 sm:gap-12 mt-8">
              {stats.map((stat, index) => (
                <div key={index} className="flex flex-col items-center sm:items-start text-center sm:text-left">
                  <span className="text-4xl font-bold text-orange-500">{stat.value}</span>
                  <span className="text-white text-lg font-medium">{stat.label}</span>
                </div>
              ))}
            </div> */}
          </div>

          {/* Coluna da direita: Lista de serviços em formato de "acordeão" */}
          <div className="flex flex-col gap-4 mt-8 md:mt-0 max-w-xl mx-auto md:mx-0"> {/* Ajusta largura máxima e alinhamento */}
            {servicesList.map((service, index) => (
              <div key={index} className="rounded-lg shadow-md overflow-hidden transition-all duration-300 bg-gray-700"> {/* Fundo mais escuro */}
                <button
                  className="w-full text-left p-6 bg-gray-700 hover:bg-gray-600 transition-colors flex justify-between items-center text-white" /* Cores ajustadas */
                  onClick={() => setOpen(open === index ? null : index)}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-xl md:text-2xl font-semibold">{service.title}</span> {/* Ajusta tamanho da fonte */}
                  </div>
                  <span className="text-2xl font-bold text-[#ba9a71]">
                    {open === index ? <FaMinus /> : <FaPlus />} {/* Ícones de mais/menos */}
                  </span>
                </button>
                <div
                  className={`transition-all duration-300 ease-in-out overflow-hidden ${
                    open === index ? 'max-h-96 opacity-100 p-6 pt-0 bg-gray-700' : 'max-h-0 opacity-0'
                  }`}
                >
                  <p className="text-gray-300"> {/* Cor do texto ajustada */}
                    {service.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
