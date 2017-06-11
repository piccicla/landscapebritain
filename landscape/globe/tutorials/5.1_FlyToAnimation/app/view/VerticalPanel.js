Ext.define('BSG.view.VerticalPanel',{
	extend:'Ext.panel.Panel',
	alias:'widget.verticalpanel',	
	initComponent:function(){
		this.collapsible=true;
		this.split=true;
		this.width=330;
		this.layout= 'fit';
		/*this.items=[{
			xtype:'verticaltabpanel'				
		}];*/
		
		if(!BSG.variables){BSG.variables={};}
		BSG.variables.verticalTabPanel=Ext.create('BSG.view.VerticalTabPanel');				
		this.items=[BSG.variables.verticalTabPanel];
				
		/*this.dockedItems=[{
			dock:'bottom',
			xtype:'toolbar',
			height:30,
			items:[{xtype:'combostyle'},{xtype:'bookmarkbutton'}]
		}];*/
		this.callParent(arguments);	
	}	
});