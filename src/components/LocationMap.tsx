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
                    Ed. Angra - Travessa São Pedro, 842, sala 301 - Batista Campos - Belém - PA
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
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3988.5221138970182!2d-48.493792799999994!3d-1.4605280999999997!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x92a48e61f5802201%3A0x41904427b403b82f!2sTv.%20S%C3%A3o%20Pedro%2C%20842%20-%20Batista%20Campos%2C%20Bel%C3%A9m%20-%20PA%2C%2066030-465!5e0!3m2!1spt-BR!2sbr!4v1761805811395!5m2!1spt-BR!2sbr"
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