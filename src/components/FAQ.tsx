import { useState } from "react";
import React from 'react';
import { FaPlus, FaMinus } from "react-icons/fa"; // Importa os ícones de mais e menos

// Define a tipagem dos dados que serão passados para o componente
interface FAQItem {
  id: string;
  pergunta: string;
  resposta: string;
}

// Define a tipagem das props do componente
interface FAQPageProps {
  faqs: FAQItem[];
}

export default function FAQ({ faqs }: FAQPageProps) {
  const [open, setOpen] = useState<number | null>(null);

  const toggleOpen = (index: number) => {
    setOpen(open === index ? null : index);
  };

  return (
    <>
      <section className="bg-[#1a3045] py-24 md:py-32"> {/* Adiciona um fundo claro à seção */}
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center mb-12 md:mb-16"> {/* Aumenta margem inferior */}
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-400 leading-tight"> {/* Mais destaque ao título */}
              Perguntas Frequentes
            </h2>
          </div>

          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4">
            {faqs.map((faq, idx) => (
              <div
                key={faq.id}
                className={`bg-white rounded-xl shadow-sm overflow-hidden transition-all duration-300 ${open === idx ? 'border-2 border-[#ba9a71]/30' : 'border border-[#ba9a71]/30' // Borda destacada quando aberto
                  }`}
              >
                <button
                  className={`w-full text-left p-7 transition-colors flex justify-between items-center bg-white`}
                  onClick={() => toggleOpen(idx)}
                >
                  <span className="text-sm md:text-md font-semibold text-gray-800"> {/* Aumenta tamanho da fonte */}
                    {faq.pergunta}
                  </span>
                  <span className="text-xl text-[#ba9a71]"> {/* Ícones para mais/menos */}
                    {open === idx ? <FaMinus /> : <FaPlus />}
                  </span>
                </button>
                <div
                  className={`transition-all duration-300 ease-in-out overflow-hidden ${open === idx ? 'max-h-96 opacity-100 p-7 pt-0 bg-white' : 'max-h-0 opacity-0' // Fundo mais claro quando aberto
                    }`}
                >
                  <p className="text-gray-700 leading-relaxed"> {/* Cor do texto ajustada */}
                    {faq.resposta}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
