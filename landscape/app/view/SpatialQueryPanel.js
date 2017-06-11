Ext.define('BSG.view.SpatialQueryPanel',{
	extend:'Ext.panel.Panel',
	alias:'widget.spatialquerypanel',
	initComponent:function(){
		this.title= 'Spatial Query';
		this.layout= {
			type: 'vbox',
			align: 'stretch'
		};		
		this.items=[
			{	
			frame:true,	
			flex:1,
			autoScroll:true,		
			items:[
			{xtype:'spatialform'}
			]	
			}
		];
		this.callParent(arguments);
	}
});