import { useRouter } from "next/router";
import React from "react";

export default function Structure() {
  const router = useRouter();

  const handleClick = (pg: string) => {
    router.push(pg);
  };

  return (
    <>
      <span id="sobre" className="my-16"></span>

      <section className="w-full bg-[#0c1a25]">
        <div className="flex flex-col-reverse md:flex-row w-full h-auto md:h-[70vh]">
          {/* Coluna da Esquerda - Texto */}
          <div className="w-full md:w-2/3 flex flex-col justify-center px-6 md:px-16 py-16">
            <h2 className="text-3xl md:text-5xl text-center md:text-left font-extrabold text-[#ba9a71] mb-6 leading-tight">
              Estrutura do Escritório
            </h2>

            <p className="text-white text-lg mb-5 leading-relaxed">
              Na <strong>Machado – Advogados Associados</strong>, entendemos que
              confiança também se constrói por meio da solidez de nossa estrutura.
            </p>

            <p className="text-white text-lg mb-5 leading-relaxed">
              Nosso escritório conta com infraestrutura moderna, ambiente
              corporativo sofisticado e recursos tecnológicos que permitem
              agilidade no atendimento e segurança no gerenciamento de informações.
            </p>

            <p className="text-white text-lg leading-relaxed">
              Estamos preparados para atuar em demandas complexas, com equipe
              multidisciplinar e suporte técnico de alto padrão.
            </p>
          </div>

          {/* Coluna da Direita - Imagem */}
          <div className="w-full md:w-1/3 h-full md:h-auto">
            <img
              src="/images/structure.jpg"
              alt="Escritório moderno com equipe trabalhando"
              className="w-full h-full object-cover object-right-top"
            />
          </div>
        </div>
      </section>
    </>
  );
}
