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
  title: "RV Configurator",
  description: "Configure your Luxe RV.",
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
