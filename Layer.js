import {randomId, cloneFromTemplate} from "./utils.js";

class Keyframe
{
	_state = null;
	_element = null;

	constructor(mother, length=1)
	{
		this._length = length;
		this._mother = mother;
		this._element = cloneFromTemplate(
			"#keyframe-template",
			`#${mother.keyframe_set.id} .keyframes`
		);
	}

	get length()
	{
		return this._length;
	}

	static cloneCanvas(old_canvas, new_canvas)
	{
		const ctx = new_canvas.getContext('2d');
		ctx.clearRect(0,0,new_canvas.width,new_canvas.height);
		ctx.drawImage(old_canvas, 0, 0);
	}

	load(canvas)
	{
		this._mother.getContext().clearRect(0,0,
			this._mother.sheet.width,
			this._mother.sheet.height);

		if(this._state)
		{
			Keyframe.cloneCanvas(this._state, this._mother.sheet);
		}
	}

	save()
	{
		if(!this._state)
		{
			this._state = cloneFromTemplate("#keyframe-state-template",
					"#keyframe-states");
		}
		Keyframe.cloneCanvas(this._mother.sheet, this._state);
	}
}

export class Layer
{
	static next_layer_id = 1;
	_current_time_slot = null;
	_keyframes = [];

	constructor(time_slot)
	{
		this.name = "Layer"+Layer.next_layer_id++;
		this.id = randomId();

		this.sheet =
			cloneFromTemplate("#sheet-template", "#sheet-view");
		this.keyframe_set = cloneFromTemplate("#keyframe-set-template",
				"#keyframe-set-view");
		this.keyframe_set.
			querySelector(".keyframe-set-label").textContent = this.name;
		this.keyframe_set.
			querySelector(".keyframe-set-action-hide").onclick=
				this._action_hide_callback.bind(this);
		this.keyframe_set.
			querySelector(".keyframe-set-action-new").onclick=
				this._action_new_callback.bind(this);
		this.keyframe_set.id = randomId();

		this.addKeyframe();

		this.switchToTimeSlot(time_slot);
	}

	_action_hide_callback(e)
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

	_action_new_callback(e)
	{
		this.addKeyframe();
	}

	getContext()
	{
		if(!this._context)
			this._context = this.sheet.getContext('2d');
		return this._context;
	}

	getKeyframeAt(time_slot)
	{
		if(
			time_slot === null||
			time_slot === undefined
		)return null;

		let t=0;
		for(let i=0; i<this._keyframes.length;i++)
		{
			t += this._keyframes[i].length;
			if(t > time_slot)
			{
				return this._keyframes[i];
			}
		}
		return null;
	}

	switchToTimeSlot(time_slot)
	{
		if(time_slot === null||time_slot === undefined)
			throw new Error("Improper arguments");

		const old_keyframe =
			this.getKeyframeAt(this._current_time_slot);
		const new_keyframe = 
			this.getKeyframeAt(time_slot);

		old_keyframe?.save();
		new_keyframe?.load()
		this._current_time_slot = time_slot;
	}

	addKeyframe()
	{
		this._keyframes.push(new Keyframe(this));
	}

	isHidden()
	{
		return !!this.sheet.hidden
	}

	hide()
	{
		this.sheet.hidden = true;
	}

	show()
	{
		this.sheet.removeAttribute("hidden");
	}
}
