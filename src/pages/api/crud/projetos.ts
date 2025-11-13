import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import prisma from '../../../../lib/prisma'; // ATENÇÃO: Ajuste este caminho conforme necessário

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { method } = req;

    // LOGS DE DEPURACAO GERAIS
    console.log(`\n--- [API /api/crud/posts] INICIO DA REQUISICAO ---`);
    console.log(`[API /api/crud/posts] Método: ${method}`);
    console.log(`--- [API /api/crud/posts] FIM DOS LOGS GERAIS ---\n`);

    // =================================================================
    // Lógica para lidar com a requisição GET (PÚBLICA: Apenas posts publicados)
    // =================================================================
    if (method === 'GET') {
        try {
            // Retorna apenas posts onde 'publicado' é true
            const posts = await prisma.post.findMany({
                where: {
                    publicado: true,
                },
                include: {
                    files: true, // Inclui PostFile
                    categoria: true, // Inclui Categoria
                    tags: { // Inclui as tags através do modelo de junção PostTag
                        include: { tag: true },
                    },
                    comentarios: true, // Opcional: Incluir comentários
                },
                orderBy: {
                    createdAt: 'desc', // Ordena pelo mais recente
                }
            });
            console.log(`[API /api/crud/posts] GET executado. ${posts.length} posts públicos encontrados.`);
            return res.status(200).json({ success: true, posts });
        } catch (e: any) {
            console.error("[API /api/crud/posts] Erro ao buscar posts:", e);
            return res.status(500).json({ success: false, message: e.message });
        }
    }

    // =================================================================
    // Autenticação para POST, PUT, DELETE
    // =================================================================
    const session = await getServerSession(req, res, authOptions);

    if (!session || (session.user as any)?.role !== 'ADMIN') {
        console.warn(`[API /api/crud/posts] Acesso NEGADO para ${method}. Motivo: ${!session ? 'Sessão Ausente' : `Role: ${(session?.user as any)?.role} (não é ADMIN)`}`);
        return res.status(401).json({ success: false, message: 'Acesso não autorizado. Apenas administradores podem gerenciar posts.' });
    }

    // =================================================================
    // Switch para POST, PUT, DELETE (APENAS ADMIN)
    // =================================================================
    switch (method) {
        case 'POST':
            try {
                const { title, subtitle, content, slug, publicado, featuredImage, categoriaId, files, tags } = req.body;
                
                // Validação mínima para campos obrigatórios
                if (!title || !content || !slug) {
                    return res.status(400).json({ success: false, message: "Campos 'title', 'content' e 'slug' são obrigatórios." });
                }

                const novoPost = await prisma.post.create({
                    data: {
                        title,
                        subtitle,
                        content,
                        slug,
                        publicado: publicado ?? false,
                        featuredImage,
                        categoriaId, // Se for null ou undefined, Prisma lida com isso se for opcional
                        
                        // Criação aninhada de PostFiles
                        files: {
                            createMany: {
                                data: (files || []).map((file: any) => ({
                                    local: file.local,
                                    tipo: file.tipo,
                                    detalhes: file.detalhes,
                                    url: file.url, // Usamos 'url' no modelo PostFile
                                })),
                            },
                        },

                        // Criação aninhada de PostTag (junção) para Tags existentes
                        tags: {
                            create: (tags || []).map((tagId: string) => ({
                                tag: { connect: { id: tagId } }
                            })),
                        },
                    },
                });
                console.log(`[API /api/crud/posts] POST executado. Novo post ${novoPost.id} criado.`);
                res.status(201).json({ success: true, post: novoPost });
            } catch (e: any) {
                console.error("[API /api/crud/posts] Erro ao criar post:", e);
                // Útil para erros de unicidade (ex: slug duplicado)
                if (e.code === 'P2002') { 
                    return res.status(409).json({ success: false, message: `O post com o campo duplicado já existe: ${e.meta.target}` });
                }
                res.status(500).json({ success: false, message: e.message });
            }
            break;

        case 'PUT':
            try {
                const { id, title, subtitle, content, slug, publicado, featuredImage, categoriaId, files, tags } = req.body;

                // 1. Limpeza de relações: Excluir todos os PostFiles e PostTags existentes
                await prisma.postFile.deleteMany({
                    where: { postId: id },
                });
                await prisma.postTag.deleteMany({
                    where: { postId: id },
                });

                // 2. Atualizar o Post e recriar as relações
                const postAtualizado = await prisma.post.update({
                    where: { id },
                    data: {
                        title,
                        subtitle,
                        content,
                        slug,
                        publicado: publicado ?? false,
                        featuredImage,
                        categoriaId,

                        // Recriar PostFiles
                        files: {
                            createMany: {
                                data: (files || []).map((file: any) => ({
                                    local: file.local,
                                    tipo: file.tipo,
                                    detalhes: file.detalhes,
                                    url: file.url,
                                })),
                            },
                        },

                        // Recriar PostTags
                        tags: {
                            create: (tags || []).map((tagId: string) => ({
                                tag: { connect: { id: tagId } }
                            })),
                        },
                    },
                });
                console.log(`[API /api/crud/posts] PUT executado. Post ${id} atualizado.`);
                res.status(200).json({ success: true, post: postAtualizado });
            } catch (e: any) {
                console.error("[API /api/crud/posts] Erro ao atualizar post:", e);
                if (e.code === 'P2002') { 
                    return res.status(409).json({ success: false, message: `O post com o campo duplicado já existe: ${e.meta.target}` });
                }
                res.status(500).json({ success: false, message: e.message });
            }
            break;

        case 'DELETE':
            try {
                const { id, isFile } = req.body;
                
                if (isFile) {
                    // Deleta um arquivo específico do Post (PostFile)
                    await prisma.postFile.delete({ where: { id } });
                    console.log(`[API /api/crud/posts] DELETE executado. PostFile ${id} excluído.`);
                    res.status(200).json({ success: true, message: "Arquivo do Post excluído com sucesso." });
                } else {
                    // Deleta o Post principal
                    // As relações (PostFile, PostTag, Comentario) devem ser deletadas em cascata
                    // graças à configuração onDelete: Cascade no seu schema Prisma.
                    await prisma.post.delete({ where: { id } });
                    console.log(`[API /api/crud/posts] DELETE executado. Post ${id} excluído.`);
                    res.status(200).json({ success: true, message: "Post excluído com sucesso." });
                }
            } catch (e: any) {
                console.error("[API /api/crud/posts] Erro ao deletar post:", e);
                res.status(500).json({ success: false, message: e.message });
            }
            break;

        default:
            res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
            res.status(405).end(`Method ${method} Not Allowed`);
    }
}