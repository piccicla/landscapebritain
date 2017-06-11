<?php
class QueryDatabase
{
	protected $_db;
	protected $_result;
	public $results;
	
	public function __construct()
	{
		/*$_db = new mysqli('213.171.219.90', 'landscapeadmin' ,'horton', 'dblandscapebritain');
		
		if ($_db->connect_error) {
			die('Connection Error (' . $_db->connect_errno . ') ' . $_db->connect_error);
		}*/
		
		//$db = mysql_connect('213.171.219.90', 'landscapeadmin', 'horton') or die ('Unable to connect. Check your connection parameters.');
		
		
		//return $_db;
	}
	
	/**
    * @remotable
    */
	public function getResults(stdClass $params)
	{
		
		//$_db = $this->__construct();

		/*$_result = $_db->query("SELECT ID, author, year, title FROM tblArticle") or die('Connect Error (' . $_db->connect_errno . ') ' . $_db->connect_error);
		
		$results = array();
		
		while ($row = $_result->fetch_assoc()) {
			array_push($results, $row);
		}
		
		return $results;
		*/
		$db = mysql_connect('213.171.219.90', 'landscapeadmin', 'horton') or die ('Unable to connect. Check your connection parameters.');
		mysql_select_db('dblandscapebritain', $db) or die(mysql_error($db));
		
		$query = 'SELECT  ID,author,year,title FROM tblArticle';
		
		$results = array();
		If (!$rs = mysql_query($query, $db) ){
		Echo "{success:false}";
		}else{
		while($obj = mysql_fetch_object($rs)){
		$results[] = $obj;
		}}
		
		//Echo "{success:true,rows:".json_encode($arr)."}";}
		return $results;
		
	}
		
	public function __destruct()
	{
		if($_db){
			$_db = $this->__construct();
			$_db->close();	
			return $this;
		}
	}
}


?>







