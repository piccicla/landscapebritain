Ext.define('BSG.view.AbstractForm',{
	extend:'Ext.form.Panel',
	alias:'widget.abstractform',
	
	initComponent:function(){				
			this.frame=true;
			this.id= 'formAbstract';
			this.itemId='formAbstract';
			this.height= 160;
			this.border=0;
			this.api= {  
				   submit: Ext.ss.QueryDatabase.queryByAbstract 
			};
			this.fieldDefaults= {
			//labelAlign: 'right',
			//msgTarget: 'side'
			};
			
			this.items= [
				{
				xtype: 'fieldset',
				id: 'AbstractFieldSet',
				title:'[3] Select by abstract keyword',             
				margin: '1 0 1 0',
				defaultType: 'textfield',
				defaults: {
					width:250,
					labelAlign: 'left',
					labelWidth:70,
					msgTarget: 'side'
				},						
				items: [			
				{
					fieldLabel: 'Keyword',
					name: 'KEYWORD',
					id: 'keywordField',
					enableKeyEvents:true
					//,vtype: 'one'				
				},
				{	
					fieldLabel: 'Type',
					id:'radiogroupAbstract',
					xtype: 'radiogroup',
					items: [
						{boxLabel: 'OR', name: 'TYPEAB', inputValue: 'or'},
						{boxLabel: 'AND', name: 'TYPEAB', inputValue: 'and',checked: true}
					]
				}]
				},
				{
						xtype: 'buttongroup',
						id:'buttongroupAbstract',
						layout: 'hbox',
						items:[
						/*{
						flex:1,
						text: 'Set',
						iconCls: 'queryIcon',										
						itemId: 'buttonSetAbstract',
						id: 'buttonSetAbstract',
						//disabled: true,
						handler: function() {
							//console.log("buttonSetAbstract!");
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
						itemId: 'buttonClearAbstract',
						id: 'buttonClearAbstract',
						//disabled: true,
						handler: function() {}
						}]
				}];					
		this.callParent(arguments);
	}		
});