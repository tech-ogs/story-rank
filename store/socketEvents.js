const registerHandlers = (socket) => {
    socket.on('handshake', function (data) {
      console.log('socket handshake: ', this.id, data);
      socket.emit('handshake', { stories : 'wtf' });
    });
    socket.on('broadcast', function (data) {
      console.log('broadcast: ', this.id, data);
    });

}

export default {
  registerHandlers
}
