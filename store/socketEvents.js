const registerHandlers = (context, socket) => {
    socket.on('handshake', function (data) {
      console.log('socket handshake: ', this.id, data);
      socket.emit('handshake', { stories : 'wtf' });
	  context.commit('netProcessHandshake')
    });

    socket.on('broadcast', function (data) {
      console.log('broadcast: ', this.id, data);
      context.commit('resultsSetData', JSON.parse(data).results)
    });
    socket.on('ack1', function (data) {
      console.log('ack1: ', this.id, data);
      context.commit('netProcessAck1', data)
    });
    socket.on('ack2', function (data) {
      console.log('ack2: ', this.id, data);
      context.commit('netProcessAck2', data)
    });

    socket.on('reconnect', function (data) {
	  context.commit('netProcessReconnect')
    });

    socket.on('disconnect', function (data) {
      socket.removeAllListeners()
    });
}

export default {
  registerHandlers
}
