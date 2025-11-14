import React, { useState, useEffect, useCallback } from 'react';
import { FaPlus, FaMinus } from 'react-icons/fa'; // Importando ícones para o acordeão
import { richTextToHtml } from 'utils/richTextToHtml';

interface ProjetoFoto {
    id: string;
    local: string;
    tipo: string;
    detalhes: string;
    img: string; // URL da imagem
}

interface Projeto {
    id: string;
    title: string;
    subtitle: string;
    description: string; 
    order: number;
    publico: boolean;
    items: ProjetoFoto[];
}

interface AccordionItemProps {
    title: string;
    content: string;
    isOpen: boolean;
    setOpen: () => void;
}

interface ProjetoCardProps {
    projeto: Projeto;
    isOpen: boolean;
    toggleAccordion: (id: string) => void;
}

const ProjetoCard: React.FC<ProjetoCardProps> = ({ projeto, isOpen, toggleAccordion }) => {
    const [openOtherIndex, setOpenOtherIndex] = useState<number | null>(null);

    const toggleOther = (index: number) => {
        setOpenOtherIndex(openOtherIndex === index ? null : index);
    };
    
    const mainContentHtml = richTextToHtml(projeto.description);


    return (
        <div 
            key={projeto.id} 
            className="bg-[#0c1a25] rounded-xl shadow-lg overflow-hidden border border-[#ba9a71]/20" 
        >
            <div 
                className={`p-6 cursor-pointer flex justify-between items-center ${!isOpen ? 'border-b border-[#ba9a71]/30' : ''}`}
                onClick={() => toggleAccordion(projeto.id)}
            >
                <h3 className="text-xl md:text-2xl font-bold text-[#ba9a71]">{projeto.title}</h3>
                <button
                    className="p-2 text-[#ba9a71] hover:text-white transition-colors duration-200"
                    aria-label={isOpen ? 'Fechar detalhes' : 'Abrir detalhes'}
                >
                    {isOpen ? <FaMinus size={18} /> : <FaPlus size={18} />}
                </button>
            </div>

            <div
                className={`transition-all duration-500 ease-in-out overflow-hidden`}
                style={{ maxHeight: isOpen ? '1000px' : '0' }} 
            >
                <div className="p-6 pt-0 text-white space-y-4">
                    <div className="prose prose-invert max-w-none text-white leading-relaxed" dangerouslySetInnerHTML={{ __html: mainContentHtml }} />

                </div>
            </div>
        </div>
    );
};

const Casos: React.FC = () => {
    const [projects, setProjects] = useState<Projeto[]>([]);
    const [loading, setLoading] = useState(true);
    const [openProjectId, setOpenProjectId] = useState<string | null>(null);

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/crud/projetos", { method: "GET" });
            const data = await res.json();
            if (res.ok && data.success) {
                const publicProjetos = data.projetos.filter((p: Projeto) => p.publico);
                setProjects(publicProjetos.sort((a: Projeto, b: Projeto) => a.order - b.order));
            } else {
                console.error("Erro ao carregar projetos:", data.message);
            }
        } catch (e) {
            console.error("Erro ao conectar com a API de projetos.", e);
        } finally {
            setLoading(false);
        }
    };

    const toggleAccordion = (projectId: string) => {
        setOpenProjectId(openProjectId === projectId ? null : projectId);
    };

    return (
        <>
            <span id="blog" className='my-16'></span>
            <div className="bg-[#0c1a26]/70 py-24">
                <div className="container mx-auto px-4 md:px-8">
                    {loading ? (
                        <p className="text-center text-gray-400 text-xl py-10">Carregando casos...</p>
                    ) : (
                        <div className="grid grid-cols-1 gap-8">
                            {projects.map((projeto) => (
                                <ProjetoCard 
                                    key={projeto.id}
                                    projeto={projeto}
                                    isOpen={openProjectId === projeto.id}
                                    toggleAccordion={toggleAccordion}
                                />
                            ))}
                        </div>
                    )}

                </div>

            </div>
        </>
    );
};

export default Casos;