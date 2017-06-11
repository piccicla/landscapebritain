<?php

//include the connection string
include_once("config.inc.php");

class QueryPostGISArticle2
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
	public function getResultsLevel(stdClass $params)
	{
		global $objPDO;
		$sql = 'select "al"."AL_ID" as id,"al"."L1_ID","al"."L2_ID","al"."L3_ID", "al"."ART_ID","l1"."NAME", "l2"."NAME","l3"."NAME" 
		from "ARTICLE_LEVEL" as "al"         						
			inner join "LEVEL1" "l1" on "al"."L1_ID"="l1"."L1_ID"
			inner join "LEVEL2" "l2" on "al"."L2_ID"="l2"."L2_ID"
			inner join "LEVEL3" "l3" on "al"."L3_ID"="l3"."L3_ID"
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
				from "public"."LEVEL1" as "l1"
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
				from "public"."LEVEL2" as "l2"
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
				from "public"."LEVEL3" as "l3"
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
	  $sql ='DELETE FROM "public"."ARTICLE_LEVEL" WHERE "AL_ID"=:ID';
 	  
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
	  $sql ='INSERT INTO "public"."ARTICLE_LEVEL" ("ART_ID","L1_ID","L2_ID","L3_ID")
		VALUES (:ART_ID,:L1_ID,:L2_ID,:L3_ID) RETURNING "AL_ID"';
 	  
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
}
?>