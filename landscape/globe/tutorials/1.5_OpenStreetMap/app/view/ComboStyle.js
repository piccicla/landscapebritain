Ext.define('BSG.view.ComboStyle',{
	extend:'Ext.form.field.ComboBox',
	alias:'widget.combostyle',
	//fieldLabel: 'Style',
    store: {
		fields: ['abbr', 'name'],
		data : [
			{"abbr":"index.html", "name":"Light blue"},
			{"abbr":"index_gray.html", "name":"Light grey"},
			{"abbr":"index_access.html", "name":"Accessibility"}
		]},
	value:"Light blue",
    queryMode: 'local',
    displayField: 'name',
    valueField: 'abbr',
	editable: false,
	tooltip: 'change layout',
	width:100
});