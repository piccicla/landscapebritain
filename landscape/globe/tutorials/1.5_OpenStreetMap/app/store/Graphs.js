Ext.define('BSG.store.Graphs', {
		extend: 'Ext.data.Store',
		require:'BSG.model.Graph',
		model:'BSG.model.Graph',
		//tried to do the following to fix the xlabel problem but...it does not work!!!
		listeners: {
    	load: function(store, records, success) {
			/*var proxy = this.model.getProxy(); 
    		var chart = Ext.getCmp('chartCmp');
    		var series = chart.series;
    		for(var i = 0; i < series.items.length; i++)
    		{
    			var legendItem = series.items[i];
    			var titleIndex = "label" + i;
    			var labels = proxy.reader.rawData.label;
				var title = labels[titleIndex];
    			legendItem.setTitle(title);
    		}
    		var axes=Ext.getCmp('chartCmp').axes;
    		axes.each(function(axis) {
    			axis.label.display = true;
    			axis.drawLabel();
            });*/
    	}
		}
	});