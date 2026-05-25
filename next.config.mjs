/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "placehold.co",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "rmgnwwbgurkigqvvmbrk.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  async redirects() {
    return [
      { source: "/menu/ara-sicaklar", destination: "/menu/vorspeisen", permanent: false },
      { source: "/menu/icecekler", destination: "/menu/getraenke", permanent: false },
    ];
  },
};

export default nextConfig;
