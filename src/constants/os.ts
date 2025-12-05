export const OS_FORMATS = {
    PNG: 'png',
    ICO: 'ico',
    ICNS: 'icns',
} as const;

export type OSFormat = typeof OS_FORMATS[keyof typeof OS_FORMATS];

export const BRAND_ICONS = [
    { name: 'Apple', class: 'fa-brands fa-apple' },
    { name: 'Windows', class: 'fa-brands fa-windows' },
    { name: 'Linux', class: 'fa-brands fa-linux' }
];

export const OS_KEYWORD_MATCHERS = {
    ICNS: ['mac', 'apple', 'os x'],
    ICO: ['windows', 'win'],
};
