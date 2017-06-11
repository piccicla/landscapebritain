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
	'Ext.data.*',
	'Ex.grid.*',
	'Ext.util.*',
    'Ext.view.View'
]);

//variables for debugging in firebug
var errore;
var selection;

var editor; 
var e; 
var eOpts;

var azione;

var mappa;

var rec;

var reco;
var op;
var suss;

var myFeaure;


var polControl;
var transf;
var pol;





Ext.onReady(function(){

	
	//activate the communication with the server
	Ext.direct.Manager.addProvider(Ext.app.REMOTING_API);
	
////////////// "global" variables
		
	// store a reference to the body
	var bd = Ext.getBody();
	// variable telling if there is a new row (used during the ARTICLE table update)
	var newRow=true;
	//an object containing the data of the last selected row ( used to activate the update)
	var rowData;	
	//this object contains the abstract, it is confronted with the new abstract when submitting the form ( used to activate the update)
	var oldAbstract={};
	//a reference to the map window
	var win;
	//a reference to the image window
	var winImages;
	//reference to the table name for image management
	var table="PHOTO";
	// areference to the selected article id
	var selectedID;
	//kind of images allowed
	var extArray = new Array(".gif", ".jpg", ".png");
	//openlayers variables
	var map;
	var proj;
	var proj900913;
	var feature;
	var polygonLayer;	
	//openlayers control to draw polygons
	var polygonControl;	
	//openlayers control to transform features
	var transformControl;
	//this is true when the update button ispressed on the map
	var updatingMap=false;	
	//variables to store the old field values when changing them 
	var oldBRYField=0.0;
	var oldTLYField=0.0;
	var oldTLXField=0.0;
	var oldBRXField=0.0;
	
	//bing map key
	var apiKey ="Au7OUsIHM13kOS-CYjc5_-0jpXdt5TYxn7XEMCZZyXE9SiW5JIkgBD70bXHHFmN5";
	
	
//////////////  validation types
	
	//TODO: it does not work well.....when you select a row sometimes the test is shown in the UI
	// validation type, only numbers and check end page number is higher than start page
	var numeroTest = /[0-9]/;	
	Ext.apply(Ext.form.field.VTypes, {
	    numero: function(val, field) {	        				
			//validate the start page field
			if (field.endPageField){ //if the start page has a reference to an end page.....			
				// if we have 2 numeric values confront them
				if (numeroTest.test(val) && !isNaN(parseInt(Ext.getCmp(field.endPageField).getValue()))){				
					// start page is less or equal to the end page so it's ok
					if ( parseInt(val)<= parseInt(Ext.getCmp(field.endPageField).getValue())){
					  return true;
					} else {return false;}
				} 
				// if there is only start page as a number test it
				else {return numeroTest.test(val)}	
			} 
			//validate the end page field
			else if (field.startPageField){//if the end page has a reference to a start page.....		
				// if we have 2 numeric values confront them
				if (numeroTest.test(val) && !isNaN(parseInt(Ext.getCmp(field.startPageField).getValue()))){					
					// start page is less than end it's ok
					if ( parseInt(val) >= parseInt(Ext.getCmp(field.startPageField).getValue())){
					  return true;
					} else {return false;}
				} 
				// if there is only end page as a number test it
				else {return numeroTest.test(val)}	
			} 								
	    },
	    numeroText: 'Remember start_page <= end_page'
		,numeroMask: /[0-9]/
	});
		
	// validation type, 4 numbers, first digit 1 or 2, this is used to enter a four digit year
	var annoTest = /^[1-2]\d{3}$/;
	Ext.apply(Ext.form.field.VTypes, {
	    //  vtype validation function
	    anno: function(val, field) {
	        return annoTest.test(val);			
		},
	    annoText: 'Must contain a valid year (4 digits) '
		//,annoMask: /\d{4}/
	});
	
	//TODO: set this to the UK limits, maybe set a maximum number of decimals
	// validation type, optional sign, mandatory integer and fraction, no exponent,	
	var coordinateXTest = /^[+-]?(1[0-7][0-9]|[1-9]?[0-9])\.[0-9]+$/;
	
	//TODO: set limits -12/3
	//var coordinateXTest = /(^[-]?(12|1[0-1]|[0-9]))|([0-3])\.[0-9]+$/;
		
	//var coordinateTest = /^[+-]?[0-9]+\.[0-9]+$/;
	
	Ext.apply(Ext.form.field.VTypes, {
	    //  vtype validation function
	    coordinateX: function(val, field) {
				
	        ////////return coordinateXTest.test(val);
			
			//validate the top left field
			if (field.bottomRightX){ //if the top left has a reference to the bottom right.....			
				// if we have 2 numeric values confront them
				if (coordinateXTest.test(val) && !isNaN(parseFloat(Ext.getCmp(field.bottomRightX).getValue()))){				
					// top left X is less to the bottom right so it's ok
					if ( parseFloat(val)< parseFloat(Ext.getCmp(field.bottomRightX).getValue())){
					  return true;
					} else {return false;}
				} 
				// if there is only top left as a number test it
				else {return coordinateXTest.test(val);}	
			} 
			//validate the bottom right field
			else if (field.topLeftX){//if the bottom right has a reference to the top left.....		
				// if we have 2 numeric values confront them
				if (coordinateXTest.test(val) && !isNaN(parseInt(Ext.getCmp(field.topLeftX).getValue()))){					
					// bottom right is more than top left so it's ok
					if ( parseFloat(val) > parseFloat(Ext.getCmp(field.topLeftX).getValue())){
					  return true;
					} else {return false;}
				} 
				// if there is only end page as a number test it
				else {return coordinateXTest.test(val);}	
			}			
		},
	    coordinateXText: 'Must contain a valid coordinate (-180.0< x< 180.0) and top-left < bottom-right'
		//,annoMask: /\d{4}/
	});
	
	//TODO: set this to the UK limits, maybe set a maximum number of decimals
	// validation type, optional sign, mandatory integer and fraction, no exponent,
	
	//TODO: set limits 64/48
	var coordinateYTest = /^[+-]?(89|[1-8]?[0-9])\.[0-9]+$/;	
	//var coordinateTest = /^[+-]?[0-9]+\.[0-9]+$/;
	Ext.apply(Ext.form.field.VTypes, {
	    //  vtype validation function
	    coordinateY: function(val, field) {
	        
			///////return coordinateYTest.test(val);

			//TODO: there is a bug here!!!, if the thebox crosses the equator it does not work!!!
			
			//validate the top left field
			if (field.bottomRightY){ //if the top left has a reference to the bottom right.....			
				// if we have 2 numeric values confront them
				if (coordinateYTest.test(val) && !isNaN(parseFloat(Ext.getCmp(field.bottomRightY).getValue()))){				
					// top left Y is more than the bottom right so it's ok
					if ( parseFloat(val) > parseFloat(Ext.getCmp(field.bottomRightY).getValue())){
					  return true;
					} else {return false;}
				} 
				// if there is only top left as a number test it
				else {return coordinateYTest.test(val);}	
			} 
			//validate the bottom right field
			else if (field.topLeftY){//if the bottom right has a reference to the top left.....		
				// if we have 2 numeric values confront them
				if (coordinateYTest.test(val) && !isNaN(parseInt(Ext.getCmp(field.topLeftY).getValue()))){					
					// bottom right is less than top left so it's ok
					if ( parseFloat(val) < parseFloat(Ext.getCmp(field.topLeftY).getValue())){
					  return true;
					} else {return false;}
				} 
				// if there is only end page as a number test it
				else {return coordinateYTest.test(val);}	
			}


			
		},
	    coordinateYText: 'Must contain a valid coordinate (-90.0< x <90.0) and top-left > bottom-right '
		//,annoMask: /\d{4}/
	});
	
///////////// models and stores
	
	//model for ARTICLE table 
	Ext.define('ARTICLE', {
		extend: 'Ext.data.Model',
		fields: [ {name:'id', type: 'int'},'AUTHOR','TITLE', 'PUB_NAME',{ name:'START_PAGE', type: 'int'},{ name:'END_PAGE',type: 'int'},'VOL',{ name:'YEAR',type: 'int'},'YEAR2','PUBLISHER','LINK','DOI','PLACE','NCA', 'SOURCE'],
		proxy: {
			type: 'direct',
			api: {
				//create and update are handled by the form
				//create  : Ext.ss.QueryPostGISArticle.createRecord,
				read    : Ext.ss.QueryPostGISArticle.getResults,
				//update  : Ext.ss.QueryPostGISArticle.updateRecord,
				destroy : Ext.ss.QueryPostGISArticle.destroyRecord
			}
		}		
	});
	//store for ARTICLE
	var store = Ext.create('Ext.data.Store', {
		model: 'ARTICLE',
		autoLoad: true,  //call it when opening the page
		storeId:"storeArticle",
	});
	
	//model for PLACE table
	Ext.define('PLACE', {
		extend : 'Ext.data.Model',
		fields : [ 'NAME', 'PLACE_ID']/*,
		proxy : {
			type: 'direct',
			directFn: Ext.ss.QueryPostGISArticle.getPlace
		}*/		
	});
	//model for PLACEINIT table (you get only the first record)   //TODO: this is to init the dropdown menu with something but need revision
	Ext.define('PLACEINIT', {
		extend : 'Ext.data.Model',
		fields : [ 'NAME', 'PLACE_ID']
		/*,
		proxy : {
			type: 'direct',
			directFn: Ext.ss.QueryPostGISArticle.getPlaceInit
		}	*/	
	});
	//store for PLACE table (get first 6 rows)
	var storePlace = Ext.create('Ext.data.Store', {
		autoLoad: false,
		model : 'PLACE',
		storeId:"storePlace",
		proxy : {
			type: 'direct',
			directFn: Ext.ss.QueryPostGISArticle.getPlace
		}		
	});
	//store for PLACE table (to get only the first row)
	var storePlaceInit = Ext.create('Ext.data.Store', {   //TODO: this is to init the dropdown menu with something but need revision
		autoLoad: false,
		model : 'PLACEINIT',
		storeId:"storePlaceInit",
		proxy : {
			type: 'direct',
			directFn: Ext.ss.QueryPostGISArticle.getPlaceInit
		}
	});	
	
	//model for NCA table
	Ext.define('NCA', {
		extend : 'Ext.data.Model',
		fields : [ 'NAME', 'NCA_ID']		
	});
	//store for NCA table (get first 6 rows)
	var storeNCA = Ext.create('Ext.data.Store', {
		autoLoad: false,
		model : 'NCA',
		storeId:"storeNCA",
		proxy : {
			type: 'direct',
			directFn: Ext.ss.QueryPostGISArticle.getNCA
		}
		
	});
	//store for NCA table (to get only the first row)
	var storeNCAInit = Ext.create('Ext.data.Store', {     //TODO: this is to init the dropdown menu with something but need revision
		model : 'NCA',
		storeId:"storeNCAInit",
		proxy : {
			type: 'direct',
			directFn: Ext.ss.QueryPostGISArticle.getNCAInit
		}
	});
	
	//model for SOURCE table
	Ext.define('SOURCE', {
		extend : 'Ext.data.Model',
		fields : [ 'NAME', 'SOURCE_ID']		
	});
	//store for SOURCE table (get all the rows)
	var storeSource = Ext.create('Ext.data.Store', {
		autoLoad: false,
		model : 'SOURCE',
		storeId:"storeSource",
		proxy : {
			type: 'direct',
			directFn: Ext.ss.QueryPostGISArticle.getSource
		}		
	});
	//store for SOURCE table (to get only the first row)
	var storeSourceInit = Ext.create('Ext.data.Store', {    //TODO: this is to init the dropdown menu with something but need revision
		autoLoad: false,
		model : 'SOURCE',
		storeId:"storeSourceInit",
		proxy : {
			type: 'direct',
			directFn: Ext.ss.QueryPostGISArticle.getSourceInit
		}
	});
	
	//model for level1 table 
	Ext.define('LEVEL1', {
		extend: 'Ext.data.Model',
		fields: [ {name:'id', type: 'int'},{name:'ART_ID', type: 'int'},{name:'L1_ID', type: 'int'},'NAME'],
		proxy: {
			type: 'direct',
			api: {
				create  : Ext.ss.QueryPostGISArticle.createRecordLevel1,
				read    : Ext.ss.QueryPostGISArticle.getResultsLevel1,
				update  : Ext.ss.QueryPostGISArticle.updateRecordLevel1, //TODO:is this necessary????
				destroy : Ext.ss.QueryPostGISArticle.destroyRecordLevel1
			}
		}		
	});
	//store for level1
	var storeLevel1 = Ext.create('Ext.data.Store', {
		model: 'LEVEL1',
		autoLoad: false,
		storeId:"storeLevel1"
		/*proxy: {
			type: 'direct',
			directFn: Ext.ss.QueryPostGISLevel1.getResults
		}*/		
	});
	
	//model for level2 table 
	Ext.define('LEVEL2', {
		extend: 'Ext.data.Model',
		fields: [ {name:'id', type: 'int'},{name:'ART_ID', type: 'int'},{name:'L2_ID', type: 'int'},'NAME'],
		proxy: {
			type: 'direct',
			api: {
				create  : Ext.ss.QueryPostGISArticle.createRecordLevel2,
				read    : Ext.ss.QueryPostGISArticle.getResultsLevel2,
				update  : Ext.ss.QueryPostGISArticle.updateRecordLevel2, //TODO:is this necessary????
				destroy : Ext.ss.QueryPostGISArticle.destroyRecordLevel2
			}
		}		
	});
	//store for level2
	var storeLevel2 = Ext.create('Ext.data.Store', {
		model: 'LEVEL2',
		autoLoad: false,
		storeId:"storeLevel2"
		/*proxy: {
			type: 'direct',
			directFn: Ext.ss.QueryPostGISLevel1.getResults
		}*/		
	});
	
	//model for image management
	imageViewModel = Ext.define('imageViewModel', {
        extend: 'Ext.data.Model',
        fields: [
           {name: 'name'},
           {name: 'url'},
           {name: 'size', type: 'float'},
		   {name:'lastmod'}
		   ,'thumb_url'
        ]
    });
	//store for image management
	var storeImageView = Ext.create('Ext.data.Store', {
        model: 'imageViewModel',
        proxy: {
            type: 'ajax',
            url: 'get-images2.php',
            reader: {
                type: 'json',
                root: 'images'
            },
			listeners:{
				//when success:false
				exception: function(proxy,response,operation,eOpts){
					//console.log(Ext.JSON.decode(response.responseText).msg);
					if(response.responseText){
					Ext.getCmp('dataImageView').update(Ext.JSON.decode(response.responseText).msg);
					}else {Ext.getCmp('dataImageView').update('the server is not answering')}					
				}
			}
		
        }
    });
	
//////////////templates for image management
	var tplImageView = new Ext.XTemplate(
				'<tpl for=".">',
					'<div class="thumb-wrap" id="{name}">',
					'<div class="thumb"><img src="{thumb_url}" title="{name}"></div>',
					'<span class="x-editable">{shortName}</span></div>',
				'</tpl>',
				'<div class="x-clear"></div>'
		);

		var tplImageViewDetail = new Ext.XTemplate(
				'<div class="details">',
					'<tpl for=".">',
						'<img src="{thumb_url}"><div class="details-info">',
						'<b>Image Name:</b>',
						'<span>{name}</span>',
						'<b>Size:</b>',
						'<span>{sizeString}</span>',
						'<b>Last Modified:</b>',
						'<span>{lastmod}</span>',
						'<span><a href="{url}" target="_blank">view original</a></span></div>',
					'</tpl>',
				'</div>'
		);

	
////////////////////////row and cell and editing plugin
	
	//create a row edting plugin
	/*var rowEditing = Ext.create('Ext.grid.plugin.RowEditing', {
		clicksToMoveEditor: 1,
		autoCancel: false,
		listeners:{
		 beforeedit: function(editor, e, eOpts ){
			//console.log("Before editing");
			//console.log(editor.record.data.PLACE);
			
			Ext.ComponentQuery.query('combobox[itemId="comboboxPlace"]').setValue(editor.record.data.PLACE);
			
		 }		 
		}
	});*/
	
	//create a cell editing plugin
	/*var cellEditing = Ext.create('Ext.grid.plugin.CellEditing', {
        clicksToEdit: 1
    });*/
	

/////////the grid for the ARTICLE table
	
	//buttons for adding/deleting rows
	var buttonAdd = Ext.create('Ext.Button', {
				//reference to a css file (for the image)
				iconCls: 'add',
				text: 'Add',
				handler: function() {	
				
				newRow=true;// this is a new row
				
				//reset form and set buttonForm text
				//this.up('form').getForm().reset();
				Ext.getCmp('form').getForm().reset();				
				Ext.getCmp('buttonForm').setText("Save new record");
				
				buttonDelete.disable();
				
				//unselect the rows on the grid
				Ext.getCmp('grid').getSelectionModel().deselectAll(true);
				
				}
				
				/*handler: function() {				
					rowEditing.cancelEdit();
					//create an empty record with a default type
					var record=Ext.create('ARTICLE');
					record.data.PLACE="connecting to database";
					record.data.NCA="connecting to database";
					record.data.SOURCE="connecting to database";
					//getting the first value from the database tables (PLACE,NCA,LOCATION)
					////maybe this is not a good way to do things.....
					
					Ext.data.StoreManager.lookup('storePlaceInit').load(function(recordsPlace, operationPlace, successPlace) {																		
						//debug variable
						//success=false;				
						if(successPlace){											
						//assign the text obtained from the database
						record.data.PLACE=recordsPlace[0].data.NAME;						
						}
							/*
							Ext.data.StoreManager.lookup('storeNCAInit').load(function(recordsNCA, operationNCA, successNCA) {																		
							//debug variable
							//success=false;				
							if(successNCA){											
							//assign the text obtained from the database
							record.data.NCA=recordsNCA[0].data.NAME;						
							}
							
								Ext.data.StoreManager.lookup('storeSourceInit').load(function(recordsSource, operationSource, successSource) {																		
								//debug variable
								//success=false;				
								if(successSource){											
								//assign the text obtained from the database
								record.data.SOURCE=recordsSource[0].data.NAME;						
								}
								});
							
							});
							*/
					/*
					});
							
					//insert new row at top
					store.insert(0,record);
					//start edit at row 0
					rowEditing.startEdit(0,0);						
				}*/			
	});
	
	
	//be careful here because in the final version you should disable deleting if there are  linked database records
	var buttonDelete = Ext.create('Ext.Button',{
				iconCls: 'delete',
				text: 'Delete',
				disabled: true,
				handler: function() {
					
					//rowEditing.cancelEdit();
					
					var sm=Ext.getCmp('grid').getSelectionModel();
					
					//////debug variable
					selection=sm;
										
					Ext.Msg.show({
						title:"Delete record",
						msg: "You are deleting a record permanently, this cannot be undone. Proceed?",
						buttons:Ext.Msg.YESNO,
						icon: Ext.Msg.QUESTION,
						fn: function(btn){
							if (btn==="yes"){
							//select the first record and send to database, check that it's not new
							if (sm.getSelection()[0].data.id!=""){
								//send info to the server
								store.proxy.api.destroy(sm.getSelection()[0].data);
							}
							
							////TODO: you should see if the delete was successful on the server before doing the following
							
							store.remove(sm.getSelection());					
							//store.sync();	

							// clean the form and set buttontext in order to insert a new row
							newRow=true;
							Ext.getCmp('form').getForm().reset();
							Ext.getCmp('buttonForm').setText("Save new record");
							buttonDelete.disable();
							}
						}
					});
					}					
				
			});
			
	// reload data from database
	var buttonRefresh = Ext.create('Ext.Button',{
				iconCls: 'refresh',
				text: 'Refresh connection',
				handler: function() {
				//cancel editing and disable button delete
					
					//rowEditing.cancelEdit();
					
					
					/////gridForm.child('gridpanel').getSelectionModel().select(0);
					
					//reset form and set buttonForm text
					//this.up('form').getForm().reset();
					Ext.getCmp('form').getForm().reset();
					Ext.getCmp('buttonForm').setText("Save new record");					
					newRow=true;
					
					buttonDelete.disable();
					
					store.load();					
					}				
	});
	
	//create the grid panel
	//TODO: it may be useful to insert the paginating and maybe a text field to filter the data
	var grid = Ext.create('Ext.grid.Panel',{
			//columnWidth: 0.60,
			itemId: "grid",
			id: "grid",
			//height: 450,
			autoScroll: true, // allow left/right or top/down scroll
			height: 320,
			//width: 450,
			//title: 'ARTICLE',
			store: store,		
			listeners: {
					//when selectin a row store its content (to decide if we need to send an update to the server)
					select:function(rModel,rec, rowIndex, e) {
						//activate delete button
						buttonDelete.enable();
						
						//debug 
						console.log(rModel.getSelection()[0].data);
						
						rowData=rModel.getSelection()[0].data;
						
						Ext.getCmp('buttonForm').setText("Update record");
						newRow=false;//mark that this is not a new row
					},
					//when change the selection update the form text, level1, level2, abstract,location, images, photos
					selectionchange: function(model, records) {
						if (records[0]) {
							// show record in the form and change textForm button
							//this.up('form').getForm().loadRecord(records[0]);
							Ext.getCmp('form').getForm().loadRecord(records[0]);
																					
							//debug 
							rec=records[0];
							
							//store the article id
							selectedID=records[0].data.id;
							
							//pass article id and refresh the level1 grid							
							Ext.data.StoreManager.lookup('storeLevel1').load({
										id:selectedID,
										//TODO: maybe you could tell something if success is false
										callback: function(records, operation, success) {
											/*console.log(records);
											console.log(operation);
											console.log(success);*/
										}
									});
							//pass the article id and refresh the level2 grid							
							Ext.data.StoreManager.lookup('storeLevel2').load({
										id:selectedID,
										//TODO: maybe you could tell something if success is false
										callback: function(records, operation, success) {
											/*console.log(records);
											console.log(operation);
											console.log(success);*/
										}
									});
							
							//pass the article id and refresh the abstract form														
							var formAb = Ext.getCmp('formAbstract').getForm();																									
							formAb.load(												
									{
									params: {
										id: selectedID
									},
										success : onSuccessOrFailAbstractLoad,
										failure : onSuccessOrFailAbstractLoad
									}
								);
								
							//enable buttons
							Ext.getCmp('buttonPhotosManagement').enable();	
							Ext.getCmp('buttonPhotosManagement').setText('Open photos management for ART_ID='+selectedID);
							Ext.getCmp('buttonMapsManagement').enable();
							Ext.getCmp('buttonMapsManagement').setText('Open maps management for ART_ID='+selectedID);
							Ext.getCmp('boundingBoxFieldSet').setTitle('Bounding box for ART_ID='+selectedID);
							Ext.getCmp('buttonFormPositionMap').enable();
							Ext.getCmp('abstractAreaField').labelEl.update('Abstract for ART_ID='+selectedID);
							Ext.getCmp('buttonFormAbstract').enable();
						}else{
						    //disable  buttons
							Ext.getCmp('buttonPhotosManagement').disable();	
							Ext.getCmp('buttonPhotosManagement').setText('Please select a record to manage the photos');
							Ext.getCmp('buttonMapsManagement').disable();
							Ext.getCmp('buttonMapsManagement').setText('Please select a record to manage the maps');
							Ext.getCmp('boundingBoxFieldSet').setTitle('Bounding box');
						    Ext.getCmp('buttonFormPositionMap').disable();
							Ext.getCmp('abstractAreaField').labelEl.update('Abstract');
							Ext.getCmp('buttonFormAbstract').disable();
						}
					}
			},
			columns: [
			
			//'AUTHOR','TITLE', 'PUB_NAME','START_PAGE','END_PAGE','VOL','YEAR','YEAR2','PUBLISHER','LINK','DOI','PLACE','NCA', 'SOURCE']
			{
				dataIndex: 'id',
				//flex: 1,
				text: 'ID'
			},
			{
				dataIndex: 'AUTHOR',
				//flex: 1,
				text: 'AUTHOR',
				allowBlank: false/*,
				field: {
					type: 'textfield',
					allowBlank: false
				}*/
			},
			{
				dataIndex: 'TITLE',
				//flex: 1,
				text: 'TITLE',
				allowBlank: false/*,
				field: {
					type: 'textfield',
					allowBlank: false
				}*/
			},
			{
				dataIndex: 'PUB_NAME',
				//flex: 1,
				text: 'PUBLICATION',
				allowBlank: true/*,
				field: {
					type: 'textfield',
					allowBlank: true
				}*/
			},
			{
				dataIndex: 'START_PAGE',
				//flex: 1,
				text: 'START_PAGE',
				allowBlank: true/*,
				field: {
					type: 'textfield',
					allowBlank: true
				}*/
			},
			{
				dataIndex: 'END_PAGE',
				//flex: 1,
				text: 'END_PAGE',
				allowBlank: true/*,
				field: {
					type: 'textfield',
					allowBlank: true
				}*/
			},
			{
				dataIndex: 'VOL',
				//flex: 1,
				text: 'VOLUME',
				allowBlank: true/*,
				field: {
					type: 'textfield',
					allowBlank: true
				}*/
			},
			{
				dataIndex: 'YEAR',
				//flex: 1,
				text: 'YEAR',
				allowBlank: true/*,
				field: {
					type: 'textfield',
					allowBlank: true
				}*/
			},
			{
				dataIndex: 'YEAR2',
				//flex: 1,
				text: 'YEAR2',
				allowBlank: true/*,
				field: {
					type: 'textfield',
					allowBlank: true
				}*/
			},
			{
				dataIndex: 'PUBLISHER',
				//flex: 1,
				text: 'PUBLISHER',
				allowBlank: true/*,
				field: {
					type: 'textfield',
					allowBlank: true
				}*/
			},
			{
				dataIndex: 'LINK',
				//flex: 1,
				text: 'LINK',
				allowBlank: true/*,
				field: {
					type: 'textfield',
					allowBlank: true
				}*/
			},
			{
				dataIndex: 'DOI',
				//flex: 1,
				text: 'DOI',
				allowBlank: true/*,
				field: {
					type: 'textfield',
					allowBlank: true
				}*/
			},		
			{			
				dataIndex: 'PLACE',			
				//flex: 1,
				text: 'PLACE'		
				/*,editor: {   ////these editors )place, nca and source) were here to insert the dropdown menu, now data is managed by the form
					xtype: 'combobox',
					itemId: "comboboxPlace",
					allowBlank: false,
					emptyText : "connecting to database",
					//valueNotFoundText : "connecting to database",
					forceSelection: true,
					typeAhead: true,
					typeAheadDelay:250,
					queryMode: 'remote',				
					displayField: 'NAME',
					valueField: 'NAME',
					triggerAction: 'all',
					selectOnTab: true,
					store: storePlace,
					//??? don't understand their use
					lazyRender: true,
					listClass: 'x-combo-list-small',
					listeners:{
					
					}
				}*/
			}		
			,{			
				dataIndex: 'NCA',			
				//flex: 1,
				text: 'NCA'/*,		
				editor: {
					xtype: 'combobox',
					itemId: "comboboxNCA",
					allowBlank: false,
					emptyText : "connecting to database",
					//valueNotFoundText : "connecting to database",
					forceSelection: true,
					typeAhead: true,
					typeAheadDelay:250,
					queryMode: 'remote',				
					displayField: 'NAME',
					valueField: 'NAME',
					triggerAction: 'all',
					selectOnTab: true,
					store: storeNCA,
					//??? don't understand their use
					lazyRender: true,
					listClass: 'x-combo-list-small'				
				}*/
			},
			{			
				dataIndex: 'SOURCE',			
				//flex: 1,
				text: 'SOURCE'		
				/*,editor: {
					xtype: 'combobox',
					itemId: "comboboxSource",
					allowBlank: false,
					emptyText : "connecting to database",
					//valueNotFoundText : "connecting to database",
					forceSelection: true,
					typeAhead: true,
					typeAheadDelay:250,
					queryMode: 'remote',				
					displayField: 'NAME',
					valueField: 'NAME',
					triggerAction: 'all',
					selectOnTab: true,
					store: storeSource,
					//??? don't understand their use
					lazyRender: true,
					listClass: 'x-combo-list-small'				
				}*/
			}
			]/*,
			plugins: [       
				rowEditing    ///i put editing in the form
			],
			*/		
			,dockedItems: [{      //insert buttons ar the top
				xtype: 'toolbar',
				dock: 'top',
				//creating, add items
				items: [ buttonAdd, buttonDelete, buttonRefresh]
			}]
			
			/*,renderTo: Ext.getBody()*/  //now the  grid is a form child   
													
        });
	
/////////the grid for the LEVEL1  table
	
	//TODO: fix buttons
    //buttons for adding deleting rows LEVEL1
	var buttonAddLevel1 = Ext.create('Ext.Button', {
				//reference to a css file
				iconCls: 'add',
				text: 'Add',
				
				//TODO: fix this
				handler: function() {
				//rowEditing.cancelEdit();				
				buttonDeleteLevel1.disable();				
				
				//unselect rows
				//Ext.getCmp('grid').getSelectionModel().deselectAll(true);	
				
				/*var record=Ext.create('LEVEL1');
				record.data.PLACE="connecting to database";
				record.data.NCA="connecting to database";
				record.data.SOURCE="connecting to database";
				//getting the first value from the database tables (PLACE,NCA,LOCATION)
				////maybe this is not a good way to do things.....*/
										
				//insert new row at top
				//storeLevel1.insert(0,record);
				//start edit at row 0
				//rowEditingLevel1.startEdit(0,0);
				
				}			
	});
		
	//be careful here because in the final version you should disable deleting if there are  linked database records
	var buttonDeleteLevel1 = Ext.create('Ext.Button',{
				iconCls: 'delete',
				text: 'Delete',
				disabled: true,
				handler: function() {
					
					//rowEditing.cancelEdit();
					
					//////debug variable
					//selection=sm;
										
					Ext.Msg.show({
						title:"Delete record",
						msg: "You are deleting a record permanently, this cannot be undone. Proceed?",
						buttons:Ext.Msg.YESNO,
						icon: Ext.Msg.QUESTION,
						fn: function(btn){
							if (btn==="yes"){
							//select the first record and send to database, check that I do not inserted it now
							
							//TODO: fix here
							if (sm.getSelection()[0].data.id!=""){
								//storeLevel1.proxy.api.destroy(sm.getSelection()[0].data);
							}
							
							//storeLevel1.remove(sm.getSelection());					
							//storeLevel1.sync();	

							buttonDeleteLevel1.disable();
							}
						}
					});
					}					
				
			});
			
	// reload data from database
	var buttonRefreshLevel1 = Ext.create('Ext.Button',{
				iconCls: 'refresh',
				text: 'Refresh connection',
				handler: function() {
				
				//TODO: fix here
				
				//cancel editing and disable button delete
					
					//rowEditing.cancelEdit();
					
					
					/////gridForm.child('gridpanel').getSelectionModel().select(0);
					
					//reset form and set buttonForm text					
					//newRow=true;
					
					buttonDeleteLevel1.disable();
					
					//storeLevel1.load();					
					}				
	});	
	
	
	//TODO: fix this
	var rowEditingLevel1 = Ext.create('Ext.grid.plugin.RowEditing', {
		clicksToMoveEditor: 1,
		autoCancel: false
		/*,listeners:{
		 beforeedit: function(editor, e, eOpts ){
			//console.log("Before editing");
			//console.log(editor.record.data.PLACE);
			
			Ext.ComponentQuery.query('combobox[itemId="comboboxPlace"]').setValue(editor.record.data.PLACE);
			
		 }		 
		}*/
	});
	
	var level1Grid= Ext.create('Ext.grid.Panel',{
			//columnWidth: 0.60,
			itemId: "gridLevel1",
			id: "gridLevel1",
			autoScroll: true,
			flex: 1,
			//height: 320,
			//width: 450,
			//title: 'Level1',
			store: storeLevel1,		
			listeners: {},
			columns: [{
				dataIndex: 'id',
				//flex: 1,
				text: 'ID'
			},{
				dataIndex: 'NAME',
				//flex: 1,
				text: 'NAME',
				/*editor: {      ////TODO: you should insert the editing functionalities, look at the cell editing tools also
                xtype: 'combobox',
                itemId: "comboboxType",
				allowBlank: false,
				//default value for the combo box
				emptyText : "connecting to database",
				//valueNotFoundText : "connecting to database",
				
				//can select only from the list
				forceSelection: true,
				//populate and autoselect the remaining text being typed after a configurable delay
				typeAhead: true,
				//delay to populate the list (default=250)
				typeAheadDelay:250,
				//remote or local query, default is remote
				queryMode: 'remote',
				
				//The name of the field in the grid's Ext.data.Store's Ext.data.Model definition from which to draw the column's value
                //???? is required????
				//dataIndex: 'id',
								
				//the combobox display the NAME of the type 
				
				////but the underline value is id (need this because of the foreign key to store in the article table)
				//The underlying data field name to bind to this ComboBox
				
				////displayField: 'NAME',
				
				displayField: 'NAME',
				
				//The underlying data value name to bind to this ComboBox (defaults to match the value of the displayField config).
				//valueField: 'IDT1',
				valueField: 'NAME',
				
				//The action to execute when the trigger is clicked (default 'all' =run the query specified by the allQuery config option (default = ""))
				triggerAction: 'all',
                
				//Whether the Tab key should select the currently highlighted item
				selectOnTab: true,
                store: storeNCA,
				
				//??? don't understand their use
				lazyRender: true,
                listClass: 'x-combo-list-small'
				
            }*/
			}],
				plugins: [
					rowEditingLevel1   //TODO: what about cell editing?
			]
			,dockedItems: [{   //buttons at the top
				xtype: 'toolbar',
				dock: 'top'
				//creating, add items
				//TODO: dreate buttons
				,items: [ buttonAddLevel1, buttonDeleteLevel1, buttonRefreshLevel1]
			}]
	});
	
/////////the grid for the LEVEL2  table	

	//buttons for adding deleting rows LEVEL2
	var buttonAddLevel2 = Ext.create('Ext.Button', {
				//reference to a css file
				iconCls: 'add',
				text: 'Add',
				
				//TODO: fix this
				handler: function() {
				//rowEditing.cancelEdit();				
				buttonDeleteLevel2.disable();				
				
				//unselect rows
				//Ext.getCmp('grid').getSelectionModel().deselectAll(true);	
				
				/*var record=Ext.create('LEVEL2');
				record.data.PLACE="connecting to database";
				record.data.NCA="connecting to database";
				record.data.SOURCE="connecting to database";
				//getting the first value from the database tables (PLACE,NCA,LOCATION)
				////maybe this is not a good way to do things.....*/
										
				//insert new row at top
				//storeLevel2.insert(0,record);
				//start edit at row 0
				//rowEditingLevel2.startEdit(0,0);
				
				}			
	});
		
	//be careful here because in the final version you should disable deleting if there are  linked database records
	var buttonDeleteLevel2 = Ext.create('Ext.Button',{
				iconCls: 'delete',
				text: 'Delete',
				disabled: true,
				
				//TODO: fix this
				handler: function() {
					
					//rowEditing.cancelEdit();
					
					//var sm=Ext.getCmp('grid').getSelectionModel();
					
					//////debug variable
					//selection=sm;
										
					Ext.Msg.show({
						title:"Delete record",
						msg: "You are deleting a record permanently, this cannot be undone. Proceed?",
						buttons:Ext.Msg.YESNO,
						icon: Ext.Msg.QUESTION,
						fn: function(btn){
							if (btn==="yes"){
							//select the first record and send to database, check that I do not inserted it now
							if (sm.getSelection()[0].data.id!=""){
									//storeLevel2.proxy.api.destroy(sm.getSelection()[0].data);
							}
							//storeLevel2.remove(sm.getSelection());					
							//storeLevel2.sync();	

							// clean the form and set buttontext
							//newRow=true;
							buttonDeleteLevel2.disable();
							}
						}
					});
					}					
				
			});
			
	// reload data from database
	var buttonRefreshLevel2 = Ext.create('Ext.Button',{
				iconCls: 'refresh',
				text: 'Refresh connection',
				handler: function() {
				//cancel editing and disable button delete
					
					//rowEditing.cancelEdit();
					
					
					/////gridForm.child('gridpanel').getSelectionModel().select(0);
					
					//reset form and set buttonForm text
					
					//newRow=true;
					
					buttonDeleteLevel2.disable();
					
					//storeLevel2.load();					
					}				
	});	
				
	var level2Grid= Ext.create('Ext.grid.Panel',{		
			//columnWidth: 0.60,
			itemId: "gridLevel2",
			id: "gridLevel2",
			autoScroll: true,
			flex: 1,
			//height: 320,
			//width: 450,
			//title: 'Level2',
			store: storeLevel2,		
			listeners: {},
			columns: [{
				dataIndex: 'id',
				//flex: 1,
				text: 'ID'
			},{
				dataIndex: 'NAME',
				//flex: 1,
				text: 'NAME'
				/*editor: {
                xtype: 'combobox',
                itemId: "comboboxType",
				allowBlank: false,
				//default value for the combo box
				emptyText : "connecting to database",
				//valueNotFoundText : "connecting to database",
				
				//can select only from the list
				forceSelection: true,
				//populate and autoselect the remaining text being typed after a configurable delay
				typeAhead: true,
				//delay to populate the list (default=250)
				typeAheadDelay:250,
				//remote or local query, default is remote
				queryMode: 'remote',
				
				//The name of the field in the grid's Ext.data.Store's Ext.data.Model definition from which to draw the column's value
                //???? is required????
				//dataIndex: 'id',
								
				//the combobox display the NAME of the type 
				
				////but the underline value is id (need this because of the foreign key to store in the article table)
				//The underlying data field name to bind to this ComboBox
				
				////displayField: 'NAME',
				
				displayField: 'NAME',
				
				//The underlying data value name to bind to this ComboBox (defaults to match the value of the displayField config).
				//valueField: 'IDT1',
				valueField: 'NAME',
				
				//The action to execute when the trigger is clicked (default 'all' =run the query specified by the allQuery config option (default = ""))
				triggerAction: 'all',
                
				//Whether the Tab key should select the currently highlighted item
				selectOnTab: true,
                store: storeNCA,
				
				//??? don't understand their use
				lazyRender: true,
                listClass: 'x-combo-list-small'
				
            }*/
			}
			]
			,
			plugins: [
					rowEditingLevel1  //TODO: cell editing???
			]		
			,dockedItems: [{    //insert button at the top
				xtype: 'toolbar',
				dock: 'top'
				//creating, add items
				//TODO: dreate buttons
				,items: [ buttonAddLevel2, buttonDeleteLevel2, buttonRefreshLevel2]
			}]
	});
		
	
	
	
	//create a sub panel to contain the middle right layout
	/*var panelMidRight=Ext.create('Ext.panel.Panel',{
		id: "middleRightPanel",		
		itemId:"middleRightPanel",	
		//height: 230,
		//border:5,
		flex: 1
	});*/
			
	
	
	//create a sub panel to contain the middle left layout, it contains the abstract form
	/*var panelMidLeft=Ext.create('Ext.panel.Panel',{
		id: "middleLeftPanel",
		itemId:"middleLeftPanel",
		//height: 230,
		//border:5,
		flex: 1,
		layout: {
			type: 'vbox'       // Arrange child items vertically
			// Each takes up full width
			,align: 'stretch'
			//,padding: 5
			},
		items: [{
			xtype: 'form',	
			frame:true,
			//title: 'Astract',
			//bodyStyle:'padding:5px 5px 0',
			id: "formAbstract",
			itemId:"formAbstract",
			flex:1,
			api: {  
				   // this is for updating/creating rows
				   load: Ext.ss.QueryPostGISArticle.loadFormAbstract,
				   submit: Ext.ss.QueryPostGISArticle.updateFormAbstract 
			},
			paramOrder: ['id'],  //this is used by forms to specify the parameters (because only the value is sent)		
			fieldDefaults: {
				labelAlign: 'top',
				msgTarget: 'side'
			},		
			items: [{
				xtype: 'textareafield',
				name: 'TEXT',
				fieldLabel: 'Abstract',
				height: 250,
				anchor: '100%'
			}],
			buttons: [{
				text: 'Update',
				itemId: "buttonFormAbstract",
				id: "buttonFormAbstract",
				handler: function() {
				
					var formAb =Ext.getCmp('formAbstract').getForm();
		
					//abilitate sending
					var send=true
										  
					//create a new abstract object to store the abstract
					var newAbstract={};
					//get form data and create an object
					  Ext.iterate(formAb.getValues(), function(key, value) {
							newAbstract[key]=value;
						}, this);
					  	
					//confront the new abstract with the bstract stored when loading the form (if are the same to update is necessary) 
					 if (objectsAreSame(oldAbstract, newAbstract))
					  {send=false;}
					  					
					//update a valid form
					if (formAb.isValid() && send) {						
						formAb.submit({
							success : onSuccessOrFailAbstractUpdate,
							failure : onSuccessOrFailAbstractUpdate
							}
						);              
					}
	
				}			
			}]//end buttons
			}]//end items			
	});*/
			
	//create a sub panel to contain the middle left layout
	var panelMid=Ext.create('Ext.panel.Panel',{
		id:"middlePanel",
		itemId:"middlePanel",
		height: 330,
		border:0,
		layout: {
			type: 'hbox'       // Arrange child items horizontally
			// Each takes up full width
			,align: 'stretch'
			//,padding: 5
			},
			items: [
			//panelMidLeft,
			{
			xtype: 'form',
			frame:true,
			//title: 'Astract',
			//bodyStyle:'padding:5px 5px 0',
			id: "formAbstract",
			itemId:"formAbstract",
			flex:1,
			api: {  
				   // this is for updating/creating rows
				   load: Ext.ss.QueryPostGISArticle.loadFormAbstract,
				   submit: Ext.ss.QueryPostGISArticle.updateFormAbstract 
			},
			paramOrder: ['id'],  //this is used by forms to specify the parameters (because only the value is sent)		
			fieldDefaults: {
				labelAlign: 'top',
				msgTarget: 'side'
			},		
			items: [{
				xtype: 'textareafield',
				name: 'TEXT',
				id:'abstractAreaField',
				itemId:'abstractAreaField',
				fieldLabel: 'Abstract',
				height: 250,
				anchor: '100%'
			}],
			buttons: [{
				text: 'Update',
				itemId: "buttonFormAbstract",
				id: "buttonFormAbstract",
				disabled:true,
				handler: function() {
				
					var formAb =Ext.getCmp('formAbstract').getForm();
		
					//abilitate sending
					var send=true
										  
					//create a new abstract object to store the abstract
					var newAbstract={};
					//get form data and create an object
					  Ext.iterate(formAb.getValues(), function(key, value) {
							newAbstract[key]=value;
						}, this);
					  	
					//confront the new abstract with the bstract stored when loading the form (if are the same to update is necessary) 
					 if (objectsAreSame(oldAbstract, newAbstract))
					  {send=false;}
					  					
					//update a valid form
					if (formAb.isValid() && send) {						
						formAb.submit({
							success : onSuccessOrFailAbstractUpdate,
							failure : onSuccessOrFailAbstractUpdate
							}
						);              
					}
	
				}			
			}]//end buttons
			},		
			{
			xtype: 'tabpanel',
			id: "middleRightTabPanel",		
			itemId:"middleRightTabPanel",
			activeTab: 0, // index or id
			flex:1,
			items:[{
				title: 'Level1',
				items: [level1Grid]
			},{
				title: 'Level2',
				items: [level2Grid]
			},
			{
				//title: 'Position',
				//html: 'Content',
				title: 'Spatial+Images',
				//flex:1,
				layout: 'accordion',
				id: "middleRightAccordion",		
				itemId:"middleRightAccordion",
				items:[{
						title: 'Location',
						xtype: 'form',	
						frame:true,
						//title: 'Astract',
						//bodyStyle:'padding:5px 5px 0',
						id: "formLocation",
						itemId:"formLocation",
						flex:1,
						api: {  
							   // this is for updating/creating rows
							   load: Ext.ss.QueryPostGISArticle.loadFormLocation,
							   submit: Ext.ss.QueryPostGISArticle.updateFormLocation 
						},
						paramOrder: ['id'],								
						items: [{
							xtype: 'fieldset',
							id: 'boundingBoxFieldSet',
							title:'Bounding box',             
							margin: '0 0 0 10',
							defaultType: 'textfield',
							defaults: {
								width: 240,
								labelWidth: 130
							},

							//TODO: put validation to insert only decimal numbers
							items: [{		
								name: 'TLX',
								fieldLabel: 'Top-left long (X)',
								id: 'TLX',		
								itemId:'TLX',
								//vtype: 'coordinateX'
								readOnly: true
							},
							{
								name: 'TLY',
								id: 'TLY',		
								itemId:'TLY',
								fieldLabel: 'Top-left lat (Y)',
								//vtype: 'coordinateY'
								readOnly: true
								
							},
							{
								name: 'BRX',
								id: 'BRX',		
								itemId:'BRX',
								fieldLabel: 'Bottom-right long (X)',
								//vtype: 'coordinateX'
								readOnly: true	
							},
							{
								name: 'BRY',
								id: 'BRY',		
								itemId:'BRY',
								fieldLabel: 'Bottom-right lat (Y)',
								//vtype: 'coordinateY'
								readOnly: true
							}]
						}],
						buttons: [{
							text: 'Update',
							itemId: "buttonFormPosition",
							id: "buttonFormPosition",
							disabled:true,
							handler: function() {
							
								
								//TODO: update position
								/*var formAb =	Ext.getCmp('formAbstract').getForm();
					
								var send=true
													  
								 var newAbstract={};
								  
								  //get form data and create an object
								  Ext.iterate(formAb.getValues(), function(key, value) {
										newAbstract[key]=value;
									}, this);
								  
				
								//TODO: create the object with the form data  when you loasd the form 
								  if (objectsAreSame(oldAbstract, newAbstract))
								  {send=false;}
													
								if (formAb.isValid() && send) {
									
									formAb.submit({
										success : onSuccessOrFailAbstractUpdate,
										failure : onSuccessOrFailAbstractUpdate
										}
									);              
								}*/
				
							 }
							},{
								text: 'Map',
								itemId: "buttonFormPositionMap",
								id: "buttonFormPositionMap",
								disabled: true,
								handler: function() {
								//TODO: open the window with the map
								if (!win) {
								win = Ext.create('widget.window', {
									id: "locationwindow",
									itemId: "locationwindow",
									title: 'Map window',
									closable: true,
									closeAction: 'hide',
									draggable:false,
									modal: true,
									hideMode:'offsets',
									width: 1000,
									height: 750,
									//minWidth: 400,
									//maxWidth: 600,
									//maxHeight: 600,
									//modal : true,
									resizable :false,
									//layout: 'border',
									bodyStyle: 'padding: 5px;',
									layout: {
										type: 'vbox'       // Arrange child items vertically
										// Each takes up full width
										,align: 'stretch'
										//,padding: 5
									},
									listeners:{
										 afterrender: function(window,e){
											console.log("window is rendered");
											
											//set the height of the form
											Ext.getCmp('fieldsetBoundingBox').setHeight(Ext.getCmp('formBoundingBox').getHeight()-10);
																			
											
											proj = new OpenLayers.Projection("EPSG:4326");
											proj900913=new OpenLayers.Projection("EPSG:900913");
											var maxExtent = new OpenLayers.Bounds(-20037508, -20037508, 20037508, 20037508), restrictedExtent = maxExtent.clone(), maxResolution = 156543.0339;
											
											var options = {
												projection: new OpenLayers.Projection("EPSG:900913"),
												displayProjection: new OpenLayers.Projection("EPSG:4326"),
												units: "m",
												numZoomLevels: 18,
												maxResolution: maxResolution,
												maxExtent: maxExtent,
												restrictedExtent: restrictedExtent			     
											};
																												
											map = new OpenLayers.Map("mapWindow-body",options);

											//DEBUG
											mappa=map;
											
											// allow testing of specific renderers via "?renderer=Canvas", etc
											//var renderer = OpenLayers.Util.getParameters(window.location.href).renderer;
											//renderer = (renderer) ? [renderer] : OpenLayers.Layer.Vector.prototype.renderers;
											
											var renderer = OpenLayers.Layer.Vector.prototype.renderers;
											
											
											//TODO: put other better maps
											/*var ol_wms = new OpenLayers.Layer.WMS(
												"OpenLayers WMS",
												"http://vmap0.tiles.osgeo.org/wms/vmap0",
												{layers: "basic"}
											);*/
											
											var baseMap = new OpenLayers.Layer.OSM("Open Street Map");
											
											var road = new OpenLayers.Layer.Bing({
												key: apiKey,
												type: "Road",
												name: "Road"/*,
												// custom metadata parameter to request the new map style - only useful
												// before May 1st, 2011
												metadataParams: {mapVersion: "v1"}*/
											});
											var aerial = new OpenLayers.Layer.Bing({
												key: apiKey,
												type: "Aerial",
												name: "Aerial"
											});
											var hybrid = new OpenLayers.Layer.Bing({
												key: apiKey,
												type: "AerialWithLabels",
												name: "Aerial With Labels"
											});
											
											
											//this is the layer contaning the bounding box
											polygonLayer = new OpenLayers.Layer.Vector("Bounding box", {
												styleMap: new OpenLayers.StyleMap({
													// a nice style for the transformation box
													"transform": new OpenLayers.Style({
														display: "${getDisplay}",
														cursor: "${role}",
														pointRadius: 5,
														fillColor: "white",
														fillOpacity: 1,
														strokeColor: "black"
													}, {
														context: {
															getDisplay: function(feature) {
																// hide the resize handle at the south-east corner
																return feature.attributes.role === "se-resize" ? "none" : "";
															}
														}
													}),
													"rotate": new OpenLayers.Style({
														display: "${getDisplay}",
														pointRadius: 10,
														fillColor: "#ddd",
														fillOpacity: 1,
														strokeColor: "black"
													}, {
														context: {
															getDisplay: function(feature) {
																// only display the rotate handle at the south-east corner
																return feature.attributes.role === "se-rotate" ? "" : "none";
															}
														}
													})
												}),
												renderers: renderer,  //TODO: how this work?
												displayInLayerSwitcher:false
											});
											
											//DEBUG 
											pol=polygonLayer
											
											//map.addLayers([ol_wms, polygonLayer]);
											
											map.addLayers([baseMap,road,aerial,hybrid, polygonLayer]);
											
											//map.addControl(new OpenLayers.Control.LayerSwitcher());
											
											//map.zoomToMaxExtent();
											
											map.addControl(new OpenLayers.Control.MousePosition());
											
											//this control is used to draw a bounding box
											polyOptions = {sides: 4 , irregular: true,};								
											polygonControl = new OpenLayers.Control.DrawFeature(polygonLayer,
																OpenLayers.Handler.RegularPolygon, 
																{handlerOptions: polyOptions,
																callbacks:{
																		create:function(a){
																			
																			//unset features from the transform control and clear the polygon layer if there is already a bounding box
																			
																			if(transformControl){
																			transformControl.unsetFeature();
																			transformControl.hasFeature=false;
																
																			}
																			//remove listeners for the form fields
																			removeFormFieldListeners();
																			
																			polygonLayer.destroyFeatures();
																			
																			console.log('create feature');
																			console.log(a);
																																						
																			//console.log(c);
																		}/*,
																		done:function(a){
																			console.log('done feature');
																			console.log(a);
																			//console.log(b);
																			//console.log(c);
																		},
																		cancel:function(a){
																			console.log('cancel feature');
																			//console.log(a);
																			//console.log(b);
																			//console.log(c);
																		}*/
																},
																featureAdded: function(a){
																	
																	console.log('added feature');
																	//console.log(a);
																	console.log(a.geometry.bounds.bottom);
																																																			
																	//set the new feature to the transform control
																	transformControl.setFeature( a, {rotation: 0, scale: 1.0, ratio: 1.0});
																	transformControl.hasFeature=true;
																	
																	//go to wgs84
																	var bounds=a.geometry.bounds.transform(proj900913,proj);

																	//fill the fields with the coordinates
																	Ext.getCmp('BRYField').setValue(bounds.bottom);
																	console.log(a.geometry.bounds.top);
																	Ext.getCmp('TLYField').setValue(bounds.top);
																	console.log(a.geometry.bounds.left);
																	Ext.getCmp('TLXField').setValue(bounds.left);
																	console.log(a.geometry.bounds.right);
																	Ext.getCmp('BRXField').setValue(bounds.right);
																	Ext.getCmp('buttonLocationPan').toggle();
																	
																	oldBRYField=parseFloat(bounds.bottom);
																	oldTLYField=parseFloat(bounds.top);
																    oldTLXField=parseFloat(bounds.left);
																	oldBRXField=parseFloat(bounds.right);
																																																
																	// go back to mercator
																	var bounds=a.geometry.bounds.transform(proj,proj900913);
																	//activate listeners for the form field
																	addFormFieldListeners();
																	//enable update button 
																	Ext.getCmp('buttonLocationUpdate').enable();																	
																}}
																);					
											map.addControl(polygonControl);
											
											//debug
											polControl=polygonControl;
																					
											// create the TransformFeature control, using the renderIntent
											// from above
											transformControl = new OpenLayers.Control.TransformFeature(polygonLayer, {
												renderIntent: "transform",
												rotationHandleSymbolizer: "rotate",
												//feature cannot rotate
												rotate: false,
												eventListeners:{
													"transform":function (a,b,c){
														console.log('transforming');
														console.log(a.object.feature.geometry.bounds);
														
														//disable the change handler for the form																												
														removeFormFieldListeners();
																												
														var bounds=a.object.feature.geometry.bounds.transform(proj900913,proj);															
														//store field values
														Ext.getCmp('BRYField').setValue(bounds.bottom);
														Ext.getCmp('TLYField').setValue(bounds.top);
														Ext.getCmp('TLXField').setValue(bounds.left);
														Ext.getCmp('BRXField').setValue(bounds.right);														
																												
													},
													"transformcomplete": function (a,b,c){
														console.log('transform complete');
														console.log(a.feature.geometry.bounds);
																											
														//set the form fields
														Ext.getCmp('BRYField').setValue(a.feature.geometry.bounds.bottom);
														Ext.getCmp('TLYField').setValue(a.feature.geometry.bounds.top);
														Ext.getCmp('TLXField').setValue(a.feature.geometry.bounds.left);
														Ext.getCmp('BRXField').setValue(a.feature.geometry.bounds.right);

														//store field values
														oldBRYField=parseFloat(a.feature.geometry.bounds.bottom);
														oldTLYField=parseFloat(a.feature.geometry.bounds.top);
														oldTLXField=parseFloat(a.feature.geometry.bounds.left);
														oldBRXField=parseFloat(a.feature.geometry.bounds.right);
																												
														//go to mercator
														var bounds=a.feature.geometry.bounds.transform(proj,proj900913);	
														
														//activate listeners for the form fields
														addFormFieldListeners();																												
													}				
												}
											});
											
											//DEBUG
											transf=transformControl;
											//nothing drawn now
											transformControl.hasFeature=false;
																						
											map.addControl(transformControl);
											//add kinetic drag
											map.addControl(new OpenLayers.Control.Navigation({dragPanOptions: {enableKinetic: true}}));											
											map.addControl(new OpenLayers.Control.LayerSwitcher);
											map.setCenter(new OpenLayers.LonLat(-2.0, 54.0).transform(proj, proj900913), 5);
																							
										},
										show: function(component,eOpts){
											console.log("window show");
											transformControl.hasFeature=false;
											updatingMap=false;
											removeFormFieldListeners();
											Ext.getCmp('BRYField').setValue(Ext.getCmp('BRY').getValue());
											Ext.getCmp('TLYField').setValue(Ext.getCmp('TLY').getValue());
											Ext.getCmp('TLXField').setValue(Ext.getCmp('TLX').getValue());
											Ext.getCmp('BRXField').setValue(Ext.getCmp('BRX').getValue());
											addFormFieldListeners();
											var formBox=Ext.getCmp('formBoundingBox').getForm();
											if	(formBox.isValid()){modifyBox(0,0,0,0,0,0);}
												console.log('formBox is '+formBox.isValid());
										},
										hide:function(component,eOpts){
											console.log("window hide");
											//update location text on the main UI
											if(transformControl.hasFeature && updatingMap){
												Ext.getCmp('BRY').setValue(Ext.getCmp('BRYField').getValue());
												Ext.getCmp('TLY').setValue(Ext.getCmp('TLYField').getValue());
												Ext.getCmp('TLX').setValue(Ext.getCmp('TLXField').getValue());
												Ext.getCmp('BRX').setValue(Ext.getCmp('BRXField').getValue());												
											}
											if(transformControl.hasFeature){
											     //delete the feature
												transformControl.hasFeature=false;
												transformControl.unsetFeature();																										
												polygonLayer.destroyFeatures();												
												//trigger validation (doesnotwork!) (therefore i deleted the check)
												//Ext.getCmp('formLocation').getForm().isValid();
												//enable the button to update database
												Ext.getCmp('buttonFormPosition').enable();
											}
										}
									},																									
									items: [
										{											
											//html: '<br/><center><b>&nbsp;Click twice on the map to insert the location boundaries</b></center>',
											//flex:1
											xtype: 'form',	
											frame:true,
											//title: 'Astract',
											//bodyStyle:'padding:5px 5px 0',
											id: "formBoundingBox",
											itemId:"formBoundingBox",
											flex:3,
											api: {  
												   // this is for updating/creating rows
												   load: Ext.ss.QueryPostGISArticle.loadFormLocation,
												   submit: Ext.ss.QueryPostGISArticle.updateFormLocation 
											},
											paramOrder: ['id'],										
											items: [										
											{
											xtype: 'fieldset',
											id: "fieldsetBoundingBox",
											itemId:"fieldsetBoundingBox",
											title:'Bounding box',
											//height: Ext.getCmp('formBoundingBox').getHeight(),
											//width: 800,
											//collapsible: true,
											defaults: {
												labelWidth: 89,
												//anchor: '100%',
												layout: {
													type: 'hbox',
													defaultMargins: {top: 0, right: 0, bottom: 0, left: 30}
												}
											},
											items: [
																		
													{
													xtype: 'fieldcontainer',
													id: 'fieldContainerX',
													itemId:'fieldContainerX',
													combineErrors: true,
													msgTarget: 'under',
													defaults: {
														//hideLabel: true
														xtype: 'textfield',
														width: 240,
														labelWidth: 130,
														//this is necessary for the listener
														enableKeyEvents: true,
														listeners:{
															change: changeFieldContainer
																														
														}
													},
													items: [
														{	
															name: 'TLX',
															id: "TLXField",
															itemId:"TLXField",
															fieldLabel: 'Top-left long (X)',
															vtype: 'coordinateX',
															bottomRightX: 'BRXField',
															allowBlank: false
														},
														{
															name: 'BRX',
															id: 'BRXField',
															itemId:"BRXField",
															fieldLabel: 'Bottom-right long (X)',
															vtype: 'coordinateX',
															topLeftX:'TLXField',
															allowBlank: false
														}
													]
												},
												{
													xtype: 'fieldcontainer',
													id: 'fieldContainerY',
													itemId:'fieldContainerY',
													combineErrors: true,
													msgTarget: 'under',
													defaults: {
														//hideLabel: true
														xtype: 'textfield',
														width: 240,
														labelWidth: 130,
														//this is necessary for the listener
														enableKeyEvents: true,
														listeners:{
															change: changeFieldContainer
														}
													},
													items: [
														{
															name: 'TLY',
															id: "TLYField",
															itemId:"TLYField",
															fieldLabel: 'Top-left lat (Y)',
															vtype: 'coordinateY',
															bottomRightY:'BRYField',
															allowBlank: false
														},
														{
															name: 'BRY',
															id: 'BRYField',
															itemId:"BRYField",
															fieldLabel: 'Bottom-right lat (Y)',
															vtype: 'coordinateY',
															topLeftY:'TLYField',
															allowBlank: false
														}
													]
												}   
										]}
		
										]											
										}, {
											id: "mapWindow",
											itemId: "mapWindow",											
											//html: '<div id="map" class="smallmap"></div>',
											flex:10,
											buttons: [												
												{ 
												itemId: 'buttonLocationPan',
												id: 'buttonLocationPan',									
												scale: 'large',
												width: 32,
												height: 40,
												iconCls: 'panMap',
												text: 'Pan',
												enableToggle :true,
												pressed : true,
												toggleGroup : 'toggleGroup',
												/*handler: function(){
												 console.log("clear map");
												 //deactivate other button
												 Ext.getCmp('buttonLocationUpdate').enable(false);
												}*/
												toggleHandler : function(button, state){
												 console.log("pan: "+state);
												  if(state){		
													polygonControl.deactivate();
													}else{Ext.getCmp('buttonLocationDraw').toggle(true);}
												}
												
												},
												{ 
												itemId: 'buttonLocationDraw',
												id: 'buttonLocationDraw',									
												scale: 'large',
												width: 32,
												height: 40,
												iconCls: 'drawMap',
												text: 'Draw',
												enableToggle :true,
												toggleGroup : 'toggleGroup',
												/*handler: function(){
												 console.log("clear map");
												 //deactivate other button
												 Ext.getCmp('buttonLocationUpdate').enable(false);
												}*/
												toggleHandler : function(button, state){
												 console.log("draw: "+state);												 
												 if(state){													 													 
													polygonControl.activate();																						 
													//if(transformControl){transformControl.unsetFeature();}													 
													}
													else{Ext.getCmp('buttonLocationPan').toggle(true);}
												}
												},
												{ 
												itemId: 'buttonLocationClear',
												id: 'buttonLocationClear',	
												scale: 'large',
												width: 32,
												height: 40,
												iconCls: 'clearMap',
												text: 'Clear',
												handler: function(){
													console.log("clear map");
													//deactivate other button
													
													if(transformControl){
													transformControl.unsetFeature();
													transformControl.hasFeature=false;
													}
													
													polygonLayer.destroyFeatures();
													
													Ext.getCmp('buttonLocationUpdate').disable();
													//clear fields
													Ext.getCmp('BRYField').setRawValue("");
													Ext.getCmp('TLYField').setRawValue("");
													Ext.getCmp('TLXField').setRawValue("");
													Ext.getCmp('BRXField').setRawValue("");
												}
												},
												{ 
												itemId: 'buttonLocationUpdate',
												id: 'buttonLocationUpdate',
												scale: 'large',
												width: 32,
												height: 40,
												iconCls: 'updateMap',
												text: 'Insert',
												disabled:true,
												handler: function(){
												console.log("update map");
												//TODO												
												var formBox=Ext.getCmp('formBoundingBox').getForm();
												if	(formBox.isValid()){
													updatingMap=true;
													//hide window
													Ext.getCmp("locationwindow").hide();																							
												}
												}
												}
												]
										}
										/*, {
											
											html: 'Hello world 3',
											flex:2
										}*/
									]
								});
								}
									
									if (win.isVisible()) {
										win.hide(this, function() {
											
										});
									} else {
										win.show(this, function() {
											
										});
									}
								}
							}]//end buttons
						}	
					,{
						title: 'Photos',
						id: 'panelPhotoManagement',
						//html: 'Content',
						layout:'fit',
						items: [
							{
								xtype: 'button',
								text   : 'Please select a record to manage the photos',
								itemId: "buttonPhotosManagement",
								id: "buttonPhotosManagement",
								disabled:true,
								handler: function() {																
									if (!winImages) {
										createWinImages();									
										}
										if (winImages.isVisible()) {
												winImages.hide(this, function() {
													
												});
											} else {
												table="PHOTO",
												Ext.getCmp('imageWindow').setTitle('Manage photos for ART_ID='+selectedID);
												winImages.show(this, function() {
													//TODO: open image management,send the article id and table name
												
												});
											}										
									}
							}
						]
				},{
						title: 'Maps',
						id: 'panelMapsManagement',
						layout:'fit',
						items: [
							{
								xtype: 'button',
								text   : 'Please select a record to manage the maps',
								itemId: "buttonMapsManagement",
								id: "buttonMapsManagement",
								disabled:true,
								handler: function() {							
									//TODO: open image management, send the article id and table name
									if (!winImages) {
										createWinImages();									
										}
										if (winImages.isVisible()) {
												winImages.hide(this, function() {													
												});
											} else {
												table="MAP",
												Ext.getCmp('imageWindow').setTitle('Manage maps for ART_ID='+selectedID);
												winImages.show(this, function() {
												//TODO: open image management,send the article id and table name
												
												});
											}										
									}
							}
						]
				}]
			}]//end tab panel
		}]
	});		
		//,items: [panelMidLeft,panelMidRight]	

	
				
	//create a sub panel to contain the middle left layout
	/*var panelBotLeft=Ext.create('Ext.panel.Panel',{
		id: "bottomLeftPanel",		
		//height: 230,
		//border:5,
		flex: 1,
		layout: {
			type: 'hbox'       // Arrange child items horizontally
			// Each takes up full width
			,align: 'stretch'
			//,padding: 5
			}
		,items: [formAbstract]	
	});*/
	
		
	//create a sub panel to contain the middle left layout
	/*var panelBotRight=Ext.create('Ext.panel.Panel',{
		id: "bottomRightPanel",		
		//height: 230,
		//border:5,
		flex: 1,
		layout: 'accordion',
		items:[{
				title: 'Position',
				html: 'Content'
			},{
				title: 'Photos',
				id: 'panel2',
				html: 'Content'
		},{
				title: 'Maps',
				id: 'panel3',
				html: 'Content'
		}]	
	});*/
	
			
	//create a sub panel to contain the bottom left layout
	/*var panelBottom=Ext.create('Ext.panel.Panel',{
		id: "bottomPanel",		
		height: 165,
		border:0,
		layout: {
			type: 'hbox'       // Arrange child items vertically
			// Each takes up full width
			,align: 'stretch'
			//,padding: 5
			}
		,items: [formAbstract]	
	});*/
		
	//create a main panel to contain the left layout
	var panelMain=Ext.create('Ext.panel.Panel',{
		id: "mainPanel",
		itemId: "mainPanel",
		columnWidth: 0.60,
		height: 650,
		//border:5,
		layout: {
			type: 'vbox'       // Arrange child items vertically
			// Each takes up full width
			,align: 'stretch'
			//,padding: 5
			}
		,items: [grid,panelMid]	
	});
		
	var gridForm = Ext.create('Ext.form.Panel', {
        id: 'form',
        itemId: "form",
		frame: true,
        //title: 'Bibliographic record',
        bodyPadding: 5,
        //width: 1000,
        flex: 1,
		api: {  
			   // this is for updating/creating rows
               submit: Ext.ss.QueryPostGISArticle.updateFormRecord 
		},  
		//TODO: what's the meaning???
		//paramOrder: ['user_name', 'user_password'],
	
		layout: 'column',    // Specifies that the items will now be arranged in columns
        fieldDefaults: {
            labelAlign: 'left',
            msgTarget: 'side'
        },
        items: [panelMain, 		
		{
            columnWidth: 0.4,
            margin: '0 0 0 10',
            xtype: 'fieldset',
			id: 'detailsFieldSet',
			itemId: 'detailsFieldSet',
            title:'Record details',
            defaults: {
                width: 300,
                labelWidth: 90
            },
            defaultType: 'textfield',
            items: [
			{
                fieldLabel: 'ID',
                name: 'id',
				readOnly: true
            },			
			{
                xtype: 'textareafield',
				fieldLabel: 'Authors',
                name: 'AUTHOR',
				allowBlank: false
            },{
				xtype: 'textareafield',
				fieldLabel: 'Title',
                name: 'TITLE',
				allowBlank: false
            },{
                xtype: 'textareafield',
				fieldLabel: 'Publication',
                name: 'PUB_NAME'
            },
			{
				xtype: 'textareafield',
				fieldLabel: 'Publisher',
                name: 'PUBLISHER'
            },
			{
                fieldLabel: 'Start page',
				id: 'startPg',
                name: 'START_PAGE',
				vtype: 'numero',
				endPageField: 'endPg' // id of the end page field
            },{
                fieldLabel: 'End page',
				id: 'endPg',
                name: 'END_PAGE',
				vtype: 'numero',
				startPageField: 'startPg' // id of the start page field
				
            },{
                fieldLabel: 'Volume',
                name: 'VOL'
            },{
                fieldLabel: 'Year',
                name: 'YEAR',
				vtype: 'anno'
            },{
                fieldLabel: 'Year 2',
                name: 'YEAR2'
            },
			{
                fieldLabel: 'Link',
                name: 'LINK'
            },
			{
                fieldLabel: 'DOI',
                name: 'DOI'
            },{
                xtype: 'combobox',
				fieldLabel: 'Place',
                name: 'PLACE',				
				itemId: "comboboxPlace",
				allowBlank: false,
				emptyText : "select from database",
				//valueNotFoundText : "connecting to database",				
				////TODO: the problem here....
				//forceSelection: true,
				
				typeAhead: true,
				typeAheadDelay:250,
				queryMode: 'remote',				
				displayField: 'NAME',
				valueField: 'NAME',
				triggerAction: 'all',
				selectOnTab: true,
				store: storePlace,
				//??? don't understand their use
				lazyRender: true,
				listClass: 'x-combo-list-small'
            },{
                fieldLabel: 'NCA',
                name: 'NCA',
				xtype: 'combobox',
				itemId: "comboboxNCA",
				allowBlank: false,
				emptyText : "select from database",
				
				//valueNotFoundText : "connecting to database",
				////TODO: the problem here....
				//forceSelection: true,
				
				typeAhead: true,
				typeAheadDelay:250,
				queryMode: 'remote',				
				displayField: 'NAME',
				valueField: 'NAME',
				triggerAction: 'all',
				selectOnTab: true,
				store: storeNCA,
				//??? don't understand their use
				lazyRender: true,
				listClass: 'x-combo-list-small'						
            },{
                fieldLabel: 'Source',
                name: 'SOURCE',
				xtype: 'combobox',
				itemId: "comboboxSource",
				allowBlank: false,
				emptyText : "connecting to database",
				
				//valueNotFoundText : "connecting to database",
				////TODO: the problem here....
				//forceSelection: true,
								
				typeAhead: true,
				typeAheadDelay:250,
				queryMode: 'remote',				
				displayField: 'NAME',
				valueField: 'NAME',
				triggerAction: 'all',
				selectOnTab: true,
				store: storeSource,
				//??? don't understand their use
				lazyRender: true,
				listClass: 'x-combo-list-small'			
            }] //end fieldset items
        }],
		buttons: [
            {
                text   : 'Save new record',
				itemId: "buttonForm",
				id: "buttonForm",
                handler: function() {
				
					var form =	Ext.getCmp('form').getForm();
					var send=true;
					
					if(!newRow){

						//debug
						  console.log("this is not a new row");					  
						 
						//get form data and create an object
						var newRowData={};					  					
						Ext.iterate(form.getValues(), function(key, value) {
								newRowData[key]=value;
							}, this);
					  
						//confront  with original data, if the same data do not send update message to the server
						if (objectsAreSame(rowData, newRowData))
						  {send=false;}						  
						}
							
						//if form is valid you can update the database
						if (form.isValid() && send) {						
							form.submit(
								{
								success : onSuccessOrFail,
								failure : onSuccessOrFail
								}
							);              
						}
					}
				}
        ]
        //,renderTo: bd
    });
	
	//create a sub panel to contain the middle left layout
	var panelApplication=Ext.create('Ext.panel.Panel',{
		id: "applicationPanel",
		itemId: "applicationPanel",
		height: 750,
		width:1000,
		border:0,
		layout: {
			type: 'vbox'       // Arrange child items horizontally
			// Each takes up full width
			,align: 'stretch'
			//,padding: 5
			}
		,items: [
			{
			xtype: 'tabpanel',
			id: "applicationTab",
			itemId: "applicationTab",
			activeTab: 0, // index or id
			flex:1,
			items:[{
				title: 'Bibliographic records',
				items: [gridForm]
			},
			{
				//title: 'Position',
				//html: 'Content',
				title: 'Management',
				id: "managementTab",
				//flex:1,
				itemId: "managementTab",
				/*
				layout: 'accordion',
				items:[{
						title: 'Position',
						html: 'Content'
					},{
						title: 'Photos',
						id: 'panel2',
						html: 'Content'
				},{
						title: 'Maps',
						id: 'panel3',
						html: 'Content'
				}]*/
			}]
			}]		
		//,items: [panelMidLeft,panelMidRight]
			,renderTo: bd		
	});
	

//////////////////layout for image management

	//create a toolbar with the delete button
	var tbarImageView = new Ext.Toolbar({
            style: 'border:1px solid #99BBE8;'
        });
               		
		tbarImageView.add('->', {
		
            text: 'Delete',
			id:'deleteImageViewButton',
			icon: 'img/delete.png',
			disabled:true,
            handler: function() {              				
				Ext.Msg.show({
						title:"Delete record",
						msg: "You are deleting a record permanently, this cannot be undone. Proceed?",
						buttons:Ext.Msg.YESNO,
						icon: Ext.Msg.QUESTION,
						fn: function(btn){
							if (btn==="yes"){

							var records=Ext.getCmp('dataImageView').getSelectionModel().selected;
				
							if (records.length != 0) {
								var imgName = '';
								for (var i = 0; i < records.length; i++) {
									imgName = imgName + records.items[i].data.name + ';';
								}
								Ext.Ajax.request({
								   url: 'delete.php',
								   method: 'post',
								   params: { images: imgName, id: selectedID,table: table},
								   success: function(response, options) {
									   var obj = Ext.JSON.decode(response.responseText);
									   if(obj.success){
											if(obj.msg!=""){
												Ext.Msg.show({
														 title:'Warning',
														 msg: obj.msg,
														 buttons: Ext.Msg.YES,
														 closable : false,
														 icon: Ext.Msg.WARNING,
														 fn: function(buttonID){
														 if (buttonID=='yes'){
															loadImages();
															}}
													});
											}
											else{loadImages();}								
									   }
									   //TODO is this necessary
									   else{
											Ext.Msg.show({
													 title:'Error',
													 msg: 'Deleting images failed<br/>'+obj.msg,
													 buttons: Ext.Msg.YES,
													 closable : false,
													 icon: Ext.Msg.ERROR,
													 fn: function(buttonID){
													 if (buttonID=='yes'){
														loadImages();
														}}
												});										
									   }
								   }
								   ,failure:function(response, options){
									   var message='the connection is unaivailable';
									   if (response.responseText){
									   message = Ext.JSON.decode(response.responseText).msg;									   
									   }
									   Ext.Msg.show({
													 title:'Error',
													 msg: 'Deleting images failed<br/>'+message,
													 buttons: Ext.Msg.YES,
													 closable : false,
													 icon: Ext.Msg.ERROR,
													 fn: function(buttonID){
													 if (buttonID=='yes'){
														loadImages();
													}}
										});							   
								   }
								});
							}
						
							}
						}
					});			
            }
        });
		tbarImageView.add({
            text: 'Refresh',
			id:'refreshImageViewButton',
			icon: 'img/refresh.png',
            handler: function() {
                loadImages();			
            }
        });
		
    	var dataImageView =	Ext.create('Ext.view.View', {
            id:'dataImageView',
			autoScroll: true,        
			store: storeImageView,
            tpl: tplImageView,					
            multiSelect: true,
			autoHeight: false,
            height: 450,
            trackOver: true,
			style: 'border:1px solid #99BBE8; border-top-width: 0',
            overItemCls: 'x-item-over',
            itemSelector: 'div.thumb-wrap',
            emptyText: 'No images to display',
            prepareData: function(data) {
                Ext.apply(data, {
                    shortName: Ext.util.Format.ellipsis(data.name, 15),
                    sizeString: Ext.util.Format.fileSize(data.size)
					//,dateString: Ext.util.Format.date(data.lastmod, "m/d/Y g:i a")
                });
                return data;
            },
            listeners: {
                selectionchange: function(dv, nodes,e ){
                    var l = nodes.length,
                        s = l !== 1 ? 's' : '';
                    Ext.getCmp('images-view').setTitle('Image management (' + l + ' item' + s + ' selected)');	
					//if unselect clear the panel
					if (l === 0){
					Ext.getCmp('panelImageViewRightBottom').update("");
					Ext.getCmp('deleteImageViewButton').disable();
					}
					else{tplImageViewDetail.overwrite(panelImageViewRightBottom.body, nodes[0].data);
					Ext.getCmp('deleteImageViewButton').enable();
					}
                },
				itemclick: function(view,record, HTMLElement,index,e,eOpts ){					
                    }
					
            }
        });
		
	var panelImageViewLeft=Ext.create('Ext.Panel', {
        id: 'images-view',
        frame: true,		
        //width: 520,
		//autoHeight: true,
		flex:2,
        layout: 'auto',		
		//renderTo: 'left',
        //renderTo: 'dataview-example',
        title: 'Image management',
        items: [tbarImageView,dataImageView]		
    });
	
	var panelImageViewRightTop = Ext.create('Ext.form.Panel',{
			id: 'panelImageViewRightTop',
            title: 'Upload Images',
            //width: 270,
            //renderTo: 'right-top',
			//autoHeight: true,
			flex:1,		
            buttonAlign: 'center',
            //labelWidth: 25,
            fileUpload: true,
            items: [{
                xtype: 'fileuploadfield',
                emptyText: '',
                fieldLabel: 'Image 1',
				labelWidth: 50,
                buttonText: 'Select a File',
                width: 240,
                name: 'img[]'
            }, {
                xtype: 'fileuploadfield',
                emptyText: '',
                fieldLabel: 'Image 2',
				labelWidth: 50,
                buttonText: 'Select a File',
                width: 240,
                name: 'img[]'
            }, {
                xtype: 'fileuploadfield',
                emptyText: '',
                fieldLabel: 'Image 3',
				labelWidth: 50,
                buttonText: 'Select a File',
                width: 240,
                name: 'img[]'
            }, {
                xtype: 'fileuploadfield',
                emptyText: '',
                fieldLabel: 'Image 4',
				labelWidth: 50,
                buttonText: 'Select a File',
                width: 240,
                name: 'img[]'
            }, {
                xtype: 'fileuploadfield',
                emptyText: '',
                fieldLabel: 'Image 5',
				labelWidth: 50,
                buttonText: 'Select a File',
                width: 240,
                name: 'img[]'
            }],
            buttons: [{
                text: 'Upload',
                
				//remember to fix the following entries in the php.ini file 
				//post_max_size = 11M
				//upload_max_filesize = 11M
				//or create a .http file in the root directory
				//php_value upload_max_filesize 20971520
				//php_value post_max_size 20971520
				//php_value max_execution_time 600
				// look at this http://docs.moodle.org/22/en/File_upload_size
				
				
				//at present
				//single file upload =10MB
				//all 5 files= 50 MB
				
				handler: function() {
                    panelImageViewRightTop.getForm().submit({
						params: {id: selectedID,table: table},
						url: 'upload.php',
                        waitMsg: 'Uploading ....',
                        success: function(form, o) {
                            panelImageViewRightTop.getForm().reset();
							//obj = Ext.util.JSON.decode(o.response.responseText);
                            var obj = Ext.JSON.decode(o.response.responseText);
								if (obj.failed == '0' && obj.uploaded != '0') {								
								Ext.Msg.show({
										 title:'Success',
										 msg: 'All files uploaded<br/> '+ obj.msg,
										 buttons: Ext.Msg.YES,
										 closable : false,
										 icon: Ext.Msg.INFO,
										 fn: function(buttonID){
										 if (buttonID=='yes'){
											loadImages();
											}}
									});		
								} else if (obj.uploaded == '0') {							
								Ext.Msg.show({
										 title:'Warning',
										 msg: 'Nothing Uploaded, is the single and total file size correct? (each image 10MB=10485760 bites, total 50 MB = 52 428 800 bites)',
										 buttons: Ext.Msg.YES,
										 closable : false,
										 icon: Ext.Msg.WARNING,
										 fn: function(buttonID){
										 if (buttonID=='yes'){
											loadImages();
											}}
									});				
								} else {
									Ext.Msg.show({
										 title:'Success',
										 msg: obj.uploaded + ' files uploaded <br/>' + obj.failed + ' files failed to upload',
										 buttons: Ext.Msg.YES,
										 closable : false,
										 icon: Ext.Msg.INFO,
										 fn: function(buttonID){
										 if (buttonID=='yes'){
											loadImages();
											}}
									});											
								}							
						},
						failure: function(form, action) {
							switch (action.failureType) {
								/*case Ext.form.action.Action.CLIENT_INVALID:
									Ext.Msg.alert('Failure', 'Form fields may not be submitted with invalid values');
									break;*/
								case Ext.form.action.Action.CONNECT_FAILURE:
									Ext.Msg.show({
										 title:'Failure',
										 msg: 'Ajax communication failed',
										 buttons: Ext.Msg.YES,
										 closable : false,
										 icon: Ext.Msg.ERROR,
										 fn: function(buttonID){
										 if (buttonID=='yes'){
											loadImages();
											}}
										});									
									break;
								case Ext.form.action.Action.SERVER_INVALID:
								   Ext.Msg.show({
										 title:'Failure',
										 msg: action.result.msg+ " "+action.result.msg2,
										 buttons: Ext.Msg.YES,
										 closable : false,
										 icon: Ext.Msg.ERROR,
										 fn: function(buttonID){
										 if (buttonID=='yes'){
											loadImages();
											}}
										});
								   break;
								case Ext.form.action.Action.LOAD_FAILURE:
								   //Ext.Msg.alert('Failure');
								   Ext.Msg.show({
										 title:'Failure',
										 msg: 'LOAD_FAILURE',
										 buttons: Ext.Msg.YES,
										 closable : false,
										 icon: Ext.Msg.ERROR,
										 fn: function(buttonID){
										 if (buttonID=='yes'){
											loadImages();
											}}
										});
								   break;
								default:
									Ext.Msg.show({
										 title:'Failure',
										 msg: 'Connection aborted',
										 buttons: Ext.Msg.YES,
										 closable : false,
										 icon: Ext.Msg.ERROR
						    }						   
						}
                        
                    });
                }
            }, {
                text: 'Reset',
                handler: function() {
                    panelImageViewRightTop.getForm().reset();
                }
            }]
        });

		panelImageViewRightTop.getForm().addListener( 'actionfailed', Function (form,action,eOpts ){
		     Ext.Msg.show({
				 title:'Upload not possible',
				 msg: 'Connection aborted',
				 buttons: Ext.Msg.YES,
				 closable : false,
				 icon: Ext.Msg.ERROR  
		});
		
		
        var panelImageViewRightBottom = Ext.create('Ext.Panel',{
            title: 'Image Detail',
            //frame: true,
            //width: 270,
            //height: 300,
            //renderTo: 'right-bottom',
			flex:1.5,	
			id: 'panelImageViewRightBottom',          
            tpl: tplImageViewDetail
        });
		
		panelImageViewRightTop.getForm().on('beforeaction', function(form, action) {
			if (action.type == 'submit') {
			var doSubmit = false;									
			var items=Ext.getCmp('panelImageViewRightTop').getForm().getFields().items;																	
			//check if there is at least 1 value
			for (var i in items)
				if (items[i].getValue() !== '') {
					doSubmit = true;
					break;
			}			
			//now if there is at least one value check if file extensions are correct			
			if(doSubmit)
			{			
				for (var i in items){
					//TODO if the name has '.' this fail				
					exts = items[i].getValue().slice(items[i].getValue().indexOf(".")).toLowerCase();
					//if the field is empty go to the next
					if (exts== ''){ continue;}
					//check extensions, set doSubmit if you find
					doSubmit = false;
					for (var i = 0; i < extArray.length; i++) {	
						if (extArray[i] == exts) { doSubmit= true; break; }						
					}
					//when you first find an incorrect extension break 
					if (!doSubmit){
						Ext.Msg.alert('', 'Please,select a .gif",.jpg",.png" file');
						break;
			  		}
				}				
			}
			else {
			  Ext.Msg.alert('', 'Please,select one file');
			}			
			return doSubmit;
		}
		});
		
		panelImageViewRight=Ext.create('Ext.Panel',{
            frame: true,
            flex:1,
			//autoHeight: true,
            id: 'panelImageViewRight',
            //renderTo: 'right-bottom',			
            layout: {
				type: 'vbox',
				align: 'stretch'
			},		
			items: [panelImageViewRightTop,panelImageViewRightBottom]
        });
		
		
		panelImageView=Ext.create('Ext.Panel',{
            //frame: true,
            width: 800,
            height: 520,
            id: 'panelImageView',
            //renderTo: 'container',
            //layout: 'hbox',
			layout: {
				type: 'hbox',
				align: 'stretch'
			},	
			items: [panelImageViewLeft,panelImageViewRight]
        });
	
		
///////////////////// handler for updating the table	
	//this is used  to know if the details form submit was ok or not
	var onSuccessOrFail = function(form, action) {	  
		  
		  //debug
		  azione=action; 
		   
		  var result = action.result; 
		  if (result.success) {
			//Ext.MessageBox.alert('Success',action.result.msg);			
			
			//TODO: maybe you can update only the single row so you don't have to call the database
			//and remember on the grid and select it to refresh the rowData object!!! 
			//( if not changing back the text to original value won't trigger update again!!)
						
			//refresh the grid and select the returned field using the ID 
			store.load(function(records, operation, success) {							
				if (success){
				
				//get row index
				var idx=Ext.getCmp('grid').store.getById(parseInt(result.id)).index;
				//selec the row
				Ext.getCmp('grid').getSelectionModel().select(idx);				
				
				//TODO: fix this...it works on the console but not here....
				// make the row visible on the grid
				Ext.getCmp('grid').getView().focusRow(Ext.getCmp('grid').getStore().indexOfId(idx));
							
				}
				
			});
			
		  }
		  else {
			//TODO: implement this on the server
			Ext.MessageBox.alert('Failure',action.result.msg);
		  }
	}
	
	
	
///////////////////// handler for loadind and updating the ABSTRACT table
	
	//this is used  to know if the form submit was ok or not and update the variable with the text
	var onSuccessOrFailAbstractLoad = function(form, action) {	  		  
		  
		  //debug
		  azione=action; 
		   
		  var result = action.result; 
		  if (result.success) {
			//TODO: create the object with the form data  when you load the form (will be used to decide to send update to the server) 
				oldAbstract['TEXT']=action.result.data.TEXT;
				//console.log(action.result.success);
				//console.log(action.result.data);				
		  }
		  else {
		    //TODO: clear the object with the form data
			oldAbstract['TEXT']="";
			//TODO: implement this on the server
			Ext.MessageBox.alert('Failure',action.result.msg);
		  }
	};

	//this is used  to know if the abstract form submit was ok or not
	var onSuccessOrFailAbstractUpdate = function(form, action) {	  		   	
			//refresh the grid and select the returned field using the ID 							
				if (!action.result.success){
				//TODO: implement this on the server
					Ext.MessageBox.alert('Failure',action.result.msg);							
				}				
						
	};
	
	
	//functions to add/remove the change listeners to the form
	function removeFormFieldListeners(){
		Ext.getCmp('BRYField').removeListener( 'change', changeFieldContainer);
		Ext.getCmp('TLYField').removeListener( 'change', changeFieldContainer);
		Ext.getCmp('TLXField').removeListener( 'change', changeFieldContainer);
		Ext.getCmp('BRXField').removeListener( 'change', changeFieldContainer);
	}
	function addFormFieldListeners(){
		Ext.getCmp('BRYField').addListener( 'change', changeFieldContainer);
		Ext.getCmp('TLYField').addListener( 'change', changeFieldContainer);
		Ext.getCmp('TLXField').addListener( 'change', changeFieldContainer);
		Ext.getCmp('BRXField').addListener( 'change', changeFieldContainer);
	}
														
	//this is fired every time the values in the field container are changed
	//TODO: you need to call the modifyBox function if the form is valid
	var changeFieldContainer=function(field,newValue,oldValue,eOpts ){
		
		console.log(field.id);
						
		var formBox=Ext.getCmp('formBoundingBox').getForm();
		if	(formBox.isValid()){console.log("valid form");			
								
			//modify the box and store the valid values as old values (i do this because the oldValue parameter can store an invalid value)
			switch(field.id)
			{
			case 'BRYField':
			//console.log(newValue-oldBRYField);
			  //console.log(oldBRYField);
			  modifyBox(0,3,0,newValue-oldBRYField,0,newValue-oldBRYField );//bottomrightY 0,3,0,number
			  oldBRYField=newValue;
			  break;
			case 'TLYField':
			//console.log(newValue-oldTLYField);
			  //console.log(oldTLYField);
			  modifyBox(1,2,0,newValue-oldTLYField,0,newValue-oldTLYField );//topLeftY 1,2,0,number
			  oldTLYField=newValue;
			  break;
			case 'TLXField':
			//console.log(newValue-oldTLXField);
			  //console.log(oldTLXField);
			  modifyBox(1,0,newValue-oldTLXField,0, newValue-oldTLXField,0 );//topLeftX 1,0,number,0
			  oldTLXField=newValue;
			  break;
			case 'BRXField':
			//console.log(newValue-oldBRXField);
			  //console.log(oldBRXField);
			  modifyBox(2,3,newValue-oldBRXField,0, newValue-oldBRXField,0 );//bottomRightX 2,3,number,0
			  oldBRXField=newValue;
			  break;
			//default: ;
			}
					
			//DEBUG
			/*console.log('the initial oldvalues');
			console.log(oldTLXField);
			console.log(oldTLYField);			
			console.log(oldBRXField);
			console.log(oldBRYField);*/		
		
		}
		else {console.log("invalid form");}
	};		 


	//function to modify the bounding box
	//need to receive the difference between old value and new value
	//when modify  topLeftY 1,2,0,number
	//when modify  bottomrightY 0,3,0,number
	//when modify  topLeftX 1,0,number,0
	//when modify  bottomRightX 2,3,number,0
	function modifyBox(v1,v2,moveXv1,moveYv1, moveXv2,moveYv2 ){
		//we are modifying an existing bounding box
		if(transformControl.hasFeature){		
			console.log("modifying old box");		
			transformControl.unsetFeature();																										
			//clone the feature
			var clo=polygonLayer.features[0].clone()
			//delete the feature
			polygonLayer.destroyFeatures();
			clo.geometry.getVertices()[v1].transform(proj900913,proj).move(moveXv1,moveYv1);
			clo.geometry.getVertices()[v2].transform(proj900913,proj).move(moveXv2,moveYv2);
			clo.geometry.getVertices()[v1].transform(proj,proj900913);
			clo.geometry.getVertices()[v2].transform(proj,proj900913);
			
			//add clone back to the layer
			polygonLayer.addFeatures(clo)
			//set the feature on the transform control
			transformControl.setFeature( clo, {rotation: 0, scale: 1.0, ratio: 1.0});
			transformControl.hasFeature=true;							
		}	
		//it's a new bounding box so we can draw it	
		else{	
			console.log("creating new box");			
			//get the vertex coordinates and set the field 'oldvalues' to  this new values
			oldBRYField=parseFloat(Ext.getCmp('BRYField').getValue());
			oldTLYField=parseFloat(Ext.getCmp('TLYField').getValue());
			oldTLXField=parseFloat(Ext.getCmp('TLXField').getValue());
			oldBRXField=parseFloat(Ext.getCmp('BRXField').getValue());
			
			//create an array of geometry points
			var points=new Array();
			points[0]=(new OpenLayers.Geometry.Point(oldTLXField,oldBRYField)).transform(proj,proj900913);
			points[1]=(new OpenLayers.Geometry.Point(oldTLXField,oldTLYField)).transform(proj,proj900913);
			points[2]=(new OpenLayers.Geometry.Point(oldBRXField,oldTLYField)).transform(proj,proj900913);
			points[3]=(new OpenLayers.Geometry.Point(oldBRXField,oldBRYField)).transform(proj,proj900913);
			points[4]=(new OpenLayers.Geometry.Point(oldTLXField,oldBRYField)).transform(proj,proj900913);
			//create a linear ring
			var component=new OpenLayers.Geometry.LinearRing(points);
			var components=new Array();
			components[0]=component;
			//create a polygon
			var box=new OpenLayers.Geometry.Polygon(components);
					
			//create a vector feature and add it to the layer
			var feature=new OpenLayers.Feature.Vector(box);
			polygonLayer.addFeatures(feature);								
			//set the feature for the transform control
			transformControl.setFeature( feature, {rotation: 0, scale: 1.0, ratio: 1.0});
			transformControl.hasFeature=true;
			
			//enable update button 
			Ext.getCmp('buttonLocationUpdate').enable();
			
			//DEBUG
			/*console.log('the oldvalues for a new feature');
			console.log(oldTLXField);
			console.log(oldTLYField);			
			console.log(oldBRXField);
			console.log(oldBRYField);*/	

		}
	};

	//function to create the window for image management
	function createWinImages(){
	winImages = Ext.create('widget.window', {
		id: "imageWindow",
		itemId: "imageWindow",
		//title: '',
		closable: true,
		closeAction: 'hide',
		draggable:false,
		modal: true,
		hideMode:'offsets',
		width: 820,
		height: 560,
		resizable :false,
		layout: 'auto',
		bodyStyle: 'padding: 5px;',
		listeners:{
			 afterrender: function(window,e){
				//console.log("window is rendered");															
			},
			show: function(component,eOpts){
				//console.log("window show");
				//TODO  set the article id to show the images 
				//selectedID=57;
				//table="PHOTO";
				loadImages();
			},
			hide:function(component,eOpts){
				//console.log("window hide");
			}
		}																									
		,items: [panelImageView]
	});
	};

	//function to load the thumb images, if there are links on the database but not the images tell me
	function loadImages(){
		storeImageView.load({
		id: selectedID,
		params: {table: table},
		callback: function(records, operation, success) {
			//the operation object contains all of the details of the load operation
			//console.log(operation.response.responseText);
			if(operation.response){
			var warning=Ext.JSON.decode(operation.response.responseText).warning
			if(warning !=""){
				//Ext.Msg.alert('Some images missing:', warning);
				Ext.Msg.show({
					 title:'Some images missing',
					 msg: warning,
					 buttons: Ext.Msg.YES,
					 icon: Ext.Msg.WARNING
				});
			}
			}else{Ext.Msg.show({
					 title:'No answer',
					 msg: 'The server is not answering',
					 buttons: Ext.Msg.YES,
					 icon: Ext.Msg.WARNING
				});}
		}
	});
	Ext.getCmp('panelImageViewRightBottom').update("");
	};	
	
		
}); // ext.onready end


// confront the properties of two objects to know if they are the same
//TODO: check stefanov books, i was sure I read something about this
//this works when objects have the same exact number of properties
function objectsAreSame(x, y) {
    var objectsAreSame = true;
    for(var propertyName in x) {
		if(x[propertyName]==null){x[propertyName]="";}
		if(y[propertyName]==null){y[propertyName]="";}
		if(x[propertyName].toString() !== y[propertyName].toString()) {
						objectsAreSame = false;          
						break;       
						}    
		}    
	return objectsAreSame; 
};
//used to insert data on the map
function setOptions(options) {
polygonControl.handler.setOptions(options);
};



