Ext.define('BSG.controller.Graphs',{
	extend:'Ext.app.Controller',
	init:function(){
		this.control({
			'graphbutton':{
				click:this.onGraphButtonClick
			},
			totalgraphbutton:{
				click:this.onTotalGraphButtonClick
			},
			'reportbutton':{
				click:this.onReportButtonClick
			},
			'#buttonGetReport':{
				click:this.onGetReportButtonClick
			},
			'#radiogroupReport':{
				change:this.onChangeRadioGroupReport
			},
			'#reportWindow':{
				hide:this.onreportWindowHide
			}
		});
	},
	onreportWindowHide:function(component,eOpts){
		//console.log('hide');
		//select the first thing to fire events and restore single selection on the grid
		BSG.util.getComponent('#radiogroupReportType',0).setValue({REPORTTYPE:'single'});
	},
	onChangeRadioGroupReport:function(field,newValue,oldValue,eOpts){
		if (newValue.REPORTFORMAT=='pdf' || newValue.REPORTFORMAT=='endnote' ){
			BSG.util.getComponent('#radiogroupReportAbstract',0).enable(true);
			if (newValue.REPORTFORMAT=='pdf'){
				BSG.util.getComponent('#reportName',0).enable(true);
			}else{BSG.util.getComponent('#reportName',0).disable(true);}
		}else{BSG.util.getComponent('#radiogroupReportAbstract',0).disable(true);BSG.util.getComponent('#reportName',0).disable(true);}		
		if(newValue.REPORTFORMAT=='csv'){
			BSG.util.getComponent('#radiogroupReportCSVDelimiter',0).enable(true);
		}else{BSG.util.getComponent('#radiogroupReportCSVDelimiter',0).disable(true);}
	},
	onGetReportButtonClick:function(button,e,eOpts){
		var a=BSG.util.getComponent('reportform',0).getForm();
		if (a.isValid()  && BSG.util.getComponent('bibliogrid',0).store.getTotalCount()>0){

			try{
				
				canQuery=true;
				//TODO read the form and set the parameters
				var par={};
				
				var v=a.getValues();
				//TODO create params

				//set the format according to the windowform
				var action='';
				par.format='';
				
				switch(v.REPORTFORMAT){
					case 'json':
						action='getPlaces/report.php';
						par.format='json';
					break;
					case 'kml':
						action='getPlaces/report.php';
						par.format='kml';
					break;
					case 'csv':
						action='pdf/csv.php';
						par.format='';
						if(v.REPORTCSVDELIMITER==','){par.csvdel=',';}else{par.csvdel=';';}
					break;
					case 'endnote':
						action='pdf/endnote.php';
						par.format='';
					break;
					case 'pdf':
						action='pdf/pdf.php';
						par.format='';
					break;
				}
																
				//set this if you want only the selected
				
				switch(v.REPORTTYPE){
				case('single'):
				if(!(typeof(BSG.util.getComponent('bibliogrid',0).getSelectionModel().getSelection()[0])=="undefined")){
					par.single=true;
					par.id=BSG.util.getComponent('bibliogrid',0).getSelectionModel().getSelection()[0].data.id;
					canQuery=true;
				} else {
				canQuery=false;
				}
				break;
				case('multiple'):
				if(!(typeof(BSG.util.getComponent('bibliogrid',0).getSelectionModel().getSelection()[0])=="undefined")){
					par.multiple=true;
					//todo create an array of value
					var e=[];
					var t=BSG.util.getComponent('bibliogrid',0).getSelectionModel().getSelection();
					for(var i in t)
					{
						e.push(t[i].data.id);
					}
					par.id=Ext.encode(e);
					canQuery=true;
				} else {
				canQuery=false;
				}
				break;
				case('page'):
				//set the offset if you want all the page
				par.offset=((BSG.util.getComponent('bibliogrid',0).store.currentPage - 1) * BSG.util.getComponent('bibliogrid',0).store.pageSize);
				break;
				//todo finish this
				case('all'):
				//set the offset if you want all the page
				//par.offset=((BSG.util.getComponent('bibliogrid',0).store.currentPage - 1) * BSG.util.getComponent('bibliogrid',0).store.pageSize);
				break;
				}
				
				//if i selected on the map i need to change the report
				if(BSG.util.getComponent('#bibliogrid',0).store.storeId=="SingleArticles"){
					par.singleart=true;
				}
				
				
				if(v.REPORTFORMAT=='pdf' || v.REPORTFORMAT=='endnote'){	
					//set this if you want the abstract
					if (v.REPORTABSTRACT=='true'){par.getabst=true;}		
					//this is the name of the feature, i send this because in the query parameters there is only the id
					if(BSG.variables.featureName!=""){
					par.featurerawname=BSG.variables.featureName}
					
					if(BSG.variables.l1name!=""){
						par.l1name=BSG.variables.l1name;
					}
					if(BSG.variables.l2name!=""){
						par.l2name=BSG.variables.l2name;
					}
					if(BSG.variables.l3name!=""){
						par.l3name=BSG.variables.l3name;
					}
					if(BSG.variables.sourcename){
						par.sourcename=BSG.variables.sourcename;
					}
					par.repname=v.REPNAME;
				}
		
			//destroy a form if already  available
					Ext.destroy(Ext.get('form'));
				
					//remove all the childrens hidden fields
				/*var f = document.getElementById('form');
				f.innerHTML='';
				//Hopefully everything is removed and the following code won't execute.
				while (f.hasChildNodes()) { 
					 //If there are still nodes present we use the long road.
					 f.removeChild(f.firstChild);
				}*/
					//TODO memory leak??
					//document.body.removeChild(document.getElementById('form'));
					
					
					//create hidden form with download as action
				   var form =  Ext.getBody().createChild({
					   tag: 'form',
					   cls: 'x-hidden',
					   id: 'form',
					   method: 'POST',
					   action: action,
					   target: 'iframe'
					 });
					 
					
					
					
					//create the hidden fields 
					for (x in BSG.variables.queryParameters)
					{
						if(x=='coord'){var a=Ext.encode(BSG.variables.queryParameters[x])}else{var a=BSG.variables.queryParameters[x]}
						Ext.get('form').createChild({
						   tag: 'input',
						   type: 'hidden',
						   name: x, // parameter name
						   value: a // parameter value
						});
					} 
		
		
				//create the hidden fields 
				for (x in par)
				{
					Ext.get('form').createChild({
					   tag: 'input',
					   type: 'hidden',
					   name: x, // parameter name
					   value: par[x]  // parameter value
					});
				} 
				
				
							
				/*var a1=Math.floor((Math.random()*100)+1);
				var a2=Math.floor((Math.random()*100)+1);
				// to set the parameter through a hidden field
				var inputpara = Ext.get('form').createChild({
                   tag: 'input',
                   type: 'hidden',
				   id: 'name',
                   name: 'name', // parameter name
                   value: a1  // parameter value
               });
			   // to set the parameter through a hidden field
				var inputpara = Ext.get('form').createChild({
                   tag: 'input',
                   type: 'hidden',
				   id: 'name2',
                   name: 'name2', // parameter name
                   value: a2  // parameter value
               });*/
 
               // submit the form to initiate the downloading
               if(canQuery){Ext.get('form').dom.submit();Ext.destroy(Ext.get('form'));}
			}catch(e){Ext.destroy(Ext.get('form'));}		
		}else{
			
		}	
	},
	onGraphButtonClick:function(button,e,eOpts){		
		if(!BSG.variables.graphWindow){
			BSG.variables.graphWindow=Ext.create('widget.window', {
			id: 'graphWindow',
			itemId: 'graphWindow',
			title: 'Select a reference on the table to show its classification',
			closable: true,
			closeAction: 'hide',
			draggable:true,
			constrainHeader:true,
			modal: false,
			hideMode:'offsets',
			width: 700,
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
			items: {
				id: 'chartCmp',
				xtype: 'chart',
				style: 'background:#fff',
				theme: 'Green',
				insetPadding: 20,
				animate: true,
				store: BSG.store.FakeGraph,
				//store:'Graphs',
				//legend: {position: 'right'},
				axes: [{
					type: 'Radial',
					position: 'radial'
					,label: {
						//display: true
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
						'stroke-width':2,
						opacity: 0.4
					}
				}]
			}			
			});

		};
		
		//change window visibility
		if (BSG.variables.graphWindow.isVisible()) {
			BSG.variables.graphWindow.hide();
		}					
		else{
					BSG.variables.graphWindow.show(null, function() {
					if(BSG.util.getComponent('#chartCmp',0).store.storeId=='fakeGraph'){BSG.util.getComponent('#chartCmp',0).bindStore('Graphs');}					
					if (BSG.variables.selectedRow!=-1){
						//todo load the right data
						//BSG.store.store6.loadData(BSG.util.generateLevelData());
						Ext.data.StoreManager.lookup('Graphs').load(												
								{
								params: {
									id: BSG.variables.selectedArticleId
								},
								callback: function(records, operation, success) {}
								}
						);
					}
					});
			}	
	},
	onTotalGraphButtonClick:function(button,e,eOpts){
			if(!BSG.variables.totalGraphWindow){
			BSG.variables.totalGraphWindow=Ext.create('widget.window', {
			id: 'totalGraphWindow',
			itemId: 'totalGraphWindow',
			title: 'Class1 classification for the entire database',
			closable: true,
			closeAction: 'hide',
			draggable:true,
			constrainHeader:true,
			modal: false,
			hideMode:'offsets',
			width: 600,
			height: 500,
			resizable :false,
			layout: 'fit',
			//bodyStyle: 'padding: 5px;',
			listeners:{
					/*afterrender: function(window,e){},*/									
					/*hide: function(component,eOpts){
						//console.log("graphHide");
					}*/
				},
			 items:{
				xtype: 'chart',
				id: 'totalChart',
				animate: true,
				store: 'TotalGraphs',
				shadow: true,
				/*legend: {
					position: 'right'
				},*/
				insetPadding: 20,
				theme: 'Base:gradients',
				series: [{
					type: 'pie',
					field: 'count',
					showInLegend: true,
					//donut: donut,
					tips: {
					  trackMouse: true,
					  width: 50,
					  height: 20,
					  renderer: function(storeItem, item) {
						//calculate percentage.
						var total = 0;
						Ext.data.StoreManager.lookup('TotalGraphs').each(function(rec) {
							total += rec.get('count');
						});
						//this.setTitle(storeItem.get('count') + ' (' + Math.round(storeItem.get('count') / total * 100) + '%)');
						this.setTitle(storeItem.get('count'));
					  }
					},
					highlight: {
					  segment: {
						margin: 20
					  }
					},
					label: {
						field: 'name',
						display: 'rotate',
						contrast: true,
						font: '15px Arial'
					}
				}]
			}			
			});

		};		
		//change window visibility
		if (BSG.variables.totalGraphWindow.isVisible()) {
			BSG.variables.totalGraphWindow.hide();
		}					
		else{
					BSG.variables.totalGraphWindow.show(null, function() {
						/*if(BSG.util.getComponent('#chartCmp',0).store.storeId=='fakeGraph'){BSG.util.getComponent('#chartCmp',0).bindStore('Graphs');}*/					
						if (Ext.data.StoreManager.lookup('TotalGraphs').count()==0){
							//todo load the right data
							Ext.data.StoreManager.lookup('TotalGraphs').load();
						}
					})
		}		
	},	
	onReportButtonClick:function(button,e,eOpts){		
		if(!BSG.variables.reportWindow){
			BSG.variables.reportWindow=Ext.create('widget.window', {
			id: 'reportWindow',
			itemId: 'reportWindow',
			//title: 'Map window',
			closable: true,
			closeAction: 'hide',
			draggable:true,
			constrainHeader:true,
			modal: false,
			hideMode:'offsets',
			width: 500,
			height: 450,
			//minWidth: 400,
			//maxWidth: 600,
			//maxHeight: 600,
			//modal : true,
			resizable :false,
			layout: 'fit',
			//bodyStyle: 'padding: 5px;',
			listeners:{
					/*afterrender: function(window,e){},*/									
					/*hide: function(component,eOpts){
						//console.log("graphHide");
					}*/
				},
			items:{
				id: 'reportForm',
				xtype: 'reportform'
			}
			});
			
			// create a hiddle frame
		   var frame = Ext.getBody().createChild({
			   tag: 'iframe',
			   cls: 'x-hidden',
			   id: 'iframe',
			   name: 'iframe'
		   });
		  
		};		
		//change window visibility
		if (BSG.variables.reportWindow.isVisible()) {
			BSG.variables.reportWindow.hide();
		}					
		else{
					BSG.variables.reportWindow.show(null, function() {});
			}	
	}	
	});