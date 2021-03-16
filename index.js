const toDoList = document.querySelector("#toDoList"),
	doneList = document.querySelector("#doneList"),
	toDoCount = document.querySelector("#toDoCount"),
	doneCount = document.querySelector("#doneCount");
// 拖放元素的中间变量
let drapLi = null;
console.log(2);

// 父类构造函数
function SuperToDo(todo) {
	this.id = Math.random();
	this.todo = todo;
	this.done = false;
}

// 子类构造函数
function SubToDo(toDo) {
	// 盗用构造函数继承
	SuperToDo.call(this, toDo);
}

// 原型链
SubToDo.prototype = new SuperToDo();

// 在父类构造函数的原型对象添加属性和方法，使得每个子类的实例都能使用
SuperToDo.prototype.toDoArr = null;
SuperToDo.prototype.doneArr = null;
SuperToDo.prototype.addToDoNode = function () {
	const newEle = document.createElement("li");
	newEle.setAttribute("draggable", "true");
	newEle.innerHTML = `
	    <input type="checkbox" onchange="changeDone(${this.id})">
	    <p id="${this.id}">${this.todo}</p>
	    <a href="javascript:removeToDo(${this.id});">x</a>
	`;

	// IE不兼容模板字符串，所以改成字符串拼接了
	// 好家伙有babel啊！
	// newEle.innerHTML =
	// 	"<input type='checkbox' onchange='changeDone(" +
	// 	this.id +
	// 	")'>\n<p id='" +
	// 	this.id +
	// 	"'>" +
	// 	this.todo +
	// 	"</p>\n<a href='javascript:removeToDo(" +
	// 	this.id +
	// 	");'>x</a>";

	toDoList.appendChild(newEle);
	newEle.scrollIntoView();
};

// 根据 id 查找类型
function findTypeAndIndex(id) {
	let current = types.get(false),
		Id = Number(id),
		index = current[0].findIndex((item) => item.id === Id),
		type = false;
	if (index === -1) {
		// 如果在fales找不到就在true查找一次
		current = types.get(true);
		index = current[0].findIndex((item) => item.id === Id);
		type = true;
	}

	// 如果在false找到了就返回false类型
	return { index, current, type };
}

// 添加 todo 函数
function addToDo() {
	const toDoText = document.querySelector("#toDoText").value.trim();

	// 清空input的值
	document.querySelector("#toDoText").value = "";

	if (!toDoText) {
		alert("todo不能为空");
		return;
	}
	const objToDo = new SubToDo(toDoText);
	objToDo.addToDoNode();
	objToDo.toDoArr.push(objToDo);
	toDoCount.innerHTML = objToDo.toDoArr.length;
}

// 删除 todo 函数
function removeToDo(id) {
	let { current, index } = findTypeAndIndex(id);
	if (index === -1) return console.log("找不到该id");

	current[1].removeChild(document.getElementById(id).parentNode);
	current[0].splice(index, 1);
	current[2].innerHTML = current[0].length;
}

// 更改完成标识函数
function changeDone(id) {
	let { current, index } = findTypeAndIndex(id);
	if (index === -1) return console.log("找不到该id");

	// 从DOM节点删除
	const targetNode = current[1].removeChild(
			document.getElementById(id).parentNode
		),
		// 从Arr删除
		targetArrEle = current[0].splice(index, 1)[0];
	current[2].innerHTML = current[0].length;
	// 对目标元素取反
	targetArrEle.done = !targetArrEle.done;

	// 对修改的目标元素新增到另一边
	current = types.get(targetArrEle.done);
	current[1].appendChild(targetNode);
	current[0].push(targetArrEle);
	current[2].innerHTML = current[0].length;
	if (targetArrEle.done) {
		targetNode.children[0].setAttribute("checked", targetArrEle.done);
	} else {
		targetNode.children[0].removeAttribute("checked");
	}
	targetNode.scrollIntoView();
}

// 批量清除
function clear(type) {
	const current = types.get(type);
	current[0].length = 0;
	current[1].innerHTML = "";
	current[2].innerHTML = 0;
}

// 拖放操作找目标li
function findLi(target) {
	const nodeName = target.nodeName.toLowerCase(),
		obj = {
			p: target.parentNode,
			li: target,
		};
	return obj[nodeName] || null;
}

// 拖放的开始
function drapStartHandle(e) {
	drapLi = findLi(e.target);
	if (!drapLi) return;

	if (drapLi.children[1].nodeName !== "P") return;
	const drapID = drapLi.children[1].id,
		{ type, index } = findTypeAndIndex(drapID),
		drapInfo = {
			drapHTML: drapLi.innerHTML,
			type,
			index,
		};
	if (index === -1) return console.log("找不到该id");

	e.dataTransfer.effectAllowed = "move";
	e.dataTransfer.setData("drapInfo", JSON.stringify(drapInfo));
}

// 拖放的经过
function preventDefaultHandle(e) {
	e.preventDefault();
}

// 拖放的结束
function dropHandle(e) {
	const dropLi = findLi(e.target),
		oldObj = JSON.parse(e.dataTransfer.getData("drapInfo"));

	if (dropLi.children[1].nodeName !== "P") return;

	const dropId = dropLi.children[1].id,
		{ type, index } = findTypeAndIndex(dropId);
	if (index === -1) return console.log("找不到该id");

	if (!dropLi || !drapLi || type !== oldObj.type) return;
	const currentArr = types.get(type)[0];
	[currentArr[index], currentArr[oldObj.index]] = [
		currentArr[oldObj.index],
		currentArr[index],
	];
	drapLi.innerHTML = dropLi.innerHTML;
	dropLi.innerHTML = oldObj.drapHTML;
}

// 保存用户数据到本地缓存
function saveData(key, data) {
	localStorage.setItem(key, JSON.stringify(data));
}

// 加载缓存的数据
function loadData() {
	let toDoString = "",
		doneString = "";

	const typeFalse = types.get(false),
		typeTrue = types.get(true);

	typeFalse[0].forEach((item) => {
		const itemString = `
		<li draggable="true">
			<input type="checkbox" onchange="changeDone(${item.id})">
			<p id="${item.id}">${item.todo}</p>
			<a href="javascript:removeToDo(${item.id});">x</a>
		</li>
		`;
		toDoString += itemString;
	});
	typeFalse[1].innerHTML = toDoString;
	typeFalse[2].innerHTML = typeFalse[0].length;

	typeTrue[0].forEach((item) => {
		const itemString = `
		<li draggable="true">
			<input type="checkbox" checked onchange="changeDone(${item.id})">
			<p id="${item.id}">${item.todo}</p>
			<a href="javascript:removeToDo(${item.id});">x</a>
		</li>
		`;
		doneString += itemString;
	});
	typeTrue[1].innerHTML = doneString;
	typeTrue[2].innerHTML = typeTrue[0].length;
}
// 存放两种类型 todo 和 done，简化函数的 if-else 判断
let types = new Map([]);
// 监听绑定
window.addEventListener("load", () => {
	console.log(1);
	// 获取数据并赋值给 SuperToDo 原型上的 Arr
	let myToDoArr = JSON.parse(localStorage.getItem("myToDoArr")),
		mydoneArr = JSON.parse(localStorage.getItem("myDoneArr"));

	SuperToDo.prototype.toDoArr = myToDoArr instanceof Array ? myToDoArr : [];
	SuperToDo.prototype.doneArr = myToDoArr instanceof Array ? mydoneArr : [];

	types.set(false, [SuperToDo.prototype.toDoArr, toDoList, toDoCount]);
	types.set(true, [SuperToDo.prototype.doneArr, doneList, doneCount]);

	toDoList.addEventListener("dragstart", drapStartHandle);
	toDoList.addEventListener("dragover", preventDefaultHandle);
	toDoList.addEventListener("drop", dropHandle);
	doneList.addEventListener("dragstart", drapStartHandle);
	doneList.addEventListener("dragover", preventDefaultHandle);
	doneList.addEventListener("drop", dropHandle);

	try {
		loadData();
	} catch (error) {
		console.log(err.message);
		console.log("加载数据出错！");
	}
});
window.addEventListener("unload", () => {
	saveData("myToDoArr", types.get(false)[0]);
	saveData("myDoneArr", types.get(true)[0]);

	toDoList.removeEventListener("dragstart", drapStartHandle);
	toDoList.removeEventListener("dragover", preventDefaultHandle);
	toDoList.removeEventListener("drop", dropHandle);
	doneList.removeEventListener("dragstart", drapStartHandle);
	doneList.removeEventListener("dragover", preventDefaultHandle);
	doneList.removeEventListener("drop", dropHandle);
});
window.addEventListener("keyup", (e) => {
	if (e.keyCode !== 13) return;
	if (e.target.id === "toDoText") addToDo();
	if (e.target.id === "test") test();
});

function test() {
	let num = Number(document.querySelector("#test").value.trim()),
		toDoString = "";

	console.time("for");
	// 每个test都要插入一次节点，非常耗时
	// 500: 303ms, 5000: 29549ms
	// for (let i = 0; i < num; i++) {
	// 	let testObj = new SubToDo("todo" + i);
	// 	testObj.addToDoNode();
	// 	testObj.toDoArr.push(testObj);
	// }

	// 500: 7ms, 5000: 91ms, 50000: 1157ms	主要是css渲染消耗时间长
	for (let i = 0; i < num; i++) {
		let testobj = new SubToDo("todo" + i);
		toDoString += `
			<li draggable="true">
				<input type="checkbox" onchange="changeDone(${testobj.id})">
				<p id="${testobj.id}">${testobj.todo}</p>
				<a href="javascript:removeToDo(${testobj.id});">x</a>
			</li>
		`;
		testobj.toDoArr.push(testobj);
	}
	toDoList.innerHTML += toDoString;

	console.timeEnd("for");

	toDoCount.innerHTML = types.get(false)[0].length;
	document.querySelector("#test").value = "";
}
