Ext.define('BSG.view.ChartsButton',{
	extend:'Ext.button.Button',
	alias:'widget.chartsbutton',
	iconCls: 'graphIcon',
	text: 'Graphs',
	arrowAlign: 'right',
    menu      : [
        {xtype:'graphbutton'},
        {xtype: 'totalgraphbutton'}
    ]
});