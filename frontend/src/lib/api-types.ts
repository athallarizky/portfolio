// === Response envelope ===
export interface PaginatedResponse<T> {
  docs: T[];
  totalDocs: number;
  limit: number;
  totalPages: number;
  page: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
}

/** Client-side augmentation: does this content have an Indonesian translation?
 *  (Resolved server-side from a locale=id&fallback-locale=none probe — sprint-26.) */
export interface TranslatedFlag {
  translated?: boolean;
}

// === Collections ===
export interface DocumentCategory {
  id: number;
  label: string;
  slug: string;
  icon: string;
  hint: string | null;
  order: number;
  updatedAt: string;
  createdAt: string;
}

export interface Document {
  id: number;
  title: string;
  category: DocumentCategory;
  excerpt: string | null;
  updated: string | null;
  updatedAt: string;
  createdAt: string;
  url: string | null;
  thumbnailURL: string | null;
  filename: string | null;
  mimeType: string | null;
  filesize: number | null;
}

export interface Tag {
  id: number;
  name: string;
  slug: string;
}

export interface Media {
  id: number;
  alt: string;
  caption: string | null;
  filename: string | null;
  mimeType: string | null;
  filesize: number | null;
  width: number | null;
  height: number | null;
  url: string | null;
  thumbnailURL: string | null;
  sizes: Record<string, { filename: string | null; width: number | null; height: number | null; url: string | null }> | null;
}

export interface Author {
  id: number;
  name: string;
  initials: string;
  role: string | null;
  bio: string | null;
  avatar: Pick<Media, 'id' | 'alt' | 'filename' | 'width' | 'height' | 'url' | 'thumbnailURL'> | null;
}

export interface Article {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  tags: Tag[];
  author: Author;
  publishedAt: string;
  readMinutes: number | null;
  body: LexicalRoot;
  featuredImage: Pick<Media, 'id' | 'alt' | 'filename' | 'width' | 'height' | 'url' | 'thumbnailURL'> | null;
  bannerColor: string | null;
  bannerIcon: string | null;
  relatedArticles: number[];
  status: 'draft' | 'published';
  seo: { metaTitle: string | null; metaDescription: string | null; ogImage: string | null } | null;
}

export interface Technology {
  id: number;
  name: string;
  slug: string;
  icon: string | null;
}

export interface Project {
  id: number;
  title: string;
  slug: string;
  year: number;
  excerpt: string | null;
  descriptor: string | null;
  bannerColor: string | null;
  bannerIcon: string | null;
  bannerImage: Pick<Media, 'id' | 'alt' | 'filename' | 'width' | 'height' | 'url' | 'thumbnailURL'> | null;
  techTags: Technology[];
  links: { label: string; url: string | null; icon: string | null }[];
  body: LexicalRoot;
  status: 'draft' | 'published';
  order: number;
  showOnHome?: boolean;
  features: { icon: string | null; heading: string | null; description: string | null }[];
  screenshots: Pick<Media, 'id' | 'alt' | 'filename' | 'width' | 'height' | 'url' | 'thumbnailURL'>[];
  architecture: string | null;
  seo: { metaTitle: string | null; metaDescription: string | null; ogImage: string | null } | null;
}

export interface SocialProfile {
  id: number;
  platform: string;
  icon: string;
  handle: string;
  url: string;
  showOnHome: boolean;
  order: number;
}

// === Globals ===
export interface SiteConfig {
  name: string;
  initials: string;
  role: string | null;
  bioShort: string | null;
  status: string | null;
  timezone: string | null;
  location: string | null;
  contactFormEnabled?: boolean | null;
  documentsEnabled?: boolean | null;
  avatar: Pick<Media, 'id' | 'alt' | 'filename' | 'width' | 'height' | 'url' | 'thumbnailURL'> | null;
}

export interface Home {
  hero: { eyebrow: string | null; name: string | null };
  stats: { value: string; suffix: string | null; label: string }[];
  about: { paragraph: string }[];
  currently: { icon: string | null; text: string }[];
  skills: { name: string }[];
  roles: { label: string }[];
  showItems: (
    | 'hero'
    | 'stats'
    | 'featuredProjects'
    | 'latestWriting'
    | 'about'
    | 'currently'
    | 'skills'
    | 'findMe'
    | 'contactCta'
  )[];
}

export interface Nav {
  menuItems: { label: string; href: string; icon: string | null; order: number }[];
  connectLinks: { label: string; href: string; icon: string | null; order: number }[];
}

// === Lexical Rich Text ===
export interface LexicalRoot {
  root: {
    type: 'root';
    children: LexicalNode[];
    direction: 'ltr';
    format: '';
    indent: number;
    version: number;
  };
}

export type LexicalNode =
  | { type: 'paragraph'; children: LexicalNode[]; direction: string; format: string; indent: number; version: number }
  | { type: 'heading'; tag: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'; children: LexicalNode[]; direction: string; format: string; indent: number; version: number }
  | { type: 'code'; language: string; children: LexicalText[]; direction: string; format: string; indent: number; version: number }
  | { type: 'quote'; children: LexicalNode[]; direction: string; format: string; indent: number; version: number }
  | { type: 'list'; listType: 'bullet' | 'number'; children: LexicalNode[]; direction: string; format: string; indent: number; version: number }
  | { type: 'listitem'; children: LexicalNode[]; direction: string; format: string; indent: number; version: number }
  | { type: 'link'; children: LexicalNode[]; fields: { linkType: string; newTab: boolean; url: string } | null; direction: string | null; format: string; indent: number; version: number }
  | { type: 'upload'; value: { id: number }; fields: null; relationTo: string; version: number }
  | LexicalText;

export interface LexicalText {
  type: 'text';
  text: string;
  format: number;
  detail: number;
  mode: string;
  style: string;
  textStyle: string;
}

// === Ad-hoc: Home skills + find-me from mock (not in API globals) ===
export interface HomeFindMe {
  platform: string;
  icon: string;
  url: string;
}
