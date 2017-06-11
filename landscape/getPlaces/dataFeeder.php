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
    
	if (isset($_REQUEST['singlePlace'])){
	$sql = "select \"PLACE_ID\" as id, \"NAME\", $convertfunction(\"GEOM\") as geom from \"landscape\".\"PLACE\"
				where \"PLACE_ID\"=".$_REQUEST['singlePlace'];
	}
	else if (!isset($_REQUEST['place'])){
		$sql = "select \"PLACE_ID\" as id, \"NAME\", $convertfunction(\"GEOM\") as geom from \"landscape\".\"PLACE\"
				where \"NAME\"=''";
	}
	else{
		$ar = $_REQUEST['place'];
		$places = explode(",",$ar);
		
		$n=count($places);
		
		$first=$places[0];
		
		$others="";
		
		if ($n>0){
		for ($i = 1; $i < $n; $i++) {
			$others .=" OR \"NAME\"='".$places[$i]."'";
		}
		}
			
		$sql = "select \"PLACE_ID\" as id, \"NAME\", $convertfunction(\"GEOM\") as geom from \"landscape\".\"PLACE\"
				where \"NAME\"='".$first."'".$others;
				
		//echo($sql);
	
	}	
		$rsdata = $this->db->Execute($sql)->GetRows();
		$rs = array();
		$this->assign('rs', $rsdata);
		$this->display($data_template); 
  }
}
new _DataFeeder;
?>
