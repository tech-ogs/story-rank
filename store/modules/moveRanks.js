import Vue from 'vue'

const swapRanks = (state, id1, id2) => {
  var rank1 = state.ranks[id1]
  var rank2 = state.ranks[id2]
  state.ranks[id1] = rank2
  state.ranks[id2] = rank1
  state.byRank[rank1] = id2
  state.byRank[rank2] = id1
}

/*
const rebuildByRank = (state) => {
  var byRank = {}
  Object.keys(state.ranks).forEach( sid => {
    byRank[state.ranks[sid]] = sid
  })
  state.byRank = byRank
}
*/

const moveUp = (state, {storyId, items}) => {
  //console.log( 'ranks moveUp', console.log( Object.keys(state.ranks).sort((a,b)=>state.ranks[a]-state.ranks[b]))  )
  if (state.ranks[storyId] > 1) {
    swapRanks(state, storyId, state.byRank[state.ranks[storyId] - 1 ])
  }
  //console.log( 'ranks moveUp', console.log( Object.keys(state.ranks).sort((a,b)=>state.ranks[a]-state.ranks[b]))  )
}

const moveDown = (state, {storyId, items}) => {
  //console.log( 'ranks moveDown', console.log( Object.keys(state.ranks).sort((a,b)=>state.ranks[a]-state.ranks[b]))  )
  if (state.ranks[storyId] < Object.keys(state.ranks).length && state.favorites[ state.byRank[state.ranks[storyId] + 1 ] ] ) {
    swapRanks(state, storyId, state.byRank[state.ranks[storyId] + 1 ])
  }
  //console.log( 'ranks moveDown', console.log( Object.keys(state.ranks).sort((a,b)=>state.ranks[a]-state.ranks[b]))  )

}


const moveTop = (state, {storyId, items}) => {
  //console.log( 'ranks moveTop', console.log( Object.keys(state.ranks).sort((a,b)=>state.ranks[a]-state.ranks[b]))  )

  //console.log(JSON.stringify(state.favorites))
  if (state.ranks[storyId] > 1) {
    var pos = items.findIndex( x => { return x.id === storyId } )
    for (var i = pos ; i > 0; i-- ) {
      swapRanks(state,  storyId, items[i-1].id)
    }
  }
}

const moveBottom = (state, {storyId, items}) => {
  //console.log( 'ranks moveBottom', console.log( Object.keys(state.ranks).sort((a,b)=>state.ranks[a]-state.ranks[b]))  )
  console.log(JSON.stringify(state.favorites))

  if (state.ranks[storyId] < Object.keys(state.ranks).length) {
    var pos = items.findIndex( x => { return x.id === storyId } )
    for (var i = pos ; i < items.length - 1; i++ ) {
      swapRanks(state, storyId, items[i+1].id)
    }
  }
}

const moveInFav = (state, {storyId, items}) => {
  //console.log( 'ranks moveInFav', console.log( Object.keys(state.ranks).sort((a,b)=>state.ranks[a]-state.ranks[b]))  )

  Vue.set(state.favorites, storyId, true)
  if (state.ranks[storyId] > 1) {
    var pos = items.findIndex( x => { return x.id === storyId } )
    for (var i = pos ; i > 0; i-- ) {
      if (!state.favorites[items[i-1].id]) {
        swapRanks(state,  storyId, items[i-1].id)
      }
    }
  }
}

const moveOutFav = (state, {storyId, items}) => {
  //console.log( 'ranks moveOutFav', console.log( Object.keys(state.ranks).sort((a,b)=>state.ranks[a]-state.ranks[b]))  )
  //console.log(JSON.stringify(state.favorites))

  Vue.set(state.favorites, storyId,  false)
  if (state.ranks[storyId] < Object.keys(state.ranks).length) {
    var pos = items.findIndex( x => { return x.id === storyId } )
    for (var i = pos ; i < items.length - 1; i++ ) {
      if (state.favorites[items[i+1].id]) {
        swapRanks(state, storyId, items[i+1].id)
      }
    }
  }
}



/* the entry points for rank manipulations are actions since they need to work with socket (in rootstate) as well as ranks module state */
const postData = (context) => {
  return {
    ranks : context.getters.ranks,
    favorites: context.getters.favorites
  }
}

const  moveUpAction = (context, params) => {
  var oldVal = context.state.ranks[params.storyId]
  context.commit('ranksMoveUp', params)
  var newVal = context.state.ranks[params.storyId]
  if (oldVal !== newVal) {
    var scrollTop = context.getters.dashScrollTop
    context.commit('dashSetScrollTop', scrollTop - 120)
  }
  context.rootState.socket.emit('rank_update', postData(context))
}

const moveDownAction = (context, params) => {
  var oldVal = context.state.ranks[params.storyId]
  context.commit('ranksMoveDown', params)
  var newVal = context.state.ranks[params.storyId]
  if (oldVal !== newVal) {
    var scrollTop = context.getters.dashScrollTop
    context.commit('dashSetScrollTop', scrollTop + 120)
  }
  context.rootState.socket.emit('rank_update', postData(context))
}
const  moveTopAction = (context, params) => {
  context.commit('ranksMoveTop', params)
  context.rootState.socket.emit('rank_update', postData(context))

}
const  moveBottomAction = (context, params) => {
  context.commit('ranksMoveBottom', params)
  context.rootState.socket.emit('rank_update', postData(context))

}

const  moveInFavAction = (context, params) => {
  context.commit('ranksMoveInFav', params)
  context.rootState.socket.emit('rank_update', postData(context))

}
const  moveOutFavAction = (context, params) => {
  context.commit('ranksMoveOutFav', params)
  context.rootState.socket.emit('rank_update', postData(context))

}

export default {
  moveUpAction,
  moveDownAction,
  moveTopAction,
  moveBottomAction,
  moveInFavAction,
  moveOutFavAction,
  moveUp,
  moveDown,
  moveTop,
  moveBottom,
  moveInFav,
  moveOutFav
}
  
