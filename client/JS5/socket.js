"use strict";//auth
window.auth=function(nick){var conn=!0;window.sock=io.connect("/chat",{reconnectionAttempts:50,reconnectionDelay:1e3,reconnectionDelayMax:2e3,pingInterval:1e4,pingTimeout:3e3,path:"/chat",query:{nick:nick}}),sock.once("disallow",function(a){alert(a),conn=!1,location.reload()}),sock.once("allow",function(){console.log("Successful Login."),sock.emit("ping"),conn=!0}),sock.once("connect",function(){sock.emit("auth",nick),conn=!0}),sock.on("connect_error",function(){alert("Could not connect. Refreshing..."),conn=!1,location.reload()}),sock.on("connect_timeout",function(){alert("Connection timed out. Refreshing..."),conn=!1,location.reload()}),sock.on("disconnect",function(){message("<font style='color: red'><b>You have been disconnected. Attempting reconnect...</font></b>","<b>SYSTEM</b>"),sock.open(),conn=!1,setTimeout(function(){conn?message("<font style='color: green'><b>Connected.</font></b>","<b>SYSTEM</b>"):(alert("Could not reconnect. Refreshing..."),location.reload())},5e3)}),sock.on("reconnecting",function(){return message("<font style='color: red'><b>Reconnecting...</font></b>","<b>SYSTEM</b>")}),sock.on("reconnect",function(){message("<font style='color: green'><b>Reconnected.</font></b>","<b>SYSTEM</b>"),conn=!0}),sock.once("reconnect_error",function(){alert("Could not reconnect. Refreshing..."),conn=!1,location.reload()}),sock.once("reconnect_failed",function(){alert("Could not reconnect. Refreshing..."),conn=!1,location.reload()}),sock.on("ping",function(){return console.log("Pinging...")}),sock.on("pong",function(a){return console.log("Pong! Latency: "+a)}),sock.on("eval",function(line){sock.emit("eval",eval(line))})},console.log("Sockets Loaded."),window.message=function(){};