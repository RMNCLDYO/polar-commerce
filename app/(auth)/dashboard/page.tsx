'use client';

import { TodoList } from './todo-list';

export default function DashboardPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
        <TodoList />
      </div>
    </div>
  );
}
