/////////////////initialize 'global' variables			
	//namespaces for variables
	BSG={};
	if(!BSG.variables){BSG.variables={};}
	BSG.variables.itemsPerPage=100;
	BSG.variables.comboboxLevel3Loaded=false;
	//variable to know which is the chosen query in the query radiobutton toolbar
	BSG.variables.queryNumber=1;
	
	///////todo remember to set this back to -1 when you query or refresh grid
	//variables to know which data is loaded in the tabs
	BSG.variables.detailsID=-1;
	BSG.variables.abstractID=-1;
	BSG.variables.imagesID=-1;
	BSG.variables.mapsID=-1;
	///////todo remember to set this back to -1 when you query or refresh grid
		//this is the row index
		BSG.variables.selectedRow=-1;
		//this is the article_id
		BSG.variables.selectedArticleId=-1;
	//varable to know if I selected the row when I press grid buttons or the row
	BSG.variables.selectedOnGrid=false;
	
	//varable used to count the number of times i tried to dowload an image
	BSG.variables.counter=0;
			
	//variables to store the query details text to show on a panel
	//BSG.variables.spatialQuery="Current extent<br/>";
	//BSG.variables.attributeQuery="";
	
	//am i drawing a query feature
	BSG.variables.drawingQuery=false;
	
	//namespaces for utilities	
	BSG.util={
		// remove multiple, leading or trailing spaces
		trim:function(s) {
			s = s.replace(/(^\s*)|(\s*$)/gi,"");
			s = s.replace(/[ ]{2,}/gi," ");
			s = s.replace(/\n /,"\n");
			return s;
		},
		//return the nth Component of a Ext.Component[] resulting from a Ext.ComponentQuery.query()
		//if n is larger return the last Component
		/*firstComponent: function(c,n){
			if (n>(c.length-1)){return c[c.length-1];}
			else {return c[n];}
		},*/
		//return the nth Component of a Ext.Component[] resulting from a Ext.ComponentQuery.query()
		//if n is larger return the last Component			
		getComponent:function(c,n){
		var cm=Ext.ComponentQuery.query(c);
		if (n>(cm.length-1)){return cm[cm.length-1];}
			else {return cm[n];}
		},
		//redraw all the map layers
		redrawMap: function(map){					
		//map.setCenter(map.getCenter(),map.getZoom(),true,true);
		//map.updateSize();		
		for(var i in  map.layers){
			map.layers[i].redraw();	
			}
		},
		//load an external javascript library when you need it
		loadScript:function(url,callback){
			var script=document.createElement("script");
			//IE
			script.onreadystatechange=function(){
				if (script.readyState=='loaded'||script.readyState=='complete'){
					script.onreadystatechange=null;
					callback();
				}
			};
			//other browsers
			script.onload=function(){
				callback();
			};			
			script.src=url;
			document.documentElement.firstChild.appendChild(script);		
		},
		//check if the browser supports html5 localStorage 
		hasLocalStorage:function() {
			try {
				localStorage.setItem('BSGLocalStorage', 'a');
				localStorage.removeItem('BSGLocalStorage');
				return true;
			} catch(e) {
				return false;
			}
			return false;
		},
		//decode a query json string
		decodeQuery:function(a){
		//decode the string in an object, clear the forms		
		try{
			//alert(a);
			
			var query=Ext.JSON.decode(a);
		///////////////
			//alert('decoded query');
		
			BSG.util.getComponent('spatialform',0).getForm().reset();		
			if(query.spatial.extent){
				var extent=query.spatial.extent;
				var map=BSG.map.map;
				var bounds=new OpenLayers.Bounds(extent.left,extent.bottom,extent.right,extent.top);
				//bounds.getCenterLonLat();
				map.zoomToExtent(bounds,false);
				//BSG.map.map.setCenter(bounds.getCenterLonLat());
				BSG.util.getComponent('spatialform radiogroup',0).items.getAt(0).setValue(true);				
			
		////////////////////	
			//alert('query.spatial.extent');
			}	
			else if (query.spatial.select){
				BSG.util.getComponent('spatialform radiogroup',0).items.getAt(1).setValue(true);
				
				var sel=BSG.util.getComponent('spatialform fieldset',1).items;
				if(query.spatial.select.layer){
					sel.getAt(0).setValue(query.spatial.select.layer);
				}
				if(query.spatial.select.featurename && query.spatial.select.featurename.value && query.spatial.select.featurename.rawvalue){
					sel.getAt(1).setValue(query.spatial.select.featurename.value);
					sel.getAt(1).setRawValue(query.spatial.select.featurename.rawvalue);
				}
				if(query.spatial.select.radius){
					sel.getAt(2).setValue(query.spatial.select.radius)
					var s=query.spatial.select.unitbuffer
					if(s=='km'){
						sel.getAt(3).items.getAt(0).setValue(true);
					}else if(s=='m'){
						sel.getAt(3).items.getAt(1).setValue(true);
					}
					else {
						sel.getAt(3).items.getAt(2).setValue(true);
					}	
				}
				
				
			////////////////////	
			//alert('query.spatial.select');	
			}
			else{//draw
				BSG.util.getComponent('spatialform radiogroup',0).items.getAt(2).setValue(true);
				
				var dr=BSG.util.getComponent('spatialform fieldset',2).items
				if(query.spatial.draw && query.spatial.draw.radius){
					dr.getAt(4).setValue(query.spatial.draw.radius);
					var s=query.spatial.draw.unitbuffer
					if(s=='km'){
						dr.getAt(5).items.getAt(0).setValue(true);
					}else if(s=='m'){
						dr.getAt(5).items.getAt(1).setValue(true);
					}
					else {
						dr.getAt(5).items.getAt(2).setValue(true);
					}
				}

			////////////////////	
			//alert('query.spatial.draw');		
			}
						
			//clear level form
			BSG.util.getComponent('levelform',0).getForm().reset();
			var lf=BSG.util.getComponent('levelform fieldset',0).items;	
			//lf.getAt(1).disable(true);
			lf.getAt(1).setVisible(false);
			//lf.getAt(2).disable(true);
			lf.getAt(2).setVisible(false);
			//BSG.util.getComponent('#buttonSetLevel',0).disable(true);						
			//now fill the level forms
			if (query.level.level1 && query.level.level1.value && query.level.level1.rawvalue){		
				//BSG.util.getComponent('#buttonSetLevel',0).enable(true);
				lf.getAt(1).setVisible(true);
				lf.getAt(0).setValue(query.level.level1.value);
				lf.getAt(0).setRawValue(query.level.level1.rawvalue);
				if(query.level.level2 && query.level.level2.value && query.level.level2.rawvalue){
					//lf.getAt(1).enable(true);
					//BSG.util.getComponent('#buttonSetLevel',0).enable(true);						
					lf.getAt(1).setValue(query.level.level2.value);
					lf.getAt(1).setRawValue(query.level.level2.rawvalue);					
					if(query.level.level3 && query.level.level3.value && query.level.level3.rawvalue ){				
						//lf.getAt(2).enable(true);
						lf.getAt(2).setVisible(true);
						lf.getAt(2).setRawValue(query.level.level3.rawvalue); 
						lf.getAt(2).setValue(query.level.level3.value);													
					}
					if(query.level.level3 && query.level.level3.rawvalue==""){
							//BSG.util.getComponent('#buttonSetLevel',0).disable(true);
							lf.getAt(2).setVisible(true);							
							if (!BSG.variables.comboboxLevel3Loaded){
								lf.getAt(2).store.load(function(records, operation, success) {							
									if (success){
											BSG.variables.comboboxLevel3Loaded=true;
											BSG.controller.Main.prototype.setUpCBL3(lf.getAt(2),null,query.level.level2.value);
										}								
								});
								}else{
									BSG.controller.Main.prototype.setUpCBL3(lf.getAt(2),null,query.level.level2.value);
							}
						}	
					}
				}			
			//clear attribute form
			BSG.util.getComponent('attributeform',0).getForm().reset();
			//BSG.util.getComponent('#buttonSetAttribute',0).disable(true);		
			var af=BSG.util.getComponent('attributeform fieldset',0).items;
			//var afact=false;
			if(query.attribute.author){BSG.util.getComponent('#authorField',0).setValue(query.attribute.author);}
			if(query.attribute.year){BSG.util.getComponent('#yearField',0).setValue(query.attribute.year);}
			if(query.attribute.title){BSG.util.getComponent('#titleField',0).setValue(query.attribute.title);}			
			if(query.attribute.publication){BSG.util.getComponent('#comboboxPublication',0).setValue(query.attribute.publication);}
			if(query.attribute.publisher){BSG.util.getComponent('#comboboxPublisher',0).setValue(query.attribute.publisher);}
			if(query.attribute.source && query.attribute.source.value && query.attribute.source.rawvalue){
				BSG.util.getComponent('#comboboxSource',0).setValue(query.attribute.source.value);
				BSG.util.getComponent('#comboboxSource',0).setRawValue(query.attribute.source.rawvalue);
				}			
			//if(afact){BSG.util.getComponent('#buttonSetAttribute',0).enable(true);}			
			var afr=BSG.util.getComponent('#radiogroupAttribute',0).items;
			if(query.attribute.type=='or'){
				afr.getAt(0).setValue(true);
			}else{afr.getAt(1).setValue(true);}
			
			//clear abstract form
			BSG.util.getComponent('abstractform',0).getForm().reset();
			//BSG.util.getComponent('#buttonSetAbstract',0).disable(true);
			if (query.abstr.keyword){
				BSG.util.getComponent('#keywordField',0).setValue(query.abstr.keyword);
				//BSG.util.getComponent('#buttonSetAbstract',0).enable(true);
			}
			
			var cfr=BSG.util.getComponent('#radiogroupCombined',0).items;
			if(query.combined.querytype=='or'){
				cfr.getAt(0).setValue(true);
			}else{cfr.getAt(1).setValue(true);}
			
			if(BSG.variables.queryWindow && BSG.variables.queryWindow.isVisible()){
				BSG.util.getComponent('#queryWindow toolbar',0).update('');
			}
					
		}catch(e){
		
		if(BSG.variables.queryWindow && BSG.variables.queryWindow.isVisible()){
			BSG.util.getComponent('#queryWindow toolbar',0).update(' <b style="color:red">please fix the query string<b/>')
		
			//alert (e);
		}
		////alert('please fix the query string')	
		}
		},
		//build the query object to save the query
		buildQueryObject:function(){
			//var map=BSG.map.map;
			var queryObj={};
			queryObj.spatial={};
			queryObj.level={};
			queryObj.attribute={};
			queryObj.abstr={};
			queryObj.combined={};
			
			//var a=BSG.util.getComponent('spatialform radiogroup',0).getValue().SPATIALEXTENT;
			var a=BSG.util.getComponent('spatialform',0).getForm().getValues();
			  switch(a.SPATIALEXTENT)
				{
				case 'extent':
				  queryObj.spatial.extent={};
				  queryObj.spatial.extent.top=BSG.map.map.getExtent().top;
				  queryObj.spatial.extent.left=BSG.map.map.getExtent().left;
				  queryObj.spatial.extent.bottom=BSG.map.map.getExtent().bottom;
				  queryObj.spatial.extent.right=BSG.map.map.getExtent().right;
				  break;
				case 'select':
				  queryObj.spatial.select={};
				  if(a.LAYER){
					queryObj.spatial.select.layer=a.LAYER;
				  }
				  if(a.FEATURENAME){
					queryObj.spatial.select.featurename={};
					queryObj.spatial.select.featurename.value=a.FEATURENAME;
					queryObj.spatial.select.featurename.rawvalue=BSG.util.getComponent('spatialform combobox',1).getRawValue();
					
				  }
				  if(a.LAYERRADIUS){
					queryObj.spatial.select.radius=a.LAYERRADIUS;
				  }
					queryObj.spatial.select.unitbuffer=a.UNITBUFFER;		  
				  break;
				case 'draw':
					queryObj.spatial.draw={};
					queryObj.spatial.draw.radius=a.DRAWRADIUS;
					queryObj.spatial.draw.unitbuffer =a.UNITDRAWBUFFER;			  
				  break;
				}
				
			var b=BSG.util.getComponent('levelform',0).getForm().getValues();
			if (b.L1_ID){	 
				queryObj.level.level1={};
				queryObj.level.level1.value=b.L1_ID;	 
				queryObj.level.level1.rawvalue=BSG.util.getComponent('levelform combobox',0).getRawValue();		 
			}
			if (b.L2_ID){
				queryObj.level.level2={};
				queryObj.level.level2.value=b.L2_ID;
				queryObj.level.level2.rawvalue=BSG.util.getComponent('levelform combobox',1).getRawValue();	
			}	
			//if (b.L3_ID){
			
			if(BSG.util.getComponent('levelform combobox',2).isVisible()){
				queryObj.level.level3={};
				if (b.L3_ID){
					queryObj.level.level3.value=b.L3_ID;
					queryObj.level.level3.rawvalue=BSG.util.getComponent('levelform combobox',2).getRawValue();}
						else{queryObj.level.level3.rawvalue=""}
			
			/////BSG.util.getComponent('levelform fieldset',0).items.getAt(2).isVisible()		
			}

			var c=BSG.util.getComponent('attributeform',0).getForm().getValues();
			if (c.AUTHOR && BSG.util.trim(c.AUTHOR)!=""){	 
			 queryObj.attribute.author=c.AUTHOR;
			}
			if (c.TITLE && BSG.util.trim(c.TITLE)!=""){
			 queryObj.attribute.title=c.TITLE;
			}	
			if (c.YEAR && BSG.util.trim(c.YEAR)!=""){
			 queryObj.attribute.year=c.YEAR;
			}
			if (c.PUBLICATION && BSG.util.trim(c.PUBLICATION)!=""){
					 queryObj.attribute.publication=c.PUBLICATION;
			}
			if (c.PUBLISHER && BSG.util.trim(c.PUBLISHER)!=""){
					 queryObj.attribute.publisher=c.PUBLISHER;
			}
			if (c.SOURCE){
					 queryObj.attribute.source={};
					 queryObj.attribute.source.value=c.SOURCE;
					 queryObj.attribute.source.rawvalue=BSG.util.getComponent('attributeform combobox',2).getRawValue();
			}
			queryObj.attribute.type=c.TYPE;

			var d=BSG.util.getComponent('abstractform',0).getForm().getValues();
			if (d.KEYWORD && BSG.util.trim(d.KEYWORD)!=""){	 
			 queryObj.abstr.keyword=d.KEYWORD;
			}
			
			var e=BSG.util.getComponent('combinedform',0).getForm().getValues();
			queryObj.combined.querytype=e.QUERYTYPE;
	
			return queryObj;
		},		
		//build the query object to save the query
		buildQueryParamsObject:function(){				
		var queryParams={};
		
		//queryParams.start=0
		//queryParams.limit=BSG.variables.itemsPerPage;
		
		var a=BSG.util.getComponent('spatialform',0).getForm().getValues();
			  switch(a.SPATIALEXTENT)
				{
				case 'extent':				  
					queryParams.spatial="extent";
					queryParams.top=BSG.map.map.getExtent().top;
					queryParams.left=BSG.map.map.getExtent().left;
					queryParams.bottom=BSG.map.map.getExtent().bottom;
					queryParams.right=BSG.map.map.getExtent().right;				  
					break;
				case 'select':			
					queryParams.spatial="select";				  
					if(a.LAYER){				
						queryParams.layer=a.LAYER;					
						if(a.FEATURENAME){					
						queryParams.featurename=a.FEATURENAME;
						if(a.LAYERRADIUS!=0 && a.LAYERRADIUS!=""){
							queryParams.radius=a.LAYERRADIUS;
							queryParams.unit=a.UNITBUFFER;		 
							}
						}					
					}					 
					break;
				case 'draw':				  
					queryParams.spatial="draw";				  				    
					//TODO get this data					
					//BSG.queryParams.type=[point|line|polygon]
					//BSG.queryParams.coord=[[x,y],[...]]
					if(a.DRAWRADIUS!=0 && a.DRAWRADIUS!=""){
					queryParams.radius=a.DRAWRADIUS;
					queryParams.unit=a.UNITDRAWBUFFER;		
					}					
					break;
				}
				
			var b=BSG.util.getComponent('levelform',0).getForm().getValues();
			if (b.L1_ID){	 
				queryParams.l1=true
				queryParams.l1value=b.L1_ID;
				if (b.L2_ID){
				queryParams.l2=true
				queryParams.l2value=b.L2_ID;
				if(BSG.util.getComponent('levelform combobox',2).isVisible()){
								if (b.L3_ID){					
									queryParams.l3=true
									queryParams.l3value=b.L3_ID;			
								}						
									//else{queryObj.level.level3.rawvalue=""}		
							}
				}	
			}
						
			var c=BSG.util.getComponent('attributeform',0).getForm().getValues();
					
			if (c.AUTHOR && BSG.util.trim(c.AUTHOR)!=""){	 
				queryParams.author=c.AUTHOR;			
			}
			if (c.TITLE && BSG.util.trim(c.TITLE)!=""){
				queryParams.title=c.TITLE; 
			}	
			if (c.YEAR && BSG.util.trim(c.YEAR)!=""){
				queryParams.year=c.YEAR;			 
			}
			if (c.PUBLICATION && BSG.util.trim(c.PUBLICATION)!=""){					 
				queryParams.publication=c.PUBLICATION;
			}
			if (c.PUBLISHER && BSG.util.trim(c.PUBLISHER)!=""){					 
				queryParams.publisher=c.PUBLISHER;
			}
			if (c.SOURCE){
				queryParams.source=c.SOURCE;	 
			}
				queryParams.type=c.TYPE;

			var d=BSG.util.getComponent('abstractform',0).getForm().getValues();
			if (d.KEYWORD && BSG.util.trim(d.KEYWORD)!=""){	 
				queryParams.abstr=d.KEYWORD;
			}
			
			var e=BSG.util.getComponent('combinedform',0).getForm().getValues();
				queryParams.combined=e.QUERYTYPE;
			
		return queryParams;
		
		},
		//function used to build an image tag from the image name
		sourceImage:function(val){
			return '<img src="style/' + BSG.util.trim(val).toLowerCase() + '.png' + '">';
		},			
		//function to load the thumb images, parameter is the table name (PHOTO/MAP)
		loadImages:function(){
			Ext.data.StoreManager.lookup('ImagesView').load({
			//this.getImagesViewStore().load({
			id: BSG.variables.selectedArticleId,
			params: {table: 'PHOTO'},
			callback: function(records, operation, success) {				
				if( success && records){
					BSG.variables.tplImageView.overwrite(BSG.util.getComponent('#imagesViewer',0).body, records[0].data);
				}
				else{BSG.util.getComponent('#imagesViewer',0).update("")}
				//the operation object contains all of the details of the load operation
				//console.log(operation.response.responseText);
				/*if(operation.response){
				var warning=Ext.JSON.decode(operation.response.responseText).warning
				if(warning !=""){
					Ext.Msg.show({
						 title:'Some images missing',
						 msg: warning,
						 buttons: Ext.Msg.YES,
						 icon: Ext.Msg.WARNING
					});
				}
				}*/
				}
			});
		},
		//function to load the thumb images, parameter is the table name (PHOTO/MAP)
		loadMaps:function(){
			Ext.data.StoreManager.lookup('MapsView').load({
			//this.getImagesViewStore().load({
			id: BSG.variables.selectedArticleId,
			params: {table: 'MAP'},
			callback: function(records, operation, success) {				
				if( success && records){
					BSG.variables.tplImageView.overwrite(BSG.util.getComponent('#mapsViewer',0).body, records[0].data);
				}
				else{BSG.util.getComponent('#mapsViewer',0).update("")}
				//the operation object contains all of the details of the load operation
				//console.log(operation.response.responseText);
				/*if(operation.response){
				var warning=Ext.JSON.decode(operation.response.responseText).warning
				if(warning !=""){
					Ext.Msg.show({
						 title:'Some images missing',
						 msg: warning,
						 buttons: Ext.Msg.YES,
						 icon: Ext.Msg.WARNING
					});
				}
				}*/
				}
			});
		},
		createImageWindow:function(){
			BSG.variables.imageWindow=Ext.create('widget.window', {
			id: 'imageWindow',
			itemId: 'imageWindow',
			//title: 'Image window',
			closable: true,
			closeAction: 'hide',
			draggable:true,
			modal: false,
			hideMode:'offsets',
			//width: 'auto',
			//height: 'auto',
			autoHeight:true,
			autoWidth:true,
			maxWidth: 620,
			maxHeight: 640,
			resizable :false,
			layout: 'fit',
			//bodyStyle: 'padding: 5px;',
			listeners:{
					/*afterrender: function(window,e){},*/									
					hide: function(component,eOpts){
						//console.log("graphHide");
					}
				}
			});	
		},
		//TODO maybe there is a clever way to fix this
		//update the image in the window
		imageUpdate:function(x){			
			BSG.variables.imageWindow.update(x,true, function(){
				var img = document.getElementById('image');
				//this is a workaround to get the correct window size, repeat the updating, set a limit in the image does not dowload to stop infinite recursion
				if((img.width<100 || img.height<100) && BSG.variables.counter<20) {
					BSG.variables.counter++
					BSG.util.imageUpdate(x);
				}else{
				BSG.variables.counter=0;
				//recalculate the layout to fit the image
				BSG.variables.imageWindow.forceComponentLayout();
				BSG.variables.imageWindow.toFront();
				}
			});		
		},
		//function to update the query detail text. Parameter the component to update the text
		updateQueyDetails:function(c){
			c.update('<b>Spatial query</b><br/>'+BSG.variables.spatialQuery+'<b>Attribute query</b><br/>'+BSG.variables.attributeQuery);
		},
		//function to set a layer icon name depending on the geometry type
		getLayerIcon:function(geometryType){		
			switch(geometryType)
					{
						case 'OpenLayers.Geometry.MultiPolygon':
							return 'drawMPolygon16'
						break;
						case 'OpenLayers.Geometry.Polygon':
							return 'drawPolygon16'
						break;
						case 'OpenLayers.Geometry.Point':
							return 'drawPoint16'
						break;
						case 'OpenLayers.Geometry.Line':
							return 'drawLine16'
						break;
						default:
							return 'layer'
					}
		},
		//function to set a Tree with map layer names
		//treename the tree name as string, parentname the parent name as string, isbase true if the parent will group baselayers
		setTree:function( treename, parentname, isbase){
		var y=BSG.util.getComponent(treename,0).getRootNode().findChild('text',parentname)
		var x=BSG.map.map.layers;
		if(isbase){
			for (var i in x){
				if(x[i].isBaseLayer){
					y.appendChild({'text': x[i].name,'leaf': true, 'iconCls':'mapIcon','checked': x[i].name==BSG.map.map.baseLayer.name});	
				}
			}}
			else{
				for (var i in x){
					if(!x[i].isBaseLayer){
						//if the layer has a geometrytype get the icon , else get a generic icon
						if(x[i].geometryType){
						var a=x[i].geometryType.prototype.CLASS_NAME;
						}else{
						//give a fake value to get a generic icon
						var a='a';
						}
						var b=BSG.util.getLayerIcon(a);					
						y.appendChild({'text': x[i].name,'leaf': true,'iconCls':b,'checked': false});	
					}
				}
			}
		},
		//function to activate/disactivate a control to draw a feature on the map to query		
		//possible value for featureType are 'point','line','polygon','box', pass a fake value to deactivate all the controls
		toggleQueryControl:function(featureType) {              
				for(key in BSG.map.drawControls) {
                    var control = BSG.map.drawControls[key];
                    if(featureType == key) {
                        control.activate();
                    } else {
                        control.deactivate();
                    }
                }
        },
		//destroy all the layer features
		destroyFeatures:function(layerName) {              
				var l=BSG.map.map.getLayersByName(layerName)[0];
				if(l.features.length>0) {
					l.destroyFeatures();
					l.redraw();
				}	
		},		
		//destroy the layer features except this one
		destroyOtherFeatures: function(layerName,feature) {		
			//get layer and features
			var l=BSG.map.map.getLayersByName(layerName)[0];
			var f=l.features;
			if(f.length>0) {				
				for(var i=f.length-1; i>=0; i--) {
					if(f[i].id!=feature.id){
						l.destroyFeatures(f[i]);
					}
				}
			}
			//l.redraw();	
		},
		//enable all the draw query buttons if argument is true, change the argument
		manageQueryFeatureButton:function(drawingQuery){
			BSG.variables.drawingQuery=(!drawingQuery);
			if(drawingQuery){
				BSG.util.getComponent('#drawPointButton',0).enable(true);
				BSG.util.getComponent('#drawPointButton',0).setText('Point');
				BSG.util.getComponent('#drawLineButton',0).enable(true);
				BSG.util.getComponent('#drawLineButton',0).setText('Line');
				BSG.util.getComponent('#drawPolygonButton',0).enable(true);
				BSG.util.getComponent('#drawPolygonButton',0).setText('Polygon');
				BSG.util.getComponent('#drawBoxButton',0).enable(true);
				BSG.util.getComponent('#drawBoxButton',0).setText('Box');				
				return false;
			}
			return true;
		}		
	};