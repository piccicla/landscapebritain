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
	models:['Level1','Level2','Level3','Source','Layer','LayerName','Article','Abstract','ImageView','MapView','LayerTree','Graph','SingleArticle','TotalGraph'],
	stores:['Level1s','Level2s','Level3s','Sources','Publications','Publishers','Layers','LayerNames','Articles','Abstracts','ImagesView','MapsView','LayersTree','Graphs','SingleArticles','TotalGraphs'],
		
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
				//directFn: Ext.ss.QueryDatabase.getResults,
				directFn: Ext.ss.QueryBiblio.getResults,
                reader: {
				type: 'json',
				root : 'records',
				totalProperty: 'total',
				idProperty :'id'
				}
				}	
		);
		this.getSingleArticlesStore().setProxy( 
				{
				type: 'direct',
				//directFn: Ext.ss.QueryDatabase.getResults,
				directFn: Ext.ss.QueryBiblio.getSingleResult,
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
		
		this.getGraphsStore().setProxy( 
				{
				type: 'direct',
				directFn: Ext.ss.QueryDatabase.getGraph
				}	
		);
		
		this.getTotalGraphsStore().setProxy( 
				{
				type: 'direct',
				directFn: Ext.ss.QueryDatabase.getTotalGraph
				}	
		);
		
		//////////////////load stores
		this.getArticlesStore().pageSize=BSG.variables.itemsPerPage;	
		
		/*
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
		*/	

		
		///////////////set the UI

		//set the pagin toolbar for the grid
		/*var gp=BSG.util.getComponent('#gridPaging',0);
		gp.on('afterrender', function() {
            gp.ownerCt.on('reconfigure', function() {
                BSG.util.getComponent('#gridPaging',0).bindStore(gp.ownerCt.store || 'ext-empty-store', true);
            });
        });*/
		
		
		BSG.util.getComponent('#bibliogrid',0).getView().on('refresh',function(v,e){BSG.util.initDetail();});
		
		//level selection
		BSG.util.getComponent('#comboboxLevel2',0).setVisible(false);
		BSG.util.getComponent('#comboboxLevel3',0).setVisible(false);
		
		//query details init (don't need anymore)
		//BSG.util.updateQueyDetails(BSG.util.getComponent('querydetails',0));
		
		//add childs to the tree		
		BSG.util.setTree('layertree','Basemap',true);
		BSG.util.setTree('layertree','Layers',false);
		
		//create a fake store to initialize the graphs
		BSG.store.FakeGraph = Ext.create('Ext.data.JsonStore', {
		//fields: ['name', 'data1', 'data2', 'data3', 'data4', 'data5', 'data6', 'data7', 'data8', 'data9'],
		storeId: 'fakeGraph',
		fields: ['name',{name:'data1', type: 'int'}],
		data:[
		{"name":"Attributes within system","data1":"0"},{"name":"Environment\/ Landform","data1":"0"},{"name":"Hazards","data1":"0"},{"name":"Impact","data1":"0"},{"name":"Management","data1":"0"},{"name":"Materials","data1":"0"},{"name":"Processes","data1":"0"},{"name":"Technique","data1":"0"},{"name":"Timescale or period","data1":"0"}
		]
		});
		
		/*BSG.variables.multiArticleProxy = Ext.extend(Ext.data.DirectProxy, {
				//directFn: Ext.ss.QueryDatabase.getResults,
				directFn: Ext.ss.QueryBiblio.getResults,
                reader: {
				type: 'json',
				root : 'records',
				totalProperty: 'total',
				idProperty :'id'
				}});*/
				
		/*Ext.define('multiArticleProxy',{
					extend:'Ext.data.proxy.Direct',
					initComponent:function(){
						directFn= Ext.ss.QueryBiblio.getResults;
						reader= {
						type: 'json',
						root : 'records',
						totalProperty: 'total',
						idProperty :'id'
						}
						this.callParent();	
					}});
					
		BSG.variables.multiArticleProxy = Ext.create('multiArticleProxy', {});*/
		
		
		//var tb=BSG.util.getComponent('#mappanel',0).getDockedItems('toolbar[dock="bottom"]')[0]
		
		//hide the refresh button below the grid
		BSG.util.getComponent('#gridPaging',0).getComponent('refresh').hide();
		
		//destroy the loader animation
		Ext.destroy(Ext.get('loading-message'));
		Ext.destroy(Ext.get('loading'));
		Ext.destroy(Ext.get('loading-mask'));
		var f = document.getElementById('load');
				f.innerHTML='';
				//Hopefully everything is removed and the following code won't execute.
				while (f.hasChildNodes()) { 
					 //If there are still nodes present we use the long road.
					 f.removeChild(f.firstChild);
		}
	}		
});
