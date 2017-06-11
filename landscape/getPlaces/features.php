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
    
	/*if (isset($_REQUEST['singlePlace'])){
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
	
	}*/
		$queryText=$_SESSION['bboxquerytext'];
		$filter=$_SESSION['filter'];
		
		//select a unique cluster
		if($_REQUEST['zoom']>=0 and $_REQUEST['zoom']<=4){		
		$sql=$queryText." select max(l.\"ART_ID\") as id,array_agg(l.\"ART_ID\") AS ids, COUNT( l.\"ART_ID\") AS count,
				$convertfunction(ST_centroid(ST_collect(ST_centroid(l.\"GEOM\")))) as geom
				from landscape.\"LOCATION\" as l inner join ".$filter." as a on a.\"ART_ID\"=l.\"ART_ID\"
				group by ST_SnapToGrid(ST_Transform(l.\"GEOM\",27700),10000000,10000000)";
		}
		//select every feature, apply the current map extent to filter features
		else if ($_REQUEST['zoom']>=9){
		
		$coord=explode(',',$_REQUEST['bbox']);
				
		/*$sql=$queryText." select max(l.\"ART_ID\") as id,array_agg(l.\"ART_ID\") AS ids, COUNT( l.\"ART_ID\") AS count,
				$convertfunction(ST_centroid(ST_collect(ST_centroid(l.\"GEOM\")))) as geom
				from landscape.\"LOCATION\" as l inner join ".$filter." as a on a.\"ART_ID\"=l.\"ART_ID\"
				group by ST_SnapToGrid(ST_Transform(l.\"GEOM\",27700),1,1)";
				
		$sql=$queryText." select l.\"ART_ID\" as id,'{'||l.\"ART_ID\"||'}' AS ids, 1 AS count,
				$convertfunction(ST_centroid(l.\"GEOM\")) as geom
				from landscape.\"LOCATION\" as l inner join ".$filter." as a on a.\"ART_ID\"=l.\"ART_ID\"";*/
				
		$sql=$queryText."select distinct l.\"ART_ID\" as id,'{'||l.\"ART_ID\"||'}' AS ids, 1 AS count,
				$convertfunction(ST_centroid(l.\"GEOM\")) as geom from landscape.\"LOCATION\" as l inner join ".$filter." as a on a.\"ART_ID\"=l.\"ART_ID\"
                INNER JOIN ST_GeomFromText('POLYGON((".$coord[0]." ".$coord[3].",".$coord[2]." ".$coord[3].",".$coord[2]." ".$coord[1].",".$coord[0]." ".$coord[1].",".$coord[0]." ".$coord[3]."))',4326) as myBox ON ST_Intersects(l.\"GEOM\", myBox)";
		}
		else{
			switch($_REQUEST['zoom']){
				case 5:
					$sql=$queryText." select max(l.\"ART_ID\") as id,array_agg(l.\"ART_ID\") AS ids, COUNT( l.\"ART_ID\") AS count,
					$convertfunction(ST_centroid(ST_collect(ST_centroid(l.\"GEOM\")))) as geom
					from landscape.\"LOCATION\" as l inner join ".$filter." as a on a.\"ART_ID\"=l.\"ART_ID\"
					group by ST_SnapToGrid(ST_Transform(l.\"GEOM\",27700),400000,400000)";
				  break;
				case 6:
					$sql=$queryText." select max(l.\"ART_ID\") as id,array_agg(l.\"ART_ID\") AS ids, COUNT( l.\"ART_ID\") AS count,
					$convertfunction(ST_centroid(ST_collect(ST_centroid(l.\"GEOM\")))) as geom
					from landscape.\"LOCATION\" as l inner join ".$filter." as a on a.\"ART_ID\"=l.\"ART_ID\"
					group by ST_SnapToGrid(ST_Transform(l.\"GEOM\",27700),250000,250000)";
				  break;
				case 7:
					$sql=$queryText." select max(l.\"ART_ID\") as id,array_agg(l.\"ART_ID\") AS ids, COUNT( l.\"ART_ID\") AS count,
					$convertfunction(ST_centroid(ST_collect(ST_centroid(l.\"GEOM\")))) as geom
					from landscape.\"LOCATION\" as l inner join ".$filter." as a on a.\"ART_ID\"=l.\"ART_ID\"
					group by ST_SnapToGrid(ST_Transform(l.\"GEOM\",27700),100000,100000)";
				  break;
				case 8:
					$sql=$queryText." select max(l.\"ART_ID\") as id,array_agg(l.\"ART_ID\") AS ids, COUNT( l.\"ART_ID\") AS count,
					$convertfunction(ST_centroid(ST_collect(ST_centroid(l.\"GEOM\")))) as geom
					from landscape.\"LOCATION\" as l inner join ".$filter." as a on a.\"ART_ID\"=l.\"ART_ID\"
					group by ST_SnapToGrid(ST_Transform(l.\"GEOM\",27700),25000,25000)";
				  break;		  
			}
		} 
		
		/*$sql="select array_agg(l.\"ART_ID\") AS ids, COUNT( l.\"ART_ID\") AS count,
				$convertfunction(ST_centroid(ST_collect(ST_centroid(l.\"GEOM\")))) as geom
				from landscape.\"LOCATION\" as l
				group by ST_SnapToGrid(ST_Transform(l.\"GEOM\",27700),100000,100000)";
		*/
		
		/*$sql = "select l.\"LOC_ID\" as id, l.\"ART_ID\", $convertfunction(l.\"GEOM\") as geom from \"landscape\".\"LOCATION\" as l
				";
				//limit 100";
		*/	
		
		
		$rsdata = $this->db->Execute($sql)->GetRows();
		$rs = array();
		$this->assign('rs', $rsdata);
		$this->display($data_template); 
		
		//echo 'query ='.$sql;
  }
}
new _DataFeeder;
?>