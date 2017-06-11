Ext.define('BSG.view.LayerTree',{
	extend:'Ext.tree.Panel',
	alias:'widget.layertree',
	//stores:['LayersTree'],	
	initComponent:function(){
		this.id='layertree';		
		this.store= 'LayersTree';
        this.rootVisible= false;
        //this.useArrows= true;
        //this.frame= true;
        //this.title= 'Check Tree';       
        //this.width= 200,
        //this.height= 250,
        /*this.dockedItems= [{
            xtype: 'toolbar',
            items: {
                text: 'Get checked nodes',
                handler: function(){
                    var records = tree.getView().getChecked(),
                        names = [];
                    
                    Ext.Array.each(records, function(rec){
                        names.push(rec.get('text'));
                    });
                    
                    Ext.MessageBox.show({
                        title: 'Selected Nodes',
                        msg: names.join('<br />'),
                        icon: Ext.MessageBox.INFO
                    });
                }
            }
        }];*/		
		this.callParent(arguments);	
	}
});