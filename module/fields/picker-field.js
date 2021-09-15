(function($) {

    var Alpaca = $.alpaca;

    if (!Alpaca.Fields) {
        Alpaca.Fields = {};
    }

    Alpaca.Fields.SampleNodePickerField = Alpaca.Fields.AbstractGitanaPickerField.extend(
    {
        getFieldType: function()
        {
            return "sample-node-picker";
        },

        pickerConfiguration: function()
        {
            return {
                "title": "Select a Node",
                "type": "sample-node-picker"
            };
        },

        getTitle: function() {
            return "Sample Node Picker Field";
        },

        getDescription: function() {
            return "Sample Custom Node Picker Field";
        }
    });


    Alpaca.registerFieldClass("sample-node-picker", Alpaca.Fields.SampleNodePickerField);

})(jQuery);