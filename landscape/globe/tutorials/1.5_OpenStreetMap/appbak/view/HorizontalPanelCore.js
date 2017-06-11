Ext.define('BSG.view.HorizontalPanelCore',{
	extend:'Ext.panel.Panel',
	alias:'widget.horizontalpanelcore',
	initComponent:function(){
		this.layout='border';
		this.items=[
			{
			xtype:'bibliogrid',
			region:'center'
			},{
			xtype:'detailgridtab',
			//xtype:'tabpanel',
			region:'east',
			collapsible:true,
			split:true
			}
		];
		this.callParent(arguments);	
	}	
});