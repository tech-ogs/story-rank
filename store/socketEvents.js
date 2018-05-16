const registerHandlers = (socket) => {
    socket.on('handshake', function (data) {
      console.log('socket handshake: ', this.id, data);
      socket.emit('handshake', { stories : 'wtf' });
    });
}

export default {
  registerHandlers
}
