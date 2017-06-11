Ext.define('BSG.view.ImagesViewer',{
	extend:'Ext.view.View',
	alias:'widget.imagesviewer',	
	initComponent:function(){
		this.id='imagesViewer';
		this.autoScroll= true;        
		this.store= Ext.data.StoreManager.lookup('ImagesView');
		this.tpl= BSG.variables.tplImageView;					
		this.singleSelect=true;
		//this.autoHeight= false;
		//this.height= 450;
		this.trackOver= true;
		this.style= 'border:1px solid #99BBE8; border-top-width: 0';
		this.overItemCls= 'x-item-over';
		this.itemSelector= 'div.thumb-wrap';
		this.emptyText= 'No images to display';
		this.prepareData= function(data) {
			Ext.apply(data, {
				shortName: Ext.util.Format.ellipsis(data.name, 15),
				sizeString: Ext.util.Format.fileSize(data.size)
				//,dateString: Ext.util.Format.date(data.lastmod, "m/d/Y g:i a")
			});
			return data;
		};	
		this.callParent(arguments);	
	}	
});