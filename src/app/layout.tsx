import type { Metadata, Viewport } from "next";
import { ThemeProvider } from "@/components/theme/theme-provider";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  ),
  title: "Chatty — conversations with room to breathe",
  description:
    "A quieter, more thoughtful chat space for the people and ideas that matter.",
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: "Chatty — conversations with room to breathe",
    description:
      "A quieter, more thoughtful chat space for the people and ideas that matter.",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 512,
        height: 512,
        alt: "Chatty — conversations with room to breathe",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "Chatty — conversations with room to breathe",
    description:
      "A quieter, more thoughtful chat space for the people and ideas that matter.",
    images: ["/og-image.png"],
  },
};

export const viewport: Viewport = {
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

const themeInitScript = `(function(){try{var t=localStorage.getItem("Chatty-theme");document.documentElement.classList.add(t==="dark"?"dark":"light")}catch(e){document.documentElement.classList.add("light")}})()`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="antialiased">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
