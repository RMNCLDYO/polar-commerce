import { Check, Settings, Trash2, X } from 'lucide-react';
import Image from 'next/image';
import type { FormEvent, PropsWithChildren } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export const UserProfile = ({
  user,
}: {
  user?: { name: string; image?: string | null; email: string } | null;
}) => {
  return (
    <div className="flex items-center space-x-2">
      {user?.image ? (
        <Image
          src={user.image}
          alt={user.name}
          width={40}
          height={40}
          className="rounded-full"
        />
      ) : (
        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-foreground font-medium">
          {user?.name?.[0]?.toUpperCase()}
        </div>
      )}
      <div>
        <h1 className="font-medium">{user?.name}</h1>
        <p className="text-sm text-muted-foreground">{user?.email}</p>
      </div>
    </div>
  );
};

export const AppContainer = ({ children }: PropsWithChildren) => {
  return <div className="min-h-screen w-full p-4 space-y-8">{children}</div>;
};

export const AppHeader = ({ children }: PropsWithChildren) => {
  return (
    <header className="flex items-center justify-between max-w-2xl mx-auto">
      {children}
    </header>
  );
};

export const AppNav = ({ children }: PropsWithChildren) => {
  return <div className="flex items-center gap-2">{children}</div>;
};

export const SettingsButton = ({ children }: PropsWithChildren) => {
  return (
    <Button variant="ghost" size="sm" asChild>
      {children}
    </Button>
  );
};

export const SettingsButtonContent = () => {
  return (
    <div className="flex items-center gap-2">
      <Settings size={16} />
      Settings
    </div>
  );
};

export const AddTodoForm = ({
  action,
  onSubmit,
}: {
  action?: (formData: FormData) => Promise<void>;
  onSubmit?: (event: FormEvent<HTMLFormElement>) => Promise<void>;
}) => {
  return (
    <form className="flex gap-2" action={action} onSubmit={onSubmit}>
      <Input
        name="text"
        placeholder="Add a new todo..."
        className="bg-background border-border text-foreground placeholder:text-muted-foreground"
      />
      <Button type="submit" variant="secondary">
        Add
      </Button>
    </form>
  );
};

export const TodoListContainer = ({ children }: PropsWithChildren) => {
  return (
    <main>
      <div className="max-w-2xl mx-auto space-y-6">{children}</div>
    </main>
  );
};

export const TodoCompleteButton = ({
  completed,
  type = 'button',
  onClick,
}: {
  completed: boolean;
  type?: 'button' | 'submit';
  onClick?: () => void;
}) => (
  <Button
    variant="ghost"
    size="icon"
    type={type}
    className="text-muted-foreground hover:text-foreground hover:bg-muted"
    onClick={onClick}
  >
    {completed ? (
      <Check size={16} className="text-green-500" />
    ) : (
      <X size={16} />
    )}
  </Button>
);

export const TodoRemoveButton = ({ onClick }: { onClick: () => void }) => (
  <Button
    variant="ghost"
    size="icon"
    onClick={onClick}
    className="text-muted-foreground hover:text-red-500 hover:bg-muted opacity-0 group-hover:opacity-100 transition-opacity"
  >
    <Trash2 size={16} />
  </Button>
);

export const TodoText = ({
  text,
  completed,
}: {
  text: string;
  completed: boolean;
}) => (
  <span
    className={
      completed
        ? 'flex-1 line-through text-muted-foreground'
        : 'flex-1 text-foreground'
    }
  >
    {text}
  </span>
);

export const TodoItem = ({ children }: PropsWithChildren) => {
  return (
    <li className="flex items-center gap-3 p-3 bg-card border border-border rounded-lg group hover:bg-muted/50 transition-colors">
      {children}
    </li>
  );
};

export const TodoList = ({ children }: PropsWithChildren) => {
  return <ul className="space-y-3">{children}</ul>;
};

export const TodoEmptyState = () => {
  return (
    <p className="text-center text-muted-foreground py-8">
      No todos yet. Add one above!
    </p>
  );
};
