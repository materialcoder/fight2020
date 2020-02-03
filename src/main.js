import Vue from 'vue'
import App from './App.vue'
import echarts from 'echarts'
import china from 'echarts/map/json/china.json'
// import ElementUI from 'element-ui';
// import 'element-ui/lib/theme-chalk/index.css';
import './style/normalize.css'

echarts.registerMap('china', china)

// Vue.use(ElementUI)

Vue.config.productionTip = false
Vue.prototype.$echarts = echarts

new Vue({
  render: h => h(App),
}).$mount('#app')
