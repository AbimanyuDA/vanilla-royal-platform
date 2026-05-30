import DashboardSidebar from '@/src/components/dashboard/DashboardSidebar';

export const metadata = {
  title: 'Market Intelligence — Vanilla Royal Dashboard',
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-[100dvh] overflow-hidden bg-zinc-50">
      <DashboardSidebar />
      {/* Content area — scrollable, offset on mobile for fixed top bar */}
      <div className="flex-1 overflow-y-auto pt-14 md:pt-0">
        {children}
      </div>
    </div>
  );
}
