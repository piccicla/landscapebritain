Ext.define('BSG.view.DetailGridTab',{
	extend:'Ext.tab.Panel',
	alias:'widget.detailgridtab',	
	initComponent:function(){
	this.width=300,
	this.items= [{
			title: 'Details',
			id:'detailsTab',
			autoScroll :true,
			frame:true,
			padding:10,
			tpl:BSG.variables.tplArticleViewDetail
			//,frame:true
		},{
			title: 'Abstract',
			id:'abstractTab',
			padding:10,
			autoScroll :true,
			frame:true
		},{
			title: 'Images',
			id:'imagesTab',
			layout:'fit',
			//frame:true,
			//,items:['imagesviewer']	
			items:[{
				xtype:'dataview',			
				id:'imagesViewer',
				autoScroll: true,        
				store: Ext.data.StoreManager.lookup('ImagesView'),
				tpl: BSG.variables.tplImageView,					
				singleSelect : true,
				//this.autoHeight= false;
				//height: 450,
				trackOver: true,
				style: 'border:1px solid #99BBE8; border-top-width: 0',
				overItemCls:'x-item-over',
				itemSelector: 'div.thumb-wrap',
				emptyText: 'No images to display',
				prepareData: function(data) {
					Ext.apply(data, {
						shortName: Ext.util.Format.ellipsis(data.name, 15),
						sizeString: Ext.util.Format.fileSize(data.size)
						//,dateString: Ext.util.Format.date(data.lastmod, "m/d/Y g:i a")
					});
					return data;
				}
			}]			
		},{
			title: 'Maps',
			id:'mapsTab',
			layout:'fit',
			//frame:true,
			items:[{
				xtype:'dataview',			
				id:'mapsViewer',
				autoScroll: true,        
				store: Ext.data.StoreManager.lookup('MapsView'),
				tpl: BSG.variables.tplImageView,					
				singleSelect : true,
				//this.autoHeight= false;
				//height: 450,
				trackOver: true,
				style: 'border:1px solid #99BBE8; border-top-width: 0',
				overItemCls:'x-item-over',
				itemSelector: 'div.thumb-wrap',
				emptyText: 'No images to display',
				prepareData: function(data) {
					Ext.apply(data,{
						shortName: Ext.util.Format.ellipsis(data.name, 15),
						sizeString: Ext.util.Format.fileSize(data.size)
						//,dateString: Ext.util.Format.date(data.lastmod, "m/d/Y g:i a")
					});
					return data;
				}
			}]
		}];
		//this.dockedItems=[{}];	
	this.callParent(arguments);	
	}	
});