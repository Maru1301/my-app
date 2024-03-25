/** @type {import('next').NextConfig} */
const nextConfig = {
    output: "export",  // <=== enables static exports
    reactStrictMode: true,
    assetPrefix: 'https://maru1301.github.io/my-app/',
    exportPathMap: function () {
      return {
        '/': { page: '/' },
        '/Mainpage': { page: '/Mainpage' }
      }
    },
  };

export default nextConfig;
