Ext.define('BSG.controller.Manage',{
	extend:'Ext.app.Controller',
	init:function(){
		this.control({
			'combostyle':{
				select:this.onStylSelectionChange
			},
			'bookmarkbutton':{
				click:this.onClickBookmark
			}
		});
	},
	//this is for changing the style
	onStylSelectionChange:function(combo,records,eOpts ){
			var name = combo.value;
            var currentPath = window.location.pathname;
            var isCurrent = currentPath.match(name);        
			if (!isCurrent) {
				window.location = name;
			}
	},
	//this is for bookmarking the map
	onClickBookmark:function(button,e,eOpts){
		if(BSG.util.hasLocalStorage()){
			//alert("support localstorage");
			localStorage.setItem('BSGLocalStorage', 'a');
			alert(localStorage.getItem('BSGLocalStorage'));
			localStorage.removeItem('BSGLocalStorage');	
		}else{
			alert("no support localstorage");
		}
	}
	});