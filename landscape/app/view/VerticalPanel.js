Ext.define('BSG.view.VerticalPanel',{
	extend:'Ext.panel.Panel',
	alias:'widget.verticalpanel',	
	initComponent:function(){
		this.collapsible=true;
		this.split=true;
		this.width=330;
		//this.layout= 'vbox';
		/*this.items=[{
			xtype:'verticaltabpanel'				
		}];*/

		if(!BSG.variables){BSG.variables={};}
		BSG.variables.verticalTabPanel=Ext.create('BSG.view.VerticalTabPanel');				
		this.items=[BSG.variables.verticalTabPanel];
						
		this.callParent(arguments);	
	}	
});