import styles from "@/app/ui/dashboard/dashboard.module.css";
import Sidebar from "../ui/dashboard/sidebar/sidebar";
import Navbar from "../ui/dashboard/navbar/navbar";
import Footer from "../ui/dashboard/footer/footer";
import { getSession } from "../lib/sessions";
import { CookieProvider } from "../context/userContext";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession();
  
  return (
    <div className={styles.container}>
      <Navbar />
      <div className={styles.containerBody}>
        <div className={styles.menu}>
          <Sidebar />
        </div>
        <CookieProvider cookie={session?.gotUser?.access}>
          <div className={styles.content}>{children}</div>
        </CookieProvider>
      </div>
      <Footer />
    </div>
  );
}
