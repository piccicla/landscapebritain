Ext.define('BSG.model.SingleArticle', {
		extend: 'Ext.data.Model',
		fields: [ {name:'id', type: 'int'},'AUTHOR','TITLE', 'PUB_NAME',{ name:'START_PAGE', type: 'int'},{ name:'END_PAGE',type: 'int'},'VOL',{ name:'YEAR',type: 'int'},'YEAR2','PUBLISHER','LINK','DOI','PLACE','NCA', 'SOURCE','FLAG','PLACE_ID','NCA_ID','SOURCE_ID',{name:'xmin', type: 'float'},{name:'xmax', type: 'float'},{name:'ymin', type: 'float'},{name:'ymax', type: 'float'}]		
	});