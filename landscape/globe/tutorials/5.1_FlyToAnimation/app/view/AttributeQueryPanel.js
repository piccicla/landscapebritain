Ext.define('BSG.view.AttributeQueryPanel',{
	extend:'Ext.panel.Panel',
	alias:'widget.attributequerypanel',
	initComponent:function(){
		this.title= 'Attribute Query';
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
			{xtype:'levelform'},
			{xtype:'attributeform'},
			{xtype:'abstractform'},
			{xtype:'combinedform'}
			]	
			}
		/*,{
			frame:true,		
			autoLoad: 'about.html',
			flex:1
		}*/
		];
		this.callParent(arguments);	
	}	
});