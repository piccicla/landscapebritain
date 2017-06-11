Ext.define('BSG.view.QueryDetails',{
	extend:'Ext.panel.Panel',
	alias:'widget.querydetails',	
	initComponent:function(){
	//this.title='Query details';
	this.frame=true;
	this.id='querydetails';
	this.autoScroll=true;
	//flex:1,
	this.minHeight=40;
	this.height=50;	
	//this.items= [];	
	this.dockedItems=[{
	xtype: 'querydetailstoolbar',
	dock:'bottom'
	}];
/*
	[{
		dock:'bottom',
		xtype:'toolbar',
		id: 'queryDetailsToolbar',
		height:35,
		layout:'hbox',
		items: [
		{	
			xtype: 'radiogroup',
            //fieldLabel: 'Auto Layout',
            //cls: 'x-check-group-alt',
			//columns: 5,
			width: 195,
			items: [
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
				]
		},	       
		{
			xtype: 'buttongroup',
			columns: 3,
			items: [{xtype:'loadquery'},{xtype:'savequery'},{xtype:'deletequery'}]
		},
		{xtype: 'tbseparator'},
		
		{xtype:'querybutton'}
		]
		/*items:[{xtype:'combostyle'},{xtype:'bookmarkbutton'},
		{
			xtype: 'buttongroup',
			columns: 3,
			items: [{xtype:'detachtabsbutton'},{xtype:'attachlefttabbutton'},{xtype:'attachrighttabbutton'}]
		}]	
	}];
	*/
	this.callParent(arguments);	
	}	
});