Ext.define('BSG.view.QueryDetailsRadioGroup',{
	extend:'Ext.form.RadioGroup',
	alias:'widget.querydetailsradiogroup',	
	initComponent:function(){
		//this.fieldLabel= '';
        //this.cls= 'x-check-group-alt';
		//this.columns= 5;		
		this.width= 195;
		this.items=[
			{
				boxLabel  : '1',
				name      : 'query',
				inputValue: 1,
				id        : 'radio1',
				checked: true		
			}, {
				boxLabel  : '2',
				name      : 'query',
				inputValue: 2,
				id        : 'radio2'
			}, {
				boxLabel  : '3',
				name      : 'query',
				inputValue: 3,
				id        : 'radio3'
			},{
				boxLabel  : '4',
				name      : 'query',
				inputValue: 4,
				id        : 'radio4'
			},{
				boxLabel  : '5',
				name      : 'query',
				inputValue: 5,
				id        : 'radio5'
			}				
		];	
		this.callParent(arguments);	
	}	
});