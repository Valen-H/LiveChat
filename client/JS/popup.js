const expand = 60;

function popup() {
	let blocc = document.createElement("div"),
		main = document.createElement("div");

	blocc.classList.add("popup");
	main.classList.add("expandable");

	main.style.width = blocc.style.height = "0px";
	main.style.top = (window.innerHeight / 2) + "px";
	main.style.left = (window.innerWidth / 2) + "px";

	blocc.appendChild(main);
	document.body.appendChild(blocc);

	popupanimate({
		targ: main,
		wdt: 0,
		hgt: 0,
		top: main.offsetTop,
		left: main.offsetLeft,
		expandw: expand,
		expandh: expand,
		reps: expand / 3  //  1/3 of screen
	});

	return main;
} //popup

function popupanimate(popup) {
	popup.targ.style.width = (popup.wdt += window.innerWidth / popup.expandw) + "px";
	popup.targ.style.height = (popup.hgt += window.innerHeight / popup.expandh) + "px";
	popup.targ.style.top = ((window.innerHeight - popup.hgt) / 2) + "px";
	popup.targ.style.left = ((window.innerWidth - popup.wdt) / 2) + "px";
	popup.reps--;
	window.requestAnimationFrame(() => popup.reps > 0 && popupanimate(popup));
} //popupanimate

function popuphide(popup) {
	popup.targ.style.width = (popup.wdt -= window.innerWidth / popup.expandw) + "px";
	popup.targ.style.height = (popup.hgt -= window.innerHeight / popup.expandh) + "px";
	popup.targ.style.top = ((window.innerHeight - popup.hgt) / 2) + "px";
	popup.targ.style.left = ((window.innerWidth - popup.wdt) / 2) + "px";
	popup.reps--;
	window.requestAnimationFrame(() => {
		if (popup.reps > 0) {
			popuphide(popup);
		} else {
			popup.targ.parentNode.remove();
		}
	});
} //popuphide

function joinpop() {
	let main = popup(),
		cancel = document.createElement("button"),
		submit = document.createElement("button"),
		room = document.createElement("input"),
		pass = document.createElement("input"),
		title = document.createElement("p"),
		visible = document.createElement("input"),
		vislabel = document.createElement("label");

	title.innerHTML = "<h3>Join Room:</h3><br />";
	cancel.innerHTML = "CANCEL";
	submit.innerHTML = "JOIN";
	room.placeholder = "Room name...";
	room.setAttribute("autofocus", true);
	pass.placeholder = "Room pasword...";
	pass.type = "password";
	room.type = "text";
	room.pattern = "^[a-zA-Z0-9_\\-();' ]+$";
	visible.id = "roomvisible";
	visible.type = "checkbox";
	vislabel.for = "roomvisible";
	vislabel.innerHTML = "Visible?<br />";
	cancel.onclick = function click() {
		popuphide({
			targ: main,
			wdt: main.offsetWidth,
			hgt: main.offsetHeight,
			top: main.offsetTop,
			left: main.offsetLeft,
			expandw: expand / 2,
			expandh: expand / 2,
			reps: expand / 3
		});
	};
	submit.onclick = function click() {
		switchCur(room.value, pass.value, visible.checked);
		popuphide({
			targ: main,
			wdt: main.offsetWidth,
			hgt: main.offsetHeight,
			top: main.offsetTop,
			left: main.offsetLeft,
			expandw: expand / 2,
			expandh: expand / 2,
			reps: expand / 3
		});
	};
	
	main.appendChild(title);
	main.appendChild(room);
	main.appendChild(pass);
	main.appendChild(visible);
	main.appendChild(vislabel);
	main.appendChild(document.createElement("br"));
	main.appendChild(submit);
	main.appendChild(cancel);
	main.appendChild(document.createElement("br"));
} //joinpop
