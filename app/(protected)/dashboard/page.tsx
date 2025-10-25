import { DashboardClient } from './components/dashboard-client';

export default function DashboardPage() {
  return (
    <div
      className="container mx-auto px-4 py-8"
      style={{ viewTransitionName: 'dashboard-content' }}
    >
      <div className="max-w-4xl mx-auto">
        <h1
          className="text-3xl font-bold mb-8"
          style={{ viewTransitionName: 'page-title' }}
        >
          Dashboard
        </h1>
        <DashboardClient />
      </div>
    </div>
  );
}
