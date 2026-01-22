import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import prisma from '../../../../lib/prisma'; // ATENÇÃO: Mantenha o caminho correto para o seu prisma.ts

// --- 1. FUNÇÕES UTILITÁRIAS DE SLUG ---

/**
 * Converte uma string em um slug amigável.
 * Ex: "O Título do Post é Ótimo!" -> "o-titulo-do-post-e-otimo"
 * @param text O texto a ser slugificado.
 */
const slugify = (text: string): string => {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')       // Substitui espaços por hífen
        .replace(/[^\w\-]+/g, '')   // Remove caracteres não-palavra
        .replace(/\-\-+/g, '-')     // Substitui múltiplos hífens por um único
        .replace(/^-+/, '')         // Remove hífens do início
        .replace(/-+$/, '');        // Remove hífens do fim
};

/**
 * Gera um slug único verificando o banco de dados e adicionando um sufixo numérico se necessário.
 * @param title O título base para o slug.
 * @param currentId O ID do post atual (usado apenas no PUT para ignorar o próprio post).
 */
const generateUniqueSlug = async (title: string, currentId?: string): Promise<string> => {
    const baseSlug = slugify(title);
    let uniqueSlug = baseSlug;
    let counter = 1;

    while (true) {
        // Tenta encontrar um post que já use este slug (e que não seja o post atual, se houver)
        const existingPost = await prisma.blog.findFirst({
            where: {
                slug: uniqueSlug,
                // No PUT, ignora o ID do post que está sendo atualizado
                ...(currentId && { id: { not: currentId } })
            },
            select: { id: true }
        });

        if (!existingPost) {
            // Se nenhum post for encontrado com este slug, ele é único.
            return uniqueSlug;
        }

        // Se encontrou, incrementa o contador e tenta o próximo slug (ex: "titulo-do-post-2")
        counter++;
        uniqueSlug = `${baseSlug}-${counter}`;
    }
};


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { method } = req;

    // ... LOGS DE DEPURACAO GERAIS ...
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
                const { title, subtitle, description, author, order, publico, items } = req.body;

                if (!title) {
                    return res.status(400).json({ success: false, message: 'O campo "title" é obrigatório.' });
                }

                if (items && !Array.isArray(items)) {
                    return res.status(400).json({ success: false, message: 'Items deve ser um array.' });
                }

                // 🌟 NOVO: Gera e verifica a unicidade do slug
                const slug = await generateUniqueSlug(title);
                console.log(`[API /api/crud/blog] Novo Slug gerado: ${slug}`);

                const novoPost = await prisma.blog.create({
                    data: {
                        title,
                        slug,
                        subtitle,
                        description,
                        author: author || "Machado Advogados", // ✅ SALVA O AUTHOR
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
                const { id, title, subtitle, description, author, order, publico, items } = req.body;

                if (!id) {
                    return res.status(400).json({ success: false, message: 'O ID do post é obrigatório para atualização.' });
                }

                if (items && !Array.isArray(items)) {
                    return res.status(400).json({ success: false, message: 'Items deve ser um array.' });
                }

                // 🌟 NOVO: Gera e verifica a unicidade do slug (usando o ID para ignorar o próprio post)
                let newSlug: string | undefined = undefined;
                if (title) { // Só recalcula o slug se o título foi enviado na requisição
                    newSlug = await generateUniqueSlug(title, id);
                    console.log(`[API /api/crud/blog] Novo Slug gerado para PUT: ${newSlug}`);
                }

                // Remove as fotos existentes (como já estava)
                await prisma.blogFoto.deleteMany({
                    where: { blogId: id },
                });

                const postAtualizado = await prisma.blog.update({
                    where: { id },
                    data: {
                        title,
                        slug: newSlug,
                        subtitle,
                        description,
                        author: author || "Machado Advogados", // ✅ ATUALIZA AUTHOR
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
                    }
                });
                console.log(`[API /api/crud/blog] PUT executado. Post ${id} atualizado.`);
                res.status(200).json({ success: true, post: postAtualizado });
            } catch (e: any) {
                console.error("[API /api/crud/blog] Erro ao atualizar post:", e);
                res.status(500).json({ success: false, message: e.message });
            }
            break;

        case 'DELETE':
            // ... (Lógica DELETE inalterada)
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