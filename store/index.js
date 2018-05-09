import Vue from 'vue'
import Vuex from 'vuex'
import stories from './modules/stories'
import users from './modules/users'
import comments from './modules/comments'

Vue.use(Vuex)

// TODO: b-table showDetails function is causing strict mode violations. Figure it out and fix

const debug = false // process.env.NODE_ENV !== 'production'

export default new Vuex.Store({
  namespaced: true,
  getters: {
    rowById: (state, getters, rootState) => (module, id) => {
      //console.log('rowById:', module, id, rootState[module].byId)
      var result =  rootState[module].byId[id]
      console.log('rowById return: ', result)
      return result;
    }
  },
  actions: {
    fetchData(context, params) { 
      var promise = new Promise( (resolve, reject) => {
        var headers = new Headers();
        headers.append('Content-Type', 'application/json');
        window.fetch('/list', {
          method: 'post',
          credentials: 'same-origin',
          headers: headers,
          body: JSON.stringify({schema: params.schema, table: params.table})
        })
        .then( response => {
          return response.json()
        })
        .then(function(jsonData) { 
          var mutation = params.table + 'SetData'
          console.log('mutation', mutation)
          context.commit(mutation, jsonData)
          resolve()
        })
      })
      .catch(function(err) { 
        reject(err.message)
      })
      return promise
    },
    initData(context) {

      var promise = new Promise((resolve, reject) => {
        context.dispatch('fetchData',{ 
          schema: 'application',
          table: 'users'
        })
        .then ( () => {
          return context.dispatch('fetchData', { 
            schema: 'application',
            table: 'comments'
          })
        })
        .then ( () => {
          return context.dispatch('fetchData', { 
            schema: 'application',
            table: 'ranks',
            filters: {user_id: context.getters.usersMyLogin(context.state.users) }
          })
        })
        .then( () => {
          return context.dispatch('fetchData', { 
            schema: 'application',
            table: 'stories'
          })
        })
        .then( () => resolve())
        .catch( err => reject(err) )
      })

      return promise
    }
  },
  modules: {
    stories,
    users,
    comments
  },
  strict: debug,
  plugins: debug ? [/*createLogger()*/] : []
})
