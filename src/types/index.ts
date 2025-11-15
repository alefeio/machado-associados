// --- Tipos existentes (mantidos exatamente como estavam) ---
export interface Banner {
    id: string;
    banners: {
        id: string;
        url: string;
        link: string;
        title: string;
        target: string;
    }[];
}

export interface LinkItem {
    id: string;
    text: string;
    url: string;
    target?: string;
}

export interface MenuData {
    logoUrl: string;
    links: LinkItem[];
}

export interface MenuProps {
    menuData: MenuData | null;
}

export interface TestimonialItem {
    id: string;
    name: string;
    content: string;
    type: string;
    avatarUrl: string | undefined;
}

export interface FaqItem {
    id: string;
    pergunta: string;
    resposta: string;
}

export interface ColecaoItem {
    id: string;
    productMark: string;
    productModel: string;
    cor: string;
    img: string;
    slug: string;
    colecaoId: string;
    description?: string | null;
    size?: string | null;
    price?: number | null;
    price_card?: number | null;
    like?: number | null;
    view?: number | null;
    tamanho?: string | null;
    preco?: string | null;
    precoParcelado?: string | null;
}

export interface ColecaoProps {
    id: string;
    title: string;
    subtitle: string | null;
    description: string | null;
    bgcolor: string | null;
    buttonText: string | null;
    buttonUrl: string | null;
    order: number | null;
    slug: string;
    items: ColecaoItem[];
}


export interface RawMenuData {
    id: string;
    name: string;
    links: LinkItem[];
}

// -------------------------------------------------------------------
// --- NOVAS INTERFACES PARA O BLOG ---
// -------------------------------------------------------------------

/**
 * Interface para representar uma foto ou item relacionado a um post do Blog (BlogFoto model).
 */
export interface BlogFoto {
    id: string;
    detalhes?: string | null; // Corresponde ao campo 'detalhes'
    img: string;
    blogId: string;
    createdAt: Date | string; // Datas podem vir como objetos Date ou strings formatadas
    updatedAt: Date | string;
}

/**
 * Interface para representar um post completo no Blog (Blog model).
 * Adicionado o campo 'slug'.
 */
export interface BlogItem {
    id: string;
    title: string;
    slug: string | null; // Adicionado, pode ser string ou null se for opcional no Prisma
    subtitle?: string | null;
    description?: string | null;
    order: number;
    publico: boolean;
    // Relação com os itens/fotos do post
    items: BlogFoto[]; 
    createdAt: Date | string;
    updatedAt: Date | string;
}

/**
 * Interface para o preview de um post de blog na listagem (Home Page ou Blog Page).
 * Esta estrutura reflete o 'select' usado na GSSP da Home Page.
 */
export interface BlogPostPreview {
    id: string;
    title: string;
    slug: string; // Garantido como string para a URL (mesmo que seja null no BD, a GSSP deve tratar)
    createdAt: Date | string; 
    description: string | null;
    // Usamos um array simplificado de items para o preview
    items: { img: string }[]; 
}


// -------------------------------------------------------------------
// --- ATUALIZAÇÃO DA HOME PAGE PROPS ---
// -------------------------------------------------------------------

/**
 * Interface de Props da Home Page.
 * Adicionado o campo 'blogPosts' para a listagem da Home Page.
 */
export interface HomePageProps {
    banners: Banner[];
    menu: MenuData | null;
    testimonials: TestimonialItem[];
    faqs: FaqItem[];
    colecoes: ColecaoProps[];
    // ✅ MUDANÇA: Torna a propriedade blogPosts opcional
    blogPosts?: BlogPostPreview[] | null; 
}