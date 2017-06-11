<?php

//include the connection string
include_once("config.inc.php");

class QueryPostGISArticle
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
		global $objPDO;
		
		$start = ($params->limit == '' || $params->page == '') ? 0: ($params->limit*($params->page-1));
		$limit = ($params->limit == '') ? 100: $params->limit;
		
		//$start=$params->start;
		//$limit=$params->limit;
				
		$sql = 'select "l"."ART_ID" as "id","l"."AUTHOR","l"."TITLE","l"."PUB_NAME", "l"."START_PAGE",  "l"."END_PAGE","l"."VOL","l"."YEAR","l"."YEAR2","l"."PUBLISHER","l"."LINK", "l"."DOI",   "p"."NAME" as "PLACE", "n"."NAME" as "NCA","c"."NAME" as "SOURCE","l"."PLACE_ID","l"."NCA_ID","l"."SOURCE_ID", "l"."FLAG"
					from landscape."ARTICLE" as "l"         
						inner join landscape."PLACE" "p" on "l"."PLACE_ID"="p"."PLACE_ID"
						inner join landscape."NCA" "n" on "l"."NCA_ID"="n"."NCA_ID"
						inner join landscape."SOURCE" "c" on "l"."SOURCE_ID"="c"."SOURCE_ID"	
						order by "ART_ID" 
						LIMIT '.$limit.' OFFSET '.$start;
		
		$sql2='select count("ART_ID") from "landscape"."ARTICLE"';
				
		try{
			$objStatement=$objPDO->prepare($sql);
			$objStatement->execute();			
			$results = array();
			
			//$results=$objStatement->fetchAll();
			
			while( $arRow=$objStatement->fetch(PDO::FETCH_ASSOC)){
				$results[]=$arRow;
				//$params['result']=$results;
				$params->records=$results;
			}			
			
			$objStatement2=$objPDO->prepare($sql2);
			$objStatement2->execute();	
			//count the rows
			while( $numRow=$objStatement2->fetch(PDO::FETCH_ASSOC)){
				//$params['total']=$numRow;
				$params->total=$numRow['count'];
			}
		
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
	
	public function destroyRecord(stdClass $params)
	{
		
		global $objPDO;
		$msg = "";
		
		//TODO:   delete real maps and photos
		
		$sql1 = 'delete from "landscape"."PHOTO" 
				WHERE "ART_ID"='. $params->id;
		$sql2 = 'delete from "landscape"."MAP" 
				WHERE "ART_ID"='. $params->id;
		$sql3 = 'delete from "landscape"."ABSTRACT" 
				WHERE "ART_ID"='. $params->id;
		$sql4 = 'delete from "landscape"."LOCATION" 
				WHERE "ART_ID"='. $params->id;
		$sql5 = 'delete from "landscape"."ARTICLE_LEVEL" 
				WHERE "ART_ID"='. $params->id;					
		$sql6 = 'delete from "landscape"."ARTICLE" 
				WHERE "ART_ID"='. $params->id;
					
				
		try{	
			$objPDO->beginTransaction();		
				$objPDO->exec($sql1);
				$objPDO->exec($sql2);
				$objPDO->exec($sql3);
				$objPDO->exec($sql4);
				$objPDO->exec($sql5);
				$objPDO->exec($sql6);			
			$objPDO->commit();
											
			$params->success=true; 
			$msg='deleted records';
									
					
		}
		catch(PDOException $e){
			$objPDO->rollBack();
			die('{success:false, msg:"'.$e->getMessage().'"}');
		}
				
		//now delete the real images
		$sqlPHOTO='SELECT "LINK" from "landscape"."PHOTO" WHERE "ART_ID"='. $params->id;	
		try{
			$objStatement=$objPDO->prepare($sqlPHOTO);
			$objStatement->execute();
			
			$results = array();
			
			//$results=$objStatement->fetchAll();
			$dir = '../../img/PHOTO/ori/'. $params->id.'/';
			$dir_thumbs = '../../img/PHOTO/thumbs/'. $params->id.'/';
			$vis_thumbs='../../img/PHOTO/visual/'. $params->id.'/';
			
			while( $arRow=$objStatement->fetch(PDO::FETCH_ASSOC)){
				if($arRow['LINK']!=""){
				$imgname=$arRow['LINK'];				
				unlink($dir.$imgname);
				unlink($dir_thumbs.'thumb_'.$imgname);
				unlink($vis_thumbs.'vis_'.$imgname);
				}
			}			
				
		}
		catch(Exception $e){
			$msg .=' but problems deleting photos from disk';			
		}
			
		$sqlMAP='SELECT "LINK" from "landscape"."MAP" WHERE "ART_ID"='.$params->id;
				   
		try{
			$objStatement2=$objPDO->prepare($sqlMAP);
			$objStatement2->execute();
			
			$results = array();
			
			//$results=$objStatement->fetchAll();
			$dir = '../../img/MAP/ori/'. $params->id.'/';
			$dir_thumbs = '../../img/MAP/thumbs/'. $params->id.'/';
			$vis_thumbs='../../img/MAP/visual/'. $params->id.'/';
			
			while( $arRow=$objStatement2->fetch(PDO::FETCH_ASSOC)){
				$arRow2=$arRow;
				if($arRow['LINK']!=""){
					$imgname=$arRow['LINK'];				
					unlink($dir.$imgname);
					unlink($dir_thumbs.'thumb_'.$imgname);
					unlink($vis_thumbs.'vis_'.$imgname);
				}			
			}						
		}		
		catch(Exception $e){
			$msg .=" but problems deleting maps from disk";			
		}		
		$params->msg=$msg;
		return $params;				
	}
		
		
	/**
    * @remotable
    */
	public function getPlace(stdClass $params)
	{
		global $objPDO;
		//check for the query param, if not get all the value, if yes filter the result
		if(!isset($params->query)) {		
			
			$sql = 'select distinct "NAME", "PLACE_ID" as id
					from "landscape"."PLACE"
                    where "NAME"!= \'DUMMY\' limit 15 ';
		
		}else{
		
			$query=$params->query;
			$sql = 'select distinct "NAME", "PLACE_ID" as id
					from "landscape"."PLACE"
					where "NAME" ~* \'^'.$query.'\' AND "NAME"!= \'DUMMY\'					
					limit 15';
		}
		
		try{
			$objStatement=$objPDO->prepare($sql);
			$objStatement->execute();
			
			$results = array();
			
			//$results=$objStatement->fetchAll();
			
			while( $arRow=$objStatement->fetch(PDO::FETCH_ASSOC)){
				$results[]=$arRow;			
			}			
			return $results;		
		}
		catch(PDOException $e){
			die('{success:false, msg:"'.$e->getMessage().'"}');
		}
	
	}
		
	/**
    * @remotable
    */
	public function getNCA(stdClass $params)
	{
		global $objPDO;
		//check for the query param, if not get all the value, if yes filter the result
		if(!isset($params->query)) {		
			
			$sql = 'select distinct "NAME", "NCA_ID"
					from "landscape"."NCA"
                    where "NAME"!= \'DUMMY\' limit 6';
		
		}else{
		
			$query=$params->query;
			$sql = 'select distinct "NAME", "NCA_ID"
					from "landscape"."NCA"
					where "NAME" ~* \'^'.$query.'\' AND "NAME"!= \'DUMMY\' limit 6';
		}
		
		try{
			$objStatement=$objPDO->prepare($sql);
			$objStatement->execute();
			
			$results = array();
			
			//$results=$objStatement->fetchAll();
			
			while( $arRow=$objStatement->fetch(PDO::FETCH_ASSOC)){
				$results[]=$arRow;			
			}			
			return $results;		
		}
		catch(PDOException $e){
			die('{success:false, msg:"'.$e->getMessage().'"}');
		}
	}
			
	/**
    * @remotable
    */
	public function getSource(stdClass $params)
	{
		global $objPDO;
		//check for the query param, if not get all the value, if yes filter the result
		if(!isset($params->query)) {		
			
			$sql = 'select "NAME", "SOURCE_ID"
					from "landscape"."SOURCE" where "NAME"!=\'DUMMY\'';
		
		}else{
		
			$query=$params->query;
			$sql = 'select "NAME", "SOURCE_ID"
					from "landscape"."SOURCE"
					where "NAME" ~* \'^'.$query.'\' AND "NAME"!=\'DUMMY\'';
		}
		try{
			$objStatement=$objPDO->prepare($sql);
			$objStatement->execute();
			
			$results = array();
			
			//$results=$objStatement->fetchAll();
			
			while( $arRow=$objStatement->fetch(PDO::FETCH_ASSOC)){
				$results[]=$arRow;			
			}			
			return $results;		
		}
		catch(PDOException $e){
			die('{success:false, msg:"'.$e->getMessage().'"}');
		}	
	}
		
			
	/**
    * @remotable
	* @formHandler
    */
	public function updateFormRecord($params)
	{
	  
	  global $objPDO;
	  
	  //to do do do update or new depending on the input (che id value???)	  
	  if($params['id']==""){
	   ///this is a new record
	  ///return "new";
	  
	 	  
	  $sql ='INSERT INTO "landscape"."ARTICLE" ("AUTHOR","TITLE","PUB_NAME","START_PAGE","END_PAGE","VOL","YEAR","YEAR2","PUBLISHER","LINK","DOI","NCA_ID","SOURCE_ID","PLACE_ID")
		VALUES (:AUTHOR, :TITLE, :PUB_NAME, :START_PAGE, :END_PAGE, :VOL, :YEAR, :YEAR2, :PUBLISHER, :LINK, :DOI, :NCA_ID, :SOURCE_ID, :PLACE_ID) RETURNING "ART_ID"';
		}
		else{  
		$sql ='UPDATE "landscape"."ARTICLE" 
		SET "AUTHOR"= :AUTHOR , "TITLE"= :TITLE, "PUB_NAME"=:PUB_NAME , "START_PAGE"= :START_PAGE, "END_PAGE"=:END_PAGE , "VOL"=:VOL , "YEAR"=:YEAR , "YEAR2"=:YEAR2 , "PUBLISHER"=:PUBLISHER, "LINK"=:LINK, "DOI"=:DOI, "NCA_ID"=:NCA_ID, "SOURCE_ID"=:SOURCE_ID , "PLACE_ID"=:PLACE_ID  WHERE "ART_ID"='.$params['id'].' RETURNING "ART_ID"';
	  }
	  	  
	  try{
			
			$objStatement=$objPDO->prepare($sql);
			
			if($params['AUTHOR']==""){$params['AUTHOR']=null;}
			$objStatement->bindParam(':AUTHOR', $params['AUTHOR'], PDO::PARAM_STR);
			if($params['TITLE']==""){$params['TITLE']=null;}
			$objStatement->bindParam(':TITLE', $params['TITLE'], PDO::PARAM_STR);
			if($params['PUB_NAME']==""){$params['PUB_NAME']=null;}
			$objStatement->bindParam(':PUB_NAME', $params['PUB_NAME'], PDO::PARAM_STR);
			if($params['START_PAGE']==""){$params['START_PAGE']=null;}
            $objStatement->bindParam(':START_PAGE', $params['START_PAGE'], PDO::PARAM_INT);
			if($params['END_PAGE']==""){$params['END_PAGE']=null;}
            $objStatement->bindParam(':END_PAGE', $params['END_PAGE'], PDO::PARAM_INT);
			if($params['VOL']==""){$params['VOL']=null;}
            $objStatement->bindParam(':VOL', $params['VOL'], PDO::PARAM_STR);
			if($params['YEAR']==""){$params['YEAR']=null;}
            $objStatement->bindParam(':YEAR', $params['YEAR'], PDO::PARAM_INT);
			if($params['YEAR2']==""){$params['YEAR2']=null;}
            $objStatement->bindParam(':YEAR2', $params['YEAR2'], PDO::PARAM_STR);
			if($params['PUBLISHER']==""){$params['PUBLISHER']=null;}
			$objStatement->bindParam(':PUBLISHER', $params['PUBLISHER'], PDO::PARAM_STR);
			if($params['LINK']==""){$params['LINK']=null;}
			$objStatement->bindParam(':LINK', $params['LINK'], PDO::PARAM_STR);
			if($params['DOI']==""){$params['DOI']=null;}
			$objStatement->bindParam(':DOI', $params['DOI'], PDO::PARAM_STR);

			$objStatement->bindParam(':NCA_ID', $params['NCA'], PDO::PARAM_INT);		
			$objStatement->bindParam(':SOURCE_ID', $params['SOURCE'], PDO::PARAM_INT);	
			$objStatement->bindParam(':PLACE_ID', $params['PLACE'], PDO::PARAM_INT);
			
			$objStatement->execute();
			
			
			$params['success']=true; 
			$params['msg']="updated/created record";
			
			while( $arRow=$objStatement->fetch(PDO::FETCH_ASSOC)){
				$params['id']=$arRow;			
			}
			
			//$params['id']=$objPDO->lastInsertId('id');
						
			return $params;		
			
		}
		catch(PDOException $e){
			die('{success:false, msg:"'.$e->getMessage().'"}');
		}	
	   
	}
		
		
	/**
    * @remotable
    */
	public function getResultsLevel(stdClass $params)
	{
		global $objPDO;
		$sql = 'select "al"."AL_ID" as id,"al"."L1_ID","al"."L2_ID","al"."L3_ID", "al"."ART_ID","l1"."NAME" as L1NAME, "l2"."NAME" as L2NAME,"l3"."NAME" as L3NAME 
		from "landscape"."ARTICLE_LEVEL" as "al"         						
			inner join "landscape"."LEVEL1" "l1" on "al"."L1_ID"="l1"."L1_ID"
			inner join "landscape"."LEVEL2" "l2" on "al"."L2_ID"="l2"."L2_ID"
			inner join "landscape"."LEVEL3" "l3" on "al"."L3_ID"="l3"."L3_ID"
			where "al"."ART_ID"='.$params->id;

		try{
			$objStatement=$objPDO->prepare($sql);
			$objStatement->execute();
			
			$results = array();
			
			//$results=$objStatement->fetchAll();
			
			while( $arRow=$objStatement->fetch(PDO::FETCH_ASSOC)){
				$results[]=$arRow;			
			}			
			return $results;		
		}
		catch(PDOException $e){
			die('{success:false, msg:"'.$e->getMessage().'"}');
		}				
	}

	/**
    * @remotable
    */
	public function getListLevel1(stdClass $params)
	{
		global $objPDO;		
		$sql = 'select "l1"."L1_ID","l1"."NAME" 
				from "landscape"."LEVEL1" as "l1"
				where "l1"."NAME" != \'dummy\'
				order by "l1"."NAME"';
		try{
			$objStatement=$objPDO->prepare($sql);
			$objStatement->execute();
			
			$results = array();
			
			//$results=$objStatement->fetchAll();
			
			while( $arRow=$objStatement->fetch(PDO::FETCH_ASSOC)){
				$results[]=$arRow;			
			}			
			return $results;		
		}
		catch(PDOException $e){
			die('{success:false, msg:"'.$e->getMessage().'"}');
		}		
	}
	
	/**
    * @remotable
    */
	public function getListLevel2(stdClass $params)
	{
		global $objPDO;		
		$sql = 'select "l2"."L2_ID","l2"."NAME","l2"."L1_ID" 
				from "landscape"."LEVEL2" as "l2"
				where "l2"."NAME" != \'dummy\'
				order by "l2"."L1_ID","l2"."NAME"';
		try{
			$objStatement=$objPDO->prepare($sql);
			$objStatement->execute();
			
			$results = array();
			
			//$results=$objStatement->fetchAll();
			
			while( $arRow=$objStatement->fetch(PDO::FETCH_ASSOC)){
				$results[]=$arRow;			
			}			
			return $results;		
		}
		catch(PDOException $e){
			die('{success:false, msg:"'.$e->getMessage().'"}');
		}	
	
	}
	
	/**
    * @remotable
    */
	public function getListLevel3(stdClass $params)
	{
		global $objPDO;		
		$sql = 'select "l3"."L3_ID","l3"."NAME","l3"."L2_ID" 
				from "landscape"."LEVEL3" as "l3"
				where "l3"."NAME" != \'dummy\'
				order by "l3"."L2_ID","l3"."NAME"';
		try{
			$objStatement=$objPDO->prepare($sql);
			$objStatement->execute();
			
			$results = array();
			
			//$results=$objStatement->fetchAll();
			
			while( $arRow=$objStatement->fetch(PDO::FETCH_ASSOC)){
				$results[]=$arRow;			
			}			
			return $results;		
		}
		catch(PDOException $e){
			die('{success:false, msg:"'.$e->getMessage().'"}');
		}	
	
	}
	
	/**
    * @remotable
    */
	public function destroyRecordLevel(stdClass $params)
	{
	
	global $objPDO;		 	  
	  $sql ='DELETE FROM "landscape"."ARTICLE_LEVEL" WHERE "AL_ID"=:ID';
 	  
	  try{
			
			$objStatement=$objPDO->prepare($sql);

			$objStatement->bindParam(':ID', $params->id, PDO::PARAM_INT);
		
			$objStatement->execute();
						
			$params->success=true; 
			$params->msg="deleted record";
						
			//$params['id']=$objPDO->lastInsertId('id');
						
			return $params;		
			
		}
		catch(PDOException $e){
			die('{success:false, msg:"'.$e->getMessage().'"}');
		}	
	}
	
	
	/**
    * @remotable
	* @formHandler
    */
	public function updateFormLevel($params)
	{
	  global $objPDO;		 	  
	  $sql ='INSERT INTO "landscape"."ARTICLE_LEVEL" ("ART_ID","L1_ID","L2_ID","L3_ID")
		VALUES (:ART_ID,:L1_ID,:L2_ID,:L3_ID) RETURNING "AL_ID"';
 	  
	  if (!$params['L3_ID']){$params['L3_ID']=1000;}
	  
	  try{
			
			$objStatement=$objPDO->prepare($sql);

			$objStatement->bindParam(':ART_ID', $params['idArticle'], PDO::PARAM_INT);
			$objStatement->bindParam(':L1_ID', $params['L1_ID'], PDO::PARAM_INT);
			$objStatement->bindParam(':L2_ID', $params['L2_ID'], PDO::PARAM_INT);
			$objStatement->bindParam(':L3_ID', $params['L3_ID'], PDO::PARAM_INT);
					
			$objStatement->execute();
						
			$params['success']=true; 
			$params['msg']="updated/created record";
			
			while( $arRow=$objStatement->fetch(PDO::FETCH_ASSOC)){
				$params['id']=$arRow;			
			}
			
			//$params['id']=$objPDO->lastInsertId('id');
						
			return $params;		
			
		}
		catch(PDOException $e){
			die('{success:false, msg:"'.$e->getMessage().'"}');
		}
					
	}
			
	/**
    * @remotable
    */
	public function loadFormAbstract($params)
	{	
		global $objPDO;	
		$sql = 'select "ab"."ABSTR_ID" as id,  "ab"."TEXT", "ab"."ART_ID"
				from "landscape"."ABSTRACT" as "ab"
				inner join "landscape"."ARTICLE" as "ar" on "ar"."ART_ID"="ab"."ART_ID"
				where "ar"."ART_ID"='.$params;
		try{
				$objStatement=$objPDO->prepare($sql);
				$objStatement->execute();
				
				$results = array();
				
				//$results=$objStatement->fetchAll();
				
				while( $arRow=$objStatement->fetch(PDO::FETCH_ASSOC)){
					$results['data']=$arRow;			
				}
				$results['success']=true;
				return $results;		
			}
			catch(PDOException $e){
				die('{success:false, msg:"'.$e->getMessage().'"}');
			}

	}
		
	/**
    * @remotable
	* @formHandler
    */
	public function updateFormAbstract($params)
	{
		
	  global $objPDO;	
	  //to do do do update or new depending on the input (che id value???)	  
	  if($params['kind']=="create"){
	   ///this is a new record
	  ///return "new";
	  
	 	  
	  $sql ='INSERT INTO "landscape"."ABSTRACT" ("TEXT","ART_ID")
		VALUES (:TEXT, :ID) RETURNING "ABSTR_ID"';
		}
		else{  
		$sql ='UPDATE "landscape"."ABSTRACT" 
		SET "TEXT"=:TEXT WHERE "ART_ID"=:ID RETURNING "ART_ID"';
	  }
	  	  
	  try{
			
			$objStatement=$objPDO->prepare($sql);
			
			$objStatement->bindParam(':TEXT', $params['TEXT'], PDO::PARAM_STR);
			$objStatement->bindParam(':ID', $params['id'], PDO::PARAM_INT);
					
			$objStatement->execute();
						
			$params['success']=true; 
			$params['msg']="updated/created record";
			
			while( $arRow=$objStatement->fetch(PDO::FETCH_ASSOC)){
				$params['id']=$arRow;			
			}
			
			//$params['id']=$objPDO->lastInsertId('id');
						
			return $params;		
			
		}
		catch(PDOException $e){
			die('{success:false, msg:"'.$e->getMessage().'"}');
		}	
		

	}	
	
	/**
    * @remotable
    */
	public function loadFormLocation($params)
	{	  
		global $objPDO;	
		$sql = 'Select "LOC_ID" as "id", "ART_ID", trim(leading from(to_char(ST_XMin("GEOM"),\'9990D999999\'))) as "TLX" ,trim(leading from(to_char(ST_XMax("GEOM"),\'9990D999999\'))) as "BRX",trim(leading from(to_char(ST_YMin("GEOM"),\'9990D999999\'))) as "BRY",trim(leading from(to_char(ST_YMax("GEOM"),\'9990D999999\'))) as "TLY" from  "landscape"."LOCATION" 
					where "ART_ID"='.$params->id;
		try{
				$objStatement=$objPDO->prepare($sql);
				$objStatement->execute();
				
				$results = array();
				
				//$results=$objStatement->fetchAll();
				
				while( $arRow=$objStatement->fetch(PDO::FETCH_ASSOC)){
					$results[]=$arRow;			
				}
				//$results['success']=true;
				return $results;		
			}
			catch(PDOException $e){
				die('{success:false, msg:"'.$e->getMessage().'"}');
			}
	}
		
	/**
    * @remotable
	* @formHandler
    */
	public function updateFormLocation($params)
	{
	  global $objPDO;	
	  
	  
	  try{
			
			//to do do do update or new depending on the input (che id value???)	  
			if($params['kind']=="create"){
			   ///this is a new record
			  ///return "new";
					  
			  $sql ='INSERT INTO "landscape"."LOCATION" ("GEOM","ART_ID")
				VALUES (ST_GeomFromText(\'POLYGON(('.$params['TLX'].' '.$params['BRY'].','.$params['TLX'].' '.$params['TLY'].','.$params['BRX'].' '.$params['TLY'].','.$params['BRX'].' '.$params['BRY'].','.$params['TLX'].' '.$params['BRY'].'))\',4326), :ID) RETURNING "LOC_ID"';
				
				}
				else{  
				//$sql ='UPDATE "public"."LOCATION" 
				//SET "GEOM"=ST_GeomFromText(\'POLYGON(('.$params['TLX'].' '.$params['BRY'].','.$params['TLX'].' '.$params['TLY'].','.$params['BRX'].' '.$params['TLY'].','.$params['BRX'].' '.$params['BRY'].','.$params['TLX'].' '.$params['BRY'].'))\',4326)  WHERE "ART_ID"=:ID RETURNING "LOC_ID"';
			  
				//updated for mult bbox 170411
				$sql ='UPDATE "landscape"."LOCATION" 
				SET "GEOM"=ST_GeomFromText(\'POLYGON(('.$params['TLX'].' '.$params['BRY'].','.$params['TLX'].' '.$params['TLY'].','.$params['BRX'].' '.$params['TLY'].','.$params['BRX'].' '.$params['BRY'].','.$params['TLX'].' '.$params['BRY'].'))\',4326)  WHERE "LOC_ID"=:LOCID RETURNING "LOC_ID"';
				
				
				}
			
			$objStatement=$objPDO->prepare($sql);
			if($params['kind']=="create"){$objStatement->bindParam(':ID', $params['id'], PDO::PARAM_INT);}
			else{ $objStatement->bindParam(':LOCID', $params['locid'], PDO::PARAM_INT);}			
			$objStatement->execute();
						
			$params['success']=true; 
			$params['msg']="updated/created record";
			
			while( $arRow=$objStatement->fetch(PDO::FETCH_ASSOC)){
				$params['id']=$arRow;			
			}
			
			//$params['id']=$objPDO->lastInsertId('id');
						
			return $params;		
			
		}
		catch(PDOException $e){
			die('{success:false, msg:"'.$e->getMessage().'"}');
		}	
	
	}

	/**
    * @remotable
    */
	public function destroyRecordLocation(stdClass $params)
	{
	
	global $objPDO;		 	  
	  $sql ='DELETE FROM "landscape"."LOCATION" WHERE "LOC_ID"=:ID';
 	  
	  try{
			
			$objStatement=$objPDO->prepare($sql);

			$objStatement->bindParam(':ID', $params->id, PDO::PARAM_INT);
		
			$objStatement->execute();
						
			$params->success=true; 
			$params->msg="deleted record";
						
			//$params['id']=$objPDO->lastInsertId('id');
						
			return $params;		
			
		}
		catch(PDOException $e){
			die('{success:false, msg:"'.$e->getMessage().'"}');
		}	
	}	
}
?>