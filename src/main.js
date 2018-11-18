import Vue from 'vue'
import App from './App.vue'
import axios from 'axios'
import VueAxios from 'vue-axios'
import 'expose-loader?$!expose-loader?jQuery!jquery'
import store from './store'
import SweetModal from 'sweet-modal-vue/src/plugin.js'

Vue.use(VueAxios, axios)
Vue.use(SweetModal)

require('./assets/css/main.less')

new Vue({
  el: '#app',
  store,
  render: h => h(App)
})
