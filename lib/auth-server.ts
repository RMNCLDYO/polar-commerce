import { createAuth } from "@/convex/auth";
import { getStaticAuth } from "@convex-dev/better-auth";
import { getToken as getTokenNextjs } from "@convex-dev/better-auth/nextjs";

export const getToken = () => {
  getStaticAuth(createAuth);
  return getTokenNextjs(createAuth);
};
