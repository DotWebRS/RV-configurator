import type { Metadata } from "next";
import type { ReactNode } from "react";
import "../src/styles/variables.css";
import "../src/index.css";
import "../src/components/ChooseModel.css";
import "../src/components/ModelPage.css";
import "../src/components/Viewer.css";
import "../src/components/RightPanel.css";
import "../src/components/ViewMode/ViewMode.css";
import "../src/components/CameraView/CameraView.css";
import "../src/ResponsiveLayout.css";

export const metadata: Metadata = {
  title: "Build Your Own Luxury Fifth Wheel",
  description:
    "Build your own luxury fifth wheel or toy hauler with THE Luxe Fifth Wheel online builder. We build true four season fifth wheels and toy haulers.",
  icons: {
    icon: "/icons/logo.jpg",
  },
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body id="root" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
