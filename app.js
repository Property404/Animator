import {PenMode, EraseMode} from "./modes.js";
import {Layer} from "./Layer.js";
const layer = new Layer(0);
const context = layer.getContext();

let slot=0;

const modes =
{
	"pen":new PenMode(layer),
	"erase": new EraseMode(layer)
}
function switchToMode(mode_name)
{
	for(const mode in modes)
	{
		modes[mode].deactivate();
	}
	modes[mode_name].activate();
}

document.onkeydown = e=>
{
	if(e.key === "Enter")
	{
		slot++;
		slot%=layer._keyframes.length;
		layer.switchToTimeSlot(slot);
	}

	if(e.key === "e")
	{
		console.log("ERASE");
		switchToMode("erase");
	}
	if(e.key === "p")
	{
		console.log("PEN");
		switchToMode("pen");
	}
}

switchToMode("pen");
