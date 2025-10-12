const authConfig = {
  providers: [
    {
      domain: `${process.env.CONVEX_SITE_URL}`,
      applicationID: 'convex',
    },
  ],
} as const;

export default authConfig;
