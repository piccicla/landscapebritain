<?php
session_start();
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
  
  //added this because if magic_quotes_gpc is 'on' json_decode did not work
  function _json_decode($string) {
	if (get_magic_quotes_gpc()) {
		$string = stripslashes($string);
	}
	return json_decode($string);
	}

  function page_load(){
    $sql ='';
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
	
	//$queryText=$_SESSION['bboxquerytext'];
	//$filter=$_SESSION['filter'];
	//if you selected one of the clusters, or you selected something on the grid get the bounding boxes
	 if (isset($_REQUEST['layer']) && isset($_REQUEST['featurename'])){ 
		if(isset($_REQUEST['buffer'])){
		$sql = "select l.\"".$_REQUEST['layer']."_ID\" as id,$convertfunction(ST_Buffer(Geography(l.\"GEOM\"),units_from_to('".$_REQUEST['unit']."','m','".$_REQUEST['buffer']."'))::geometry) as geom from \"landscape\".\"".$_REQUEST['layer']."\" as l
					where l.\"".$_REQUEST['layer']."_ID\"=".$_REQUEST['featurename'];
		
		} 
		else{
			$sql = "select \"".$_REQUEST['layer']."_ID\" as id,$convertfunction(\"GEOM\") as geom from \"landscape\".\"".$_REQUEST['layer']."\"
					where \"".$_REQUEST['layer']."_ID\"=".$_REQUEST['featurename'];
			
			}
			//echo $sql;
			$rsdata = $this->db->Execute($sql)->GetRows();
			$rs = array();
			$this->assign('rs', $rsdata);
			$this->display($data_template); 
			
        }

  }
}
new _DataFeeder;
?>