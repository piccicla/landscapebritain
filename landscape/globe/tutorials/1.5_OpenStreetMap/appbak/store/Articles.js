Ext.define('BSG.store.Articles', {
		extend: 'Ext.data.Store',
		require:'BSG.model.Article',
		model:'BSG.model.Article',

		initComponent:function(){
			
			//this.autoLoad= {start: 0, limit:BSG.variables.itemsPerPage};
			//this.pageSize=BSG.variables.itemsPerPage;
			this.groupField= 'SOURCE';
			this.callParent(arguments);	
		}
	});