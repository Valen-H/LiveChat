"use strict";function asyncGeneratorStep(a,b,c,d,e,f,g){try{var h=a[f](g),i=h.value}catch(a){return void c(a)}h.done?b(i):Promise.resolve(i).then(d,e)}function _asyncToGenerator(a){return function(){var b=this,c=arguments;return new Promise(function(d,e){function f(a){asyncGeneratorStep(h,d,e,f,g,"next",a)}function g(a){asyncGeneratorStep(h,d,e,f,g,"throw",a)}var h=a.apply(b,c);f(void 0)})}}var text={shift:!1,area:null,send:null,room:null},scroll=100,historyIdx=0,hist=[""],maxHistory=50,rooms={},room="LOBBY",prefix="!!";for(window.nick=getCookie("user")||"guest_"+Math.round(1e5*Math.random());!(nick=prompt("Insert a Nickname:",nick||getCookie("user")))||!/^[a-zA-Z0-9_\-();' ]+$/i.test(nick););function drop(a){var b=1<arguments.length&&arguments[1]!==void 0?arguments[1]:1;for(a=a.split(" ");b--;)a.shift();return a.join(" ")}//drop
function dropGet(a){var b=1<arguments.length&&arguments[1]!==void 0?arguments[1]:0;for(a=a.split(" ");b--;)a.shift();return a.shift()}//dropGet
function load(){return _load.apply(this,arguments)}//load
function _load(){return _load=_asyncToGenerator(/*#__PURE__*/regeneratorRuntime.mark(function a(){return regeneratorRuntime.wrap(function(a){for(;;)switch(a.prev=a.next){case 0:console.log("Index loaded"),text.area=document.getElementById("msgarea"),text.send=document.getElementById("txtarea"),text.room=document.getElementById("rooms"),auth(nick),setCookie("user",nick),parseQueries(),sock.on("message",/*#__PURE__*/function(){var a=_asyncToGenerator(/*#__PURE__*/regeneratorRuntime.mark(function a(b,c,d){return regeneratorRuntime.wrap(function(a){for(;;)switch(a.prev=a.next){case 0:d==room&&message(b,c);case 1:case"end":return a.stop();}},a,this)}));return function(){return a.apply(this,arguments)}}()),sock.on("joined",function(a){var b=a;a.startsWith("USR")&&(b="Private Channel");var c=document.createElement("p");c.classList.add("channel"),c.innerHTML=b,c.onclick=function(){switchCur(a)},rooms[a]=c,text.room.appendChild(c)}),sock.on("left",function(){}),sock.on("main",function(a){rooms[room].classList.remove("selected-chan"),rooms[a].classList.add("selected-chan"),room=a}),sock.on("history",/*#__PURE__*/_asyncToGenerator(/*#__PURE__*/regeneratorRuntime.mark(function a(){var b,c,d,e,f,g=arguments;return regeneratorRuntime.wrap(function(a){for(;;)switch(a.prev=a.next){case 0:for(b=g.length,c=Array(b),d=0;d<b;d++)c[d]=g[d];for(e=0;e<c.length;e++)f=c[e],message(f.content,f.user,new Date(f.timestamp).toDateString());case 2:case"end":return a.stop();}},a,this)}))),sock.once("connect",function(){text.area.innerHTML="",message("This is a Beta version of a chatting service, upcoming features are: profile picture support, multiple chatrooms and more security!","<font color='red'><b>SYSTEM</b></font>"),message("<b>THIS SERVER DOES NOT FOLLOW PRIVACY RULES!! USE AT YOUR OWN AGREEMENT (GDPR)</b>","<font color='red'><b>SYSTEM</b></font>"),message("<u>Please be kind and don't spam, we have means of banning aggitators.</u>","<font color='red'><b>SYSTEM</b></font>"),console.info("The prefix is !!, type !!help in chat for commands.")});case 13:case"end":return a.stop();}},a,this)})),_load.apply(this,arguments)}function switchCur(){var a=0<arguments.length&&arguments[0]!==void 0?arguments[0]:"LOBBY",b=1<arguments.length&&arguments[1]!==void 0?arguments[1]:prompt("Password (Leave empty for public rooms or already authorized rooms)","");sock.emit("switch",a,b),text.area.innerHTML=""}//switchCur
function send(){var msg=0<arguments.length&&void 0!==arguments[0]?arguments[0]:text.send.value;return text.send.value="",msg.startsWith(prefix)?command(msg):void(msg=msg.replace(/\${((.|\n)+?)}/gm,function(match,p){return eval(p)}),msg=msg.trim(),sendMessage(msg))}//send
function sendMessage(a){a?conn?sock.send(a):message("<font color='red'><b>You cannot send messages while disconnected!</b></font>","<font color='red'><b>SYSTEM</b></font>"):message("<font color='red'><b>You cannot send an empty message!</b></font>","<font color='red'><b>SYSTEM</b></font>")}//sendMessage
function message(a,b){var c=2<arguments.length&&arguments[2]!==void 0?arguments[2]:new Date().toDateString(),d=document.createElement("p");d.innerHTML="<font color='gray'><small>".concat(c,"</small></font>&emsp;<b>").concat(b,":</b> ").concat(a,"<br />"),text.area.appendChild(d),text.area.scrollBy&&text.area.scrollBy(0,scroll)}//message
function shiftcheck(a){var b=!(1<arguments.length&&arguments[1]!==void 0)||arguments[1];if("Shift"==a.key)text.shift=b;else{if("ArrowUp"==a.key&&b)return++historyIdx,historyIdx%=hist.length,void(text.send.value=hist[historyIdx]);if("ArrowUp"==a.key)return;if("ArrowDown"==a.key&&b)return historyIdx=1>historyIdx?hist.length-1:historyIdx-1,void(text.send.value=hist[historyIdx]);if("ArrowDown"==a.key)return;if("Enter"==a.key&&!text.shift&&!b)for(send(),hist.unshift("");hist.length>=maxHistory;)hist.pop()}hist[0]=text.send.value}//shiftcheck
function submit(){text.shift=!1,shiftcheck({key:"Enter"},!1)}//submit
function sanitize(a){return a=a.replace(/&/gmi,"&amp;").replace(/</gmi,"&lt;").replace(/>/gmi,"&gt;").replace(/"/gmi,"&quot;").replace(/'/gmi,"&#039;"),a}//sanitize
function parseCookies(){var a=0<arguments.length&&arguments[0]!==void 0?arguments[0]:document.cookie;return new Map(a.split(";").map(function(a){return a.split("=")}))}//parseCookies
function storeCookies(a){return document.cookie=Array.from(a).map(function(b){return b.join("=")}).join(";")}//storeCookies
function setCookie(a,b){var c=parseCookies();return c.set(a,b),storeCookies(c)}//setCookie
function getCookie(a){var b=parseCookies();return b.get(a)}//getCookie
function parseQueries(){var a=0<arguments.length&&arguments[0]!==void 0?arguments[0]:location.href,b=a.split("?").pop().replace(/#.*?$/,"").split("&").map(function(a){return a.split("=")}),c=!0,d=!1,e=void 0;try{for(var f,g,h=b[Symbol.iterator]();!(c=(f=h.next()).done);c=!0)g=f.value,window[g.shift()]=g.pop()}catch(a){d=!0,e=a}finally{try{c||null==h.return||h.return()}finally{if(d)throw e}}}//parseQueries
window.addEventListener("DOMContentLoaded",load);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL0pTL2luZGV4LmpzIl0sIm5hbWVzIjpbInRleHQiLCJzaGlmdCIsImFyZWEiLCJzZW5kIiwicm9vbSIsInNjcm9sbCIsImhpc3RvcnlJZHgiLCJoaXN0IiwibWF4SGlzdG9yeSIsInJvb21zIiwicHJlZml4Iiwid2luZG93IiwibmljayIsImdldENvb2tpZSIsIk1hdGgiLCJyb3VuZCIsInJhbmRvbSIsInByb21wdCIsInRlc3QiLCJkcm9wIiwibGluZSIsInQiLCJzcGxpdCIsImpvaW4iLCJkcm9wR2V0IiwibG9hZCIsImNvbnNvbGUiLCJsb2ciLCJkb2N1bWVudCIsImdldEVsZW1lbnRCeUlkIiwiYXV0aCIsInNldENvb2tpZSIsInBhcnNlUXVlcmllcyIsInNvY2siLCJvbiIsIm1zZyIsInJtIiwibWVzc2FnZSIsImNoYW4iLCJjaGFubiIsInN0YXJ0c1dpdGgiLCJwIiwiY3JlYXRlRWxlbWVudCIsImNsYXNzTGlzdCIsImFkZCIsImlubmVySFRNTCIsIm9uY2xpY2siLCJzd2l0Y2hDdXIiLCJhcHBlbmRDaGlsZCIsIm5hbWUiLCJyZW1vdmUiLCJkYXRhIiwiaSIsImNvbnRlbnQiLCJ1c2VyIiwiRGF0ZSIsInRpbWVzdGFtcCIsInRvRGF0ZVN0cmluZyIsIm9uY2UiLCJpbmZvIiwicGFzcyIsImVtaXQiLCJ2YWx1ZSIsImNvbW1hbmQiLCJyZXBsYWNlIiwibWF0Y2giLCJldmFsIiwidHJpbSIsInNlbmRNZXNzYWdlIiwiY29ubiIsImRhdGUiLCJzY3JvbGxCeSIsInNoaWZ0Y2hlY2siLCJldmVudCIsImRvd24iLCJrZXkiLCJsZW5ndGgiLCJ1bnNoaWZ0IiwicG9wIiwic3VibWl0Iiwic2FuaXRpemUiLCJwYXJzZUNvb2tpZXMiLCJjb29raWVzIiwiY29va2llIiwiTWFwIiwibWFwIiwiYyIsInN0b3JlQ29va2llcyIsIkFycmF5IiwiZnJvbSIsImEiLCJ0bXAiLCJzZXQiLCJnZXQiLCJsb2MiLCJsb2NhdGlvbiIsImhyZWYiLCJvdXQiLCJxIiwi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QUMsQ0FBQzVFLEtBQUYsQ0FBUSxHQUFSLENBQUosQ0FBMUQsQ0FEd0Msd0JBR2xELFVBQVM4QixDQUFULEdBQWM2QyxDQUFkLGdEQUFTN0MsQ0FBVCxTQUNDekMsTUFBTSxDQUFDeUMsQ0FBQyxDQUFDbkQsS0FBRixFQUFELENBQU4sQ0FBb0JtRCxDQUFDLENBQUMwQixHQUFGLEVBSjZCLG1GQU1sRCxDQUFDO0FBRUZuRSxNQUFNLENBQUN3RixnQkFBUCxDQUF3QixrQkFBeEIsQ0FBNEMxRSxJQUE1QyxDIiwic291cmNlc0NvbnRlbnQiOlsi77u/XCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG5sZXQgdGV4dDogb2JqZWN0ID0ge1xyXG5cdHNoaWZ0OiBmYWxzZSxcclxuXHRhcmVhOiBudWxsLFxyXG5cdHNlbmQ6IG51bGwsXHJcblx0cm9vbTogbnVsbFxyXG59LFxyXG5cdHNjcm9sbDogbnVtYmVyID0gMTAwLFxyXG5cdGhpc3RvcnlJZHg6IG51bWJlciA9IDAsXHJcblx0aGlzdDogQXJyYXkgPSBbJyddLFxyXG5cdG1heEhpc3Rvcnk6IG51bWJlciA9IDUwLFxyXG5cdHJvb21zOiBvYmplY3QgPSB7IH0sXHJcblx0cm9vbTogc3RyaW5nID0gXCJMT0JCWVwiO1xyXG5cclxuY29uc3QgcHJlZml4OiBzdHJpbmcgPSBcIiEhXCI7XHJcblxyXG53aW5kb3cubmljayA9IGdldENvb2tpZShcInVzZXJcIikgfHwgXCJndWVzdF9cIiArIE1hdGgucm91bmQoTWF0aC5yYW5kb20oKSAqIDFlNSk7XHJcblxyXG53aGlsZSAoIShuaWNrID0gcHJvbXB0KFwiSW5zZXJ0IGEgTmlja25hbWU6XCIsIG5pY2sgfHwgZ2V0Q29va2llKFwidXNlclwiKSkpIHx8ICEvXlthLXpBLVowLTlfXFwtKCk7JyBdKyQvaS50ZXN0KG5pY2spKSB7IH1cclxuXHJcbmZ1bmN0aW9uIGRyb3AobGluZTogbnVtYmVyLCB0OiBudW1iZXIgPSAxKTogc3RyaW5nIHtcclxuXHRsaW5lID0gbGluZS5zcGxpdCgnICcpO1xyXG5cdHdoaWxlICh0LS0pIHtcclxuXHRcdGxpbmUuc2hpZnQoKTtcclxuXHR9XHJcblx0cmV0dXJuIGxpbmUuam9pbignICcpO1xyXG59IC8vZHJvcFxyXG5cclxuZnVuY3Rpb24gZHJvcEdldChsaW5lOiBudW1iZXIsIHQ6IG51bWJlciA9IDApOiBzdHJpbmcge1xyXG5cdGxpbmUgPSBsaW5lLnNwbGl0KCcgJyk7XHJcblx0d2hpbGUgKHQtLSkge1xyXG5cdFx0bGluZS5zaGlmdCgpO1xyXG5cdH1cclxuXHRyZXR1cm4gbGluZS5zaGlmdCgpO1xyXG59IC8vZHJvcEdldFxyXG5cclxuYXN5bmMgZnVuY3Rpb24gbG9hZChlPzogb2JqZWN0KTogdm9pZCB7XHJcblx0Y29uc29sZS5sb2coXCJJbmRleCBsb2FkZWRcIik7XHJcblxyXG5cdHRleHQuYXJlYSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibXNnYXJlYVwiKTtcclxuXHR0ZXh0LnNlbmQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInR4dGFyZWFcIik7XHJcblx0dGV4dC5yb29tID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJyb29tc1wiKTtcclxuXHJcblx0YXV0aChuaWNrKTtcclxuXHRzZXRDb29raWUoXCJ1c2VyXCIsIG5pY2spO1xyXG5cdHBhcnNlUXVlcmllcygpO1xyXG5cdFxyXG5cdHNvY2sub24oXCJtZXNzYWdlXCIsIGFzeW5jIChtc2c6IHN0cmluZywgbmljazogc3RyaW5nLCBybTogc3RyaW5nKTogdm9pZCA9PiB7XHJcblx0XHRpZiAocm0gPT0gcm9vbSkgbWVzc2FnZShtc2csIG5pY2spO1xyXG5cdH0pO1xyXG5cdHNvY2sub24oXCJqb2luZWRcIiwgY2hhbiA9PiB7XHJcblx0XHRsZXQgY2hhbm4gPSBjaGFuO1xyXG5cdFx0aWYgKGNoYW4uc3RhcnRzV2l0aChcIlVTUlwiKSkge1xyXG5cdFx0XHRjaGFubiA9IFwiUHJpdmF0ZSBDaGFubmVsXCI7XHJcblx0XHR9XHJcblx0XHRsZXQgcCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJwXCIpO1xyXG5cdFx0cC5jbGFzc0xpc3QuYWRkKFwiY2hhbm5lbFwiKTtcclxuXHRcdHAuaW5uZXJIVE1MID0gY2hhbm47XHJcblx0XHRwLm9uY2xpY2sgPSBmdW5jdGlvbiBjbGljayhlPzogb2JqZWN0KSB7XHJcblx0XHRcdHN3aXRjaEN1cihjaGFuKTtcclxuXHRcdH07XHJcblx0XHRyb29tc1tjaGFuXSA9IHA7XHJcblx0XHR0ZXh0LnJvb20uYXBwZW5kQ2hpbGQocCk7XHJcblx0fSk7XHJcblx0c29jay5vbihcImxlZnRcIiwgKCkgPT4geyB9KTsgIC8vSU1QTFxyXG5cdHNvY2sub24oXCJtYWluXCIsIG5hbWUgPT4ge1xyXG5cdFx0cm9vbXNbcm9vbV0uY2xhc3NMaXN0LnJlbW92ZShcInNlbGVjdGVkLWNoYW5cIik7XHJcblx0XHRyb29tc1tuYW1lXS5jbGFzc0xpc3QuYWRkKFwic2VsZWN0ZWQtY2hhblwiKTtcclxuXHRcdHJvb20gPSBuYW1lO1xyXG5cdH0pO1xyXG5cdHNvY2sub24oXCJoaXN0b3J5XCIsIGFzeW5jICguLi5kYXRhOiBzdHJpbmdbXSk6IHZvaWQgPT4ge1xyXG5cdFx0Zm9yIChsZXQgaSBvZiBkYXRhKSB7XHJcblx0XHRcdG1lc3NhZ2UoaS5jb250ZW50LCBpLnVzZXIsIChuZXcgRGF0ZShpLnRpbWVzdGFtcCkpLnRvRGF0ZVN0cmluZygpKTtcclxuXHRcdH1cclxuXHR9KTtcclxuXHRzb2NrLm9uY2UoXCJjb25uZWN0XCIsICgpOiB2b2lkID0+IHtcclxuXHRcdHRleHQuYXJlYS5pbm5lckhUTUwgPSAnJztcclxuXHRcdG1lc3NhZ2UoXCJUaGlzIGlzIGEgQmV0YSB2ZXJzaW9uIG9mIGEgY2hhdHRpbmcgc2VydmljZSwgdXBjb21pbmcgZmVhdHVyZXMgYXJlOiBwcm9maWxlIHBpY3R1cmUgc3VwcG9ydCwgbXVsdGlwbGUgY2hhdHJvb21zIGFuZCBtb3JlIHNlY3VyaXR5IVwiLCBcIjxmb250IGNvbG9yPSdyZWQnPjxiPlNZU1RFTTwvYj48L2ZvbnQ+XCIpO1xyXG5cdFx0bWVzc2FnZShcIjxiPlRISVMgU0VSVkVSIERPRVMgTk9UIEZPTExPVyBQUklWQUNZIFJVTEVTISEgVVNFIEFUIFlPVVIgT1dOIEFHUkVFTUVOVCAoR0RQUik8L2I+XCIsIFwiPGZvbnQgY29sb3I9J3JlZCc+PGI+U1lTVEVNPC9iPjwvZm9udD5cIik7XHJcblx0XHRtZXNzYWdlKFwiPHU+UGxlYXNlIGJlIGtpbmQgYW5kIGRvbid0IHNwYW0sIHdlIGhhdmUgbWVhbnMgb2YgYmFubmluZyBhZ2dpdGF0b3JzLjwvdT5cIiwgXCI8Zm9udCBjb2xvcj0ncmVkJz48Yj5TWVNURU08L2I+PC9mb250PlwiKTtcclxuXHRcdGNvbnNvbGUuaW5mbyhcIlRoZSBwcmVmaXggaXMgISEsIHR5cGUgISFoZWxwIGluIGNoYXQgZm9yIGNvbW1hbmRzLlwiKTtcclxuXHR9KTtcclxufSAvL2xvYWRcclxuXHJcbmZ1bmN0aW9uIHN3aXRjaEN1cihuYW1lOiBzdHJpbmcgPSBcIkxPQkJZXCIsIHBhc3M6IHN0cmluZyA9IHByb21wdChcIlBhc3N3b3JkIChMZWF2ZSBlbXB0eSBmb3IgcHVibGljIHJvb21zIG9yIGFscmVhZHkgYXV0aG9yaXplZCByb29tcylcIiwgJycpKSB7XHJcblx0c29jay5lbWl0KFwic3dpdGNoXCIsIG5hbWUsIHBhc3MpO1xyXG5cdHRleHQuYXJlYS5pbm5lckhUTUwgPSAnJztcclxufSAvL3N3aXRjaEN1clxyXG5cclxuZnVuY3Rpb24gc2VuZChtc2c6IHN0cmluZyA9IHRleHQuc2VuZC52YWx1ZSk6IHZvaWQge1xyXG5cdHRleHQuc2VuZC52YWx1ZSA9ICcnO1xyXG5cdGlmIChtc2cuc3RhcnRzV2l0aChwcmVmaXgpKSB7XHJcblx0XHRyZXR1cm4gY29tbWFuZChtc2cpO1xyXG5cdH1cclxuXHRtc2cgPSBtc2cucmVwbGFjZSgvXFwkeygoLnxcXG4pKz8pfS9nbSwgKG1hdGNoLCBwKSA9PiBldmFsKHApKTtcclxuXHRtc2cgPSBtc2cudHJpbSgpO1xyXG5cdHNlbmRNZXNzYWdlKG1zZyk7XHJcbn0gLy9zZW5kXHJcblxyXG5mdW5jdGlvbiBzZW5kTWVzc2FnZShtc2c6IHN0cmluZyk6IHZvaWQge1xyXG5cdGlmICghbXNnKSB7XHJcblx0XHRtZXNzYWdlKFwiPGZvbnQgY29sb3I9J3JlZCc+PGI+WW91IGNhbm5vdCBzZW5kIGFuIGVtcHR5IG1lc3NhZ2UhPC9iPjwvZm9udD5cIiwgXCI8Zm9udCBjb2xvcj0ncmVkJz48Yj5TWVNURU08L2I+PC9mb250PlwiKTtcclxuXHR9IGVsc2UgaWYgKGNvbm4pIHtcclxuXHRcdHNvY2suc2VuZChtc2cpO1xyXG5cdH0gZWxzZSB7XHJcblx0XHRtZXNzYWdlKFwiPGZvbnQgY29sb3I9J3JlZCc+PGI+WW91IGNhbm5vdCBzZW5kIG1lc3NhZ2VzIHdoaWxlIGRpc2Nvbm5lY3RlZCE8L2I+PC9mb250PlwiLCBcIjxmb250IGNvbG9yPSdyZWQnPjxiPlNZU1RFTTwvYj48L2ZvbnQ+XCIpO1xyXG5cdH1cclxufSAvL3NlbmRNZXNzYWdlXHJcblxyXG5mdW5jdGlvbiBtZXNzYWdlKG1zZzogc3RyaW5nLCB1c2VyOiBzdHJpbmcsIGRhdGU6IHN0cmluZyA9IChuZXcgRGF0ZSgpKS50b0RhdGVTdHJpbmcoKSk6IHZvaWQge1xyXG5cdGxldCBwID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInBcIik7XHJcblx0cC5pbm5lckhUTUwgPSBgPGZvbnQgY29sb3I9J2dyYXknPjxzbWFsbD4ke2RhdGV9PC9zbWFsbD48L2ZvbnQ+JmVtc3A7PGI+JHt1c2VyfTo8L2I+ICR7bXNnfTxiciAvPmA7XHJcblx0XHJcblx0dGV4dC5hcmVhLmFwcGVuZENoaWxkKHApO1xyXG5cdGlmICh0ZXh0LmFyZWEuc2Nyb2xsQnkpIHtcclxuXHRcdHRleHQuYXJlYS5zY3JvbGxCeSgwLCBzY3JvbGwpO1xyXG5cdH1cclxufSAvL21lc3NhZ2VcclxuXHJcbmZ1bmN0aW9uIHNoaWZ0Y2hlY2soZXZlbnQ6IG9iamVjdCwgZG93bjogYm9vbGVhbiA9IHRydWUpOiB2b2lkIHtcclxuXHRpZiAoZXZlbnQua2V5ID09IFwiU2hpZnRcIikge1xyXG5cdFx0dGV4dC5zaGlmdCA9IGRvd247XHJcblx0fSBlbHNlIGlmIChldmVudC5rZXkgPT0gXCJBcnJvd1VwXCIgJiYgZG93bikge1xyXG5cdFx0KytoaXN0b3J5SWR4O1xyXG5cdFx0aGlzdG9yeUlkeCAlPSBoaXN0Lmxlbmd0aDtcclxuXHRcdHRleHQuc2VuZC52YWx1ZSA9IGhpc3RbaGlzdG9yeUlkeF07XHJcblx0XHRyZXR1cm47XHJcblx0fSBlbHNlIGlmIChldmVudC5rZXkgPT0gXCJBcnJvd1VwXCIpIHtcclxuXHRcdHJldHVybjtcclxuXHR9IGVsc2UgaWYgKGV2ZW50LmtleSA9PSBcIkFycm93RG93blwiICYmIGRvd24pIHtcclxuXHRcdGhpc3RvcnlJZHggPSAoaGlzdG9yeUlkeCA8IDEpID8gKGhpc3QubGVuZ3RoIC0gMSkgOiAoaGlzdG9yeUlkeCAtIDEpO1xyXG5cdFx0dGV4dC5zZW5kLnZhbHVlID0gaGlzdFtoaXN0b3J5SWR4XTtcclxuXHRcdHJldHVybjtcclxuXHR9IGVsc2UgaWYgKGV2ZW50LmtleSA9PSBcIkFycm93RG93blwiKSB7XHJcblx0XHRyZXR1cm47XHJcblx0fSBlbHNlIGlmIChldmVudC5rZXkgPT0gXCJFbnRlclwiICYmICF0ZXh0LnNoaWZ0ICYmICFkb3duKSB7XHJcblx0XHRzZW5kKCk7XHJcblx0XHRoaXN0LnVuc2hpZnQoJycpO1xyXG5cdFx0d2hpbGUgKGhpc3QubGVuZ3RoID49IG1heEhpc3RvcnkpIHtcclxuXHRcdFx0aGlzdC5wb3AoKTtcclxuXHRcdH1cclxuXHR9XHJcblx0aGlzdFswXSA9IHRleHQuc2VuZC52YWx1ZTtcclxufSAvL3NoaWZ0Y2hlY2tcclxuXHJcbmZ1bmN0aW9uIHN1Ym1pdChlPzogb2JqZWN0KTogdm9pZCB7XHJcblx0dGV4dC5zaGlmdCA9IGZhbHNlO1xyXG5cdHNoaWZ0Y2hlY2soe1xyXG5cdFx0a2V5OiBcIkVudGVyXCJcclxuXHR9LCBmYWxzZSk7XHJcbn0gLy9zdWJtaXRcclxuXHJcbmZ1bmN0aW9uIHNhbml0aXplKG1zZzogc3RyaW5nKTogc3RyaW5nIHtcclxuXHRtc2cgPSBtc2cucmVwbGFjZSgvJi9nbWksIFwiJmFtcDtcIilcclxuXHRcdC5yZXBsYWNlKC88L2dtaSwgXCImbHQ7XCIpXHJcblx0XHQucmVwbGFjZSgvPi9nbWksIFwiJmd0O1wiKVxyXG5cdFx0LnJlcGxhY2UoL1wiL2dtaSwgXCImcXVvdDtcIilcclxuXHRcdC5yZXBsYWNlKC8nL2dtaSwgXCImIzAzOTtcIik7XHJcblx0cmV0dXJuIG1zZztcclxufSAvL3Nhbml0aXplXHJcblxyXG5mdW5jdGlvbiBwYXJzZUNvb2tpZXMoY29va2llczogc3RyaW5nID0gZG9jdW1lbnQuY29va2llKTogTWFwIHtcclxuXHRyZXR1cm4gbmV3IE1hcChjb29raWVzLnNwbGl0KCc7JykubWFwKGMgPT4gYy5zcGxpdCgnPScpKSk7XHJcbn0gLy9wYXJzZUNvb2tpZXNcclxuXHJcbmZ1bmN0aW9uIHN0b3JlQ29va2llcyhtYXA6IE1hcCk6IHN0cmluZyB7XHJcblx0cmV0dXJuIGRvY3VtZW50LmNvb2tpZSA9IEFycmF5LmZyb20obWFwKS5tYXAoYSA9PiBhLmpvaW4oJz0nKSkuam9pbignOycpO1xyXG59IC8vc3RvcmVDb29raWVzXHJcblxyXG5mdW5jdGlvbiBzZXRDb29raWUoa2V5OiBzdHJpbmcsIHZhbHVlOiBzdHJpbmcpOiBzdHJpbmcge1xyXG5cdGxldCB0bXAgPSBwYXJzZUNvb2tpZXMoKTtcclxuXHR0bXAuc2V0KGtleSwgdmFsdWUpO1xyXG5cdHJldHVybiBzdG9yZUNvb2tpZXModG1wKTtcclxufSAvL3NldENvb2tpZVxyXG5cclxuZnVuY3Rpb24gZ2V0Q29va2llKGtleTogc3RyaW5nKTogc3RyaW5nIHtcclxuXHRsZXQgdG1wOiBNYXAgPSBwYXJzZUNvb2tpZXMoKTtcclxuXHRyZXR1cm4gdG1wLmdldChrZXkpO1xyXG59IC8vZ2V0Q29va2llXHJcblxyXG5mdW5jdGlvbiBwYXJzZVF1ZXJpZXMobG9jOiBzdHJpbmcgPSBsb2NhdGlvbi5ocmVmKSB7XHJcblx0bGV0IG91dCA9IGxvYy5zcGxpdCgnPycpLnBvcCgpLnJlcGxhY2UoLyMuKj8kLywgJycpLnNwbGl0KCcmJykubWFwKHEgPT4gcS5zcGxpdCgnPScpKTtcclxuXHJcblx0Zm9yIChsZXQgaSBvZiBvdXQpIHtcclxuXHRcdHdpbmRvd1tpLnNoaWZ0KCldID0gaS5wb3AoKTtcclxuXHR9XHJcbn0gLy9wYXJzZVF1ZXJpZXNcclxuXHJcbndpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwiRE9NQ29udGVudExvYWRlZFwiLCBsb2FkKTtcclxuIl19