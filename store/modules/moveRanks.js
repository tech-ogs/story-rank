const swapRanks = (state, id1, id2) => {
  var rank1 = state.ranks[id1]
  var rank2 = state.ranks[id2]
  state.ranks[id1] = rank2
  state.ranks[id2] = rank1
  state.byRank[rank1] = id2
  state.byRank[rank2] = id1
}

const rebuildByRank = (state) => {
  var byRank = {}
  Object.keys(state.ranks).forEach( sid => {
    byRank[state.ranks[sid]] = sid
  })
  state.byRank = byRank
}

const moveUp = (state, {storyId, items}) => {
  //console.log('moveRanks.moveUp', storyId)
  if (state.ranks[storyId] > 1) {
    swapRanks(state, storyId, state.byRank[state.ranks[storyId] - 1 ])
  }
}

const moveDown = (state, {storyId, items}) => {
  //console.log('moveRanks.moveDown',  storyId)
  if (state.ranks[storyId] < Object.keys(state.ranks).length) {
    swapRanks(state, storyId, state.byRank[state.ranks[storyId] + 1 ])
  }
}


const moveTop = (state, {storyId, items}) => {
  if (state.ranks[storyId] > 1) {
    var pos = items.findIndex( x => { return x.id === storyId } )
    for (var i = pos ; i > 0; i-- ) {
      swapRanks(state,  storyId, items[i-1].id)
    }
  }
  //rebuildByRank(state)
}

const moveBottom = (state, {storyId, items}) => {
  //console.log('moveBottom', storyId, state.ranks[storyId], Object.keys(state.ranks).length)
  if (state.ranks[storyId] < Object.keys(state.ranks).length) {
    var pos = items.findIndex( x => { return x.id === storyId } )
    for (var i = pos ; i < items.length - 1; i++ ) {
      swapRanks(state, storyId, items[i+1].id)
    }
  }
  //rebuildByRank(state)
}

export default {
  moveUp,
  moveDown,
  moveTop,
  moveBottom
}
  
