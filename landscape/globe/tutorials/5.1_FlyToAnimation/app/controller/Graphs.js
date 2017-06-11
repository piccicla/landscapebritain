Ext.define('BSG.controller.Graphs',{
	extend:'Ext.app.Controller',
	init:function(){
		this.control({
			'graphbutton':{
				click:this.onGraphButtonClick
			}
		});
	},
	onGraphButtonClick:function(button,e,eOpts){		
		if(!BSG.variables.graphWindow){
			BSG.variables.graphWindow=Ext.create('widget.window', {
			id: 'graphWindow',
			itemId: 'graphWindow',
			//title: 'Map window',
			closable: true,
			closeAction: 'hide',
			draggable:true,
			modal: false,
			hideMode:'offsets',
			width: 600,
			height: 400,
			//minWidth: 400,
			//maxWidth: 600,
			//maxHeight: 600,
			//modal : true,
			resizable :false,
			layout: 'fit',
			//bodyStyle: 'padding: 5px;',
			listeners:{
					/*afterrender: function(window,e){},*/									
					hide: function(component,eOpts){
						//console.log("graphHide");
					}
				},
			tbar: [{
				text: 'Reload Data',
				handler: function() {
					BSG.store.store6.loadData(BSG.util.generateLevelData());
				}
				}, {
				enableToggle: true,
				pressed: true,
				text: 'Animate',
				toggleHandler: function(btn, pressed) {
					var chart = Ext.getCmp('chartCmp');
					chart.animate = pressed ? { easing: 'ease', duration: 500 } : false;
				}
			}],
			items: {
				id: 'chartCmp',
				xtype: 'chart',
				style: 'background:#fff',
				theme: 'Green',
				insetPadding: 20,
				animate: true,
				store: BSG.store.store6,
				//legend: {position: 'right'},
				axes: [{
					type: 'Radial',
					position: 'radial'
					,label: {
						display: false
					}
				}],
				series: [{
					//showInLegend: true,
					type: 'radar',
					xField: 'name',
					yField: 'data1',
					showMarkers: true,
					markerConfig: {
						radius: 3,
						size: 3
					},
					style: {
						opacity: 0.4
					}
				}
				/*
				,{
					//showInLegend: true,
					type: 'radar',
					xField: 'name',
					yField: 'data2',
					showMarkers: true,					
					markerConfig: {
						radius: 1,
						size: 1
					},
					style: {
						opacity: 0.4
					}
				},{
					//showInLegend: true,
					type: 'radar',
					xField: 'name',
					yField: 'data3',
					showMarkers: true,	
					markerConfig: {
						radius: 1,
						size: 1
					},
					style: {
						opacity: 0.4
					}
				}
				*/
				]
			}			
			});		
		};
		
		//change window visibility
		if (BSG.variables.graphWindow.isVisible()) {
			BSG.variables.graphWindow.hide();
		}					
		else{
					BSG.variables.graphWindow.show(null, function() {
					
					if (BSG.variables.selectedRow!=-1){
						//todo load the right data
						BSG.store.store6.loadData(BSG.util.generateLevelData());
					}
					});
			}	
	}		
	});