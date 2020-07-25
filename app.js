const canvas = document.querySelector("canvas");
const context = canvas.getContext("2d");

document.onmousemove = e=>
{
	context.fillRect(e.clientX-5, e.clientY-5,10,10);
}

