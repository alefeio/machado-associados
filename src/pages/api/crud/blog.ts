import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import prisma from '../../../../lib/prisma'; // ATENÇÃO: Mantenha o caminho correto para o seu prisma.ts

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { method } = req;
    
    // --- LOGS DE DEPURACAO GERAIS (Atualizados para 'blog') ---
    console.log(`\n--- [API /api/crud/blog] INICIO DA REQUISICAO ---`);
    console.log(`[API /api/crud/blog] Método: ${method}`);
    console.log(`[API /api/crud/blog] Requisição Host: ${req.headers.host}`);
    console.log(`[API /api/crud/blog] Requisição Origin: ${req.headers.origin}`);
    console.log(`--- [API /api/crud/blog] FIM DOS LOGS GERAIS ---\n`);

    // Lógica para lidar com a requisição GET (PÚBLICA)
    if (method === 'GET') {
        try {
            // Usa o modelo 'Blog'
            const posts = await prisma.blog.findMany({
                where: {
                    publico: true, // Filtra apenas posts que são públicos
                },
                include: {
                    items: true, // Inclui as BlogFotos
                },
                orderBy: {
                    order: 'asc',
                }
            });
            console.log(`[API /api/crud/blog] GET executado. ${posts.length} posts encontrados.`);
            return res.status(200).json({ success: true, posts });
        } catch (e: any) {
            console.error("[API /api/crud/blog] Erro ao buscar posts:", e);
            return res.status(500).json({ success: false, message: e.message });
        }
    }

    // Para POST, PUT, DELETE, exigimos autenticação ADMIN
    const session = await getServerSession(req, res, authOptions);

    console.log(`[API /api/crud/blog] Sessão Recebida para ${method} (JSON):`, JSON.stringify(session, null, 2));
    if (!session || (session.user as any)?.role !== 'ADMIN') {
        console.warn(`[API /api/crud/blog] Acesso NEGADO para ${method}. Motivo: ${!session ? 'Sessão Ausente' : `Role: ${(session?.user as any)?.role} (não é ADMIN)`}`);
        return res.status(401).json({ success: false, message: 'Acesso não autorizado. Apenas administradores podem gerenciar posts do blog.' });
    }

    switch (method) {
        case 'POST':
            try {
                const { title, subtitle, description, order, publico, items } = req.body;
                
                if (items && !Array.isArray(items)) {
                    return res.status(400).json({ success: false, message: 'Items deve ser um array.' });
                }

                const novoPost = await prisma.blog.create({
                    data: {
                        title,
                        subtitle,
                        description,
                        order,
                        publico: publico ?? false,
                        items: {
                            createMany: {
                                data: items?.map((item: any) => ({
                                    detalhes: item.detalhes,
                                    img: item.img,
                                })) ?? [],
                            },
                        },
                    },
                });
                console.log(`[API /api/crud/blog] POST executado. Novo post ${novoPost.id} criado.`);
                res.status(201).json({ success: true, post: novoPost });
            } catch (e: any) {
                console.error("[API /api/crud/blog] Erro ao criar post:", e);
                res.status(500).json({ success: false, message: e.message });
            }
            break;

        case 'PUT':
            try {
                const { id, title, subtitle, description, order, publico, items } = req.body;
                
                if (items && !Array.isArray(items)) {
                    return res.status(400).json({ success: false, message: 'Items deve ser um array.' });
                }

                await prisma.blogFoto.deleteMany({
                    where: { blogId: id },
                });

                const postAtualizado = await prisma.blog.update({
                    where: { id },
                    data: {
                        title,
                        subtitle,
                        description,
                        order,
                        publico: publico ?? false,
                        items: {
                            createMany: {
                                data: items?.map((item: any) => ({
                                    detalhes: item.detalhes,
                                    img: item.img,
                                })) ?? [],
                            },
                        },
                    },
                });
                console.log(`[API /api/crud/blog] PUT executado. Post ${id} atualizado.`);
                res.status(200).json({ success: true, post: postAtualizado });
            } catch (e: any) {
                console.error("[API /api/crud/blog] Erro ao atualizar post:", e);
                res.status(500).json({ success: false, message: e.message });
            }
            break;

        case 'DELETE':
            try {
                const { id, isItem } = req.body;
                if (isItem) {
                    await prisma.blogFoto.delete({ where: { id } });
                    console.log(`[API /api/crud/blog] DELETE executado. BlogFoto ${id} excluída.`);
                    res.status(200).json({ success: true, message: "Foto do Blog excluída com sucesso." });
                } else {
                    await prisma.blogFoto.deleteMany({ where: { blogId: id } }); 
                    await prisma.blog.delete({ where: { id } });
                    console.log(`[API /api/crud/blog] DELETE executado. Post ${id} excluído.`);
                    res.status(200).json({ success: true, message: "Post do Blog excluído com sucesso." });
                }
            } catch (e: any) {
                console.error("[API /api/crud/blog] Erro ao deletar post:", e);
                res.status(500).json({ success: false, message: e.message });
            }
            break;

        default:
            res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
            res.status(405).end(`Method ${method} Not Allowed`);
    }
}