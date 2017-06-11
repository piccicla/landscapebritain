Ext.define('BSG.view.QueryDetailsButtonGroup',{
	extend:'Ext.container.ButtonGroup',
	alias:'widget.querydetailsbuttongroup',	
	initComponent:function(){
		this.columns= 3;
		this.items= [{xtype:'loadquery'},{xtype:'savequery'},{xtype:'deletequery'}];
		this.callParent(arguments);	
	}	
});