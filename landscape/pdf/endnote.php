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

//todo set the correct query
//$sql = 'select "ART_ID","AUTHOR" from landscape."ARTICLE"';


//if you need only an article
if (isset($_REQUEST['single']) && isset($_REQUEST['id'])){
$sql = 'with location_filter("ART_ID","xmin","xmax","ymin","ymax") as(
				select l."ART_ID" as id,min(ST_XMin(Box2D(l."GEOM"))) as xmin, max(ST_XMax(Box2D(l."GEOM"))) as xmax,min(ST_YMin(Box2D(l."GEOM"))) as ymin,max(ST_YMax(Box2D(l."GEOM"))) as ymax 
				from landscape."LOCATION" as l
				where "ART_ID"='.$_REQUEST['id'].' group by l."ART_ID"),
				filter as(Select art."ART_ID" as "id",art."AUTHOR",art."TITLE",art."PUB_NAME", art."START_PAGE", art."END_PAGE",art."VOL",art."YEAR",art."YEAR2",art."PUBLISHER", art."DOI",p."NAME" as "PLACE", n."NAME" as "NCA",s."NAME" as "SOURCE",l."xmin",l."xmax",l."ymin",l."ymax",ab."TEXT"
				from location_filter as l
				inner join landscape."ARTICLE" as art on art."ART_ID"=l."ART_ID"
				inner join landscape."PLACE" as p on art."PLACE_ID"=p."PLACE_ID"
				inner join landscape."NCA" as n on art."NCA_ID"=n."NCA_ID"
				inner join landscape."SOURCE" as s on art."SOURCE_ID"=s."SOURCE_ID"
				left join landscape."ABSTRACT" as ab on art."ART_ID"=ab."ART_ID")
				select *
				from filter,(select count(*) as count from filter) as f
				order by filter."id"';				
}
else if(isset($_REQUEST['multiple']) && isset($_REQUEST['id'])){		
		$string =$_REQUEST['id'];
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
				filter as(Select art."ART_ID" as "id",art."AUTHOR",art."TITLE",art."PUB_NAME", art."START_PAGE", art."END_PAGE",art."VOL",art."YEAR",art."YEAR2",art."PUBLISHER", art."DOI",p."NAME" as "PLACE", n."NAME" as "NCA",s."NAME" as "SOURCE",l."xmin",l."xmax",l."ymin",l."ymax",ab."TEXT"
				from location_filter as l
				inner join landscape."ARTICLE" as art on art."ART_ID"=l."ART_ID"
				inner join landscape."PLACE" as p on art."PLACE_ID"=p."PLACE_ID"
				inner join landscape."NCA" as n on art."NCA_ID"=n."NCA_ID"
				inner join landscape."SOURCE" as s on art."SOURCE_ID"=s."SOURCE_ID"
				left join landscape."ABSTRACT" as ab on art."ART_ID"=ab."ART_ID")
				select *
				from filter,(select count(*) as count from filter) as f
				order by filter."id"';		
}	
//if you selected on the map
else if(isset($_REQUEST['singleart'])){
			$sql=$_SESSION['SingleArticles'].',
				filter as(Select art."ART_ID" as "id",art."AUTHOR",art."TITLE",art."PUB_NAME", art."START_PAGE", art."END_PAGE",art."VOL",art."YEAR",art."YEAR2",art."PUBLISHER", art."DOI",p."NAME" as "PLACE", n."NAME" as "NCA",s."NAME" as "SOURCE",l."xmin",l."xmax",l."ymin",l."ymax",ab."TEXT"
				from location_filter as l
				inner join landscape."ARTICLE" as art on art."ART_ID"=l."ART_ID"
				inner join landscape."PLACE" as p on art."PLACE_ID"=p."PLACE_ID"
				inner join landscape."NCA" as n on art."NCA_ID"=n."NCA_ID"
				inner join landscape."SOURCE" as s on art."SOURCE_ID"=s."SOURCE_ID"
				left join landscape."ABSTRACT" as ab on art."ART_ID"=ab."ART_ID" 
				)
				select *
				from filter,(select count(*) as count from filter) as f
				order by filter."id"';
			if (isset($_REQUEST['offset'])){$sql=$sql.' LIMIT 100 OFFSET '.$_REQUEST['offset'];}

} 

//else get all the articles
else{
$filter=$_SESSION['filter'];
$sql=$_SESSION['bboxquerytext'].'Select distinct art."ART_ID" as "id",art."AUTHOR",art."TITLE",art."PUB_NAME", art."START_PAGE", art."END_PAGE",art."VOL",art."YEAR",art."YEAR2",art."PUBLISHER", art."DOI",p."NAME" as "PLACE", n."NAME" as "NCA",s."NAME" as "SOURCE",b."xmin" as xmin,b."xmax" as xmax,b."ymin" as ymin,b."ymax" as ymax,ab."TEXT"
					from landscape."ARTICLE" as art inner join '.$filter.' as a on a."ART_ID"=art."ART_ID"
					inner join landscape."PLACE" as p on art."PLACE_ID"=p."PLACE_ID"
					inner join landscape."NCA" as n on art."NCA_ID"=n."NCA_ID"
					inner join landscape."SOURCE" as s on art."SOURCE_ID"=s."SOURCE_ID"
					inner join landscape."LOCATION" as l on l."ART_ID"=a."ART_ID"
					inner join bbox_filter as b on b."ART_ID"=a."ART_ID"
					left join landscape."ABSTRACT" as ab on art."ART_ID"=ab."ART_ID"
					order by art."ART_ID"';	
					if (isset($_REQUEST['offset'])){$sql=$sql.' LIMIT 100 OFFSET '.$_REQUEST['offset'];}
}


//decide if you want the abstract
if (isset($_REQUEST['getabst'])){
$abstract=$_REQUEST['getabst'];} 
else {$abstract=false;}

if ($sql ==''){
	die();
}

$outstr = NULL;

// Read all the data back in as associative arrays
If (!$rs = pg_query($db, $sql) ){
		if ($db){
			pg_close($db);
		}
		trigger_error('problems reading the database');
		die();
}else{

$writer=new XMLWriter();
$writer->openMemory();
$writer->startDocument('1.0','UTF-8');
$writer->startelement('xml');
//$writer->writeAttribute('att1','first');
	$writer->startelement('records');

//it expects data in utf-8 format	
while($obj = pg_fetch_array($rs)){
		$writer->startelement('record');
			//$writer->writeElement('rec-number',$obj['id']);
			$writer->startelement('ref-type');
				$writer->writeAttribute('name','Generic');
				$writer->text('13');
			$writer->endelement();//ref-type
			$writer->startelement('contributors');
				$writer->startelement('authors');
					$authors=explode(';',$obj['AUTHOR']);
					$count=count($authors);
					for($i=0;$i<$count;$i++){
						$writer->writeElement('author',$authors[$i]);
					}	
				$writer->endelement();//authors
			$writer->endelement();//contributors
			$writer->startelement('titles');
					$titolo = preg_replace('/[^(\x20-\x7F)]*/','', $obj['TITLE']);
					$writer->writeElement('title',$titolo);
					$sectitolo = preg_replace('/[^(\x20-\x7F)]*/','', $obj['PUB_NAME']);
					$writer->writeElement('secondary-title',$sectitolo);
			$writer->endelement();//titles
			/*$writer->startelement('periodical');
					$writer->writeElement('full-title',$obj['PUB_NAME']);
			$writer->endelement();//periodical*/
			$writer->writeElement('publisher',$obj['PUBLISHER']);
			$writer->writeElement('pages',$obj['START_PAGE']."-".$obj['END_PAGE']);
			$writer->writeElement('volume',$obj['VOL']);
			//$writer->writeElement('number',"7");
			$writer->startelement('dates');
					$writer->writeElement('year',$obj['YEAR']);
			$writer->endelement();//dates
			$writer->writeElement('work-type',$obj['SOURCE']);
			$writer->writeElement('notes',"total bounding box=[coordsystem:WGS84;xmin:".$obj['xmin'].";xmax:".$obj['xmax'].";ymin:".$obj['ymin'].";ymax:".$obj['ymax']."];main NCA: ".$obj['NCA']."; main place: ".$obj['PLACE']);
			$writer->startelement('related-urls');
					$writer->writeElement('url',"DOI: ".$obj['DOI']);
			$writer->endelement();//related-urls
			//$writer->writeElement('work-location',"main NCA: ".$obj['NCA']."; main place: ".$obj['PLACE']);
			if($abstract==true){
				//replace illegal utf-8 character so you can open in endnote
				$testo = preg_replace('/[^(\x20-\x7F)]*/','', $obj['TEXT']);
				$writer->writeElement('abstract',$testo);
			}
		$writer->endelement();//record
}
	$writer->endelement();//records
$writer->endelement();//xml
$writer->endDocument();
$outstr=$writer->flush();

}

//close the connection
pg_close($db);

header('Content-Type: application/x-download');
header('Content-Disposition: attachment; filename="report.xml"');
header('Cache-Control: private, max-age=0, must-revalidate');
header('Pragma: public');
echo $outstr
?>	
	