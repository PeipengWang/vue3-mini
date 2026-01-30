import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
// 新增：导入 Element Plus 自动导入插件
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

export default defineConfig({
    plugins: [
        vue(),
        // 自动导入 Element Plus API
        AutoImport({
            resolvers: [ElementPlusResolver()]
        }),
        // 自动导入 Element Plus 组件
        Components({
            resolvers: [ElementPlusResolver()]
        })
    ]
})