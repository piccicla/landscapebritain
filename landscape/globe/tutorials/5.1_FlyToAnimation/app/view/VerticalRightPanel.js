Ext.define('BSG.view.VerticalRightPanel',{
	extend:'Ext.panel.Panel',
	alias:'widget.verticalrightpanel',	
	initComponent:function(){
		this.collapsible=true;
		this.split=true;
		this.width=380;
		this.layout= 'fit';
		this.hidden=true;
		this.callParent(arguments);	
	}	
});