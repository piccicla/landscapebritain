<?php
session_start();
require('fpdf.php');
class PDF extends FPDF
{
// Page header
function Header()
{
    // Logo
    //$this->Image('logo.png',10,6,30);
    
	// Arial bold 15
    $this->SetFont('Arial','B',11);
    // Move to the right
    $this->Cell(80);
    // Title
	if(isset($_REQUEST['repname'])){
    $this->Cell(30,10,$_REQUEST['repname'],0,1,'C');}
	else{$this->Cell(30,10,'Physical Landscape of Britain and Northern Ireland',0,1,'C');}
    // Line break
    $this->Ln(20);
}

// Page footer
function Footer()
{
    // Position at 1.5 cm from bottom
    $this->SetY(-15);
    // Arial italic 8
    $this->SetFont('Arial','I',8);
    // Page number
    $this->Cell(0,10,'Page '.$this->PageNo().'/{nb}',0,0,'C');
}

  //added this because if magic_quotes_gpc is 'on' json_decode did not work
  function _json_decode($string) {
	if (get_magic_quotes_gpc()) {
		$string = stripslashes($string);
	}
	return json_decode($string);
	}
}

$pdf=new PDF();
$pdf->AliasNbPages();
$pdf->AddPage();
$pdf->SetTitle('Landscape of Britain and Northern Ireland - Report ');
$pdf->SetFillColor(224,235,255);
$pdf->SetTextColor(0);

//$pdf->SetLineWidth(0.5);
$fill=false;
$headattribut=true;
$attributes=false;
$pdf->SetFont('Arial','B',9);
$pdf->Cell(0,5,'QUERY PARAMETERS',0,0,'C',false);$pdf->Ln();
$pdf->Cell(0,5,date("F j, Y, g:i a"),0,0,'C',false);$pdf->Ln();$pdf->Ln();$pdf->Ln();
$pdf->SetFont('Arial','',9);
if (isset($_REQUEST['spatial'])){
$pdf->Cell(35,5,'SPATIAL QUERY',1,0,'L',true);
switch($_REQUEST['spatial']){

                            case 'extent':
                                    $pdf->Cell(80,5,'Current extent',0,0,'L',$fill);
									$pdf->Ln();
									if (isset($_REQUEST['top'])){
										$pdf->Cell(35,5,'Top',1,0,'L',$fill);
										$pdf->Cell(80,5,$_REQUEST['top'],0,0,'L',$fill);
										$pdf->Ln();
									}
									if (isset($_REQUEST['left'])){
										$pdf->Cell(35,5,'Left',1,0,'L',$fill);
										$pdf->Cell(80,5,$_REQUEST['left'],0,0,'L',$fill);
										$pdf->Ln();
									}
									if (isset($_REQUEST['bottom'])){
										$pdf->Cell(35,5,'Bottom',1,0,'L',$fill);
										$pdf->Cell(80,5,$_REQUEST['bottom'],0,0,'L',$fill);
										$pdf->Ln();
									}
									if (isset($_REQUEST['right'])){
										$pdf->Cell(35,5,'Right',1,0,'L',$fill);
										$pdf->Cell(80,5,$_REQUEST['right'],0,0,'L',$fill);
										$pdf->Ln();
									}
                                break;
                            case 'select':
                                    $pdf->Cell(80,5,'Feature extent',0,0,'L',$fill);
									$pdf->Ln();
									if (isset($_REQUEST['layer'])){
										$pdf->Cell(35,5,'Layer',1,0,'L',$fill);
										$pdf->Cell(80,5,$_REQUEST['layer'],0,0,'L',$fill);
										$pdf->Ln();
									}
									if (isset($_REQUEST['featurerawname'])){
										$pdf->Cell(35,5,'Feature name',1,0,'L',$fill);
										$pdf->Cell(80,5,$_REQUEST['featurerawname'],0,0,'L',$fill);
										$pdf->Ln();
									}
									if (isset($_REQUEST['radius']) && isset($_REQUEST['unit'])){
										$pdf->Cell(35,5,'Buffer',1,0,'L',$fill);
										$pdf->Cell(80,5,$_REQUEST['radius'].' '.$_REQUEST['unit'],0,0,'L',$fill);
										$pdf->Ln();
									}
                                break;
                            case 'draw':
									$pdf->Cell(80,5,'Custom extent',0,0,'L',$fill);
									$pdf->Ln();
									if (isset($_REQUEST['type'])){
										$pdf->Cell(35,5,'Shape',1,0,'L',$fill);
										$pdf->Cell(80,5,$_REQUEST['ftype'],0,0,'L',$fill);
										$pdf->Ln();
									}
									if (isset($_REQUEST['coord'])){
										$pdf->Cell(35,5,'Vertices',1,0,'L',$fill);
										$pdf->MultiCell(0,5,$_REQUEST['coord']);
										$pdf->Ln();
									}
									if (isset($_REQUEST['radius']) && isset($_REQUEST['unit'])){
										$pdf->Cell(35,5,'Buffer',1,0,'L',$fill);
										$pdf->Cell(80,5,$_REQUEST['radius'].' '.$_REQUEST['unit'],0,0,'L',$fill);
										$pdf->Ln();
									}
                                break;
                            default:
                                break;   
                        }
$pdf->Ln();
}//end spatial
if (isset($_REQUEST['l1name'])){
	if($headattribut==true){$headattribut=false;$pdf->Cell(35,5,'ATTRIBUTE QUERY',1,0,'L',true);$pdf->Ln();}
	$pdf->Cell(35,5,'Level1',1,0,'L',$fill);
	$pdf->Cell(80,5,$_REQUEST['l1name'],0,0,'L',$fill);
	$pdf->Ln();
}
if (isset($_REQUEST['l2name'])){
	if($headattribut==true){$headattribut=false;$pdf->Cell(35,5,'ATTRIBUTE QUERY',1,0,'L',true);$pdf->Ln();}
	$pdf->Cell(35,5,'Level2',1,0,'L',$fill);
	$pdf->Cell(80,5,$_REQUEST['l2name'],0,0,'L',$fill);
	$pdf->Ln();
}
if (isset($_REQUEST['l3name'])){
	if($headattribut==true){$headattribut=false;$pdf->Cell(35,5,'ATTRIBUTE QUERY',1,0,'L',true);$pdf->Ln();}
	$pdf->Cell(35,5,'Level3',1,0,'L',$fill);
	$pdf->Cell(80,5,$_REQUEST['l3name'],0,0,'L',$fill);
	$pdf->Ln();
}
if (isset($_REQUEST['author'])){
	if($headattribut==true){$headattribut=false;$pdf->Cell(35,5,'ATTRIBUTE QUERY',1,0,'L',true);$pdf->Ln();}
	$attributes=true;
	$pdf->Cell(35,5,'Author',1,0,'L',$fill);
	$pdf->Cell(80,5,$_REQUEST['author'],0,0,'L',$fill);
	$pdf->Ln();
}
if (isset($_REQUEST['title'])){
	if($headattribut==true){$headattribut=false;$pdf->Cell(35,5,'ATTRIBUTE QUERY',1,0,'L',true);$pdf->Ln();}
	$attributes=true;
	$pdf->Cell(35,5,'Title',1,0,'L',$fill);
	$pdf->Cell(80,5,$_REQUEST['title'],0,0,'L',$fill);
	$pdf->Ln();
}
if (isset($_REQUEST['year'])){
	if($headattribut==true){$headattribut=false;$pdf->Cell(35,5,'ATTRIBUTE QUERY',1,0,'L',true);$pdf->Ln();}
	$attributes=true;
	$pdf->Cell(35,5,'Year',1,0,'L',$fill);
	$pdf->Cell(80,5,$_REQUEST['year'],0,0,'L',$fill);
	$pdf->Ln();
}
if (isset($_REQUEST['publication'])){
	if($headattribut==true){$headattribut=false;$pdf->Cell(35,5,'ATTRIBUTE QUERY',1,0,'L',true);$pdf->Ln();}
	$attributes=true;
	$pdf->Cell(35,5,'Publication',1,0,'L',$fill);
	$pdf->Cell(80,5,$_REQUEST['publication'],0,0,'L',$fill);
	$pdf->Ln();
}
if (isset($_REQUEST['publisher'])){
	if($headattribut==true){$headattribut=false;$pdf->Cell(35,5,'ATTRIBUTE QUERY',1,0,'L',true);$pdf->Ln();}
	$attributes=true;
	$pdf->Cell(35,5,'Publisher',1,0,'L',$fill);
	$pdf->Cell(80,5,$_REQUEST['publisher'],0,0,'L',$fill);
	$pdf->Ln();
}
if (isset($_REQUEST['sourcename'])){
	if($headattribut==true){$headattribut=false;$pdf->Cell(35,5,'ATTRIBUTE QUERY',1,0,'L',true);$pdf->Ln();}
	$attributes=true;
	$pdf->Cell(35,5,'Source',1,0,'L',$fill);
	$pdf->Cell(80,5,$_REQUEST['sourcename'],0,0,'L',$fill);
	$pdf->Ln();
}
if (isset($_REQUEST['type']) && $attributes==true){
	$pdf->Cell(35,5,'Query type',1,0,'L',$fill);
	$pdf->Cell(80,5,$_REQUEST['type'],0,0,'L',$fill);
	$pdf->Ln();
}
if (isset($_REQUEST['abstr'])){
	if($headattribut==true){$headattribut=false;$pdf->Cell(35,5,'ATTRIBUTE QUERY',1,0,'L',true);$pdf->Ln();}
	$pdf->Cell(35,5,'Abstract words',1,0,'L',$fill);
	$pdf->Cell(80,5,$_REQUEST['abstr'],0,0,'L',$fill);
	$pdf->Ln();
	if (isset($_REQUEST['abstrtype'])){
		$pdf->Cell(35,5,'Abstract type',1,0,'L',$fill);
		$pdf->Cell(80,5,$_REQUEST['abstrtype'],0,0,'L',$fill);
		$pdf->Ln();	
	}
}
$pdf->AddPage();


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
		$feats=$pdf->_json_decode($_REQUEST['id']);
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

if ($sql ==''){
	die();
}
//Build table

//decide if you want the abstract
if (isset($_REQUEST['getabst'])){
$abstract=$_REQUEST['getabst'];} 
else {$abstract=false;}


$i=0;

// Read all the data back in as associative arrays
If (!$rs = pg_query($db, $sql) ){
		if ($db){
			pg_close($db);
		}
		trigger_error('problems reading the database');
		die();
}else{		
while($obj = pg_fetch_array($rs)){
	//$results[] = $obj;
	//$pdf->Cell(20,10,$obj[2],1,0,'L',$fill);
	// Output justified text
	$pdf->Cell(35,5,'ID',1,0,'L',true);
    $pdf->Cell(80,5,$obj['id'].' ',0,0,'L',$fill);
	$pdf->Ln();
	$pdf->Cell(35,5,'TITLE',1,0,'L',$fill);
    $pdf->MultiCell(0,5,utf8_decode($obj['TITLE']));
	$pdf->Ln();
	$pdf->Cell(35,5,'AUTHORS',1,0,'L',$fill);
    $pdf->MultiCell(0,5,utf8_decode($obj['AUTHOR']));
	$pdf->Ln();
	$pdf->Cell(35,5,'SOURCE',1,0,'L',$fill);
    $pdf->Cell(80,5,$obj['SOURCE'].' ',0,0,'L',$fill);
	$pdf->Ln();	
	$pdf->Cell(35,5,'PUBLICATION',1,0,'L',$fill);
    $pdf->Cell(100,5,utf8_decode($obj['PUB_NAME']).' ',0,0,'L',$fill);
	$pdf->Ln();
	$pdf->Cell(35,5,'PUBLISHER',1,0,'L',$fill);
    $pdf->Cell(100,5,utf8_decode($obj['PUBLISHER']).' ',0,0,'L',$fill);
	$pdf->Ln();
	$pdf->Cell(35,5,'START/END PAGES',1,0,'L',$fill);
    $pdf->Cell(20,5,$obj['START_PAGE'].' ',0,0,'L',$fill);$pdf->Cell(20,5,$obj['END_PAGE'],0,0,'L',$fill);
	$pdf->Ln();
	$pdf->Cell(35,5,'VOLUME',1,0,'L',$fill);
    $pdf->Cell(20,5,$obj['VOL'].' ',0,0,'L',$fill);
	$pdf->Ln();
	$pdf->Cell(35,5,'YEAR',1,0,'L',$fill);
    $pdf->Cell(20,5,$obj['YEAR'].' ',0,0,'L',$fill);$pdf->Cell(80,5,$obj['YEAR2'].' ',0,0,'L',$fill);
	$pdf->Ln();
	$pdf->Cell(35,5,'DOI',1,0,'L',$fill);
    $pdf->Cell(20,5,$obj['DOI'].' ',0,0,'L',$fill);
	$pdf->Ln();
	$pdf->Cell(35,5,'Xmin/Xmax (wgs84)',1,0,'L',$fill);
    $pdf->Cell(40,5,$obj['xmin'].' ',0,0,'L',$fill);$pdf->Cell(40,5,$obj['xmax'].' ',0,0,'L',$fill);
	$pdf->Ln();
	$pdf->Cell(35,5,'Ymin/Ymax (wgs84)',1,0,'L',$fill);
    $pdf->Cell(40,5,$obj['ymin'].' ',0,0,'L',$fill);$pdf->Cell(40,5,$obj['ymax'].' ',0,0,'L',$fill);
	$pdf->Ln();	
	$pdf->Cell(35,5,'Main NCA',1,0,'L',$fill);
    $pdf->Cell(80,5,utf8_decode($obj['NCA']).' ',0,0,'L',$fill);
	$pdf->Ln();	
	$pdf->Cell(35,5,'Main PLACE',1,0,'L',$fill);
    $pdf->Cell(80,5,utf8_decode($obj['PLACE']).' ',0,0,'L',$fill);
	$pdf->Ln();	
	$pdf->Ln();	
	
	if($abstract){
	$pdf->MultiCell(0,5,utf8_decode($obj['TEXT']),1);
	$pdf->AddPage();
	}else{
	$pdf->Line(10, $pdf->GetY(),200,$pdf->GetY());
	$pdf->Ln();	
	}
	/*file_put_contents('mylogo.jpg',
	file_get_contents('http://open.mapquestapi.com/staticmap/v4/getmap?size=400,200&zoom=9&center=40.0378,-76.305801'));
	$pdf->Image('mylogo.jpg','JPEG');*/
	
    //$fill=!$fill;
}}
//close the connection
pg_close($db);
//Add a rectangle, a line, a logo and some text
/*$pdf->Rect(5,5,170,80);
$pdf->Line(5,90,90,90);
$pdf->Image('logo.png',185,5,10,0,'PNG','http://www.dnocs.gov.br');
$pdf->SetFillColor(224,235);
$pdf->SetFont('Arial','B',8);
$pdf->SetXY(5,95);
$pdf->Cell(170,5,'PDF gerado via PHP acessando banco de dados - Por Ribamar FS',1,1,'L',1,'mailto:ribafs@dnocs.gov.br');*/


$pdf->Output('report.pdf','D');
//$pdf->Output();

?>	
				
				