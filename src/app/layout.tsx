import "@ant-design/v5-patch-for-react-19";
import type { Metadata } from "next";
import { Fira_Code, Geist, Geist_Mono, Inter, JetBrains_Mono, Lato, Montserrat, Roboto, Roboto_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});
const inter = Inter({ subsets: ["latin", "cyrillic"], display: "swap", variable: "--font-inter" });
const roboto = Roboto({ 
  weight: ["400", "500", "700"],
  subsets: ["latin", "cyrillic"],
  display: "swap",
  variable: "--font-roboto"
});
const robotoMono = Roboto_Mono({ 
  weight: ["400", "500", "700"],
  subsets: ["latin", "cyrillic"],
  display: "swap",
  variable: "--font-roboto"
});
const lato = Lato({ 
  weight: ["400", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-lato"
});
const montserrat = Montserrat({ subsets: ["latin", "cyrillic"], display: "swap", variable: "--font-montserrat" });
const firaCode = Fira_Code({
  weight: ["400", "500", "700"],
  subsets: ["latin", "cyrillic"],
  display: "swap",
  variable: "--font-fira-code"
});
const jetBrainsMono = JetBrains_Mono({
  weight: ["400", "500", "700"],
  subsets: ["latin", "cyrillic"],
  display: "swap",
  variable: "--font-jet-brains-mono"
});

export const metadata: Metadata = {
  title: "Viisualize Data",
  description: "Demo for data visualization with libraries: Chart.js, Nivo, Plotly",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`
          ${geistSans.variable} 
          ${geistMono.variable}
          ${inter.variable}
          ${roboto.variable}
          ${robotoMono.variable}
          ${lato.variable}
          ${montserrat.variable}
          ${firaCode.variable}
          ${jetBrainsMono.variable}
          antialiased
        `}
      >
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
