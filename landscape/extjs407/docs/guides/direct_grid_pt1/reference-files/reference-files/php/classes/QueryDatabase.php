<?php
class QueryDatabase
{
	protected $_db;
	protected $_result;
	public $results;
	
	public function __construct()
	{
		$_db = new mysqli('host', 'username' ,'password', 'database');
		
		if ($_db->connect_error) {
			die('Connection Error (' . $_db->connect_errno . ') ' . $_db->connect_error);
		}
		
		return $_db;
	}
	
	public function getResults(stdClass $params)
	{
		
		$_db = $this->__construct();

		$_result = $_db->query("SELECT id, name, address, state FROM owners") or die('Connect Error (' . $_db->connect_errno . ') ' . $_db->connect_error);
		
		$results = array();
		
		while ($row = $_result->fetch_assoc()) {
			array_push($results, $row);
		}
		
		return $results;
	}
		
	public function __destruct()
	{
		$_db = $this->__construct();
		$_db->close();
		
		return $this;
	}
}