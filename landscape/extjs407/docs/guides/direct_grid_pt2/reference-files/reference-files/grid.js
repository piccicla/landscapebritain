/*

This file is a modified version of direct-grid.js in the Ext JS 4 package.

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/

Ext.onReady(function() {
	Ext.direct.Manager.addProvider(Ext.app.REMOTING_API);
	
	Ext.define('PersonalInfo', {
		extend: 'Ext.data.Model',
		fields: [{name:'id',type:'int'}, 'name', 'address', 'state'],
        proxy: {
			type: 'direct',
			api: {
				create:	QueryDatabase.createRecord,
				read: QueryDatabase.getResults,
				update:	QueryDatabase.updateRecords,
				destroy: QueryDatabase.destroyRecord
			}
		}
	});
	
	var store = Ext.create('Ext.data.Store', {
		model: 'PersonalInfo',
		autoLoad: true
	});
		
	var rowEditing = Ext.create('Ext.grid.plugin.RowEditing', {
		clicksToMoveEditor: 1,
		autoCancel: false
	});
	
	var alphaSpaceTest = /^[-\sa-zA-Z]+$/;
	
	Ext.apply(Ext.form.field.VTypes, {
	    //  vtype validation function
	    alphaSpace: function(val, field) {
	        return alphaSpaceTest.test(val);
	    },
	    alphaSpaceText: 'Not a valid state. Must not contain numbers.',
	    alphaSpaceMask: /^[-\sa-zA-Z]+$/
	});
	
	// create the Grid
	var grid = Ext.create('Ext.grid.Panel', {
		height: 450,
		width: 700,
		cls: 'grid',
		title: 'Velociraptor Owners',
		store: store,
		columns: [{
			dataIndex: 'id',
			width: 50,
			text: 'ID'
		}, {
			dataIndex: 'name',
			flex: 1,
			text: 'Name',
			allowBlank: false,
			field: {
				type: 'textfield',
				allowBlank: false
			}
		}, {
			dataIndex: 'address',
			flex: 1.3,
			text: 'Address',
			allowBlank: false,
			field: {
				type: 'textfield',
				allowBlank: false
			}
		}, {
			dataIndex: 'state',
			flex: 0.8,
			text: 'State',
			allowBlank: false,
			field: {
				type: 'textfield',
				allowBlank: false,
				vtype: 'alphaSpace'
			}
		}],
		renderTo: Ext.getBody(),
		plugins: [
			rowEditing
		],
		dockedItems: [{
			xtype: 'toolbar',
			dock: 'bottom',
			//creating, add items
			items: [{
				iconCls: 'add',
				text: 'Add',
				handler: function() {
					rowEditing.cancelEdit();
					// create a blank record from PersonalInfo
					var record = Ext.create('PersonalInfo');
					//insert at top
					store.insert(0, record);
					//edit at row 0
					rowEditing.startEdit(0, 0);
				}
			}, {
				iconCls: 'delete',
				text: 'Delete',
				handler: function() {
					rowEditing.cancelEdit();
					var sm = grid.getSelectionModel();
					Ext.Msg.show({
					     title:'Delete Record?',
					     msg: 'You are deleting a record permanently, this cannot be undone. Proceed?',
					     buttons: Ext.Msg.YESNO,
					     icon: Ext.Msg.QUESTION,
					     fn: function(btn){
					     	if(btn === 'yes') {
					     		store.remove(sm.getSelection());
					     		store.sync();
					     	}
					     }
					});
				}
			}]
		}]
	});
	
	grid.on('edit', function(e) {
        e.record.save();
	});
});