Ext.define('BSG.view.MapPanel',{
	extend:'Ext.panel.Panel',
	alias:'widget.mappanel',	
	initComponent:function(){
		this.id='mappanel',
		BSG.variables=BSG.variables||{};
		BSG.variables.areaButton=Ext.create('BSG.view.AreaButton');	
		BSG.variables.lengthButton=Ext.create('BSG.view.LengthButton');				
		this.dockedItems=[{
			dock:'bottom',
			xtype:'toolbar',
			height:30,
			items:[{xtype:'deselectbutton'},{xtype:'requerybutton'},'-',{xtype:'tbtext',width:130, style:'text-align:center',text:'<div id="coords">&nbsp;</div>'},{ xtype: 'tbseparator' },{xtype:'label', id: 'mapmessage', text:''},'->',{ xtype: 'tbseparator' },{xtype:'tbtext',width:140,text:'<div id="measure">&nbsp;</div>'},BSG.variables.areaButton,BSG.variables.lengthButton]		
		}];
		this.callParent(arguments);	
	}	
});