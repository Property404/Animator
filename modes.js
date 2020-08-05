/*
 * This file contains all the drawing logic
 *
 * Each block of drawing logic is separated out into a
 * Mode child class*/
import {absoluteToCanvas} from "./utils.js";

const sheet_view = document.getElementById("sheet-view");
const not_a_sheet = document.getElementById("not-a-sheet");

class Color
{
	constructor(r,g,b,a)
	{
		const list = [r,g,b,a];
		for(let i=0;i<4;i++)
		{
			if(
				list[i] === null ||
				list[i] === undefined ||
				list[i] > 255 || 
				list[i] < 0
			)
				throw new Error("Invalid constructor arguments for Color");
		}

		this.red = r;
		this.green = g;
		this.blue = b;
		this.alpha = a;
	}

	asCSS(){
		return `rgba(${this.red}, ${this.green}, ${this.blue}, ${this.alpha})`;
	}

	equals(color)
	{
		if(
			color.red === this.red &&
			color.green === this.green &&
			color.blue === this.blue &&
			color.alpha === this.alpha)
		{
			return true;
		}
		return false;
	}
}

class Mode
{
	constructor(active_layer)
	{
		this.active_layer = active_layer;
		this.fill_color = new Color(255,0,0,255);
		this.stroke_color = new Color(0,0,0,255);
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

	storeRecord()
	{
		this.active_layer.getCurrentKeyframe().save();
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
		this.storeRecord();
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

	_getColorAt(color_layer, x,y)
	{
		const index = (y*not_a_sheet.width + x)*4;
		if(!Number.isInteger(index))
		{
			throw("Fuck all");
		}

		return new Color(
			color_layer.data[index+0],
			color_layer.data[index+1],
			color_layer.data[index+2],
			color_layer.data[index+3]
		);
	}

	_fill(e)
	{
		let [start_x, start_y] = absoluteToCanvas(e.clientX,e.clientY);
		start_x = Math.round(start_x);
		start_y = Math.round(start_y);

		const color_layer = this.context.getImageData(0,0,not_a_sheet.width,not_a_sheet.height);
		const old_color = this._getColorAt(color_layer, start_x,start_y)

		// Sanity check
		if(old_color.equals(this.fill_color))
		{
			return;
		}

		this.storeRecord();

		const canvas_width = not_a_sheet.width;
		const canvas_height = not_a_sheet.height;
		
		const stack = [[start_x, start_y]];

		while(stack.length)
		{
			const new_position = stack.pop();
			let x = new_position[0];
			let y = new_position[1];

			let pixel_index = (y*canvas_width + x) *4;
			while(y-- >= 0 && this.matchStartColor(color_layer, pixel_index, old_color))
			{
				pixel_index -= canvas_width * 4;
			}
			pixel_index += canvas_width * 4;
			y++;

			let reach_left = false;
			let reach_right = false;

			while(y++ < canvas_height - 1 && this.matchStartColor(color_layer, pixel_index, old_color))
			{
				this.colorPixel(color_layer, pixel_index);
				
				if(x>0)
				{
					if(this.matchStartColor(color_layer, pixel_index - 4, old_color))
					{
						if(!reach_left)
						{
							stack.push([x-1,y]);
							reach_left = true;
						}
					}
					else if(reach_left)
					{
						reach_left = false;
					}
				}

				if(x< canvas_width - 1)
				{
					if(this.matchStartColor(color_layer, pixel_index + 4, old_color))
					{
						if(!reach_right)
						{
							stack.push([x+1,y]);
							reach_right = true;
						}
					}
					else if(reach_right)
					{
						reach_right = false;
					}
				}

				pixel_index += canvas_width * 4;
			}
		}

		this.context.putImageData(color_layer, 0, 0);
	}

	matchStartColor(color_layer, pixel_index, old_color)
	{
		const red = color_layer.data[pixel_index];
		const green = color_layer.data[pixel_index+1];
		const blue = color_layer.data[pixel_index+2];
		const alpha = color_layer.data[pixel_index+3];
		if(red == old_color.red &&
			green == old_color.green &&
			blue == old_color.blue &&
			alpha == old_color.alpha
		)
		{
			return true;
		}
		return false;
	}

	colorPixel(color_layer, pixel_index)
	{
		color_layer.data[pixel_index] = this.fill_color.red;
		color_layer.data[pixel_index+1] = this.fill_color.green;
		color_layer.data[pixel_index+2] = this.fill_color.blue;
		color_layer.data[pixel_index+3] = this.fill_color.alpha;
	}


}
