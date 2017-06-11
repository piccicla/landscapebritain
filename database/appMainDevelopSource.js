//enable the dynamic dependency loading feature
//It's important to note that dynamic loading should only be used during development on your local machines. 
//During production, all dependencies should be combined into one single JavaScript file.
//Ext.Loader.setConfig({enabled: true});

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


//workaround to try fix scroller problem in grid level1/level2   http://www.sencha.com/forum/showthread.php?142473-Bug-Tree-Grid-Scroller-Stops-Working
//does not fix the problem......
/*Ext.require('Ext.grid.Scroller',
    function() {
        Ext.override(Ext.grid.Scroller, {
          afterRender: function() {
            var me = this;
            me.callParent();
            me.mon(me.scrollEl, 'scroll', me.onElScroll, me);
            Ext.cache[me.el.id].skipGarbageCollection = true;
            // add another scroll event listener to check, if main listeners is active
            Ext.EventManager.addListener(me.scrollEl, 'scroll', me.onElScrollCheck, me);
            Ext.cache[me.scrollEl.id].skipGarbageCollection = true;
          },
          // flag to check, if main listeners is active
          wasScrolled: false,
          // synchronize the scroller with the bound gridviews
          onElScroll: function(event, target) {
            this.wasScrolled = true; // change flag -> show that listener is alive
            this.fireEvent('bodyscroll', event, target);
          },
          // executes just after main scroll event listener and check flag state
          onElScrollCheck: function(event, target, options) {
            // var me = event.data.scope;
            var me = this;
            if (!me.wasScrolled) {
//              Altus.Logging.info('Re-adding event listener for scroll');
              // Achtung! Event listener was disappeared, so we'll add it again
              me.mon(me.scrollEl, 'scroll', me.onElScroll, me);
            }
            me.wasScrolled = false; // change flag to initial value
          }
        });
    }
);
*/
Ext.onReady(function(){

	
	//activate the communication with the server
	Ext.direct.Manager.addProvider(Ext.app.REMOTING_API);
	
////////////// "global" variables
		
	// store a reference to the body
	var bd = Ext.getBody();
	var itemsPerPage=100;
	// variable telling if there is a new row (used during the ARTICLE table update)
	var newRow=true;
	//an object containing the data of the last selected row ( used to activate the update)
	var rowData;	
	//to know if i already loaded the level3 data (and not load it again to save bandwidth)
	var comboboxLevel3Loaded=false;
	//this object contains the abstract, it is confronted with the new abstract when submitting the form ( used to activate the update)
	var oldAbstract={};
	//this object contains the box coordinates, it is confronted with the new box when submitting the form ( used to activate the update)
	var oldBoundBox={};
	//these variables are used to know if the user changed something but still have to update
	var isAbstractToUpdate=false;
	var isMapToUpdate=false;
	var isArticleToUpdate=false;
	//var isLevel1ToUpdate=false;
	//var isLevel2ToUpdate=false;
	var isLevelToUpdate=false;
	var updateWhat="";
	//this is to know if update or create a new record on tables  abstract and location.
	var kindBox='update';
	var kindAbstract='update';
	//this variable tell is true when the entire form details is reloaded, this is used to stop the change event on the first load
	var refreshDetails=true;
	//this variable tell is true when the abstract is reloaded, this is used to stop the change event on the first load when there is no new abstract
	var refreshAbstract=true;
	//this variable tell is true when the bounding box is reloaded, this is used to stop the change event on the first load when there is no new abstract
	var refreshBox=true;
	//this is to signal if a combo box in the detail form was opened
	var expanded=false;
	//var expandedNCA=false;
	//var expandedSource=false;
	//var expandedPlace=false;	
	var editingNCA=false;
	var editingSource=false;
	var editingPlace=false;
		
	var goToRow;
	
	//a reference the map window for 
	var win;
	//a reference to the image window
	var winImages;
	//a reference to the endnote window
	var winEndNote
	//reference to the table name for image management
	var table="PHOTO";
	// reference to the selected article id
	var selectedID;
	// reference to the selected location id
	var selectedLocationID;
	//kind of images allowed
	var extArray = new Array(".gif", ".jpg", ".png");
	//openlayers variables
	var map;
	//the map container for rendering
	var mapDiv;

	var proj;
	var proj900913;
	var feature;
	//layer for the bounding box creation
	var polygonLayer;
	var geojson_format = new OpenLayers.Format.GeoJSON({
                        'internalProjection': new OpenLayers.Projection("EPSG:900913"),
                        'externalProjection': new OpenLayers.Projection("EPSG:4326")
                    });
	//layer to show gazeteer
	var places;	
	//layer to show NCA
	var nca;
	//layer to show the box when the gazeteer is on
	var boundindlayer;
	//openlayers control to draw polygons
	var polygonControl;	
	//openlayers control to transform features
	var transformControl;
	var selectControl;
	var highlightCtrl ;
	//selected place attributes 
	var selectedPlace;
	
	//this is true when the update button ispressed on the map
	var updatingMap=false;	
	//variables to store the old field values when changing them 
	var oldBRYField=0.0;
	var oldTLYField=0.0;
	var oldTLXField=0.0;
	var oldBRXField=0.0;
	
	//bing map key
	var apiKey ="Au7OUsIHM13kOS-CYjc5_-0jpXdt5TYxn7XEMCZZyXE9SiW5JIkgBD70bXHHFmN5";
	
	//used to identify an ajax request for mapping places (is used to abot the request when the user close the window
	var requestPlacesId;
	var requestSinglePlaceId;
	var requestNCAid;
	
//////////////  validation types
	
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
	Ext.apply(Ext.form.field.VTypes, {
	    //  vtype validation function
	    coordinateX: function(val, field) {			
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
	});
	
	//TODO: set this to the UK limits, maybe set a maximum number of decimals
	// validation type, optional sign, mandatory integer and fraction, no exponent,	
	//TODO: set limits 64/48
	var coordinateYTest = /^[+-]?(89|[1-8]?[0-9])\.[0-9]+$/;	
	//var coordinateTest = /^[+-]?[0-9]+\.[0-9]+$/;
	Ext.apply(Ext.form.field.VTypes, {
	    //  vtype validation function
	    coordinateY: function(val, field) {
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
	});
	
///////////// models and stores
	
	//model for ARTICLE table 
	Ext.define('ARTICLE', {
		extend: 'Ext.data.Model',
		fields: [ {name:'id', type: 'int'},'AUTHOR','TITLE', 'PUB_NAME',{ name:'START_PAGE', type: 'int'},{ name:'END_PAGE',type: 'int'},'VOL',{ name:'YEAR',type: 'int'},'YEAR2','PUBLISHER','LINK','DOI','PLACE','NCA', 'SOURCE','FLAG','PLACE_ID','NCA_ID','SOURCE_ID'],				
		proxy: {
			type: 'direct',
			api: {
				read    : Ext.ss.QueryPostGISArticle.getResults,
				destroy : Ext.ss.QueryPostGISArticle.destroyRecord
			},
			reader: {
				type: 'json',
				root : 'records',
				totalProperty: 'total',
				idProperty :'id'
        }
		}		
	});
	//store for ARTICLE
	var store = Ext.create('Ext.data.Store', {
		model: 'ARTICLE',
		//autoLoad: true,  //call it when opening the page
		autoLoad: {start: 0, limit:itemsPerPage},
		storeId:"storeArticle",
		pageSize:itemsPerPage   //TODO change when implementing paging
	});
	
	//model for PLACE table
	Ext.define('PLACE', {
		extend : 'Ext.data.Model',
		fields : [ 'NAME', 'id']	
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
	
/*	
	
	//model for level1 table 
	Ext.define('LEVEL1', {
		extend: 'Ext.data.Model',
		fields: [ {name:'id', type: 'int'},{name:'ART_ID', type: 'int'},{name:'L1_ID', type: 'int'},'NAME'],
		proxy: {
			type: 'direct',
			api: {
				read    : Ext.ss.QueryPostGISArticle.getResultsLevel1,
				destroy : Ext.ss.QueryPostGISArticle.destroyRecordLevel1
			}
		}		
	});
	//store for level1
	var storeLevel1 = Ext.create('Ext.data.Store', {
		model: 'LEVEL1',
		autoLoad: false,
		storeId:"storeLevel1"	
	});

	
	//model for level1 list dropmenu 
	Ext.define('LEVEL1LIST', {
		extend: 'Ext.data.Model',
		fields: [ {name:'id', type: 'int'},{name:'T1_ID', type: 'int'},'NAME'],
		proxy: {
			type: 'direct',
			directFn: Ext.ss.QueryPostGISArticle.getListLevel1
			}
		});
	//store for level1 list dropmenu 
	var storeLevel1List = Ext.create('Ext.data.Store', {
		model: 'LEVEL1LIST',
		autoLoad: false,
		storeId:"storeLevel1List"		
	});	
	//model for level1 list type dropmenu 
	Ext.define('LEVEL1LISTTYPE', {
		extend: 'Ext.data.Model',
		fields: [ {name:'id', type: 'int'},'TYPE'],
		proxy: {
			type: 'direct',
			directFn: Ext.ss.QueryPostGISArticle.getListLevel1Type
			}
		});
	//store for level1 list type dropmenu 
	var storeLevel1ListType = Ext.create('Ext.data.Store', {
		model: 'LEVEL1LISTTYPE',
		autoLoad: false,
		storeId:"storeLevel1ListType"	
	});
	
	//model for level2 table 
	Ext.define('LEVEL2', {
		extend: 'Ext.data.Model',
		fields: [ {name:'id', type: 'int'},{name:'ART_ID', type: 'int'},{name:'L2_ID', type: 'int'},'NAME'],
		proxy: {
			type: 'direct',
			api: {
				read    : Ext.ss.QueryPostGISArticle.getResultsLevel2,
				destroy : Ext.ss.QueryPostGISArticle.destroyRecordLevel2
			}
		}		
	});
	//store for level2
	var storeLevel2 = Ext.create('Ext.data.Store', {
		model: 'LEVEL2',
		autoLoad: false,
		storeId:"storeLevel2"		
	});
	
	//model for level2 list dropmenu 
	Ext.define('LEVEL2LIST', {
		extend: 'Ext.data.Model',
		fields: [ {name:'id', type: 'int'},{name:'T2_ID', type: 'int'},'NAME'],
		proxy: {
			type: 'direct',
				directFn: Ext.ss.QueryPostGISArticle.getListLevel2
			}
		});
	//store for level2 list dropmenu 
	var storeLevel2List = Ext.create('Ext.data.Store', {
		model: 'LEVEL2LIST',
		autoLoad: false,
		storeId:'storeLevel2List'		
	});	
	//model for level2 list type dropmenu 
	Ext.define('LEVEL2LISTTYPE', {
		extend: 'Ext.data.Model',
		fields: [ {name:'id', type: 'int'},'TYPE'],
		proxy: {
			type: 'direct',
			directFn: Ext.ss.QueryPostGISArticle.getListLevel2Type
			}
		});
	//store for level2 list type dropmenu 
	var storeLevel2ListType = Ext.create('Ext.data.Store', {
		model: 'LEVEL2LISTTYPE',
		autoLoad: false,
		storeId:'storeLevel2ListType'		
	});	
*/
///////////////////////

	//model for level table 
	Ext.define('LEVEL', {
		extend: 'Ext.data.Model',
		fields: [ {name:'id', type: 'int'},{name:'L1_ID', type: 'int'},{name:'L2_ID', type: 'int'},{name:'L3_ID', type: 'int'},{name:'ART_ID', type: 'int'},'l1name','l2name','l3name'],
		proxy: {
			type: 'direct',
			api: {
				read    : Ext.ss.QueryPostGISArticle.getResultsLevel,
				destroy : Ext.ss.QueryPostGISArticle.destroyRecordLevel
			}
		}		
	});
	//store for level2
	var storeLevel = Ext.create('Ext.data.Store', {
		model: 'LEVEL',
		autoLoad: false,
		storeId:"storeLevel"		
	});
		
	//model for level1 list dropmenu 
		Ext.define('LEVEL1LIST', {
			extend: 'Ext.data.Model',
			fields: [ {name:'L1_ID', type: 'int'},'NAME'],
			proxy: {
				type: 'direct',
				directFn: Ext.ss.QueryPostGISArticle.getListLevel1
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
				directFn: Ext.ss.QueryPostGISArticle.getListLevel2
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
				directFn: Ext.ss.QueryPostGISArticle.getListLevel3
				}
			});
		//store for level1 list dropmenu 
		var storeLevel3List = Ext.create('Ext.data.Store', {
			model: 'LEVEL3LIST',
			autoLoad: false,
			storeId:"storeLevel3List"		
		});
	
//////////////////////////////

	//model for level table 
	Ext.define('BBOX', {
		extend: 'Ext.data.Model',
		fields: [{name:'id', type: 'int'},{name:'ART_ID', type: 'int'},'TLX','BRX','BRY','TLY'],
		proxy: {
			type: 'direct',
			api: {
				read    : Ext.ss.QueryPostGISArticle.loadFormLocation,
				destroy : Ext.ss.QueryPostGISArticle.destroyRecordLocation
			}
		}		
	});
	//store for Bbox grid
	var storeBbox = Ext.create('Ext.data.Store', {
		model: 'BBOX',
		autoLoad: false,
		storeId:'storeBbox'		
	});
	
////////////////////////////////
			
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

/////////the grid for the ARTICLE table
	
	//buttons for adding/deleting rows
	var buttonAdd = Ext.create('Ext.Button', {
				iconCls: 'add',
				text: 'Add',
				handler: function() {					
						//check if there are things not updated
						if(isAbstractToUpdate || isMapToUpdate || isArticleToUpdate ||isLevelToUpdate){
						//tell the user 
							Ext.Msg.show({
							title:"Update pending",
							msg: "It looks like there are pending updates:<br/>"+setUpdateWhat()+" Proceed anyway?",
							buttons:Ext.Msg.YESNO,
							icon: Ext.Msg.QUESTION,
							fn: function(btn){
								if (btn==="yes"){
									initNewArticle();
								}
							}
							});							
						} else {initNewArticle();}			
				}						
	});
	
	//be careful here because in the final version you should disable deleting if there are  linked database records
	var buttonDelete = Ext.create('Ext.Button',{
				iconCls: 'delete',
				text: 'Delete',
				id:'buttonDelete',
				itemId:'buttonDelete',
				disabled: true,
				handler: function() {
					
					//rowEditing.cancelEdit();
					
					var sm=Ext.getCmp('grid').getSelectionModel();
															
					//check if there are things not updated
						/*if(isAbstractToUpdate || isMapToUpdate || isArticleToUpdate || isLevelToUpdate){
						//tell the user 
							Ext.Msg.show({
							title:"Update pending",
							msg: "It looks like there are pending updates.<br/>"+setUpdateWhat()+" Proceed anyway?",
							buttons:Ext.Msg.YESNO,
							icon: Ext.Msg.QUESTION,
							fn: function(btn){
								if (btn==="yes"){
									askForDeleting(sm);										
								}
							}
							});							
						} else {*/					
						askForDeleting(sm);
						//}
					}									
			});
			
	// reload data from database
	var buttonRefresh = Ext.create('Ext.Button',{
				iconCls: 'refresh',
				text: 'Refresh connection',
				handler: function() {
				//check if there are things not updated
				if(isAbstractToUpdate || isMapToUpdate || isArticleToUpdate || isLevelToUpdate){
						//tell the user 
							Ext.Msg.show({
							title:"Update pending",
							msg: "It looks like there are pending updates.<br/>"+setUpdateWhat()+" Proceed anyway?",
							buttons:Ext.Msg.YESNO,
							icon: Ext.Msg.QUESTION,
							fn: function(btn){
								if (btn==="yes"){
									initNewArticle();
									store.load({
									params:{
											start:0,
											limit: itemsPerPage
										}
									});	
								}
							}
							});							
						} else {						
						initNewArticle();
					    store.load({
							params:{
									start:0,
									limit: itemsPerPage
								}
						});}													
					}
		});			
	// reload data from database
	var buttonEndNote = Ext.create('Ext.Button',{
				iconCls: 'endNote',
				text: 'EndNote',
				handler: function() {
								//create the window if not existing
								if (!winEndNote) {
								winEndNote=createWinEndNote(winEndNote);
								}								
								//change window visibility
								if (winEndNote.isVisible()) {
									winEndNote.hide(this, function() {
										Ext.getCmp('infoEndNote').update("");//delete info text									
									});
								} else {
									winEndNote.show(this, function() {
									});
								}									
					}					
	});
	
	//create the grid panel
	//TODO: it may be useful to insert the paginating and maybe a text field to filter the data
	var grid = Ext.create('Ext.grid.Panel',{
			itemId: "grid",
			id: "grid",
			autoScroll: true, // allow left/right or top/down scroll
			height: 320,
			store: store,		
			listeners: {
					//when selectin a row store its content (to decide if we need to send an update to the server)
					select:function(rModel,rec, rowIndex, e) {
						//activate delete button
						Ext.getCmp('buttonDelete').enable();						
						rowData=rModel.getSelection()[0].data;
						
						Ext.getCmp('buttonForm').setText("Update record");
						Ext.getCmp('buttonForm').disable();
						Ext.getCmp('buttonFormMap').disable();
						newRow=false;//mark that this is not a new row
						
						//you change thed form details so no change event must be active
						refreshDetails=true;
						refreshAbstract=true;
						refreshBox=true;
						
						//deactivate the forseSelection in the details comboBox to let the value stored in the database show
						Ext.getCmp('comboboxPlace').forceSelection=false;  
						Ext.getCmp('comboboxNCA').forceSelection=false;   
						Ext.getCmp('comboboxSource').forceSelection=false;  
					},
					//when change the selection update the form text, level1, level2, abstract,location, images, photos
					selectionchange: function(model, records) {
							//set pending update variables to false
							isAbstractToUpdate=false;
							isMapToUpdate=false;
							isArticleToUpdate=false;
							isLevelToUpdate=false;							
						if (records[0]) {
							// show record in the form and change textForm button						
							isArticleToUpdate=false
							Ext.getCmp('gridFormForm').getForm().loadRecord(records[0]);
																												
							//Set the combobox values, this is necessary for sending the id to the database when editing other fields												
							var data=records[0].data;
							//first i check if the record is already existing
							if(Ext.data.StoreManager.lookup('storePlace').findRecord('id' , data.PLACE_ID) ==null){
								Ext.data.StoreManager.lookup('storePlace').add({NAME:data.PLACE ,id:data.PLACE_ID});
							}	
							//then I set the combobox text and value
							Ext.getCmp('comboboxPlace').setRawValue(data.PLACE);
							Ext.getCmp('comboboxPlace').setValue(data.PLACE_ID);
							
							if(Ext.data.StoreManager.lookup('storeNCA').findRecord('NCA_ID' , data.NCA_ID) ==null){
								Ext.data.StoreManager.lookup('storeNCA').add({NAME:data.NCA ,NCA_ID:data.NCA_ID});								
							}							
							Ext.getCmp('comboboxNCA').setRawValue(data.NCA);
							Ext.getCmp('comboboxNCA').setValue(data.NCA_ID);							
							
							if(Ext.data.StoreManager.lookup('storeSource').findRecord('SOURCE_ID' , data.SOURCE_ID) ==null){
								Ext.data.StoreManager.lookup('storeSource').add({NAME:data.SOURCE ,SOURCE_ID:data.SOURCE_ID});								
							}							
							Ext.getCmp('comboboxSource').setRawValue(data.SOURCE);
							Ext.getCmp('comboboxSource').setValue(data.SOURCE_ID);														
							//finally I trigger validity to clean the form
							Ext.getCmp('gridFormForm').getForm().isValid();
												
							//debug 
							rec=records[0];
							
							//store the article id to use later
							selectedID=records[0].data.id;
							
							
							//Ext.getCmp('formLevel1').getForm().reset();	
							//loadLevel1(selectedID);
							
							//Ext.getCmp('formLevel2').getForm().reset();	
							//loadLevel2(selectedID);
							
							//load the levels
							Ext.getCmp('formLevel').getForm().reset();	
							loadLevel(selectedID);
							
							//pass the article id and refresh the abstract form																																							
							Ext.getCmp('formAbstract').getForm().reset();
							loadAbstract(selectedID);
																			
							//pass the article id and refresh the map form		
							//TODO: this is to complete
							//isMapToUpdate=false;
							
							//clear the map form and load
							Ext.getCmp('formLocation').getForm().reset();
							loadMap(selectedID);
																				
							//enable/disable buttons
							Ext.getCmp('buttonPhotosManagement').enable();	
							Ext.getCmp('buttonPhotosManagement').setText('Open photos management for ART_ID='+selectedID);
							Ext.getCmp('buttonMapsManagement').enable();
							Ext.getCmp('buttonMapsManagement').setText('Open maps management for ART_ID='+selectedID);
							Ext.getCmp('boundingBoxFieldSet').setTitle('Bounding box for ART_ID='+selectedID);
							Ext.getCmp('buttonFormPositionMap').disable();
							Ext.getCmp('buttonFormPosition').disable();
							Ext.getCmp('buttonDeleteBbox').disable();
							
							Ext.getCmp('buttonAddBbox').enable();
							Ext.getCmp('buttonRefreshBbox').enable();
														
							if(Ext.getCmp('buttonFormPosition').btnInnerEl){//this is necessary because before opening the tab the button is not rendered
							Ext.getCmp('buttonFormPosition').btnInnerEl.setStyle({color: "black"});
							}
							Ext.getCmp('abstractAreaField').labelEl.update('Abstract for ART_ID='+selectedID);
							Ext.getCmp('buttonFormAbstract').enable();
							if(Ext.getCmp('buttonAddLevel').btnInnerEl){//this is necessary because before opening the tab the button is not rendered
							Ext.getCmp('buttonAddLevel').btnInnerEl.setStyle({color: "black"});
							}
							Ext.getCmp('buttonDeleteLevel').disable();
							
							//you change thed form details so no change event must be active
							refreshDetails=true;
							refreshAbstract=true;
							refreshBox=true;
							//the combobox in the detai form are not expanded now
							expanded=false;
							//expandedNCA=false;
							//expandedSource=false;
							//expandedPlace=false;
							editingNCA=false;
							editingSource=false;
							editingPlace=false;
							
							//TODO this does not work, see under the grid code the table refresh event, because i can't find an event after the grid is refreshed
							if(goToRow){
								grid.getView().focusRow(goToRow);
								goToRow=null;
							}
				
						}else{//there is no selection (refreshing/add/delete)
						    //disable  buttons
							Ext.getCmp('buttonPhotosManagement').disable();	
							Ext.getCmp('buttonPhotosManagement').setText('Please select a record to manage the photos');
							Ext.getCmp('buttonMapsManagement').disable();
							Ext.getCmp('buttonMapsManagement').setText('Please select a record to manage the maps');
							Ext.getCmp('boundingBoxFieldSet').setTitle('Bounding box');
						    Ext.getCmp('buttonFormPositionMap').disable();
							Ext.getCmp('buttonFormPosition').disable();
							if(Ext.getCmp('buttonFormPosition').btnInnerEl){//this is necessary because before opening the tab the button is not rendered
							Ext.getCmp('buttonFormPosition').btnInnerEl.setStyle({color: "black"});
							}
							Ext.getCmp('abstractAreaField').labelEl.update('Abstract');
							Ext.getCmp('buttonFormAbstract').disable();
							Ext.getCmp('buttonForm').disable();
							Ext.getCmp('buttonFormMap').disable();
							//disable buttons level1/2
							//Ext.getCmp('buttonAddLevel1').disable();
							//Ext.getCmp('buttonDeleteLevel1').disable();
							//Ext.getCmp('buttonRefreshLevel1').disable();
							//Ext.getCmp('buttonAddLevel2').disable();
							//Ext.getCmp('buttonDeleteLevel2').disable();
							//Ext.getCmp('buttonRefreshLevel2').disable();
							Ext.getCmp('buttonAddLevel').disable();
							Ext.getCmp('buttonDeleteLevel').disable();
							Ext.getCmp('buttonRefreshLevel').disable();
							
							//disable bbox buttons
							Ext.getCmp('buttonAddBbox').disable();
							Ext.getCmp('buttonRefreshBbox').disable();
							Ext.getCmp('buttonDeleteBbox').disable();
							
							//clear the map form
							Ext.getCmp('formLocation').getForm().reset();
							//you change thed form details so no change event must be active
							refreshDetails=true;
							refreshAbstract=true;
							refreshBox=true;
							//the combobox in the detai form are not expanded now
							expanded=false;
							//expandedNCA=false;
							//expandedSource=false;
							//expandedPlace=false;
							editingNCA=false;
							editingSource=false;
							editingPlace=false;							
						}
					}
			},
			columns: [
			{
				dataIndex: 'id',
				text: 'ID'
			},
			{
				dataIndex: 'AUTHOR',
				text: 'AUTHOR',
				allowBlank: false
			},
			{
				dataIndex: 'YEAR',
				text: 'YEAR',
				allowBlank: true
			},
			{
				dataIndex: 'TITLE',
				text: 'TITLE',
				allowBlank: false
			},
			{
				dataIndex: 'PUB_NAME',
				text: 'PUBLICATION',
				allowBlank: true
			},
			{
				dataIndex: 'PUBLISHER',
				text: 'PUBLISHER',
				allowBlank: true
			},
			{
				dataIndex: 'START_PAGE',
				text: 'START_PAGE',
				allowBlank: true
			},
			{
				dataIndex: 'END_PAGE',
				//flex: 1,
				text: 'END_PAGE',
				allowBlank: true
			},
			{
				dataIndex: 'VOL',
				text: 'VOLUME',
				allowBlank: true
			},
			{
				dataIndex: 'YEAR2',
				text: 'YEAR2',
				allowBlank: true
			},
			{
				dataIndex: 'LINK',
				text: 'LINK',
				allowBlank: true
			},
			{
				dataIndex: 'DOI',
				text: 'DOI',
				allowBlank: true
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
			},
			{			
				dataIndex: 'SOURCE',			
				//flex: 1,
				text: 'SOURCE'		
			},
			{
					dataIndex: 'FLAG',			
					//flex: 1,
					text: 'FLAG'		
			}						
			]		
			,dockedItems: [{      //insert buttons ar the top
				xtype: 'toolbar',
				dock: 'top',
				//creating, add items
				items: [ buttonAdd, buttonDelete,buttonEndNote,buttonRefresh]
			},{//TODO implement paging
				xtype: 'pagingtoolbar',
				id:'gridPaging',
				dock: 'bottom',
				store: store,
				listeners: {
					afterrender: function() {
						Ext.getCmp('gridPaging').getComponent('refresh').hide();
					},
					beforechange: function(paging, page, eOpts ){
						//console.log(page);
						//clear the level grid
						Ext.getCmp('gridLevel').getStore().removeAll();
						//clear the bbox grid
						Ext.getCmp('gridBbox').getStore().removeAll();
						Ext.getCmp('gridFormForm').getForm().reset();
						Ext.getCmp('buttonDelete').disable();						
					}
				}				
			}]									
        });
		
		grid.getView().addListener( 'refresh',function(table,eOpts ){
						if (goToRow){
								Ext.getCmp('grid').getSelectionModel().select(goToRow);								
							}
					});

/////////the grid for the LEVEL1  table
	
	//TODO: fix buttons
	//be careful here because in the final version you should disable deleting if there are  linked database records
	/*var buttonDeleteLevel1 = Ext.create('Ext.Button',{
				iconCls: 'delete',
				id:'buttonDeleteLevel1',              
				text: 'Delete',
				disabled: true,
				handler: function() {														
					Ext.Msg.show({
						title:"Delete record",
						msg: "You are deleting a record permanently, this cannot be undone. Proceed?",
						buttons:Ext.Msg.YESNO,
						icon: Ext.Msg.QUESTION,
						fn: function(btn){
							if (btn==="yes"){
							//select the first record and send to database
							var sm=Ext.getCmp('gridLevel1').getSelectionModel();
							storeLevel1.proxy.api.destroy(sm.getSelection()[0].data);							
							
							Ext.getCmp('buttonAddLevel1').btnInnerEl.setStyle({color:"black"});
							isLevel1ToUpdate=false;
							buttonDeleteLevel1.disable();
							Ext.getCmp('formLevel1').getForm().reset();	
							loadLevel1(selectedID);								
							}
						}
					});
					}									
			});
	*/		
	// reload data from database
	/*var buttonRefreshLevel1 = Ext.create('Ext.Button',{
				iconCls: 'refresh',
				id:'buttonRefreshLevel1',
				text: 'Refresh connection',
				disabled:true,
				handler: function() {
					buttonDeleteLevel1.disable();
					Ext.getCmp('buttonAddLevel1').btnInnerEl.setStyle({color:"black"});
					isLevel1ToUpdate=false;
					Ext.getCmp('formLevel1').getForm().reset();	
					loadLevel1(selectedID);				
					}				
	});	
	*/
	
	/*var level1Grid= Ext.create('Ext.grid.Panel',{
			itemId: "gridLevel1",
			id: "gridLevel1",
			autoScroll: true,
			store: storeLevel1,		
			listeners:{		
				afterlayout: function(container,layout,eOpts ){			
					//set the width for grid level1 and level2
					Ext.getCmp('gridLevel1').setWidth(Ext.getCmp('panelLevel1Grid').getWidth()-5);
					},
				select:function(rModel,rec, rowIndex, e) {
						//activate delete button
						Ext.getCmp('buttonDeleteLevel1').enable();
					}
			},
			columns: [{
				dataIndex: 'id',
				text: 'ID'
			},{
				dataIndex: 'NAME',
				text: 'NAME'
			}]
			,dockedItems: [{   //buttons at the top
				xtype: 'toolbar',
				dock: 'top'
				,items: [buttonDeleteLevel1, buttonRefreshLevel1]
			}]
	});
	*/
	//the form for level 1 management
	/*var formLevel1 = Ext.create('Ext.form.Panel', {
		//xtype: 'form',
		id: "formLevel1",
		itemId:"formLevel1",
		frame:true,
		region: 'center',
		layout:'fit',
		api: {  
			   // this is for updating
			   submit: Ext.ss.QueryPostGISArticle.updateFormLevel1
		},		
		fieldDefaults: {
			labelAlign: 'top',
			msgTarget: 'side'
		},		
		items: [
		{
			xtype: 'fieldset',
			id: 'level1FieldSet',
			title:'Level1',             
			margin: '0 0 0 10',
			defaultType: 'textfield',
			defaults: {
				width:200,
				labelAlign: 'top',
				msgTarget: 'side'
			},					
			items: [{						
				xtype: 'combobox',
				fieldLabel: 'Level1 filter',
				name: 'TYPE',
				id:"comboboxLevel1Type",
				itemId: "comboboxLevel1Type",
				allowBlank: true,
				emptyText : "select...",
				//valueNotFoundText : "connecting to database",				
				////TODO: the problem here....
				//forceSelection: true,
				editable : false,								
				typeAhead: true,
				typeAheadDelay:250,
				queryMode: 'remote',				
				displayField: 'TYPE',
				valueField: 'id',
				triggerAction: 'all',
				selectOnTab: true,
				store: storeLevel1ListType,
				//??? don't understand their use
				lazyRender: true,
				listClass: 'x-combo-list-small',
				enableKeyEvents:true,
				listeners:{
					select: function(combo, record) {
								var stateCombo = Ext.getCmp('comboboxLevel1');												
								stateCombo.store.clearFilter(true);
								stateCombo.store.filter(
								{
									property: 'T1_ID',
									value: record[0].data.id,
									exactMatch: true
								});
								stateCombo.setValue(null);
							}
				}							
			},							
			{						
				xtype: 'combobox',
				fieldLabel: 'Level1 category',
				name: 'NAME',
				id:"comboboxLevel1",
				itemId: "comboboxLevel1",
				allowBlank: false,
				emptyText : "select....",
				//valueNotFoundText : "connecting to database",				
				////TODO: the problem here....
				//forceSelection: true,								
				editable : false,	
				typeAhead: true,
				typeAheadDelay:250,
				queryMode: 'remote',				
				displayField: 'NAME',
				valueField: 'id',
				triggerAction: 'all',
				selectOnTab: true,
				store: storeLevel1List,
				//??? don't understand their use
				lazyRender: true,
				listClass: 'x-combo-list-small',
				enableKeyEvents:true,
				listeners:{select: function(combo, record){
				Ext.getCmp('buttonAddLevel1').btnInnerEl.setStyle({color:'red'});
				isLevel1ToUpdate=true;}
				}
			}]
		}]			
		,
		buttons: [{
			text: 'Add',
			iconCls: 'add',							
			itemId: 'buttonAddLevel1',
			id: 'buttonAddLevel1',
			disabled: true,
			handler: function() {
			
			var formL1 = Ext.getCmp('formLevel1').getForm();								
				if (formL1.isValid() ) {
					
					formL1.submit({
						params:{
							idArticle: selectedID,
						},
						success : onSuccessOrFailLevel1Add,
						failure : onSuccessOrFailLevel1Add
						}
					);              
				} 
			 }
			}]
		});
		*/
/////////the grid for the LEVEL2  table	

     //TODO fix buttons
	//be careful here because in the final version you should disable deleting if there are  linked database records
	/*var buttonDeleteLevel2 = Ext.create('Ext.Button',{
				id:'buttonDeleteLevel2',
				iconCls: 'delete',
				text: 'Delete',
				disabled: true,
				handler: function() {										
					Ext.Msg.show({
						title:"Delete record",
						msg: "You are deleting a record permanently, this cannot be undone. Proceed?",
						buttons:Ext.Msg.YESNO,
						icon: Ext.Msg.QUESTION,
						fn: function(btn){
							if (btn==="yes"){
							var sm=Ext.getCmp('gridLevel2').getSelectionModel();
							storeLevel2.proxy.api.destroy(sm.getSelection()[0].data);								
							Ext.getCmp('buttonAddLevel2').btnInnerEl.setStyle({color:"black"});
							isLevel2ToUpdate=false;
							buttonDeleteLevel2.disable();
							Ext.getCmp('formLevel2').getForm().reset();	
							loadLevel2(selectedID);			
							}
						}
					});
					}					
			});
		*/	
	// reload data from database
	/*var buttonRefreshLevel2 = Ext.create('Ext.Button',{
				id:'buttonRefreshLevel2',
				iconCls: 'refresh',
				text: 'Refresh connection',
				disabled:true,
				handler: function() {
					buttonDeleteLevel2.disable();
					Ext.getCmp('buttonAddLevel2').btnInnerEl.setStyle({color:"black"});
					isLevel2ToUpdate=false;
					Ext.getCmp('formLevel2').getForm().reset();	
					loadLevel2(selectedID);
					}				
	});	
	*/			
	/*var level2Grid= Ext.create('Ext.grid.Panel',{		
			//columnWidth: 0.60,
			itemId: "gridLevel2",
			id: "gridLevel2",
			autoScroll: true,
			store: storeLevel2,		
			listeners:{		
				afterlayout: function(container,layout,eOpts ){			
					//set the width for grid level1 and level2
					//console.log('gridlevel2 is shown');
					Ext.getCmp('gridLevel2').setWidth(Ext.getCmp('panelLevel2Grid').getWidth()-5);
					},
				select:function(rModel,rec, rowIndex, e) {
						//activate delete button
						Ext.getCmp('buttonDeleteLevel2').enable();
					}				
			},
			columns: [{
				dataIndex: 'id',
				//flex: 1,
				text: 'ID'
			},{
				dataIndex: 'NAME',
				//flex: 1,
				text: 'NAME'	
			}
			]		
			,dockedItems: [{    //insert button at the top
				xtype: 'toolbar',
				dock: 'top'
				,items: [buttonDeleteLevel2, buttonRefreshLevel2]
			}]
	});	
	//the form for level 2 management
	var formLevel2 = Ext.create('Ext.form.Panel', {
		//xtype: 'form',
		frame:true,
		id: "formLevel2",
		itemId:"formLevel2",
		region: 'center',
		layout:'fit',
		api: {  
			   submit: Ext.ss.QueryPostGISArticle.updateFormLevel2 
		},
		fieldDefaults: {
		labelAlign: 'top',
		msgTarget: 'side'
		},		
	items: [
	{
		xtype: 'fieldset',
		id: 'Level2FieldSet',
		title:'Level1',             
		margin: '0 0 0 10',
		defaultType: 'textfield',
		defaults: {
			width:200,
			labelAlign: 'top',
			msgTarget: 'side'
		},					
		items: [{						
			xtype: 'combobox',
			fieldLabel: 'Level2 filter',
			name: 'TYPE',
			id:"comboboxLevel2Type",
			itemId: "comboboxLevel2Type",
			allowBlank: true,
			emptyText : "select...",
			//valueNotFoundText : "connecting to database failed",				
			editable : false,								
			typeAhead: true,
			typeAheadDelay:250,
			queryMode: 'remote',				
			displayField: 'TYPE',
			valueField: 'id',
			triggerAction: 'all',
			selectOnTab: true,
			store: storeLevel2ListType,
			//??? don't understand their use
			lazyRender: true,
			listClass: 'x-combo-list-small',
			enableKeyEvents:true,
			listeners:{
				select: function(combo, record) {
							var stateCombo = Ext.getCmp('comboboxLevel2');												
							stateCombo.store.clearFilter(true);
							stateCombo.store.filter(
							{
								property: 'T2_ID',
								value: record[0].data.id,
								exactMatch: true  //this is to select he exac id not only like the first character
							});
							stateCombo.setValue(null);
						}
			}							
		},							
		{						
			xtype: 'combobox',
			fieldLabel: 'Level2 category',
			name: 'NAME',
			id:"comboboxLevel2",
			itemId: "comboboxLevel2",
			allowBlank: false,
			emptyText : "select....",
			//valueNotFoundText : "connecting to database",												
			editable : false,	
			typeAhead: true,
			typeAheadDelay:250,
			queryMode: 'remote',				
			displayField: 'NAME',
			valueField: 'id',
			triggerAction: 'all',
			selectOnTab: true,
			store: storeLevel2List,
			//??? don't understand their use
			lazyRender: true,
			listClass: 'x-combo-list-small',
			enableKeyEvents:true,
			listeners:{select: function(combo, record){
			Ext.getCmp('buttonAddLevel2').btnInnerEl.setStyle({color:'red'});
			isLevel2ToUpdate=true;}}		
		}]
	}],
		buttons: [{
			text: 'Add',
			iconCls: 'add',										
			itemId: 'buttonAddLevel2',
			id: 'buttonAddLevel2',
			disabled: true,
			handler: function() {
			var formL2 = Ext.getCmp('formLevel2').getForm();								
				if (formL2.isValid() ) {					
					formL2.submit({
						params:{
							idArticle: selectedID,
						},
						success : onSuccessOrFailLevel2Add,
						failure : onSuccessOrFailLevel2Add
						}
					);              
				} 
			}
			}]
	});
	*/

////////////

     //TODO fix buttons
	//be careful here because in the final version you should disable deleting if there are  linked database records
	var buttonDeleteLevel = Ext.create('Ext.Button',{
				id:'buttonDeleteLevel',
				iconCls: 'delete',
				text: 'Delete',
				disabled: true,
				handler: function() {										
					Ext.Msg.show({
						title:"Delete record",
						msg: "You are deleting a record permanently, this cannot be undone. Proceed?",
						buttons:Ext.Msg.YESNO,
						icon: Ext.Msg.QUESTION,
						fn: function(btn){
							if (btn==="yes"){
							var sm=Ext.getCmp('gridLevel').getSelectionModel();
							storeLevel.proxy.api.destroy(sm.getSelection()[0].data);								
							Ext.getCmp('buttonAddLevel').btnInnerEl.setStyle({color:"black"});
							isLevelToUpdate=false;
							buttonDeleteLevel.disable();
							Ext.getCmp('formLevel').getForm().reset();	
							loadLevel(selectedID);			
							}
						}
					});
					}					
		});
			
	// reload data from database
	var buttonRefreshLevel = Ext.create('Ext.Button',{
				id:'buttonRefreshLevel',
				iconCls: 'refresh',
				text: 'Refresh connection',
				disabled:true,
				handler: function() {
					buttonDeleteLevel.disable();
					Ext.getCmp('buttonAddLevel').btnInnerEl.setStyle({color:"black"});
					isLevelToUpdate=false;
					Ext.getCmp('formLevel').getForm().reset();	
					loadLevel(selectedID);
					}				
	});	
				
	var levelGrid= Ext.create('Ext.grid.Panel',{		
			//columnWidth: 0.60,
			enableColumnResize: false,
			itemId: "gridLevel",
			id: "gridLevel",
			autoScroll: true,
			store: storeLevel,		
			listeners:{		
				afterlayout: function(container,layout,eOpts ){			
					//set the width for grid 
					//console.log('gridlevel is shown');
					Ext.getCmp('gridLevel').setWidth(Ext.getCmp('panelLevelGrid').getWidth()-5);
					},
				select:function(rModel,rec, rowIndex, e) {
						//activate delete button
						Ext.getCmp('buttonDeleteLevel').enable();
					}				
			},
			columns: [/*{
				dataIndex: 'id',
				flex: 0.2,
				text: 'ID'
			},*/{
				dataIndex: 'l1name',
				flex: 1,
				text: 'Level1'	
			},{
				dataIndex: 'l2name',
				flex: 1,
				text: 'Level2'	
			},{
				dataIndex: 'l3name',
				flex: 1,
				text: 'Level3'	
			}
			]		
			,dockedItems: [{    //insert button at the top
				xtype: 'toolbar',
				dock: 'top'
				,items: [buttonDeleteLevel, buttonRefreshLevel]
			}]
	});
	
	//the form for level  management
	var formLevel = Ext.create('Ext.form.Panel', {
		//xtype: 'form',
		frame:true,
		id: 'formLevel',
		itemId:"formLevel",
		region: 'center',
		layout:'fit',
		api: {  
			   submit: Ext.ss.QueryPostGISArticle.updateFormLevel 
		},
		fieldDefaults: {
		//labelAlign: 'right',
		//msgTarget: 'side'
		},		
		items: [
		{
			xtype: 'fieldset',
			id: 'LevelFieldSet',
			title:'Level selection',             
			margin: '1 1 1 1',
			defaultType: 'textfield',
			defaults: {
				width:250,
				labelAlign: 'left',
				labelWidth:50,
				msgTarget: 'side'
			},					
			items: [{						
				//TODO: use the level1 table, force selection problem
				xtype: 'combobox',
				fieldLabel: 'Level1',
				name: 'L1_ID',
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
								Ext.getCmp('buttonAddLevel').btnInnerEl.setStyle({color:'black'});
								Ext.getCmp('buttonAddLevel').disable(true);
								Ext.getCmp('comboboxLevel2').setVisible(true);
								Ext.getCmp('comboboxLevel3').setVisible(false);
								//isLevelToUpdate=false;
							}
				}							
			},							
			{						
				//TODO: use the level1 table, force selection problem
				xtype: 'combobox',
				fieldLabel: 'Level2',
				name: 'L2_ID',
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
				name: 'L3_ID',
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
					if(Ext.getCmp('grid').getSelectionModel().selected.length>0){
					isLevelToUpdate=true;
					Ext.getCmp('buttonAddLevel').enable(true);}
					Ext.getCmp('buttonAddLevel').btnInnerEl.setStyle({color:'red'});					
					}
				}
			}		
			]
		}],
		buttons: [{
			text: 'Add',
			iconCls: 'add',										
			itemId: 'buttonAddLevel',
			id: 'buttonAddLevel',
			disabled: true,
			handler: function() {
			var formL = Ext.getCmp('formLevel').getForm();								
				if (formL.isValid() && (Ext.getCmp('grid').getSelectionModel().selected.length>0)) {					
					formL.submit({
						params:{
							idArticle: selectedID
						},
						success : onSuccessOrFailLevelAdd,
						failure : onSuccessOrFailLevelAdd
						}
					);              
				} 
			}
			}]
	});
	
	Ext.getCmp('comboboxLevel2').setVisible(false);	
	Ext.getCmp('comboboxLevel3').setVisible(false);
	
	//////
	
	     //TODO fix buttons
	//be careful here because in the final version you should disable deleting if there are  linked database records
	var buttonDeleteBbox = Ext.create('Ext.Button',{
				id:'buttonDeleteBbox',
				iconCls: 'delete',
				text: 'Delete',
				disabled: true,
				handler: function() {										
					Ext.Msg.show({
						title:"Delete record",
						msg: "You are deleting a record permanently, this cannot be undone. Proceed?",
						buttons:Ext.Msg.YESNO,
						icon: Ext.Msg.QUESTION,
						fn: function(btn){							
							if (btn==="yes"){
							var sm=Ext.getCmp('gridBbox').getSelectionModel();
							storeBbox.proxy.api.destroy(sm.getSelection()[0].data);								
							Ext.getCmp('buttonAddBbox').btnInnerEl.setStyle({color:"black"});
							isMapToUpdate=false;
							buttonDeleteBbox.disable();
							Ext.getCmp('buttonFormPositionMap').disable();
							Ext.getCmp('formLocation').getForm().reset();	
							loadMap(selectedID);			
							}
						}
					});
					}					
		});
			
	// reload data from database
	var buttonRefreshBbox = Ext.create('Ext.Button',{
				id:'buttonRefreshBbox',
				iconCls: 'refresh',
				text: 'Refresh connection',
				disabled:true,
				handler: function() {
				
					buttonDeleteBbox.disable();
					Ext.getCmp('buttonFormPositionMap').disable();
					Ext.getCmp('buttonAddBbox').btnInnerEl.setStyle({color:"black"});
					isMapToUpdate=false;
					Ext.getCmp('formLocation').getForm().reset();	
					loadMap(selectedID);					
					}				
	});	
	
	// reload data from database
	var buttonAddBbox = Ext.create('Ext.Button',{
				id:'buttonAddBbox',
				iconCls: 'add',
				text: 'Add',
				disabled:true,
				handler: function() {
				
					buttonDeleteBbox.disable();
					Ext.getCmp('buttonFormPositionMap').enable();
					Ext.getCmp('gridBbox').getView().getSelectionModel().deselectAll();
					Ext.getCmp('buttonAddBbox').btnInnerEl.setStyle({color:"black"});
					isMapToUpdate=false;
					Ext.getCmp('formLocation').getForm().reset();	
					for(var prop in oldBoundBox){oldBoundBox[prop]="";}					
					}				
	});	
				
	var bboxGrid= Ext.create('Ext.grid.Panel',{		
			//columnWidth: 0.60,
			enableColumnResize: false,
			itemId: 'gridBbox',
			id: 'gridBbox',
			autoScroll: true,
			store: storeBbox,		
			listeners:{		
				afterlayout: function(container,layout,eOpts ){			
					//set the width for grid 

					//TODOOOOOOOO!!!!!!
					//Ext.getCmp('gridLevel').setWidth(Ext.getCmp('panelLevelGrid').getWidth()-5);
				
					},
				select:function(rModel,rec, rowIndex, e) {
						//activate delete button
						Ext.getCmp('buttonDeleteBbox').enable();
												
						selectedLocationID=rec.data.id;
						
						//refresh oldbbox variable
						oldBoundBox['TLX']=rec.data.TLX;
						oldBoundBox['BRX']=rec.data.BRX;
						oldBoundBox['BRY']=rec.data.BRY;
						oldBoundBox['TLY']=rec.data.TLY;				
				
						Ext.getCmp('buttonFormPositionMap').enable();
						
						if(Ext.getCmp('buttonFormPosition').btnInnerEl){
							Ext.getCmp('buttonFormPosition').btnInnerEl.setStyle({color:"black"});
						}
						isMapToUpdate=false;
						refreshBox=true;	
													
						//refresh the form with the values
						Ext.getCmp('formLocation').getForm().loadRecord(rec);
					
					}				
			},
			columns: [{
				dataIndex: 'id',
				flex: 1,
				text: 'ID'	
			}]		
			,dockedItems: [{    //insert button at the top
				xtype: 'toolbar',
				dock: 'top'
				,items: [buttonAddBbox,buttonDeleteBbox,buttonRefreshBbox]
			}]
	});
	
/////////////	
		
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
				allowBlank: false,
				height: 250,
				anchor: '100%',
				enableKeyEvents: true,
				listeners:{					
					change: function (field,newValue,oldValue,eOpts ){
						//console.log('abstract change event'); 
						if(!refreshAbstract){
						Ext.getCmp('buttonFormAbstract').enable();
						Ext.getCmp('buttonFormAbstract').btnInnerEl.setStyle({color:"red"});
						isAbstractToUpdate=true;
						}						
					},
					keydown: function (field,e,eOpts){
						//console.log('abstract keydown event'); 
						if(refreshAbstract){refreshAbstract=false;}						
					}
				}	
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
					  					
					//if the oldAbstract is empty it means that this will be a new record in the database (because text is required in the table abstract)
					kindAbstract="update";
					if(isEmptyText(oldAbstract)){kindAbstract="create";}
						
					//update a valid form
					if (formAb.isValid() && send) {						
						formAb.submit({
							params:{
								id: selectedID,
								kind: kindAbstract
							},
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
			//autoDestroy : false, //the container will not automatically destroy any contained component that is removed from it
			flex:1,
			items:[
			/*{
				title: 'Level1',
				id:'level1Tab',
				itemId:'level1Tab',
				layout: 'border',
				listeners:{
					beforehide: function(component, eOpts ){
					},
					beforeshow:function(component, eOpts ){
					},
					click: function(button,e,eOpts ){
						
					}
				},
				//layout:'vbox',
				// Make sure IE can still calculate dimensions after a resize when the tab is not active.
				// With display mode, if the tab is rendered but hidden, IE will mess up the layout on show: 
				hideMode: Ext.isIE ? 'offsets' : 'display',
				//hideMode:'offsets',
				items: [{
					region:'north',
					id: 'panelLevel1Grid',
					border: 0,
					height: 150,
					layout:'fit',	
					items: [level1Grid]				
				},formLevel1]
			},{
				title: 'Level2',
				id:'level2Tab',
				itemId:'level2Tab',
				layout: 'border',
				// Make sure IE can still calculate dimensions after a resize when the tab is not active.
				// With display mode, if the tab is rendered but hidden, IE will mess up the layout on show: 
				hideMode: Ext.isIE ? 'offsets' : 'display',
				//hideMode:'offsets',
				listeners:{
					beforehide: function(component, eOpts ){},
					beforeshow:function(component, eOpts ){},
					click: function(button,e,eOpts ){}
				},
				items: [{
					region:'north',
					id: 'panelLevel2Grid',
					border: 0,
					height: 150,
					layout:'fit',	
					items: [level2Grid]				
				},formLevel2]
			},*/
			{
				title: 'Levels',
				id:'levelTab',
				itemId:'levelTab',
				layout: 'border',
				listeners:{
					beforehide: function(component, eOpts ){
					},
					beforeshow:function(component, eOpts ){
					},
					click: function(button,e,eOpts ){
						
					}
				},
				//layout:'vbox',
				// Make sure IE can still calculate dimensions after a resize when the tab is not active.
				// With display mode, if the tab is rendered but hidden, IE will mess up the layout on show: 
				hideMode: Ext.isIE ? 'offsets' : 'display',
				//hideMode:'offsets',
				items: [{
					region:'north',
					id: 'panelLevelGrid',
					border: 0,
					height: 150,
					layout:'fit',	
					items: [levelGrid]				
				},formLevel]
			},
			{
				//title: 'Position',
				//html: 'Content',
				title: 'Images',
				//flex:1,
				layout: 'accordion',
				id: "middleRightAccordion",		
				itemId:"middleRightAccordion",
				items:[{
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
												winImages.show(this, function() {});
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
									if (!winImages) {
										createWinImages();									
										}
										if (winImages.isVisible()) {
												winImages.hide(this, function() {													
												});
											} else {
												table="MAP",
												Ext.getCmp('imageWindow').setTitle('Manage maps for ART_ID='+selectedID);
												winImages.show(this, function() {});
											}										
									}
							}
						]
				}]
			},{
			//title: 'Position',
				//html: 'Content',
				title: 'Spatial',
				//flex:1,
				layout: {
					type: 'vbox'   
					,align: 'stretch'
				},
				id: 'spatialTabPanel',		
				itemId:'spatialTabPanel',
				hideMode: Ext.isIE ? 'offsets' : 'display',
				//hideMode:'offsets',		
				items:[{
						xtype: 'panel',
						flex:0.45,
						layout:'fit',	
						items: [bboxGrid]
						},
						{
						//title: 'Location',
						xtype: 'form',
						flex:0.55,
						frame:true,
						id: "formLocation",
						itemId:"formLocation",
						api: {  
							   // this is for updating/creating rows
							   //load: Ext.ss.QueryPostGISArticle.loadFormLocation,
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
							items: [{		
								name: 'TLX',
								fieldLabel: 'Top-left long (X)',
								id: 'TLX',		
								itemId:'TLX',
								readOnly: true
							},
							{
								name: 'TLY',
								id: 'TLY',		
								itemId:'TLY',
								fieldLabel: 'Top-left lat (Y)',
								readOnly: true								
							},
							{
								name: 'BRX',
								id: 'BRX',		
								itemId:'BRX',
								fieldLabel: 'Bottom-right long (X)',
								readOnly: true	
							},
							{
								name: 'BRY',
								id: 'BRY',		
								itemId:'BRY',
								fieldLabel: 'Bottom-right lat (Y)',
								readOnly: true
							}]
						}],
						buttons: [{
							text: 'Update',
							itemId: "buttonFormPosition",
							id: "buttonFormPosition",
							disabled:true,
							handler: function() {
													
								var formPos = Ext.getCmp('formLocation').getForm();
					
								var send=true
													  
								 var newBoundBox={};
								  
								  //get form data and create an object
								  Ext.iterate(formPos.getValues(), function(key, value) {
										newBoundBox[key]=value;
									}, this);
								  			 
								if (objectsAreSame(oldBoundBox, newBoundBox))
								  {send=false;}
													
								//if the oldBoundBox is empty it means that this will be a new record in the database (because geom is required in the table location
								kindBox="update";
								//if(isEmpty(oldBoundBox)){kindBox="create";}
								if(isEmptyText(oldBoundBox) || isEmpty(oldBoundBox)){kindBox="create";}
								if (formPos.isValid() && send) {
									
									formPos.submit({
										params:{
											id: selectedID,
											locid:selectedLocationID,
											kind: kindBox
										},
										success : onSuccessOrFailMapUpdate,
										failure : onSuccessOrFailMapUpdate
										}
									);              
								} 
								//if the fields are the same as before 
								else if(!send){
									Ext.getCmp('buttonFormPosition').btnInnerEl.setStyle({color:"black"});
									Ext.getCmp('buttonFormPosition').disable();
									isMapToUpdate=false;
								}	
							 }
							},{
								text: 'Map',
								itemId: "buttonFormPositionMap",
								id: "buttonFormPositionMap",
								disabled: true,
								handler: function() {
																
								//create the window if not existing
								if (!win) {
								win=createWin(win);
								}
								
								//change window visibility
								if (win.isVisible()) {
									win.hide(this, function() {										
									});
								} else {
									//set visibility for the right buttons
									Ext.getCmp('buttonLocationPan').setVisible(true);
									Ext.getCmp('buttonLocationDraw').setVisible(true);
									Ext.getCmp('buttonLocationClear').setVisible(true);
									Ext.getCmp('buttonLocationUpdate').setVisible(true);
									Ext.getCmp('buttonPlaceUpdate').setVisible(false);
									Ext.getCmp('fieldsetBoundingBox').enable();
									win.show(this, function() {
									});
								}
								}
							}]//end buttons
						}]
			}]//end tab panel
		}]
	});		
	
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
		layout: 'column',    // Specifies that the items will now be arranged in columns
        fieldDefaults: {
            labelAlign: 'left',
            msgTarget: 'side'
        },
        items: [panelMain, 		
		{
            
			xtype:'form',
			id:'gridFormForm',
			itemId:'gridFormForm',
			frame: true,
			columnWidth: 0.4,
            margin: '0 0 0 10',
            layout: 'fit',
			api: {  
			   // this is for updating/creating rows
               submit: Ext.ss.QueryPostGISArticle.updateFormRecord 
			},  
			
			items:[{
			xtype: 'fieldset',
			id: 'detailsFieldSet',
			itemId: 'detailsFieldSet',
            title:'Record details',
            defaults: {
                width: 300,
                labelWidth: 90,
				enableKeyEvents:true
				,listeners:{
				   change: function (field,newValue,oldValue,eOpts ){
						//console.log('details change event'); 
						if((!refreshDetails) || expanded){
						Ext.getCmp('buttonForm').enable();
						Ext.getCmp('buttonForm').btnInnerEl.setStyle({color:"red"});
						isArticleToUpdate=true;
						}						
					}
					,
					keydown: function (form,e,eOpts){
						//console.log('details keydown event'); 
						//i do this because sometimes the forceselection does not work well, i need to be sure the values are available in the database, i need these variables to check before submitting
						switch (form.id){
							case "comboboxNCA":
							  Ext.getCmp('comboboxNCA').forceSelection=true;  
							  editingNCA=true;
							  break;
							case "comboboxSource":
							  Ext.getCmp('comboboxSource').forceSelection=true;
							  editingSource=true;
							  break;
							case "comboboxPlace":
							  Ext.getCmp('comboboxPlace').forceSelection=true;  							  
							  editingPlace=true;
							  break; 
						}					
						if(refreshDetails){refreshDetails=false;}
					  						
					},
					//these 2 are for combo boxes, i use the expand because the change event happens before the select 
					select: function(field,records,eOpts ){ 
						if(refreshDetails){refreshDetails=false;}
					},
					expand: function(picker,eOpts ){
						expanded=true;						
						switch (picker.id){
							/*case "comboboxNCA":
							  expandedNCA=true;
							  break;
							case "comboboxSource":
							  expandedSource=true;
							  break;*/
							case "comboboxPlace":
							  //expandedPlace=true;
							  Ext.getCmp('buttonFormMap').enable(); 
							  break; 
						}						
					}		
				}
            },
            defaultType: 'textfield',
            items: [
			{
                fieldLabel: 'ID',
                name: 'id',
				readOnly: true
				,listeners:{
					keydown: function (form,e,eOpts){}
					}					
            },			
			{
                xtype: 'textareafield',
				fieldLabel: 'Authors',
                name: 'AUTHOR',
				allowBlank: false,
				labelStyle: 'color: #f00;',
				enableKeyEvents:true
				
            }
			,{
                fieldLabel: 'Year',
                name: 'YEAR',
				vtype: 'anno'
				
            },
			{
				xtype: 'textareafield',
				fieldLabel: 'Title',
				labelStyle: 'color: #f00;',
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
				labelStyle: 'color: #f00;',
                name: 'PLACE',
				id:"comboboxPlace",
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
				valueField: 'id',
				triggerAction: 'all',
				selectOnTab: true,
				store: storePlace,
				//??? don't understand their use
				lazyRender: true,
				listClass: 'x-combo-list-small',
				enableKeyEvents:true				
            },{
                fieldLabel: 'NCA',
				labelStyle: 'color: #f00;',
                name: 'NCA',
				xtype: 'combobox',
				id:"comboboxNCA",     
				itemId: "comboboxNCA",
				allowBlank: false,
				emptyText : "select from database",				
				//valueNotFoundText : "connecting to database",
				////TODO: the problem here....
				//i solved setting forceSelection when i select a row on the grid, and setting true when i begin writing the field
				//forceSelection: true,				
				typeAhead: true,
				typeAheadDelay:250,
				queryMode: 'remote',				
				displayField: 'NAME',
				valueField: 'NCA_ID',
				triggerAction: 'all',
				selectOnTab: true,
				store: storeNCA,
				//??? don't understand their use
				lazyRender: true,
				listClass: 'x-combo-list-small',
				enableKeyEvents:true							
            },{
                fieldLabel: 'Source',
				labelStyle: 'color: #f00;',
                name: 'SOURCE',
				xtype: 'combobox',
				id:"comboboxSource",
				itemId: "comboboxSource",
				allowBlank: false,
				emptyText : "select from database",				
				//valueNotFoundText : "connecting to database",
				////TODO: the problem here....
				//forceSelection: true,								
				typeAhead: true,
				typeAheadDelay:250,
				queryMode: 'remote',				
				displayField: 'NAME',
				valueField: 'SOURCE_ID',
				triggerAction: 'all',
				selectOnTab: true,
				store: storeSource,
				//??? don't understand their use
				lazyRender: true,
				listClass: 'x-combo-list-small',
				enableKeyEvents:true											
            }] //end fieldset items
			}]		
		}],
		buttons: [
			{
				text   : 'map Places',
				itemId: "buttonFormMap",
				id: "buttonFormMap",
				disabled: true,
				handler: function() {
				if(editingPlace){
				var items=Ext.getCmp('comboboxPlace').getPicker().store.data.items;						 
					if (items.length>0){
					 console.log("there are "+items.length+" plsces listed");
						//create the window if not existing
						if (!win) {
						win=createWin(win);
						}					
						//change window visibility
						if (win.isVisible()) {
							win.hide(this, function() {});
						} else {
							//set visibility for the right buttons
							Ext.getCmp('buttonLocationPan').setVisible(false);
							Ext.getCmp('buttonLocationDraw').setVisible(false);
							Ext.getCmp('buttonLocationClear').setVisible(false);
							Ext.getCmp('buttonLocationUpdate').setVisible(false);
							Ext.getCmp('buttonPlaceUpdate').setVisible(true);
							Ext.getCmp('fieldsetBoundingBox').disable();
							win.show(this, function() {
							});
						}
					}
					}
					else{
					 console.log("there are no places listed"); 
					}
				}
			}
            ,{
                text   : 'Save new record',
				itemId: "buttonForm",
				id: "buttonForm",
				disabled: true,
                handler: function() {
				
					var form =	Ext.getCmp('gridFormForm').getForm();
					var send=true;
					
					//if not new row check fields are not the same
					if(!newRow){

						//debug
						  //console.log("this is not a new row");					  
						 
						//get form data and create an object
						var newRowData={};					  					
						Ext.iterate(form.getValues(), function(key, value) {
								newRowData[key]=value;
							}, this);
					  
						//confront  with original data, if the same data do not send update message to the server
						if (objectsAreSame(rowData, newRowData))
						  {send=false;
						    //set button color back to black, disable it
							Ext.getCmp('buttonForm').btnInnerEl.setStyle({color:"black"});
							Ext.getCmp('buttonForm').disable();
							Ext.getCmp('buttonFormMap').disable();
						  }						  
						}
																	
						//if form is valid you can update the database
						if (form.isValid() && send) {												
							//check again if forcesubmit failed(sometimes it happens....)
							if(checkcomboBoxes(Ext.getCmp('comboboxNCA'),editingNCA) && checkcomboBoxes(Ext.getCmp('comboboxPlace'),editingPlace) && checkcomboBoxes(Ext.getCmp('comboboxSource'),editingSource)){																						
								form.submit(
									{
									success : onSuccessOrFail,
									failure : onSuccessOrFail
									}
								);
							}
						}
					}
				}
				]
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
				title: 'INSPIRE',
				id: "inspireTab",
				//flex:1,
				itemId: 'inspireTab'
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
		flex:2,
        layout: 'auto',		
        title: 'Image management',
        items: [tbarImageView,dataImageView]		
    });
	
	var panelImageViewRightTop = Ext.create('Ext.form.Panel',{
			id: 'panelImageViewRightTop',
            title: 'Upload Images',
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
										});
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
		
        var panelImageViewRightBottom = Ext.create('Ext.Panel',{
            title: 'Image Detail',
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
					
			isArticleToUpdate=false;
						
			//TODO: maybe you can update only the single row so you don't have to call the database
			//and remember on the grid and select it to refresh the rowData object!!! 
			//( if not changing back the text to original value won't trigger update again!!)
									
			//TODO clear other forms
						
			//if a new row calculate the page to show in the paging
			if(newRow){
				//refresh the grid and select the returned field using the ID 
				store.loadPage(Math.ceil((store.getTotalCount()+1)/itemsPerPage),			
				{
					params:{
								start:0,
								limit: itemsPerPage
							},
					callback:function(records, operation, success) {							
						if (success){
						
						//TODO: you have to get this, now i am using a 50 value for debug
						//get row index
						//var idx=Ext.getCmp('grid').store.getById(parseInt(result.id)).index;
						
						//debug variable
						//var idx=20;	
						//goToRow=20;
						
						
						//TODO: fix this...it works on the console but not here....
						//i put the code in the grid selectionchange, but still cannot scroll to the row after the refresh
						//selec the row
						//Ext.getCmp('grid').getSelectionModel().select(idx);				
						
						// make the row visible on the grid
						//Ext.getCmp('grid').getView().focusRow(Ext.getCmp('grid').getStore().indexOfId(idx));
						//Ext.getCmp('grid').getView().focusRow(idx);	

						//set button color back to black
						Ext.getCmp('buttonForm').btnInnerEl.setStyle({color:"black"});
						Ext.getCmp('buttonForm').disable();
						Ext.getCmp('buttonFormMap').disable();
						}
						
					}
				}
				);
			}else{
				//if not a new row reload the same page
				store.load(		
					{
						params:{
									start:0,
									limit: itemsPerPage
								},
						callback:function(records, operation, success) {							
							if (success){
							Ext.getCmp('buttonForm').btnInnerEl.setStyle({color:"black"});
							Ext.getCmp('buttonForm').disable();
							Ext.getCmp('buttonFormMap').disable();
							}
							
						}
				});
				}
		  }else {
			//TODO: implement this on the server
			Ext.MessageBox.alert('Failure',action.result.msg);
		  }
	};
	
///////////////
	//this function is called when pressing add/delete/refresh on the main grid, it is used to init the UI ready to create a new article
	function initNewArticle(){
			
			//set pending update variables to false
			isAbstractToUpdate=false;
			isMapToUpdate=false;
			isArticleToUpdate=false;
			isLevelToUpdate=false;
			//tell you are refreshing
			refreshDetails=true;
			refreshAbstract=true;
			refreshBox=true;
			expanded=false;
			//expandedNCA=false;
			//expandedSource=false;
			//expandedPlace=false;
			editingNCA=false;
			editingSource=false;
			editingPlace=false;			
			
			newRow=true;// this is a new row						
			//reset form and set buttonForm text
			Ext.getCmp('gridFormForm').getForm().reset();
			Ext.getCmp('formAbstract').getForm().reset();
			Ext.getCmp('formLocation').getForm().reset();
			
			Ext.getCmp('buttonForm').setText("Save new record");
			Ext.getCmp('buttonForm').disable();
			Ext.getCmp('buttonFormMap').disable();
			Ext.getCmp('buttonDelete').disable();
			Ext.getCmp('buttonFormPositionMap').disable();
			
			
			//unselect the rows on the grid
			Ext.getCmp('grid').getSelectionModel().deselectAll(true); /////////////////////////

			//clear the level grid
			Ext.getCmp('gridLevel').getStore().removeAll()
			//clear the bbox grid
			Ext.getCmp('gridBbox').getStore().removeAll()
			
			//clear level1,level2
			//Ext.getCmp('gridLevel1').getStore().removeAll();
			//Ext.getCmp('gridLevel2').getStore().removeAll();
		
			//set abstract,details, map, level1, level2 form buttons to black
			if(Ext.getCmp('buttonFormAbstract').btnInnerEl){
			Ext.getCmp('buttonFormAbstract').btnInnerEl.setStyle({color:"black"});
			
			}
			Ext.getCmp('buttonForm').btnInnerEl.setStyle({color:"black"});
			
			/*if (Ext.getCmp('buttonAddLevel1').btnInnerEl){
			Ext.getCmp('buttonAddLevel1').btnInnerEl.setStyle({color:"black"});
			}*/
			
			/*if (Ext.getCmp('buttonAddLevel2').btnInnerEl){
			Ext.getCmp('buttonAddLevel2').btnInnerEl.setStyle({color:"black"});
			}*/
			if (Ext.getCmp('buttonAddLevel').btnInnerEl){
			Ext.getCmp('buttonAddLevel').btnInnerEl.setStyle({color:"black"});
			}
			
			if (Ext.getCmp('buttonFormPosition').btnInnerEl){
			Ext.getCmp('buttonFormPosition').btnInnerEl.setStyle({color:"black"});
			Ext.getCmp('buttonFormPositionMap').btnInnerEl.setStyle({color:"black"});		
			}
			
	}

//////////////////////////////////
	//this function is called when pressing the delete button on the main grid
	function askForDeleting(gridSelection){
		Ext.Msg.show({
		title:"Delete record",
		msg: "You are deleting a record permanently, this cannot be undone. Proceed?",
		buttons:Ext.Msg.YESNO,
		icon: Ext.Msg.QUESTION,
		fn: function(btn){
			if (btn==="yes"){
			//select the first record and send to database, check that it's not new
			if (gridSelection.getSelection()[0].data.id!=""){
				//send info to the server
				store.proxy.api.destroy(gridSelection.getSelection()[0].data);
				////TODO: you should see if the delete was successful on the server before doing the following			
				store.remove(gridSelection.getSelection());	
			}
			initNewArticle();
			}
		}
		});
	};	

	
///////////////////// handler for loadind and updating the ABSTRACT table
	
	//this is used  to know if the form load was ok or not and update the oldAbstract variable with the text
	var onSuccessOrFailAbstractLoad = function(form, action) {	  		  
		  
		  //debug
		  azione=action; 
		   
		  var result = action.result; 
		  if (result.success) {
			
			//it's undefined when the row in the database does not exist
			if (action.result.data!=undefined){ 
				oldAbstract['TEXT']=action.result.data.TEXT;
				//console.log(action.result.success);
				//console.log(action.result.data);
						
		       }else{
				  //if nothing in the database clear the oldAbstract
				  oldAbstract['TEXT']="";
				}
				Ext.getCmp('buttonFormAbstract').btnInnerEl.setStyle({color:"black"});
				isAbstractToUpdate=false;
				refreshAbstract=true;		
		  }	
		  else {
			oldAbstract['TEXT']="";
			Ext.MessageBox.alert('Failure loading the abstract',action.result.msg);
		  }
	};

	//this is used  to know if the abstract form submit was ok or not
	var onSuccessOrFailAbstractUpdate = function(form, action) {	  		   	
			//refresh the grid and select the returned field using the ID 							
				if (!action.result.success){
					Ext.MessageBox.alert('Failure updating the abstract',action.result.msg);							
				}else{
				//if ok set text color to black, set variable for pending update and reload the abstract				
				Ext.getCmp('buttonFormAbstract').btnInnerEl.setStyle({color:"black"});
				Ext.getCmp('buttonFormAbstract').disable();
				isAbstractToUpdate=false;
				loadAbstract(selectedID);
				}				
						
	};
	//this is used  to know if the form load was ok or not and update the oldBoundBox variable with the text
    
	
	var onSuccessOrFailMapLoad = function(form, action) {	 						
			//debug
			//vecchiaMappa=oldBoundBox; 
			
			var result = action.result; 
			if (result.success) { 
				 // clear the oldBoundBox
				  for(var prop in oldBoundBox){oldBoundBox[prop]="";}					
					if(Ext.getCmp('buttonFormPosition').btnInnerEl){
						Ext.getCmp('buttonFormPosition').btnInnerEl.setStyle({color:"black"});
					}
					
					Ext.getCmp('buttonFormPositionMap').disable();
					
					isMapToUpdate=false;
					refreshBox=true;								
			  }
			  else {
				for(var prop in oldBoundBox){oldBoundBox[prop]="";}				
				Ext.MessageBox.alert('Failure loading the map',action.result.msg);
			}
	};
	
	//this is used  to know if the abstract form submit was ok or not
	var onSuccessOrFailMapUpdate = function(form, action) {	  		   										
				if (!action.result.success){
					Ext.MessageBox.alert('Failure updating the map',action.result.msg);							
				}else{
					//if ok set text color to black, set variable for pending update and reload the abstract				
					Ext.getCmp('buttonFormPosition').btnInnerEl.setStyle({color:"black"});
					Ext.getCmp('buttonFormPosition').disable();	
					Ext.getCmp('buttonFormPositionMap').disable();
					Ext.getCmp('buttonDeleteBbox').disable();					
					isMapToUpdate=false;
					Ext.getCmp('formLocation').getForm().reset();
					
					loadMap(selectedID);					
				}				
						
	};
			
	//this is for level1 adding new record
	/*var  onSuccessOrFailLevel1Add= function(form, action) {	  		   										
				if (!action.result.success){
					Ext.MessageBox.alert('Failure adding new record for level1',action.result.msg);							
				}else{
					//if ok set text color to black, set variable for pending update and reload the abstract				
					Ext.getCmp('buttonAddLevel1').btnInnerEl.setStyle({color:"black"});
					isLevel1ToUpdate=false;
					loadLevel1(selectedID);
				}				
						
	};*/
	//this is for level2 adding new record
	/*var  onSuccessOrFailLevel2Add= function(form, action) {	  		   										
				if (!action.result.success){
					Ext.MessageBox.alert('Failure adding new record for level2',action.result.msg);							
				}else{
					//if ok set text color to black, set variable for pending update and reload the abstract				
					Ext.getCmp('buttonAddLevel2').btnInnerEl.setStyle({color:"black"});
					isLevel2ToUpdate=false;
					loadLevel2(selectedID);
				}				
						
	};*/
	var  onSuccessOrFailLevelAdd= function(form, action) {	  		   										
				if (!action.result.success){
					Ext.MessageBox.alert('Failure adding new record for levels',action.result.msg);							
				}else{
					//if ok set text color to black, set variable for pending update and reload the abstract				
					Ext.getCmp('buttonAddLevel').btnInnerEl.setStyle({color:"black"});
					isLevelToUpdate=false;
					loadLevel(selectedID);
				}				
	}
		
/////////functions to add/remove the change listeners to the form
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
	var changeFieldContainer=function(field,newValue,oldValue,eOpts ){		
		//console.log(field.id);						
		var formBox=Ext.getCmp('formBoundingBox').getForm();
		if	(formBox.isValid()){//console.log("valid form");										
			//modify the box and store the valid values as old values (I do this because the oldValue parameter can store an invalid value)
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
		else {
		//console.log("invalid form");
		}
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
			//console.log("modifying old box");		
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
			//console.log("creating new box");			
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
				Ext.Msg.show({
					 title:'Some images missing',
					 msg: warning,
					 buttons: Ext.Msg.YES,
					 icon: Ext.Msg.WARNING
				});
			}
			}
		}
	});
	Ext.getCmp('panelImageViewRightBottom').update("");
	};	
	
	//function to load an abstract
	function loadAbstract(abstractID){
		Ext.getCmp('formAbstract').getForm().load(												
				{
				params: {
					id: abstractID
				},
					success : onSuccessOrFailAbstractLoad,
					failure : onSuccessOrFailAbstractLoad
				}
		);
	};
	
	function loadMap(ID){
		/*Ext.getCmp('formLocation').getForm().load(												
				{
				params: {
					id: ID
				},
					success : onSuccessOrFailMapLoad,
					failure : onSuccessOrFailMapLoad
				}
		);*/
		Ext.data.StoreManager.lookup('storeBbox').load(												
				{
				params: {
					id: ID
				},
					success : onSuccessOrFailMapLoad,
					failure : onSuccessOrFailMapLoad
				}
		);
		
		
	};	
		
	/*function loadLevel1(abstractID){
	//pass article id and refresh the level1 grid							
		Ext.data.StoreManager.lookup('storeLevel1').load({
					id:selectedID,
					callback: function(records, operation, success) {
						if (success){
							//enable add/refresh buttons
							Ext.getCmp('buttonAddLevel1').enable();
							Ext.getCmp('buttonRefreshLevel1').enable();
						}
						else{
							//disable buttons
							Ext.getCmp('buttonAddLevel1').disable();
							Ext.getCmp('buttonDeleteLevel1').disable();
							Ext.getCmp('buttonRefreshLevel1').disable();
						}
					}
				});
	};*/
	
	/*function loadLevel2(abstractID){
	//pass article id and refresh the level1 grid							
		Ext.data.StoreManager.lookup('storeLevel2').load({
					id:selectedID,
					callback: function(records, operation, success) {
						if (success){
							//enable add/refresh buttons
							Ext.getCmp('buttonAddLevel2').enable();
							Ext.getCmp('buttonRefreshLevel2').enable();
						}
						else{
							//disable buttons
							Ext.getCmp('buttonAddLevel2').disable();
							Ext.getCmp('buttonDeleteLevel2').disable();
							Ext.getCmp('buttonRefreshLevel2').disable();
						}
					}
				});
	};*/
	
	function loadLevel(abstractID){
	//pass article id and refresh the level1 grid							
		Ext.data.StoreManager.lookup('storeLevel').load({
					id:selectedID,
					callback: function(records, operation, success) {
						if (success){
							//enable add/refresh buttons
							Ext.getCmp('buttonAddLevel').enable();
							Ext.getCmp('buttonRefreshLevel').enable();
							Ext.getCmp('comboboxLevel2').setVisible(false);
							Ext.getCmp('comboboxLevel3').setVisible(false);
						}
						else{
							//disable buttons
							Ext.getCmp('buttonAddLevel').disable();
							Ext.getCmp('buttonDeleteLevel').disable();
							Ext.getCmp('buttonRefreshLevel').disable();
						}
					}
				});
	};
	//set the info text for pending updates
	function setUpdateWhat(){
		updateWhat="";
		if(isAbstractToUpdate){updateWhat+="Abstract pending<br/>";}		
		if(isMapToUpdate){updateWhat+="Bounding box pending<br/>";}
		if(isArticleToUpdate){updateWhat+="Article pending<br/>";}
		if(isLevelToUpdate){updateWhat+="Levels pending<br/>";}
		return updateWhat;
	};
	
	
	//check the dropdown boxes contain values in the dropdown menu (this is done is forceselection failed)
	function checkcomboBoxes(comboBox,editing){						
				
		if(editing){
			var items=comboBox.getPicker().store.data.items;						 
			if (items.length>0){
				 for (var i in items){
					//console.log(comboBox.id+'='+items[i].data.NAME);
					//here I have to confront the value
					if (comboBox.getRawValue()===items[i].data.NAME){
						 console.log(comboBox.id + ' has '+items[i].data.NAME);
						return true;
					}
				 }
				 //console.log(comboBox.id + ' has no equal values');
				 //if no value delete the field
				 comboBox.setValue("");
				 return false;
			} else{
			    //console.log(comboBox.id + ' has no values');
				comboBox.setValue("");
				return false;
			}
		}
		//if no editing at all return true
		return true;
	};
	
	
	function createMap(mapDiv){
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
																			
		map = new OpenLayers.Map(mapDiv,options);
		

		//DEBUG
		mappa=map;
				
		var renderer = OpenLayers.Layer.Vector.prototype.renderers;
				
		var baseMap = new OpenLayers.Layer.OSM("Open Street Map");
		
		var road = new OpenLayers.Layer.Bing({
			key: apiKey,
			type: "Road",
			name: "Road"
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
		polygonLayer = new OpenLayers.Layer.Vector('box', {
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
				
		boundindlayer= new OpenLayers.Layer.Vector('boundindlayer',{
			//displayInLayerSwitcher:false,
			styleMap: new OpenLayers.StyleMap({
				'default': new OpenLayers.Style({
					fillColor: "#ff0000",
					fillOpacity: 0.2,
					strokeColor: "#000000",
					strokeWidth:0.4
				})
				})
		});
			
		//layer for places		
		var defaultPlace=new OpenLayers.Style({
					cursor: 'pointer',
					fillColor: "#0000ff",
					fillOpacity: 0.5,
					pointRadius: 7,
					strokeColor: "#ff0000",
					strokeWidth:0.5,
					graphicName: 'circle'
				});
		var selectPlace= new OpenLayers.Style({
					cursor: 'pointer',
					fillColor: "#ff0000",
					fillOpacity: 1.0,
					pointRadius: 5,
					strokeColor: "#000000",
					strokeWidth:0.4,
					graphicName: 'x'
				});
				
		var styleMapPlace=new OpenLayers.StyleMap({ 
				'default': defaultPlace
				,'select': selectPlace
				});
		
		places = new OpenLayers.Layer.Vector('places',{
			displayInLayerSwitcher:false
		});
		places.styleMap=styleMapPlace;
		
		
		
		var styleNCA = new OpenLayers.Style({
			strokeColor: "yellow",
			strokeOpacity: 1,
			strokeWidth: 1,
			//fillColor: "#FF5500",
			fillOpacity: 0.0,
			pointRadius: 6,
			pointerEvents: "visiblePainted"
			// label with \n linebreaks		
		}, {
			rules: [
					new OpenLayers.Rule({
						minScaleDenominator: 2500000,
						symbolizer: {
							//pointRadius: 7,
							//fontSize: "9px"
						}
					}),
					new OpenLayers.Rule({
						maxScaleDenominator: 2500000,
						symbolizer: {
							label : "${NAME}",
							fontColor: "white",
							fontSize: "10px",
							fontFamily: "Courier New, monospace",
							fontWeight: "bold",
							//labelAlign: "${align}",
							//labelXOffset: "${xOffset}",
							//labelYOffset: "${yOffset}",
							labelOutlineColor: "black",
							labelOutlineWidth: 5
						}
					})
				]
		});
		
		
		
		nca=new OpenLayers.Layer.Vector('nca',{
			styleMap: new OpenLayers.StyleMap({'default':styleNCA
					})
		});
		
		map.addLayers([baseMap,road,aerial,hybrid,nca,boundindlayer,polygonLayer,places]);
				
		map.addControl(new OpenLayers.Control.MousePosition());
		
		//this control is used to draw a bounding box
		polyOptions = {sides: 4 , irregular: true};								
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
									}
							},
							featureAdded: function(a){
								
								transformControl.setFeature( a, {rotation: 0, scale: 1.0, ratio: 1.0});
								transformControl.hasFeature=true;
								
								//go to wgs84
								var bounds=a.geometry.bounds.transform(proj900913,proj);

								//fill the fields with the coordinates
								Ext.getCmp('BRYField').setValue(bounds.bottom);
								//console.log(a.geometry.bounds.top);
								Ext.getCmp('TLYField').setValue(bounds.top);
								//console.log(a.geometry.bounds.left);
								Ext.getCmp('TLXField').setValue(bounds.left);
								//console.log(a.geometry.bounds.right);
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
		
		
		selectControl = new OpenLayers.Control.SelectFeature(places,
		{  
		onSelect: function(feature) {
					selectedFeature = feature;
					
					popup = new OpenLayers.Popup.FramedCloud("info",
					feature.geometry.getBounds().getCenterLonLat(),
					null,
					"<div style='font-size:.8em'>Feature: " +feature.attributes.NAME +"<br>id: " + feature.attributes.id+"</div>",
					null, true,
					function(evt) {
						selectControl.unselect(selectedFeature);
					}
				);
				feature.popup = popup;
				map.addPopup(popup);
				selectedPlace=feature;
				//enable insrt button
				if(Ext.getCmp('buttonPlaceUpdate').isVisible()){Ext.getCmp('buttonPlaceUpdate').enable();}
				
				//DEBUG
				posto=selectedPlace;
				}, 		
			onUnselect: function(feature) {
				//disable insert button
				if(Ext.getCmp('buttonPlaceUpdate').isVisible()){Ext.getCmp('buttonPlaceUpdate').disable();}
				map.removePopup(feature.popup);
				feature.popup.destroy();
				feature.popup = null;
				
			} 			
			});
		
		//DEBUG
		selezioneControl=selectControl;
				
		map.addControl(selectControl);
		
		//add kinetic drag
		//map.addControl(new OpenLayers.Control.Navigation({dragPanOptions: {enableKinetic: true}}));											
		map.addControl(new OpenLayers.Control.LayerSwitcher);
		map.setCenter(new OpenLayers.LonLat(-2.0, 54.0).transform(proj, proj900913), 5);
	}
	
	
	//function to create the window to hold the map
	function createWin(win){
								
		
		var win = Ext.create('widget.window', {
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
					//console.log("window is rendered");
					
					//set the height of the form
					Ext.getCmp('fieldsetBoundingBox').setHeight(Ext.getCmp('formBoundingBox').getHeight()-10);
													
					//set the div, this may be useful if i want to teleport the map to another container
					mapDiv="mapWindow-body";
					//if the map still not exist create it
					if(!map){
					createMap(mapDiv);
					}										
				},
				show: function(component,eOpts){
					//console.log("window show");
					//check if we are dealing with bounding boxes
					if(!Ext.getCmp('fieldsetBoundingBox').isDisabled()){
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
							//console.log('formBox is '+formBox.isValid());
						if(transformControl.hasFeature){	
						      map.zoomToExtent(polygonLayer.getDataExtent());		
						}		
							
						//send the array to php
						requestSinglePlaceId = Ext.Ajax.request({
								   url: 'getPlaces/dataFeeder.php',
								   method: 'get',
								   params: { singlePlace: Ext.getCmp('comboboxPlace').getValue()},
								   success: function(response, options) {
									   //the callback should build the map layer									   
									   var obj = Ext.JSON.decode(response.responseText);
									   places.addFeatures(geojson_format.read(obj));
								   }
								   ,failure:function(response, options){
									   var message='the connection is unaivailable';
									   /*if (response.responseText){
									       //message = Ext.JSON.decode(response.responseText).msg;									   
									   }*/ 							   
								   }
								});
						
						//ask for nca if not available
						if(nca.features.length==0){
							requestNCAId = Ext.Ajax.request({
									   url: 'getPlaces/NCA.geojson',
									   method: 'get',
									   //params: { singlePlace: Ext.getCmp('comboboxPlace').getValue()},
									   params: { place: arr},
									  success: function(response, options) {
										   //the callback should build the map layer									   
										   var obj = Ext.JSON.decode(response.responseText);
										   nca.addFeatures(geojson_format.read(obj));
									   }
									   ,failure:function(response, options){
										   var message='the connection is unaivailable';
										   /*if (response.responseText){
											   //message = Ext.JSON.decode(response.responseText).msg;									   
										   }*/ 							   
									   }
									});	
						}
						
						//if the grid store has something load the bbox geometry
						if(Ext.getCmp('gridBbox').store.count()>0){
							requestBboxes = Ext.Ajax.request({
										   url: 'getPlaces/bbox.php',
										   method: 'post',									   
										   params: { id: selectedID},
										   //params: { singlePlace: Ext.getCmp('comboboxPlace').getValue()},
										   success: function(response, options) {
											   //the callback should build the map layer									   
											   var obj = Ext.JSON.decode(response.responseText);
											   boundindlayer.addFeatures(geojson_format.read(obj));
										   }
										   ,failure:function(response, options){
											   var message='the connection is unaivailable';
											   /*if (response.responseText){
												   //message = Ext.JSON.decode(response.responseText).msg;									   
											   }*/ 							   
										   }
										});	
						}
						
					}
					//TODO we need to send the place names to the database to create the points
					//see bottom for example of uploading arrays to php
					else{					
						var items=Ext.getCmp('comboboxPlace').getPicker().store.data.items;						 
						var a=[];	 
						for (var i in items){
							//build the array
							a.push(items[i].data.NAME);							
						}
						//remove duplicate from array
						a=uniqueArr(a);
						var arr = a.join()	
						
						//add a bounding box if available
						
						
						/*if(Ext.getCmp('BRY').getValue()!=""){
							
							//this was the old code to show only the single bbox
							var BRYField=parseFloat(Ext.getCmp('BRY').getValue());
							var TLYField=parseFloat(Ext.getCmp('TLY').getValue());
							var TLXField=parseFloat(Ext.getCmp('TLX').getValue());
							var BRXField=parseFloat(Ext.getCmp('BRX').getValue());							
							//create an array of geometry points
							var points=new Array();
							points[0]=(new OpenLayers.Geometry.Point(TLXField,BRYField)).transform(proj,proj900913);
							points[1]=(new OpenLayers.Geometry.Point(TLXField,TLYField)).transform(proj,proj900913);
							points[2]=(new OpenLayers.Geometry.Point(BRXField,TLYField)).transform(proj,proj900913);
							points[3]=(new OpenLayers.Geometry.Point(BRXField,BRYField)).transform(proj,proj900913);
							points[4]=(new OpenLayers.Geometry.Point(TLXField,BRYField)).transform(proj,proj900913);
							//create a linear ring
							var component=new OpenLayers.Geometry.LinearRing(points);
							var components=new Array();
							components[0]=component;
							//create a polygon
							var box=new OpenLayers.Geometry.Polygon(components);					
							//create a vector feature and add it to the layer
							var feature=new OpenLayers.Feature.Vector(box);
							
							}*/
							
							if(Ext.getCmp('gridBbox').store.count()>0){
								requestBboxes = Ext.Ajax.request({
											   url: 'getPlaces/bbox.php',
											   method: 'post',									   
											   params: { id: selectedID},
											   //params: { singlePlace: Ext.getCmp('comboboxPlace').getValue()},
											   success: function(response, options) {
												   //the callback should build the map layer									   
												   var obj = Ext.JSON.decode(response.responseText);
												   boundindlayer.addFeatures(geojson_format.read(obj));
											   }
											   ,failure:function(response, options){
												   var message='the connection is unaivailable';
												   /*if (response.responseText){
													   //message = Ext.JSON.decode(response.responseText).msg;									   
												   }*/ 							   
											   }
											});	
							}
						
						//send the array to php
						requestPlacesId = Ext.Ajax.request({
								   url: 'getPlaces/dataFeeder.php',
								   method: 'post',
								   params: { place: arr},
								   success: function(response, options) {
									   //the callback should build the map layer
									   var obj = Ext.JSON.decode(response.responseText);
									   /*if(obj.success){
											if(obj.msg!=""){												
											}
											else{}								
									   }
									   else{}*/
									   //set the point layer	   
									   //zoom to layer extent
									   
									   places.addFeatures(geojson_format.read(obj));
									   selectControl.activate();
									   map.zoomToExtent(places.getDataExtent());
								   }
								   ,failure:function(response, options){
									   var message='the connection is unaivailable';
									   /*if (response.responseText){
									       //message = Ext.JSON.decode(response.responseText).msg;									   
									   }*/ 							   
								   }
								});
					
					}													
				},
				hide:function(component,eOpts){
					//update location text on the main UI					
					//check if we are dealing with bounding boxes
					if(!Ext.getCmp('fieldsetBoundingBox').isDisabled()){
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
						}
						
						Ext.Ajax.abort(requestSinglePlaceId);
						Ext.Ajax.abort(requestNCAId);
						
						boundindlayer.removeAllFeatures();
					}
					//we are dealing with places
					else {
						//should stop the ajax for point request?????
						Ext.Ajax.abort(requestPlacesId);						
						//clear the point array, clear also the popups
						if(map.popups.length>0 && selectedPlace){
							map.removePopup(selectedPlace.popup);
							selectedPlace.popup.destroy();
							selectedPlace.popup = null;
						}						
						boundindlayer.removeAllFeatures();
						Ext.getCmp('buttonPlaceUpdate').disable();						
						//set the places on the main ui					
					}
					//remove places
					places.removeAllFeatures();
					selectControl.deactivate();
				}
			},																									
			items: [
				{											
					xtype: 'form',	
					frame:true,
					id: "formBoundingBox",
					itemId:"formBoundingBox",
					flex:3,
					paramOrder: ['id'],										
					items: [										
					{
					xtype: 'fieldset',
					id: "fieldsetBoundingBox",
					itemId:"fieldsetBoundingBox",
					title:'Bounding box',
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
						toggleHandler : function(button, state){
						 //console.log("pan: "+state);
						  if(state){		
							polygonControl.deactivate();
							}else{Ext.getCmp('buttonLocationDraw').toggle(true);}
						}},
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
						toggleHandler : function(button, state){
						 //console.log("draw: "+state);												 
						 if(state){													 													 
							polygonControl.activate();																						 													 
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
						var formBox=Ext.getCmp('formBoundingBox').getForm();
						if	(formBox.isValid()){
							updatingMap=true;
							isMapToUpdate=true;
							Ext.getCmp('buttonFormPosition').enable();
							Ext.getCmp('buttonFormPosition').btnInnerEl.setStyle({color:"red"});						
							//hide window
							Ext.getCmp("locationwindow").hide();																							
						}
						}
						},
						{
							itemId: 'buttonPlaceUpdate',
							id: 'buttonPlaceUpdate',
							scale: 'large',
							width: 32,
							height: 40,
							iconCls: 'updateMap',
							text: 'Place',
							disabled:true,
							handler: function(){								
								//hide window								
								Ext.getCmp('comboboxPlace').forceSelection=false;
								Ext.data.StoreManager.lookup('storePlace').add(selectedFeature.attributes);
								Ext.getCmp('comboboxPlace').setValue(selectedFeature.attributes.id);	 
								editingPlace=false;	//necessary?							
								Ext.getCmp('comboboxPlace').setRawValue(selectedFeature.attributes.NAME);
								Ext.getCmp('gridFormForm').getForm().isValid();							
								Ext.getCmp("locationwindow").hide();																							
							}							
						}
						]
				}
			]
		});		
		return win;										
	};
		
	//this is the form to upload an endnotexml file
	var panelEndNote = Ext.create('Ext.form.Panel',{
			id: 'panelEndNote',	
            buttonAlign: 'center',
            fileUpload: true,		
            items: [{
                xtype: 'fileuploadfield',
				margin: '5 5 5 5',
				frame:true,
                emptyText: '',
                fieldLabel: 'EndNote XML',
				labelWidth: 100,
                buttonText: 'Select a File',
                width: 350,
                name: 'xml'
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
						panelEndNote.getForm().submit({
							url: 'endNote.php',
							waitMsg: 'Uploading ....',
							success: function(form, o) {
								panelEndNote.getForm().reset();
								var obj = Ext.JSON.decode(o.response.responseText);
								if (obj.success){
									Ext.getCmp('infoEndNote').update(obj.msg);
									initNewArticle();
									store.loadPage(
									Math.ceil((store.getTotalCount()+ parseFloat(obj.inserted))/itemsPerPage),
									{
									params:{
											start:0,
											limit: itemsPerPage
										}
									});	
								}else{
									Ext.getCmp('infoEndNote').update(obj.msg);
								}					
							},						
							failure: function(form, action) {
								switch (action.failureType) {
									case Ext.form.action.Action.CLIENT_INVALID:
										Ext.getCmp('infoEndNote').update('Form fields may not be submitted with invalid values');
										break;
									case Ext.form.action.Action.CONNECT_FAILURE:
										Ext.getCmp('infoEndNote').update('Ajax communication failed');									
										break;
									case Ext.form.action.Action.SERVER_INVALID:
									   Ext.getCmp('infoEndNote').update('SERVER_INVALID');
									   break;
									case Ext.form.action.Action.LOAD_FAILURE:
									   Ext.getCmp('infoEndNote').update('LOAD_FAILURE');	 
									   break;
									default:
										 Ext.getCmp('infoEndNote').update('Connection aborted');	
								}						   
							}
							
						});
					}
				
				}, {
                text: 'Reset',
                handler: function() {
                    panelEndNote.getForm().reset();
                }
				}
				
            ]
        });
		
		panelEndNote.getForm().on('beforeaction', function(form, action) {
			if (action.type == 'submit') {
			var doSubmit = false;									
			var items=Ext.getCmp('panelEndNote').getForm().getFields().items;																	
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
						if ('.xml' == exts) { doSubmit= true; break; }						
					}
					//when you first find an incorrect extension break 
					if (!doSubmit){
						Ext.getCmp('infoEndNote').update('Please,select an .xml file');
						break;
			  		}
				}				
			}
			else {
			  Ext.getCmp('infoEndNote').update('Please,select one file');
			}			
			return doSubmit;
		}
		});		
				
	//function to create the window to hold the map
	function createWinEndNote(winEndNote){	
	var winEndNote = Ext.create('widget.window', {
			id: "endNotewindow",
			itemId: "endNotewindow",
			title: 'Upload EndNote XML',
			closable: true,
			closeAction: 'hide',
			draggable:true,
			modal: false,
			hideMode:'offsets',
			width: 400,
			height: 200,
			resizable:false,
			listeners:{},
			items: [panelEndNote,
			{
				id: 'infoEndNote',
				frame:true,
				html: ''
			}]
	});	
		return winEndNote;	
	};
		
		
	//function used to setup the combobox3
	function setUpcomboBoxLevel3(stateCombo,record){
		stateCombo.store.clearFilter(true);
		stateCombo.store.filter(
		{
			property: 'L2_ID',
			value: record[0].data.L2_ID,
			exactMatch: true
		});
		stateCombo.setValue(null);
															
		//after setting the filters enable/disable combobox depending on the number of items
		if(Ext.getCmp('comboboxLevel3').store.data.items.length>0){
			Ext.getCmp('comboboxLevel3').enable(true);
			Ext.getCmp('comboboxLevel3').setVisible(true);
			Ext.getCmp('buttonAddLevel').disable(true);
		}
		else {
			Ext.getCmp('comboboxLevel3').setVisible(false);
			Ext.getCmp('comboboxLevel3').disable(true);
			Ext.getCmp('buttonAddLevel').btnInnerEl.setStyle({color:'red'});		
			if(Ext.getCmp('grid').getSelectionModel().selected.length>0){
				isLevelToUpdate=true;
				Ext.getCmp('buttonAddLevel').enable(true);}
		}														
	//Ext.getCmp('buttonAddLevel1').btnInnerEl.setStyle({color:'red'});
	//isLevel1ToUpdate=true;
	};

	
}); // ext.onready end




// confront the properties of two objects to know if they are the same
//TODO: check stefanov books, i was sure I read something about this
//this works when objects have the same exact number of properties. It checkes also when 2 objects are both empty
function objectsAreSame(x, y) {
    if (isEmpty(x) || isEmpty(y)) {
		if (isEmpty(x) && isEmpty(y)) {
			return true;
		}
	 return false;
	}
	else{
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
	}
};
//funcion to test if an object is empty
function isEmpty(obj) {
    for(var prop in obj) {
        if(obj.hasOwnProperty(prop))
            return false;
    }

    return true;
};
//return true if there is an empty text
function isEmptyText(obj) {        
	for(var prop in obj){if(obj[prop]==""){return true;}}	
    return false;
};

//used to insert data on the map
function setOptions(options) {
polygonControl.handler.setOptions(options);
};

//function to delete duplicates from an array, it calls the contains function
function uniqueArr(a) {
 var temp = [];
 for(i=0;i<a.length;i++){
  if(!contains(temp, a[i])){
   //temp.length+=1;
   temp.push(a[i]);
  }
 }
 return temp;
}
//check for the Uniqueness. parameters (array, value)
function contains(a, e) {
 for(j=0;j<a.length;j++)if(a[j]==e)return true;
 return false;
}

