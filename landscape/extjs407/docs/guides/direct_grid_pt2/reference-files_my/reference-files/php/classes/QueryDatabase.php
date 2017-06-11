<?php

class QueryDatabase
{
	private $_db;
	protected $_result;
	public $results;
	
	public function __construct()
	{
		$_db = new mysqli('213.171.219.90', 'landscapeadmin' ,'horton', 'dblandscapebritain');
		
		if ($_db->connect_error) {
			die('Connection Error (' . $_db->connect_errno . ') ' . $_db->connect_error);
		}
		
		return $_db;
	}
	
	public function getResults(stdClass $params)
	{
		
		$_db = $this->__construct();

		$_result = $_db->query("SELECT  ID,author,year,title FROM tblArticle") or die('Connect Error (' . $_db->connect_errno . ') ' . $_db->connect_error);
		
		$results = array();
		
		while ($row = $_result->fetch_assoc()) {
			array_push($results, $row);
		}
		
		return $results;
	}
	
	public function createRecord(stdClass $params)
	{

		$_db = $this->__construct();
		if($stmt = $_db->prepare("INSERT INTO tblArticle (author,year,title) VALUES (?, ?, ?)")) {
			
			$stmt->bind_param('sss', $author, $year, $title);
			
			$author = $_db->real_escape_string($params->author);
			$year = $_db->real_escape_string($params->year);
			$title = $_db->real_escape_string($params->title);
			
			$stmt->execute();
			
			$params->ID = $_db->insert_id;
			
			$stmt->close();
		}
		
		
		return $params;
		
	}
	
	public function updateRecords(stdClass $params)
	{
		$_db = $this->__construct();
		
		if ($stmt = $_db->prepare("UPDATE tblArticle SET author=?, year=?, title=? WHERE ID=?")) {
			$stmt->bind_param('sssi', $author, $year, $title, $ID);

			$author = $_db->real_escape_string($params->author);
			$year = $_db->real_escape_string($params->year);
			$title = $_db->real_escape_string($params->title);
			//cast id to int
			$ID = (int) $params->ID;
						
			$stmt->execute();
									
			$stmt->close();
		}

		return $params;
	}
	
	public function destroyRecord(stdClass $params)
	{
		$_db = $this->__construct();
		
		$id = $params->id;
		
		if(is_numeric($id)) {
			if($stmt = $_db->prepare("DELETE FROM tblArticle WHERE ID = ? LIMIT 1")) {
				$stmt->bind_param('i', $ID);
				$stmt->execute();
				$stmt->close();
			}
		}
				
		return $this;
	}
	
	public function __destruct()
	{
		$_db = $this->__construct();
		$_db->close();
		
		return $this;
	}
}