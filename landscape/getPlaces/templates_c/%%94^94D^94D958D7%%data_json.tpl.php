<?php /* Smarty version 2.6.26, created on 2012-03-01 13:36:48
         compiled from data_json.tpl */ ?>
<?php require_once(SMARTY_CORE_DIR . 'core.load_plugins.php');
smarty_core_load_plugins(array('plugins' => array(array('modifier', 'json_encode', 'data_json.tpl', 6, false),)), $this); ?>
{
"type": "FeatureCollection",
"features": [
<?php unset($this->_sections['sec']);
$this->_sections['sec']['name'] = 'sec';
$this->_sections['sec']['loop'] = is_array($_loop=$this->_tpl_vars['rs']) ? count($_loop) : max(0, (int)$_loop); unset($_loop);
$this->_sections['sec']['show'] = true;
$this->_sections['sec']['max'] = $this->_sections['sec']['loop'];
$this->_sections['sec']['step'] = 1;
$this->_sections['sec']['start'] = $this->_sections['sec']['step'] > 0 ? 0 : $this->_sections['sec']['loop']-1;
if ($this->_sections['sec']['show']) {
    $this->_sections['sec']['total'] = $this->_sections['sec']['loop'];
    if ($this->_sections['sec']['total'] == 0)
        $this->_sections['sec']['show'] = false;
} else
    $this->_sections['sec']['total'] = 0;
if ($this->_sections['sec']['show']):

            for ($this->_sections['sec']['index'] = $this->_sections['sec']['start'], $this->_sections['sec']['iteration'] = 1;
                 $this->_sections['sec']['iteration'] <= $this->_sections['sec']['total'];
                 $this->_sections['sec']['index'] += $this->_sections['sec']['step'], $this->_sections['sec']['iteration']++):
$this->_sections['sec']['rownum'] = $this->_sections['sec']['iteration'];
$this->_sections['sec']['index_prev'] = $this->_sections['sec']['index'] - $this->_sections['sec']['step'];
$this->_sections['sec']['index_next'] = $this->_sections['sec']['index'] + $this->_sections['sec']['step'];
$this->_sections['sec']['first']      = ($this->_sections['sec']['iteration'] == 1);
$this->_sections['sec']['last']       = ($this->_sections['sec']['iteration'] == $this->_sections['sec']['total']);
?>
{ "type": "Feature", "properties":
{"id":<?php echo ((is_array($_tmp=$this->_tpl_vars['rs'][$this->_sections['sec']['index']]['id'])) ? $this->_run_mod_handler('json_encode', true, $_tmp) : smarty_modifier_json_encode($_tmp)); ?>

<?php $_from = $this->_tpl_vars['rs'][$this->_sections['sec']['index']]; if (!is_array($_from) && !is_object($_from)) { settype($_from, 'array'); }if (count($_from)):
    foreach ($_from as $this->_tpl_vars['prop'] => $this->_tpl_vars['val']):
?>
<?php if ($this->_tpl_vars['prop'] != 'geom' && $this->_tpl_vars['prop'] != 'id'): ?>
,<?php echo ((is_array($_tmp=$this->_tpl_vars['prop'])) ? $this->_run_mod_handler('json_encode', true, $_tmp) : smarty_modifier_json_encode($_tmp)); ?>
:<?php echo ((is_array($_tmp=$this->_tpl_vars['val'])) ? $this->_run_mod_handler('json_encode', true, $_tmp) : smarty_modifier_json_encode($_tmp)); ?>

<?php endif; ?>
<?php endforeach; endif; unset($_from); ?>
},
"geometry": <?php echo $this->_tpl_vars['rs'][$this->_sections['sec']['index']]['geom']; ?>

}
<?php if (! $this->_sections['sec']['last']): ?>,<?php endif; ?>
<?php endfor; endif; ?>
]
}