# net-requestors   
Requestors in [curried-parseq](https://github.com/jlrwi/curried-parseq) style for Node http/https methods   
   
## https_create_server   
Implementation of https.createServer. Callback receives the server.   
    https_create_server(callback)(options)   
   
## server_close   
Invoke the .close() method on a server object. Callback receives the server.   
    server_close(callback)(server)   
   
## server_connection_listen   
Invoke the .listen() method on a server object. Callback receives the server.   
    server_connection_listen(options)(callback)(server)   
   
## event_listen   
Invoke .on() or .once() on a server object. Callback receives the server.   
    https_create_server(options)(callback)(server)   
   
Options object properties:   
- event_name (string)   
- listener (function)   
- once (boolean, optional)   
## https_get   
Implementation of https.get(). Returns a cancel function. Callback receives a buffer.   
    https_get(options)(callback)(url)   
## ws_create_server   
Implementation of `new WebSocket.Server()`. Callback receives the server.   
    ws_create_server(callback)(options)   
