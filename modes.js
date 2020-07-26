/*
 * This file contains all the drawing logic
 *
 * Each block of drawing logic is separated out into a
 * Mode child class*/
import {absoluteToCanvas} from "./utils.js";

const sheet_view = document.getElementById("sheet-view");

class Mode
{
	constructor(active_layer)
	{
		this.active_layer = active_layer;
	}

	deactivate()
	{
		sheet_view.onmouseup = null;
		sheet_view.onmousedown = null;
		sheet_view.onclick = null;
		sheet_view.onmousemove = null;
		this.context = null;
	}

	activate()
	{
		this.context = this.active_layer.getContext();
	}
}

// Draw lines, like a pen or pencil
// Analog to the pen tool KolourPaint
export class PenMode extends Mode
{
	width = 4;
	constructor(active_layer)
	{
		super(active_layer);
	}
	
	activate()
	{
		Mode.prototype.activate.call(this);
		sheet_view.onmousedown = this._startDrawing.bind(this);
	}

	_startDrawing(e)
	{
		console.log("START");
		sheet_view.onmouseup = this._stopDrawing.bind(this);
		sheet_view.onmousemove = this._draw.bind(this);
		this._oldx = null;
		this._oldy = null;
	}

	_stopDrawing(e)
	{
		sheet_view.onmouseup = null
		sheet_view.onmousemove = null
	}

	_draw(e)
	{
		const [newx, newy] = absoluteToCanvas(e.clientX,e.clientY);
		if(this._oldx && this._oldy)
		{
			this.context.beginPath();
			this.context.lineWidth=4;
			this.context.moveTo(this._oldx, this._oldy);
			this.context.lineTo(newx, newy);
			this.context.stroke();
		}
		this._oldx = newx;
		this._oldy = newy;
	}
}

// Erase with a block
export class EraseMode extends Mode
{
	size = 20;
	constructor(active_layer)
	{
		super(active_layer);
	}
	
	activate()
	{
		Mode.prototype.activate.call(this);
		sheet_view.onmousedown = this._startErasing.bind(this);
	}

	_startErasing(e)
	{
		sheet_view.onmouseup = this._stopErasing.bind(this);
		sheet_view.onmousemove = this._erase.bind(this);
		this._oldx = null;
		this._oldy = null;
	}

	_stopErasing(e)
	{
		sheet_view.onmouseup = null
		sheet_view.onmousemove = null
	}

	_erase(e)
	{
		const [newx, newy] = absoluteToCanvas(e.clientX,e.clientY);
		if(this._oldx && this._oldy)
		{
			this.context.clearRect
				(newx-this.size/2,newy-this.size/2,this.size,this.size)
		}
		this._oldx = newx;
		this._oldy = newy;
	}
}
