Ext.define('BSG.view.HorizontalBottomPanel',{
	extend:'Ext.panel.Panel',
	alias:'widget.horizontalbottompanel',
	requires:['BSG.view.HorizontalPanelCore'],	
	initComponent:function(){
		this.collapsible=true;
		this.split=true;
		this.height=300;
		this.layout='fit';
		//the removed child will not be destroyed
		this.autoDestroy=false;
		/*this.items=[{
			xtype:'horizontalpanelcore'
		}];*/
		BSG.variables.horizontalPanelCore=Ext.create('BSG.view.HorizontalPanelCore');
				
		this.items=[BSG.variables.horizontalPanelCore];
				
		this.callParent(arguments);	
	}	
});