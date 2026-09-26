import type { Metadata } from 'next'; import './globals.css';
export const metadata:Metadata={title:'Sokho Viandes — Gestion commerciale',description:'Gestion des ventes, stocks, crédits, arrivages et dépenses.'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="fr"><body>{children}</body></html>}
