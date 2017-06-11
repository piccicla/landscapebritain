Ext.define('BSG.view.QueryDetailsToolbar',{
	extend:'Ext.toolbar.Toolbar',
	alias:'widget.querydetailstoolbar',	
	initComponent:function(){
		this.id= 'queryDetailsToolbar',
		this.height=35;	
		if (BSG.util.hasLocalStorage()){	
			this.layout='hbox';
			this.items= [
				{xtype: 'querydetailsradiogroup'},	       
				{xtype: 'querydetailsbuttongroup'},
				{xtype:'querywindowbutton'},
				{xtype: 'tbseparator'},
				{xtype:'querybutton'}
			];
		}else{
			//this.layout='fit';	
			this.items= [
			{xtype:'querywindowbutton'},
			{xtype: 'tbseparator'},
			{xtype:'querybutton'}];
		}	
		this.callParent(arguments);	
	}	
});