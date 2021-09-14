(function($) {

    var Alpaca = $.alpaca;

    if (!Alpaca.Fields) {
        Alpaca.Fields = {};
    }

    Alpaca.Fields.SampleNodePickerField = Alpaca.Fields.AbstractGitanaPickerField.extend(
    {
        postRender: function(callback)
        {
            var self = this;

            self.base(function(){

                try 
                {
                    if ((self.name == "category" || self.name == "subCategory") && Alpaca.globalContext.document.__features()["f:publishable"].state === 'live')
                    {
                        self.options.readonly = true;
                    }    
                }
                catch {}

                callback();
            });
        },

        renderButtons: function(outer, columnButtons, refreshFn)
        {
            var self = this;

            try 
            {
                if ((self.name == "category" || self.name == "subCategory") && Alpaca.globalContext.document.__features()["f:publishable"].state === 'live')
                {
                    return;
                }    
            }
            catch {}

            self.base(outer, columnButtons, refreshFn);
        },

        launchModal: function(field, el, callback)
        {
            var self = this;

            if (self.options.readonly) {
                return callback();
            }

            // parentCategory field on sample:category template
            if (self.name == "parentCategory" && self.options.picker) {
                self.options.picker.query = {
					_type: "sample:category",
					parentCategory: {
						"$exists": false
					},
					_doc: {
						"$ne": self.context.document._doc
					}
				};
            }

            // category field on sample:project template
            if (self.name == "category" && self.options.picker) {
                self.options.picker.query = {
					_type: "sample:category",
                    projectType: self.top().getControlByPath('projectType').getValue() || "",
					parentCategory: {
						"$exists": false
                    }
                };
            }

            // subCategory field on sample:project template
            if (self.name == "subCategory" && self.options.picker) {
                var id = self.top().getControlByPath('category') ? self.top().getControlByPath('category').getValue() : [];
                if (id.length > 0)
                {
                    var ids = [];
                    id.forEach(element => {
                        ids.push(element.id);
                    });
                    
                    self.options.picker.query = {
                        _type: "sample:category",
                        "parentCategory.id": {
                            "$in": ids
                        }
                    };
                }
            }

            // keywords field on sample:project template
            if (self.name == "keywords" && self.options.picker) {
                self.options.picker.query = {
					_type: "sample:keyword",
                    "category.projectType": self.top().getControlByPath('projectType').getValue() || ""
                };
            }
            
            self.base(field, el, callback);
        },

        getFieldType: function()
        {
            return "sample-node-picker";
        },

        pickerConfiguration: function()
        {
            return {
                "title": "Select a Node",
                "type": "gitana-node-picker"
            };
        },

        getTitle: function() {
            return "Sample Node Picker Field";
        },

        getDescription: function() {
            return "Field for selecting nodes from Sample content model based on projectType property";
        }
    });


    Alpaca.registerFieldClass("sample-node-picker", Alpaca.Fields.SampleNodePickerField);

})(jQuery);