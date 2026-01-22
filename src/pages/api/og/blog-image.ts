// pages/api/og/blog-image.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        const { slug } = req.query;

        if (!slug || typeof slug !== 'string') {
            return res.status(400).end('Slug inválido');
        }

        const post = await prisma.blog.findUnique({
            where: { slug },
            include: { items: true },
        });

        if (!post || !post.items.length) {
            return res.status(404).end('Imagem não encontrada');
        }

        const imageUrl = post.items[0].img;

        if (!imageUrl) {
            return res.status(404).end('Imagem inválida');
        }

        // Faz download da imagem no server-side
        const imageResponse = await fetch(imageUrl);

        if (!imageResponse.ok) {
            return res.status(500).end('Erro ao baixar imagem');
        }

        const contentType =
            imageResponse.headers.get('content-type') || 'image/jpeg';

        const buffer = Buffer.from(await imageResponse.arrayBuffer());

        // Headers essenciais para WhatsApp
        res.setHeader('Content-Type', contentType);
        res.setHeader('Content-Length', buffer.length.toString());
        res.setHeader('Cache-Control', 'public, max-age=86400');

        return res.status(200).send(buffer);
    } catch (error) {
        console.error('[OG IMAGE ERROR]', error);
        return res.status(500).end('Erro interno');
    }
}
