
# LiveChat  
LiveChat is a sytem built upon express4/socket.io/babel which offers chatting functionality over HTTP.  
  
## CLI  
The supported CLI commands are:  
* exit - close server and exit cli  
* quit - close cli but keep server open  
* system comm - execute a system command  
* restart - restart server and cli  
* clear - clear cli output  
* logs - view logs  
* erase - erase logs  
* say id msg - send message to a client identified by his socket.io id  
* sayall msg - send message to all clients connected  
* eval comm - send a command to be eval'd locally on client's pc  
* refresh [clientId] - refresh all client browsers or a specific one  
> When no command is passed but a message is given, it's executed locally on the server  
> default commands prefix is '.', start all commands with this except the server-eval  
  
## Browser Commands  
There are several in-chat commands too:  
* disconnect - Close WebSocket (which by default causes browser refresh in 5 seconds)  
* admin pass - Login as admin through chat to unlock more commands  
> Current chat prefix is `!!`  
  
## Other Features  
When the server main files are changed, the server automatically reloads unless the environmental variable BLOCKRELOAD is passed,  
Similarily, when `client/JS` files are edited they get converted to ES5 and served under `client/JS5`, they get minified and Flow-compiled aswell,  
Block the automatic rebuild with the BLOCKBUILD environmental variable.  
The default serving path can be changed from `./client` to a custom one through `config.json`  
You can force `babel` compilation with `npm run build` but this requires the package to be installed as `--save-dev` and default standards to be followed.  
The server works with the Node-builtin `cluster` module and communicates with each shard with an `ipc` socket (not redis!)  
