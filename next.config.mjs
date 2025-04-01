/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    images: {
        domains: ["cdn.shopify.com"],
    },
    async rewrites() {
        return [
        {
            source: "/products",
            destination: "/app/products",
        },
        {
            source: "/",
            destination: "/app",
        },
        ];
    },
    async redirects() {
        return [
        {
            source: "/home",
            destination: "/",
            permanent: true,
        },
        ];
    },
    async headers() {
        return [
        {
            source: "/(.*)",
            headers: [
            {
                key: "X-Frame-Options",
                value: "DENY",
            },
            {
                key: "X-Content-Type-Options",
                value: "nosniff",
            },
            {
                key: "Referrer-Policy",
                value: "strict-origin-when-cross-origin",
            },
            {
                key: "Permissions-Policy",
                value: "camera=(), microphone=(), geolocation=()",
            },
            {
                key: "X-XSS-Protection",
                value: "1; mode=block",
            },
            ],
        },
        ];
    },
};

export default nextConfig;
