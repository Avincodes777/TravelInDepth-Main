import AdminSidebar from "./AdminSidebar";

const AdminLayout = ({ children }) => {
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--city-bg, #FDF6EC)" }}>
      <AdminSidebar />
      <main style={{ flex: 1, padding: 32 }}>{children}</main>
    </div>
  );
};

export default AdminLayout;