Ext.define('BSG.view.FileDownload', {
    extend: 'Ext.Component',
    alias: 'widget.filedownloader',
    autoEl: {
        tag: 'iframe', 
        cls: 'x-hidden', 
        src: Ext.SSL_SECURE_URL
    },
    stateful: false,
    load: function(config){
        /*var e = this.getEl();
        e.dom.src = config.url + 
            (config.params ? '?' + Ext.urlEncode(config.params) : '');
        e.dom.onload = function() {
            if(e.dom.contentDocument.body.childNodes[0].wholeText == '404') {
                Ext.Msg.show({
                    title: 'Attachment missing',
                    msg: 'The document you are after can not be found on the server.',
                    buttons: Ext.Msg.OK,
                    icon: Ext.MessageBox.ERROR   
                })
            }
        }*/
			config.a.submit({
			clientValidation: true,
			url: config.url,
			params: config.params/*,
			success: function(form, action) {
			   Ext.Msg.alert('Success', action.result.msg);
			},
			failure: function(form, action) {
				switch (action.failureType) {
					case Ext.form.action.Action.CLIENT_INVALID:
						Ext.Msg.alert('Failure', 'Form fields may not be submitted with invalid values');
						break;
					case Ext.form.action.Action.CONNECT_FAILURE:
						Ext.Msg.alert('Failure', 'Ajax communication failed');
						break;
					case Ext.form.action.Action.SERVER_INVALID:
					   Ext.Msg.alert('Failure', action.result.msg);
			   }
			}*/
		});
    }
});