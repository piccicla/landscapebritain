Ext.define('BSG.view.QueryButton',{
	extend:'Ext.button.Button',
	alias:'widget.querybutton',
	//iconCls: 'saveQuery',
	text: '<b>QUERY</b>',
	border: true,
	/*style: {
		border: "2 2 2 2",
		padding:1,
		borderColor: '#ff0000 #ff0000 #ff0000 #ff0000',
		borderStyle: "solid"
	},*/
	style:"border-color: #ff0000;border-style: solid",
	tooltip: 'query database'
});