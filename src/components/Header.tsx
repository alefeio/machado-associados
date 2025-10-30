import { useState } from "react"
import { FaPlus, FaMinus } from "react-icons/fa"

const servicesList = [
  {
    title: "Missão",
    description: `Garantir soluções jurídicas
      de alto nível, protegendo os
      interesses de nossos clientes
      com responsabilidade,
      estratégia e inovação.`,
  },
  {
    title: "Visão",
    description: `Ser referência nacional
      em advocacia consultiva e
      contenciosa, reconhecida
      pela excelência, solidez e
      resultados consistentes.`,
  },
  {
    title: "Atendimento Personalizado",
    description:
      "Entendemos que o diferencial está no relacionamento, por isso nossos clientes se sentem mais seguros e tranquilos",
  },
  {
    title: "Transparência e Ética",
    description:
      "Agimos com clareza e responsabilidade em todas as etapas do processo jurídico. Mantemos nossos clientes sempre informados, com uma comunicação aberta e decisões baseadas na verdade e no respeito aos princípios éticos da advocacia.",
  },
  {
    title: "Especialização Profissional",
    description:
      "Nossa equipe é formada por profissionais experientes, com sólida formação jurídica e atuação em diversas áreas do direito. Combinamos conhecimento técnico, visão estratégica e sensibilidade humana para oferecer soluções eficazes e personalizadas.",
  },
]

const stats = [
  { value: "Ética", label: "Transparência em todas as relações" },
  { value: "Compromisso", label: "Absoluto com os clientes" },
  { value: "Excelência", label: "Técnica e atualização constante" },
  { value: " Inovação", label: "Uso estratégico da tecnologia" },
  { value: " Respeito", label: "Às pessoas e à sociedade" },
]

export default function Header() {
  // Agora open é um array com índices dos colapses abertos
  const [open, setOpen] = useState<number[]>([0])

  const toggleOpen = (index: number) => {
    setOpen((prev) =>
      prev.includes(index)
        ? prev.filter((i) => i !== index) // Fecha se já estiver aberto
        : [...prev, index] // Abre e mantém os outros abertos
    )
  }

  return (
    <>
      <span id="sobre" className='my-16'></span>
      <div className="bg-[#0c1a25]">
        <section className="py-16 md:py-28">
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-start">
              {/* Coluna da esquerda */}
              <div className="flex flex-col gap-5">
                <h2 className="w-full text-center md:text-left text-4xl md:text-5xl font-extrabold text-[#ba9a71] leading-tight max-w-2xl mx-auto md:mx-0 text-left">
                  Sobre a Machado
                  <br />
                  <small className="text-[#ba9a71] font-medium">
                    – Advogados Associados
                  </small>
                </h2>

                <p className="text-white text-lg leading-relaxed max-w-xl mx-auto md:mx-0 text-left">
                  A Machado – Advogados Associados nasceu com o propósito de oferecer soluções jurídicas modernas,
                  eficientes e seguras, sempre pautadas na ética e no compromisso com resultados concretos.
                </p>

                <p className="text-white text-lg leading-relaxed max-w-xl mx-auto md:mx-0 text-left">
                  Com uma equipe altamente qualificada e estrutura robusta, atuamos de forma estratégica para atender
                  empresas e clientes que buscam confiança, agilidade e inovação no ambiente jurídico.
                </p>

                <p className="text-white text-lg leading-relaxed max-w-xl mx-auto md:mx-0 text-left">
                  Nosso diferencial está na combinação entre tradição e visão de futuro: entregamos assessoria jurídica
                  de excelência, com linguagem clara, objetiva e personalizada.
                </p>
              </div>

              {/* Coluna da direita: acordeões */}
              <div className="flex flex-col gap-4 mt-8 md:mt-0 max-w-xl mx-auto md:mx-0">
                {servicesList.map((service, index) => (
                  <div
                    key={index}
                    className="rounded-lg shadow-md overflow-hidden transition-all duration-300 bg-[#1a3045]"
                  >
                    <button
                      className="w-full text-left p-6 bg-[#1a3045] hover:bg-gray-600 transition-colors flex justify-between items-center text-white"
                      onClick={() => toggleOpen(index)}
                    >
                      <span className="text-lg md:text-xl font-semibold">{service.title}</span>
                      <span className="text-2xl font-bold text-[#ba9a71]">
                        {open.includes(index) ? <FaMinus /> : <FaPlus />}
                      </span>
                    </button>
                    <div
                      className={`transition-all duration-300 ease-in-out overflow-hidden ${open.includes(index)
                        ? "max-h-96 opacity-100 p-6 pt-0 bg-[#1a3045]"
                        : "max-h-0 opacity-0"
                        }`}
                    >
                      <p className="text-gray-300">{service.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-16 md:mt-0 flex flex-col gap-6 w-full mx-auto md:mx-0">

              <p className="text-[#ba9a71] text-3xl font-bold leading-relaxed max-w-xl mx-auto md:mx-0 text-left">
                Nossos Valores:
              </p>

              <div className="flex flex-col sm:flex-row justify-center sm:justify-start gap-8 sm:gap-12">
                {stats.map((stat, index) => (
                  <div key={index} className="flex flex-col items-center sm:items-start text-left">
                    <span className="text-2xl font-bold text-gray-500">{stat.value}</span>
                    <span className="text-white text-lg font-medium">{stat.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}
