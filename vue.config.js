module.exports = {
    publicPath: process.env.NODE_ENV === 'production'
    ? '/fight2020/'
    : '/',
    configureWebpack:  {
        externals: {
            'vue': 'Vue',
            'element-ui': 'ELEMENT'
        }
    }
}