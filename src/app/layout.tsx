import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "sonner";

const inter = Inter({ 
  subsets: ["latin"],
  variable: '--font-serif', // MAPEADO PARA SERIF PARA COMPATIBILIDADE, MAS AGORA É MINIMALISTA
});

const outfit = Outfit({ 
  subsets: ["latin"],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: "Du Barber - Tradição & Estilo",
  description: "O agendamento premium para o homem de bom gosto.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${outfit.variable} ${inter.variable} font-sans antialiased bg-background text-foreground transition-all duration-500`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster position="top-center" richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
