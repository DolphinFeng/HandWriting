import path from 'path';
import {defineConfig} from 'vite';
import vue from '@vitejs/plugin-vue';
import cesium from 'vite-plugin-cesium';
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import {ElementPlusResolver} from 'unplugin-vue-components/resolvers';

export default defineConfig({
  build: {
    //sourcemap: true,
    target: 'es2020',
    minify: false,
    terserOptions: {
      mangle: false, // 禁用变量名混淆
      compress: false, // 禁用代码压缩
    },
  },
  plugins: [
    vue(),
    cesium(),
    AutoImport({
      resolvers: [ElementPlusResolver()],
    }),
    Components({
      resolvers: [ElementPlusResolver()],
    }),
  ],
  // envDir: './env',
  resolve: {
    extensions: ['.js', '.vue', '.json', '.ts'],
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
});
