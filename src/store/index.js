import Vue from 'vue'
import Vuex from 'vuex'
import 'es6-promise/auto'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    filter: []
  },
  mutations: {
    setFilter (state, value) {
      console.log(value);
      state.filter = value;
    }
  },
  getters: {
    filter: state => {
      return state.filter;
    }
  }
})
