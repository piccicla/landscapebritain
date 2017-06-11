//Ext.require('Ext.container.Viewport');
Ext.require([
		'Ext.direct.*',
		'Ext.form.*',
		'Ext.util.*',
		'Ext.view.View'
		]);
								
Ext.require('Ext.chart.*');
Ext.require(['Ext.Window', 'Ext.fx.target.Sprite', 'Ext.layout.container.Fit']);								
																							
Ext.application({
    //the namespace for the project
	name: 'BSG',
	appFolder:'app',
	//crete automatically the viewport
	autoCreateViewport:true,
	
	//load and instantiate the classes, give a storeid equals to the name, create the getters
	controllers:['Manage','Main','Graphs'],
	models:['Level1','Level2','Level3','Source','Layer','LayerName','Article','Abstract','ImageView','MapView','LayerTree'],
	stores:['Level1s','Level2s','Level3s','Sources','Publications','Publishers','Layers','LayerNames','Articles','Abstracts','ImagesView','MapsView','LayersTree'],
		
	//When the page is ready and all of your JavaScript has loaded, your Application's launch function is called, 
	//at which time you can run the code that starts your app. Usually this consists of creating a Viewport
	launch: function() {
			
		//////////////////////set the proxies for database communication
		this.getLevel1sStore().setProxy(
		{
				type: 'direct',
				directFn: Ext.ss.QueryDatabase.getListLevel1
				}
		);
		this.getLevel2sStore().setProxy(
				{
				type: 'direct',
				directFn: Ext.ss.QueryDatabase.getListLevel2
				}
		);
		this.getLevel3sStore().setProxy(
				{
				type: 'direct',
				directFn: Ext.ss.QueryDatabase.getListLevel3
				}
		);		
		this.getSourcesStore().setProxy( 
				{
				type: 'direct',
				directFn: Ext.ss.QueryDatabase.getSource
				}	
		);
		this.getPublicationsStore().setProxy( 
				{
				type: 'direct',
				directFn: Ext.ss.QueryDatabase.getPublication
				}	
		);
		this.getPublishersStore().setProxy( 
				{
				type: 'direct',
				directFn: Ext.ss.QueryDatabase.getPublisher
				}	
		);
		this.getLayersStore().setProxy( 
				{
				type: 'direct',
				directFn: Ext.ss.QueryDatabase.getLayer
				}	
		);
		this.getLayerNamesStore().setProxy( 
				{
				type: 'direct',
				directFn: Ext.ss.QueryDatabase.getLayerName
				}	
		);
		this.getArticlesStore().setProxy( 
				{
				type: 'direct',
				directFn: Ext.ss.QueryDatabase.getResults,
				reader: {
				type: 'json',
				root : 'records',
				totalProperty: 'total',
				idProperty :'id'
				}
				}	
		);
		this.getAbstractsStore().setProxy( 
				{
				type: 'direct',
				directFn: Ext.ss.QueryDatabase.getAbstract
				}	
		);
		this.getImagesViewStore().setProxy( 
			{
				type: 'ajax',
				url: 'get-images2.php',
				reader: {
					type: 'json',
					root: 'images'
				},
				listeners:{
					//TODO:fix here					
					//when success:false
					exception: function(proxy,response,operation,eOpts){
						if(response.responseText){
						//Ext.getCmp('dataImageView').update(Ext.JSON.decode(response.responseText).msg);
						}else {//Ext.getCmp('dataImageView').update('the server is not answering')}					
					}
					}	
				}
			}	
		);
		this.getMapsViewStore().setProxy( 
			{
				type: 'ajax',
				url: 'get-images2.php',
				reader: {
					type: 'json',
					root: 'images'
				},
				listeners:{
					//TODO:fix here					
					//when success:false
					exception: function(proxy,response,operation,eOpts){
						if(response.responseText){
						//Ext.getCmp('dataImageView').update(Ext.JSON.decode(response.responseText).msg);
						}else {//Ext.getCmp('dataImageView').update('the server is not answering')}					
					}
					}	
				}
			}	
		);	
		//////////////////load stores
		this.getArticlesStore().pageSize=BSG.variables.itemsPerPage;	
		
		this.getArticlesStore().load({
									params:{
											start:0,
											limit: BSG.variables.itemsPerPage
										},
									callback: function(records, operation, success) {
											//console.log(Ext.getCmp('bibliogrid').store.getProxy().getReader().jsonData.total);
											//Ext.getCmp('gridPaging').displayMsg=Ext.getCmp('bibliogrid').store.getProxy().getReader().jsonData.total;
								
									}
		});
					
		///////////////set the UI		
		//level selection
		BSG.util.getComponent('#comboboxLevel2',0).setVisible(false);
		BSG.util.getComponent('#comboboxLevel3',0).setVisible(false);
		//query details init
		BSG.util.updateQueyDetails(BSG.util.getComponent('querydetails',0));
		
		//add childs to the tree		
		BSG.util.setTree('layertree','Basemap',true);
		BSG.util.setTree('layertree','Layers',false);
		
	}		
});
