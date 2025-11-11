// src/types/index.ts

export interface Banner {
    // Corrigido: O ID do próprio Banner, se a estrutura for um wrapper para o array de banners
    id: string; // Geralmente 'string' para IDs de DB como Prisma
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

// Este tipo representa a estrutura dos dados do menu.
export interface MenuData {
    logoUrl: string;
    links: LinkItem[];
}

// Este tipo representa as props que o componente Menu espera.
export interface MenuProps {
    menuData: MenuData | null;
}

// ---
// Tipos de Dados da Página Inicial
// ---

// Interface do item de Depoimento (incluindo o novo campo avatarUrl)
export interface TestimonialItem {
    id: string;
    name: string;
    content: string;
    type: string; // Tipo/Cargo do cliente (ex: "Cliente", "CEO")
    avatarUrl: string | null; // URL da Foto ou Vídeo
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
    img: string; // URL da imagem principal do item
    slug: string;
    colecaoId: string;
    
    // Propriedades Adicionadas e Corrigidas
    description?: string | null;
    
    // Campos com nomes mais genéricos (se vierem do DB)
    size?: string | null;
    price?: number | null;
    price_card?: number | null;
    like?: number | null;
    view?: number | null;

    // Campos com nomes em português (se vierem de alguma transformação ou uso específico)
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

// Este tipo representa as props da sua página inicial.
export interface HomePageProps {
    // Uso da interface específica TestimonialItem
    banners: Banner[];
    menu: MenuData | null;
    testimonials: TestimonialItem[]; // Tipei com a interface correta
    faqs: FaqItem[]; // Tipei com a interface correta
    colecoes: ColecaoProps[]; // Tipei com a interface correta
}

// O tipo de dados que a sua função getServerSideProps na página inicial retorna
export interface RawMenuData {
    id: string;
    name: string;
    links: LinkItem[];
}