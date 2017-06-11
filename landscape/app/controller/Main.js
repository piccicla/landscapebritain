Ext.define('BSG.controller.Main',{
	
	extend:'Ext.app.Controller',	
	stores:['Layers','LayerNames','Abstracts','ImagesView','Graphs'],
	
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
						/*'<b>Link:</b>',
						'<tpl if="this.isHttpUrl(values.LINK)">',
							'<span><a href="{LINK}" target="_blank">go to site</a></span><br/>',
						'</tpl>',
						'<tpl if="this.isHttpUrl(values.LINK) == false">',
								'<span><a href="{["pdf/"+this.getLast(values.LINK,"/")]}" target="_blank">{[this.getLast(values.LINK,"/")]}</a></span><br/>',									
						'</tpl>',*/						
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
			//BSG.util.generateGraphDataStore();
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
				expand:this.onComboboxFeatureExpand,
				select:this.onComboboxFeatureSelect
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
			'requerybutton':{
				click:this.onClickRequeryButton
			},
			'lengthbutton':{
				click:this.onClickLengthButton
			},
			'areabutton':{
				click:this.onClickAreaButton
			},
			'deselectbutton':{
				click:this.onClickDeselectButton
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
			},
			'#featureRadius':{
				change:this.onChangeFeatureRadius
			},
			'#featureButtonBuffer':{
				click:this.onClickFeatureButtonBuffer
			},
			'#featureButtonHelp':{
				click:this.onClickFeatureButtonHelp
			},
			'#drawRadius':{
				change:this.onChangeDrawRadius
			},
			'#drawButtonBuffer':{
				click:this.onClickDrawButtonBuffer
			},
			'#radiogroupReportType':{
				change:this.onChangeradiogroupReportType
			},
			'deletequerybutton':{
				click:this.onClickDeleteQuery
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
	onClickDeleteQuery:function(but,e,eOpts){
		//deactivate clusters download
		BSG.map.bboxStrat.deactivate();
		//delete the bboxes and clusters
		BSG.util.destroyFeatures('BBoxes');
		BSG.map.map.selectCtrl.unselectAll();
		BSG.variables.selectedFeatures=[];
		BSG.util.destroyFeatures('Features');
		//delete grid
		BSG.util.getComponent('bibliogrid',0).store.removeAll();
		//Ext.data.StoreManager.lookup('SingleArticles').removeAll();
		//Ext.data.StoreManager.lookup('Articles').removeAll();
		//init grid parameters
		BSG.util.initDetail();
		//set default green button
		BSG.util.changeButtonIcons('requerybutton','refresh');
		//delete the paging toolbar data	
		BSG.util.refreshPaging(BSG.util.getComponent('#gridPaging',0));		
	},
	//this is called when you change the report type, it is used to react to a multiple selection
	onChangeradiogroupReportType:function(field,newValue,oldValue,eOpts){
		if(newValue.REPORTTYPE=='multiple'){
			//disable select control on the map, deselect all
			BSG.map.map.selectCtrl.unselectAll();
			BSG.map.map.selectCtrl.deactivate();
			BSG.util.destroyFeatures('BBoxes');
			BSG.variables.selectedFeatures=[];
			BSG.util.getComponent('#bibliogrid',0).getSelectionModel().deselectAll();
			BSG.util.initDetail();
			//disable select event on the grid (set variable)
			BSG.variables.canSelectMulti=true;
			//enable multiple selection on the grid
			BSG.util.getComponent('bibliogrid',0).selModel.setSelectionMode('MULTI')
		}
		else{
			//enable select control on the map
			BSG.map.map.selectCtrl.activate();
			//enable select event on the grid(set variable)
			BSG.variables.canSelectMulti=false;
			//disable multiple selection on the grid
			BSG.util.getComponent('bibliogrid',0).selModel.setSelectionMode('SINGLE')
			//if there is something selected more than 1 then deselect all
			if(BSG.util.getComponent('#bibliogrid',0).getSelectionModel().selected.length>1){ 
				BSG.util.getComponent('#bibliogrid',0).getSelectionModel().deselectAll();
				BSG.util.initDetail();
			}
		};
	}, 
	//enable/disable button for buffering visualization
	onChangeFeatureRadius:function(field,newValue,oldValue,eOpts){
		//console.log(newValue);
		//if(newValue>0 && newValue<=1000)
		//when 0 you should get the original feature
		if(newValue<=1000)
		{BSG.util.getComponent('#featureButtonBuffer',0).enable()}else{BSG.util.getComponent('#featureButtonBuffer',0).disable()}
	},
	onChangeDrawRadius:function(field,newValue,oldValue,eOpts){
		//if(newValue>0 && newValue<=1000)
		if(newValue<=1000)
		{BSG.util.getComponent('#drawButtonBuffer',0).enable()}else{BSG.util.getComponent('#drawButtonBuffer',0).disable()}
	},
	onClickLengthButton:function(but,e,eOpts){
		if (but.pressed) {
			but.setIconCls('lengthIconPress');
			BSG.variables.areaButton.setIconCls('areaIcon');
			BSG.variables.areaButton.pressed = false;
			BSG.util.toggleMeasureControl(but, 'line');
		}
		else {
			but.setIconCls('lengthIcon');
			BSG.util.toggleMeasureControl(but, 'line');	
		}
	},		
	onClickAreaButton:function(but,e,eOpts){
		if (but.pressed) {
			but.setIconCls('areaIconPress');
			BSG.variables.lengthButton.setIconCls('lengthIcon');
			BSG.variables.lengthButton.pressed = false;
			BSG.util.toggleMeasureControl(but, 'polygon');
		}
		else {
			but.setIconCls('areaIcon');
			BSG.util.toggleMeasureControl(but, 'polygon');
		}
	},
	onClickFeatureButtonBuffer:function(but,e,eOpts){
		//console.log('FeatureBuffer');
		//TODO get the feature and call the database to get the features
		var par={};	
		var a=BSG.util.getComponent('spatialform',0).getForm();
		if(a.isValid()){		
			var v=a.getValues();
			var par={};
			if(v.LAYER){				
					par.layer=v.LAYER;					
					if(v.FEATURENAME){					
					par.featurename=v.FEATURENAME;
					if(v.LAYERRADIUS!=0 && v.LAYERRADIUS!=""){
							par.buffer=parseFloat(v.LAYERRADIUS);
							par.unit=v.UNITBUFFER;		 
						}
					BSG.util.ajaxRequest('getPlaces/bufferFeature.php','post',par,'FeatureBuffer',false);
					}
			}
		}
	},
	onClickFeatureButtonHelp:function(but,e,eOpts){
		var v=BSG.util.getComponent('#comboboxLayer',0).getRawValue();
		if(v!==''){
			window.open('help/'+v.toLowerCase()+'.html');
		}
	},
	onClickDrawButtonBuffer:function(but,e,eOpts){
		//console.log('draw buffer');
		//TODO get the feature and call the database to get the features
		var par={};
		var a=BSG.util.getComponent('spatialform',0).getForm();
		var v=a.getValues();
		if( a.isValid() && BSG.map.map.getLayersByName('Query layer')[0].features[0]){				
					//clone the geometry before transforming coordinates					
					var ql=BSG.map.map.getLayersByName('Query layer')[0].features[0].geometry.clone();
					//access geometry and write an array
						switch (ql.CLASS_NAME)
						{
						case 'OpenLayers.Geometry.Point':							
							var arr=new Array(1);
							arr[0]=new Array(2);
							var cl=ql.getCentroid().transform(BSG.map.proj900913,BSG.map.proj);
							arr[0][0]=cl.x;
							arr[0][1] =cl.y;
							par.ftype='point';
							par.coord=Ext.encode(arr);
							break;
						case 'OpenLayers.Geometry.LineString':
							var b=ql.getVertices();
							var arr=new Array(b.length);
							for(i=0; i<b.length; i++){
								arr[i] = new Array(2);
								var o=b[i].transform(BSG.map.proj900913,BSG.map.proj);
								arr[i][0] = o.x;
								arr[i][1] = o.y;		
							}
							par.ftype='line';
							par.coord=Ext.encode(arr);
							break;
						case 'OpenLayers.Geometry.Polygon':
							//check for selfintersection before writing the object
							if (!BSG.util.checkSelfIntersection(ql)){							
								var b=ql.getVertices();
								var length=(b.length)+1;
								var arr=new Array(length);
								for(i=0; i<b.length; i++){
									arr[i] = new Array(2);
									var o=b[i].transform(BSG.map.proj900913,BSG.map.proj);
									arr[i][0] = o.x;
									arr[i][1] = o.y;			
								}
								//set the last vertex equal to the first (this is needed by postgis)
								arr[b.length] = new Array(2);				
								arr[b.length][0] = b[0].x;
								arr[b.length][1] = b[0].y;	
								par.ftype='polygon';
								par.coord=Ext.encode(arr);
							}//else{throw new Error('The polygon is self intersecting!');}
							break;
						} 

					if(v.DRAWRADIUS!=0 && v.DRAWRADIUS!=""){
						par.radius=parseFloat(v.DRAWRADIUS);
						par.unit=v.UNITDRAWBUFFER;		
					}	
				BSG.util.ajaxRequest('getPlaces/bufferGeometry.php','post',par,'GeometryBuffer',false);	
		}
		//else{throw new Error('The geometry is empty!');}
	},
	//called when click the deselect button
	onClickDeselectButton:function(but,e,eOpts){
		//clear boxes and deselect all, also from the grid
		BSG.util.destroyFeatures('BBoxes');
		BSG.map.map.selectCtrl.unselectAll();
		BSG.variables.selectedFeatures=[];
		BSG.util.getComponent('#bibliogrid',0).getSelectionModel().deselectAll();
		BSG.util.initDetail();
	},
	//this is used to requery with the old parameters
	onClickRequeryButton:function(but,e,eOpts){
		BSG.util.refreshGridPaging();
	},
	//deactivate the query feature when changing tab
	onVerticalTabPanelChange:function(tabPanel,newCard,oldCard,eOpts ){
		if(!BSG.util.manageQueryFeatureButton(BSG.variables.drawingQuery)){
			BSG.variables.drawingQuery=false;
			BSG.util.toggleQueryControl('clear');
		}
	},
	//deactivate the query feature when expanding the attribute query panel
	onExpandAttributeQueryPanel:function(panel,eOpts ){
		if(!BSG.util.manageQueryFeatureButton(BSG.variables.drawingQuery)){
			BSG.variables.drawingQuery=false
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
				//enable this drawing or disable all the drawing				
				if(BSG.util.manageQueryFeatureButton(BSG.variables.drawingQuery)){
					BSG.variables.drawingQuery=!BSG.variables.drawingQuery;
					BSG.util.toggleQueryControl('point');
					BSG.util.getComponent('#drawPointButton',0).setText('<b style="color:red">Press when complete</b>')
					BSG.util.getComponent('#drawLineButton',0).disable(true);
					BSG.util.getComponent('#drawPolygonButton',0).disable(true);
					BSG.util.getComponent('#drawBoxButton',0).disable(true);
				}else{
					BSG.variables.drawingQuery=!BSG.variables.drawingQuery;
					BSG.util.toggleQueryControl('stop');
				}
			 break;
			 case 'drawLineButton':				
				if(BSG.util.manageQueryFeatureButton(BSG.variables.drawingQuery)){
					BSG.variables.drawingQuery=!BSG.variables.drawingQuery;
					BSG.util.toggleQueryControl('line');
					BSG.util.getComponent('#drawLineButton',0).setText('<b style="color:red">Press when complete</b>')
					BSG.util.getComponent('#drawPointButton',0).disable(true);
					BSG.util.getComponent('#drawPolygonButton',0).disable(true);
					BSG.util.getComponent('#drawBoxButton',0).disable(true);
				}else{
					BSG.variables.drawingQuery=!BSG.variables.drawingQuery;
					BSG.util.toggleQueryControl('stop');
				}
			 break;
			 case 'drawPolygonButton':				
				if(BSG.util.manageQueryFeatureButton(BSG.variables.drawingQuery)){
					BSG.variables.drawingQuery=!BSG.variables.drawingQuery;
					BSG.util.toggleQueryControl('polygon');
					BSG.util.getComponent('#drawPolygonButton',0).setText('<b style="color:red">Press when complete</b>')
					BSG.util.getComponent('#drawLineButton',0).disable(true);
					BSG.util.getComponent('#drawPointButton',0).disable(true);
					BSG.util.getComponent('#drawBoxButton',0).disable(true);
				}else{
					BSG.variables.drawingQuery=!BSG.variables.drawingQuery;
					BSG.util.toggleQueryControl('stop');
				}
			 break;
			 case 'drawBoxButton':				
				if(BSG.util.manageQueryFeatureButton(BSG.variables.drawingQuery)){
					BSG.variables.drawingQuery=!BSG.variables.drawingQuery;
					BSG.util.getComponent('#drawBoxButton',0).setText('<b style="color:red">Press when complete</b>')
					BSG.util.getComponent('#drawLineButton',0).disable(true);
					BSG.util.getComponent('#drawPointButton',0).disable(true);
					BSG.util.getComponent('#drawPolygonButton',0).disable(true);
					BSG.map.drawControls['box'].handler.stopDown = true;
					BSG.map.drawControls['box'].handler.stopUp = true;
					BSG.util.toggleQueryControl('box');
				}else{
					BSG.variables.drawingQuery=!BSG.variables.drawingQuery;
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
			
			//console.log(l);

			
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
				width: 200,
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
				//console.log('TODO: hide layer '+node.data.text);
				BSG.map.map.getLayersByName(node.data.text)[0].setVisibility(false);
			}else{		
				//console.log('TODO: show layer '+node.data.text);
				//console.log('TODO: create a rue function to etlayer data');
				var a=BSG.map.map.getLayersByName(node.data.text)[0];
				a.setVisibility(true);
				//check if the dissallowed the ajax request using the custom 'hideAjaxRequest' parameter when creating the layer
				var b=a.hideAjaxRequest||false;
				if(a.features.length==0 && !b){
							//start progressbar animation
							var t=BSG.util.getComponent('#progressBar',0);
							t.wait({text: 'Downloading'});
							t.show();
							var requestLayer = Ext.Ajax.request({
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
									   },
									   failure:function(response, options){
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
		sel.getAt(1).items.getAt(0).setValue("");
		sel.getAt(1).items.getAt(0).setRawValue("");
		sel.getAt(2).items.getAt(0).setValue("0");
		BSG.map.map.getLayersByName('FeatureBuffer')[0].destroyFeatures();
	},
	//onClickButtonSetDrawFeature:function(but,e,eOpts){console.log('onClickButtonSetDrawFeature')},
	onClickButtonClearDrawFeature:function(but,e,eOpts){
		var dr=BSG.util.getComponent('spatialform fieldset',2).items;
		dr.getAt(4).items.getAt(0).setValue("0");
		var l=BSG.map.map.getLayersByName('Query layer')[0];
		l.destroyFeatures();
		l.redraw();	
		//deactivate all controls
		if(!BSG.util.manageQueryFeatureButton(BSG.variables.drawingQuery)){
			BSG.variables.drawingQuery=false;
			BSG.util.toggleQueryControl('clear');
		}
		BSG.map.map.getLayersByName('GeometryBuffer')[0].destroyFeatures();		
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
			//console.log('must load details data');			
		  }  
		  break;
		case 'abstractTab':
		  if(BSG.variables.abstractID!=BSG.variables.selectedRow){
			BSG.variables.abstractID=BSG.variables.selectedRow;
			//console.log('must load abstract data');	
			
			this.getAbstractsStore().load(												
				{
				params: {
					id: BSG.variables.selectedArticleId
				},
				callback: function(records, operation, success) {						
						if (success) {
							if(records[0]){
									//get the keywords and highlight the text
									if(BSG.variables.abstractKeywords.length>0){
									BSG.util.getComponent('#abstractTab',0).update(BSG.util.highlight(records[0].data.TEXT, BSG.variables.abstractKeywords));
									}else{
									BSG.util.getComponent('#abstractTab',0).update(records[0].data.TEXT);
									}
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
		if (!BSG.map){
			BSG.map=BSG.map||{};
			BSG.map.apiKey ="Au7OUsIHM13kOS-CYjc5_-0jpXdt5TYxn7XEMCZZyXE9SiW5JIkgBD70bXHHFmN5";
			BSG.map.proj = new OpenLayers.Projection("EPSG:4326");
			BSG.map.proj900913=new OpenLayers.Projection("EPSG:900913");
			BSG.map.geojson_format = new OpenLayers.Format.GeoJSON({
                        'internalProjection': new OpenLayers.Projection("EPSG:900913"),
                        'externalProjection': new OpenLayers.Projection("EPSG:4326")
			});
			//the map zoom levelzoom
			BSG.map.zoomLevel=-1;
			//this will store the query to get the features
			BSG.map.query='';
			
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
																				
			BSG.map.map= new OpenLayers.Map("mappanel-body",options);
			//todo finish feature selection
			/*BSG.map.map.events.register('moveend', BSG.map.map, function(evt){
                    //console.log(evt);
					//console.log(BSG.util.getZoom());	
					/*if(BSG.map.zoomLevel==BSG.util.getZoom()){
						var x=BSG.variables.selectedFeatures
						for(i=0; i<x.length; i++) {
							BSG.map.map.selectCtrl.select(BSG.map.map.getLayersByName('Features')[0].getFeaturesByAttribute("id",x[i])[0]);
						}	
					}else{
					BSG.map.zoomLevel=BSG.util.getZoom();}					
                });*/
				
				BSG.map.map.events.register('zoomend', BSG.map.map, function(evt){
					//console.log(evt);
					//BSG.util.reselectFeatures('Features');	
				});

				
			var renderer = OpenLayers.Layer.Vector.prototype.renderers;
					
			var baseMap = new OpenLayers.Layer.OSM("Open Street Map");
			
			var road = new OpenLayers.Layer.Bing({
				key: BSG.map.apiKey,
				type: "Road",
				name: "Road"
			});
			var aerial = new OpenLayers.Layer.Bing({
				key: BSG.map.apiKey,
				type: "Aerial",
				name: "Aerial"
			});
			var hybrid = new OpenLayers.Layer.Bing({
				key: BSG.map.apiKey,
				type: "AerialWithLabels",
				name: "Aerial With Labels"
			});
			
			//////////////
			//layer NCA degug
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
									fontColor: "red",
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
					
			var nca=new OpenLayers.Layer.Vector('NationalCharacterAreas',{
					styleMap: new OpenLayers.StyleMap({'default':styleNCA
							})
			});
			//limit the geometry for this layer
			nca.geometryType=OpenLayers.Geometry.MultiPolygon;
			nca.setVisibility(false);
			
			//query layer
			var styleQueryFeature = new OpenLayers.Style({
			externalGraphic: 'style/flag.png',
			graphicWidth:32,
			graphicHeight:32,
			graphicOpacity:1,
			graphicXOffset:-4,
			graphicYOffset:-30,
			strokeColor: "blue",
			strokeOpacity: 1,
			strokeWidth: 3,
			strokeDashstyle:'longdashdot',
			//fillColor: "#FF5500",
			fillOpacity: 0.0,
			pointRadius: 6
			//,pointerEvents: "visiblePainted"
					// label with \n linebreaks		
			});
			
			//this layer is for drawing a query boundary(point, line or polygon)
			var queryFeature=new OpenLayers.Layer.Vector('Query layer',{
				displayInLayerSwitcher:false,
				//this is a custom property, it is used to disable the layer download request when clicking in the table of map contents
				hideAjaxRequest:true,
				styleMap: new OpenLayers.StyleMap({'default':styleQueryFeature}),
				eventListeners:{					
				'beforefeatureadded':function(a,b){
					//console.log('before feature added');
					if(a.feature.geometry.CLASS_NAME=="OpenLayers.Geometry.Point"){
						BSG.util.destroyFeatures('Query layer');
						BSG.map.map.getLayersByName('GeometryBuffer')[0].destroyFeatures();	
					}
				}
				}
			});
			
			//style for buffers
			var styleBuffer = new OpenLayers.Style({
				//strokeColor: "blue",
				strokeOpacity: 0.4,
				fillColor: "green",
				fillOpacity: 0.3
			});			
			//layers for buffering a database feature
			var bufferFeature=new OpenLayers.Layer.Vector('FeatureBuffer',{
				displayInLayerSwitcher:false,
				//this is a custom property, it is used to disable the layer download request when clicking in the table of map contents
				hideAjaxRequest:true,
				//styleMap: new OpenLayers.StyleMap({'default':styleQueryFeature}),
				eventListeners:{}
			});	
			//layers for buffering our geometry for quering
			var bufferGeometry=new OpenLayers.Layer.Vector('GeometryBuffer',{
				styleMap: new OpenLayers.StyleMap({'default':styleBuffer}),
				displayInLayerSwitcher:false,
				//this is a custom property, it is used to disable the layer download request when clicking in the table of map contents
				hideAjaxRequest:true,
				//styleMap: new OpenLayers.StyleMap({'default':styleQueryFeature}),
				eventListeners:{}
			});	
			
			
			var clusterStyle = new OpenLayers.Style({
                    label: "${getNumber}",
					fontColor: "#000000",
                    labelSelect: true,
                    pointRadius: "${getRadius}",
                    fillColor: "${col}",
                    fillOpacity: "${op}",
                    strokeColor: "#000000",
                    strokeWidth: 1,
                    strokeOpacity: 0.3,
                    //externalGraphic: "${graph}",
                    graphicWidth: 25,
                    graphicHeight: 23
                }, {
                    context: {
						getRadius:function(feature){
									if (feature.attributes.count == 1) {
										return 5;
									}
									else {
										return 12;
									}
									},
                        col: function(feature){
                                if (feature.attributes.count > 1) {
                                    return '#00ff00';
                                }
                                else {
                                    return '#ffde00';
                                } 
                        },
						op:function(feature){
							if (feature.attributes.count > 1) {
										return 0.5;
									}
									else {
										return 0.9;
									} 
						},
                        /*graph: function(feature){
                            if (isCluster) {
                                {
                                    if (feature.attributes.count == 1) {
                                        return 'images/' + feature.cluster[0].attributes.type + '.png';
                                    }
                                    else {
                                        return '';
                                    }
                                }
                            }
                            else {
                                return '';
                            }
                        },*/
                        getNumber: function(feature){
                                if (feature.attributes.count == 1) {
                                    return '';
                                }
                                else {
                                    return feature.attributes.count;
                                }
                        }
                    }
                });
                
                var clusterSelStyle = new OpenLayers.Style({
                    fillColor: "#ff0000",
                    strokeColor: "#3399ff",
                    //externalGraphic: "${graph}",
                    graphicWidth: 25,
                    graphicHeight: 23
                }, {
                    context: {
                        /*graph: function(feature){
                        
                            if (isCluster) {
                                if (feature.attributes.count == 1) {
                                    return 'images/' + feature.cluster[0].attributes.type + 'S.png';
                                }
                                else {
                                    return '';
                                }
                            }
                            else {
                                return '';
                            }
                        }*/
                    }
                });
                
                var clusterTemp = new OpenLayers.Style({
                    label: "${getNumber}",
                    labelSelect: true,
                    cursor: "pointer",
                    pointRadius: "${getRadius}",
                    fillColor: "#ffff00",
                    strokeColor: "#ff0000",
                    //externalGraphic: "${graph}",
                    graphicWidth: 25,
                    graphicHeight: 23
                }, {
                    context: {
						getRadius:function(feature){
								if (feature.attributes.count == 1) {
                                    return 5;
                                }
                                else {
                                    return 12;
                                }
								},
                        /*graph: function(feature){
                            if (isCluster) {
                                if (feature.attributes.count == 1) {
                                    return 'images/' + feature.cluster[0].attributes.type + 'H.png';
                                }
                                else {
                                    return '';
                                }
                            }
                            else {
                                return '';
                            }
                        },*/
                        getNumber: function(feature){
                         
                                if (feature.attributes.count == 1) {
                                    return '';
                                }
                                else {
                                    return feature.attributes.count;
                                }
                            
                        }
                    }
                
                });
                
                var clusterStyleMap = new OpenLayers.StyleMap({
                    'default': clusterStyle,
                    'temporary': clusterTemp,
                    'select': clusterSelStyle
                });
                
			
			//create a strategy but deactivate the bbox strategy now, you'll activate it when you query and get the query string
			BSG.map.bboxStrat=new OpenLayers.Strategy.BBOX({resFactor: 1,ratio:1.3,autoActivate:false});
			
			//TODO finish adding the feature layer

			
			BSG.map.HTTPProt=new OpenLayers.Protocol.HTTP({
									url: 'getPlaces/features.php',
									params: {
										//the map zoom
										//zoom: BSG.map.map.getZoom(),
										//the query text (should get this with the data used to fill the grid)
										//query:BSG.map.query,
										//I did this because the bbox
										//top:BSG.map.map.getExtent().transform(BSG.map.proj900913,BSG.map.proj).top,
										//left:BSG.map.map.getExtent().transform(BSG.map.proj900913,BSG.map.proj).left,
										//bottom:BSG.map.map.getExtent().transform(BSG.map.proj900913,BSG.map.proj).bottom,
										//right:BSG.map.map.getExtent().transform(BSG.map.proj900913,BSG.map.proj).right
									},
									srsInBBOX:false,
									readWithPOST: true,
									format: BSG.map.geojson_format
									//function to call when the read, create, update, delete or commit operation 
									//is not working.......
									/*callback:function(response){
										console.log('blblblbl');
									}*/
									//callback:BSG.util.reselectFeatures
								});
			
			//layer to visualize centroids
			var features = new OpenLayers.Layer.Vector("Features", {
                    displayInLayerSwitcher:false,
					strategies: [BSG.map.bboxStrat],
                    protocol: BSG.map.HTTPProt,
					styleMap: clusterStyleMap,
					eventListeners:{					
					'featuresadded':function(a,b){
						//console.log(a);
						//console.log(b);
						//call this because when i pan/zoom the data is refreshed and i need to reselect the features
						BSG.util.reselectFeatures('Features');
					}
					}
                    //,styleMap: new OpenLayers.StyleMap(style)
                });
				
				
			/*features.events.register('featuresadded', features, function(evt){
					console.log(f);
			
				});*/
		
			//layer to visualize the bboxes
			var bboxes=new OpenLayers.Layer.Vector('BBoxes',{displayInLayerSwitcher:false});
						
			//controls to draw feauture to query the map
			BSG.map.drawControls = {
                    point: new OpenLayers.Control.DrawFeature(queryFeature,
                        OpenLayers.Handler.Point,{
						/*callbacks:{
							point:function(a){
								BSG.util.destroyOtherFeatures('Query layer',a);
								//BSG.util.destroyFeatures('Query layer');
								//BSG.map.map.getLayersByName('Query layer')[0].addFeatures([a]);
								//BSG.map.map.getLayersByName('Query layer')[0].redraw();									
								}
							}*/
						}
						),
						line: new OpenLayers.Control.DrawFeature(queryFeature,
							OpenLayers.Handler.Path,{
							callbacks:{
								//done:function(a){
								//BSG.util.destroyOtherFeatures('Query layer',a);
								//BSG.util.destroyFeatures('Query layer');
								//BSG.map.map.getLayersByName('Query layer')[0].addFeatures([a]);
								//BSG.map.map.getLayersByName('Query layer')[0].redraw();	
								point:function(a){
								 //console.log('added a point');
								 BSG.util.destroyFeatures('Query layer');
								 BSG.map.map.getLayersByName('GeometryBuffer')[0].destroyFeatures();	
								}
								}
							}	
						),
						polygon: new OpenLayers.Control.DrawFeature(queryFeature,
							OpenLayers.Handler.Polygon,{
							callbacks:{
								point:function(a){
								BSG.util.destroyOtherFeatures('Query layer',a);
								BSG.map.map.getLayersByName('GeometryBuffer')[0].destroyFeatures();	
								//BSG.util.destroyFeatures('Query layer');
								//BSG.map.map.getLayersByName('Query layer')[0].addFeatures([a])
								//BSG.map.map.getLayersByName('Query layer')[0].redraw();	
								}
							}
						}
						),
						box: new OpenLayers.Control.DrawFeature(queryFeature,
							OpenLayers.Handler.RegularPolygon, {
								handlerOptions: {
									sides: 4,
									irregular: true
								},
								callbacks:{
								create:function(a){
									BSG.util.destroyFeatures('Query layer');
									BSG.map.map.getLayersByName('GeometryBuffer')[0].destroyFeatures();	
									//BSG.util.destroyOtherFeatures('Query layer',a);		
								}
							}
						})
            };
			
			
			for(var key in BSG.map.drawControls) {				
                    BSG.map.map.addControl(BSG.map.drawControls[key]);
            }
			

			///////////////
			BSG.map.map.selectCtrl = new OpenLayers.Control.SelectFeature(features,
                {clickout: false,
				//onUnselect:function(feature){console.log('unselected feature')},
				onSelect:BSG.util.selectFeature}
            );
			
			
			///////measure on the map
			var sketchSymbolizers = {
                    /*"Point": {
                        pointRadius: 4,
                        graphicName: "square",
                        fillColor: "white",
                        fillOpacity: 1,
                        strokeWidth: 1,
                        strokeOpacity: 1,
                        strokeColor: "#333333"
                    },*/
                    "Line": {
                        strokeWidth: 3,
                        strokeOpacity: 1,
                        strokeColor: "#FF0000",
                        strokeDashstyle: "dash"
                    },
                    "Polygon": {
                        strokeWidth: 2,
                        strokeOpacity: 1,
                        strokeColor: "#FF0000",
                        fillColor: "red",
                        fillOpacity: 0.3
                    }
                };
                var styleMeasure = new OpenLayers.Style();
                styleMeasure.addRules([new OpenLayers.Rule({
                    symbolizer: sketchSymbolizers
                })]);
                var styleMapMeasure = new OpenLayers.StyleMap({
                    "default": styleMeasure
                });
                
                BSG.map.measureControls = {
                    line: new OpenLayers.Control.Measure(OpenLayers.Handler.Path, {
                        persist: true,
                        handlerOptions: {
                            layerOptions: {
                                styleMap: styleMapMeasure
                            }
                        }
                    }),
                    polygon: new OpenLayers.Control.Measure(OpenLayers.Handler.Polygon, {
                        persist: true,
                        handlerOptions: {
                            layerOptions: {
                                styleMap: styleMapMeasure
                            }
                        }
                    })
                };
			
			var controlMeasure;
                for (var key in BSG.map.measureControls) {
                    var controlMeasure = BSG.map.measureControls[key];
                    controlMeasure.events.on({
                        "measure": BSG.util.handleMeasurements,
                        "measurepartial": BSG.util.handleMeasurements
                    });
                    BSG.map.map.addControl(controlMeasure);
             }
			
			///////////////
			
			//add layers and deactivate the bbox strategy
			BSG.map.map.addLayers([baseMap,road,aerial,hybrid,nca,queryFeature,bufferFeature,bufferGeometry,features,bboxes]);			
			//BSG.map.bboxStrat.deactivate();
			
			BSG.map.map.addControl(new OpenLayers.Control.MousePosition({
                    element: $('coords')
                }));
				
				
			//add kinetic drag
			BSG.map.map.addControl(new OpenLayers.Control.Navigation({dragPanOptions: {enableKinetic: true}}));	
			//BSG.map.map.addControl(new OpenLayers.Control.LayerSwitcher);

			BSG.map.map.addControl(BSG.map.map.selectCtrl);
			BSG.map.map.selectCtrl.activate();
			
			BSG.map.map.setCenter(new OpenLayers.LonLat(-2.0, 54.0).transform(BSG.map.proj, BSG.map.proj900913), 5);
			//set the params for the http protocol
			/*BSG.map.HTTPProt.options.params= {
										//the map zoom
										zoom: BSG.util.getZoom(),
										//the query text (should get this with the data used to fill the grid)
										query:BSG.map.query,
										//I did this because the bbox
										top:BSG.util.getTop(),
										left:BSG.util.getLeft(),
										bottom:BSG.util.getBottom(),
										right:BSG.util.getRight()
									}*/
		}
		else{
				//render the map again, this is necessary to fix things when you are drawing a query feature (called twice as a workaround to fix google chrome  problem with layers misaligned)
				BSG.map.map.render('mappanel-body');
				BSG.map.map.render('mappanel-body');
			}
	},
	
	//function to set up the combobox for level3
	//eOpts are used when opening a query
	setUpCBL3: function(stateCombo,record,value,eOpts){
		stateCombo.store.clearFilter(true);
		var v;
		if(value){v=value;} else {v=record[0].data.L2_ID;}
		stateCombo.store.filter(
		{
			property: 'L2_ID',
			value: v,
			exactMatch: true
		});		
		if (eOpts==null||eOpts.length==0){
			stateCombo.setValue(null);
		}else{
			stateCombo.setValue(eOpts.L3_ID);
			stateCombo.setRawValue(eOpts.NAME);
		}															
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
	//eOpts can contain 'L2_ID' and 'NAME' if i am opening a query
	oncomboboxLevel1Select: function(combo, record,eOpts) {
		//console.log('comboboxLevel1Select');
		var stateCombo = BSG.util.getComponent('#comboboxLevel2',0);												
		stateCombo.store.clearFilter(true);
		stateCombo.store.filter(
		{
			property: 'L1_ID',
			value: record[0].data.L1_ID,
			exactMatch: true
		});
		//if there are level2 values set them, else set empty 
		if (eOpts){
			stateCombo.setValue(eOpts.L2_ID)
			stateCombo.setRawValue(eOpts.NAME)
		}else{stateCombo.setValue(null);}
		
		//BSG.util.getComponent('#buttonSelectAttribute',0).btnInnerEl.setStyle({color:'black'});
		BSG.util.getComponent('#comboboxLevel2',0).setVisible(true);
		BSG.util.getComponent('#comboboxLevel3',0).setVisible(false);
	},	
	oncomboboxLevel2Select: function(combo, record,eOpts){
		var stateCombo = BSG.util.getComponent('#comboboxLevel3',0);												
		
		if (!BSG.variables.comboboxLevel3Loaded){
			stateCombo.store.load(function(records, operation, success) {							
				if (success){
						BSG.variables.comboboxLevel3Loaded=true;
						BSG.controller.Main.prototype.setUpCBL3(stateCombo,record,null,eOpts);
					}								
			});
		}else{
			BSG.controller.Main.prototype.setUpCBL3(stateCombo,record,null,eOpts);
		}							
	},
	oncomboboxLevel3Select: function(combo, record,eOpts){
		//BSG.util.getComponent('#buttonSelectLevel',0).btnInnerEl.setStyle({color:'red'});		
	},
	onRadioGroupSpatialChange:function(field,newValue,oldValue,eOpts ){
		//console.log(newValue); 	
		//stop draw query feature if active
		if(!BSG.util.manageQueryFeatureButton(BSG.variables.drawingQuery)){
			BSG.variables.drawingQuery=false;
			BSG.util.toggleQueryControl('clear');
		}	
		if(Ext.getCmp('radiogroupSpatial').getChecked()[0].inputValue == 'extent'){
			Ext.getCmp('SpatialFieldSet').disable(true);
			Ext.getCmp('SpatialDrawSet').disable(true);
			Ext.getCmp('buttongroupFeature').disable(true);
			Ext.getCmp('buttongroupDrawFeature').disable(true);
			
			//update query details text
			//BSG.variables.spatialQuery="Current extent<br/>";
			//BSG.util.updateQueyDetails(BSG.util.getComponent('querydetails',0));			
		
			//clear the query feature layer
			var l=BSG.map.map.getLayersByName('Query layer')[0];
			l.destroyFeatures();
			l.redraw();
			BSG.map.map.getLayersByName('GeometryBuffer')[0].destroyFeatures();
			BSG.map.map.getLayersByName('FeatureBuffer')[0].destroyFeatures();					
		}
		else if (Ext.getCmp('radiogroupSpatial').getChecked()[0].inputValue == 'select'){
			Ext.getCmp('SpatialFieldSet').enable(true);
			Ext.getCmp('SpatialDrawSet').disable(true);
			Ext.getCmp('buttongroupFeature').enable(true);
			Ext.getCmp('buttongroupDrawFeature').disable(true);
			//update query details text
			//BSG.variables.spatialQuery="Select feature<br/>";
			//BSG.util.updateQueyDetails(BSG.util.getComponent('querydetails',0));
	
			//clear the query feature layer
			var l=BSG.map.map.getLayersByName('Query layer')[0];
			l.destroyFeatures();
			l.redraw();
			BSG.map.map.getLayersByName('GeometryBuffer')[0].destroyFeatures();
		}
		else{
			Ext.getCmp('SpatialFieldSet').disable(true);
			Ext.getCmp('SpatialDrawSet').enable(true);
			Ext.getCmp('buttongroupFeature').disable(true);
			Ext.getCmp('buttongroupDrawFeature').enable(true);
			//update query details text
			//BSG.variables.spatialQuery="Draw feature<br/>";
			//BSG.util.updateQueyDetails(BSG.util.getComponent('querydetails',0));
			BSG.map.map.getLayersByName('FeatureBuffer')[0].destroyFeatures();
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
	onComboboxFeatureSelect :function(combo,record){
		//console.log(record);
		//todo get the things and call
		//TODO get the feature and call the database to get the features
		var a=BSG.util.getComponent('spatialform',0).getForm();
		if(a.isValid()){		
			var v=a.getValues();
			var par={};
			if(v.LAYER){				
					par.layer=v.LAYER;					
					if(v.FEATURENAME){					
					par.featurename=v.FEATURENAME;
					BSG.util.ajaxRequest('getPlaces/bufferFeature.php','post',par,'FeatureBuffer',true);
					}
			}
		}
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
			constrainHeader:true,
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
				title:'Copy/paste query',
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
						
						try{
							var x=BSG.util.buildQueryObject();
							BSG.util.getComponent('#queryTextAreaField',0).setValue(Ext.JSON.encode(x));
							BSG.util.getComponent('#queryWindow toolbar',0).update('');
							BSG.util.getComponent('#queryMessage',0).update('');	
						}catch(e){
							BSG.util.getComponent('#queryMessage',0).update('<b style="color:red">'+e.message+'</b>');	
						}
					}
				},{
					text: 'Set',
					iconCls: 'add',							
					itemId: 'buttonAddQuery',
					id: 'buttonAddQuery',
					handler: function() {
						try{
							BSG.util.decodeQuery(BSG.util.getComponent('#queryTextAreaField',0).getValue());
							BSG.util.getComponent('#queryWindow toolbar',0).update('');
							BSG.util.getComponent('#queryMessage',0).update('');
							BSG.util.getComponent('#queryMessage',0).update('<b style="color:red">Please, press the \'QUERY\' button to get the result</b>');
							//ask the database with the new query
							//BSG.util.clickQueryButton();
						}catch(e){
							BSG.util.getComponent('#queryWindow toolbar',0).update(' <b style="color:red">Please fix the query string<b/>')
						}
					}}]
				});		
			};
			//change window visibility
			if (BSG.variables.queryWindow.isVisible()) {
				BSG.variables.queryWindow.hide();
			} else{
			   BSG.util.getComponent('#queryWindow toolbar',0).update('');
			   BSG.util.getComponent('#queryMessage',0).update('');	
			   try{
					var x=BSG.util.buildQueryObject();
					BSG.util.getComponent('#queryTextAreaField',0).setValue(Ext.JSON.encode(x));
					BSG.variables.queryWindow.show();
				}catch(e){
					BSG.util.getComponent('#queryMessage',0).update('<b style="color:red">'+e.message+'</b>');	
				}
			}
	},
	
	onClickDetachTab:function(button,e,eOpts){	
	if(!BSG.variables.tabWindow){
			BSG.variables.tabWindow=Ext.create('widget.window', {
			id: 'tabWindow',
			itemId: 'tabWindow',
			closable: false,
			//closeAction: 'hide',
			draggable:true,
			constrainHeader:true,
			modal: false,
			hideMode:'offsets',
			width: 400,
			height: 600,
			//minWidth: 400,
			//maxWidth: 600,
			//maxHeight: 600,
			//modal : true,
			resizable :true,
			layout: 'fit',
			//bodyStyle: 'padding: 5px;',
			dockedItems:[{
				dock:'top',
				xtype:'toolbar',
				height:30,
				items:[{xtype:'combostyle'},
				//{xtype:'bookmarkbutton'},
				{
					xtype: 'buttongroup',
					columns: 3,
					items: [{xtype:'detachtabsbutton'},{xtype:'attachlefttabbutton'},{xtype:'attachrighttabbutton'}]
				}]	
			}],
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
		BSG.util.clickQueryButton();
	},

	onClickLoadQueryButton:function(button,e,eOpts){
		var a=localStorage.getItem('BSG.LocalStorage.Query.'+BSG.variables.queryNumber);
		//console.log('onClickLoadQueryButton');
		if (a){
			BSG.util.getComponent('#queryMessage',0).update('');
		try{
			BSG.util.decodeQuery(a);
			BSG.util.getComponent('#queryMessage',0).update('<b style="color:red">Please, press the \'QUERY\' button to get the result</b>');
			//BSG.util.clickQueryButton();
		}catch(e){
			BSG.util.getComponent('#queryMessage',0).update('<b style="color:red">Error:problems reading the query</b>');
		}
		}		
		else{  //no query in localstore
			BSG.util.getComponent('#queryMessage',0).update('<b style="color:red">No query to load</b>');
			//alert('not present');
		}
	},
	//save the query to local storage if no error
	onClickSaveQueryButton:function(button,e,eOpts){	
		try{
			var queryObj=BSG.util.buildQueryObject();		
			//access the form values and create an object
			localStorage.removeItem('BSG.LocalStorage.Query.'+BSG.variables.queryNumber);
			localStorage.setItem('BSG.LocalStorage.Query.'+BSG.variables.queryNumber, Ext.JSON.encode(queryObj));
			//console.log('onClickSaveQueryButton');
			//var cq='querydetailsradiogroup #radio'+BSG.variables.queryNumber;
			BSG.util.getComponent('querydetailsradiogroup #radio'+BSG.variables.queryNumber,0).boxLabelEl.setStyle({color:"red"});
			BSG.util.getComponent('#queryMessage',0).update('');
		}catch(e){
			//console.log(e);
			BSG.util.getComponent('#queryMessage',0).update('<b style="color:red">'+e.message+'</b>');
		}
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
		
		//save the the article_id refresh the graph
		BSG.variables.selectedArticleId=record.data.id;
		if(BSG.variables.graphWindow && BSG.variables.graphWindow.isVisible()){
			//BSG.store.store6.loadData(BSG.util.generateLevelData());
			//disable the graph
			if(!BSG.variables.canSelectMulti){
				this.getGraphsStore().load(												
						{
						params: {
							id: BSG.variables.selectedArticleId
						},
						callback: function(records, operation, success) {}
						}
				);
			}
		}
		
		//refresh the details tab
		BSG.variables.tplArticleViewDetail.overwrite(BSG.util.getComponent('#detailsTab',0).body, record.data);
	
		//save the selected row index
		BSG.variables.selectedRow=index;
		
		//if I did not press a button on the gridrow fire tabchange event to load data
		if(!BSG.variables.selectedOnGrid){
			BSG.util.getComponent('bibliogrid',0).fireTabChange();
			//console.log('select '+BSG.util.getComponent('detailgridtab',0).getActiveTab().id);
		}

		//map interaction
		//unselect all, destroy bboxes, and select on the map, i set selectFeatureOnGrid to allow single bbox selection
		
		//if the multiselection is enabled (when asking for a report) disable selection
		if(!BSG.variables.canSelectMulti){
			BSG.map.map.selectCtrl.unselectAll();
			BSG.map.map.getLayersByName('BBoxes')[0].destroyFeatures()
			//tell you are selecting on the grid, set the walking to false to disable walking button
			BSG.variables.selectFeatureOnGrid=true;
			BSG.variables.walking=false;
			
			if (typeof eOpts.noclearID === "undefined"){
			BSG.variables.walkingID=0;
			}
			
			BSG.util.selectFeatures(record.data.id,BSG.map.map.getLayersByName('Features')[0]);
			//set the variable to false again so you can select on the map (not sure if this will always work expecially if the connection is slow!)
			BSG.variables.selectFeatureOnGrid=false;
			BSG.variables.walking=true;
		}
	}
	});