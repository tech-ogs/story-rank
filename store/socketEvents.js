const registerHandlers = (socket) => {
    socket.on('news', function (data) {
      console.log('socket news event: ', this.id, data);
      socket.emit('my other event', { my: 'datax' });
    });
}

export default {
  registerHandlers
}
