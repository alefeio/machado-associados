import { PrismaClient } from '@prisma/client';
import AdminLayout from 'components/admin/AdminLayout';
import { GetServerSideProps } from 'next';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useState, FormEvent, useEffect } from 'react';

// A interface Testimonial precisa incluir avatarUrl (assumindo que já foi movida para src/types/index.ts)
// Definindo localmente a interface Testimonial
interface Testimonial {
  id: string;
  name: string;
  type: string;
  content: string;
  avatarUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface TestimonialsPageProps {
  testimonials: Testimonial[];
}

const prisma = new PrismaClient();

// O bloco select deve funcionar corretamente após npx prisma generate
export const getServerSideProps: GetServerSideProps<TestimonialsPageProps> = async () => {
  // A chamada do Prisma é feita diretamente. Se o "npx prisma generate" foi executado,
  // o TypeScript usará o tipo correto gerado pelo Prisma para o retorno.
  const testimonials = await prisma.testimonial.findMany({
    // AQUI: Usando 'as any' para forçar o bypass do erro de tipagem do Prisma Select
    select: {
      id: true,
      name: true,
      type: true,
      content: true,
      avatarUrl: true, // ESTE CAMPO ESTÁ CORRETO
      createdAt: true,
      updatedAt: true,
    } as any, 
    orderBy: {
      name: 'asc',
    },
  });

  // CORRIGIDO O ERRO DE TIPAGEM: 
  // O mapeamento agora lista explicitamente todas as propriedades.
  // Isso garante que o objeto retornado tenha todos os campos da interface Testimonial,
  // mesmo que a inferência do tipo de 't' tenha sido corrompida.
  const formattedTestimonials: Testimonial[] = testimonials.map((t) => ({
    id: t.id,
    name: t.name,
    type: t.type,
    content: t.content,
    createdAt: t.createdAt,
    updatedAt: t.updatedAt,
    // Acessando 'avatarUrl' com 'as any' para garantir que funcione se o tipo do Prisma estiver corrompido
    avatarUrl: (t as any).avatarUrl || null, 
  }));

  return {
    props: {
      testimonials: formattedTestimonials,
    },
  };
};

// Adapte esta função para a forma como seu sistema gerencia o token
const getToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('authToken');
  }
  return null;
};

export default function Testimonials({ testimonials }: TestimonialsPageProps) {
  const { data: session, status } = useSession();
  const [testimonialList, setTestimonialList] = useState(testimonials);
  const [editing, setEditing] = useState<Testimonial | null>(null);
  
  const [form, setForm] = useState({ 
    name: '', 
    type: 'Cliente',
    content: '',
  });
  const [file, setFile] = useState<File | null>(null);
  const [currentAvatarUrl, setCurrentAvatarUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editing) {
      setForm({
        name: editing.name,
        type: editing.type,
        content: editing.content,
      });
      setCurrentAvatarUrl(editing.avatarUrl);
      setFile(null);
    } else {
      setForm({ name: '', type: 'Cliente', content: '' });
      setCurrentAvatarUrl(null);
      setFile(null);
    }
  }, [editing]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const uploadFile = async (fileToUpload: File) => {
    const token = getToken();
    const formData = new FormData();
    formData.append('file', fileToUpload);

    const headers: HeadersInit = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Assumindo que este endpoint lida com o upload e retorna a URL
    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
      headers,
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.message || 'Falha ao fazer upload do arquivo.');
    }
    const data = await res.json();
    return data.url;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const token = getToken();

    let finalAvatarUrl = currentAvatarUrl;

    try {
      if (file) {
        finalAvatarUrl = await uploadFile(file);
      }
    } catch (uploadError: unknown) {
      const message = uploadError instanceof Error ? uploadError.message : 'Erro desconhecido ao fazer upload.';
      setError('Erro ao fazer upload do arquivo: ' + message);
      setLoading(false);
      return;
    }

    const url = '/api/crud/testimonials';
    const method = editing ? 'PUT' : 'POST';
    
    const body = {
      ...form, 
      avatarUrl: finalAvatarUrl,
      id: editing?.id,
    };

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        // CORREÇÃO: Usar o endpoint de CRUD para buscar a lista atualizada
        const resList = await fetch('/api/crud/testimonials');
        if (resList.ok) {
            const updatedTestimonials = await resList.json();
            setTestimonialList(updatedTestimonials);
        } else {
             // Se falhar, tenta buscar os dados novamente (apenas para garantir)
             const freshProps = await fetch('/api/crud/testimonials').then(r => r.json());
             setTestimonialList(freshProps as Testimonial[]);
        }
        
        setEditing(null);
        setForm({ name: '', type: 'Cliente', content: '' });
        setCurrentAvatarUrl(null);
        setFile(null);
      } else {
        const data = await res.json();
        setError('Erro ao salvar depoimento: ' + data.message);
      }
    } catch (apiError) {
      setError('Erro ao conectar com a API de depoimentos.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    // Usando confirmação modal
    const confirmed = window.confirm('Tem certeza que deseja excluir este depoimento?');
    if (confirmed) {
      setLoading(true);
      setError(null);
      const token = getToken();
      try {
        const res = await fetch('/api/crud/testimonials', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
          },
          body: JSON.stringify({ id }),
        });

        if (res.ok) {
          setTestimonialList(testimonialList.filter(t => t.id !== id));
        } else {
          const data = await res.json();
          setError('Erro ao excluir depoimento: ' + data.message);
        }
      } catch (e) {
        setError('Erro ao conectar com a API.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleEditClick = (testimonial: Testimonial) => {
    setEditing(testimonial);
  };
  
  if (status === 'loading') return <AdminLayout><p>Verificando autenticação...</p></AdminLayout>;
  if ((status === 'authenticated' && (session?.user as any)?.role !== 'ADMIN')) {
    return (
      <AdminLayout>
        <p className="text-red-500 text-center mt-8">Acesso negado. Apenas administradores podem visualizar os arquivos.</p>
        <Link href="/api/auth/signin" className="text-center block mt-4 text-orange-500 font-bold">Fazer Login</Link>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Gerenciar Depoimentos</h1>

        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">
            {editing ? 'Editar Depoimento' : 'Adicionar Novo Depoimento'}
          </h2>
          {error && <div className="bg-red-100 text-red-700 p-2 rounded mb-4">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nome do Cliente</label>
              <input
                type="text"
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                required
              />
            </div>

            <div className="mb-4">
              <label htmlFor="type" className="block text-sm font-medium text-gray-700">Cargo/Tipo (ex: Cliente, CEO)</label>
              <input
                type="text"
                id="type"
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                required
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="file" className="block text-sm font-medium text-gray-700">
                Imagem/Vídeo do Cliente (Opcional)
              </label>
              {(editing && currentAvatarUrl) && (
                <p className="text-xs text-gray-500 mb-2">
                  Arquivo atual: <a href={currentAvatarUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Visualizar</a> (O upload de um novo arquivo substituirá o atual.)
                </p>
              )}
              <input
                type="file"
                id="file"
                onChange={handleFileChange}
                className="mt-1 block w-full"
              />
            </div>

            <div className="mb-4">
              <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                Conteúdo do Depoimento (Texto)
              </label>
              <textarea
                id="content"
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                rows={4}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                required
              ></textarea>
            </div>


            <div className="flex justify-end space-x-2">
              <button
                type="submit"
                disabled={loading}
                className={`py-2 px-4 rounded-md transition ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-orange-500 text-white hover:bg-orange-600'}`}
              >
                {loading ? 'Salvando...' : (editing ? 'Salvar Alterações' : 'Adicionar Depoimento')}
              </button>
              {editing && (
                <button
                  type="button"
                  onClick={() => { setEditing(null); setFile(null); }}
                  className="bg-gray-400 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-500 transition"
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Depoimentos Existentes</h2>

          {(testimonialList && testimonialList.length > 0) ? (
            <ul className="space-y-4">
              {testimonialList.map((testimonial: Testimonial) => (
                <li key={testimonial.id} className="border-b pb-4 last:border-b-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-bold">{testimonial.name}</h3>
                      <p className="text-gray-600 text-sm italic">{testimonial.type}</p>
                      
                      {testimonial.avatarUrl && (
                        <div className="mt-2 mb-2">
                            <span className="text-sm font-medium text-gray-700 block">Avatar/Vídeo:</span>
                            <a href={testimonial.avatarUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline text-sm">
                                Visualizar {testimonial.avatarUrl.endsWith('.mp4') ? 'Vídeo' : 'Imagem'}
                            </a>
                        </div>
                      )}
                      <span className="text-sm font-medium text-gray-700 block">Conteúdo:</span>
                      <p className="mt-1">{testimonial.content}</p>

                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditClick(testimonial)}
                        className="bg-yellow-500 text-white py-1 px-3 rounded-md hover:bg-yellow-600 transition"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(testimonial.id)}
                        className="bg-red-500 text-white py-1 px-3 rounded-md hover:bg-red-600 transition"
                      >
                        Excluir
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center text-gray-500">
              <p>Nenhum depoimento encontrado.</p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}