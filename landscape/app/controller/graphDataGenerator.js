//if(!BSG){var BSG={}};
//if(!BSG.util){BSG.util={}};

BSG.util.generateData= function(n, floor){
	var data = [],
	p = (Math.random() * 11) + 1,
	i;
	floor = (!floor && floor !== 0)? 20 : floor;
	for (i = 0; i < (n || 12); i++) {
	data.push({
		name: Ext.Date.monthNames[i % 12],
		data1: Math.floor(Math.max((Math.random() * 100), floor)),
		data2: Math.floor(Math.max((Math.random() * 100), floor)),
		data3: Math.floor(Math.max((Math.random() * 100), floor)),
		data4: Math.floor(Math.max((Math.random() * 100), floor)),
		data5: Math.floor(Math.max((Math.random() * 100), floor)),
		data6: Math.floor(Math.max((Math.random() * 100), floor)),
		data7: Math.floor(Math.max((Math.random() * 100), floor)),
		data8: Math.floor(Math.max((Math.random() * 100), floor)),
		data9: Math.floor(Math.max((Math.random() * 100), floor))
	});
	}
	return data;
};

BSG.util.generateDataNegative = function(n, floor){
	var data = [],
	p = (Math.random() * 11) + 1,
	i;
	floor = (!floor && floor !== 0)? 20 : floor;
	for (i = 0; i < (n || 12); i++) {
	data.push({
		name: Ext.Date.monthNames[i % 12],
		data1: Math.floor(((Math.random() - 0.5) * 100), floor),
		data2: Math.floor(((Math.random() - 0.5) * 100), floor),
		data3: Math.floor(((Math.random() - 0.5) * 100), floor),
		data4: Math.floor(((Math.random() - 0.5) * 100), floor),
		data5: Math.floor(((Math.random() - 0.5) * 100), floor),
		data6: Math.floor(((Math.random() - 0.5) * 100), floor),
		data7: Math.floor(((Math.random() - 0.5) * 100), floor),
		data8: Math.floor(((Math.random() - 0.5) * 100), floor),
		data9: Math.floor(((Math.random() - 0.5) * 100), floor)
	});
}
return data;
};

BSG.util.generateLevelData = function(floor){
	var data = [],
	p = (Math.random() * 11) + 1,
	i;
	floor = (!floor && floor !== 0)? 0 : floor;
	level1=['Technique','Management','Environment/ Landform or Process type','Processes','Impact','Material','Timescale or period','Attribute within system','Hazards'];	
	for (i = 0; i < level1.length; i++) {
	data.push({
		name: level1[i],
		data1: Math.floor(Math.max((Math.random() * 10), floor)),
		data2: Math.floor(Math.max((Math.random() * 10), floor)),
		data3: Math.floor(Math.max((Math.random() * 10), floor)),
		data4: Math.floor(Math.max((Math.random() * 10), floor)),
		data5: Math.floor(Math.max((Math.random() * 10), floor)),
		data6: Math.floor(Math.max((Math.random() * 10), floor)),
		data7: Math.floor(Math.max((Math.random() * 10), floor)),
		data8: Math.floor(Math.max((Math.random() * 10), floor)),
		data9: Math.floor(Math.max((Math.random() * 10), floor))
	});
}
return data;
};


BSG.util.generateGraphDataStore= function(){
	BSG.store.store1 = Ext.create('Ext.data.JsonStore', {
		fields: ['name', 'data1', 'data2', 'data3', 'data4', 'data5', 'data6', 'data7', 'data9', 'data9'],
		data: BSG.util.generateData()
	});
	BSG.store.storeNegatives = Ext.create('Ext.data.JsonStore', {
		fields: ['name', 'data1', 'data2', 'data3', 'data4', 'data5', 'data6', 'data7', 'data9', 'data9'],
		data: BSG.util.generateDataNegative()
	});
	BSG.store.store3 = Ext.create('Ext.data.JsonStore', {
		fields: ['name', 'data1', 'data2', 'data3', 'data4', 'data5', 'data6', 'data7', 'data9', 'data9'],
		data: BSG.util.generateData()
	});
	BSG.store.store4 = Ext.create('Ext.data.JsonStore', {
		fields: ['name', 'data1', 'data2', 'data3', 'data4', 'data5', 'data6', 'data7', 'data9', 'data9'],
		data: BSG.util.generateData()
	});
	BSG.store.store5 = Ext.create('Ext.data.JsonStore', {
		fields: ['name', 'data1', 'data2', 'data3', 'data4', 'data5', 'data6', 'data7', 'data9', 'data9'],
		data: BSG.util.generateData()
	});
	BSG.store.store6 = Ext.create('Ext.data.JsonStore', {
		//fields: ['name', 'data1', 'data2', 'data3', 'data4', 'data5', 'data6', 'data7', 'data8', 'data9'],
		fields: ['name', 'data1'],
		data: BSG.util.generateLevelData()
	});
};