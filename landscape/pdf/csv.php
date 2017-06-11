<?php
session_start();
$db;$rs;				
// Open the database connection
//if (!($db = pg_connect( 'host=postgres.int.devisland.net dbname=db_piccicla user=piccicla password=fidelin1'))) {
if (!($db = pg_connect( 'host=localhost dbname=landscape user=postgres password=fidelin1'))){
//if (!($db = pg_connect( 'host=enciva-uk9.net dbname=landscap_uk user=landscap password=6Pq7vt9xQ4'))){
// Handle errors
   // i used die because with echo the script continued
  //Echo "{success:false, msg:'SQL ERROR: Connection failed'}";			  
  die();			
}

//if you need only an article
if (isset($_REQUEST['single']) && isset($_REQUEST['id'])){
$sql = 'with location_filter("ART_ID","xmin","xmax","ymin","ymax") as(
				select l."ART_ID" as id,min(ST_XMin(Box2D(l."GEOM"))) as xmin, max(ST_XMax(Box2D(l."GEOM"))) as xmax,min(ST_YMin(Box2D(l."GEOM"))) as ymin,max(ST_YMax(Box2D(l."GEOM"))) as ymax 
				from landscape."LOCATION" as l
				where "ART_ID"='.$_REQUEST['id'].' group by l."ART_ID"),
				filter as(Select art."ART_ID" as "id",art."AUTHOR",art."TITLE",art."PUB_NAME", art."START_PAGE", art."END_PAGE",art."VOL",art."YEAR",art."YEAR2",art."PUBLISHER", art."DOI",p."NAME" as "PLACE", n."NAME" as "NCA",s."NAME" as "SOURCE",l."xmin",l."xmax",l."ymin",l."ymax"
				from location_filter as l
				inner join landscape."ARTICLE" as art on art."ART_ID"=l."ART_ID"
				inner join landscape."PLACE" as p on art."PLACE_ID"=p."PLACE_ID"
				inner join landscape."NCA" as n on art."NCA_ID"=n."NCA_ID"
				inner join landscape."SOURCE" as s on art."SOURCE_ID"=s."SOURCE_ID")
				select *
				from filter,(select count(*) as count from filter) as f
				order by filter."id"';				
}

else if(isset($_REQUEST['multiple']) && isset($_REQUEST['id'])){
		
		$string=$_REQUEST['id'];
		if (get_magic_quotes_gpc()) {
			$string = stripslashes($_REQUEST['id']);
		}
		$feats=json_decode($string);
					
		$selection='';
		$count=(count($feats))-1;
		for($i=0;$i<$count;$i++){
			 $selection=$selection.' '.$feats[$i].' or "ART_ID"=';
		}
		$selection=$selection.' '.$feats[$count];
		
		$sql = 'with location_filter("ART_ID","xmin","xmax","ymin","ymax") as(
				select l."ART_ID" as id,min(ST_XMin(Box2D(l."GEOM"))) as xmin, max(ST_XMax(Box2D(l."GEOM"))) as xmax,min(ST_YMin(Box2D(l."GEOM"))) as ymin,max(ST_YMax(Box2D(l."GEOM"))) as ymax 
				from landscape."LOCATION" as l
				where "ART_ID"='.$selection.' group by l."ART_ID"),
				filter as(Select art."ART_ID" as "id",art."AUTHOR",art."TITLE",art."PUB_NAME", art."START_PAGE", art."END_PAGE",art."VOL",art."YEAR",art."YEAR2",art."PUBLISHER", art."DOI",p."NAME" as "PLACE", n."NAME" as "NCA",s."NAME" as "SOURCE",l."xmin",l."xmax",l."ymin",l."ymax"
				from location_filter as l
				inner join landscape."ARTICLE" as art on art."ART_ID"=l."ART_ID"
				inner join landscape."PLACE" as p on art."PLACE_ID"=p."PLACE_ID"
				inner join landscape."NCA" as n on art."NCA_ID"=n."NCA_ID"
				inner join landscape."SOURCE" as s on art."SOURCE_ID"=s."SOURCE_ID")
				select *
				from filter,(select count(*) as count from filter) as f
				order by filter."id"';	
}
	
//if you selected on the map
else if(isset($_REQUEST['singleart'])){
			$sql=$_SESSION['SingleArticles'].',
				filter as(Select art."ART_ID" as "id",art."AUTHOR",art."TITLE",art."PUB_NAME", art."START_PAGE", art."END_PAGE",art."VOL",art."YEAR",art."YEAR2",art."PUBLISHER", art."DOI",p."NAME" as "PLACE", n."NAME" as "NCA",s."NAME" as "SOURCE",l."xmin",l."xmax",l."ymin",l."ymax"
				from location_filter as l
				inner join landscape."ARTICLE" as art on art."ART_ID"=l."ART_ID"
				inner join landscape."PLACE" as p on art."PLACE_ID"=p."PLACE_ID"
				inner join landscape."NCA" as n on art."NCA_ID"=n."NCA_ID"
				inner join landscape."SOURCE" as s on art."SOURCE_ID"=s."SOURCE_ID"
				)
				select *
				from filter,(select count(*) as count from filter) as f
				order by filter."id"';
			if (isset($_REQUEST['offset'])){$sql=$sql.' LIMIT 100 OFFSET '.$_REQUEST['offset'];}

} 
//else get all the articles
else{
$filter=$_SESSION['filter'];
$sql=$_SESSION['bboxquerytext'].'Select distinct art."ART_ID" as "id",art."AUTHOR",art."TITLE",art."PUB_NAME", art."START_PAGE", art."END_PAGE",art."VOL",art."YEAR",art."YEAR2",art."PUBLISHER", art."DOI",p."NAME" as "PLACE", n."NAME" as "NCA",s."NAME" as "SOURCE",b."xmin" as xmin,b."xmax" as xmax,b."ymin" as ymin,b."ymax" as ymax
					from landscape."ARTICLE" as art inner join '.$filter.' as a on a."ART_ID"=art."ART_ID"
					inner join landscape."PLACE" as p on art."PLACE_ID"=p."PLACE_ID"
					inner join landscape."NCA" as n on art."NCA_ID"=n."NCA_ID"
					inner join landscape."SOURCE" as s on art."SOURCE_ID"=s."SOURCE_ID"
					inner join landscape."LOCATION" as l on l."ART_ID"=a."ART_ID"
					inner join bbox_filter as b on b."ART_ID"=a."ART_ID"
					order by art."ART_ID"';	
					if (isset($_REQUEST['offset'])){$sql=$sql.' LIMIT 100 OFFSET '.$_REQUEST['offset'];}
}

if ($sql ==''){
	die();
}

$outstr = NULL;
if(isset($_REQUEST['csvdel'])){$del=$_REQUEST['csvdel'];}else{$del=';';}
$outstr="ART_ID".$del."AUTHOR".$del."TITLE".$del."PUB_NAME".$del."START_PAGE".$del."END_PAGE".$del."VOL".$del."YEAR".$del."YEAR2".$del."PUBLISHER".$del."DOI".$del."PLACE".$del."NCA".$del."SOURCE".$del."xmin".$del."xmax".$del."ymin".$del."ymax\n";
// Read all the data back in as associative arrays
If (!$rs = pg_query($db, $sql) ){
		if ($db){
			pg_close($db);
		}
		trigger_error('problems reading the database');
		die();
}else{
	
while($obj = pg_fetch_array($rs)){
	$outstr.=$obj['id'].$del.'"'.utf8_decode($obj['AUTHOR']).'"'.$del.'"'.utf8_decode($obj['TITLE']).'"'.$del.'"'.utf8_decode($obj['PUB_NAME']).'"'.$del.$obj['START_PAGE'].$del.$obj['END_PAGE'].$del.$obj['VOL'].$del.$obj['YEAR'].$del.$obj['YEAR2'].$del.'"'.utf8_decode($obj['PUBLISHER']).'"'.$del.'"'.$obj['DOI'].'"'.$del.'"'.utf8_decode($obj['PLACE']).'"'.$del.'"'.utf8_decode($obj['NCA']).'"'.$del.'"'.$obj['SOURCE'].'"'.$del.$obj['xmin'].$del.$obj['xmax'].$del.$obj['ymin'].$del.$obj['ymax'];
$outstr = substr_replace($outstr,"",-1);
$outstr .= "\n";
}}

//close the connection
pg_close($db);

header('Content-Type: application/x-download');
header('Content-Disposition: attachment; filename="report.csv"');
header('Cache-Control: private, max-age=0, must-revalidate');
header('Pragma: public');
echo $outstr
?>	
				
				