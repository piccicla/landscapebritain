Ext.define('BSG.view.HorizontalTopPanel',{
	extend:'Ext.panel.Panel',
	alias:'widget.horizontaltoppanel',
		
	initComponent:function(){
		this.collapsible=true;
		this.split=true;
		this.height=300;
		this.layout='fit';
		//the removed child will not be destroyed
		this.autoDestroy=false;
		this.hidden=true;
				
		this.callParent(arguments);	
	}	
});