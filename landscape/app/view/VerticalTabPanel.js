Ext.define('BSG.view.VerticalTabPanel',{
	extend:'Ext.tab.Panel',
	alias:'widget.verticaltabpanel',	
	initComponent:function(){
	this.items= [{
			title: 'About',
			frame:true,
			autoScroll:true,				
			autoLoad: 'about.html'
		},{
			title: 'Help',
			frame:true,	
			autoScroll:true,				
			autoLoad: 'help.html'
			/*layout:'accordion',
			items:[{		
				xtype:'maphelppanel',
				title: 'Map navigation'
			},{
				xtype:'browsehelppanel',
				title: 'Browse data'
			}]*/		
		},{
			title: 'Legend',
			//frame:true,			
			//autoScroll:true
			layout:'accordion',
			items:[{		
				title: 'Table',
				frame:true,	
				autoScroll:true,				
				autoLoad: 'legendTable.html'
			},{
				title: 'Map',
				frame:true,	
				autoScroll:true,				
				autoLoad: 'mapTable.html'
			},{
				title: 'Layers',
				frame:true,	
				autoScroll:true,				
				autoLoad: 'layerTable.html'
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
					id:'queryMessage',
					frame:true,
					height:30
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
		
		/*this.dockedItems=[{
			dock:'bottom',
			xtype:'toolbar',
			height:30,
			items:[{xtype:'combostyle'},
			//{xtype:'bookmarkbutton'},
			{
				xtype: 'buttongroup',
				columns: 3,
				items: [{xtype:'detachtabsbutton'},{xtype:'attachlefttabbutton'},{xtype:'attachrighttabbutton'}]
			}]	
		}];*/	
	this.callParent(arguments);	
	}	
});