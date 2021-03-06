Ext.define('BSG.view.HorizontalPanel',{
	extend:'Ext.panel.Panel',
	alias:'widget.horizontalpanel',
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
		
		if(!BSG.variables){BSG.variables={};}
		BSG.variables.horizontalPanelCore=Ext.create('BSG.view.HorizontalPanelCore');
				
		this.items=[BSG.variables.horizontalPanelCore];
				
		this.callParent(arguments);	
	}	
});

/*Ext.define('BSG.view.HorizontalPanel',{
	extend:'Ext.panel.Panel',
	alias:'widget.horizontalpanel',
	initComponent:function(){
		this.collapsible=true;
		this.split=true;
		this.height=300;
		this.layout='border';
		this.items=[
			xtype:'horizontalpanelcore'
			layout:'fit',
			items=[{
			xtype:'bibliogrid',
			region:'center'
			},{
			xtype:'detailgrid',
			region:'east'
			}]
		];
		this.callParent(arguments);	
	}	
});*/