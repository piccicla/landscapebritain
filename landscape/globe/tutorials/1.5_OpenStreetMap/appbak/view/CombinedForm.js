Ext.define('BSG.view.CombinedForm',{
	extend:'Ext.form.Panel',
	alias:'widget.combinedform',	
	initComponent:function(){			
			this.frame=true;
			this.id= 'formCombined';
			this.itemId='formCombined';
			this.height= 80;
			this.border=0;
			this.api= {  
				   submit: Ext.ss.QueryDatabase.queryByCombined 
			};

			this.fieldDefaults= {
			//labelAlign: 'right',
			//msgTarget: 'side'
			};
			
			this.items= [
			{
				xtype: 'fieldset',
				id: 'CombinedFieldSet',
				title:'Combined selection',             
				margin: '1 0 1 0',
				defaultType: 'textfield',
				defaults: {
					width:250,
					labelAlign: 'left',
					labelWidth:50,
					msgTarget: 'side'
				},			
				items: [
				/*{
					xtype: 'checkboxgroup',
					// Put all controls in a single column with width 100%
					//columns: 1,
					items: [
						{boxLabel: 'Class', name: 'class'},
						{boxLabel: 'Attribute', name: 'attribute'},
						{boxLabel: 'Abstract', name: 'abstract'}
					]
				}*/
				{	
					fieldLabel: 'Type',
					xtype: 'radiogroup',
					id:'radiogroupCombined',
					items: [
						{boxLabel: 'OR', name: 'QUERYTYPE', inputValue: 'or',checked: true},
						{boxLabel: 'AND', name: 'QUERYTYPE', inputValue: 'and'}
					]
				}

				
				]
			
				}
				];					
		this.callParent();
	}		
});