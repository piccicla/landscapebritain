Ext.define('BSG.view.BiblioGrid',{
	extend:'Ext.grid.Panel',
	alias:'widget.bibliogrid',	
	//stores:['Articles'],
	fireTabChange:function(){BSG.util.getComponent('detailgridtab',0).fireEvent('tabchange',
									BSG.util.getComponent('detailgridtab',0),
									BSG.util.getComponent('detailgridtab',0).getActiveTab(),
									BSG.util.getComponent('detailgridtab',0).getActiveTab(),
									{})},
	initComponent:function(){
		this.id='bibliogrid';
		
		/*columns: [
			{ header: 'Source',  dataIndex: 'Source' },
			{ header: 'Authors', dataIndex: 'Authors' },
			{ header: 'Title', dataIndex: 'Title' }
		]*/	
		this.features= [{ftype:'grouping'}];
		this.columns= [
					{
					xtype: 'rownumberer',
					width:40
					},
					{			
					dataIndex: 'SOURCE',			
					//flex: 1,
					text: 'SOURCE',
					width:60,
					renderer:BSG.util.sourceImage,				
				},
				  {
					xtype:'actioncolumn',
					width:85,
					groupable:false,
					items: [{
						icon: 'style/detailsicon.png',  
						tooltip: 'Details',
						handler: function(grid, rowIndex, colIndex) {
							
							//you are pressing a button on the gridrow
							BSG.variables.selectedOnGrid=true;
							
							//var rec = grid.getStore().getAt(rowIndex);
							grid.getSelectionModel().select(rowIndex);
								
							if(BSG.util.getComponent('detailgridtab',0).getActiveTab().id=='detailsTab'){
								BSG.util.getComponent('bibliogrid',0).fireTabChange();
							}	
							else{BSG.util.getComponent('detailgridtab',0).setActiveTab('detailsTab');}
							
							//alert("Edit " + rec.get('id'));
							//console.log('Details'+rowIndex);
							
							BSG.variables.selectedOnGrid=false;
						}
					},{
						icon: 'style/abstracticon.png',
						tooltip: 'Abstract',
						handler: function(grid, rowIndex, colIndex) {
							BSG.variables.selectedOnGrid=true;
							
							//var rec = grid.getStore().getAt(rowIndex);
							grid.getSelectionModel().select(rowIndex);
							
							if(BSG.util.getComponent('detailgridtab',0).getActiveTab().id=='abstractTab'){
								BSG.util.getComponent('bibliogrid',0).fireTabChange();
							}	
							else{BSG.util.getComponent('detailgridtab',0).setActiveTab('abstractTab');}
							
							
							//alert("Terminate " + rec.get('id'));
							//console.log('Abstract'+rowIndex);
							BSG.variables.selectedOnGrid=false;
						}
					},{
						icon: 'style/imageicon.png',
						tooltip: 'Images',
						handler: function(grid, rowIndex, colIndex) {
							BSG.variables.selectedOnGrid=true;
							
							//var rec = grid.getStore().getAt(rowIndex);
							grid.getSelectionModel().select(rowIndex);
							
							if(BSG.util.getComponent('detailgridtab',0).getActiveTab().id=='imagesTab'){
								BSG.util.getComponent('bibliogrid',0).fireTabChange();
							}else
							{BSG.util.getComponent('detailgridtab',0).setActiveTab('imagesTab');
							}
							//alert("Terminate " + rec.get('firstname'));
							//console.log('Images'+rowIndex);
							BSG.variables.selectedOnGrid=false;
						}
					},{
						icon: 'style/mapicon.png',
						tooltip: 'Maps',
						handler: function(grid, rowIndex, colIndex) {
							BSG.variables.selectedOnGrid=true;
							//var rec = grid.getStore().getAt(rowIndex);
							grid.getSelectionModel().select(rowIndex);
							
							if(BSG.util.getComponent('detailgridtab',0).getActiveTab().id=='mapsTab'){
								BSG.util.getComponent('bibliogrid',0).fireTabChange();
							}else
							{BSG.util.getComponent('detailgridtab',0).setActiveTab('mapsTab');
							}
							//alert("Terminate " + rec.get('firstname'));
							//console.log('Maps'+rowIndex);
							BSG.variables.selectedOnGrid=false;
						}
					}
					]
				},
				{
					dataIndex: 'id',
					text: 'ID',
					hidden:true,
					groupable:false,
				},
				{
					dataIndex: 'AUTHOR',
					text: 'AUTHOR',
					groupable:false
					//,allowBlank: false
					
				},
				{
					dataIndex: 'YEAR',
					text: 'YEAR'
					//,allowBlank: true
				},
				{
					dataIndex: 'TITLE',
					text: 'TITLE',
					width:200,
					groupable:false
					//,allowBlank: false
				},
				{
					dataIndex: 'PUB_NAME',
					text: 'PUBLICATION',
					width:200
					//,allowBlank: true
				},
				{
					dataIndex: 'PUBLISHER',
					text: 'PUBLISHER',
					width:200
					//,allowBlank: true
				},
				{
					dataIndex: 'START_PAGE',
					text: 'START_PAGE',
					hidden:true,
					groupable:false
					//,allowBlank: true
				},
				{
					dataIndex: 'END_PAGE',
					//flex: 1,
					text: 'END_PAGE',
					hidden:true,
					groupable:false
					//,allowBlank: true
				},
				{
					dataIndex: 'VOL',
					text: 'VOLUME',
					hidden:true,
					groupable:false
					//allowBlank: true
				},
				{
					dataIndex: 'YEAR2',
					text: 'YEAR2',
					hidden:true,
					groupable:false
					//allowBlank: true
				},
				{
					dataIndex: 'LINK',
					text: 'LINK',
					hidden:true,
					groupable:false
					//allowBlank: true
				},
				{
					dataIndex: 'DOI',
					text: 'DOI',
					hidden:true,
					groupable:false
					//allowBlank: true
				},		
				{			
					dataIndex: 'PLACE',			
					//flex: 1,
					text: 'PLACE'		
				}		
				,{			
					dataIndex: 'NCA',			
					//flex: 1,
					text: 'NCA'
				}
				/*{
						dataIndex: 'FLAG',			
						//flex: 1,
						text: 'FLAG'		
				}*/						
		];	
		this.store='Articles';
		this.dockedItems= [{      //insert buttons ar the top
						xtype: 'toolbar',
						dock: 'top',
						height:30,
						items:[{xtype:'zoombutton'},'-',{xtype:'reportbutton'},'-',{xtype:'graphbutton'},'-',
						{
							xtype: 'buttongroup',
							columns: 3,
							items: [{xtype:'detachgridbutton'},{xtype:'attachtopgridbutton'},{xtype:'attachbottomgridbutton'}]
						}]
					}
					,{
						xtype: 'pagingtoolbar',
						id:'gridPaging',
						dock: 'bottom',
						store: 'Articles',
						displayMsg :"Displaying {0} - {1} of {2}",
						displayInfo: true,
						listeners: {
							afterrender: function() {
								Ext.getCmp('gridPaging').getComponent('refresh').hide();
							}
						}
					}
					
						
				];
		this.callParent(arguments);	
	}
});