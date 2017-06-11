//todo: set the sources

Ext.define('BSG.view.AttributeForm',{
	extend:'Ext.form.Panel',
	alias:'widget.attributeform',
		
	initComponent:function(){		
			this.frame=true;
			this.id= 'formAttribute';
			this.itemId='formAttribute';
			this.height= 300;
			this.border=0;
			this.api= {  
				   submit: Ext.ss.QueryDatabase.queryByAttribute 
			};
			this.fieldDefaults= {
			//labelAlign: 'right',
			//msgTarget: 'side'
			};		
			this.items= [
			{
				xtype: 'fieldset',
				id: 'AttributeFieldSet',
				title:'[2] Select by attribute',             
				margin: '1 0 1 0',
				defaultType: 'textfield',
				defaults: {
					width:250,
					labelAlign: 'left',
					labelWidth:75,
					msgTarget: 'side'
				},			
                items: [			
				{
					fieldLabel: 'Author',
					name: 'AUTHOR',
					id:'authorField',
					enableKeyEvents:true				
				}
				,{
					fieldLabel: 'Year',
					name: 'YEAR',
					id:'yearField',
					vtype: 'anno'					
				},
				{
					//xtype: 'textareafield',
					fieldLabel: 'Title',
					name: 'TITLE',
					id:'titleField',
					vtype: 'one'
				},
				{
					xtype: 'combobox',
					fieldLabel: 'Publication',
					name: 'PUBLICATION',
					id:"comboboxPublication",
					itemId: "comboboxPublication",
					//emptyText : "select from database",
					//valueNotFoundText : "connecting to database",				
					//forceSelection: true,					
					minChars:1,
					typeAhead: true,
					typeAheadDelay:250,
					queryMode: 'remote',				
					displayField: 'NAME',
					valueField: 'NAME',
					triggerAction: 'all',
					selectOnTab: true,
					store: 'Publications',
					//??? don't understand their use
					lazyRender: true,
					listClass: 'x-combo-list-small',
					enableKeyEvents:true				
				},{
					fieldLabel: 'Publisher',
					name: 'PUBLISHER',
					xtype: 'combobox',
					id:"comboboxPublisher",     
					itemId: "comboboxPublisher",
					//emptyText : "select from database",				
					//valueNotFoundText : "connecting to database",
					//forceSelection: true,				
					minChars:1,
					typeAhead: true,
					typeAheadDelay:250,
					queryMode: 'remote',				
					displayField: 'NAME',
					valueField: 'NAME',
					triggerAction: 'all',
					selectOnTab: true,
					store: 'Publishers',
					//??? don't understand their use
					lazyRender: true,
					listClass: 'x-combo-list-small',
					enableKeyEvents:true							
				},{
					fieldLabel: 'Source',
					name: 'SOURCE',
					xtype: 'combobox',
					id:"comboboxSource",
					itemId: "comboboxSource",
					//emptyText : "select from database",				
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
					store: 'Sources',
					//??? don't understand their use
					lazyRender: true,
					listClass: 'x-combo-list-small',
					enableKeyEvents:true											
				},
				{	
					fieldLabel: 'Type',
					id:'radiogroupAttribute',
					xtype: 'radiogroup',
					items: [
						{boxLabel: 'OR', name: 'TYPE', inputValue: 'or',checked: true},
						{boxLabel: 'AND', name: 'TYPE', inputValue: 'and'}
					]
				}
				
				
				] //end fieldset items
			
				},
					{
						xtype: 'buttongroup',
						id:'buttongroupAttribute',
						layout: 'hbox',
						items:[
						/*{
						flex:1,
						text: 'Set',
						iconCls: 'queryIcon',										
						itemId: 'buttonSetAttribute',
						id: 'buttonSetAttribute',
						//disabled: true,
						handler: function() {
							//console.log("buttonSetAttribute!");
						/*var formL = Ext.getCmp('formLevel').getForm();								
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
						},*/
						{
						flex:1,
						text: 'Clear',
						iconCls: 'delete',										
						itemId: 'buttonClearAttribute',
						id: 'buttonClearAttribute',
						//disabled: true,
						handler: function() {}
						}]
					}
				];					
		this.callParent(arguments);
	}		
});