<?php

error_reporting(E_ALL|E_STRICT);
set_error_handler('handleErrors');
function handleErrors($error,$errorString,$filename,$line,$simbols){     
		$o['success']=false;
		$o['msg']=str_replace("\"","'",$errorString);
		$o['line']=str_replace("\"","'",$line);
		$o['simbols']=str_replace("\"","'",$simbols);
		$o['type']="raise error";
		echo json_encode($o);
		die();
}

set_exception_handler('handleMissedExceptions');
function handleMissedExceptions($error){     
		$o['success']=false;
		$o['msg']=str_replace("\"","'",$error->getMessage());
		$o['line']=str_replace("\"","'",$error->getLine());
		$o['type']="exception error";
		echo json_encode($o);
		die();
}

register_shutdown_function('handleShutdown');
function handleShutdown() {     
		
		$error = error_get_last();
        if($error !== NULL){
			 
			$o['success']=false;
			$o['msg']="shutdown: ".str_replace("\"","'",$error['message']);
			$o['line']=str_replace("\"","'",$error['line']);
			$o['type']=$error['type'];
			echo json_encode($o);			
        }
        else{
		//the file shutdown without errors so i tell nothing
		}
}

function getImages($id,$table){		
		//get the ART_ID and the table name from the request
		$db;				
		// Open the database connection
		//if (!($db = pg_connect( 'host=postgres.int.devisland.net dbname=db_piccicla user=piccicla password=fidelin1'))) {
		if (!($db = pg_connect( 'host=localhost dbname=landscape user=postgres password=fidelin1'))){
		// Handle errors
		   // i used die because with echo the script continued
		  //Echo "{success:false, msg:'SQL ERROR: Connection failed'}";			  
		  die();			
		}
			
		$sql = 'select "LINK" from "landscape"."'.$table.'" where "ART_ID"='.$id;
		
		$results = array();

		// Read all the data back in as associative arrays
		If (!$rs = pg_query($db, $sql) ){
				if ($db){
					pg_close($db);
				}
				trigger_error('problems reading the database');
				die();
		}else{		
		while($obj = pg_fetch_object($rs)){
			$results[] = $obj;
		}}
		//close the connection
		pg_close($db);
		//print_r($results);
		//trigger_error('problems reading the database');
                //die();
		return $results;		
}

$results=getImages($_GET['id'],$_GET['table']);
$dir = "img/".$_GET['table']."/ori/".$_GET['id']."/";
$dir_thumbs = "img/".$_GET['table']."/thumbs/".$_GET['id']."/";
$dir_vis = "img/".$_GET['table']."/visual/".$_GET['id']."/";

$images = array();

$message="";

foreach ($results as $value) {
	//echo $value->LINK;
	$name=$value->LINK;
	//check if the file exist
	if (file_exists($dir.$name)){
	//echo $dir.$name;
	//exist then add to the output array
	if(!preg_match('/\.(jpg|gif|png|JPG|GIF|PNG)$/', $name)) continue;
	$size = filesize($dir.$name);
	//$lastmod = filemtime($dir.$name)*1000;	
	$lastmod=date("F d Y H:i:s.", filemtime($dir.$name));
	$thumb = "thumb_".$name;
	$vis= "vis_".$name;
	$images[] = array('name' => $name, 'size' => $size,
			'lastmod' => $lastmod, 'url' => $dir.$name,
			'thumb_url' => $dir_thumbs.$thumb,
			'vis_url' => $dir_vis.$vis);			
	}
    else{
	  $message .= " ".$name."<br/>";
	}	
}
$o = array('images'=>$images);

if (count($images)>0){
	$o['new']=false;
	$o['success']=true;
	$o['warning']=$message;
	echo json_encode($o);
}
else{
	$o['new']=true;
	$o['success']=false;
	if ($message!=""){
	   $o['msg']="all the records are not available as images:<br/>".$message;
	}else{
	$o['msg']="this directory does not still exist, please upload some images";
	}
	echo json_encode($o);
}

?>