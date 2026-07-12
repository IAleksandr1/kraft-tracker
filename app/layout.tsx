import type { Metadata } from "next";
import { Unbounded, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const display = Unbounded({
  subsets: ["latin", "cyrillic"],
  weight: "900",
  variable: "--font-display",
});

const mono = JetBrains_Mono({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "700"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "ЖУРНАЛ — дневник трат и заметок",
  description: "Пишешь заметку — она попадает в таблицу по дням.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body className={`${display.variable} ${mono.variable} grain-bg`}>
        <div className="relative z-10">{children}</div>
      </body>
    </html>
  );
}
