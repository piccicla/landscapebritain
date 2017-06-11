<?php

class QueryDatabase
{
	//protected $strDNS="pgsql:dbname=db_piccicla;host=postgres.int.devisland.net;user=piccicla;password=fidelin1";
	//protected $strDNS="pgsql:dbname=landscape;host=localhost;port=5432;user=postgres;password=fidelin1";
	protected $objPDO;
	protected $_result;
	public $results;

	public function __construct()
	{
		try{
				$strDNS="pgsql:dbname=db_piccicla;host=postgres.int.devisland.net;user=piccicla;password=fidelin1";
				$objPDO=new PDO($strDNS);			
				print "successfully connected.....\n";
				return $objPDO;
			}
		catch(PDOException $e){
				echo " an error occurred ".$e->getMessage();
			}		
	}


	public function __destruct()
	{
		if($objPDO){
			$objPDO=null;
			print "disconnected\n";
			return $this;
		}
	}		
}

$mono = new QueryDatabase();


php?>