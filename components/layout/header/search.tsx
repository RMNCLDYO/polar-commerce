'use client';

import { Search as SearchIcon } from 'lucide-react';
import Form from 'next/form';
import { useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function Search() {
  const searchParams = useSearchParams();
  const currentSearch = searchParams.get('search') || '';

  return (
    <Form
      action="/products"
      className="hidden md:flex items-center border border-border bg-muted px-4 py-2 hover:bg-accent transition-colors rounded-md"
    >
      <SearchIcon className="mr-3 size-4 text-muted-foreground shrink-0" />
      <Label htmlFor="search" className="sr-only">
        Search products
      </Label>
      <Input
        id="search"
        key={currentSearch}
        type="text"
        name="search"
        placeholder="SEARCH"
        defaultValue={currentSearch}
        aria-label="Search products"
        className="w-24 h-auto border-0 bg-transparent p-0 text-xs font-mono tracking-wider shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
      />
    </Form>
  );
}
