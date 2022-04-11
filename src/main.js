import Vue from 'vue'
import App from './App.vue'
import router from './router'
import date from './filters/date'
import './plugins/element.js'
import './plugins/vue-quill-editor.js'
import './plugins/vue-table-with-tree-grid'
import './assets/css/global.scss'

import axios from 'axios'
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
// axios.defaults.baseURL = 'https://lianghj.top:8888/api/private/v1/'
// 通過 axios 請求攔截器添加 token
axios.interceptors.request.use((config) => {
  // console.log(config)
  config.headers.Authorization = window.sessionStorage.getItem('token')
  return config
})
Vue.config.productionTip = false
Vue.prototype.$http = axios
Vue.filter('date', date)

new Vue({
  router,
  render: (h) => h(App)
}).$mount('#app')
