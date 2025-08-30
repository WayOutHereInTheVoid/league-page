import { sveltekit } from "@sveltejs/kit/vite";

/** @type {import('vite').UserConfig} */
const config = {
  plugins: [sveltekit()],
  ssr: {
    // Exclude ApexCharts and related libraries from SSR processing
    noExternal: [],
    external: ["apexcharts", "svelte-apexcharts"],
  },
  optimizeDeps: {
    // Exclude these from pre-bundling during development
    exclude: ["apexcharts", "svelte-apexcharts"],
  },
};

export default config;
