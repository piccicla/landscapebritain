<?php /* Smarty version 2.6.26, created on 2012-03-01 13:37:41
         compiled from data_kml.tpl */ ?>
<?php require_once(SMARTY_CORE_DIR . 'core.load_plugins.php');
smarty_core_load_plugins(array('plugins' => array(array('modifier', 'escape', 'data_kml.tpl', 12, false),)), $this); ?>
<?php echo '<?xml'; ?>
 version='1.0' encoding='UTF-8'<?php echo '?>'; ?>

<kml xmlns='http://earth.google.com/kml/2.1'>
<Document>
<Style id='defaultStyle'>
<LineStyle><color>ff00ff00</color><width>3</width></LineStyle>
<PolyStyle><color>5f00ff00</color><outline>1</outline></PolyStyle>
</Style>
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
<Placemark>
<name><?php echo ((is_array($_tmp=$this->_tpl_vars['rs'][$this->_sections['sec']['index']]['id'])) ? $this->_run_mod_handler('escape', true, $_tmp, 'html') : smarty_modifier_escape($_tmp, 'html')); ?>
</name>
<description>
<?php $_from = $this->_tpl_vars['rs'][$this->_sections['sec']['index']]; if (!is_array($_from) && !is_object($_from)) { settype($_from, 'array'); }if (count($_from)):
    foreach ($_from as $this->_tpl_vars['prop'] => $this->_tpl_vars['val']):
?>
<?php if ($this->_tpl_vars['prop'] != 'geom' && $this->_tpl_vars['prop'] != 'id'): ?>
<b><?php echo ((is_array($_tmp=$this->_tpl_vars['prop'])) ? $this->_run_mod_handler('escape', true, $_tmp, 'html') : smarty_modifier_escape($_tmp, 'html')); ?>
</b> <?php echo ((is_array($_tmp=$this->_tpl_vars['val'])) ? $this->_run_mod_handler('escape', true, $_tmp, 'html') : smarty_modifier_escape($_tmp, 'html')); ?>
<br />
<?php endif; ?>
<?php endforeach; endif; unset($_from); ?>
</description>
<styleUrl>#defaultStyle</styleUrl>
<?php echo $this->_tpl_vars['rs'][$this->_sections['sec']['index']]['geom']; ?>

</Placemark>
<?php endfor; endif; ?>
</Document>
</kml>