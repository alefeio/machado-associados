import React, { useState, ChangeEvent } from 'react';
import { FaPaperPlane } from 'react-icons/fa'; // Ícone para o botão de envio
import { formatPhoneNumber } from 'utils/formatPhoneNumber';

const ContactForm: React.FC = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [serviceOfInterest, setServiceOfInterest] = useState('');
    const [message, setMessage] = useState('');
    const [status, setStatus] = useState(''); // 'success', 'error', 'submitting'

    const handlePhoneChange = (e: ChangeEvent<HTMLInputElement>) => {
        const formattedPhoneNumber = formatPhoneNumber(e.target.value);
        setPhone(formattedPhoneNumber);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('submitting');

        try {
            const res = await fetch('/api/contact', { 
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, email, phone, serviceOfInterest, message }),
            });

            const data = await res.json();

            if (res.ok) {
                setStatus('success');
                setName('');
                setEmail('');
                setPhone('');
                setServiceOfInterest('');
                setMessage('');
            } else {
                setStatus('error');
                console.error('Erro na resposta da API:', data.message);
            }
        } catch (error) {
            setStatus('error');
            console.error('Erro ao submeter o formulário:', error);
        }
    };

    return (
        <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 max-w-2xl mx-auto mb-[-3rem]"> 
            <div className="text-center mb-8 md:mb-10">
                <h2 className="text-[#0c1a25] text-3xl md:text-4xl font-extrabold leading-tight"> 
                    Entre em contato Conosco
                </h2>
                <p className="text-lg text-gray-700 mt-4 leading-relaxed"> 
                    Compartilhe suas ideias e necessidades. Nossa equipe está pronta para lhe ajudar e lhe acolher, para que você se sinta seguro e tranquilo, pois nosso diferencial está no relacionamento.
                </p>
            </div>
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6"> {/* Grid responsivo */}
                    {/* Input para o Nome */}
                    <div className="md:col-span-1"> {/* Ocupa 1 coluna em desktop */}
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Seu Nome Completo" 
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ba9a71] bg-gray-50 text-gray-900 placeholder-gray-500" 
                        />
                    </div>
                    {/* Input para o Email */}
                    <div className="md:col-span-1"> {/* Ocupa 1 coluna em desktop */}
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Seu Melhor E-mail" 
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ba9a71] bg-gray-50 text-gray-900 placeholder-gray-500"
                        />
                    </div>
                    {/* Input para o Telefone */}
                    <div className="md:col-span-2"> {/* Ocupa 2 colunas em desktop */}
                        <input
                            type="text"
                            value={phone}
                            onChange={handlePhoneChange}
                            placeholder="Seu Telefone/WhatsApp (Opcional)" 
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ba9a71] bg-gray-50 text-gray-900 placeholder-gray-500"
                        />
                    </div>
                </div>
                {/* Select e Textarea com cores e estilo consistentes */}
                <select
                    value={serviceOfInterest}
                    onChange={(e) => setServiceOfInterest(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ba9a71] bg-gray-50 text-gray-900 placeholder-gray-500"
                >
                    <option value="">Selecione a área (Opcional)</option>
                    <option value="DireitoCivilContratual">Direito Civil e Contratual</option>
                    <option value="DireitoConsumidor">Direito do Consumidor</option>
                    <option value="DireitoImobiliario">Direito Imobiliário</option>
                    <option value="DireitoEmpresarial">Direito Empresarial</option>
                    <option value="DireitoMedicosResidentes">Direito dos Médicos Residentes</option>
                    <option value="DireitoRegistralUrbanistico">Direito Registral e Urbanístico</option>
                    <option value="Outro">Outro</option>
                </select>
                <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Descreva sua necessidade em detalhes..." 
                    rows={6} 
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ba9a71] bg-gray-50 text-gray-900 placeholder-gray-500"
                ></textarea>
                <button
                    type="submit"
                    disabled={status === 'submitting'}
                    className="mt-4 w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary hover:bg-primary-dark text-white font-bold rounded-full shadow-lg transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed transform hover:-translate-y-1" 
                >
                    {status === 'submitting' ? 'Enviando...' : 'Enviar Mensagem'}
                    <FaPaperPlane className="ml-2" />
                </button>
                {status === 'success' && (
                    <p className="mt-4 text-green-600 font-medium text-center text-lg">
                        Sua mensagem foi enviada com sucesso! Em breve entraremos em contato.
                    </p>
                )}
                {status === 'error' && (
                    <p className="mt-4 text-red-600 font-medium text-center text-lg">
                        Ocorreu um erro ao enviar sua mensagem. Por favor, tente novamente.
                    </p>
                )}
            </form>
        </div>
    );
};

export default ContactForm;
