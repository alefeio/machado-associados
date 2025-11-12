import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import prisma from "../../../../lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const session = await getServerSession(req, res, authOptions);

    // 🛡️ Restrição de Acesso
    if (!session || session.user?.role !== 'ADMIN') {
        return res.status(401).json({ message: 'Acesso não autorizado.' });
    }

    switch (req.method) {
        // 📥 READ: Buscar todos os depoimentos
        case 'GET':
            try {
                const testimonials = await prisma.testimonial.findMany({
                    orderBy: {
                        createdAt: 'desc',
                    },
                });
                return res.status(200).json(testimonials);
            } catch (error) {
                console.error("Erro ao buscar depoimentos:", error);
                return res.status(500).json({ message: 'Erro ao buscar depoimentos.' });
            }

        // 📝 CREATE: Criar um novo depoimento (com avatarUrl)
        case 'POST':
            // 💡 Incluindo avatarUrl no destructuring
            const { name: postName, type: postType, content: postContent, avatarUrl: postAvatarUrl } = req.body;
            
            if (!postName || !postType || !postContent) {
                return res.status(400).json({ message: 'Dados essenciais inválidos para criação (nome, tipo, conteúdo).' });
            }
            
            try {
                const newTestimonial = await prisma.testimonial.create({
                    data: { 
                        name: postName, 
                        type: postType, 
                        content: postContent,
                        // 🔑 ADICIONADO: Inclui avatarUrl, que pode ser undefined ou null
                        avatarUrl: postAvatarUrl || null, 
                    },
                });
                return res.status(201).json(newTestimonial);
            } catch (error) {
                console.error("Erro ao criar depoimento:", error);
                return res.status(500).json({ message: 'Erro ao criar o depoimento.' });
            }

        // ✏️ UPDATE: Editar um depoimento existente (com avatarUrl)
        case 'PUT':
            // 💡 Incluindo avatarUrl no destructuring
            const { id: putId, name: putName, type: putType, content: putContent, avatarUrl: putAvatarUrl } = req.body;
            
            // Verifica se o ID e os campos obrigatórios estão presentes
            if (!putId || !putName || !putType || !putContent) {
                return res.status(400).json({ message: 'Dados inválidos para edição (ID, nome, tipo, conteúdo).' });
            }
            
            try {
                const updatedTestimonial = await prisma.testimonial.update({
                    where: { id: putId },
                    data: { 
                        name: putName, 
                        type: putType, 
                        content: putContent,
                        // 🔑 ADICIONADO: Inclui avatarUrl para atualização
                        avatarUrl: putAvatarUrl || null,
                    },
                });
                return res.status(200).json(updatedTestimonial);
            } catch (error) {
                console.error("Erro ao editar depoimento:", error);
                return res.status(500).json({ message: 'Erro ao editar o depoimento.' });
            }

        // 🗑️ DELETE: Deletar um depoimento
        case 'DELETE':
            const { id: deleteId } = req.body;
            if (!deleteId) {
                return res.status(400).json({ message: 'ID não fornecido para exclusão.' });
            }
            try {
                await prisma.testimonial.delete({
                    where: { id: deleteId },
                });
                return res.status(200).json({ message: 'Depoimento excluído com sucesso.' });
            } catch (error) {
                console.error("Erro ao excluir depoimento:", error);
                return res.status(500).json({ message: 'Erro ao excluir o depoimento.' });
            }

        // 🚫 Método Não Permitido
        default:
            res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
            return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}