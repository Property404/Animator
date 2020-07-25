import {Layer} from "./Layer.js";
const layer = new Layer(0);
let slot = 0;
layer.switchToTimeSlot(slot);

const context = layer.getContext();

document.onmousemove = e=>
{
	context.fillRect(e.clientX-5, e.clientY-5,10,10);
}

document.onkeydown = e=>
{
	if(e.key === "Enter")
	{
		slot++;
		slot%=layer._keyframes.length;
		layer.switchToTimeSlot(slot);
	}
}
