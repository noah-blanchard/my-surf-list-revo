import "@mantine/core/styles.css";
import { ColorSchemeScript, MantineProvider } from "@mantine/core";
import QueryProvider from "@/lib/providers/QueryProvider";

export const metadata = {
  title: "My Surf List Revo",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // Ajoute l’attribut côté serveur pour éviter le mismatch
    <html lang="en" data-mantine-color-scheme="dark">
      <head>
        {/* Injecte le script AVANT hydratation, avec dark par défaut */}
        <ColorSchemeScript defaultColorScheme="dark" />
      </head>
      <body>
        {/* Force le dark côté client */}
        <QueryProvider>
          <MantineProvider defaultColorScheme="dark">
            {children}
          </MantineProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
