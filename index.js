const toDoList = document.querySelector("#toDoList"),
	doneList = document.querySelector("#doneList"),
	toDoCount = document.querySelector("#toDoCount"),
	doneCount = document.querySelector("#doneCount"),
	toDoContainer = document.querySelector(".toDoContainer"),
	doneContainer = document.querySelector(".doneContainer");

let viewHeight =
	document.documentElement.clientHeight > document.body.scrollHeight
		? document.documentElement.clientHeight
		: document.body.scrollHeight;

const itemHeight = 50;
let pageSize = Math.floor((viewHeight - 120) / itemHeight);

toDoContainer.style.height = pageSize * itemHeight + "px";
doneContainer.style.height = pageSize * itemHeight + "px";

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
	toDoList.appendChild(newEle);
};

let types = new Map([]);

function findTypeAndIndex(id) {
	let current = types.get(false),
		Index = current[0].findIndex((item) => item.id === id);
	if (Index === -1) {
		// 如果在fales找不到就在true查找一次
		current = types.get(true);
		Index = current[0].findIndex((item) => item.id === id);
	}
	// 如果在false找到了就返回false类型
	return {
		index: Index,
		current: current,
	};
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
	// toDoArr.push(objToDo);
	toDoCount.innerHTML = objToDo.toDoArr.length;
	// toDoCount.innerHTML = toDoArr.length;
}

// 删除 todo 函数
function removeToDo(id) {
	let { current, index } = findTypeAndIndex(id);

	current[1].removeChild(document.getElementById(id).parentNode);
	current[0].splice(index, 1);
	current[2].innerHTML = current[0].length;
}

// 更改完成标识函数
function changeDone(id) {
	let { current, index } = findTypeAndIndex(id);

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
}

// 批量清除
function clear(type) {
	const current = types.get(type);
	current[0].length = 0;
	current[1].innerHTML = "";
	current[2].innerHTML = 0;
}

// 保存用户数据到本地缓存
function saveData(key, data) {
	localStorage.setItem(key, JSON.stringify(data));
}

function fun() {
	let toDoStart = 0,
		doneStart = 0,
		toDoTotal = toDoArr.length,
		doneTotal = doneArr.length;

	let pageSize = Math.floor((viewHeight - 120) / itemHeight);

	console.log(viewHeight, pageSize);

	toDoContainer.style.height = pageSize * itemHeight + "px";
	doneContainer.style.height = pageSize * itemHeight + "px";

	// if (toDoTotal < pageSize) sum = toDoTotal;
	// for (let i = 0; i < sum; i++) {
	// 	let newEle = document.createElement("li");
	// 	newEle.setAttribute("draggable", "true");
	// 	toDoList.appendChild(newEle);
	// }
}

// 监听绑定
window.addEventListener("load", () => {
	SuperToDo.prototype.toDoArr =
		JSON.parse(localStorage.getItem("myToDoArr")) || [];
	SuperToDo.prototype.doneArr =
		JSON.parse(localStorage.getItem("myDoneArr")) || [];

	types.set(false, [SuperToDo.prototype.toDoArr, toDoList, toDoCount]);
	types.set(true, [SuperToDo.prototype.doneArr, doneList, doneCount]);
});
window.addEventListener("unload", () => {
	saveData("myToDoArr", types.get(false)[0]);
	saveData("myDoneArr", types.get(true)[0]);
});
window.addEventListener("keyup", (e) => {
	if (e.keyCode !== 13) {
		return;
	}
	if (e.target.id === "toDoText") addToDo();
	// if (e.target.id === "test") test();
});
