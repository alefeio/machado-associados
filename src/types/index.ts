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

export interface HomePageProps {
    banners: Banner[];
    menu: MenuData | null;
    testimonials: TestimonialItem[];
    faqs: FaqItem[];
    colecoes: ColecaoProps[];
}

export interface RawMenuData {
    id: string;
    name: string;
    links: LinkItem[];
}

// ---
// 🔥 NOVOS TIPOS — BLOG
// ---

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
}

export interface BlogTag {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
}

export interface BlogImage {
  id: string;
  url: string;
  caption?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface BlogComment {
  id: string;
  content: string;
  author?: string | null;
  email?: string | null;
  postId?: string | null; // vincula ao post original
  parentId?: string | null; // comentário pai
  approved: boolean;
  createdAt: string;
  updatedAt: string;
  replies?: BlogComment[]; // comentários filhos
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  subtitle?: string | null;
  summary?: string | null;
  content: string;
  coverImage?: string | null;
  published: boolean;
  publishedAt?: string | null;
  author?: {
    id: string;
    name?: string | null;
    image?: string | null;
  } | null;
  categories: BlogCategory[];
  tags: BlogTag[];
  images: BlogImage[];
  comments: BlogComment[];
  createdAt: string;
  updatedAt: string;
}

export interface BlogPageProps {
  posts: BlogPost[];
  categories: BlogCategory[];
  tags: BlogTag[];
}

export interface BlogPostPageProps {
  post: BlogPost;
  relatedPosts?: BlogPost[];
}
