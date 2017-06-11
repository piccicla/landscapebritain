<?php

//include the connection string
include_once("config.inc.php");
class QueryDatabase
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
	public function queryByLevel(stdClass $params)
	{
	
		$params->success=true;
	
		return $params;	
	}
	
	/**
    * @remotable
    */
	public function queryByAttribute(stdClass $params)
	{
	
		$params->success=true;
	
		return $params;	
	}
	
	/**
    * @remotable
    */
	public function queryByAbstract(stdClass $params)
	{
	
		$params->success=true;
	
		return $params;	
	}
	
	/**
        * @remotable
        */
	public function queryByCombined (stdClass $params)
	{
	
		$params->success=true;
	
		return $params;	
	}
        
	/**
	* @remotable
	*/
	public function getGraph(stdClass $params){
		
			global $objPDO;		
			/*$sql = 'select l1."NAME", count(*) as "DATA1"
					from landscape."LEVEL1" as l1  left join landscape."ARTICLE_LEVEL" as al on al."L1_ID"=l1."L1_ID"
					where al."ART_ID"='.$params->id.'
					group by l1."NAME"';
			*/
			
			$sql = 'with selection("NAME") as(
					select l1."NAME", count(*) as data1
					from landscape."LEVEL1" as l1  left join landscape."ARTICLE_LEVEL" as al on al."L1_ID"=l1."L1_ID"
					where al."ART_ID"='.$params->id.' group by l1."NAME")
					select l1."NAME" as name,  COALESCE(s."data1",0) as "data1"
					from landscape."LEVEL1" as l1 left join selection as s on l1."NAME"=s."NAME"
					where l1."NAME"!=\'dummy\' order by "name"';
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
	public function getTotalGraph(stdClass $params){		
			global $objPDO;				
			$sql = 'select count(distinct al."ART_ID") as count, l."NAME" as "name" from landscape."ARTICLE_LEVEL" as al
					inner join landscape."LEVEL1" as l on l."L1_ID"=al."L1_ID"
					group by l."NAME"
					order by l."NAME"';
			try{
				$objStatement=$objPDO->prepare($sql);
				$objStatement->execute();				
				$results = array();			
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
	public function queryBySpatial (stdClass $params)
	{		
		$params->success=true;
	
		return $params;	
	}
	
	/**
    * @remotable
    */
	public function getSource(stdClass $params)
	{
		global $objPDO;
		//check for the query param, if not get all the value, if yes filter the result
		if(!isset($params->query)) {		
			
			$sql = 'select "NAME", "SOURCE_ID" as "id"
					from "landscape"."SOURCE" where "NAME"!=\'DUMMY\'';
		
		}else{
		
			$query=$params->query;
			$sql = 'select "NAME", "SOURCE_ID" as "id"
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
    */
	public function getPublication (stdClass $params)
	{		
		global $objPDO;
		//check for the query param, if not get all the value, if yes filter the result
		if(!isset($params->query)) {		
			
			/*$sql = 'select distinct "NAME", "NCA_ID"
					from "landscape"."NCA"
                    where "NAME"!= \'DUMMY\' limit 6';
			*/		
										
			$sql = 'select distinct "PUB_NAME" as  "NAME" from "landscape"."ARTICLE" 
					where "PUB_NAME" != \'\' 
					order by "PUB_NAME" limit 15';
		
		}else{
		
			$query=$params->query;
			/*$sql = 'select distinct "NAME", "NCA_ID"
					from "landscape"."NCA"
					where "NAME" ~* \'^'.$query.'\' AND "NAME"!= \'DUMMY\' limit 6';*/
					
			$sql = 'select distinct "PUB_NAME" as  "NAME" from "landscape"."ARTICLE" 
					where "PUB_NAME" ~* \'^'.$query.'\' AND  "PUB_NAME" != \'\'
					order by "PUB_NAME" limit 15';		
			
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
	public function getPublisher (stdClass $params)
	{		
		global $objPDO;
		//check for the query param, if not get all the value, if yes filter the result
		if(!isset($params->query)) {		
			
			/*$sql = 'select distinct "NAME", "NCA_ID"
					from "landscape"."NCA"
                    where "NAME"!= \'DUMMY\' limit 6';
			*/		
										
			$sql = 'select distinct "PUBLISHER" as  "NAME" from "landscape"."ARTICLE" 
					where "PUBLISHER" != \'\' 
					order by "PUBLISHER" limit 15';
		
		}else{
		
			$query=$params->query;
			/*$sql = 'select distinct "NAME", "NCA_ID"
					from "landscape"."NCA"
					where "NAME" ~* \'^'.$query.'\' AND "NAME"!= \'DUMMY\' limit 6';*/
					
			$sql = 'select distinct "PUBLISHER" as  "NAME" from "landscape"."ARTICLE" 
					where "PUBLISHER" ~* \'^'.$query.'\' AND  "PUBLISHER" != \'\'
					order by "PUBLISHER" limit 15';					
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
	public function getLayer(stdClass $params)
	{
		global $objPDO;		
		$sql = 'select "f_table_name" as "NAME" from "public"."geometry_columns"
				where "f_table_name" != \'LOCATION\' AND "f_table_name" != \'CLUSTER\' AND "f_table_name" != \'PLACE\' AND "f_table_name" != \'NCA\'';
		try{
			$objStatement=$objPDO->prepare($sql);
			$objStatement->execute();
			
			$results = array();
						
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
	public function getLayerName(stdClass $params)
	{
		global $objPDO;
		//check for the query param, if not get all the value, if yes filter the result
		$layerName=$params->LAYERNAME;
		if(!isset($params->query)) {							
			//this is possible only if the pk name is layerName_ID							
			$sql = 'select "NAME", "'.$layerName.'_ID" as "id" from "landscape"."'.$layerName.'" 
					where "NAME" !=\'DUMMY\' and "NAME" !=\'multiple\'
					order by "NAME" limit 15';		
		}else{		
			$query=$params->query;						
			//this is possible only if the pk name is layerName_ID
			$sql = 'select "NAME","'.$layerName.'_ID" as "id"  from "landscape"."'.$layerName.'" 
					where "NAME" ~* \'^'.$query.'\' and "NAME" !=\'DUMMY\' and "NAME" !=\'multiple\'
					order by "NAME" limit 15';
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
	public function getAbstract(stdClass $params)
	{	
		global $objPDO;	
		$sql = 'select "ab"."ABSTR_ID" as id,  "ab"."TEXT", "ab"."ART_ID"
				from landscape."ABSTRACT" as "ab"
				inner join landscape."ARTICLE" as "ar" on "ar"."ART_ID"="ab"."ART_ID"
				where "ar"."ART_ID"='.$params->id;
		try{
				$objStatement=$objPDO->prepare($sql);
				$objStatement->execute();
				
				$results = array();
				
				//$results=$objStatement->fetchAll();
				
				while( $arRow=$objStatement->fetch(PDO::FETCH_ASSOC)){
					$results[]=$arRow;			
				}
				//$params->success=true;
				//$results['success']=true;
				return $results;		
			}
			catch(PDOException $e){
				die('{success:false, msg:"'.$e->getMessage().'"}');
			}

	}
	
}

?>