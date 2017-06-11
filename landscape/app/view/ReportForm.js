Ext.define('BSG.view.ReportForm',{
	extend:'Ext.form.Panel',
	alias:'widget.reportform',		
	initComponent:function(){		
			this.frame=true;
			this.id= 'formReport';
			this.itemId='formReport';
			this.height= 450;
			this.border=1;
			this.fieldDefaults= {
			//labelAlign: 'right',
			//msgTarget: 'side'
			};		
			this.items= [
				{
				xtype: 'fieldset',
				id: 'ReportFieldKind',
				title:'Format',             
				margin: '1 0 1 0',
				defaults: {
					width:500
				},			
				items: [{
						xtype: 'radiogroup',
						id:'radiogroupReport',
						columns: 5,
						items: [
							{boxLabel: 'PDF', name: 'REPORTFORMAT', inputValue: 'pdf', checked: true},
							{boxLabel: 'CSV', name: 'REPORTFORMAT', inputValue: 'csv'},
							{boxLabel: 'EndNote', name: 'REPORTFORMAT', inputValue: 'endnote'},
							{boxLabel: 'GeoJson', name: 'REPORTFORMAT', inputValue: 'json'},
							{boxLabel: 'KML', name: 'REPORTFORMAT', inputValue: 'kml'}
						]
				}]},
				{
				xtype: 'fieldset',
				id: 'ReportOutput',
				title:'Output',             
				margin: '1 0 1 0',
				defaults: {
					width:500
				},			
				items: [{
				
						xtype: 'radiogroup',
						id:'radiogroupReportType',
						columns: 4,
						items: [
							{boxLabel: 'Selected row', name: 'REPORTTYPE', inputValue: 'single', checked: true},
							{boxLabel: 'Multiple rows', name: 'REPORTTYPE', inputValue: 'multiple'},
							{boxLabel: 'Current page', name: 'REPORTTYPE', inputValue: 'page'},
							{boxLabel: 'All pages', name: 'REPORTTYPE', inputValue: 'all'}
						]
				}
				]},
				{
				xtype: 'fieldset',
				id: 'ReportAbstract',
				title:'Abstract',             
				margin: '1 0 1 0',
				defaults: {
					width:500
				},			
				items: [
				{
						xtype: 'radiogroup',
						id:'radiogroupReportAbstract',
						columns: 4,
						items: [
							{boxLabel: 'Yes', name: 'REPORTABSTRACT', inputValue: 'true', checked: true},
							{boxLabel: 'No', name: 'REPORTABSTRACT', inputValue: 'false'}
						]
				}
				]},{
				xtype: 'fieldset',
				id: 'ReportCSVDelimiter',
				title:'CSV delimiter',             
				margin: '1 0 1 0',
				defaults: {
					width:500
				},			
				items: [
				{
						xtype: 'radiogroup',
						id:'radiogroupReportCSVDelimiter',
						columns: 4,
						disabled:true,
						items: [
							{boxLabel: ';', name: 'REPORTCSVDELIMITER', inputValue: ';', checked: true},
							{boxLabel: ',', name: 'REPORTCSVDELIMITER', inputValue: ','}
						]
				}
				]},{
				xtype: 'fieldset',
				id: 'ReportName',
				title:'Report name',             
				margin: '1 0 1 0',
				defaults: {
					width:500
				},			
				items: [{
					xtype: 'textfield',
					id:'reportName',
					name: 'REPNAME',
					value: 'Physical Landscape of Britain and Northern Ireland',
					width:450
				}
				]}
				];
				this.buttons= [{
						text: 'Download',
						iconCls: 'queryIcon',										
						itemId: 'buttonGetReport',
						id: 'buttonGetReport',
						disabled: false
					}];					
		this.callParent(arguments);
	}		
});