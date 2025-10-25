import { SettingsClient } from './settings-client';

export default function SettingsPage() {
  return (
    <div
      className="container mx-auto px-4 py-8"
      style={{ viewTransitionName: 'settings-content' }}
    >
      <SettingsClient />
    </div>
  );
}
