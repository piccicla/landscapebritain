Ext.define('BSG.controller.Main',{
	
	extend:'Ext.app.Controller',	
	stores:['Layers','LayerNames','Abstracts','ImagesView'],
	
	init:function(){		
		//activate the communication with the server
		Ext.direct.Manager.addProvider(Ext.app.REMOTING_API);
			
		//set validation types
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
		var oneTest = /^\b[a-zA-Z0-9_]+\b$/;
		Ext.apply(Ext.form.field.VTypes, {
			//  vtype validation function
			one: function(val, field) {
				//check if there is a value, trim it
				var a=BSG.util.trim(val)
				if (a!=''){
					return oneTest.test(a);
					}
				else return true;
			},
			oneText: 'Must contain a single keyword'
			//,annoMask: /\d{4}/
		});	
			
			//this template is used by the details tab
		BSG.variables.tplArticleViewDetail= new Ext.XTemplate(
				'<div class="details">',
					'<tpl for=".">',
						//'<img src="{thumb_url}"><div class="details-info">',
						'<b>Authors:</b>',
						'<span>{AUTHOR}</span><br/>',
						'<b>Title:</b>',
						'<span>{TITLE}</span><br/>',
						'<b>Publication:</b>',
						'<span>{PUB_NAME}</span><br/>',
						'<b>Publisher:</b>',
						'<span>{PUBLISHER}</span><br/>',
						'<b>Pages:</b>',
						'<span>{START_PAGE}-{END_PAGE}</span><br/>',
						'<b>Volume:</b>',
						'<span>{VOL}</span><br/>',
						'<b>Year:</b>',
						'<span>{YEAR}</span><br/>',
						'<b>Additional year info:</b>',
						'<span>{YEAR2}</span><br/>',
						'<b>Link:</b>',
						'<tpl if="this.isHttpUrl(values.LINK)">',
							'<span><a href="{LINK}" target="_blank">go to site</a></span><br/>',
						'</tpl>',
						'<tpl if="this.isHttpUrl(values.LINK) == false">',
								'<span><a href="{["pdf/"+this.getLast(values.LINK,"/")]}" target="_blank">{[this.getLast(values.LINK,"/")]}</a></span><br/>',									
						'</tpl>',						
						'<b>DOI:</b>',						
						'<span>{DOI}</span><br/>',
						'<b>Place:</b>',
						'<tpl if="values.PLACE.toLowerCase() != \'dummy\'">',
							'<span>{PLACE}</span>',
						'</tpl>',
						'<br/>',
						'<b>NCA:</b>',
						'<tpl if="values.NCA.toLowerCase() != \'dummy\'">',
							'<span>{NCA}</span>',
						'</tpl>',
						'<br/>',
						'<b>Source:</b>',
						'<tpl if="values.SOURCE.toLowerCase() != \'dummy\'">',
							'<span>{SOURCE}</span>',
						'</tpl>',
						'<br/>',
					'</tpl>',
				'</div>',{
					isHttpUrl:function(name){
						var r=/^([a-z][a-z0-9+\-.]*)/i;						
						if(name!="" && r.exec(name)[0].toLowerCase()=='http'){return true;}		
						return false;
					},
					//get the last piece of text after splitting
					getLast:function(text,a){
						if(text){
						var b=text.split(a);
						return b[b.length-1];}
						else{return "";}
					}
				}
		);

			
		BSG.variables.tplImageView = new Ext.XTemplate(
				'<tpl for=".">',
					'<div class="thumb-wrap" id="{name}">',
					'<div class="thumb"><img src="{thumb_url}" title="{name}"></div>',
					'<span class="x-editable">{shortName}</span></div>',
				'</tpl>',
				'<div class="x-clear"></div>'
		);
	
		////////////generata debug data for graphs, use a callback to call the loaded function
		BSG.util.loadScript("app/controller/graphDataGenerator.js", function(){
			BSG.util.generateGraphDataStore();
		});
		
		//bound the controller to the views		
		this.control({
			'mappanel':{
				afterlayout:this.onMapPanelRendered
			},
			//'horizontalpanel':{
				//beforerender:this.onHorizontalPanelBeforeRendered
			//},
			'#comboboxLevel1':{
				select:this.oncomboboxLevel1Select
			},
			'#comboboxLevel2':{
				select:this.oncomboboxLevel2Select
			},
			'#comboboxLevel3':{
				select:this.oncomboboxLevel3Select
			},
			'#radiogroupSpatial':{
				change:this.onRadioGroupSpatialChange
			},
			'#comboboxLayer':{
				select:this.onComboboxLayerSelect
			},
			'#comboboxFeature':{	
				expand:this.onComboboxFeatureExpand
			},
			'detachgridbutton':{			
				click:this.onClickDetachGrid	
			},
			'detachtabsbutton':{
				click:this.onClickDetachTab
			},
			'attachlefttabbutton':{
				click:this.onClickAttachTabArrow
			},
			'attachrighttabbutton':{
				click:this.onClickAttachTabArrow
			},
			'attachtopgridbutton':{
				click:this.onClickAttachGridArrow
			},
			'attachbottomgridbutton':{
				click:this.onClickAttachGridArrow
			},
			'querybutton':{
				click:this.onClickQueryButton
			},
			'querywindowbutton':{
				click:this.onClickQueryWindowButton
			},
			'bibliogrid':{
				select:this.onselectBiblioGrid
			},
			'detailgridtab':{
				tabchange:this.onDetailGridTabChange
			},
			'#imagesViewer':{
				itemdblclick:this.onImagesViewerDblClick
			},
			'#mapsViewer':{
				itemdblclick:this.onImagesViewerDblClick
			},
			//buttons to set/clear query details
			'#buttonClearFeature':{
				click:this.onClickButtonClearFeature
			},
			'#buttonClearDrawFeature':{
				click:this.onClickButtonClearDrawFeature
			},
			'#buttonClearLevel':{
				click:this.onClickButtonClearLevel
			},
			'#buttonClearAttribute':{
				click:this.onClickButtonClearAttribute
			},
			'#buttonClearAbstract':{
				click:this.onClickButtonClearAbstract
			},
			'layertree':{	
				checkchange:this.onCheckChange,
				itemdblclick:this.onTreeItemdblClick
			},
			//buttons to draw a query feature
			'#drawPointButton':{
				click:this.onClickButtonDrawQueryfeature
			},
			'#drawLineButton':{
				click:this.onClickButtonDrawQueryfeature
			},
			'#drawPolygonButton':{
				click:this.onClickButtonDrawQueryfeature
			},
			'#drawBoxButton':{
				click:this.onClickButtonDrawQueryfeature
			},
			'verticaltabpanel':{
				tabchange:this.onVerticalTabPanelChange
			},
			'attributequerypanel':{
				expand:this.onExpandAttributeQueryPanel
			}
		});
		
		//if localstorage available add query toolbar events 
		if (BSG.util.hasLocalStorage()){	
			this.control({
				'querydetailsradiogroup':{
					change:this.onQueryDetailsRadioGroupChange,
					afterrender:this.onQueryDetailsRadioGroupAfterRender
				},	       
				'loadquery':{
					click:this.onClickLoadQueryButton
				},
				'savequery':{
					click:this.onClickSaveQueryButton
				},
				'deletequery':{
					click:this.onClickDeleteQueryButton
				}
			})
		}	
				
	},
	//deactivate the query feature when changing tab
	onVerticalTabPanelChange:function(tabPanel,newCard,oldCard,eOpts ){
		if(!BSG.util.manageQueryFeatureButton(BSG.variables.drawingQuery)){
			BSG.util.toggleQueryControl('clear');
		}
	},
	//deactivate the query feature when expanding the attribute query panel
	onExpandAttributeQueryPanel:function(panel,eOpts ){
		if(!BSG.util.manageQueryFeatureButton(BSG.variables.drawingQuery)){
			BSG.util.toggleQueryControl('clear');
		}
	},
	onClickButtonDrawQueryfeature:function(but,e,eOpts){
		//allow pan while drawing		
		for(var key in BSG.map.drawControls) {				        		
			BSG.map.drawControls[key].handler.stopDown = false;
			BSG.map.drawControls[key].handler.stopUp = false;          					
        }		
		switch(but.id){	 
			 case 'drawPointButton':
				//console.log('draw a point feature');
				//allow pan while drawing
				//enable this drawing or disable all the drawing
				if(BSG.util.manageQueryFeatureButton(BSG.variables.drawingQuery)){
					BSG.util.toggleQueryControl('point');
					BSG.util.getComponent('#drawPointButton',0).setText('<b>Press to stop drawing</b>')
					BSG.util.getComponent('#drawLineButton',0).disable(true);
					BSG.util.getComponent('#drawPolygonButton',0).disable(true);
					BSG.util.getComponent('#drawBoxButton',0).disable(true);
				}else{
					BSG.util.toggleQueryControl('stop');
				}
			 break;
			 case 'drawLineButton':
				//console.log('draw a line feature');
				if(BSG.util.manageQueryFeatureButton(BSG.variables.drawingQuery)){
					BSG.util.toggleQueryControl('line');
					BSG.util.getComponent('#drawLineButton',0).setText('<b>Press to stop drawing</b>')
					BSG.util.getComponent('#drawPointButton',0).disable(true);
					BSG.util.getComponent('#drawPolygonButton',0).disable(true);
					BSG.util.getComponent('#drawBoxButton',0).disable(true);
				}else{
					BSG.util.toggleQueryControl('stop');
				}
			 break;
			 case 'drawPolygonButton':
				//console.log('draw a polygon feature');
				if(BSG.util.manageQueryFeatureButton(BSG.variables.drawingQuery)){
					BSG.util.toggleQueryControl('polygon');
					BSG.util.getComponent('#drawPolygonButton',0).setText('<b>Press to stop drawing</b>')
					BSG.util.getComponent('#drawLineButton',0).disable(true);
					BSG.util.getComponent('#drawPointButton',0).disable(true);
					BSG.util.getComponent('#drawBoxButton',0).disable(true);
				}else{
					BSG.util.toggleQueryControl('stop');
				}
			 break;
			 case 'drawBoxButton':
				//console.log('draw a box feature');
				if(BSG.util.manageQueryFeatureButton(BSG.variables.drawingQuery)){
					BSG.util.getComponent('#drawBoxButton',0).setText('<b>Press to stop drawing</b>')
					BSG.util.getComponent('#drawLineButton',0).disable(true);
					BSG.util.getComponent('#drawPointButton',0).disable(true);
					BSG.util.getComponent('#drawPolygonButton',0).disable(true);
					BSG.map.drawControls['box'].handler.stopDown = true;
					BSG.map.drawControls['box'].handler.stopUp = true;
					BSG.util.toggleQueryControl('box');
				}else{
					BSG.util.toggleQueryControl('stop');
				}
			 break;
		}
	},	
	onTreeItemdblClick:function(view, record, item, index, e, eOpts){
		/*console.log(view);
		console.log(record);
		console.log(item);
		console.log(index);
		console.log(e);
		console.log(eOpts);*/
		
		if (record.parentNode.data.text=='Layers'){
			var l=BSG.map.map.getLayersByName(record.data.text)[0];
			
			console.log(l);

			
			if(!BSG.variables.layerWindow){
			BSG.variables.layerWindow=Ext.create('widget.window', {
				id: 'layerWindow',
				itemId: 'layerWindow',
				title: 'Layer properties',
				closable: true,
				closeAction: 'hide',
				draggable:true,
				modal: false,
				hideMode:'offsets',
				width: 100,
				//autoHeight:true,
				//maxHeight: 500,
				height: 500,
				//minWidth: 400,
				//maxWidth: 600,
				//maxHeight: 600,
				//modal : true,
				resizable :false,
				layout: 'vbox',
				//bodyStyle: 'padding: 5px;',
				listeners:{},
				items:[
				{
					xtype: 'label',
					text: 'Stroke Color',
					margins: '2 2 2 2'
				},
				{
					xtype: 'colorpicker',
					height:100,
					listeners: {
						select: function(picker, selColor) {
							l.styleMap.styles['default'].defaultStyle.strokeColor='#'+selColor;						
							l.redraw();							
						}
					}
				},
				{
				xtype: 'slider',
				width: 90,
				height:20,
				value: 0,
				increment: 1,
				minValue: 0,
				maxValue: 5,
				listeners: {		
					changecomplete:function(slider,newValue,thumb,eOpts) {
						l.styleMap.styles['default'].defaultStyle.strokeWidth=newValue;
						l.redraw();		
					}
				}
				},
				{
					xtype: 'label',
					text: 'Fill Color',
					margins: '2 2 2 2'
				},
				//strokeOpacity
				//strokeWidth				
				{
					xtype: 'colorpicker',
					height:100,
					listeners: {
						select: function(picker, selColor) {
							l.styleMap.styles['default'].defaultStyle.fillColor='#'+selColor;							
							l.redraw();							
						}
					}
				},
				{
				xtype: 'slider',
				width: 90,
				height:20,
				value: 0,
				increment: 1,
				minValue: 0,
				maxValue: 10,
				listeners: {		
					changecomplete:function(slider,newValue,thumb,eOpts) {
						l.styleMap.styles['default'].defaultStyle.fillOpacity=newValue/10;
						l.redraw();		
					}
				}
				//strokeOpacity
				//strokeWidth
				},
				{
					xtype: 'checkbox',
					boxLabel:'Labels',
					listeners: {
						change:function(form,newValue, oldValue, eOpts){
						 //console.log(newValue);
						 var a="${NAME}";
						 if(newValue){
								l.styleMap.styles['default'].rules[1].symbolizer.label=a;
							}else{
								l.styleMap.styles['default'].rules[1].symbolizer.label='';
							}
							l.redraw();
						}
					}
				},
				{
					xtype: 'colorpicker',
					height:100,
					listeners: {
						select: function(picker, selColor) {
							l.styleMap.styles['default'].rules[1].symbolizer.fontColor='#'+selColor;							
							l.redraw();							
						}
					}
				},
				{
				xtype: 'slider',
				width: 90,
				height:20,
				value: 10,
				increment: 1,
				minValue: 0,
				maxValue: 20,
				listeners: {		
					changecomplete:function(slider,newValue,thumb,eOpts) {
						l.styleMap.styles['default'].rules[1].symbolizer.fontSize=newValue;
						l.redraw();		
					}
				}
				//strokeOpacity
				//strokeWidth
				}
				]			
			});		
			};
		
			//change window visibility
			if (!BSG.variables.layerWindow.isVisible()) {
					BSG.variables.layerWindow.show(item, function() {});
				}		
			
		}
	}, 
	onCheckChange:function(node,checked,eOpts ){
		//console.log(node.parentNode.raw.text);
		//console.log(node);
		//console.log(checked);
		//console.log(eOpts);
		var a=node.data.text;		
		//manage basemaps
		if(node.parentNode.data.text=="Basemap"){
			//basemap layers cannot be unchecked 
			if (checked==false){
				node.set('checked',true);
			}
			//when you change a basemap the others need to be unchecked
			else{
				node.parentNode.cascadeBy(function(n){
				var b=n.data.text;
				if(b!=a && b!="Basemap" ){
					n.set('checked',false);
				}								
				});
				//console.log('TODO: set the '+node.data.text+' background map');				
				BSG.map.map.setBaseLayer(BSG.map.map.getLayersByName(node.data.text)[0]);
				
			}
		}
		//manage layers
		else{
			if (checked==false){
				console.log('TODO: hide layer '+node.data.text);
				BSG.map.map.getLayersByName(node.data.text)[0].setVisibility(false);
			}else{		
				console.log('TODO: show layer '+node.data.text);
				console.log('TODO: create a rue function to etlayer data');
				var a=BSG.map.map.getLayersByName(node.data.text)[0];
				a.setVisibility(true);
				//check if the dissallowed the ajax request using the custom 'hideAjaxRequest' parameter when creating the layer
				var b=a.hideAjaxRequest||false;
				if(a.features.length==0 && !b){
							//start progressbar animation
							var t=BSG.util.getComponent('#progressBar',0);
							t.wait({text: 'Downloading'});
							t.show();
							requestLayer = Ext.Ajax.request({
									   url: 'data/'+node.data.text+'.geojson',
									   method: 'get',
									   //params: { place: arr},
									  success: function(response, options) {
											//the callback should build the map layer									   
											var obj = Ext.JSON.decode(response.responseText);
											a.addFeatures(BSG.map.geojson_format.read(obj));
											//reset proressbar
											t.reset();
											t.updateText('');
											t.hide();						
									   }
									   ,failure:function(response, options){
										   //console.log('the connection is unaivailable');
										   /*if (response.responseText){
											   //message = Ext.JSON.decode(response.responseText).msg;									   
										   }*/
											t.reset();
											t.updateText('Error!');
									   }
									});	
				}	
			}	
		}
		
	},
	
	//onClickButtonSetFeature:function(but,e,eOpts){console.log('onClickButtonSetFeature')},
	onClickButtonClearFeature:function(but,e,eOpts){
		var sel=BSG.util.getComponent('spatialform fieldset',1).items;
		sel.getAt(0).setValue("");
		sel.getAt(1).setValue("");
		sel.getAt(1).setRawValue("");
		sel.getAt(2).setValue("0");
	},
	//onClickButtonSetDrawFeature:function(but,e,eOpts){console.log('onClickButtonSetDrawFeature')},
	onClickButtonClearDrawFeature:function(but,e,eOpts){
		var dr=BSG.util.getComponent('spatialform fieldset',2).items;
		dr.getAt(4).setValue("0");
		//TODO clear features on the map
		var l=BSG.map.map.getLayersByName('Query layer')[0];
		l.destroyFeatures();
		l.redraw();	
		//deactivate all controls
		if(!BSG.util.manageQueryFeatureButton(BSG.variables.drawingQuery)){
		BSG.util.toggleQueryControl('clear');
		}		
	},
	//onClickButtonSetLevel:function(but,e,eOpts){console.log('onClickButtonSetLevel')},
	onClickButtonClearLevel:function(but,e,eOpts){
		BSG.util.getComponent('levelform',0).getForm().reset();
		var lf=BSG.util.getComponent('levelform fieldset',0).items;	
		if(lf.getAt(1).isVisible()){lf.getAt(1).hide();}
		if(lf.getAt(2).isVisible()){lf.getAt(2).hide();}
	},
	//onClickButtonSetAttribute:function(but,e,eOpts){console.log('onClickButtonSetAttribute')},
	onClickButtonClearAttribute:function(but,e,eOpts){
		BSG.util.getComponent('attributeform',0).getForm().reset();
	},
	//onClickButtonSetAbstract:function(but,e,eOpts){console.log('onClickButtonSetAbstract')},
	onClickButtonClearAbstract:function(but,e,eOpts){
		BSG.util.getComponent('abstractform',0).getForm().reset();
	},	
	onImagesViewerDblClick:function(view,record,item,index,e,eOpts){	 
	  if(!BSG.variables.imageWindow){
			BSG.util.createImageWindow();			
		};		
		if (!BSG.variables.imageWindow.isVisible()) {
			BSG.variables.imageWindow.show(item, function(){});
		}						
		BSG.util.imageUpdate('<img id="image" src="'+record.data.vis_url+'"></img>');					
	},
	onDetailGridTabChange:function(tabPanel,newCard,oldCard,eOpts){
		//console.log(newCard);			
		switch(newCard.id)
		{
		case 'detailsTab':
		 if(BSG.variables.detailsID!=BSG.variables.selectedRow){
			BSG.variables.detailsID=BSG.variables.selectedRow;
			console.log('must load details data');			
		  }  
		  break;
		case 'abstractTab':
		  if(BSG.variables.abstractID!=BSG.variables.selectedRow){
			BSG.variables.abstractID=BSG.variables.selectedRow;
			console.log('must load abstract data');	
			
			this.getAbstractsStore().load(												
				{
				params: {
					id: BSG.variables.selectedArticleId
				},
				callback: function(records, operation, success) {						
						if (success) {
							if(records[0]){
								BSG.util.getComponent('#abstractTab',0).update(records[0].data.TEXT);
								}else{
								BSG.util.getComponent('#abstractTab',0).update('');
								}
						}else{
						BSG.util.getComponent('#abstractTab',0).update('error reading the database');
						}
						
					}
				}
		);
		  }
		  break;
		case 'imagesTab':
		  if(BSG.variables.imagesID!=BSG.variables.selectedRow){			
			BSG.variables.imagesID=BSG.variables.selectedRow;
			BSG.util.loadImages();	
		  }
		  break;
		 case 'mapsTab':
		  if(BSG.variables.mapsID!=BSG.variables.selectedRow){
			//console.log('must load maps data');
			BSG.variables.mapsID=BSG.variables.selectedRow;	
			BSG.util.loadMaps();	
		  }
		  break;
		}
	},	
	//this initialize the map
	//todo: add layers to layer tab
	onMapPanelRendered:function(component,layout,eOpts){
	
		var h=Ext.getCmp("mappanel").getHeight();
		var w=Ext.getCmp("mappanel").getWidth();
		Ext.fly("mappanel-body").update('<canvas id="canvas" width="'+w+'" height="'+h+'"></canvas>')
		// (0) Set location of Artwork directory. Because of CORS this can't be local
		   // if you want to open this using file://...
		   ogSetArtworkDirectory("http://www.openwebglobe.org/art/");
		   
		   // (1) create an OpenWebGlobe context using canvas
		   // first parameter is canvas-id and second is "fullscreen"
		   var ctx = ogCreateContextFromCanvas("canvas", true);
		   
		   // (2) Create a virtual globe
		   var globe = ogCreateGlobe(ctx);
		   
		   // (3) Add an image and an elevation layer
		   var imgBlueMarble500 = 
		   {
			  url     : ["http://www.openwebglobe.org/data/img"],
			  layer   : "World500",
			  service : "i3d"
		   };
		   
		   var elvSRTM_CH = 
		   {
			  url     : ["http://www.openwebglobe.org/data/elv"],
			  layer   : "SRTM",
			  service : "i3d"
		   };
		   
		   ogAddImageLayer(globe, imgBlueMarble500);
		   ogAddElevationLayer(globe, elvSRTM_CH);
		   

		   // (4) Set the "Render-Callback" function.
		   // The callback function will be called everytime a frame is drawn.
		   ogSetRenderFunction(ctx, OnRender);
		   
		   
		   // (5) Set the mouse down function. We need this for picking!
		   ogSetKeyDownFunction(ctx, BSG.util.OnKeyDown);
		   
		   
		   // (6) Set the background color
		   ogSetBackgroundColor(ctx, 0.2,0.2,0.7,1);
		   
		   // (7) get the scene and the world
		   var scene = ogGetScene(ctx);   
		   var world = ogGetWorld(scene);
		   

		   // Set some POIs
		   var poilayer = ogCreatePOILayer(world,"misc");
		   
			var PoiDefinition = 
			{
				icon     :  "http://www.openwebglobe.org/art/cycling.png",
				position :  [9.821343,46.793029,1800],
				flagpole :  true,
				size     :  10
			};
			var poi = ogCreatePOI(poilayer, PoiDefinition);
		   
		   
		   var PoiDefinition = 
			{
				icon     :  "http://www.openwebglobe.org/art/cycling.png",
				position :  [7.650014,47.516667,500],
				flagpole :  true,
				size     :  10
			};
			var poi = ogCreatePOI(poilayer, PoiDefinition);
		   
		   
		   var PoiDefinition = 
			{
				icon     :  "http://www.openwebglobe.org/art/cycling.png",
				position :  [7.591127,47.550558,300],
				flagpole :  true,
				size     : 10
			};
			var poi = ogCreatePOI(poilayer, PoiDefinition);
		   
		   
		   // Retrieve default camera and set it up:
		   var camera = ogGetActiveCamera(scene);
		   ogSetOrientation(camera,0,-90,0);
		   ogSetPosition(camera, 7.366654,46.233333,15000000);
		   
		   
		   // Set the Fly-To Callback functions.
		   ogSetFlyToStartedFunction(ctx,BSG.util.flyToAnimationStarted);
		   ogSetInPositionFunction(ctx,BSG.util.positionReached);							
	},	
	//function to set up the combobox for level3	
	setUpCBL3: function(stateCombo,record, value){
		stateCombo.store.clearFilter(true);
		var v;
		if(value){v=value;}else {v=record[0].data.L2_ID;}
		stateCombo.store.filter(
		{
			property: 'L2_ID',
			value: v,
			exactMatch: true
		});
		stateCombo.setValue(null);
															
		//after setting the filters enable/disable combobox depending on the number of items
		if(BSG.util.getComponent('#comboboxLevel3',0).store.data.items.length>0){
			BSG.util.getComponent('#comboboxLevel3',0).enable(true);
			BSG.util.getComponent('#comboboxLevel3',0).setVisible(true);
		}
		else {
			BSG.util.getComponent('#comboboxLevel3',0).setVisible(false);
			BSG.util.getComponent('#comboboxLevel3',0).disable(true);
		}														

	},
	//this is when you select a level1 item
	oncomboboxLevel1Select: function(combo, record) {
		//console.log('comboboxLevel1Select');
		var stateCombo = BSG.util.getComponent('#comboboxLevel2',0);												
		stateCombo.store.clearFilter(true);
		stateCombo.store.filter(
		{
			property: 'L1_ID',
			value: record[0].data.L1_ID,
			exactMatch: true
		});
		stateCombo.setValue(null);
		//BSG.util.getComponent('#buttonSelectAttribute',0).btnInnerEl.setStyle({color:'black'});
		BSG.util.getComponent('#comboboxLevel2',0).setVisible(true);
		BSG.util.getComponent('#comboboxLevel3',0).setVisible(false);
	},	
	oncomboboxLevel2Select: function(combo, record){
		var stateCombo = BSG.util.getComponent('#comboboxLevel3',0);												
		
		if (!BSG.variables.comboboxLevel3Loaded){
			stateCombo.store.load(function(records, operation, success) {							
				if (success){
						BSG.variables.comboboxLevel3Loaded=true;
						BSG.controller.Main.prototype.setUpCBL3(stateCombo,record);
					}								
			});
		}else{
			BSG.controller.Main.prototype.setUpCBL3(stateCombo,record);
		}							
	},
	oncomboboxLevel3Select: function(combo, record){
		//BSG.util.getComponent('#buttonSelectLevel',0).btnInnerEl.setStyle({color:'red'});		
	},
	onRadioGroupSpatialChange:function(field,newValue,oldValue,eOpts ){
		//console.log(newValue); 	
		if(Ext.getCmp('radiogroupSpatial').getChecked()[0].inputValue == 'extent'){
			Ext.getCmp('SpatialFieldSet').disable(true);
			Ext.getCmp('SpatialDrawSet').disable(true);
			Ext.getCmp('buttongroupFeature').disable(true);
			Ext.getCmp('buttongroupDrawFeature').disable(true);
			
			//update query details text
			BSG.variables.spatialQuery="Current extent<br/>";
			BSG.util.updateQueyDetails(BSG.util.getComponent('querydetails',0));			
		
			//clear the query feature layer
			var l=BSG.map.map.getLayersByName('Query layer')[0];
			l.destroyFeatures();
			l.redraw();	
		
		}
		else if (Ext.getCmp('radiogroupSpatial').getChecked()[0].inputValue == 'select'){
			Ext.getCmp('SpatialFieldSet').enable(true);
			Ext.getCmp('SpatialDrawSet').disable(true);
			Ext.getCmp('buttongroupFeature').enable(true);
			Ext.getCmp('buttongroupDrawFeature').disable(true);
			//update query details text
			BSG.variables.spatialQuery="Select feature<br/>";
			BSG.util.updateQueyDetails(BSG.util.getComponent('querydetails',0));
	
			//clear the query feature layer
			var l=BSG.map.map.getLayersByName('Query layer')[0];
			l.destroyFeatures();
			l.redraw()
		}
		else{
			Ext.getCmp('SpatialFieldSet').disable(true);
			Ext.getCmp('SpatialDrawSet').enable(true);
			Ext.getCmp('buttongroupFeature').disable(true);
			Ext.getCmp('buttongroupDrawFeature').enable(true);
			//update query details text
			BSG.variables.spatialQuery="Draw feature<br/>";
			BSG.util.updateQueyDetails(BSG.util.getComponent('querydetails',0));
				
		}

		//stop draw query feature if active
		if(!BSG.util.manageQueryFeatureButton(BSG.variables.drawingQuery)){
			BSG.util.toggleQueryControl('clear');
		}
	},	
	onComboboxLayerSelect: function(combo, record){
		//console.log(record[0].data.NAME);
		BSG.util.getComponent('#comboboxFeature',0).enable(true);
		this.getLayerNamesStore().getProxy().extraParams.LAYERNAME=record[0].data.NAME;
		BSG.util.getComponent('#comboboxFeature',0).setValue(null);
		/*this.getLayerNamesStore().load(function(records, operation, success) {							
								BSG.util.getComponent('#comboboxFeature',0).store.clearData();
								BSG.util.getComponent('#comboboxFeature',0).setValue(null)
							});	*/				
	},
	onComboboxFeatureExpand :function(field,eOpts){
		//this is to solve the problem of the freezing combobox
		this.getLayerNamesStore().load();
	},
	onHorizontalPanelBeforeRendered:function(component,eOpts){
		//component.suspendLayout=false
	},	
	onClickDetachGrid:function(button,e,eOpts){
		//alert(BSG.ciccio);		
		if(!BSG.variables.gridWindow){
			BSG.variables.gridWindow=Ext.create('widget.window', {
			id: 'gridWindow',
			itemId: 'gridWindow',
			//title: 'Map window',
			closable: false,
			//closeAction: 'hide',
			draggable:true,
			modal: false,
			hideMode:'offsets',
			width: 800,
			height: 300,
			//minWidth: 400,
			//maxWidth: 600,
			//maxHeight: 600,
			//modal : true,
			resizable :true,
			layout: 'fit',
			//bodyStyle: 'padding: 5px;',
			listeners:{
					/*afterrender: function(window,e){},									
					hide: function(component,eOpts){
						/*var op=BSG.util.getComponent('horizontalbottompanel',0);
						BSG.variables.gridWindow.removeAll(false);
						op.show();
						op.add(BSG.variables.horizontalPanelCore);
						op.doLayout();
					}*/
				}	
			});		
		};
		
		//change window visibility
		if (!BSG.variables.gridWindow.isVisible()) {
					BSG.variables.gridWindow.show(null, function() {
						var op=BSG.util.getComponent('horizontalbottompanel',0);						
						var htp=BSG.util.getComponent('horizontaltoppanel',0);
						var hbp=BSG.util.getComponent('horizontalbottompanel',0);						
						htp.removeAll(false);
						hbp.removeAll(false);						
						BSG.variables.gridWindow.add(BSG.variables.horizontalPanelCore);
						BSG.variables.gridWindow.doLayout();
						htp.hide();
						hbp.hide();											
						});
					}		
	},	
		
	onClickQueryWindowButton:function(button,e,eOpts){	
		if(!BSG.variables.queryWindow){
				BSG.variables.queryWindow=Ext.create('widget.window',{
				id: 'queryWindow',
				itemId: 'queryWindow',
				closable: true,
				closeAction: 'hide',
				title:'Copy/past query',
				draggable:true,
				modal: false,
				hideMode:'offsets',
				width: 365,
				height: 300,
				//minWidth: 400,
				//maxWidth: 600,
				//maxHeight: 600,
				//modal : true,
				resizable :false,
				layout: 'fit',
				//bodyStyle: 'padding: 5px;',
				listeners:{
						/*afterrender: function(window,e){},*/										
						/*hide: function(component,eOpts){
						
							var op=BSG.util.getComponent('verticalleftpanel',0);
							BSG.variables.tabWindow.removeAll(false);
							op.show();
							op.add(BSG.variables.verticalTabPanel);
							op.doLayout();
							
						}*/
					},
				items:[{
					xtype: 'textareafield',
					id:'queryTextAreaField',
					//grow:true,
					name:'message'		
					}],
				dockedItems:[{
					dock:'top',
					xtype:'toolbar',
					height:30
				}],
				buttons:[{
					text: 'Reload',
					iconCls: 'refresh',							
					itemId: 'buttonReloadQuery',
					id: 'buttonReloadQuery',
					handler: function() {
						BSG.util.getComponent('#queryWindow toolbar',0).update('');
						BSG.util.getComponent('#queryTextAreaField',0).setValue(Ext.JSON.encode(BSG.util.buildQueryObject()));
					}
				},{
					text: 'Set',
					iconCls: 'add',							
					itemId: 'buttonAddQuery',
					id: 'buttonAddQuery',
					handler: function() {		
						BSG.util.decodeQuery(BSG.util.getComponent('#queryTextAreaField',0).getValue());					
					}}]
				});		
			};
			//change window visibility
			if (BSG.variables.queryWindow.isVisible()) {
				BSG.variables.queryWindow.hide();
			} else{
			   BSG.util.getComponent('#queryWindow toolbar',0).update('');
			   BSG.util.getComponent('#queryTextAreaField',0).setValue(Ext.JSON.encode(BSG.util.buildQueryObject()));
			   BSG.variables.queryWindow.show();}
	},
	
	onClickDetachTab:function(button,e,eOpts){	
	if(!BSG.variables.tabWindow){
			BSG.variables.tabWindow=Ext.create('widget.window', {
			id: 'tabWindow',
			itemId: 'tabWindow',
			closable: false,
			//closeAction: 'hide',
			draggable:true,
			modal: false,
			hideMode:'offsets',
			width: 390,
			height: 600,
			//minWidth: 400,
			//maxWidth: 600,
			//maxHeight: 600,
			//modal : true,
			resizable :true,
			layout: 'fit',
			//bodyStyle: 'padding: 5px;',
			listeners:{
					/*afterrender: function(window,e){},*/										
					/*hide: function(component,eOpts){
					
						var op=BSG.util.getComponent('verticalleftpanel',0);
						BSG.variables.tabWindow.removeAll(false);
						op.show();
						op.add(BSG.variables.verticalTabPanel);
						op.doLayout();
						
					}*/
				}	
			});		
		};
		
		//change window visibility
		if (!BSG.variables.tabWindow.isVisible()) {
				//BSG.variables.tabWindow.hide(null, function() {});
					BSG.variables.tabWindow.show(null, function() {
						var vlp=BSG.util.getComponent('verticalleftpanel',0);
						var vrp=BSG.util.getComponent('verticalrightpanel',0);
						vlp.removeAll(false);
						vrp.removeAll(false);
						BSG.variables.tabWindow.add(BSG.variables.verticalTabPanel);
						BSG.variables.tabWindow.doLayout();						
						vlp.hide();
						vrp.hide();
						
						BSG.util.redrawMap(BSG.map.map);
						
						});
					}	
		},	
	onClickAttachTabArrow:function(button,e,eOpts){
			//console.log(button.xtype);
			var vrp=BSG.util.getComponent('verticalrightpanel',0);
			var vlp=BSG.util.getComponent('verticalleftpanel',0);
			
			if(button.xtype=="attachlefttabbutton"){			
				if(vrp.isVisible()){
					vrp.removeAll(false);
					vlp.add(BSG.variables.verticalTabPanel);
					vlp.show();	
					vlp.doLayout();
					vrp.hide();
								
				}
				else if (BSG.variables.tabWindow && BSG.variables.tabWindow.isVisible()) {
					BSG.variables.tabWindow.hide(null, function() {					
					BSG.variables.tabWindow.removeAll(false);
					vlp.show();
					vlp.add(BSG.variables.verticalTabPanel);
					vlp.doLayout();				
					});
				}	
			}
			else{
			if(vlp.isVisible()){
					vlp.removeAll(false);
					vrp.add(BSG.variables.verticalTabPanel);
					vlp.hide();
					vrp.show();
					vrp.doLayout();						
				}
				else if (BSG.variables.tabWindow && BSG.variables.tabWindow.isVisible()) {
					BSG.variables.tabWindow.hide(null, function() {					
					BSG.variables.tabWindow.removeAll(false);
					vrp.show();
					vrp.add(BSG.variables.verticalTabPanel);
					vrp.doLayout();				
					});
				}			
			}		
		},	
	
	onClickAttachGridArrow:function(button,e,eOpts){
	//console.log(button.xtype);
			var htp=BSG.util.getComponent('horizontaltoppanel',0);
			var hbp=BSG.util.getComponent('horizontalbottompanel',0);
			
			if(button.xtype=="attachtopgridbutton"){			
				if(hbp.isVisible()){
					hbp.removeAll(false);
					hbp.hide();
					htp.add(BSG.variables.horizontalPanelCore);
					htp.show();				
					htp.doLayout();							
				}
				else if (BSG.variables.gridWindow && BSG.variables.gridWindow.isVisible()) {
					BSG.variables.gridWindow.hide(null, function() {					
					BSG.variables.gridWindow.removeAll(false);					
					htp.add(BSG.variables.horizontalPanelCore);					
					htp.show();
					htp.doLayout();					
					});
				}	
			}
			else{
			if(htp.isVisible()){
					htp.removeAll(false);
					htp.hide();			
					hbp.add(BSG.variables.horizontalPanelCore);
					hbp.show();							
					hbp.doLayout();			
				}
				else if (BSG.variables.gridWindow && BSG.variables.gridWindow.isVisible()) {
					BSG.variables.gridWindow.hide(null, function() {					
					BSG.variables.gridWindow.removeAll(false);
					hbp.add(BSG.variables.horizontalPanelCore);										
					hbp.show();
					hbp.doLayout();					
					});
				}			
			}
	
	},	
	
	//events for query toolbar
	onClickQueryButton:function(button,e,eOpts){	
		var a=BSG.util.getComponent('spatialform',0).getForm();	
		var b=BSG.util.getComponent('levelform',0).getForm();
		var c=BSG.util.getComponent('attributeform',0).getForm();
		var d=BSG.util.getComponent('abstractform',0).getForm();		
		if (a.isValid() && b.isValid() && c.isValid() && d.isValid()){
			var query=BSG.util.buildQueryParamsObject();
			console.log(query);					
			//set the query parameters as extraparams,load the first page
			Ext.data.StoreManager.lookup('Articles').proxy.extraParams=query;						
			Ext.data.StoreManager.lookup('Articles').loadPage(1,{
									params:{
											start:0,
											limit: BSG.variables.itemsPerPage
										},
									callback: function(records, operation, success) {
											//set the pagenumber in the paging toolbar to 1
											//BSG.util.getComponent('#gridPaging textfield',0).setValue(1);
											//BSG.util.getComponent('#gridPaging button',0).disable();
											//BSG.util.getComponent('#gridPaging button',1).disable();
									}
			});
		}else{
			console.log('forms not valid');
		}	
	},

	onClickLoadQueryButton:function(button,e,eOpts){
		var a=localStorage.getItem('BSG.LocalStorage.Query.'+BSG.variables.queryNumber);
		//console.log('onClickLoadQueryButton');
		if (a){BSG.util.decodeQuery(a);}		
		else{  //no query in localstore
			//alert('not present');
		}
	},
	onClickSaveQueryButton:function(button,e,eOpts){	
		var queryObj=BSG.util.buildQueryObject();		
		//access the form values and create an object
		localStorage.removeItem('BSG.LocalStorage.Query.'+BSG.variables.queryNumber);
		localStorage.setItem('BSG.LocalStorage.Query.'+BSG.variables.queryNumber, Ext.JSON.encode(queryObj));
		//console.log('onClickSaveQueryButton');
		//var cq='querydetailsradiogroup #radio'+BSG.variables.queryNumber;
		BSG.util.getComponent('querydetailsradiogroup #radio'+BSG.variables.queryNumber,0).boxLabelEl.setStyle({color:"red"});
	
	},
	onClickDeleteQueryButton:function(button,e,eOpts){
	
		localStorage.removeItem('BSG.LocalStorage.Query.'+BSG.variables.queryNumber);
		//console.log('onClickDeleteQueryButton');
		var cq='querydetailsradiogroup #radio'+BSG.variables.queryNumber;
		BSG.util.getComponent(cq,0).boxLabelEl.setStyle({color:"black"});
	
	},
	onQueryDetailsRadioGroupChange:function(field,newValue,oldValue,eOpts){		
		//this event is fired twice, get only the second, the first generate an array the second only the needed value
		if(!field.lastValue.query[0]){
			BSG.variables.queryNumber=field.lastValue.query;
			//console.log(BSG.variables.queryNumber)		
		};			
	},
	//when rendering the radiogroup set red color if localstorage is found
	onQueryDetailsRadioGroupAfterRender:function(component,eOpts){
		if(localStorage.getItem('BSG.LocalStorage.Query.1')){
		BSG.util.getComponent('querydetailsradiogroup #radio1',0).boxLabelEl.setStyle({color:"red"});
		}
		if(localStorage.getItem('BSG.LocalStorage.Query.2')){
		BSG.util.getComponent('querydetailsradiogroup #radio2',0).boxLabelEl.setStyle({color:"red"});
		}
		if(localStorage.getItem('BSG.LocalStorage.Query.3')){
		BSG.util.getComponent('querydetailsradiogroup #radio3',0).boxLabelEl.setStyle({color:"red"});
		}
		if(localStorage.getItem('BSG.LocalStorage.Query.4')){
		BSG.util.getComponent('querydetailsradiogroup #radio4',0).boxLabelEl.setStyle({color:"red"});
		}
		if(localStorage.getItem('BSG.LocalStorage.Query.5')){
		BSG.util.getComponent('querydetailsradiogroup #radio5',0).boxLabelEl.setStyle({color:"red"});
		}
	},	
	
	onselectBiblioGrid:function(rowModel,record,index,eOpts ){
		
		//refresh the graph
		if(BSG.variables.graphWindow && BSG.variables.graphWindow.isVisible()){
			BSG.store.store6.loadData(BSG.util.generateLevelData());
		}
		
		//refresh the details tab
		BSG.variables.tplArticleViewDetail.overwrite(BSG.util.getComponent('#detailsTab',0).body, record.data);
	
		//save the selected row index and the article_id
		BSG.variables.selectedRow=index;
		BSG.variables.selectedArticleId=record.data.id;
		//if I did not press a button on the gridrow fire tabchange event to load data
		if(!BSG.variables.selectedOnGrid){
			BSG.util.getComponent('bibliogrid',0).fireTabChange();
			//console.log('select '+BSG.util.getComponent('detailgridtab',0).getActiveTab().id);
		}		
	}
	});