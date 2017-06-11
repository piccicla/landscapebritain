Ext.define('BSG.view.VerticalRightPanel',{
	extend:'Ext.panel.Panel',
	alias:'widget.verticalrightpanel',	
	initComponent:function(){
		this.collapsible=true;
		this.split=true;
		this.width=390;
		this.layout= 'fit';
		this.hidden=true;
		this.dockedItems=[{
			dock:'top',
			xtype:'toolbar',
			height:30,
			items:[{xtype:'combostyle'},
			//{xtype:'bookmarkbutton'},
			{
				xtype: 'buttongroup',
				columns: 3,
				items: [{xtype:'detachtabsbutton'},{xtype:'attachlefttabbutton'},{xtype:'attachrighttabbutton'}]
			}]
		}];
		this.callParent(arguments);	
	}	
});