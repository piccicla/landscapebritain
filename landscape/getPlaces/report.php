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
	$queryText=$_SESSION['bboxquerytext'];
	$filter=$_SESSION['filter'];
	
	
	if (isset($_REQUEST['single']) && isset($_REQUEST['id'])){
		$sql = "Select l.\"LOC_ID\" as id,art.\"ART_ID\",art.\"AUTHOR\",art.\"TITLE\",art.\"PUB_NAME\", art.\"START_PAGE\", art.\"END_PAGE\",art.\"VOL\",art.\"YEAR\",art.\"YEAR2\",art.\"PUBLISHER\", art.\"DOI\",p.\"NAME\" as \"PLACE\", n.\"NAME\" as \"NCA\",s.\"NAME\" as \"SOURCE\",$convertfunction(l.\"GEOM\") as geom
				from landscape.\"LOCATION\" as l
				inner join landscape.\"ARTICLE\" as art on art.\"ART_ID\"=l.\"ART_ID\"
				inner join landscape.\"PLACE\" as p on art.\"PLACE_ID\"=p.\"PLACE_ID\"
				inner join landscape.\"NCA\" as n on art.\"NCA_ID\"=n.\"NCA_ID\"
				inner join landscape.\"SOURCE\" as s on art.\"SOURCE_ID\"=s.\"SOURCE_ID\"
				where l.\"ART_ID\"=".$_REQUEST['id']." order by art.\"ART_ID\"";	
						
		}

	else if(isset($_REQUEST['multiple']) && isset($_REQUEST['id'])){
		$feats=$this->_json_decode($_REQUEST['id']);
		$selection='';
		$count=(count($feats))-1;
		for($i=0;$i<$count;$i++){
			 $selection=$selection." ".$feats[$i]." or l.\"ART_ID\"=";
		}
		$selection=$selection." ".$feats[$count];
		
		$sql = "Select l.\"LOC_ID\" as id,art.\"ART_ID\",art.\"AUTHOR\",art.\"TITLE\",art.\"PUB_NAME\", art.\"START_PAGE\", art.\"END_PAGE\",art.\"VOL\",art.\"YEAR\",art.\"YEAR2\",art.\"PUBLISHER\", art.\"DOI\",p.\"NAME\" as \"PLACE\", n.\"NAME\" as \"NCA\",s.\"NAME\" as \"SOURCE\",$convertfunction(l.\"GEOM\") as geom
				from landscape.\"LOCATION\" as l
				inner join landscape.\"ARTICLE\" as art on art.\"ART_ID\"=l.\"ART_ID\"
				inner join landscape.\"PLACE\" as p on art.\"PLACE_ID\"=p.\"PLACE_ID\"
				inner join landscape.\"NCA\" as n on art.\"NCA_ID\"=n.\"NCA_ID\"
				inner join landscape.\"SOURCE\" as s on art.\"SOURCE_ID\"=s.\"SOURCE_ID\"
				where l.\"ART_ID\"=".$selection." order by art.\"ART_ID\"";	
		}	
		//if you selected on the map
		else if(isset($_REQUEST['singleart'])){
		
					/*$sql=$_SESSION['SingleArticles']."Select l.\"LOC_ID\" as id,art.\"ART_ID\",art.\"AUTHOR\",art.\"TITLE\",art.\"PUB_NAME\", art.\"START_PAGE\", art.\"END_PAGE\",art.\"VOL\",art.\"YEAR\",art.\"YEAR2\",art.\"PUBLISHER\", art.\"DOI\",p.\"NAME\" as \"PLACE\", n.\"NAME\" as \"NCA\",s.\"NAME\" as \"SOURCE\",$convertfunction(l.\"GEOM\") as geom
							from landscape.\"LOCATION\" as l inner join location_filter as a on a.\"ART_ID\"=l.\"ART_ID\"
							inner join landscape.\"ARTICLE\" as art on art.\"ART_ID\"=l.\"ART_ID\"
							inner join landscape.\"PLACE\" as p on art.\"PLACE_ID\"=p.\"PLACE_ID\"
							inner join landscape.\"NCA\" as n on art.\"NCA_ID\"=n.\"NCA_ID\"
							inner join landscape.\"SOURCE\" as s on art.\"SOURCE_ID\"=s.\"SOURCE_ID\"
							order by art.\"ART_ID\"";	
					if (isset($_REQUEST['offset'])){$sql=$sql.' LIMIT 100 OFFSET '.$_REQUEST['offset'];}*/
					
					
					
				$sql=$_SESSION['SingleArticles'].",
					filter as(Select art.\"ART_ID\" as id
					from location_filter as l
					inner join landscape.\"ARTICLE\" as art on art.\"ART_ID\"=l.\"ART_ID\"
					inner join landscape.\"PLACE\" as p on art.\"PLACE_ID\"=p.\"PLACE_ID\"
					inner join landscape.\"NCA\" as n on art.\"NCA_ID\"=n.\"NCA_ID\"
					inner join landscape.\"SOURCE\" as s on art.\"SOURCE_ID\"=s.\"SOURCE_ID\" 
					), filter2 as (
					select *
					from filter,(select count(*) as count from filter) as f
					order by filter.\"id\"";
					if (isset($_REQUEST['offset'])){$sql=$sql.' LIMIT 100 OFFSET '.$_REQUEST['offset'];}
					$sql=$sql.") Select l.\"LOC_ID\" as id,art.\"ART_ID\",art.\"AUTHOR\",art.\"TITLE\",art.\"PUB_NAME\", art.\"START_PAGE\", art.\"END_PAGE\",art.\"VOL\",art.\"YEAR\",art.\"YEAR2\",art.\"PUBLISHER\", art.\"DOI\",p.\"NAME\" as \"PLACE\", n.\"NAME\" as \"NCA\",s.\"NAME\" as \"SOURCE\",$convertfunction(l.\"GEOM\") as geom
					from landscape.\"ARTICLE\" as art inner join filter2 as a on a.\"id\"=art.\"ART_ID\"
					inner join landscape.\"LOCATION\" as l on art.\"ART_ID\"=l.\"ART_ID\"
					inner join landscape.\"PLACE\" as p on art.\"PLACE_ID\"=p.\"PLACE_ID\"
					inner join landscape.\"NCA\" as n on art.\"NCA_ID\"=n.\"NCA_ID\"
					inner join landscape.\"SOURCE\" as s on art.\"SOURCE_ID\"=s.\"SOURCE_ID\"
					order by art.\"ART_ID\"";
		} 
		//else get all the articles
		else{
		$filter=$_SESSION['filter'];
		$sql=$_SESSION['bboxquerytext'].", filter as(Select distinct art.\"ART_ID\"
                                        from landscape.\"ARTICLE\" as art inner join ".$filter." as a on a.\"ART_ID\"=art.\"ART_ID\"
                                        inner join landscape.\"PLACE\" as p on art.\"PLACE_ID\"=p.\"PLACE_ID\"
                                        inner join landscape.\"NCA\" as n on art.\"NCA_ID\"=n.\"NCA_ID\"
										inner join landscape.\"SOURCE\" as s on art.\"SOURCE_ID\"=s.\"SOURCE_ID\"
										inner join landscape.\"LOCATION\" as l on l.\"ART_ID\"=a.\"ART_ID\"
										inner join bbox_filter as b on b.\"ART_ID\"=a.\"ART_ID\"
										order by art.\"ART_ID\"";
										if (isset($_REQUEST['offset'])){$sql=$sql." LIMIT 100 OFFSET ".$_REQUEST['offset'];}
										$sql=$sql.") Select l.\"LOC_ID\" as id, art.\"ART_ID\",art.\"AUTHOR\",art.\"TITLE\",art.\"PUB_NAME\", art.\"START_PAGE\", art.\"END_PAGE\",art.\"VOL\",art.\"YEAR\",art.\"YEAR2\",art.\"PUBLISHER\", art.\"DOI\",p.\"NAME\" as \"PLACE\", n.\"NAME\" as \"NCA\",s.\"NAME\" as \"SOURCE\",$convertfunction(l.\"GEOM\") as geom
                                        from landscape.\"ARTICLE\" as art inner join filter as a on a.\"ART_ID\"=art.\"ART_ID\"
                                        inner join landscape.\"PLACE\" as p on art.\"PLACE_ID\"=p.\"PLACE_ID\"
                                        inner join landscape.\"NCA\" as n on art.\"NCA_ID\"=n.\"NCA_ID\"
										inner join landscape.\"SOURCE\" as s on art.\"SOURCE_ID\"=s.\"SOURCE_ID\"
										inner join landscape.\"LOCATION\" as l on l.\"ART_ID\"=a.\"ART_ID\"
										inner join bbox_filter as b on b.\"ART_ID\"=a.\"ART_ID\"
										order by art.\"ART_ID\"";
		}

		if ($sql ==''){
			die();
		}
	
		//echo $sql;
		$rsdata = $this->db->Execute($sql)->GetRows();	
		$rs = array();
		$this->assign('rs', $rsdata);
		//$this->display($data_template);
		header('Content-Type: application/x-download');
		header('Content-Disposition: attachment; filename="report.'.$format.'"');
		header('Cache-Control: private, max-age=0, must-revalidate');
		header('Pragma: public');
		echo $this->fetch($data_template, null, null, false);
		
  }
}
new _DataFeeder;
?>