Ext.define('BSG.view.Viewport',{
	extend: 'Ext.container.Viewport',
	
	//put the views here to use their xtypes here and in the views
	requires:[
		'BSG.view.BookmarkButton',
		'BSG.view.ComboStyle',
		'BSG.view.MapPanel',
		'BSG.view.DetachTabsButton',
		'BSG.view.AttachLeftTabButton',
		'BSG.view.AttachRightTabButton',
		'BSG.view.VerticalLeftPanel',
		'BSG.view.VerticalRightPanel',
		'BSG.view.DetachGridButton',
		'BSG.view.AttachTopGridButton',
		'BSG.view.AttachBottomGridButton',
		//'BSG.view.ImagesViewer',
		'BSG.view.DetailGridTab',
		'BSG.view.HorizontalPanelCore',
		'BSG.view.HorizontalTopPanel',
		'BSG.view.HorizontalBottomPanel',
		'BSG.view.LevelForm',
		'BSG.view.AttributeForm',
		'BSG.view.AbstractForm',
		'BSG.view.CombinedForm',
		'BSG.view.AttributeQueryPanel',
		'BSG.view.SpatialForm',
		'BSG.view.SpatialQueryPanel',
		'BSG.view.BrowseHelpPanel',
		'BSG.view.MapHelpPanel',
		'BSG.view.LoadQuery',
		'BSG.view.SaveQuery',
		'BSG.view.DeleteQuery',
		'BSG.view.QueryButton',
		'BSG.view.QueryWindowButton',
		'BSG.view.QueryDetailsButtonGroup',
		'BSG.view.QueryDetailsRadioGroup',
		'BSG.view.QueryDetailsToolbar',
		'BSG.view.QueryDetails',
		/////
		'BSG.view.LayerTree',
		/////
		'BSG.view.VerticalTabPanel',		
		'BSG.view.ImageButton',
		'BSG.view.MapButton',
		'BSG.view.ReportButton',
		'BSG.view.ZoomButton',
		'BSG.view.GraphButton',
		'BSG.view.BiblioGrid',
		'BSG.view.DetailGrid'	
	],
	initComponent:function(){
			//console.log("init levelform!");				
			this.layout='border';	
			//build the ui, you can change the region here
			this.items=[{
				xtype:'mappanel',
				region:'center'		
			},{
				xtype:'verticalleftpanel',
				region:'west',
				animCollapse: !Ext.isIE
			},{
				xtype:'verticalrightpanel',
				region:'east',
				animCollapse: !Ext.isIE
			}
			,{
				xtype:'horizontalbottompanel',
				region:'south',
				animCollapse: !Ext.isIE
			},{
				xtype:'horizontaltoppanel',
				region:'north',
				animCollapse: !Ext.isIE
			}
			];		
		this.callParent(arguments);	
	}
});