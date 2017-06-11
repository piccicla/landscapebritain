<?php
include_once("app.inc.php");
class _DataFeeder extends Smarty {

  private $db; //this is our database abstraction layer
  private $debug = false;
  private $supported_formats = array('json'=>'ST_AsGeoJSON', 'kml'=>'ST_AsKML');

  function __construct() {
    //ini_set('display_errors', false);
    $this->plugins_dir = array('plugins', 'extraplugins');

    /** Change default smarty delimeter from { } so we don't have to keep escaping json notation
      and gets treated as html comment by html editors **/
    $this->left_delimiter = '<!--(';
    $this->right_delimiter = ')-->';

    if (!isset($this->db)) {
       $this->db = &ADONewConnection(DSN);
      if (!$this->db) {
        die("Cannot connect to server");
      }
      else {
        $this->db->SetFetchMode(ADODB_FETCH_ASSOC);
        $this->db->debug = $this->debug;
      }
    }
    
    $this->page_load();

  }

  function page_load(){
    $data_template = 'data_json.tpl';
    if (isset($_REQUEST['format']) ){
      $format = $_REQUEST['format'];    
    }else{
		$format ='json';
	}
    $convertfunction = $this->supported_formats[$format];
    if ( empty($convertfunction) ){
      $convertfunction = 'ST_AsGeoJSON';
    }
    else {
      $data_template = "data_$format.tpl";  
    }
    
	if (isset($_REQUEST['id'])){
	$sql = "select \"LOC_ID\" as id, \"ART_ID\", $convertfunction(\"GEOM\") as geom from \"landscape\".\"LOCATION\"
				where \"ART_ID\"=".$_REQUEST['id'];
	}
	else {
		$sql = "select \"LOC_ID\" as id, \"ART_ID\", $convertfunction(\"GEOM\") as geom from \"landscape\".\"LOCATION\"";
	}
		$rsdata = $this->db->Execute($sql)->GetRows();
		$rs = array();
		$this->assign('rs', $rsdata);
		$this->display($data_template); 
  }
}
new _DataFeeder;
?>
