import Link from "next/link";
import { useRouter } from "next/router";
import React from "react";

export default function Hero() {
  const router = useRouter();

  const handleClick = (pg: string) => {
    router.push(pg);
  };

  return (
    <section className="bg-[#0c1a26] py-16 md:py-28">
      <div className="max-w-7xl mx-auto px-8">
        {/* Conteúdo principal: texto e imagem lado a lado em telas maiores */}
        <div className="flex flex-col md:flex-row items-center gap-16 md:gap-24">
          {/* Coluna da direita: Imagem (aparece primeiro em mobile, depois do texto em md e acima) */}
          <div className="block flex-1 relative w-full md:max-w-xl overflow-hidden rounded-[4rem] transition-transform duration-500 ease-in-out transform hover:scale-102 order-first md:order-none">
            <img
              src="/images/daniel2.jpg"
              alt="Equipe de engenheiros e arquitetos colaborando"
              className="w-full h-auto object-cover max-h-96 md:max-h-full"
            />
          </div>

          {/* Coluna da esquerda: Texto principal e botão (aparece depois da imagem em mobile, e primeiro em md e acima) */}
          <div className="flex-1 flex flex-col items-start md:items-start text-left gap-5">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#ba9a71] leading-tight max-w-4xl mx-auto">
              Nosso compromisso com a transparência
            </h2>
            <p className="text-white text-lg max-w-xl md:max-w-none">
              Atender pessoas arrojadas e que valorizam qualidade em uma jornada conveniente e com entusiasmo.
            </p>
            <p className="text-white text-lg max-w-xl md:max-w-none">
              Queremos os ajudar a se sentir acolhidos para ter mais tranquilidade no seu dia a dia.
            </p>
            <p className="text-white text-lg max-w-xl md:max-w-none">
              Entendemos que o diferencial está no relacionamento, por isso nossos clientes se sentem mais seguros e tranquilos.
            </p>
            <p className="text-[#ba9a71] font-bold text-lg max-w-xl md:max-w-none">
              Daniel Machado<br />
              <small>CEO e Sócio Fundador</small>
            </p>
            {/* <div className="mt-6 w-fit">
              <a
                href="/sobre"
                className="inline-block bg-primary text-white font-bold py-3 px-8 rounded-full shadow-lg hover:bg-primary-dark transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-xl"
              >
                Leia mais
              </a>
            </div> */}
          </div>
        </div>
      </div>
    </section>
  );
}
