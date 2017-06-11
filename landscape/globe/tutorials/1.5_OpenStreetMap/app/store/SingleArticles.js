Ext.define('BSG.store.SingleArticles', {
		extend: 'Ext.data.Store',
		require:'BSG.model.SingleArticle',
		model:'BSG.model.SingleArticle',
		initComponent:function(){
			//this.autoLoad= {start: 0, limit:BSG.variables.itemsPerPage};
			//this.pageSize=BSG.variables.itemsPerPage;
			this.groupField= 'SOURCE';
			this.callParent(arguments);	
		}
	});