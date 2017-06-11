Ext.define('BSG.model.Article', {
		extend: 'Ext.data.Model',
		fields: [ {name:'id', type: 'int'},'AUTHOR','TITLE', 'PUB_NAME',{ name:'START_PAGE', type: 'int'},{ name:'END_PAGE',type: 'int'},'VOL',{ name:'YEAR',type: 'int'},'YEAR2','PUBLISHER','LINK','DOI','PLACE','NCA', 'SOURCE','FLAG','PLACE_ID','NCA_ID','SOURCE_ID',{name:'xmin', type: 'float'},{name:'xmax', type: 'float'},{name:'ymin', type: 'float'},{name:'ymax', type: 'float'}]
		/*,proxy: {
			type: 'direct',
			api: {
				read: Ext.ss.QueryDatabase.getResults
			},
			reader: {
				type: 'json',
				root : 'records',
				totalProperty: 'total',
				idProperty :'id'
        }
		}*/		
	});