Ext.define('BSG.view.VerticalTabPanel',{
	extend:'Ext.tab.Panel',
	alias:'widget.verticaltabpanel',	
	initComponent:function(){
	this.items= [{
			title: 'About',
			frame:true,		
			autoLoad: 'about.html'
		},{
			title: 'Help',
			layout:'accordion',
			items:[{		
				xtype:'maphelppanel',
				title: 'Map navigation'
			},{
				xtype:'browsehelppanel',
				title: 'Browse data'
			}]		
		},{
			title: 'Query',
			layout: {
			type: 'vbox',
			align: 'stretch'
			},
			items:[{
					flex:5,
					layout:'accordion',		
					items:[
					{
						xtype:'spatialquerypanel',
						title: 'Spatial Query'
					},{		
						xtype:'attributequerypanel',
						title: 'Attribute Query'
					}]
				},{					
					xtype:'querydetails'					
				}
			]
			
		},{
			title: 'Layers',
			layout: 'fit',	
			frame:true,		
			items:[{
				xtype:'layertree'
			}],
			dockedItems:[{
				xtype:'toolbar',
				id:'progressBarToolbar',
				dock:'bottom',			
				height:25,
				layout:{
					type:'vbox',
					align: 'stretch'
				},
				items:[{
					xtype:'progressbar',
					width: 100,
					flex:1,
					id:'progressBar'
				}]
			}]
		}];
		this.dockedItems=[{
			dock:'bottom',
			xtype:'toolbar',
			height:30,
			items:[{xtype:'combostyle'},{xtype:'bookmarkbutton'},
			{
				xtype: 'buttongroup',
				columns: 3,
				items: [{xtype:'detachtabsbutton'},{xtype:'attachlefttabbutton'},{xtype:'attachrighttabbutton'}]
			}]	
		}];	
	this.callParent(arguments);	
	}	
});