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
		$sql = 'select "l"."ART_ID" as "id","l"."AUTHOR","l"."TITLE","l"."PUB_NAME", "l"."START_PAGE",  "l"."END_PAGE","l"."VOL","l"."YEAR","l"."YEAR2","l"."PUBLISHER","l"."LINK", "l"."DOI",   "p"."NAME" as "PLACE", "n"."NAME" as "NCA","c"."NAME" as "SOURCE","l"."PLACE_ID","l"."NCA_ID","l"."SOURCE_ID", "l"."FLAG"
					from "ARTICLE" as "l"         
						inner join "PLACE" "p" on "l"."PLACE_ID"="p"."PLACE_ID"
						inner join "NCA" "n" on "l"."NCA_ID"="n"."NCA_ID"
						inner join "SOURCE" "c" on "l"."SOURCE_ID"="c"."SOURCE_ID"';
		
		
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
	/*public function createRecord(stdClass $params)
	{
	$params->id=99999;
	return $params;}
	*/
	/**
    * @remotable
    */
	/*
	public function updateRecord(stdClass $params)
	{
	///you need to check that fields are correct, if TYPE is correct(query and see if it exist, if not
	///return error)
	return $params;}
	*/
	/**
    * @remotable
    */
	
	public function destroyRecord(stdClass $params)
	{
		
		global $objPDO;
		$msg = "";
		
		//TODO:   delete real maps and photos
		
		$sql1 = 'delete from "public"."PHOTO" 
				WHERE "ART_ID"='. $params->id;
		$sql2 = 'delete from "public"."MAP" 
				WHERE "ART_ID"='. $params->id;
		$sql3 = 'delete from "public"."ABSTRACT" 
				WHERE "ART_ID"='. $params->id;
		$sql4 = 'delete from "public"."LOCATION" 
				WHERE "ART_ID"='. $params->id;
		$sql5 = 'delete from "public"."ARTICLE_LEVEL1" 
				WHERE "ART_ID"='. $params->id;	
		$sql6 = 'delete from "public"."ARTICLE_LEVEL2" 
				WHERE "ART_ID"='. $params->id;				
		$sql7 = 'delete from "public"."ARTICLE" 
				WHERE "ART_ID"='. $params->id;
					
				
		try{	
			$objPDO->beginTransaction();		
				$objPDO->exec($sql1);
				$objPDO->exec($sql2);
				$objPDO->exec($sql3);
				$objPDO->exec($sql4);
				$objPDO->exec($sql5);
				$objPDO->exec($sql6);
				$objPDO->exec($sql7);			
			$objPDO->commit();
											
			$params->success=true; 
			$msg='deleted records';
									
					
		}
		catch(PDOException $e){
			$objPDO->rollBack();
			die('{success:false, msg:"'.$e->getMessage().'"}');
		}
				
		//now delete the real images
		$sqlPHOTO='SELECT "LINK" from "public"."PHOTO" WHERE "ART_ID"='. $params->id;	
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
			
		$sqlMAP='SELECT "LINK" from "public"."MAP" WHERE "ART_ID"='.$params->id;
				   
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
					from "public"."PLACE"
                    where "NAME"!= \'DUMMY\' limit 15 ';
		
		}else{
		
			$query=$params->query;
			$sql = 'select distinct "NAME", "PLACE_ID" as id
					from "public"."PLACE"
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
					from "public"."NCA"
                    where "NAME"!= \'DUMMY\' limit 6';
		
		}else{
		
			$query=$params->query;
			$sql = 'select distinct "NAME", "NCA_ID"
					from "public"."NCA"
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
					from "public"."SOURCE" where "NAME"!=\'DUMMY\'';
		
		}else{
		
			$query=$params->query;
			$sql = 'select "NAME", "SOURCE_ID"
					from "public"."SOURCE"
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
	  
	 	  
	  $sql ='INSERT INTO "public"."ARTICLE" ("AUTHOR","TITLE","PUB_NAME","START_PAGE","END_PAGE","VOL","YEAR","YEAR2","PUBLISHER","LINK","DOI","NCA_ID","SOURCE_ID","PLACE_ID")
		VALUES (:AUTHOR, :TITLE, :PUB_NAME, :START_PAGE, :END_PAGE, :VOL, :YEAR, :YEAR2, :PUBLISHER, :LINK, :DOI, :NCA_ID, :SOURCE_ID, :PLACE_ID) RETURNING "ART_ID"';
		}
		else{  
		$sql ='UPDATE "public"."ARTICLE" 
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
	public function getResultsLevel1(stdClass $params)
	{
		global $objPDO;
		$sql = 'select "al1"."AL1_ID" as id,"al1"."L1_ID", "al1"."ART_ID","l1"."NAME" 
				from "ARTICLE_LEVEL1" as "al1"         						
				   inner join "LEVEL1" "l1" on "al1"."L1_ID"="l1"."L1_ID"
				where "al1"."ART_ID"='.$params->id;

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
	public function getListLevel1Type(stdClass $params)
	{
		global $objPDO;		
		$sql = 'select "T1_ID" as "id","NAME" as "TYPE" from "public"."TYPE1" 
						order by "TYPE1"';
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
		$sql = 'select "l1"."L1_ID" as "id","l1"."NAME","l1"."T1_ID","t1"."NAME" as "type" from "public"."LEVEL1" as "l1"
					inner join "TYPE1" "t1" on "l1"."T1_ID"="t1"."T1_ID"
					order by "type","l1"."NAME"';
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
	public function destroyRecordLevel1(stdClass $params)
	{
	
	global $objPDO;		 	  
	  $sql ='DELETE FROM "public"."ARTICLE_LEVEL1" 
		WHERE "AL1_ID"=:ID';
 	  
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
	public function updateFormLevel1($params)
	{
	  global $objPDO;		 	  
	  $sql ='INSERT INTO "public"."ARTICLE_LEVEL1" ("ART_ID","L1_ID")
		VALUES (:ART_ID,:L1_ID) RETURNING "AL1_ID"';
 	  
	  try{
			
			$objStatement=$objPDO->prepare($sql);

			$objStatement->bindParam(':ART_ID', $params['idArticle'], PDO::PARAM_INT);
			$objStatement->bindParam(':L1_ID', $params['NAME'], PDO::PARAM_INT);
					
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
	public function getListLevel2(stdClass $params)
	{
		global $objPDO;	
		$sql = 'select "l2"."L2_ID" as "id","l2"."NAME","l2"."T2_ID","t2"."NAME" as "type" from "public"."LEVEL2" as "l2"
						inner join "TYPE2" "t2" on "l2"."T2_ID"="t2"."T2_ID"
						order by "type","l2"."NAME"';
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
	public function getListLevel2Type(stdClass $params)
	{
		global $objPDO;	
		$sql = 'select "T2_ID" as "id","NAME" as "TYPE" from "public"."TYPE2" order by "TYPE"';
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
	public function getResultsLevel2(stdClass $params)
	{
		global $objPDO;	
		$sql = 'select "al2"."AL2_ID" as id,"al2"."L2_ID", "al2"."ART_ID","l2"."NAME" 
				from "ARTICLE_LEVEL2" as "al2"         						
				   inner join "LEVEL2" "l2" on "al2"."L2_ID"="l2"."L2_ID"
				where "al2"."ART_ID"='.$params->id;
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
	public function updateFormLevel2($params)
	{
		
		global $objPDO;		 	  
	  $sql ='INSERT INTO "public"."ARTICLE_LEVEL2" ("ART_ID","L2_ID")
		VALUES (:ART_ID,:L2_ID) RETURNING "AL2_ID"';
 	  
	  try{
			
			$objStatement=$objPDO->prepare($sql);

			$objStatement->bindParam(':ART_ID', $params['idArticle'], PDO::PARAM_INT);
			$objStatement->bindParam(':L2_ID', $params['NAME'], PDO::PARAM_INT);
					
			$objStatement->execute();
						
			$params['success']=true; 
			$params['msg']="updated/created record";
			
			while( $arRow=$objStatement->fetch(PDO::FETCH_ASSOC)){
				$params['id']=$arRow;			
			}
									
			return $params;		
			
		}
		catch(PDOException $e){
			die('{success:false, msg:"'.$e->getMessage().'"}');
		}			
	}	
	
	/**
    * @remotable
    */
	public function destroyRecordLevel2(stdClass $params)
	{
	global $objPDO;		 	  
	  $sql ='DELETE FROM "public"."ARTICLE_LEVEL2" 
		WHERE "AL2_ID"=:ID';
 	  
	  try{			
			$objStatement=$objPDO->prepare($sql);

			$objStatement->bindParam(':ID', $params->id, PDO::PARAM_INT);
		
			$objStatement->execute();
						
			$params->success=true; 
			$params->msg="deleted record";
						
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
				from "ABSTRACT" as "ab"
				inner join "ARTICLE" as "ar" on "ar"."ART_ID"="ab"."ART_ID"
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
	  
	 	  
	  $sql ='INSERT INTO "public"."ABSTRACT" ("TEXT","ART_ID")
		VALUES (:TEXT, :ID) RETURNING "ABSTR_ID"';
		}
		else{  
		$sql ='UPDATE "public"."ABSTRACT" 
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
		$sql = 'Select trim(leading from(to_char(ST_XMin("GEOM"),\'9990D999999\'))) as "TLX" ,trim(leading from(to_char(ST_XMax("GEOM"),\'9990D999999\'))) as "BRX",trim(leading from(to_char(ST_YMin("GEOM"),\'9990D999999\'))) as "BRY",trim(leading from(to_char(ST_YMax("GEOM"),\'9990D999999\'))) as "TLY" from  "LOCATION" 
					where "ART_ID"='.$params;
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
	public function updateFormLocation($params)
	{
	  global $objPDO;	
	  //to do do do update or new depending on the input (che id value???)	  
	  if($params['kind']=="create"){
	   ///this is a new record
	  ///return "new";
	  	 	  
	  $sql ='INSERT INTO "public"."LOCATION" ("GEOM","ART_ID")
		VALUES (ST_GeomFromText(\'POLYGON(('.$params['TLX'].' '.$params['BRY'].','.$params['TLX'].' '.$params['TLY'].','.$params['BRX'].' '.$params['TLY'].','.$params['BRX'].' '.$params['BRY'].','.$params['TLX'].' '.$params['BRY'].'))\',4326), :ID) RETURNING "LOC_ID"';
		}
		else{  
		$sql ='UPDATE "public"."LOCATION" 
		SET "GEOM"=ST_GeomFromText(\'POLYGON(('.$params['TLX'].' '.$params['BRY'].','.$params['TLX'].' '.$params['TLY'].','.$params['BRX'].' '.$params['TLY'].','.$params['BRX'].' '.$params['BRY'].','.$params['TLX'].' '.$params['BRY'].'))\',4326)  WHERE "ART_ID"=:ID RETURNING "LOC_ID"';
	  }
	  	  
	  try{
			
			$objStatement=$objPDO->prepare($sql);

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
}
?>