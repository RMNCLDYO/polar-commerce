"use client";

import { Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

export function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const currentSearch = searchParams.get("search");
    if (currentSearch) {
      setSearchQuery(currentSearch);
    }
  }, [searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());

    if (searchQuery.trim()) {
      params.set("search", searchQuery.trim());
    } else {
      params.delete("search");
    }

    router.push(`/products?${params.toString()}`);
  };

  return (
    <form onSubmit={handleSearch} className="flex items-center border border-border bg-muted px-4 py-2">
      <Search className="mr-3 size-4 text-muted-foreground" />
      <input
        type="text"
        placeholder="SEARCH"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-24 bg-transparent text-xs font-mono tracking-wider outline-none placeholder:text-muted-foreground"
      />
    </form>
  );
}