//todo: set the sources

Ext.define('BSG.view.SpatialForm',{
	extend:'Ext.form.Panel',
	alias:'widget.spatialform',		
	initComponent:function(){		
			this.frame=true;
			this.id= 'formSpatial';
			this.itemId='formSpatial';
			this.height= 660;
			this.border=0;
			this.api= {  
				   submit: Ext.ss.QueryDatabase.queryBySpatial 
			};
			this.fieldDefaults= {
			//labelAlign: 'right',
			//msgTarget: 'side'
			};		
			this.items= [
			{
				xtype: 'fieldset',
				id: 'SpatialFieldKind',
				title:'Select query type',             
				margin: '1 0 1 0',
				defaults: {
					width:250
				},			
				items: [{
						xtype: 'radiogroup',
						id:'radiogroupSpatial',
						columns: 1,
						items: [
							{boxLabel: 'Current extent', name: 'SPATIALEXTENT', inputValue: 'extent', checked: true},
							{boxLabel: 'Select feature', name: 'SPATIALEXTENT', inputValue: 'select'},
							{boxLabel: 'Draw feature', name: 'SPATIALEXTENT', inputValue: 'draw'}
						]
				}]
			},
			{
				xtype: 'fieldset',
				id: 'SpatialFieldSet',
				disabled:true,
				title:'Select by spatial feature',             
				margin: '1 0 1 0',
				defaultType: 'textfield',
				defaults: {
					width:250,
					labelAlign: 'left',
					labelWidth:70,
					msgTarget: 'side',
					margin: '1 1 1 1'
				},			
                items: [				
				{
					xtype: 'combobox',
					fieldLabel: 'Layer',
					name: 'LAYER',
					editable : false,
					id:'comboboxLayer',
					itemId: 'comboboxLayer',
					allowBlank:false,
					//emptyText : "select from database",
					//valueNotFoundText : "connecting to database",				
					////TODO: the problem here....
					//forceSelection: true,					
					typeAhead: false,
					typeAheadDelay:250,
					queryMode: 'remote',				
					displayField: 'NAME',
					valueField: 'NAME',
					triggerAction: 'all',
					selectOnTab: true,
					store: 'Layers',
					//??? don't understand their use
					lazyRender: true,
					listClass: 'x-combo-list-small',
					enableKeyEvents:true				
				},{
					
					xtype: 'fieldcontainer',
					margin: '1 0 1 0',
					//combineErrors: true,
					//msgTarget : 'side',
					layout:'hbox',
					//width: 250,
					items: [{
						width: 222,
						fieldLabel: 'Name',
						labelAlign: 'left',
						labelWidth:70,
						margin: '0 1 0 1',
						name: 'FEATURENAME',
						xtype: 'combobox',
						id:'comboboxFeature',     
						itemId: 'comboboxFeature',
						disabled:true,
						allowBlank:false,
						//emptyText : "select from database",				
						//valueNotFoundText : "connecting to database",
						//i solved setting forceSelection when i select a row on the grid, and setting true when i begin writing the field
						forceSelection: true,				
						minChars:1,
						typeAhead: true,
						typeAheadDelay:250,
						queryMode: 'remote',				
						displayField: 'NAME',
						valueField: 'id',
						triggerAction: 'all',
						selectOnTab: true,
						store: 'LayerNames',
						//??? don't understand their use
						lazyRender: true,
						listClass: 'x-combo-list-small',
						enableKeyEvents:true,
						msgTarget : 'side'					
					},{
						width: 24,
						margin:0,
						xtype: 'button',
						id:'featureButtonHelp',
						iconCls: 'helpIcon',
						//iconAlign:'left',
						//width:24,
						//height:24,
						tooltip: 'show all features names for this layer'
						//,disabled:true
					}]
				},
				{
					xtype: 'fieldcontainer',
					combineErrors: true,
					margin: '1 0 1 0',
					msgTarget : 'side',
					layout:'hbox',
					items: [{
						width: 222,
						labelAlign: 'left',
						margin: '0 1 0 1',
						labelWidth:70,
						xtype: 'numberfield',
						fieldLabel: 'Buffer',
						id:'featureRadius',
						name: 'LAYERRADIUS',
						value: 0,
						minValue: 0,
						maxValue: 1000
				},{
					width: 24,
					margin:0,
					xtype: 'button',
					id:'featureButtonBuffer',
					iconCls: 'buffer',
					//iconAlign:'left',
					//width:24,
					//height:24,
					tooltip: 'show buffer'
					//,disabled:true
					}]
				},			
				{	
					fieldLabel: 'Unit',
					xtype: 'radiogroup',
					id:'radiogroupUnit',
					items: [
						{boxLabel: 'Km', name: 'UNITBUFFER', inputValue: 'km',checked: true},
						{boxLabel: 'm', name: 'UNITBUFFER', inputValue: 'm'},
						{boxLabel: 'mi', name: 'UNITBUFFER', inputValue: 'mi'}
					]
				}
				/*,{
					xtype: 'button',
					id:'featureButtonBuffer',
					iconCls: 'buffer',
					iconAlign:'left',
					width:24,
					//height:24,
					margin:'0 0 0 226',
					tooltip: 'show buffer'
					//,disabled:true
				}*/								
				] //end fieldset items
			
				},
				{
					xtype: 'buttongroup',
					id:'buttongroupFeature',
					disabled:true,
					layout: 'hbox',
					items:[
					/*{
					flex:1,
					id:'buttonSetFeature',
					text: 'Set',
					iconCls: 'queryIcon'
					},*/
					{
					flex:1,
					text: 'Clear',
					id:'buttonClearFeature',
					iconCls: 'delete'
					}]
				},
				{
				xtype: 'fieldset',
				id: 'SpatialDrawSet',
				disabled:true,
				title:'Draw spatial feature',             
				margin: '1 0 1 0',
				defaultType: 'textfield',
				columns:1,
				defaults: {
					width:250,
					labelAlign: 'left',
					labelWidth:70,
					msgTarget: 'side',
					margin: '1 0 1 1'
				},			
                items: [			
						{
						xtype:'button',
						//flex:1,
						id:'drawPointButton',
						text: 'Point',
						scale: 'large',
						iconCls: 'drawPoint'
						},
						{
						xtype:'button',
						//flex:1,
						id:'drawLineButton',
						text: 'Line',
						scale: 'large',
						iconCls: 'drawLine'
						},
						{
						xtype:'button',
						//flex:1,
						id:'drawPolygonButton',
						scale: 'large',
						text: 'Polygon',
						iconCls: 'drawPolygon'
						},
						{
						xtype:'button',
						//flex:1,
						id:'drawBoxButton',
						scale: 'large',
						text: 'Box',
						iconCls: 'drawSquare'
						},
					/*{
						xtype: 'buttongroup',
						//layout: 'vbox',
						columns:1,
						items:[{
						//flex:1,
						text: 'Point',
						iconCls: 'queryIcon'
						},
						{
						//flex:1,
						text: 'Poligon',
						iconCls: 'delete'
						}
						]
					}*/			
						{
						xtype: 'fieldcontainer',
						combineErrors: true,
						msgTarget : 'side',
						layout:'hbox',
						items: [{
							width: 222,
							fieldLabel: 'Name',
							labelAlign: 'left',
							labelWidth:70,					
							xtype: 'numberfield',
							fieldLabel: 'Buffer',
							id:'drawRadius',
							name: 'DRAWRADIUS',
							value: 0,
							minValue: 0,
							maxValue: 1000
							},{
							width: 24,
							margin:0,
							xtype: 'button',
							id:'drawButtonBuffer',
							iconCls: 'buffer',
							//iconAlign:'left',
							//width:24,
							//height:24,
							tooltip: 'show buffer'
							//,disabled:true
						}]
						},			
						{	
							fieldLabel: 'Unit',
							id:'radiogroupDrawUnit',
							xtype: 'radiogroup',
							items: [
								{boxLabel: 'Km', name: 'UNITDRAWBUFFER', inputValue: 'km',checked: true},
								{boxLabel: 'm', name: 'UNITDRAWBUFFER', inputValue: 'm'},
								{boxLabel: 'mi', name: 'UNITDRAWBUFFER', inputValue: 'mi'}
							]
						}
						/*,{
							xtype: 'button',
							id:'drawButtonBuffer',
							iconCls: 'buffer',
							//iconAlign:'right',
							width:24,
							margin:'0 0 0 226',
							tooltip: 'show buffer'
							//,disabled:true
						}*/			
					]
				},
				{
					xtype: 'buttongroup',
					id:'buttongroupDrawFeature',
					disabled:true,
					layout: 'hbox',
					items:[
					/*{
					flex:1,
					id:'buttonSetDrawFeature',
					text: 'Set',
					iconCls: 'queryIcon'
					},*/
					{
					flex:1,
					id:'buttonClearDrawFeature',
					text: 'Clear',
					iconCls: 'delete'
					}]
				}
				];
				/*this.buttons= [{
						text: 'Set',
						iconCls: 'queryIcon',										
						itemId: 'buttonSetSpatial',
						id: 'buttonSetSpatial',
						disabled: true,
						handler: function() {
							console.log("buttonSelectSpatial!");
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
					},{
						text: 'Clear',
						iconCls: 'delete',										
						itemId: 'buttonClearSpatial',
						id: 'buttonClearSpatial',
						disabled: true,
						handler: function() {}
					}];*/					
		this.callParent(arguments);
	}		
});