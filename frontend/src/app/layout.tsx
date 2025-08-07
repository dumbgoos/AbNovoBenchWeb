import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { RoutePreloader } from "@/components/providers/RoutePreloader";

export const metadata: Metadata = {
  title: "AbNovoBench - Antibody De Novo Peptide Sequencing Benchmark",
  description: "AbNovoBench is a comprehensive, standardized, and reliable benchmarking system for antibody de novo peptide sequencing of proteomics tandem mass spectrometry. Evaluate your models on monoclonal antibody data with our automated benchmarking pipeline.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Preconnect to external resources */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Preload critical fonts */}
        <link 
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" 
          rel="stylesheet" 
        />
        
        {/* Performance optimizations */}
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#5f57d3" />
      </head>
      <body className="font-sans antialiased">
        <RoutePreloader>
          <AuthProvider>
            <div className="flex flex-col min-h-screen relative">
              <Navigation />
              <main className="flex-grow">
                {children}
              </main>
              <Footer />
            </div>
          </AuthProvider>
        </RoutePreloader>
      </body>
    </html>
  );
}
