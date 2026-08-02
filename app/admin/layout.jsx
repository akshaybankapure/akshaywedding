import "./admin.css";

export const metadata = {
  title: "Guest list · Akshay ♥ Shraddha",
  robots: { index: false, follow: false },   // keep it out of Google
};

export default function AdminLayout({ children }) {
  return <div style={{ background: "#0a0e24", minHeight: "100dvh" }}>{children}</div>;
}
