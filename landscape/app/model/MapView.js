Ext.define('BSG.model.MapView', {
		extend: 'Ext.data.Model',	
		fields: [
           {name: 'name'},
           {name: 'url'},
           {name: 'size', type: 'float'},
		   {name:'lastmod'},'vis_url','thumb_url'
        ]	
	});