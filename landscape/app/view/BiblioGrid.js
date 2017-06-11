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
		this.region='center';		
		//not working!!!!
		/*this.viewConfig={
			loadMask:true,
			loadingText:'Loading...'			
		};*/
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
					renderer:BSG.util.sourceImage				
				},
				{
					xtype:'actioncolumn',
					width:60,
					groupable:false,
					items: [{
						icon: 'style/zoomicon.png',  
						tooltip: 'Zoom to extent',
						handler: function(grid, rowIndex, colIndex) {
						
						//select on the grid and get row data,store the id
						grid.getSelectionModel().select(rowIndex);
						var rec = grid.getStore().getAt(rowIndex);
						BSG.variables.selectedArticleId=rec.data.id;
						//zoom the map
						BSG.map.map.zoomToExtent(new OpenLayers.Bounds(rec.data.xmin,rec.data.ymin,rec.data.xmax,rec.data.ymax).transform(BSG.map.proj, BSG.map.proj900913));					
						
						}
					},{
						icon: 'style/walk.png',  
						tooltip: 'Browse multiple bboxes',
						handler: function(grid, rowIndex, colIndex) {
						  //console.log('row: '+rowIndex+' col: '+colIndex);					
						  var b=BSG.util.getComponent('#bibliogrid',0);
						  //see if already selected if not select comparing the rowindex
						  if(rowIndex!=b.getStore().indexOf(b.getSelectionModel().getSelection()[0])){
							grid.getSelectionModel().select(rowIndex);						
						  }
						  var rec = grid.getStore().getAt(rowIndex);
						  var t=BSG.map.map.getLayersByName('BBoxes')[0];
						  //if walking is allowed and there are more than 1 feature browse
						  if(BSG.variables.walking){
							if(t.features.length>1){
							if (BSG.variables.walkingID>=t.features.length){BSG.variables.walkingID=0};
							BSG.map.map.zoomToExtent(t.features[BSG.variables.walkingID].geometry.getBounds());
							BSG.variables.walkingID+=1;}else{
							//zoom the map
								BSG.map.map.zoomToExtent(new OpenLayers.Bounds(rec.data.xmin,rec.data.ymin,rec.data.xmax,rec.data.ymax).transform(BSG.map.proj, BSG.map.proj900913));					
							}
						  }
						}
					}]
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
							{BSG.util.getComponent('detailgridtab',0).setActiveTab('mapsTab');}
							//alert("Terminate " + rec.get('firstname'));
							//console.log('Maps'+rowIndex);
							BSG.variables.selectedOnGrid=false;
						}
					}]
				},
				{
					dataIndex: 'id',
					text: 'ID',
					hidden:true,
					groupable:false
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
				/*{
					dataIndex: 'LINK',
					text: 'LINK',
					hidden:true,
					groupable:false
					//allowBlank: true
				},*/
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
						items:[{xtype:'deselectbutton'},{xtype:'requerybutton'},{xtype:'deletequerybutton'},'-',{xtype:'reportbutton'},'-',{xtype:'chartsbutton'},'-',
						{
							xtype: 'buttongroup',
							columns: 3,
							items: [{xtype:'detachgridbutton'},{xtype:'attachtopgridbutton'},{xtype:'attachbottomgridbutton'}]
						},'-',
						{
							xtype:'tbtext',
							id:'gridInfoText',
							width:100, 
							style:'text-align:center',
							text:''
						}]
					}
					,{
						xtype: 'pagingtoolbar',
						id:'gridPaging',
						dock: 'bottom',
						store: 'Articles',
						displayMsg :"Displaying {0} - {1} of {2}",
						displayInfo: true
						/*,listeners: {
							afterrender: function() {
								Ext.getCmp('gridPaging').getComponent('refresh').hide();
							}
						}*/
					}];
		this.callParent(arguments);	
	}
});