const registerHandlers = (context, socket) => {
    socket.on('handshake', function (data) {
      console.log('socket handshake: ', this.id, data);
      socket.emit('handshake', { stories : 'wtf' });
    });
    socket.on('broadcast', function (data) {
      console.log('broadcast: ', this.id, data);
      context.commit('resultsSetData', JSON.parse(data).results)
    });
    socket.on('disconnect', function (data) {
      socket.removeAllListeners()
    });
}

export default {
  registerHandlers
}
