import Vue from 'vue'
import App from './App.vue'
import router from './router'
import date from './filters/date'
// import './plugins/element.js'
import './assets/css/global.scss'
// 导入TreeTable
import TreeTable from 'vue-table-with-tree-grid'
// 导入 NProgress 对应的 JS 和 CSS
import NProgress from 'nprogress'
// 导入富文本编辑器
import VueQuillEditor from 'vue-quill-editor'

// 导入 axios，配置请求的根路径
import axios from 'axios'
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
// 在 request 拦截器中，展示进度条 NProgress.start()
// 通過 axios 請求攔截器添加 token
axios.interceptors.request.use((config) => {
  // console.log(config)
  NProgress.start()
  config.headers.Authorization = window.sessionStorage.getItem('token')
  return config
})
// 在 response 拦截器中，隐藏进度条 NProgress.done()
axios.interceptors.response.use((config) => {
  NProgress.done()
  return config
})
Vue.prototype.$http = axios
Vue.config.productionTip = false
Vue.filter('date', date)
Vue.use(VueQuillEditor)
Vue.component('tree-table', TreeTable)

new Vue({
  router,
  render: (h) => h(App)
}).$mount('#app')
