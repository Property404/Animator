import {PenMode, EraseMode} from "./modes.js";
import {Layer} from "./Layer.js";
const layers = [];
let current_slot=0;
let current_layer = null;
let current_keyframe = null;
let current_mode = null;
const modes =
{
	"pen":new PenMode(current_layer),
	"erase": new EraseMode(current_layer)
}


function addLayer()
{
	const layer = new Layer(current_slot);
	layers.push(layer);

	layer.action_hide_callback = function(e)
	{
		if(this.isHidden())
		{
			this.show();
		}
		else
		{
			this.hide();
		}
	}

	layer.action_new_callback = function(e)
	{
		this.addKeyframe();
	}

	layer.action_select_callback = function(e)
	{
		switchToLayer(this);
	}

	layer.action_keyframe_select_callback = function(e)
	{
		switchToKeyframe(this)
	}
}

function switchToKeyframe(keyframe)
{
	if(!keyframe)
		throw new Error("FUCK");
	if(!keyframe.mother)
	{
		throw new Error("SHIT");
	}
	switchToLayer(keyframe.mother);
	switchToTimeSlot(keyframe.slot);

	current_keyframe?.dehighlight();
	keyframe.highlight();

	current_keyframe = keyframe;
}

function switchToLayer(layer)
{

	current_layer?.dehighlight();
	current_mode?.deactivate();

	current_layer = layer;
	for(const mode in modes)
	{
		modes[mode].active_layer = layer;
	}
	
	current_mode?.activate();
	current_layer.highlight();
}

function switchToMode(mode_name)
{
	for(const mode in modes)
	{
		modes[mode].deactivate();
	}
	current_mode = modes[mode_name];
	current_mode.activate();
}

function switchToTimeSlot(s)
{
	current_slot = s
	for(const layer of layers)
	{
		layer.switchToTimeSlot(s);
	}
}

document.onkeydown = e=>
{
	if(e.key === "Enter")
	{
		let length = 0;
		for(const layer of layers)
			length = length > layer.length?length:layer.length;
		console.log(length);
		current_slot++;
		current_slot%=length;
		switchToTimeSlot(current_slot);
	}

	if(e.key === "e")
	{
		switchToMode("erase");
	}
	if(e.key === "p")
	{
		switchToMode("pen");
	}
}

document.querySelector("#actionbutton-new-layer").
	onclick = e=>
{
	addLayer();
}


addLayer();
switchToLayer(layers[0]);
switchToMode("pen");
