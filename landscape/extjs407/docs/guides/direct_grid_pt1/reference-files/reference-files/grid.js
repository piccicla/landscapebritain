/*

This file is a modified version of direct-grid.js found in the Ext JS 4 package.

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
Ext.onReady(function() {
	Ext.direct.Manager.addProvider(Ext.app.REMOTING_API);
	
	//added model inside onready
	Ext.define('PersonalInfo', {
		extend: 'Ext.data.Model',
		fields: ['id', 'name', 'address', 'state']
	});
	
	//separated store into unique var for guaranteeRange
	var store = Ext.create('Ext.data.Store', {
		model: 'PersonalInfo',
		autoLoad: true,
		proxy: {
			type: 'direct',
			directFn: QueryDatabase.getResults,
		}
	});
	
	//create the grid
	var grid = Ext.create('Ext.grid.Panel', {
		height: 450,
		width: 700,
		title: 'Velociraptor Owners',
		store: store,
		columns: [{
			dataIndex: 'id',
			width: 50,
			text: 'ID'
		}, {
			dataIndex: 'name',
			flex: 1,
			text: 'Name'
		}, {
			dataIndex: 'address',
			flex: 1.3,
			text: 'Address'
		}, {
			dataIndex: 'state',
			flex: 1,
			text: 'State'
		}],
		renderTo: Ext.getBody()
	});
});