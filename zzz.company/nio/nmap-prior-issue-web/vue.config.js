const {defineConfig} = require('@vue/cli-service')
const AutoImport = require('unplugin-auto-import/webpack')
const Components = require('unplugin-vue-components/webpack')
const {ElementPlusResolver} = require('unplugin-vue-components/resolvers')
const IconResolver = require('unplugin-icons/resolver');
const Icons = require('unplugin-icons/webpack');
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin')
// const webpack = require('webpack')
// const CopyWebpackPlugin = require('copy-webpack-plugin')
// const HtmlWebpackPlugin = require('html-webpack-plugin')
const path = require('path')
const pathSrc = path.resolve(__dirname, 'src')
// const config = require('./config')

module.exports = defineConfig({
    transpileDependencies: true,
    configureWebpack: {
        plugins: [
            AutoImport({
                resolvers: [
                    ElementPlusResolver(),
                    IconResolver({
                        prefix: 'Icon',
                    }),
                ],
                // dts: path.resolve(pathSrc, 'auto-imports.d.ts'),
            }),
            Components({
                resolvers: [
                    ElementPlusResolver(),
                    IconResolver({
                        enabledCollections: ['ep'],
                    })
                ],
                dts: path.resolve(pathSrc, 'components.d.ts'),
            }),
            Icons({
                autoInstall: true
            }),
            new MonacoWebpackPlugin()
            // new webpack.DefinePlugin({
            //   'process.env': require('./config/dev.env')
            // }),
        ]
    }
});
