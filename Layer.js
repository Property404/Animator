import {randomId, cloneFromTemplate} from "./utils.js";

class Keyframe
{
	_element = null;
	_record = []

	constructor(mother, length=1)
	{
		this._length = length;
		this.mother = mother;
		this._element = cloneFromTemplate(
			"#keyframe-template",
			`#${mother.keyframe_set.id} .keyframes`
		);

		this._element.onclick = e=>{
			this.mother.
				action_keyframe_select_callback.
					call(this);
		}
	}

	get slot()
	{
		return this.mother.getTimeSlotOfKeyframe(this);
	}

	get length()
	{
		return this._length;
	}

	load(canvas)
	{
		const sheet = this.mother.sheet;
		const ctx = this.mother.getContext();
		const record = this._record.pop();
		ctx.clearRect(0,0,sheet.width,sheet.height);

		if(!record)return;
		ctx.putImageData(record, 0,0);

	}

	save()
	{
		const sheet = this.mother.sheet;
		const ctx = this.mother.getContext();
		this._record.push(ctx.getImageData(0, 0, sheet.width, sheet.height));
	}

	highlight()
	{
		this._element.classList.add("active");
	}

	dehighlight()
	{
		this._element.classList.remove("active");
	}

	destroy()
	{
		this._element.remove();
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
				e=>this.action_hide_callback.call(this);
		this.keyframe_set.
			querySelector(".keyframe-set-action-new").onclick=
				e=>this.action_new_callback.call(this);
		this.keyframe_set.
			querySelector(".keyframe-set-label").onclick=
				e=>this.action_select_callback.call(this);
		this.keyframe_set.id = randomId();

		this.addKeyframe();

		this.switchToTimeSlot(time_slot);
	}

	// Get total length of keyframes
	get length()
	{
		let len=0;
		for(let i=0; i<this._keyframes.length;i++)
		{
			len += this._keyframes[i].length;
		}
		return len;
	}

	getContext()
	{
		if(!this._context)
			this._context = this.sheet.getContext('2d');
		return this._context;
	}

	getCurrentKeyframe()
	{
		return this.getKeyframeAt(this._current_time_slot);
	}

	getTimeSlotOfKeyframe(keyframe)
	{
		let t=0;
		for(let i=0; i<this._keyframes.length;i++)
		{
			if(keyframe === this._keyframes[i])
			{
				return t;
			}
			t += this._keyframes[i].length;
		}
		throw new Error("Couldn't find keyframe");
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
		const kf = new Keyframe(this);
		this._keyframes.push(kf);
		return kf;
	}

	removeKeyframe(kf)
	{
		// Save
		this.getKeyframeAt(this._current_time_slot)?.save();

		kf.destroy();
		const index = this._keyframes.indexOf(kf);
		console.log(index);
		this._keyframes.splice(index,1);
		console.log(this._keyframes);

		// Restore
		this.getContext().clearRect(0,0,this.sheet.width, this.sheet.height);
		this.getKeyframeAt(this._current_time_slot)?.load();
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

	highlight()
	{
		this.keyframe_set.classList.add("active");
	}

	dehighlight()
	{
		this.keyframe_set.classList.remove("active");
	}
}
