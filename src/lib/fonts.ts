const FONT_MAP: Record<string, string> = {
    'Inter': 'var(--ff-inter)',
    'Bebas Neue': 'var(--ff-bebas-neue)',
    'Montserrat': 'var(--ff-montserrat)',
    'Poppins': 'var(--ff-poppins)',
    'Oswald': 'var(--ff-oswald)',
    'Raleway': 'var(--ff-raleway)',
    'Lato': 'var(--ff-lato)',
    'Playfair Display': 'var(--ff-playfair)',
    'Roboto': 'var(--ff-roboto)',
    'Open Sans': 'var(--ff-open-sans)',
};

export function resolveFontFamily(fontName?: string): string | undefined {
    if (!fontName) return undefined;
    return FONT_MAP[fontName] || fontName;
}
