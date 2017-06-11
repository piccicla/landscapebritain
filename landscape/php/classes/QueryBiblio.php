<?php

include_once("config.inc.php");
class QueryBiblio
{
	protected $objPDO;
	protected  $_result;
	public $results;
	
        
	//constructors and destructor to connect/disconnect from the database
	public function __construct()
	{                
		global $objPDO;
        try{
				$objPDO=new PDO(DSN);
				$objPDO->setAttribute(PDO::ATTR_ERRMODE,PDO::ERRMODE_EXCEPTION);
				//print "successfully connected.....\n";
				//return $objPDO;
			}
		catch(PDOException $e){
				//echo " an error occurred ".$e->getMessage();
				die('{success:false, msg:"'.$e->getMessage().'"}');
			}		
	}
	public function __destruct()
	{
		global $objPDO;
                if($objPDO){
                    $objPDO=null;		
		}
                //print "disconnected\n";
		return $this;
	}
        
        
    /**
    * @remotable
    */
    public function getResults(stdClass $params)
    {
         if (isset($params->queryid)){
             //is not the first access for this user
             if(isset($_SESSION['queryid'])){
                //if query id is the same i can reuse the query 
                 if($_SESSION['queryid']==$params->queryid){
                 return $this->getOldResults($params);
                }else{
                 //set the new id and create a new query
                 $_SESSION['queryid']=$params->queryid;
                 return $this->getNewResults($params);
             }
             }
             //is the first access for this user, set the id and create a new query
             else{
                 $_SESSION['queryid']=$params->queryid;
                  return $this->getNewResults($params);
             }         
        }
    }
        
    
    //when user press the query button is a new query, so build the query text
    private function getNewResults(stdClass $params)
    {
		global $objPDO;
		
		$start = ($params->limit == '' || $params->page == '') ? 0: ($params->limit*($params->page-1));
		$limit = ($params->limit == '') ? 100: $params->limit;
				
                $filter='spatial_filter';

                //variables for spatial
                $top=61.2;
                $left=-8.6;
                $bottom=49.6;
                $right=2.2; 
                $tempBot='';
                $tempLeft='';
                
                $layer='';
                $featurename='';
                $radius='';
                $unit='km';

                $ftype='';
                $coor='';
                
                $x='';
                $y='';
                $geometry='';
                
                //variables for aspatial
                $l1value='';
                $l2value='';
                $l3value='';                              
                
                $author='';
                $arrayTitle=array();
                $titleText='';
                $year='';
                $publication='';
                $publisher='';
                $source='';
                $type='and';
                $arrayAttr=array();
                
                $abstr=array();
                $abstrSep='&'; //and
                $abstrText='';
                
                
                $combined='and';
                
                $extent='';
                                
                $queryText='';
                $queryAttributeText='';

                //get spatial params
                if (isset($params->spatial)){
                    
                    if($params->spatial=='extent'){               
                        
                        //TODO what happens if the client send a text instead of number? (use try /catch!!!)
                        if(isset($params->top)){
                                if ($params->top!='' && (($params->top <= 61.2) && ($params->top >= 49.6))){
                                    $top=$params->top;
                                    }
                        } 
                        if(isset($params->left)){
                                if ($params->left!='' && (($params->left <= 2.2) && ($params->left >= -8.6))){
                                    $left=$params->left;                               
                                    }
                        } 
                        if(isset($params->bottom)){
                                if ($params->bottom!='' && (($params->bottom >= 49.6) && ($params->bottom <= 61.2))){
                                    $bottom=$params->bottom;
                                    }
                        }
                        if(isset($params->right)){
                                if ($params->right!='' && (($params->right >=-8.6) && ($params->right <= 2.2))){
                                    $right=$params->right;                                 
                                    }
                        } 
                        
                        //for security check parameters are correct if not switch them
                        if($bottom>$top){
                            $tempBot=$bottom;
                            $bottom=$top;
                            $top=$tempBot;
                        }
                        if($left>$right){
                            $tempLeft=$left;
                            $left=$right;
                            $right=$tempLeft;
                        }
						
						if( $params->bottom > $top || $params->top < $bottom || $params->left > $right || $params->right < $left){ return $params;}
                          
                   //add  query text
                   $queryText='with spatial_filter("ART_ID") as(
                                    select  distinct * from get_extent_bboxes('.$top.','.$left.','.$bottom.','.$right.'))';
   
                   }
                   
                   if($params->spatial=='select'){
                       if(isset($params->layer)){
                        $layer=$params->layer;
                            if(isset($params->featurename)){
                                $featurename=$params->featurename;
                                
                                if(isset($params->radius)){
                                $radius=$params->radius;
                                if(isset($params->unit)){
                                    //units must be km,m,mi,ft
                                    $unit=$params->unit;

                                    //to do the buffer i create a geography and buffer with meters(i use a conversion function for other units) and then cast to geometry
                                    /*$queryText='with spatial_filter("ART_ID") as(
                                                    SELECT distinct a."ART_ID"
                                                    FROM landscape."LOCATION" as a 
                                                    INNER JOIN (select ST_Buffer(Geography(foo."GEOM"),units_from_to(\''.$unit.'\',\'m\','.$radius.'))::geometry as buffer from (select  b."GEOM" from landscape."'.$layer.'" as b where "'.$layer.'_ID"='.$featurename.') as foo) as myBox 
                                                    ON ST_Intersects(a."GEOM", myBox."buffer"))';*/
                                    
                                        $queryText='with buffer("buffer") as(select ST_Buffer(Geography(foo."GEOM"),units_from_to(\''.$unit.'\',\'m\','.$radius.'))::geometry as buffer from (select  b."GEOM" from landscape."'.$layer.'" as b where "'.$layer.'_ID"='.$featurename.') as foo),
                                        spatial_filter("ART_ID") as(SELECT distinct a."ART_ID"
                                        FROM landscape."LOCATION" as a INNER JOIN buffer ON ST_Intersects(a."GEOM", buffer."buffer"))';         
                                    }
                                } else{ 
                                            $queryText='with spatial_filter("ART_ID") as(SELECT distinct a."ART_ID"
                                                        FROM landscape."LOCATION" as a INNER JOIN (select  b."GEOM" from landscape."'.$layer.'" as b 
                                                        where "'.$layer.'_ID"='.$featurename.') as myBox ON ST_Intersects(a."GEOM", myBox."GEOM"))';
                                }//end isset($params->unit)
                        }//end isset($params->featurename
                       }// isset($params->layer
                    }
                   
                   if($params->spatial=='draw'){
                       
                       if(isset($params->ftype)){
                        switch($params->ftype){
                            case 'point':
                                if(isset($params->coord)){
                                  $coord=$params->coord;
                                  $x=$coord[0][0]; 
                                  $y=$coord[0][1];
                                  $geometry='POINT('.$x.' '.$y.')';                                                              
                                }//coord
                                break;
                            case 'line':
                                if(isset($params->coord)){
                                    $coord=$params->coord;
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
                                if(isset($params->coord)){
                                    $coord=$params->coord;
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
                       
                         if(isset($params->radius)){
                                    $radius=$params->radius;
                                    if(isset($params->unit)){
                                        //units must be km,m,mi,ft
                                        $unit=$params->unit;
                                        /*$queryText='with spatial_filter("ART_ID") as(SELECT distinct a."ART_ID" 
                                                        FROM landscape."LOCATION" as a 
                                                        INNER JOIN (select ST_Buffer(ST_GeogFromText(\''.$geometry.'\'),units_from_to(\''.$unit.'\',\'m\','.$radius.'))::geometry as GEOM) as myBox
                                                        ON ST_Intersects(a."GEOM", myBox."GEOM"))' ;*/  
                                        
                                        $queryText='with buffer("buffer") as(select ST_Buffer(ST_GeogFromText(\''.$geometry.'\'),units_from_to(\''.$unit.'\',\'m\','.$radius.'))::geometry as buffer),
                                        spatial_filter("ART_ID") as(SELECT distinct a."ART_ID"
                                        FROM landscape."LOCATION" as a INNER JOIN buffer ON ST_Intersects(a."GEOM", buffer."buffer"))';   
 
                                        }
                                    }//radius 
                                    else{
                                    $queryText='with spatial_filter("ART_ID") as(SELECT distinct a."ART_ID" 
                                                FROM landscape."LOCATION" as a INNER JOIN ST_GeomFromText(\''.$geometry.'\',4326) as myBox
                                                ON ST_Intersects(a."GEOM", myBox))';
                                    }
                        
                       }
                       
                    }     
                }

                //get aspatial params
                 if (isset($params->l3value)){                  
                    $l3value=$params->l3value;
                    $queryText=$queryText.',level_filter("ART_ID") as(
                                            SELECT distinct a."ART_ID"
                                            FROM 
                                            landscape."LEVEL3" as l3 inner join landscape."ARTICLE_LEVEL" as al on l3."L3_ID"=al."L3_ID"
                                            inner join spatial_filter as a on al."ART_ID"=a."ART_ID" 
                                            WHERE l3."L3_ID" ='.$l3value.')';   
                    $filter='level_filter';
                 }
                elseif (isset($params->l2value)){
                    $l2value=$params->l2value;
                    $queryText=$queryText.',level_filter("ART_ID") as(
                                            SELECT distinct a."ART_ID"
                                            FROM 
                                            landscape."LEVEL2" as l2 inner join landscape."ARTICLE_LEVEL" as al on l2."L2_ID"=al."L2_ID"
                                            inner join spatial_filter as a on al."ART_ID"=a."ART_ID" 
                                            WHERE l2."L2_ID" ='.$l2value.')';       
                    $filter='level_filter';
                 }
                elseif (isset($params->l1value)){
                   $l1value=$params->l1value;
                   $queryText=$queryText.',level_filter("ART_ID") as(
                                            SELECT distinct a."ART_ID"
                                            FROM 
                                            landscape."LEVEL1" as l1 inner join landscape."ARTICLE_LEVEL" as al on l1."L1_ID"=al."L1_ID"
                                            inner join spatial_filter as a on al."ART_ID"=a."ART_ID" 
                                            WHERE l1."L1_ID" ='.$l1value.')';      
                   $filter='level_filter';
                 }
                 
                if (isset($params->type)){ 
                    $type=$params->type;
                    
                 
                if (isset($params->author)){ 
                    $author=$params->author; 
                    if($type=='or'){
                        array_push($arrayAttr,'SELECT art."ART_ID"
                                            FROM landscape."ARTICLE" as art inner join  '.$filter.' as lf on art."ART_ID"=lf."ART_ID" 
                                            WHERE art."AUTHOR" ~* \''.$author.'\'');
                    }
                    if($type=='and'){ 
                        array_push($arrayAttr,'art."AUTHOR" ~* \''.$author.'\'');
                    }
                }
                if (isset($params->title)){ 
                    $arrayTitle=$params->title;                   
                    $countTitle=(count($arrayTitle))-1;
                    for($i=0;$i<$countTitle;$i++){
                            $titleText=$titleText.$arrayTitle[$i].' | ';
                    }
                    $titleText=$titleText.$arrayTitle[$countTitle];     
                    
                    if($type=='or'){
                        /*array_push($arrayAttr,'SELECT art."ART_ID"
                                                FROM landscape."ARTICLE" as art inner join  '.$filter.' as lf on art."ART_ID"=lf."ART_ID" 
                                                WHERE art."TITLE"~* \''.$title.'\'');*/
                    
                        
                     array_push($arrayAttr,'SELECT art."ART_ID"
                                                FROM landscape."ARTICLE" as art inner join  '.$filter.' as lf on art."ART_ID"=lf."ART_ID" 
                                                WHERE art."TITLEINDEX" @@ to_tsquery(\'english\',\''.$titleText.'\')');   
                        
                    }
                    if($type=='and'){ 
                        //array_push($arrayAttr,'art."TITLE"~* \''.$title.'\'');
                        array_push($arrayAttr,'art."TITLEINDEX" @@ to_tsquery(\'english\',\''.$titleText.'\')');
                        
                    }     
                }
                if (isset($params->year)){ 
                    $year=$params->year;
                    if($type=='or'){
                        array_push($arrayAttr,'SELECT art."ART_ID"
                                                FROM landscape."ARTICLE" as art inner join  '.$filter.' as lf on art."ART_ID"=lf."ART_ID"
                                                WHERE art."YEAR"='.$year);
                    }
                    if($type=='and'){ 
                        array_push($arrayAttr,'art."YEAR"='.$year);
                    } 
                }
                if (isset($params->publication)){ 
                    $publication=$params->publication;
                    if($type=='or'){
                        array_push($arrayAttr,'SELECT art."ART_ID"
                                                FROM landscape."ARTICLE" as art inner join  '.$filter.' as lf on art."ART_ID"=lf."ART_ID"
                                                WHERE art."PUB_NAME" =\''.$publication.'\'');
                    }
                    if($type=='and'){ 
                        array_push($arrayAttr,'art."PUB_NAME" =\''.$publication.'\'');
                    } 
                }
                if (isset($params->publisher)){ 
                    $publisher=$params->publisher;
                    if($type=='or'){
                        array_push($arrayAttr,'SELECT art."ART_ID"
                                                FROM landscape."ARTICLE" as art inner join  '.$filter.' as lf on art."ART_ID"=lf."ART_ID" 
                                                WHERE art."PUBLISHER" = \''.$publisher.'\'');
                    }
                    if($type=='and'){ 
                        array_push($arrayAttr,'art."PUBLISHER" =\''.$publisher.'\'');
                    } 
                }
                if (isset($params->source)){ 
                    $source=$params->source;
                    if($type=='or'){
                        array_push($arrayAttr,'SELECT art."ART_ID"
                                                FROM landscape."ARTICLE" as art inner join  '.$filter.' as lf on art."ART_ID"=lf."ART_ID" inner join landscape."SOURCE" as s on art."SOURCE_ID"=s."SOURCE_ID"
                                                 WHERE s."SOURCE_ID"='.$source.'');
                    }
                    if($type=='and'){ 
                        array_push($arrayAttr,'s."SOURCE_ID"='.$source);
                    } 
                }

                if (count($arrayAttr)>0){                    
                    
                
                if($type=='or'){
                        $queryAttributeText=',attribute_filter("ART_ID") as(';
         
                        $count=(count($arrayAttr))-1;
                       
                        for($i=0;$i<$count;$i++){
                                $queryAttributeText=$queryAttributeText.$arrayAttr[$i].' UNION ';
                        }
                        $queryAttributeText=$queryAttributeText.$arrayAttr[$count].')';
                        }
                if($type=='and'){
                        $queryAttributeText=',attribute_filter("ART_ID") as(
                                              SELECT art."ART_ID"
                                               FROM landscape."ARTICLE" as art inner join  '.$filter.' as lf on art."ART_ID"=lf."ART_ID" inner join landscape."SOURCE" as s on art."SOURCE_ID"=s."SOURCE_ID"
                                                WHERE ';
                        
                        //TODO   addd the array
                        $count=(count($arrayAttr))-1;
                        for($i=0;$i<$count;$i++){
                                $queryAttributeText=$queryAttributeText.$arrayAttr[$i].' AND ';
                        }
                        $queryAttributeText=$queryAttributeText.$arrayAttr[$count].')';
                        }
                        
                        //set the query text
                        $queryText=$queryText.$queryAttributeText;
                        $filter='attribute_filter';
                        
                }         
                
                }// if isset type
                
                //TODO setup the textindex
                if (isset($params->abstr)){ 
                    
                    $abstr=$params->abstr;                
                    if(isset($params->abstrtype)){
                        if ($params->abstrtype=='or'){$abstrSep ='|';}     
                    }      
                            
                    $countAbs=(count($abstr))-1;
                    for($i=0;$i<$countAbs;$i++){
                            $abstrText=$abstrText.$abstr[$i].' '.$abstrSep.' ';
                    }
                    $abstrText=$abstrText.$abstr[$countAbs];                   
                    
                    $queryText=$queryText.',abstract_filter("ART_ID") as(                     
                                                select  a."ART_ID"
                                                from  (SELECT art."ART_ID"
                                                FROM landscape."ARTICLE" as art inner join  '.$filter.' as lf on art."ART_ID"=lf."ART_ID" inner join landscape."ABSTRACT" as s on art."ART_ID"=s."ART_ID"
                                                where  s."TEXTINDEX" @@ to_tsquery(\'english\',\''.$abstrText.'\')) as a 
                                                order by a."ART_ID")';
                    $filter='abstract_filter';
                }
                
                //TODO is this necessary????nooooo
                /*if (isset($params->combined)){ 
                    $combined=$params->combined;
                }*/
				//get the bounding box for each article, if an article has more bboxes get the total bbox
                $queryText=$queryText.',bbox_filter("ART_ID","xmin","xmax","ymin","ymax") as(
				select l."ART_ID",min(ST_XMin(Box2D(l."GEOM"))) as xmin, max(ST_XMax(Box2D(l."GEOM"))) as xmax,min(ST_YMin(Box2D(l."GEOM"))) as ymin,max(ST_YMax(Box2D(l."GEOM"))) as ymax 
				from landscape."LOCATION" as l inner join '.$filter.' as a on a."ART_ID"=l."ART_ID"
				group by l."ART_ID")';
							
				$_SESSION['bboxquerytext']=$queryText;
				$_SESSION['filter']=$filter;
						
				//i am using inner join, therefore i am not selecting articles with no place, nca, source, location
                $queryText=$queryText.'Select distinct art."ART_ID" as "id",art."AUTHOR",art."TITLE",art."PUB_NAME", art."START_PAGE", art."END_PAGE",art."VOL",art."YEAR",art."YEAR2",art."PUBLISHER",art."LINK", art."DOI",p."NAME" as "PLACE", n."NAME" as "NCA",s."NAME" as "SOURCE",art."PLACE_ID",art."NCA_ID",art."SOURCE_ID", art."FLAG",c.c,b.xmin as xmin,b.xmax as xmax,b.ymin as ymin,b.ymax as ymax
                                        from landscape."ARTICLE" as art inner join '.$filter.' as a on a."ART_ID"=art."ART_ID"
                                        inner join landscape."PLACE" as p on art."PLACE_ID"=p."PLACE_ID"
                                        inner join landscape."NCA" as n on art."NCA_ID"=n."NCA_ID"
										inner join landscape."SOURCE" as s on art."SOURCE_ID"=s."SOURCE_ID"
										inner join landscape."LOCATION" as l on l."ART_ID"=a."ART_ID"
										inner join bbox_filter as b on b."ART_ID"=a."ART_ID"
										,(select count("ART_ID") as c from bbox_filter) as c order by art."ART_ID"';
									 
						
				/*$queryText=$queryText.'Select art."ART_ID" as "id",art."AUTHOR",art."TITLE",art."PUB_NAME", art."START_PAGE", art."END_PAGE",art."VOL",art."YEAR",art."YEAR2",art."PUBLISHER",art."LINK", art."DOI",p."NAME" as "PLACE", n."NAME" as "NCA",s."NAME" as "SOURCE",art."PLACE_ID",art."NCA_ID",art."SOURCE_ID", art."FLAG",c.c,ST_XMin(Box2D(l."GEOM")) as xmin,ST_XMax(Box2D(l."GEOM")) as xmax,ST_YMin(Box2D(l."GEOM")) as ymin,ST_YMax(Box2D(l."GEOM")) as ymax
                                        from landscape."ARTICLE" as art inner join '.$filter.' as a on a."ART_ID"=art."ART_ID"
                                        inner join landscape."PLACE" as p on art."PLACE_ID"=p."PLACE_ID"
                                        inner join landscape."NCA" as n on art."NCA_ID"=n."NCA_ID"
										inner join landscape."SOURCE" as s on art."SOURCE_ID"=s."SOURCE_ID"
										inner join landscape."LOCATION" as l on l."ART_ID"=a."ART_ID",
                                        (select count("ART_ID") as c from '.$filter.') as c							
                                        order by art."ART_ID"';*/
					
                //put the query text body in session for this user and add the limit and offset variables
                $_SESSION['querytext']=$queryText;
                $queryText=$queryText.' LIMIT '.$limit.' OFFSET '.$start;

                //create query string for an extent polygon (don't do it if all uk)
                /*if($top!=61.2 && $left!=-8.6 && $bottom!=49.6 && $right!=2.2){  
                $extent='select ST_GeomFromText(\'POLYGON(('.$left.' '.$top.','.$right.' '.$top.','.$right.' '.$bottom.','.$left.' '.$bottom.','.$left.' '.$top.'))\',4326)';
                }*/

                //get the intersecting articles
                /*$intersecting='SELECT "ART_ID","GEOM" 
                FROM public."LOCATION" INNER JOIN ST_GeomFromText(\'POLYGON((-8.6 61.2,2.2 61.2,2.2 49.6,-8.6 49.6,-8.6 61.2))\',4326) as myBox
                ON ST_Intersects("LOCATION"."GEOM", myBox)'; */
		
		/*$sql = 'select "l"."ART_ID" as "id","l"."AUTHOR","l"."TITLE","l"."PUB_NAME", "l"."START_PAGE",  "l"."END_PAGE","l"."VOL","l"."YEAR","l"."YEAR2","l"."PUBLISHER","l"."LINK", "l"."DOI",   "p"."NAME" as "PLACE", "n"."NAME" as "NCA","c"."NAME" as "SOURCE","l"."PLACE_ID","l"."NCA_ID","l"."SOURCE_ID", "l"."FLAG"
					from "ARTICLE" as "l"         
						inner join "PLACE" "p" on "l"."PLACE_ID"="p"."PLACE_ID"
						inner join "NCA" "n" on "l"."NCA_ID"="n"."NCA_ID"
						inner join "SOURCE" "c" on "l"."SOURCE_ID"="c"."SOURCE_ID"	
						order by "ART_ID" 
						LIMIT '.$limit.' OFFSET '.$start;
		
		$sql2='select count("ART_ID") from "public"."ARTICLE"';*/
				
		//$sql=$queryText;
                //$sql2='select count("ART_ID") from "public"."ARTICLE"';
                
                try{
			$objStatement=$objPDO->prepare($queryText);
			$objStatement->execute();			
			//$results = array();
			
			//$results=$objStatement->fetchAll();
			
			$results=$objStatement->fetchAll(PDO::FETCH_ASSOC);
                        //$params->records=$results;
                        $params->records=$results;
                        /*while( $arRow=$objStatement->fetch(PDO::FETCH_ASSOC)){
				$results[]=$arRow;
				//$params['result']=$results;
				$params->records=$results;
			}*/			
			
			/*$objStatement2=$objPDO->prepare($sql2);
			$objStatement2->execute();	
			//count the rows
			while( $numRow=$objStatement2->fetch(PDO::FETCH_ASSOC)){
				//$params['total']=$numRow;
				$params->total=$numRow['count'];
			}*/
                        //if there is a result then get also the total number of rows to setup the extjs client grid
                        if (count($results)>0){
                        $params->total=$results[0]['c'];
                        }else{$params->total=0;}
		
                        //debug data
						//$params->SID=session_id();
						//$params->querytext=$queryText;
			return $params;
			//return $results;			
		}
		catch(PDOException $e){
			die('{success:false, msg:"'.$e->getMessage().'"}');
		}
	}
   
   //the user is changing the page on the grid, we can reuse the query text with the new limit and offset    
   private function getOldResults(stdClass $params)
    {
		global $objPDO;
		
		$start = ($params->limit == '' || $params->page == '') ? 0: ($params->limit*($params->page-1));
		$limit = ($params->limit == '') ? 100: $params->limit;
					
		/*$sql = 'select "l"."ART_ID" as "id","l"."AUTHOR","l"."TITLE","l"."PUB_NAME", "l"."START_PAGE",  "l"."END_PAGE","l"."VOL","l"."YEAR","l"."YEAR2","l"."PUBLISHER","l"."LINK", "l"."DOI",   "p"."NAME" as "PLACE", "n"."NAME" as "NCA","c"."NAME" as "SOURCE","l"."PLACE_ID","l"."NCA_ID","l"."SOURCE_ID", "l"."FLAG"
					from "ARTICLE" as "l"         
						inner join "PLACE" "p" on "l"."PLACE_ID"="p"."PLACE_ID"
						inner join "NCA" "n" on "l"."NCA_ID"="n"."NCA_ID"
						inner join "SOURCE" "c" on "l"."SOURCE_ID"="c"."SOURCE_ID"	
						order by "ART_ID" 
						LIMIT '.$limit.' OFFSET '.$start;
		
		$sql2='select count("ART_ID") from "public"."ARTICLE"';*/
                
                //get the query text body and add new limit and offset
                $queryText=$_SESSION['querytext'].' LIMIT '.$limit.' OFFSET '.$start;		
		
                try{
			//use the sesion querytext
                        $objStatement=$objPDO->prepare($queryText);
			$objStatement->execute();			
			//$results = array();
			
			//$results=$objStatement->fetchAll();
			
			$results=$objStatement->fetchAll(PDO::FETCH_ASSOC);
                        //$params->records=$results;
                        $params->records=$results;
                        /*while( $arRow=$objStatement->fetch(PDO::FETCH_ASSOC)){
				$results[]=$arRow;
				//$params['result']=$results;
				$params->records=$results;
			}*/			
			
			/*$objStatement2=$objPDO->prepare($sql2);
			$objStatement2->execute();	
			//count the rows
			while( $numRow=$objStatement2->fetch(PDO::FETCH_ASSOC)){
				//$params['total']=$numRow;
				$params->total=$numRow['count'];
			}*/
                        //if there is a result then get also the total number of rows to setup the extjs client grid
                        if (count($results)>0){
                        $params->total=$results[0]['c'];
                        }else{$params->total=0;}
		
                        //$params->SID=session_id();
			return $params;
			//return $results;			
		}
		catch(PDOException $e){
			die('{success:false, msg:"'.$e->getMessage().'"}');
		}
    }
    
    /**
    * @remotable
    */
    public function getSingleResult(stdClass $params)
    {
		
		global $objPDO;
		
		$count=0;
		
		$start = ($params->limit == '' || $params->page == '') ? 0: ($params->limit*($params->page-1));
		$limit = ($params->limit == '') ? 100: $params->limit;
		
		if (isset($params->features) ){
	 
		$feats=$this->_json_decode($params->features);
		$selection='';
		$countf=(count($feats))-1;
		for($i=0;$i<$countf;$i++){
			 $selection=$selection.' '.$feats[$i].' or "ART_ID"=';
		}
		$selection=$selection.' '.$feats[$countf];
		$sql ='with location_filter("ART_ID","xmin","xmax","ymin","ymax") as(
				select l."ART_ID",min(ST_XMin(Box2D(l."GEOM"))) as xmin, max(ST_XMax(Box2D(l."GEOM"))) as xmax,min(ST_YMin(Box2D(l."GEOM"))) as ymin,max(ST_YMax(Box2D(l."GEOM"))) as ymax 
				from landscape."LOCATION" as l
				where "ART_ID"='.$selection.' group by l."ART_ID"),
				filter as(Select art."ART_ID" as "id",art."AUTHOR",art."TITLE",art."PUB_NAME", art."START_PAGE", art."END_PAGE",art."VOL",art."YEAR",art."YEAR2",art."PUBLISHER",art."LINK", art."DOI",p."NAME" as "PLACE", n."NAME" as "NCA",s."NAME" as "SOURCE",art."PLACE_ID",art."NCA_ID",art."SOURCE_ID", art."FLAG",l."xmin",l."xmax",l."ymin",l."ymax"
				from location_filter as l
				inner join landscape."ARTICLE" as art on art."ART_ID"=l."ART_ID"
				inner join landscape."PLACE" as p on art."PLACE_ID"=p."PLACE_ID"
				inner join landscape."NCA" as n on art."NCA_ID"=n."NCA_ID"
				inner join landscape."SOURCE" as s on art."SOURCE_ID"=s."SOURCE_ID")
				select *
				from filter,(select count(*) as count from filter) as f
				order by filter."id"
				LIMIT '.$limit.' OFFSET '.$start; 
		//put this piecein session , will be used for create the PDF report		
		$_SESSION['SingleArticles']='with location_filter("ART_ID","xmin","xmax","ymin","ymax") as(
				select l."ART_ID",min(ST_XMin(Box2D(l."GEOM"))) as xmin, max(ST_XMax(Box2D(l."GEOM"))) as xmax,min(ST_YMin(Box2D(l."GEOM"))) as ymin,max(ST_YMax(Box2D(l."GEOM"))) as ymax 
				from landscape."LOCATION" as l
				where "ART_ID"='.$selection.' group by l."ART_ID")';		
		

		//echo'query ='.$feats;
        }
		//if there is only one cluster select all the features og the query
		else {
		
		$sql =$_SESSION['bboxquerytext'].',location_filter("ART_ID","xmin","xmax","ymin","ymax") as(
				select * from bbox_filter),
				filter as(Select art."ART_ID" as "id",art."AUTHOR",art."TITLE",art."PUB_NAME", art."START_PAGE", art."END_PAGE",art."VOL",art."YEAR",art."YEAR2",art."PUBLISHER",art."LINK", art."DOI",p."NAME" as "PLACE", n."NAME" as "NCA",s."NAME" as "SOURCE",art."PLACE_ID",art."NCA_ID",art."SOURCE_ID", art."FLAG",l."xmin",l."xmax",l."ymin",l."ymax"
				from location_filter as l
				inner join landscape."ARTICLE" as art on art."ART_ID"=l."ART_ID"
				inner join landscape."PLACE" as p on art."PLACE_ID"=p."PLACE_ID"
				inner join landscape."NCA" as n on art."NCA_ID"=n."NCA_ID"
				inner join landscape."SOURCE" as s on art."SOURCE_ID"=s."SOURCE_ID")
				select *
				from filter,(select count(*) as count from filter) as f
				order by filter."id"
				LIMIT '.$limit.' OFFSET '.$start; 
		//put this piecein session , will be used for create the PDF report	
		$_SESSION['SingleArticles']=$_SESSION['bboxquerytext'].',location_filter("ART_ID","xmin","xmax","ymin","ymax") as(
				select * from bbox_filter)';
		
		
		//this was wrong!
		/*$sql = 'with location_filter("ART_ID","xmin","xmax","ymin","ymax") as(
				select l."ART_ID",min(ST_XMin(Box2D(l."GEOM"))) as xmin, max(ST_XMax(Box2D(l."GEOM"))) as xmax,min(ST_YMin(Box2D(l."GEOM"))) as ymin,max(ST_YMax(Box2D(l."GEOM"))) as ymax 
				from landscape."LOCATION" as l
				group by l."ART_ID"),
				filter as(Select art."ART_ID" as "id",art."AUTHOR",art."TITLE",art."PUB_NAME", art."START_PAGE", art."END_PAGE",art."VOL",art."YEAR",art."YEAR2",art."PUBLISHER",art."LINK", art."DOI",p."NAME" as "PLACE", n."NAME" as "NCA",s."NAME" as "SOURCE",art."PLACE_ID",art."NCA_ID",art."SOURCE_ID", art."FLAG",l."xmin",l."xmax",l."ymin",l."ymax"
				from location_filter as l
				inner join landscape."ARTICLE" as art on art."ART_ID"=l."ART_ID"
				inner join landscape."PLACE" as p on art."PLACE_ID"=p."PLACE_ID"
				inner join landscape."NCA" as n on art."NCA_ID"=n."NCA_ID"
				inner join landscape."SOURCE" as s on art."SOURCE_ID"=s."SOURCE_ID")
				select *
				from filter,(select count(*) as count from filter) as f
				order by filter."id"
				LIMIT '.$limit.' OFFSET '.$start; */
						
		//put this piecein session , will be used for create the PDF report				
		/*$_SESSION['SingleArticles']='with location_filter("ART_ID","xmin","xmax","ymin","ymax") as(
				select l."ART_ID",min(ST_XMin(Box2D(l."GEOM"))) as xmin, max(ST_XMax(Box2D(l."GEOM"))) as xmax,min(ST_YMin(Box2D(l."GEOM"))) as ymin,max(ST_YMax(Box2D(l."GEOM"))) as ymax 
				from landscape."LOCATION" as l
				group by l."ART_ID")';	*/	
		}
	
		try{
			$objStatement=$objPDO->prepare($sql);
			$objStatement->execute();			
			$results = array();
			
			//$results=$objStatement->fetchAll();
			
			/*while( $arRow=$objStatement->fetch(PDO::FETCH_ASSOC)){
				$results[]=$arRow;
				//$params['result']=$results;
				$params->records=$results;
				$count=$count+1;
			}*/

			$results=$objStatement->fetchAll(PDO::FETCH_ASSOC);
			$params->records=$results;
			
			if(count($results)>0){
			$params->total=$results[0]['count'];}

			return $params;
			//return $results;			
		}
		catch(PDOException $e){
			die('{success:false, msg:"'.$e->getMessage().'"}');
		}
	
		return $params;
	}
	
	//added this because if magic_quotes_gpc is 'on' json_decode did not work
	private function _json_decode($string) {
		if (get_magic_quotes_gpc()) {
			$string = stripslashes($string);
		}
		return json_decode($string);
	}

	
}

?>