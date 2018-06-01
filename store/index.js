import Vue from 'vue'
import Vuex from 'vuex'
import stories from './modules/stories'
import users from './modules/users'
import comments from './modules/comments'
import ranks from './modules/ranks'
import socketEvents from './socketEvents'

Vue.use(Vuex)

// TODO: b-table showDetails function is causing strict mode violations. Figure it out and fix

const debug = false // process.env.NODE_ENV !== 'production'

export default new Vuex.Store({
  state: {
    socket: null
  },
  namespaced: true,
  getters: {
    getSocket: (state) => state.socket,
    rowById: (state, getters, rootState) => (module, id) => {
      //console.log('rowById:', module, id, rootState[module].byId)
      var result =  rootState[module].byId[id]
      //console.log('rowById return: ', result)
      return result;
    }
  },
  actions: {
    initSockets(context, params) {
      console.log('init socket:', params)
      var socket = params.socket
      context.commit('setSocket', {socket: socket})
      socketEvents.registerHandlers(context, socket)     
    },

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
            //console.log('mutation', params.payload.mutation)
            var mlist = typeof params.payload.mutation === 'string' ? [params.payload.mutation] : params.payload.mutation
            mlist.forEach(mut => { 
              context.commit(mut, jsonData)
            })
            resolve()
          }
          else if (params.payload.action != null) {
            //console.log('mutation', params.payload.mutation)
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
    initStore(context, params) {

      var promise = new Promise((resolve, reject) => {
        context.dispatch('initSockets', params)
        .then( () => {
          context.dispatch('fetchData',{ 
            url: '/list',
            payload: {
              schema: 'application',
              table: 'users',
              mutation: 'usersSetData'
            }
          })
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
        .then( () => {
          return context.dispatch('fetchData', { 
            url: '/results',
            payload: {
              mutation: 'resultsSetData'
            }
          })
        })
        .then( () => {
          return context.dispatch('fetchData', { 
            url: '/list',
            payload: {
              schema: 'application',
              table: 'stories',
              mutation: ['ranksInitData', 'storiesSetData']
            }
          })
        })
        .then( () => resolve())
        .catch( err => reject(err) )
      })

      return promise
    }
  },
  mutations: {
    setSocket: (state, params) => {
      state.socket = params.socket
    }
  },
  modules: {
    stories,
    users,
    comments,
    ranks
  },
  strict: debug,
  plugins: debug ? [/*createLogger()*/] : []
})
