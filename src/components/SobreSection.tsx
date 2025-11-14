import React from "react";

export default function SobreSection() {
    return (
        <section className="bg-[#0c1a26]/70 py-20 relative z-20"> {/* Ajustei o padding vertical */}
            <div className="max-w-7xl mx-auto px-6">

                <div className="text-white text-xl leading-relaxed space-y-8 mb-10">
                    <p>
                        A <span className="font-extrabold">Machado - Advogados Associados</span> nasceu com o propósito de oferecer soluções jurídicas
                        modernas, eficientes e seguras, sempre pautadas na ética e no compromisso com resultados
                        concretos.
                    </p>
                    <p>
                        Com uma equipe altamente qualificada e estrutura robusta, atuamos de forma estratégica
                        para atender empresas e clientes que buscam confiança, agilidade e inovação no ambiente
                        jurídico.
                    </p>
                    <p>
                        Nosso diferencial está na combinação entre tradição e visão de futuro: entregamos assessoria
                        jurídica de excelência, com linguagem clara, objetiva e personalizada.
                    </p>
                </div>

            </div>
        </section>
    );
}