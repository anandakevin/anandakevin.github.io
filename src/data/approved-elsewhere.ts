/** Footer Elsewhere links — only entries with an approved public URL are rendered. */
export type ElsewhereLink = {
  label: string;
  href: string;
};

/** Curated external links shown in the global footer. */
export const approvedElsewhereLinks: ElsewhereLink[] = [
  { label: 'GitHub', href: 'https://github.com/anandakevin' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/ananda-kevin-refaldo-sariputra/' },
  { label: 'Google Scholar', href: 'https://scholar.google.com/citations?user=F_OlnVwAAAAJ' },
  { label: 'Kaggle', href: 'https://www.kaggle.com/thechief28' },
  { label: 'Email', href: 'mailto:ananda.kevin.rs@gmail.com' },
];

export const elsewhereLinksWithHref = approvedElsewhereLinks;
