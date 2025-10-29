import { useRouter } from "next/router";

export default function LocationMap() {
    const router = useRouter();

    const handleClick = (pg: string) => {
        router.push(pg);
    };

    return (
        <>
            <div id="localizacao">&nbsp;</div>
            <section className="my-16 md:max-w-5xl mx-auto px-4">
                <h2 className="font-serif text-2xl md:text-3xl font-bold mb-6 text-center">
                    Onde Estamos
                </h2>
                <address className="not-italic text-center mb-6 border-t-2 border-primary py-6 w-fit m-auto">
                    R. dos Mundurucus, 2564 - Jurunas, Belém - PA, 66040-033
                    <br />
                    <span className="font-semibold">
                        <a
                            target="_blank"
                            rel="noopener noreferrer"
                            href="https://wa.me//5591985810208?text=Gostaria de mais informações. Estou entrando em contato através do site."
                            onClick={() => handleClick('/whatsapp')}
                        >
                            Clique aqui e fale com a gente no WhatsApp: (91) 98581-0208
                        </a>
                    </span>
                </address>
                <div className="flex flex-col items-center">
                    <div className="w-full h-72 rounded-xl overflow-hidden shadow-lg mb-4 mb-16">
                        <iframe
                            title="My Dress Belém"
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3988.5255502831114!2d-48.482816799999995!3d-1.4585907!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x92a48e80c5f31cff%3A0x23419555a1518e5c!2sR.%20dos%20Mundurucus%2C%202564%20-%20Jurunas%2C%20Bel%C3%A9m%20-%20PA%2C%2066040-033!5e0!3m2!1spt-BR!2sbr!4v1761690187775!5m2!1spt-BR!2sbr"
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            allowFullScreen
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                        />
                    </div>
                </div>
            </section>
        </>
    )
}