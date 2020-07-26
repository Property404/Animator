import {absoluteToCanvas} from "./utils.js";
import {Layer} from "./Layer.js";
const layer = new Layer(0);
const context = layer.getContext();

let slot=0;
let oldx=null;
let oldy= null


document.onmouseup = e=>{
	oldx=null;
	oldy=null;
	document.onmousemove = null;
}
document.onmousedown = e=>
{
	document.onmousemove = e=>
	{
		const [newx, newy] = absoluteToCanvas(e.clientX,e.clientY);
		if(oldx && oldy)
		{
			context.beginPath();
			context.moveTo(oldx, oldy);
			context.lineTo(newx, newy);
			context.stroke();
		}
		oldx = newx;
		oldy = newy;
	}
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
