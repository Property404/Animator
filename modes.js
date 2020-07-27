/*
 * This file contains all the drawing logic
 *
 * Each block of drawing logic is separated out into a
 * Mode child class*/
import {absoluteToCanvas} from "./utils.js";

const sheet_view = document.getElementById("sheet-view");
const not_a_sheet = document.getElementById("not-a-sheet");

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

// Erase with a block
export class FillMode extends Mode
{
	constructor(active_layer)
	{
		super(active_layer);
	}
	
	activate()
	{
		Mode.prototype.activate.call(this);
		sheet_view.onclick = this._fill.bind(this);
	}

	_getColorAt(x,y)
	{
		const imgdata = this.context.getImageData(x,y,1,1).data;
		const color = (imgdata[0]<<24)+(imgdata[1]<<16)+(imgdata[2]<<8)+(imgdata[3]);
		return color;
	}

	_fill(e)
	{
		const [x, y] = absoluteToCanvas(e.clientX,e.clientY);
		const old_color = this._getColorAt(x,y)
		console.log("BEGIN");
		this._fillr(x,y, old_color);
	}

	async sleep(ms) {
	  return new Promise(resolve => setTimeout(resolve, ms));
	}

	_fillr(x,y, old_color)
	{
		const thiscolor = this._getColorAt(x,y);
		if(thiscolor != old_color)
			return;

		const queue = [];
		queue.push([x,y]);

		let c=0;
		while(queue.length != 0)
		{
			const node = queue.shift();
			c++;
			let w = node[0];
			let e = node[0];
			while(w> 0 && this._getColorAt(w, node[1]) === old_color)
				w--;
			while(e< not_a_sheet.width-1 && this._getColorAt(e,node[1]) === old_color)
			{
				e++;
			}

			if(node[1]>0 && node[1]<not_a_sheet.height-1)
			{
				let last_north_is_old=false;
				let last_south_is_old=false;
				for(let i=w+1;i<e;i++)
				{
					let north_is_old = 
						this._getColorAt(i, node[1]-1) == old_color;
					let south_is_old =
						this._getColorAt(i, node[1]+1) == old_color;
					if(north_is_old && !last_north_is_old)
						queue.push([i, node[1]-1]);
					if(south_is_old && !last_south_is_old)
						queue.push([i, node[1]+1]);
					last_north_is_old = north_is_old;
					last_south_is_old = south_is_old;
				}
			}
			this.context.fillRect(w,node[1],e-w,1);
		}
		console.log(c);
		console.log("END");
	}
}
