//enable the dynamic dependency loading feature
//It's important to note that dynamic loading should only be used during development on your local machines. 
//During production, all dependencies should be combined into one single JavaScript file.
Ext.Loader.setConfig({enabled: true});

//Ext.require('Ext.container.Viewport');
//Ext.require('Ext.form.Panel');

Ext.require([
	'Ext.form.*',
	'Ext.layout.container.Column',
    'Ext.direct.*',
	'Ext.data.*'//,
	//'Ex.grid.*',
	//'Ext.util.*',
    //'Ext.view.View'
]);



Ext.onReady(function(){

	//activate the communication with the server
	Ext.direct.Manager.addProvider(Ext.app.REMOTING_API);
	
var bd = Ext.getBody();

//to know if i already loaded the level3 data
var comboboxLevel3Loaded=false;


//model for level1 list dropmenu 
	Ext.define('LEVEL1LIST', {
		extend: 'Ext.data.Model',
		fields: [ {name:'L1_ID', type: 'int'},'NAME'],
		proxy: {
			type: 'direct',
			directFn: Ext.ss.QueryPostGISArticle2.getListLevel1
			}
		});
	//store for level1 list dropmenu 
	var storeLevel1List = Ext.create('Ext.data.Store', {
		model: 'LEVEL1LIST',
		autoLoad: false,
		storeId:"storeLevel1List"		
	});
	
//model for level2 list dropmenu 
	Ext.define('LEVEL2LIST', {
		extend: 'Ext.data.Model',
		fields: [ {name:'L2_ID', type: 'int'},'NAME',{name:'L1_ID', type: 'int'}],
		proxy: {
			type: 'direct',
			directFn: Ext.ss.QueryPostGISArticle2.getListLevel2
			}
		});
	//store for level1 list dropmenu 
	var storeLevel2List = Ext.create('Ext.data.Store', {
		model: 'LEVEL2LIST',
		autoLoad: false,
		storeId:"storeLevel2List"		
	});
	
//model for level3 list dropmenu 
	Ext.define('LEVEL3LIST', {
		extend: 'Ext.data.Model',
		fields: [ {name:'L3_ID', type: 'int'},'NAME',{name:'L2_ID', type: 'int'}],
		proxy: {
			type: 'direct',
			directFn: Ext.ss.QueryPostGISArticle2.getListLevel3
			}
		});
	//store for level1 list dropmenu 
	var storeLevel3List = Ext.create('Ext.data.Store', {
		model: 'LEVEL3LIST',
		autoLoad: false,
		storeId:"storeLevel3List"		
	});

//the form for level 1 management
	var form = Ext.create('Ext.form.Panel', {	
		xtype: 'form',
		id: "form",
		itemId:"form",
		frame:true,
		buttonAlign:'left',
		//region: 'center',
		layout:'fit',
		//title: 'Astract',
		//bodyStyle:'padding:1px 1px 0',
		//flex:1,
		api: {  
			   // this is for updating/creating rows
			   //load: Ext.ss.QueryPostGISArticle.loadFormLevel1,
			   //submit: Ext.ss.QueryPostGISArticle.updateFormLevel1
		},
		//paramOrder: ['id'],  //this is used by forms to specify the parameters (because only the value is sent)		
		fieldDefaults: {
			labelAlign: 'top',
			msgTarget: 'side'
		},		
		items: [
		{
			xtype: 'fieldset',
			id: 'fieldset',
			title:'Level selection',             
			margin: '0 0 0 10',
			defaultType: 'textfield',
			defaults: {
				width:200,
				labelAlign: 'top',
				msgTarget: 'side'
			},					
			items: [{						
				//TODO: use the level1 table, force selection problem
				xtype: 'combobox',
				fieldLabel: 'Level1',
				name: 'NAME',
				id:"comboboxLevel1",
				itemId: "comboboxLevel1",
				//allowBlank: true,
				emptyText : "select...",
				//valueNotFoundText : "connecting to database",				
				////TODO: the problem here....
				//forceSelection: true,
				editable : false,								
				typeAhead: true,
				typeAheadDelay:250,
				queryMode: 'remote',
				/*
				store: new Ext.data.ArrayStore({
					//id: 0,
					fields: [
						'L1_ID',  
						'NAME'
					],
					data: [
							[1,'Environment/ Landform'],[2,'Processes'],[3,'Materials'],[4,'Management'],[5,'Impact'],[6,'Timescale or period'],[7,'Attributes within system'],[8,'Hazards'],[9,'Technique']
						]  
				}),
				*/
				store:storeLevel1List,
				
				
				displayField: 'NAME',
				valueField: 'L1_ID',
				triggerAction: 'all',
				selectOnTab: true,
				//store: storeLevel1ListType,
				//??? don't understand their use
				lazyRender: true,
				listClass: 'x-combo-list-small',
				//enableKeyEvents:true,
				listeners:{
					select: function(combo, record) {
								var stateCombo = Ext.getCmp('comboboxLevel2');												
								stateCombo.store.clearFilter(true);
								stateCombo.store.filter(
								{
									property: 'L1_ID',
									value: record[0].data.L1_ID,
									exactMatch: true
								});
								stateCombo.setValue(null);
								Ext.getCmp('buttonAddLevel1').disable(true);
								Ext.getCmp('comboboxLevel2').setVisible(true);
								Ext.getCmp('comboboxLevel3').setVisible(false);
							}
				}							
			},							
			{						
				//TODO: use the level1 table, force selection problem
				xtype: 'combobox',
				fieldLabel: 'Level2',
				name: 'NAME',
				id:"comboboxLevel2",
				itemId: "comboboxLevel2",
				hideMode:'visibility',
				//allowBlank: false,
				emptyText : "select....",
				//valueNotFoundText : "connecting to database",				
				////TODO: the problem here....
				//forceSelection: true,								
				editable : false,	
				typeAhead: true,
				typeAheadDelay:250,
				queryMode: 'remote',
				/*
				store: new Ext.data.ArrayStore({
					//id: 0,
					fields: [
						'L2_ID',  
						'NAME',
						'L1_ID'
					],
					data: [
					[1,'Fluvial',1],[2,'Coastal',1],[4,'Aeolian',1],[5,'Glacial',1],[6,'Periglacial',1],[7,'Structural',1],[8,'Karst',1],[9,'Slope',1],[10,'Urban',1],[11,'Upland',1],[12,'Lowland',1],[13,'Plateau',1],[14,'Escarpment',1],[15,'Downland',1],[16,'Mountain',1],[17,'Hills',1],[18,'Fells',1],[19,'Moorland',1],[20,'Wetland',1],[21,'Bog',1],[22,'Estuarine',1],[23,'Lacustrine',1],[163,'Marine',1],
					[24,'Erosion',2],[25,'Deposition',2],[26,'Sedimentation',2],[27,'Sediment transport',2],[28,'Mass movement',2],[29,'Accretion',2],[30,'Denudation',2],[31,'Isostasy',2],[32,'Weathering',2],[33,'Glaciation',2],[34,'Nutrient flux',2],[35,'Solutes',2],[36,'Pollution',2],[38,'Uplift',2],[39,'Water flow',2],[40,'Waves',2],[41,'Tides',2],[42,'Storms',2],[43,'Storage',2],[44,'Fire',2],[45,'Sea-level',2],[46,'Migration',2],[47,'Advance',2],[48,'Retreat',2],
					[49,'Consolidated',3],[50,'Unconsolidated',3],[51,'Bedrock',3],[52,'Alluvium',3],[53,'Colluvium',3],[54,'Peat',3],[55,'Boulders',3],[56,'Gravel',3],[57,'Sand',3],[58,'Silt',3],[59,'Clay',3],[60,'Soil',3],[61,'Minerogenic',3],[62,'Organic',3],
					[63,'Conservation status',4],[64,'Protection',4],[65,'Flood defence',4],[66,'Reclamation',4],[67,'Dredging',4],[68,'Quarrying',4],[69,'Hard engineering',4],[70,'Soft engineering',4],[71,'Preservation',4],[72,'Restoration',4],[73,'Biodiversity',4],[74,'Catchment management',4],[75,'Conservation',4],[76,'Climate change mitigation',4],[77,'Climate change adaptation',4],[78,'Buffer zone',4],[79,'Buffer',4],[80,'Desalinization',4],[81,'Channelization',4],
					[82,'Human impacts',5],[83,'Environmental impacts',5],[84,'Climate change',5],[85,'Sea level rise',5],[86,'Storm surges',5],[87,'Agricultural impact',5],[88,'Land-use impact',5],[89,'Mining impact',5],[90,'Tourism impact',5],[91,'Desertification',5],[92,'Dam impact',5],[93,'Urbanization',5],[94,'Eutrophication',5],
					[95,'Event',6],[96,'Seasonal',6],[97,'Annual',6],[98,'Decadal',6],[99,'Century',6],[100,'Millenia',6],[101,'Historical',6],[102,'Holocene',6],[103,'Pleistocene',6],[104,'Quaternary',6],[105,'Tertiary',6],[106,'Longer',6],
					[107,'Change',7],[109,'Rate',7],[111,'Resistance',7],[112,'Erodibility',7],[113,'Grain size',7],[114,'Water quality',7],[115,'Dynamic',7],[116,'Equilibrium',7],[117,'Coupling',7],[118,'Sustainability',7],[119,'Sensitivity',7],[120,'Instability',7],[121,'Resilience',7],[122,'Store',7],[123,'Complex',7],[124,'Chaos',7],[125,'Antecedent',7],[126,'Baseline',7],[127,'Thresholds',7],[128,'Regime',7],[129,'Inheritance',7],[130,'Magnitude',7],[131,'Frequency',7],[132,'Feedback',7],[133,'Return period/ recurrence interval',7],
					[134,'Flood',8],[135,'Drought',8],[136,'Landslide',8],[137,'Rockfall',8],[138,'Mudflow',8],[139,'Debris flow',8],[140,'Surge',8],[141,'Breach',8],[142,'Subsidence',8],[143,'Erosion',8],[144,'Sedimentation',8],[145,'Tsunami',8],[146,'Storm',8],[147,'Pollution',8],
					[148,'Monitoring',9],[149,'Modelling',9],[150,'DTM/DEM',9],[151,'Mapping',9],[152,'Geographic Information System(GIS)',9],[153,'Remote sensing',9],[154,'Geochronology/dating',9],[155,'Tracer',9],[156,'Palynology',9],[157,'Environmental Magnetism',9],[158,'Global Positioning System(GPS)',9],[160,'Stratigraphy',9],[161,'Geochemistry',9],[162,'Archeology',9]
					]  
				}),
				*/
				store:storeLevel2List,
				
				displayField: 'NAME',
				valueField: 'L2_ID',
				triggerAction: 'all',
				selectOnTab: true,
				//??? don't understand their use
				lazyRender: true,
				listClass: 'x-combo-list-small',
				enableKeyEvents:true,
				listeners:{select: function(combo, record){
								var stateCombo = Ext.getCmp('comboboxLevel3');												
								
								if (!comboboxLevel3Loaded){
									stateCombo.store.load(function(records, operation, success) {							
										if (success){
												comboboxLevel3Loaded=true;
												setUpcomboBoxLevel3(stateCombo,record);
											}								
									});
								}else{
									setUpcomboBoxLevel3(stateCombo,record);
								}							
				}}
			},
			{						
				//TODO: use the level1 table, force selection problem
				xtype: 'combobox',
				fieldLabel: 'Level3',
				name: 'NAME',
				id:"comboboxLevel3",
				itemId: "comboboxLevel3",
				hideMode:'visibility',
				//allowBlank: true,
				emptyText : "select....",
				//valueNotFoundText : "connecting to database",				
				////TODO: the problem here....
				//forceSelection: true,								
				editable : false,	
				typeAhead: true,
				typeAheadDelay:250,
				queryMode: 'remote',
				/*
				store: new Ext.data.ArrayStore({
					//id: 0,
					fields: [
						'L3_ID',  
						'NAME',
						'L2_ID'
					],
					data: [
					[1,'Channel',1],[2,'Bar',1],[3,'Bank',1],[4,'Meander',1],[5,'Braiding',1],[6,'Fllodplain',1],[7,'Alluvial fan',1],[8,'River terraces',1],[9,'Paleochannel',1],[10,'River',1],[11,'Gorge (fluvial)',1],[12,'Gully',1],[13,'Valley',1],[14,'Catchment',1],[15,'Waterfall',1],[16,'Cut-off',1],[17,'Levee',1],[18,'Buried channel',1],					
					
					[20,'Cliff (coastal)',2],[21,'Beach',2],[22,'Estuary',2],[23,'Bar',2],[24,'Saltmarsh',2],[25,'Dune',2],[26,'Lagoon',2],[27,'Nearshore',2],[28,'Offshore',2],[29,'Spit',2],[30,'Delta',2],[31,'Headland',2],[32,'Tombolo',2],[33,'Berm (coastal)',2],[34,'Cusp (coastal)',2],[35,'Notch',2],[36,'Platform',2],[37,'Breach',2],[38,'Currents',2],
					
					[39,'Landslide',28],[40,'Rockfall',28],[41,'Mudflow',28],[42,'Debris flow',28],
					
					[43,'Rills',9],[44,'Gullies',9],[45,'Debris cones',9],[46,'Scree',9],[47,'Pipes',9],[48,'Cliff (slopes)',9],[49,'Pediment',9],
					
					[50,'Dune',4],
					
					[51,'Drumlin',5],[52,'Moraine',5],[53,'Esker',5],[54,'Crag and tail',5],[55,'Hummocks',5],[56,'Kame terrace',5],[57,'Kame',5],[58,'Roche mountonée',5],[59,'Erratics',5],[60,'Cirque/corrie',5],
					
					[61,'Stone pavement',6],[62,'Circles',6],[63,'Polygons',6],[64,'Patterned ground',6],[65,'Stripes',6],[66,'Terrace',6],[67,'Solifluction lobes',6],
					
					[68,'Fault',7],[69,'Fold',7],
					
					[70,'Tor',8],[71,'Cave',8],[72,'Pothole',8],[73,'Sinkhole',8],[74,'Limestone pavement',8],[75,'Dry valley',8],[76,'Gorge(karst)',8],[77,'Karren',8],[78,'Inselberg',8],
					
					[79,'Delta',23],[80,'Bathymetry',23],[81,'Mere',23]
					]  
				}),
				*/

				store:storeLevel3List,
				
				displayField: 'NAME',
				valueField: 'L3_ID',
				triggerAction: 'all',
				selectOnTab: true,
				//??? don't understand their use
				lazyRender: true,
				listClass: 'x-combo-list-small',
				enableKeyEvents:true,
				listeners:{select: function(combo, record){
					Ext.getCmp('buttonAddLevel1').enable(true);
					//Ext.getCmp('buttonAddLevel1').btnInnerEl.setStyle({color:'red'});
					isLevel1ToUpdate=true;
					}
				}
			}		
			]
		}]			
		,
		buttons: [{
			text: 'Add',
			iconCls: 'add',							
			itemId: 'buttonAddLevel1',
			id: 'buttonAddLevel1',
			disabled: true,
			handler: function() {	 
			 }
			}]
		});
		
		
		var panel=Ext.create('Ext.panel.Panel',{
		id: "mainPanel",		
		itemId:"mainPanel",	
		renderTo: bd,
		items:[form]
	})
		
	Ext.getCmp('comboboxLevel2').setVisible(false);	
	Ext.getCmp('comboboxLevel3').setVisible(false);	


	function setUpcomboBoxLevel3(stateCombo,record){
		stateCombo.store.clearFilter(true);
		stateCombo.store.filter(
		{
			property: 'L2_ID',
			value: record[0].data.L2_ID,
			exactMatch: true
		});
		stateCombo.setValue(null);
															
		if(Ext.getCmp('comboboxLevel3').store.data.items.length>0){
			Ext.getCmp('comboboxLevel3').setVisible(true);
			Ext.getCmp('buttonAddLevel1').disable(true);
		}
		else {Ext.getCmp('comboboxLevel3').setVisible(false);
			Ext.getCmp('buttonAddLevel1').enable(true);
		}														
	//Ext.getCmp('buttonAddLevel1').btnInnerEl.setStyle({color:'red'});
	//isLevel1ToUpdate=true;
	};
	
});