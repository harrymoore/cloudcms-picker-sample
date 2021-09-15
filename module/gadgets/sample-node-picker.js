var OneTeam = require("oneteam");

var picker = Ratchet.Gadgets.AbstractGitanaPicker.extend({

    ROW_TEMPLATE_KEY: "gitana-node-picker",

    /**
     * @override
     */
    configureDefault: function()
    {
        // call this first
        this.base();

        // update the config
        var c = {
            "columns": [{
                "title": "Title",
                "key": "titleDescription",
                "sort": true
            }, {
                "title": "Description",
                "key": "description",
                "sort": true
            }]
        };

        if (typeof(OneTeam) !== "undefined")
        {
            c.icon = true;
        }

        this.config(c);
    },

    prepareModel: function(el, model, callback)
    {
        var self = this;

        this.base(el, model, function() {
            callback();
        });
    },

    doGitanaQuery: function(context, model, searchTerm, query, pagination, callback)
    {
        var self = this;

        var b = self.branch();

        var o = {
            query: {}
        };

        if (model.query)
        {
            o.query = JSON.parse(JSON.stringify(model.query));
        }

        if (query)
        {
            Ratchet.copyInto(o.query, query);
        }

        if (searchTerm) {
            if (model.filterMode === "fullText")
            {
                o.search = searchTerm;
            }
            else
            {
                o.search = OneTeam.buildSearchBlock(searchTerm, ["description"]);
            }
        }

        var typeQNames = [];
        if (model.typeQNames)
        {
            for (var i = 0; i < model.typeQNames.length; i++)
            {
                if (!typeQNames.contains(model.typeQNames[i]))
                {
                    typeQNames.push(model.typeQNames[i]);
                }
            }
        }
        else if (model.typeQName)
        {
            typeQNames.push(model.typeQName);
        }

        var completionFn = function()
        {
            if (typeQNames.length > 0)
            {
                o.query._type = {
                    "$in": typeQNames
                };
            }

            if (!pagination) {
                pagination = {};
            }

            pagination.paths = true;

            Chain(b).findNodes(o, pagination).then(function() {
                callback(this);
            });
        };

        // if includeChildTypes, then we go back to the server for every definition QName in typeQNames
        // and load children type QNames.  We include those in our typeQNames.
        if (model.includeChildTypes)
        {
            OneTeam.projectDefinitions(self, function(definitionDescriptors) {

                var loadedTypeQNames = [];

                var fns = [];
                for (var i = 0; i < typeQNames.length; i++)
                {
                    var definition = null;
                    var descriptor = definitionDescriptors[typeQNames[i]];
                    if (descriptor)
                    {
                        definition = descriptor.definition;
                    }
                    if (definition)
                    {
                        var fn = function (definition, loadedTypeNames) {
                            return function (done) {

                                definition.listChildDefinitions({
                                    "limit": -1,
                                    "ignoreParent": true
                                }).each(function () {
                                    loadedTypeNames.push(this.getQName());
                                }).then(function () {
                                    done();
                                });

                            };
                        }(definition, loadedTypeQNames);
                        fns.push(fn);
                    }
                }
                Ratchet.parallel(fns, function () {

                    for (var i = 0; i < loadedTypeQNames.length; i++)
                    {
                        if (typeQNames.indexOf(loadedTypeQNames[i]) === -1)
                        {
                            typeQNames.push(loadedTypeQNames[i]);
                        }
                    }

                    completionFn();
                });
            });

            return;
        }

        completionFn();
    },

    iconUri: function(row, model, context)
    {
        var iconUri = null;

        if (typeof(OneTeam) !== "undefined")
        {
            iconUri = OneTeam.iconUriForNode(row, {
                "size": 32,
                "name": "picker"
            });
        }

        return iconUri;
    },

    columnValue: function(row, item, model, context)
    {
        var value = this.base(row, item, model, context);

        if (item.key == "_type")
        {
            value = row.getTypeQName();
        }
        else if (item.key === "_qname")
        {
            value = row.getQName();
        }
        else if (item.key === "description")
        {
            value = row.description;
        }
        else if (item.key === "path")
        {
            value = "";
            if (row._paths)
            {
                var array = [];
                for (var k in row._paths) {
                    // Do not include "r:root" path to avoid duplicates
                    if (k !== "r:root")
                    {
                        array.push(row._paths[k]);
                    }
                }
                value = array.join("<br/>");
            }
        }

        return value;
    }

});

Ratchet.GadgetRegistry.register("sample-node-picker", picker);

