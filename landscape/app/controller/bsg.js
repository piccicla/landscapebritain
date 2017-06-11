/////////////////initialize 'global' variables			
	//namespaces for variables
	var BSG=BSG||{};
	BSG.variables=BSG.variables||{};
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
	//varable to know if I selected the row when I press grid buttons or the row (look at view/bibliogrid.js; controller/main.js->onselectBiblioGrid)
	BSG.variables.selectedOnGrid=false;
	//this say if we selected a feature on the grid, is used to decide wich bounding boxees we want to show when a cluster is selected. select on ther grid andshow o0ne bbox, select on the map and show all the cluster bboxes
	BSG.variables.selectFeatureOnGrid=false;
	
	//varable used to count the number of times i tried to dowload an image
	BSG.variables.counter=0;
			
	//variables to store the query details text to show on a panel
	//BSG.variables.spatialQuery="Current extent<br/>";
	//BSG.variables.attributeQuery="";
	
	//store the parameters to query the database
	BSG.variables.queryParameters={};
	//are the forms valid?
	BSG.variables.isQueryValid=false;
	
	
	//am i drawing a query feature?
	BSG.variables.drawingQuery=false;
	//ana array of abstract keywords used highlight the text
	BSG.variables.abstractKeywords=[];
	
	// an array with all the bounding boxes
	BSG.variables.selectedFeatures=[];
	//the selected feature attributes id
	BSG.variables.selectedFeature=[];
	//the selected feature ID
	BSG.variables.selectedFeatureID="-1";
	
	
	//the current ajax request to download the bboxes
	//BSG.variables.ajaxRequestBBoxes;
	
	//this is used to know if it's possible to use the walking button on the grid to browse bboxes
	BSG.variables.walking=false;
	//this is used to browse the thre features
	BSG.variables.walkingID=0;
	
	//variables used for report generation
	BSG.variables.featureName="";
	BSG.variables.l2name="";
	BSG.variables.l1name="";
	BSG.variables.l3name="";
	BSG.variables.sourcename="";
	
	//the zoom map, this is used to trigger the dowloading of new features
	BSG.variables.mapZoom=0;
	
	//this is used when the report can contain multiple selections
	BSG.variables.canSelectMulti=false;
	
	//number of maximun selectable features (this is used to maintain a good map performance)
	BSG.variables.limitNumberFeatures=200;
	
	//namespaces for utilities	
	BSG.util={
		//highlight an array of words in a text; g=all finding, i=case insewnsitive; $& insert the original word
		highlight:function (text,what) {
			var t=text;
			for (i=0;i<what.length;i++)
			{    
			t = t.replace(new RegExp(what[i],'gi'),'<b style="color:red">$&</b>');
			}
			return t;
		},
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
				var bounds=(new OpenLayers.Bounds(extent.left,extent.bottom,extent.right,extent.top)).transform(BSG.map.proj,BSG.map.proj900913);
				//bounds.getCenterLonLat();
				map.zoomToExtent(bounds,false);
				map.zoomTo(extent.zoom);				
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
					Ext.data.StoreManager.lookup('LayerNames').getProxy().extraParams.LAYERNAME=query.spatial.select.layer;					
					sel.getAt(1).items.getAt(0).enable(true);
					//query the database
					if(query.spatial.select.featurename && query.spatial.select.featurename.value && query.spatial.select.featurename.rawvalue){
						Ext.data.StoreManager.lookup('LayerNames').getProxy().extraParams.query=query.spatial.select.featurename.rawvalue;		
						Ext.data.StoreManager.lookup('LayerNames').load(function(records, operation, success){							
							if (success){
									sel.getAt(1).items.getAt(0).setValue(query.spatial.select.featurename.value);
									sel.getAt(1).items.getAt(0).setRawValue(query.spatial.select.featurename.rawvalue);	
									var par={};
									par.layer=query.spatial.select.layer;										
									par.featurename=query.spatial.select.featurename.value;
									BSG.util.ajaxRequest('getPlaces/bufferFeature.php','post',par,'FeatureBuffer',true);		
							}
						});				
					}
				}
				if(query.spatial.select.radius){
					sel.getAt(2).items.getAt(0).setValue(query.spatial.select.radius)
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
					dr.getAt(4).items.getAt(0).setValue(query.spatial.draw.radius);
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
				
				if(query.spatial.draw && query.spatial.draw.type && query.spatial.draw.coordinates){
					var c=query.spatial.draw.coordinates;
					switch(query.spatial.draw.type){
						case'Point':
							var t=c[0];
							var f=new OpenLayers.Feature.Vector(new OpenLayers.Geometry.Point(t[0],t[1]));
							var h=[f];
							BSG.map.map.getLayersByName('Query layer')[0].addFeatures(h,{});
						break;
						case'Linestring':
							var l=[];
							for(i=0; i<c.length; i++){
								var t=c[i];
								l.push(new OpenLayers.Geometry.Point(t[0],t[1]));
							}
							var f=new OpenLayers.Feature.Vector(new OpenLayers.Geometry.LineString(l));
							var h=[f];
							BSG.map.map.getLayersByName('Query layer')[0].addFeatures(h,{});							
						break;
						case'Polygon':
							var l=[];
							for(i=0; i<c.length; i++){
								var t=c[i];
								l.push(new OpenLayers.Geometry.Point(t[0],t[1]));
							}
							var k=new OpenLayers.Geometry.LinearRing(l);
							var f=new OpenLayers.Feature.Vector(new OpenLayers.Geometry.Polygon(k));
							var h=[f];
							BSG.map.map.getLayersByName('Query layer')[0].addFeatures(h,{});							
						break;
					}
					//now zoom to the feature
					BSG.map.map.zoomToExtent(BSG.map.map.getLayersByName('Query layer')[0].features[0].geometry.getBounds());					
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
				
				//if the level2 store is empty means that we never opened the dropdown (i use the level2 so i know that level1 is already loaded), so load the stores
				if(lf.getAt(1).getStore().data.items.length==0){
					lf.getAt(0).getStore().load(function(records, operation, success){							
					if (success){
	
								lf.getAt(0).setRawValue(query.level.level1.rawvalue);
								lf.getAt(0).setValue(query.level.level1.value);
								//lf.getAt(0).select(lf.getAt(0).findRecordByValue(query.level.level1.value));
								
								//now that i have the level1 i can load the level2
								if(query.level.level2 && query.level.level2.value && query.level.level2.rawvalue){
								
									lf.getAt(1).getStore().load(function(records, operation, success){							
									if (success){					
											//lf.getAt(1).setRawValue(query.level.level2.rawvalue);
											//lf.getAt(1).setValue(query.level.level2.value);
											var recordL1=[];
											recordL1.push(lf.getAt(0).findRecordByValue(query.level.level1.value));
											var xx={};
											xx.L2_ID=query.level.level2.value;
											xx.NAME=query.level.level2.rawvalue;
											//fire select event to set up the filter on level2, pass the level2 object
												lf.getAt(0).fireEvent('select',
													lf.getAt(0),
													recordL1,
													xx);	
										
											if(query.level.level3 && query.level.level3.value && query.level.level3.rawvalue ){
											lf.getAt(2).setVisible(true);					
											lf.getAt(2).getStore().load(function(records, operation, success){							
											if (success){
														//lf.getAt(2).setRawValue(query.level.level3.rawvalue);
														//lf.getAt(2).setValue(query.level.level3.value);
														var recordL2=[];
														recordL2.push(lf.getAt(1).findRecordByValue(query.level.level2.value));
														var xx={};
														xx.L3_ID=query.level.level3.value;
														xx.NAME=query.level.level3.rawvalue;
														//fire select event to set up the filter on level2
															lf.getAt(1).fireEvent('select',
																lf.getAt(1),
																recordL2,
																xx);
												}								
												});//end load level3
											}//end if level3 with rawvalue	
											if(query.level.level3 && query.level.level3.rawvalue==""){
													//BSG.util.getComponent('#buttonSetLevel',0).disable(true);
													lf.getAt(2).setVisible(true);							
													if(lf.getAt(2).isDisabled()){lf.getAt(2).enable(true);}
													if (!BSG.variables.comboboxLevel3Loaded){
														lf.getAt(2).store.load(function(records, operation, success) {							
															if (success){
																	BSG.variables.comboboxLevel3Loaded=true;
																	BSG.controller.Main.prototype.setUpCBL3(lf.getAt(2),null,query.level.level2.value,null);
																}								
														});
														}else{
															BSG.controller.Main.prototype.setUpCBL3(lf.getAt(2),null,query.level.level2.value,null);
													}
											}//end if level3 without rawvalue											
										}//end level2 success								
									});//end load level2
								}//	end if level2	
								else{  //the query has only the level1, anyway set the filter for level2
									var recordL1=[];
									recordL1.push(lf.getAt(0).findRecordByValue(query.level.level1.value));
									//fire select event to set up the filter on level2
										lf.getAt(0).fireEvent('select',
											lf.getAt(0),
											recordL1,
											{});	
									}
							}//end level1 success
						});//end load level1								
					}
					else{// the dropdowns stores level1 and 2 are already loaded -- lf.getAt(0).getStore().data.items.length!=0
						
						lf.getAt(0).setRawValue(query.level.level1.rawvalue);
						lf.getAt(0).setValue(query.level.level1.value);
						if(query.level.level2 && query.level.level2.value && query.level.level2.rawvalue){
							//lf.getAt(1).enable(true);
							//BSG.util.getComponent('#buttonSetLevel',0).enable(true);						
							
							//lf.getAt(1).setRawValue(query.level.level2.rawvalue);
							//lf.getAt(1).setValue(query.level.level2.value);
						
							var recordL1=[];
							recordL1.push(lf.getAt(0).findRecordByValue(query.level.level1.value));
							var xx={};
							xx.L2_ID=query.level.level2.value;
							xx.NAME=query.level.level2.rawvalue;
							//fire select event to set up the filter on level2, pass the level2 object
								lf.getAt(0).fireEvent('select',
									lf.getAt(0),
									recordL1,
									xx);	
										
							if(query.level.level3 && query.level.level3.value && query.level.level3.rawvalue ){				
								//lf.getAt(2).enable(true);
								lf.getAt(2).setVisible(true);
								lf.getAt(2).setRawValue(query.level.level3.rawvalue);
								lf.getAt(2).setValue(query.level.level3.value);																						
							
								var recordL2=[];
								recordL2.push(lf.getAt(1).findRecordByValue(query.level.level2.value));
								var xx={};
								xx.L3_ID=query.level.level3.value;
								xx.NAME=query.level.level3.rawvalue;
								//fire select event to set up the filter on level2
									lf.getAt(1).fireEvent('select',
										lf.getAt(1),
										recordL2,
										xx);	
							}
							
							if(query.level.level3 && query.level.level3.rawvalue==""){
									//BSG.util.getComponent('#buttonSetLevel',0).disable(true);
									lf.getAt(2).setVisible(true);							
									if(lf.getAt(2).isDisabled()){lf.getAt(2).enable(true);}
									if (!BSG.variables.comboboxLevel3Loaded){
										lf.getAt(2).store.load(function(records, operation, success) {							
											if (success){
													BSG.variables.comboboxLevel3Loaded=true;
													BSG.controller.Main.prototype.setUpCBL3(lf.getAt(2),null,query.level.level2.value,null);
												}								
										});
										}else{
											BSG.controller.Main.prototype.setUpCBL3(lf.getAt(2),null,query.level.level2.value,null);
									}
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
			if(query.attribute.title){BSG.util.getComponent('#titleField',0).setValue(query.attribute.title.toString().replace(/,/g,' '));}			
			if(query.attribute.publication){BSG.util.getComponent('#comboboxPublication',0).setValue(query.attribute.publication);}
			if(query.attribute.publisher){BSG.util.getComponent('#comboboxPublisher',0).setValue(query.attribute.publisher);}
			if(query.attribute.source && query.attribute.source.value && query.attribute.source.rawvalue){
				
				if(BSG.util.getComponent('#comboboxSource',0).getStore().data.items.length==0){
					
					//load sources if you are opening a query but sources are not loaded
					BSG.util.getComponent('#comboboxSource',0).getStore().load(function(records, operation, success){							
						if (success){
									BSG.util.getComponent('#comboboxSource',0).setValue(query.attribute.source.value);
									BSG.util.getComponent('#comboboxSource',0).setRawValue(query.attribute.source.rawvalue);
						}								
					});//end load sources
				
				}else{	//source already loaded	
					BSG.util.getComponent('#comboboxSource',0).setValue(query.attribute.source.value);
					BSG.util.getComponent('#comboboxSource',0).setRawValue(query.attribute.source.rawvalue);
				}
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
				//the g means global to replace all the ','
				BSG.util.getComponent('#keywordField',0).setValue(query.abstr.keyword.toString().replace(/,/g,' '));
		
				//BSG.util.getComponent('#buttonSetAbstract',0).enable(true);
			}
			var abrg=BSG.util.getComponent('#radiogroupAbstract',0).items;
			if(query.attribute.type=='or'){
				abrg.getAt(0).setValue(true);
			}else{abrg.getAt(1).setValue(true);}
			
			
			//TODO: is combined query necessary??? nooooooooo
			/////
			/*var cfr=BSG.util.getComponent('#radiogroupCombined',0).items;
			if(query.combined.querytype=='or'){
				cfr.getAt(0).setValue(true);
			}else{cfr.getAt(1).setValue(true);}*/
			/////
			
			
			/*if(BSG.variables.queryWindow && BSG.variables.queryWindow.isVisible()){
				BSG.util.getComponent('#queryWindow toolbar',0).update('');
			}*/
					
				
		}catch(e){
		
		/*if(BSG.variables.queryWindow && BSG.variables.queryWindow.isVisible()){
			BSG.util.getComponent('#queryWindow toolbar',0).update(' <b style="color:red">please fix the query string<b/>')
		
			//alert (e);
		}*/
			throw new Error('Error: Problems reading the query');
		////alert('please fix the query string')	
		}
		},
		//build the query object to save the query
		buildQueryObject:function(){
			
			//first check the forms validity
			var f1=BSG.util.getComponent('spatialform',0).getForm();	
			var f2=BSG.util.getComponent('levelform',0).getForm();
			var f3=BSG.util.getComponent('attributeform',0).getForm();
			var f4=BSG.util.getComponent('abstractform',0).getForm();			
			if (!f1.isValid() || !f2.isValid() || !f3.isValid() || !f4.isValid()){
				throw new Error('Please, check the query parameters');
			}
			
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
				  var extn=BSG.map.map.getExtent().transform(BSG.map.proj900913,BSG.map.proj);
				  queryObj.spatial.extent={};
				  queryObj.spatial.extent.top=extn.top;
				  queryObj.spatial.extent.left=extn.left;
				  queryObj.spatial.extent.bottom=extn.bottom;
				  queryObj.spatial.extent.right=extn.right;
				  queryObj.spatial.extent.zoom=BSG.map.map.getZoom();
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
					queryObj.spatial.select.radius=parseFloat(a.LAYERRADIUS);
				  }
					queryObj.spatial.select.unitbuffer=a.UNITBUFFER;		  
				  break;
				case 'draw':
					queryObj.spatial.draw={};
					queryObj.spatial.draw.radius=parseFloat(a.DRAWRADIUS);
					queryObj.spatial.draw.unitbuffer =a.UNITDRAWBUFFER;

					//extract geometry
					if(BSG.map.map.getLayersByName('Query layer')[0].features[0]){
					var a=BSG.map.map.getLayersByName('Query layer')[0].features[0].geometry;
					//access geometry and write an array
						switch (a.CLASS_NAME)
						{
						case 'OpenLayers.Geometry.Point':
							//console.log(a.getCentroid().x+' '+a.getCentroid().y);
							var arr=new Array(1);
							arr[0]=new Array(2);
							arr[0][0]=a.getCentroid().x;
							arr[0][1] = a.getCentroid().y;
							queryObj.spatial.draw.type='Point';
							queryObj.spatial.draw.coordinates=arr;
							//console.log(geometry);
							break;
						case 'OpenLayers.Geometry.LineString':
							var b=a.getVertices();
							var arr=new Array(b.length);
							for(i=0; i<b.length; i++){
								arr[i] = new Array(2);
								arr[i][0] = b[i].x;
								arr[i][1] = b[i].y;		
							}
							queryObj.spatial.draw.type='Linestring';
							queryObj.spatial.draw.coordinates=arr;
							//console.log(geometry);
							break;
						case 'OpenLayers.Geometry.Polygon':
							//check for selfintersection before writing the object
							if (!BSG.util.checkSelfIntersection(a)){							
							var b=a.getVertices();
							var arr=new Array(b.length);
							for(i=0; i<b.length; i++){
								arr[i] = new Array(2);
								arr[i][0] = b[i].x;
								arr[i][1] = b[i].y;			
							}
							queryObj.spatial.draw.type='Polygon';
							queryObj.spatial.draw.coordinates=arr;			
							}
							else{	
								throw new Error('Please, redraw your polygon');							
							}
							//console.log(geometry);
							break;
						} 					
					}else{throw new Error('Please, draw a feature');}	
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
			 queryObj.attribute.title=BSG.util.trim(c.TITLE).split(' ');
			}	
			if (c.YEAR && BSG.util.trim(c.YEAR)!=""){
			 queryObj.attribute.year=parseFloat(c.YEAR);
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
				queryObj.abstr.keyword=BSG.util.trim(d.KEYWORD).split(' ');
				queryObj.abstr.type=d.TYPEAB;
			}
			
			//TODO : is this necessary??? nooooooooooooo
			/*var e=BSG.util.getComponent('combinedform',0).getForm().getValues();
			queryObj.combined.querytype=e.QUERYTYPE;*/
	
			return queryObj;
		},		
		
		//build the query object to save the query
		buildQueryParamsObject:function(){				
		
		//initialize variables for report generation
		BSG.variables.featureName="";
		BSG.variables.l2name="";
		BSG.variables.l1name="";
		BSG.variables.l3name="";
		BSG.variables.sourcename="";
		
		var queryParams={};
		
		//queryParams.start=0
		//queryParams.limit=BSG.variables.itemsPerPage;
		
		var a=BSG.util.getComponent('spatialform',0).getForm().getValues();
			  switch(a.SPATIALEXTENT)
				{
				case 'extent':				  
					var extn=BSG.map.map.getExtent().transform(BSG.map.proj900913,BSG.map.proj);
					queryParams.spatial="extent";
					queryParams.top=extn.top;
					queryParams.left=extn.left;
					queryParams.bottom=extn.bottom;
					queryParams.right=extn.right;
					queryParams.zoom=BSG.map.map.getZoom()
					break;
				case 'select':			
					queryParams.spatial="select";				  
					if(a.LAYER){				
						queryParams.layer=a.LAYER;					
						if(a.FEATURENAME){	
						BSG.variables.featureName=BSG.util.getComponent('#comboboxFeature',0).rawValue						
						queryParams.featurename=a.FEATURENAME;
						if(a.LAYERRADIUS!=0 && a.LAYERRADIUS!=""){
							queryParams.radius=parseFloat(a.LAYERRADIUS);
							queryParams.unit=a.UNITBUFFER;		 
							}
						}					
					}					 
					break;
				case 'draw':				  
					queryParams.spatial="draw";				  				    
					if(BSG.map.map.getLayersByName('Query layer')[0].features[0]){				
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
							queryParams.ftype='point';
							queryParams.coord=arr;
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
							queryParams.ftype='line';
							queryParams.coord=arr;
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
								
								queryParams.ftype='polygon';
								queryParams.coord=arr;
							}else{throw new Error('Please, redraw your polygon');}
							break;
						} 	
					}else{throw new Error('Please, draw a feature');}
				
					if(a.DRAWRADIUS!=0 && a.DRAWRADIUS!=""){
					queryParams.radius=parseFloat(a.DRAWRADIUS);
					queryParams.unit=a.UNITDRAWBUFFER;		
					}					
					break;
				}
				
			var b=BSG.util.getComponent('levelform',0).getForm().getValues();
			if (b.L1_ID){	 
				queryParams.l1=true
				queryParams.l1value=b.L1_ID;
				BSG.variables.l1name=BSG.util.getComponent('levelform combobox',0).rawValue;//store value for report generation
				if (b.L2_ID){
				queryParams.l2=true
				queryParams.l2value=b.L2_ID;
				BSG.variables.l2name=BSG.util.getComponent('levelform combobox',1).rawValue;//store value for report generation
				if(BSG.util.getComponent('levelform combobox',2).isVisible()){
								if (b.L3_ID){					
									queryParams.l3=true
									queryParams.l3value=b.L3_ID;
									BSG.variables.l3name=BSG.util.getComponent('levelform combobox',2).rawValue;//store value for report generation									
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
				queryParams.title=BSG.util.trim(c.TITLE).split(' ');
			}	
			if (c.YEAR && BSG.util.trim(c.YEAR)!=""){
				queryParams.year=parseFloat(c.YEAR);			 
			}
			if (c.PUBLICATION && BSG.util.trim(c.PUBLICATION)!=""){					 
				queryParams.publication=c.PUBLICATION;
			}
			if (c.PUBLISHER && BSG.util.trim(c.PUBLISHER)!=""){					 
				queryParams.publisher=c.PUBLISHER;
			}
			if (c.SOURCE){
				queryParams.source=c.SOURCE;
				BSG.variables.sourcename=BSG.util.getComponent('#comboboxSource',0).rawValue;				
			}
				queryParams.type=c.TYPE;

			var d=BSG.util.getComponent('abstractform',0).getForm().getValues();
			if (d.KEYWORD && BSG.util.trim(d.KEYWORD)!=''){	 
				//queryParams.abstr=d.KEYWORD;
				//store the keywords for text highlighting
				queryParams.abstr=BSG.variables.abstractKeywords=BSG.util.trim(d.KEYWORD).split(' ');
				queryParams.abstrtype=d.TYPEAB;
			}else{
			//clear the keywords
			BSG.variables.abstractKeywords.length = 0;
			}
			
			//TODO:is this necessary??? no......
			///var e=BSG.util.getComponent('combinedform',0).getForm().getValues();
			///	queryParams.combined=e.QUERYTYPE;
					
			//create a random id to identify the query, so I can put in php session and reuse the quey without buildind it when i change the page
			BSG.variables.queryid=queryParams.queryid=Math.random();
		
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
			constrainHeader:true,
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
					if(!x[i].isBaseLayer && x[i].displayInLayerSwitcher){
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
		//function to activate/disactivate a control to measure on the map
		toggleMeasureControl: function(element, elementKey){
                    for (key in BSG.map.measureControls) {
                        var control = BSG.map.measureControls[key];
                        if (elementKey == key && element.pressed) {
                            control.activate();
                        }
                        else {
                            control.deactivate();
                        }
                    }
                },
		//function to handle map measurements
		handleMeasurements:function(event){
                    var geometry = event.geometry;
                    var units = event.units;
                    var order = event.order;
                    var measure = event.measure;
                    var element = document.getElementById('measure');
                    var out = "";
                    if (order == 1) {
                        out += "length: " + measure.toFixed(1) + " " + units;
                    }
                    else {
                        out += "area: " + measure.toFixed(1) + " " + units + "<sup>2</" + "sup>";
                    }
                    element.innerHTML = out;
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
		//enable all the draw query buttons if argument is true
		manageQueryFeatureButton:function(drawingQuery){
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
		},
		//check the validity of a polygon 
		checkSelfIntersection:function(polygon){
			if(polygon.CLASS_NAME=="OpenLayers.Geometry.Polygon"){
				//checking only outer ring
				var outer = polygon.components[0].components;           
				var segments = [];
				for(var i=1;i<outer.length;i++){
					var segment= new OpenLayers.Geometry.LineString([outer[i-1].clone(),outer[i].clone()]);
					segments.push(segment);               
				}   
				for(var j=0;j<segments.length;j++){    
					if(BSG.util.segmentIntersects(segments[j],segments)){
					   return true;
					}
				}                     
			}    
			return false;
		},
		//check if a segment intersect other segments (used by checkSelfIntersection)
		segmentIntersects: function (segment,segments){
			for(var i=0;i<segments.length;i++){
				if(!segments[i].equals(segment)){
					if(segments[i].intersects(segment) && !BSG.util.startOrStopEquals(segments[i],segment)){
						return true;
				   }            
			   }    
			}
			return false;    
		},
		//check if two segments have start or stop Equals (used by segmentIntersects)
		startOrStopEquals:function (segment1,segment2){
			if(segment1.components[0].equals(segment2.components[0])){
				return true;
			}
			if(segment1.components[0].equals(segment2.components[1])){
				return true;
			}
			if(segment1.components[1].equals(segment2.components[0])){
				return true;
			}
			if(segment1.components[1].equals(segment2.components[1])){
				return true;
			}
			return false;
		},
		//return the map zoom
		getZoom:function(){
			return BSG.map.map.getZoom();
		},
		//get the map extent
		getTop:function(){
			return BSG.map.map.getExtent().transform(BSG.map.proj900913,BSG.map.proj).top;
		},
		getLeft:function(){
			return BSG.map.map.getExtent().transform(BSG.map.proj900913,BSG.map.proj).left;
		},
		getBottom:function(){
			return BSG.map.map.getExtent().transform(BSG.map.proj900913,BSG.map.proj).bottom;
		},
		getRight:function(){
			return BSG.map.map.getExtent().transform(BSG.map.proj900913,BSG.map.proj).right;
		},
		//when the user select a cluster on the map get the bbox and select on the grid
		selectFeature:function(feature){
						
			var par={};
			
			//if i selected on the grid i need to select only single bboxes for that id and not all the features belonging to a cluster
			if(BSG.variables.selectFeatureOnGrid){
				BSG.variables.selectedFeatures=[BSG.variables.selectedArticleId];
				par.features=Ext.encode(BSG.variables.selectedFeatures);
			}
			//else i am selecting on the map
			else{
				var arr=new Array();	
				if(BSG.util.getZoom()<=4  && feature.layer.features.length==1){
					//console.log('only one cluster!');
					//TODO this is to be checked!!!
					par.all=true;
					BSG.variables.selectedFeatures=["-1"];
					BSG.variables.selectedFeature=["-1"];
					BSG.variables.selectedFeatureID="-1";				
				}
				//if zoom >4 or we have more than 1 cluster so do the selection things (ask for bboxe and select on the grid)
				else{	
					//console.log(feature.attributes.ids.replace(/[{}]/g,'').split(','));
					//prepare the post params and store the selected features					
					//BSG.variables.selectedFeatures=feature.attributes.ids.replace(/[{}]/g,'').split(',');
					var z=feature.attributes.ids.replace(/[{}]/g,'').split(',');
					BSG.variables.selectedFeatures=[];
					var count=z.length;
					if (count>BSG.variables.limitNumberFeatures){count=BSG.variables.limitNumberFeatures;}
					for (var i = 0; i < count; i++) {
						BSG.variables.selectedFeatures.push(z[i]);
					}
					BSG.variables.selectedFeature=feature.attributes.id;
					BSG.variables.selectedFeatureID=feature.id;
					par.features=Ext.encode(BSG.variables.selectedFeatures);
					//highlight also other centroids with the same id (but limit the features again in the highlightFeatures script)
					//BSG.util.selectFeatures(feature.attributes.id,BSG.map.map.getLayersByName('Features')[0]);
					BSG.util.highlightFeatures(feature.attributes.id,BSG.map.map.getLayersByName('Features')[0]);
				}
			}
			
			
			//Refresh the grid if you selected on the map
			if(!BSG.variables.selectFeatureOnGrid){
						try{
						//set the proxy for multiple results
							BSG.util.getComponent('#gridPaging',0).bindStore(Ext.data.StoreManager.lookup('SingleArticles'));
							BSG.variables.biblioGrid.reconfigure(Ext.data.StoreManager.lookup('SingleArticles'));
							Ext.data.StoreManager.lookup('SingleArticles').proxy.extraParams=par;
							//I set the page size because it was changing to 25
							Ext.data.StoreManager.lookup('SingleArticles').pageSize=BSG.variables.itemsPerPage;
							Ext.data.StoreManager.lookup('SingleArticles').loadPage(1,{
													params:{
															start:0,
															limit: BSG.variables.itemsPerPage
														},
													callback: function(records, operation, success) {
															BSG.util.initDetail();
															BSG.util.changeButtonIcons('requerybutton','refresh2');
														}
							});
						}
						catch(e){
							//BSG.util.getComponent('#queryMessage',0).update('<b style="color:red">'+e.message+'</b>');
						}
			}//if select on the grid
			
			
			//here should stop ajax request pending//Ext.Ajax.abort(BSG.variables.ajaxRequestBBoxes);
			//BSG.variables.ajaxRequestBBoxes=Ext.Ajax.request({
			Ext.Ajax.request({
			   url: 'getPlaces/bboxes.php',
			   method: 'post',
			   params: par,
			  success: function(response, options) {				
					//destroy all the features on the layer
					var obj = Ext.JSON.decode(response.responseText);	
					BSG.util.destroyFeatures('BBoxes');
					BSG.map.map.getLayersByName('BBoxes')[0].addFeatures(BSG.map.geojson_format.read(obj));
					
					//return true;
					},
			   failure:function(response, options){  
					//BSG.util.destroyFeatures('BBoxes');
					//console.log('Error!');
					//return false;
			   }
			});
			
		},
		//get the features from the cluster that have that id, return an array of features 
		findFeature:function(id,layer){
                    var f={};
					for (var i = 0, len =layer.features.length; i < len; i++) {
						var v=layer.features[i].id
                        var ids=layer.features[i].attributes.ids.replace(/[{}]/g,'').split(',')						
						/*if (layer.features[i].attributes.count > BSG.variables.limitNumberFeatures){
							var len2=BSG.variables.limitNumberFeatures;
						}else{var len2= layer.features[i].attributes.count;}*/
						var len2= layer.features[i].attributes.count;
						for (var j = 0; j < len2; j++) {
                            if (ids[j] == id) {
                                f[v]=layer.features[i];
                            }
                        }
                    }
                    return f;
        },
		//this is called when select on the grid, it select all the features with that id
		selectFeatures:function(id,layer){
			var f=BSG.util.findFeature(id,layer);
			/*for(i=0; i<f.length; i++) {
					BSG.map.map.selectCtrl.select(f[i])
			}*/
			for(var i in f) {		
				BSG.map.map.selectCtrl.select(f[i])
			}
		},
		//this is called to highlight all the centroids with that idand add to the selected array
		highlightFeatures:function(id,layer){
			var f=BSG.util.findFeature(id,layer);
			/*for(i=0; i<f.length; i++) {
					BSG.util.highlightFeature(f[i]);
					//layer.selectedFeatures.push(f[i]);		
			}*/
			for(var i in f) {
			if(BSG.map.map.getLayersByName('Features')[0].selectedFeatures[0].id!=i){
					layer.selectedFeatures.push(f[i]);
					BSG.util.highlightFeature(f[i]);
				}
			}	
		},
		//reselect features if something was already selected
		reselectFeatures:function(layername){
					
					/*if(BSG.map.zoomLevel==BSG.util.getZoom()){
						var x=BSG.variables.selectedFeatures
						for(i=0; i<x.length; i++) {
							var l=BSG.map.map.getLayersByName(layername)[0];
							BSG.map.map.selectCtrl.select(l.getFeatureById(BSG.map.map.getLayersByName(layername)[0].getFeaturesByAttribute("id",x[i])[0].id));
						}	
					}*/
					
					/*if(BSG.map.zoomLevel==BSG.util.getZoom()){	
					
						BSG.map.map.selectCtrl.select(BSG.map.map.getLayersByName(layername)[0].getFeatureById(BSG.variables.selectedFeatureID));					
					}*/
					
					//TODO finish this
					/////else{
					var f={};
					var l=BSG.map.map.getLayersByName(layername)[0];
					var len=BSG.variables.selectedFeatures.length;
					var len3=l.features.length;
					//for (var i = 0, len=BSG.variables.selectedFeatures.length; i < len; i++) {
					for (var i = 0; i < len; i++) {
						//for (var k = 0, len3=l.features.length; k < len3; k++) {
						for (var k = 0; k < len3; k++) {
								var ids=l.features[k].attributes.ids.replace(/[{}]/g,'').split(',')
								var len2 = l.features[k].attributes.count
								//for (var j = 0, len2 = l.features[k].attributes.count; j < len2; j++) {
								for (var j = 0; j < len2; j++) {
								
									if (ids[j] == BSG.variables.selectedFeatures[i]) {
										f[l.features[k].id]=l.features[k];
									}
								}
								
								/*if (ids[0] == BSG.variables.selectedFeatures[i]) {
										f[l.features[k].id]=l.features[k];
									}*/														
						}
                    }
					BSG.map.zoomLevel=BSG.util.getZoom();	
					//BSG.map.zoomLevel=BSG.util.getZoom();
					//BSG.variables.selectedFeatures=[];
					for(var i in f) {
					//for(i=0; i<f.length; i++) {
							//BSG.map.map.selectCtrl.select(f[i]);
							/*var ids=f[i].attributes.ids.replace(/[{}]/g,'').split(',');
							for (var j = 0, len = ids.count; j < len; j++) {
							BSG.variables.selectedFeatures.push(ids[j]);
							}*/
							l.selectedFeatures.push(f[i]);
							BSG.util.highlightFeature(f[i]);
						}
					//BSG.variables.selectedFeatures=f;
					/////}
			},
			/**
			 * Method: highlight (got from OpenLayers SelectFeature.js)
			 * Redraw feature with the select style.
			 *
			 * Parameters:
			 * feature - {<OpenLayers.Feature.Vector>} 
			 */
			highlightFeature: function(feature) {
				var layer = feature.layer;
				var cont = BSG.map.map.selectCtrl.events.triggerEvent("beforefeaturehighlighted", {
					feature : feature
				});
				if(cont !== false) {
					feature._prevHighlighter = feature._lastHighlighter;
					feature._lastHighlighter = BSG.map.map.selectCtrl.id;
					var style = BSG.map.map.selectCtrl.selectStyle || BSG.map.map.selectCtrl.renderIntent;
					layer.drawFeature(feature, style);
					BSG.map.map.selectCtrl.events.triggerEvent("featurehighlighted", {feature : feature});
				}
			},
			/*//set the proxy to fill the grid (workaround....)
			setArticleProxy:function(type){
			switch(type){
						case'single':
						Ext.data.StoreManager.lookup('Articles').setProxy( 
										{
										type: 'direct',
										//directFn: Ext.ss.QueryDatabase.getResults,
										directFn: Ext.ss.QueryBiblio.getSingleResults,
										reader: {
										type: 'json',
										root : 'records',
										totalProperty: 'total',
										idProperty :'id'
										}
										}	
									);
						break;
						default:
						Ext.data.StoreManager.lookup('Articles').setProxy( 
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
			}*/
			
			queryDatabase:function(parameters){
				Ext.data.StoreManager.lookup('Articles').proxy.extraParams=parameters;
				Ext.data.StoreManager.lookup('Articles').pageSize=BSG.variables.itemsPerPage;				
				Ext.data.StoreManager.lookup('Articles').loadPage(1,{
										params:{
												start:0,
												limit: BSG.variables.itemsPerPage
											},
										callback: function(records, operation, success) {
												BSG.util.initDetail();
												BSG.util.changeButtonIcons('requerybutton','refresh');											
												//delete all the boundin boxes
												BSG.util.destroyFeatures('BBoxes');
												
												if(Ext.data.StoreManager.lookup('Articles').count()>0){
												//TODO set the query string to get the map features, activate the
												BSG.map.HTTPProt.options.params= {
													//TODO set the correct query text
													//the query text (should get this with the data used to fill the grid)
													queryID:BSG.variables.queryid
												}
												BSG.map.bboxStrat.deactivate();
												BSG.map.bboxStrat.activate();
												}else{
												BSG.util.getComponent('#queryMessage',0).update('<b style="color:red">There are no results for your query</b>');
												}
												
											}
				});

			},
			initDetail:function(){
				BSG.util.getComponent('#abstractTab',0).update('');
				//set a fake id so if we can select a row with the same id again
				if(Ext.getCmp('chartCmp') && Ext.getCmp('chartCmp').store.storeId=='Graphs'){BSG.util.getComponent('#chartCmp',0).store.removeAll()};
				//delete messages on the grid
				//BSG.util.getComponent('#gridInfoText',0).update('');
				//TODO: check if there is something else to deselect
				BSG.variables.abstractID=-1;
				BSG.variables.selectedRow=-1;
				BSG.variables.selectedArticleId=-1;
				//set the zoom level to 0 to allow a new features dowload
				BSG.variables.mapZoom=0;
				
				BSG.variables.tplArticleViewDetail.overwrite(BSG.util.getComponent('#detailsTab',0).body, '');
				//TODO:this does not work, images do not disappear from the UI
				Ext.data.StoreManager.lookup('ImagesView').removeAll(true);
				Ext.data.StoreManager.lookup('MapsView').removeAll(true);
			},
			// refresh the grid paging toolbar when rebind the 'articles' store
			refreshPaging : function(pagingtoolbar){
				var me = pagingtoolbar,
					pageData,
					currPage,
					pageCount,
					afterText,
					count,
					isEmpty;
				count = me.store.getCount();
				isEmpty = count === 0;
				if (!isEmpty) {
					pageData = BSG.util.getPageData(me);
					currPage = pageData.currentPage;
					pageCount = pageData.pageCount;
					afterText = Ext.String.format(me.afterPageText, isNaN(pageCount) ? 1 : pageCount);
				} else {
					currPage = 0;
					pageCount = 0;
					afterText = Ext.String.format(me.afterPageText, 0);
				}
				Ext.suspendLayouts();
				me.child('#afterTextItem').setText(afterText);
				me.child('#inputItem').setDisabled(isEmpty).setValue(currPage);
				me.child('#first').setDisabled(currPage === 1 || isEmpty);
				me.child('#prev').setDisabled(currPage === 1  || isEmpty);
				me.child('#next').setDisabled(currPage === pageCount  || isEmpty);
				me.child('#last').setDisabled(currPage === pageCount  || isEmpty);
				me.child('#refresh').enable();
				me.updateInfo();
				Ext.resumeLayouts(true);
				/*if (me.rendered) {
					me.fireEvent('change', me, pageData);
				}*/
			},
			// get the page data to refresh the grid paging
			getPageData : function(pagingtoolbar){
				var store = pagingtoolbar.store,
					totalCount = store.getTotalCount();
				return {
					total : totalCount,
					currentPage : store.currentPage,
					pageCount: Math.ceil(totalCount / store.pageSize),
					fromRecord: ((store.currentPage - 1) * store.pageSize) + 1,
					toRecord: Math.min(store.currentPage * store.pageSize, totalCount)
				};
			},
			refreshGridPaging : function(){
				//clear the graph
				if(Ext.getCmp('chartCmp') && Ext.getCmp('chartCmp').store.storeId=='Graphs'){BSG.util.getComponent('#chartCmp',0).store.removeAll()};
				//rebind th grid to the store and update the paging so that you don't need to call the server
				BSG.variables.biblioGrid.reconfigure(Ext.data.StoreManager.lookup('Articles'));	
				var c=BSG.util.getComponent('#gridPaging',0);
				c.bindStore(Ext.data.StoreManager.lookup('Articles'));
				BSG.util.refreshPaging(c);
				//deselect things
				//TODO: check if there is something else to deselect
				BSG.variables.abstractID=-1;
				BSG.variables.selectedRow=-1;
				BSG.variables.selectedArticleId=-1;
				
				//clear boxes and deselect all
				BSG.util.destroyFeatures('BBoxes');
				BSG.map.map.selectCtrl.unselectAll();
				BSG.variables.selectedFeatures=[];
				BSG.util.getComponent('#bibliogrid',0).getSelectionModel().deselectAll();
				BSG.util.changeButtonIcons('requerybutton','refresh');
			},
			//change the icons of that button
			changeButtonIcons:function(button,iconcls){
				var c=Ext.ComponentQuery.query(button);
				for(x in c){c[x].setIconCls(iconcls);}
			},	
		//load new data in a  openlayers layer and destroy the previous content, zoomTo=true to zoom to the feature
		ajaxRequest:function(url,method,params,layername,zoomTo){
			Ext.Ajax.request({
			   url: url,
			   method: method,
			   params: params,
			  success: function(response, options) {				
					//destroy all the features on the layer, then zoom to the new feature
					var obj = Ext.JSON.decode(response.responseText);	
					BSG.util.destroyFeatures(layername);
					BSG.map.map.getLayersByName(layername)[0].addFeatures(BSG.map.geojson_format.read(obj));	
					if(zoomTo){BSG.map.map.zoomToExtent(BSG.map.map.getLayersByName(layername)[0].features[0].geometry.getBounds());}
					//return true;
					},
			   failure:function(response, options){  
					//BSG.util.destroyFeatures('BBoxes');
					//console.log('Error!');
					//return false;
			   }
			});
		},
		clickQueryButton:function(){
			var a=BSG.util.getComponent('spatialform',0).getForm();	
			var b=BSG.util.getComponent('levelform',0).getForm();
			var c=BSG.util.getComponent('attributeform',0).getForm();
			var d=BSG.util.getComponent('abstractform',0).getForm();
			BSG.util.getComponent('#queryMessage',0).update('');
			if (a.isValid() && b.isValid() && c.isValid() && d.isValid()){
				BSG.variables.isQueryValid=true;
				try{
				
				//BSG.util.queryDatabase()
				
				
				//console.log(query);					
				//set the query parameters as extraparams,load the first page
				//Ext.data.StoreManager.lookup('Articles').setProxy(BSG.variables.multiArticleProxy);
				
				//Ext.data.StoreManager.lookup('Articles').proxy.directFn= Ext.ss.QueryBiblio.getResults,
				
				/*Ext.data.StoreManager.lookup('Articles').setProxy( 
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
				);*/
				
				//set the proxy for multiple results
				BSG.util.getComponent('#gridPaging',0).bindStore(Ext.data.StoreManager.lookup('Articles'));
				BSG.variables.biblioGrid.reconfigure(Ext.data.StoreManager.lookup('Articles'));
				BSG.variables.queryParameters=BSG.util.buildQueryParamsObject();
				
				BSG.util.queryDatabase(BSG.variables.queryParameters);
				
				
				}catch(e){
					BSG.util.getComponent('#queryMessage',0).update('<b style="color:red">'+e.message+'</b>');
				}		
			}else{
				BSG.variables.isQueryValid=false;
				BSG.util.getComponent('#queryMessage',0).update('<b style="color:red">Please, look for the exclamation marks</b>');
			}
		}	
	};