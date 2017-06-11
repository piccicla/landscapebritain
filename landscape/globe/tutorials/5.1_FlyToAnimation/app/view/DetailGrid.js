Ext.define('BSG.view.DetailGrid',{
	extend:'Ext.panel.Panel',
	alias:'widget.detailgrid',
	initComponent:function(){
		this.collapsible=true;
		this.split=true;
		this.width=300;
		this.dockedItems= [{      //insert buttons ar the top
					xtype: 'toolbar',
					dock: 'top',
					height:30,
					items:[{xtype:'imagebutton'},{xtype:'mapbutton'}]
					}];
		this.callParent(arguments);
	}
});