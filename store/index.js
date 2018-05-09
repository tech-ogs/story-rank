import Vue from 'vue'
import Vuex from 'vuex'
import stories from './modules/stories'
import users from './modules/users'
import comments from './modules/comments'
import ranks from './modules/ranks'

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
        window.fetch(params.url, {
          method: 'post',
          credentials: 'same-origin',
          headers: headers,
          body: JSON.stringify(params.payload || {})
        })
        .then( response => {
          return response.json()
        })
        .then(function(jsonData) { 
          if (params.payload.mutation != null) {
            console.log('mutation', params.payload.mutation)
            context.commit(params.payload.mutation, jsonData)
            resolve()
          }
          else if (params.payload.action != null) {
            console.log('mutation', params.payload.mutation)
            context.dispatch(params.payload.action, jsonData)
            .then( ret => { 
              resolve(ret)
            })
            .catch( err => { 
              reject(err)
            })
          }
        })
      })
      .catch(function(err) { 
        reject(err)
      })
      return promise
    },
    initData(context) {

      var promise = new Promise((resolve, reject) => {
        context.dispatch('fetchData',{ 
          url: '/list',
          payload: {
            schema: 'application',
            table: 'users',
            mutation: 'usersSetData'
          }
        })
        .then ( () => {
          return context.dispatch('fetchData', { 
            url: '/list',
            payload: {
              schema: 'application',
              table: 'comments',
              mutation: 'commentsSetData'
            }
          })
        })
        .then ( () => {
          return context.dispatch('fetchData', { 
            url: '/list',
            payload: {
              schema: 'application',
              table: 'ranks',
              mutation: 'ranksSetData'
            }
          })
        })
        .then( () => {
          return context.dispatch('fetchData', { 
            url: '/myranks',
            payload: {
              mutation: 'ranksSetData'
            }
          })
        })
/*
        .then( () => {
          return context.dispatch('fetchData', { 
            url: '/sumranks',
            payload: {
              mutation: 'sumranksSetData'
            }
          })
        })
*/
        .then( () => {
          return context.dispatch('fetchData', { 
            url: '/list',
            payload: {
              schema: 'application',
              table: 'stories',
              mutation: 'storiesSetData'
            }
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
