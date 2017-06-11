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
	
	$geometry='';
	$radius;
	$unit;	
	
	if(isset($_REQUEST['ftype'])){
                        switch($_REQUEST['ftype']){
                            case 'point':
                                if(isset($_REQUEST['coord'])){
                                  $coord=$this->_json_decode($_REQUEST['coord']);
                                  $x=$coord[0][0]; 
                                  $y=$coord[0][1];
                                  $geometry='POINT('.$x.' '.$y.')';  
								}
							break;
                            case 'line':
                                if(isset($_REQUEST['coord'])){
                                    $coord=$this->_json_decode($_REQUEST['coord']);
                                    $geometry='LINESTRING(';
                                    $count=(count($coord))-1;
                                    for($i=0;$i<$count;$i++){
                                         $geometry=$geometry.$coord[$i][0].' '.$coord[$i][1].',';
                                    }
                                    $geometry=$geometry.$coord[$count][0].' '.$coord[$count][1];
                                    $geometry=$geometry.')';
								}
							break;
                            case 'polygon':
                                if(isset($_REQUEST['coord'])){
                                    $coord=$this->_json_decode($_REQUEST['coord']);
                                    $geometry='POLYGON((';
                                    $count=(count($coord))-1;
                                    for($i=0;$i<$count;$i++){
                                         $geometry=$geometry.$coord[$i][0].' '.$coord[$i][1].',';
                                    }
                                    $geometry=$geometry.$coord[$count][0].' '.$coord[$count][1];
                                    $geometry=$geometry.'))';
								} 	  
                            break;
                            default:
                            break; 

							}
                            if(isset($_REQUEST['radius'])){
                                $radius=$_REQUEST['radius'];
                                if(isset($_REQUEST['unit'])){
                                  //units must be km,m,mi,ft
                                  $unit=$_REQUEST['unit'];
                                  

								$sql = "select 0 as id,$convertfunction(ST_Buffer(ST_GeogFromText('".$geometry."'),units_from_to('".$unit."','m',".$radius."))::geometry) as geom";
                                  
									}
                                }//radius
                                else{
                                			
								
								$sql = "select 0 as id,$convertfunction(ST_GeogFromText('".$geometry."')) as geom";
								
                                }                               

						$rsdata = $this->db->Execute($sql)->GetRows();
						$rs = array();
						$this->assign('rs', $rsdata);
						$this->display($data_template); 

        }//coord
                           

	/*//$queryText=$_SESSION['bboxquerytext'];
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
			
        }*/

  }
}
new _DataFeeder;
?>