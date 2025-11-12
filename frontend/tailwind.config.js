/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1890ff',
        secondary: '#52c41a',
        success: '#52c41a',
        warning: '#faad14',
        error: '#f5222d',
        info: '#1890ff',
      },
    },
  },
  plugins: [],
  // Ensure Tailwind doesn't conflict with Ant Design
  corePlugins: {
    preflight: false,
  },
}
