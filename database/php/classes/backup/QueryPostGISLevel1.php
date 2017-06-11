<?php
class QueryPostGISLevel1
{	
	/**
    * @remotable
    */
	public function getResults(stdClass $params)
	{
		
		// Open the database connection
		if (!($db = pg_connect( 'host=postgres.int.devisland.net dbname=db_piccicla user=piccicla password=fidelin1'))) {
		// Handle errors
		die('SQL ERROR: Connection failed: ' . pg_last_error($db));
		}

		// Select data from the table:
		//$sql = 'select "NAME" from "LEVEL1"';
			
		$sql = 'select "l"."L1_ID" as "id","l"."NAME","t"."NAME" as "TYPE", "t"."T1_ID" as "IDT1"
				from "LEVEL1" as "l" 
				inner join "TYPE1" "t" on "l"."T1_ID"="t"."T1_ID"';

		$results = array();

		/*if (!($result = pg_query($db, $sql))) {
		// Give an error statement:
		die('SQL SELECT ERROR: ' . pg_last_error($db). " - Query was: {$sql}");
		Echo "{success:false}";
		}
		*/
		// Read all the data back in as associative arrays
		If (!$rs = pg_query($db, $sql) ){
				Echo "{success:false}";
				}else{
			while($obj = pg_fetch_object($rs)){
				$results[] = $obj;
			}}
		
		//close the connection
		pg_close($db);
		return $results;		
	}
	
	
	/**
    * @remotable
    */
	public function createRecord(stdClass $params)
	{
	$params->id=99999;
	return $params;}
	/**
    * @remotable
    */
	public function updateRecord(stdClass $params)
	{
	///you need to check that fields are correct, if TYPE is correct(query and see if it exist, if not
	///return error)
	return $params;}
	/**
    * @remotable
    */
	public function destroyRecord(stdClass $params)
	{
	return $this;}			
	
	
	
	/**
    * @remotable
    */
	public function getType1(stdClass $params)
	{
		
		// Open the database connection
		if (!($db = pg_connect( 'host=postgres.int.devisland.net dbname=db_piccicla user=piccicla password=fidelin1'))) {
		// Handle errors
		die('SQL ERROR: Connection failed: ' . pg_last_error($db));
		}

		// Select data from the table:
		//$sql = 'select "NAME" from "LEVEL1"';
	
		//check for the query param, if not get all the value, if yes filter the result
		if(!isset($params->query)) {		
			
			$sql = 'select "NAME", "T1_ID" as "IDT1"
					from "public"."TYPE1" ';
		
		}else{
		
			$query=$params->query;
			$sql = 'select "NAME", "T1_ID" as "id"
					from "public"."TYPE1"
					where "NAME" ~* \'^'.$query.'\'';
		}
		
		$results = array();

		/*if (!($result = pg_query($db, $sql))) {
		// Give an error statement:
		die('SQL SELECT ERROR: ' . pg_last_error($db). " - Query was: {$sql}");
		Echo "{success:false}";
		}
		*/
		// Read all the data back in as associative arrays
		If (!$rs = pg_query($db, $sql) ){
				Echo "{success:false}";
				}else{
			while($obj = pg_fetch_object($rs)){
				$results[] = $obj;
			}}
		
		//close the connection
		pg_close($db);
		return $results;		
	}
	
	
	/**
    * @remotable
    */
	public function getType1Init(stdClass $params)
	{
		
		// Open the database connection
		if (!($db = pg_connect( 'host=postgres.int.devisland.net dbname=db_piccicla user=piccicla password=fidelin1'))) {
		// Handle errors
		die('SQL ERROR: Connection failed: ' . pg_last_error($db));
		}
		
			
		$sql = 'select "NAME", "T1_ID" as "IDT1"
					from "public"."TYPE1" LIMIT 1 ';
		

		
		$results = array();

		/*if (!($result = pg_query($db, $sql))) {
		// Give an error statement:
		die('SQL SELECT ERROR: ' . pg_last_error($db). " - Query was: {$sql}");
		Echo "{success:false}";
		}
		*/
		// Read all the data back in as associative arrays
		If (!$rs = pg_query($db, $sql) ){
				Echo "{success:false}";
				}else{
			while($obj = pg_fetch_object($rs)){
				$results[] = $obj;
			}}
		
		//close the connection
		pg_close($db);
		return $results;		
	}
}
?>