Ext.define('BSG.store.LayersTree', {
			extend: 'Ext.data.TreeStore',
			require:'BSG.model.LayerTree',
			model:'BSG.model.LayerTree',
			/*proxy: {
            type: 'ajax',
            url: 'check-nodes.json'
			}*/
			/*,
			sorters: [{
				property: 'leaf',
				direction: 'ASC'
			}, {
				property: 'text',
				direction: 'ASC'
			}]
			*/
			root: {
				text: 'Root',
				expanded: true,
				children: [
					{
						text: 'Basemap', 
						iconCls:'basemaps',
						//'cls': 'folder',
						expanded: true
					},
					{
						text: 'Layers', 
						iconCls:'layers',
						//cls: 'folder',
						expanded: true
						/*"children": [{
							"text": "layer1",
							"leaf": true,
							"checked": false
						},{
							"text": "layer2",
							"leaf": true,
							"checked": false
						},{
							"text": "layer2",
							"leaf": true,
							"checked": false
						}]*/
					}]
				}				
			});	