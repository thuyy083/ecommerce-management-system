import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  esbuild: {
    loader: {
      '.js': 'jsx', // Đảm bảo tất cả file .js được biên dịch như JSX
      '.jsx': 'jsx', // Đảm bảo file .jsx cũng được biên dịch đúng
    },

    // include: /src\/.*\.(jsx|tsx)$/, // Xác định vị trí áp dụng
  },
  resolve: {
    alias: [
      {
        find: '~',
        replacement: '/src',
      },
    ],
  },
})
