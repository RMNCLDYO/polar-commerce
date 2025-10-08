import Link from 'next/link';
import {
  AppContainer,
  AppHeader,
  AppNav,
  SettingsButton,
  SettingsButtonContent,
} from '@/components/server';
import { preloadQuery } from 'convex/nextjs';
import { api } from '@/convex/_generated/api';
import { SignOut, UserProfile } from './client';
import { TodoList } from './todo-list';
import { DashboardRenderToggle } from '@/components/dashboard-render-toggle';
import { getToken } from '@/lib/server/auth';

const Header = async () => {
  const token = await getToken();

  // Preload query for SSR
  const preloadedUserQuery = await preloadQuery(
    api.auth.getCurrentUser,
    {},
    { token },
  );

  return (
    <AppHeader>
      <UserProfile preloadedUserQuery={preloadedUserQuery} />
      <AppNav>
        <SettingsButton>
          <Link href="/settings">
            <SettingsButtonContent />
          </Link>
        </SettingsButton>
        <SignOut />
      </AppNav>
    </AppHeader>
  );
};

const ServerPage = async () => {
  return (
    <AppContainer>
      <DashboardRenderToggle />
      <Header />
      <TodoList />
    </AppContainer>
  );
};

export default ServerPage;
