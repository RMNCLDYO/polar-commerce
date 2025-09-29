'use client';

import { Search as SearchIcon } from 'lucide-react';
import Form from 'next/form';
import { useSearchParams } from 'next/navigation';

export function Search() {
  const searchParams = useSearchParams();
  const currentSearch = searchParams.get('search') || '';

  return (
    <Form
      action="/products"
      className="hidden md:flex items-center border border-border bg-muted px-4 py-2 hover:bg-accent transition-colors"
    >
      <SearchIcon className="mr-3 size-4 text-muted-foreground" />
      <input
        key={currentSearch}
        type="text"
        name="search"
        placeholder="SEARCH"
        defaultValue={currentSearch}
        className="w-24 bg-transparent text-xs font-mono tracking-wider outline-none placeholder:text-muted-foreground"
      />
    </Form>
  );
}
