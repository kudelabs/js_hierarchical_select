/**
 * author:  Yang Ou, Shaokun Wu
 * company: Kude Labs Software Development Limited Company
 * license: This source code is purely for demonstration purposes and is not meant for production use
 */

var HierarchicalSelect = Class.create({

	initialize: function(container, all_opts, options){
		this.container = container;
		this.all_opts = all_opts;
		this.options = Object.extend({"selecteds": []}, options);

		// if there is a default value, we create all the corresponding select elements with default selecteds
		// or we only create one for the upper options in the hierarchy.
		var defaultOption = this.options.defaultOption
		if(defaultOption!=undefined){
			
			// we generate all the options to be selected to reach the default value.
			this.selecteds = new Array();
			this.generateSelecteds(all_opts, defaultOption);
			this.selecteds = this.selecteds.reverse();
			
			var selecteds = this.selecteds;
			this.insertSelect(this.all_opts, {"selected": selecteds.first()});

			// here we try to insert all the selects needed
			var opts = this.all_opts;
			for(i=1; i<selecteds.length; i++) {
				var selected = selecteds[i];

				this.insertSelect(opts[selecteds[i-1]], {"selected": selected, "header": '<' + selecteds[i-1] + '>'});
				opts = opts[selecteds[i-1]];
			}

			// if the last selected option has children, we insert the next select element.
			if(Object.keys(opts[selecteds.last()]) != undefined) this.insertSelect(opts[selecteds.last()], {"header": '<' + selecteds.last() + '>'});

		} else {
			this.insertSelect(this.all_opts);			
		}

	},
	
	// if there is a default value when creating hierarchical select, we will need this function to retrieve the option path to the default value.
	generateSelecteds: function(trees, targetNode){
		var node, nodes = Object.keys(trees);
		for(var i=0; i<nodes.length; i++){
			node = nodes[i];
			if(node == targetNode || (Object.keys(trees[node]).size() !=0 && this.generateSelecteds(trees[node], targetNode))){
				this.selecteds.push(node);
				return true;
			}
		}
		return false;
	},

	// triggered when a select list is changed
	selectChanged: function(e){
		var sel = Event.element(e);
		var container = this.container;

		// remove all the following select elements since they are not with effect any longer.
		var children = sel.nextSiblings();
		children.each(function(child) {container.removeChild(child)});

		// create a child select for the children of the selected option.
		// the insertSelect function will deternmines whether there are children options.
		var opts = sel.opts[sel.value];
		this.insertSelect(opts, {"header": '<' + sel.value + '>', "effect_on": true});

		if(this.options.afterSelect != undefined) {
			this.options.afterSelect(sel); //.evalScripts();
		}
	},

	// insertSelect only insert the select with options; if options.selected, then select that option
	insertSelect: function(opts, options){

		// if there's no option, don't insert a select.
		opt_keys = Object.keys(opts);
		if(opt_keys.length == 0) return;

		options = Object.extend(this.options, options);
		var sel = $(document.createElement("select"));
		sel.id = options.id;
		sel.opts = opts;

		// create the blank option in select field
		var option = document.createElement("option");
		option.text = option.innerText = options.header;   // .innerText if for IE
		// option.value = options.header;
		sel.insert(option);

		// create available options
		opt_keys.each(function(txt) {
			var option = document.createElement("option");
			option.value = option.text = option.innerText = txt;
			sel.insert(option);

			if(options.selected && options.selected != undefined && option.value == options.selected) option.selected = "selected";
		});

		sel.onchange = this.selectChanged.bindAsEventListener(this);		

		this.container.appendChild(sel);

		if (!options.effect_on) return;

		sel.setStyle({display: "none"});
		Effect.Appear(sel, {duration: 0.5});
	}
});